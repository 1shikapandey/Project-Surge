import { SupportedLanguage } from './i18n/translations';

const LANGUAGE_VOICE_MAP: Record<SupportedLanguage, string> = {
  en: 'en-IN',
  hi: 'hi-IN',
  mr: 'mr-IN',
  ta: 'ta-IN',
  te: 'te-IN'
};

export function isSpeechSynthesisSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

export function speakNavigationInstruction(
  text: string,
  lang: SupportedLanguage = 'en',
  onEnd?: () => void
): boolean {
  if (!isSpeechSynthesisSupported()) {
    return false;
  }

  try {
    const synth = window.speechSynthesis;
    
    // Cancel ongoing speech before playing new turn direction
    if (synth.speaking || synth.pending) {
      synth.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    const voiceLang = LANGUAGE_VOICE_MAP[lang] || 'en-IN';
    utterance.lang = voiceLang;
    utterance.rate = 0.95; // Slightly calmer speaking rate for clear navigation instructions
    utterance.pitch = 1.0;

    // Attempt to match best native voice if available
    const voices = synth.getVoices();
    const matchedVoice = voices.find(
      (v) => v.lang === voiceLang || v.lang.startsWith(voiceLang.split('-')[0])
    );
    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }

    if (onEnd) {
      utterance.onend = onEnd;
      utterance.onerror = onEnd;
    }

    synth.speak(utterance);
    return true;
  } catch (err) {
    console.warn('Speech synthesis error:', err);
    return false;
  }
}

export function stopNavigationSpeech(): void {
  if (isSpeechSynthesisSupported()) {
    try {
      window.speechSynthesis.cancel();
    } catch {}
  }
}
