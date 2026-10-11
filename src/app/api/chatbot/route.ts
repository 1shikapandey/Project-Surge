import { NextRequest, NextResponse } from 'next/server';
import { matchFAQ } from '@/lib/faq-matching-service';
import { checkRateLimit, consumeRateLimitQuota, inspectRateLimit } from '@/lib/chatbot-rate-limiter';
import { buildDecisionInputPayload } from '@/lib/flood-decision-service';
import { CityId } from '@/lib/mock-data';
import { generateChatbotResponse, ChatMessage } from '@/lib/chatbot-llm-service';

/**
 * Helper to derive session identifier from headers or body session key.
 */
function getSessionKey(req: NextRequest, bodySessionKey?: string): string {
  if (bodySessionKey && bodySessionKey.trim().length > 0) {
    return bodySessionKey.trim();
  }
  const forwardedFor = req.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  const realIp = req.headers.get('x-real-ip');
  if (realIp) {
    return realIp.trim();
  }
  return 'default-session-id';
}

/**
 * GET /api/chatbot — Returns current rate limit quota status for client session.
 */
export async function GET(req: NextRequest) {
  const sessionKey = getSessionKey(req);
  const status = inspectRateLimit(sessionKey);
  return NextResponse.json({
    remainingQuota: status.remaining,
    limit: status.limit,
    resetInSeconds: status.resetInSeconds,
  });
}

/**
 * POST /api/chatbot — Main Chatbot endpoint.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const messages: ChatMessage[] = Array.isArray(body.messages) ? body.messages : [];
    const cityId: CityId = body.cityId || 'mumbai';
    const timeOffsetMins: number = typeof body.timeOffsetMins === 'number' ? body.timeOffsetMins : 0;
    const sessionKey = getSessionKey(req, body.sessionKey);

    if (messages.length === 0) {
      return NextResponse.json({ error: 'No message provided' }, { status: 400 });
    }

    const latestUserMessage = [...messages].reverse().find(m => m.role === 'user')?.content || '';

    // ───────────────────────────────────────────────────────────────────────────
    // STEP 1: FAQ SHORT-CIRCUIT MATCHING (Bypasses LLM & Rate Limiter)
    // ───────────────────────────────────────────────────────────────────────────
    const faqResult = matchFAQ(latestUserMessage, 0.75);

    if (faqResult.isMatch && faqResult.faq) {
      console.log(`[Chatbot API] FAQ Short-Circuit MATCH (score ${faqResult.score.toFixed(2)}): '${faqResult.faq.question}' for query '${latestUserMessage}'`);
      
      const currentStatus = inspectRateLimit(sessionKey);

      return NextResponse.json({
        answer: faqResult.faq.answer,
        provider: 'faq',
        modelName: 'Curated FAQ Dataset',
        matchedQuestion: faqResult.faq.question,
        remainingQuota: currentStatus.remaining,
        resetInSeconds: 0,
        latencyMs: 5,
      });
    }

    // ───────────────────────────────────────────────────────────────────────────
    // STEP 2: SERVER-SIDE RATE LIMITING (5 requests / 2 minutes)
    // ───────────────────────────────────────────────────────────────────────────
    const rateStatus = checkRateLimit(sessionKey);

    if (!rateStatus.allowed) {
      console.warn(`[Chatbot API] Rate limit hit for session '${sessionKey}'. Blocked until reset in ${rateStatus.resetInSeconds}s.`);
      return NextResponse.json(
        {
          error: `You've reached the 5-question limit for the rolling 2-minute window. Try again in ${rateStatus.resetInSeconds} seconds.`,
          remainingQuota: 0,
          resetInSeconds: rateStatus.resetInSeconds,
        },
        { status: 429 }
      );
    }

    // Consume rate limit quota for non-FAQ request
    consumeRateLimitQuota(sessionKey);
    const updatedStatus = inspectRateLimit(sessionKey);

    // ───────────────────────────────────────────────────────────────────────────
    // STEP 3: CONSTRUCT INTERNAL SYSTEM DATA CONTEXT (Never Internet)
    // ───────────────────────────────────────────────────────────────────────────
    const systemPayload = await buildDecisionInputPayload(cityId, timeOffsetMins);

    // ───────────────────────────────────────────────────────────────────────────
    // STEP 4: DUAL-PROVIDER LLM CALL (NVIDIA NIM primary -> Ollama fallback)
    // ───────────────────────────────────────────────────────────────────────────
    const llmResponse = await generateChatbotResponse(messages, systemPayload);

    console.log(`[Chatbot API] Completed turn via ${llmResponse.provider.toUpperCase()} (${llmResponse.modelName}) in ${llmResponse.latencyMs}ms. Remaining quota: ${updatedStatus.remaining}/5.`);

    return NextResponse.json({
      answer: llmResponse.answer,
      provider: llmResponse.provider,
      modelName: llmResponse.modelName,
      remainingQuota: updatedStatus.remaining,
      resetInSeconds: 0,
      latencyMs: llmResponse.latencyMs,
    });

  } catch (err: any) {
    console.error('[Chatbot API] Unhandled server error:', err);
    return NextResponse.json(
      { error: err.message || 'Internal server error processing chatbot request.' },
      { status: 500 }
    );
  }
}
