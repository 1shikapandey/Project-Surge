'use client';

import React, { useState, useCallback } from 'react';
import { Brain, RefreshCw, AlertTriangle, CheckCircle2, ShieldAlert, Zap, Wind, CloudRain, Activity } from 'lucide-react';
import { CityId } from '@/lib/mock-data';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface NowcastPrediction {
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  headline: string;
  outlook: {
    now: string;
    plus30min: string;
    plus60min: string;
    plus90min: string;
  };
  keyRisks: string[];
  recommendation: string;
  confidence: number;
  reasoning?: string;
}

interface NowcastPredictionCardProps {
  cityId: CityId;
  timeOffsetMins: number;
}

const RISK_CONFIG = {
  LOW: {
    color: 'text-green-700 dark:text-green-400',
    bg: 'bg-green-50 dark:bg-green-900/20',
    border: 'border-green-200 dark:border-green-800',
    badge: 'bg-green-600',
    icon: CheckCircle2,
  },
  MEDIUM: {
    color: 'text-orange-700 dark:text-orange-400',
    bg: 'bg-orange-50 dark:bg-orange-900/20',
    border: 'border-orange-200 dark:border-orange-800',
    badge: 'bg-orange-500',
    icon: AlertTriangle,
  },
  HIGH: {
    color: 'text-orange-800 dark:text-orange-300',
    bg: 'bg-orange-100 dark:bg-orange-900/30',
    border: 'border-orange-300 dark:border-orange-700',
    badge: 'bg-orange-600',
    icon: ShieldAlert,
  },
  CRITICAL: {
    color: 'text-red-800 dark:text-red-300',
    bg: 'bg-red-50 dark:bg-red-900/20',
    border: 'border-red-300 dark:border-red-700',
    badge: 'bg-red-600',
    icon: Zap,
  },
} as const;

