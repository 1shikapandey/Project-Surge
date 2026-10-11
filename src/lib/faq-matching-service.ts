/**
 * ═══════════════════════════════════════════════════════════════════════════
 * AQUAALERT — FAQ MATCHING & SHORT-CIRCUIT SERVICE
 * ═══════════════════════════════════════════════════════════════════════════
 * Matches user inquiries against curated FAQ dataset (faq-data.json)
 * before calling external or local LLMs.
 *
 * High confidence match (score >= 0.75) skips LLM calls and bypasses rate limits.
 * ═══════════════════════════════════════════════════════════════════════════
 */

import faqData from './faq-data.json';

export interface FAQItem {
  id: string;
  question: string;
  keywords: string[];
  answer: string;
}

export interface FAQMatchResult {
  isMatch: boolean;
  score: number;
  faq?: FAQItem;
}

/**
 * Tokenizes text into normalized lowercase alphanumeric terms.
 */
function tokenize(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 2)
  );
}

/**
 * Calculates Jaccard similarity between two token sets.
 */
function jaccardSimilarity(setA: Set<string>, setB: Set<string>): number {
  if (setA.size === 0 || setB.size === 0) return 0;
  let intersection = 0;
  setA.forEach(token => {
    if (setB.has(token)) intersection++;
  });
  const union = new Set([...setA, ...setB]).size;
  return intersection / union;
}

/**
 * Calculates keyword hit ratio for FAQ item.
 */
function keywordHitRatio(queryTokens: Set<string>, keywords: string[]): number {
  if (keywords.length === 0) return 0;
  let hits = 0;
  for (const kw of keywords) {
    const kwTokens = tokenize(kw);
    let matchedAllKwTokens = true;
    kwTokens.forEach(t => {
      if (!queryTokens.has(t)) matchedAllKwTokens = false;
    });
    if (matchedAllKwTokens) hits++;
  }
  return hits / keywords.length;
}

/**
 * Main FAQ matcher entry point.
 * Threshold: score >= 0.75 for high-confidence short-circuit.
 */
export function matchFAQ(userQuery: string, threshold: number = 0.75): FAQMatchResult {
  const queryTokens = tokenize(userQuery);
  if (queryTokens.size === 0) {
    return { isMatch: false, score: 0 };
  }

  let bestMatch: FAQItem | undefined = undefined;
  let maxScore = 0;

  for (const item of faqData as FAQItem[]) {
    const questionTokens = tokenize(item.question);
    const jaccard = jaccardSimilarity(queryTokens, questionTokens);
    const kwRatio = keywordHitRatio(queryTokens, item.keywords);

    // Weighted composite score: 50% question structure + 50% key concept hit
    const compositeScore = 0.5 * jaccard + 0.5 * kwRatio;

    if (compositeScore > maxScore) {
      maxScore = compositeScore;
      bestMatch = item;
    }
  }

  if (bestMatch && maxScore >= threshold) {
    return {
      isMatch: true,
      score: maxScore,
      faq: bestMatch,
    };
  }

  return {
    isMatch: false,
    score: maxScore,
    faq: bestMatch,
  };
}