export const NowcastPredictionCard: React.FC<NowcastPredictionCardProps> = ({
  cityId,
  timeOffsetMins,
}) => {
  const { t } = useLanguage();
  const [prediction, setPrediction] = useState<NowcastPrediction | null>(null);
  const [sensorPayload, setSensorPayload] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [provider, setProvider] = useState<string | null>(null);
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const [ollamaOnline, setOllamaOnline] = useState<boolean | null>(null);

  const runPrediction = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/nowcast-predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ city: cityId, timeOffset: timeOffsetMins }),
      });

      const data = await res.json();
      setPrediction(data.prediction || null);
      setSensorPayload(data.sensorPayload || null);
      setProvider(data.provider || null);
      setLatencyMs(data.latencyMs || null);
      setOllamaOnline(data.provider === 'ollama');

      if (!data.prediction) {
        setError(data.error || 'Model returned no prediction.');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Request failed');
    } finally {
      setLoading(false);
    }
  }, [cityId, timeOffsetMins]);

  const risk = prediction?.riskLevel ?? 'LOW';
  const config = RISK_CONFIG[risk] || RISK_CONFIG.LOW;
  const RiskIcon = config.icon;

  return (
    <div className="w-full bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-md overflow-hidden flex flex-col shrink-0">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800 shrink-0">
        <div className="flex items-center space-x-2">
          <Brain className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h2 className="text-sm font-bold text-gray-800 dark:text-gray-100 tracking-tight">
            {t.nowcast.title}
          </h2>
          {provider && (
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold text-white ${
              ollamaOnline ? 'bg-green-600' : 'bg-gray-500'
            }`}>
              {ollamaOnline ? t.nowcast.deepseekBadge : t.nowcast.fallbackBadge}
            </span>
          )}
        </div>
        <button
          onClick={runPrediction}
          disabled={loading}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl btn-glass-primary disabled:opacity-60 text-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>{loading ? t.nowcast.predicting : prediction ? t.nowcast.refreshBtn : t.nowcast.runPredictionBtn}</span>
        </button>
      </div>

      {/* Card Content Body with Internal Scroll Area */}
      <div className="overflow-y-auto custom-scrollbar max-h-[550px] flex-1">
        {/* Empty state */}
        {!prediction && !loading && !error && (
          <div className="p-6 text-center text-gray-400 dark:text-gray-500 text-xs space-y-2">
            <Brain className="w-8 h-8 mx-auto opacity-30" />
            <p>{t.nowcast.emptyStatePrompt}</p>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="p-6 text-center space-y-3">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">
              {t.nowcast.reasoningSensorData}
            </p>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="mx-4 my-3 p-3 rounded-xl bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 text-xs text-orange-800 dark:text-orange-300">
            <span className="font-bold">Notice:</span> {error}
          </div>
        )}

        {/* Prediction Result */}
        {prediction && !loading && (
          <div className="p-4 space-y-3">
            {/* Risk Badge + Headline */}
            <div className={`flex items-start gap-3 p-3 rounded-xl border ${config.bg} ${config.border}`}>
              <div className={`p-1.5 rounded-lg ${config.badge} shrink-0`}>
                <RiskIcon className="w-4 h-4 text-white" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-xs font-black uppercase tracking-widest ${config.color}`}>
                    {prediction.riskLevel} {t.nowcast.riskSuffix}
                  </span>
                  <span className="text-[10px] text-gray-500 dark:text-gray-400 font-mono">
                    {prediction.confidence}% {t.nowcast.confidenceSuffix}
                  </span>
                  {latencyMs && (
                    <span className="text-[10px] text-gray-400 dark:text-gray-500 font-mono">
                      {latencyMs}ms
                    </span>
                  )}
                </div>
                <p className={`text-xs font-semibold mt-0.5 ${config.color}`}>
                  {prediction.headline}
                </p>
              </div>
            </div>

            {/* Outlook Timeline */}
            {prediction.outlook && (
              <div className="space-y-1.5">
                <h3 className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t.nowcast.outlookHeading}
                </h3>
                {[
                  { label: t.nowcast.nowLabel, key: 'now', color: 'bg-blue-600' },
                  { label: '+30 min', key: 'plus30min', color: 'bg-orange-500' },
                  { label: '+60 min', key: 'plus60min', color: 'bg-orange-400' },
                  { label: '+90 min', key: 'plus90min', color: 'bg-gray-400' },
                ].map(({ label, key, color }) => (
                  <div key={key} className="flex items-start gap-2 text-xs">
                    <span className={`mt-0.5 shrink-0 w-2 h-2 rounded-full ${color}`} />
                    <span className="font-bold text-gray-600 dark:text-gray-300 w-14 shrink-0">{label}</span>
                    <span className="text-gray-700 dark:text-gray-300 leading-snug">
                      {prediction.outlook[key as keyof typeof prediction.outlook] || '—'}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Key Risks */}
            {prediction.keyRisks?.length > 0 && (
              <div className="space-y-1">
                <h3 className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t.nowcast.keyRisksHeading}
                </h3>
                {prediction.keyRisks.map((risk, i) => (
                  <div key={i} className="flex items-start gap-1.5 text-xs text-gray-700 dark:text-gray-300">
                    <AlertTriangle className="w-3 h-3 text-orange-500 mt-0.5 shrink-0" />
                    <span>{risk}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Recommendation */}
            {prediction.recommendation && (
              <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                <p className="text-xs font-semibold text-blue-800 dark:text-blue-300">
                  {t.nowcast.recommendationHeading}: {prediction.recommendation}
                </p>
              </div>
            )}

            {/* Reasoning */}
            {prediction.reasoning && (
              <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/30 border border-gray-200 dark:border-gray-800">
                <h3 className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                  {t.nowcast.aiReasoningHeading}
                </h3>
                <p className="text-xs text-gray-700 dark:text-gray-300 italic">
                  {prediction.reasoning}
                </p>
              </div>
            )}

            {/* Sensor inputs summary */}
            {sensorPayload && (
              <div className="border-t border-gray-100 dark:border-gray-800 pt-2">
                <h3 className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1.5">
                  {t.nowcast.sensorInputsHeading}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 text-[10px]">
                  <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                    <CloudRain className="w-3 h-3 text-blue-500 shrink-0" />
                    <span className="font-mono font-bold">{String(sensorPayload.rainfallNow ?? 0)} mm/h</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                    <Wind className="w-3 h-3 text-blue-400 shrink-0" />
                    <span className="font-mono font-bold">{String(sensorPayload.windSpeedKmh ?? 0)} km/h {String(sensorPayload.windDirectionCardinal ?? '')}</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                    <Activity className="w-3 h-3 text-orange-500 shrink-0" />
                    <span className="font-mono font-bold">{String(sensorPayload.radarConfidence ?? 0)}% radar</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

