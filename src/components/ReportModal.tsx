'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  X,
  Camera,
  AlertTriangle,
  CheckCircle2,
  User,
  Smartphone,
  ShieldCheck,
  RotateCcw,
  KeyRound,
  Check
} from 'lucide-react';
import { CitizenReport, CityId } from '@/lib/mock-data';
import { useLanguage } from '@/context/LanguageContext';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCityId: CityId;
  onAddReport: (report: CitizenReport) => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  selectedCityId,
  onAddReport
}) => {
  const { t } = useLanguage();
  const [reporterName, setReporterName] = useState('');
  const [reporterMobile, setReporterMobile] = useState('');
  const [locationName, setLocationName] = useState('Central Junction');
  const [waterDepthCm, setWaterDepthCm] = useState(25);
  const [userNote, setUserNote] = useState('');
  const [reportPhoto, setReportPhoto] = useState<string | null>(null);

  // Live Camera Access
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // Validation & OTP Modal
  const [formError, setFormError] = useState<string | null>(null);
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [otpInput, setOtpInput] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('4892');
  const [otpError, setOtpError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  // Stop camera helper
  const stopCamera = useCallback(() => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      stopCamera();
    }
  }, [isOpen, stopCamera]);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  if (!isOpen) return null;

  const startCamera = async () => {
    setCameraError(null);
    setFormError(null);
    try {
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } }
        });
      } catch (err) {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
      }
      mediaStreamRef.current = stream;
      setIsCameraActive(true);

      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(e => console.warn('Video play error:', e));
        }
      }, 100);
    } catch (err) {
      console.error('Camera access error:', err);
      setCameraError('Camera access denied or device camera unavailable.');
      setIsCameraActive(false);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current || document.createElement('canvas');
    const width = video.videoWidth || 640;
    const height = video.videoHeight || 480;

    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, width, height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      setReportPhoto(dataUrl);
      stopCamera();
    }
  };

  const handleInitiateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!reporterName.trim()) {
      setFormError('Please enter your full name.');
      return;
    }
    if (!reporterMobile.trim() || !/^[0-9]{10}$/.test(reporterMobile.trim())) {
      setFormError('Please enter a valid 10-digit mobile number.');
      return;
    }
    if (!locationName.trim()) {
      setFormError('Please specify ground location.');
      return;
    }
    if (!reportPhoto) {
      setFormError('Live site camera snapshot is required. Please click camera to take photo.');
      return;
    }

    const code = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedOtp(code);
    setOtpInput(code);
    setOtpError(null);
    setIsOtpModalOpen(true);
  };

  const handleVerifyOtpAndSubmit = () => {
    if (otpInput.trim() !== generatedOtp) {
      setOtpError('Invalid OTP code. Please enter the 4-digit code shown.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const newReport: CitizenReport = {
        id: `rep-${Date.now()}`,
        cityId: selectedCityId,
        timestamp: 'Just now',
        lat: 19.0180 + (Math.random() - 0.5) * 0.01,
        lng: 72.8450 + (Math.random() - 0.5) * 0.01,
        locationName,
        waterDepthCm,
        userNote: userNote || 'Water depth observed',
        verified: true,
        upvotes: 1,
        photoUrl: reportPhoto || undefined,
        reporterName: reporterName.trim(),
        reporterMobile: reporterMobile.trim()
      };

      onAddReport(newReport);
      setIsSubmitting(false);
      setIsOtpModalOpen(false);
      setSubmittedSuccess(true);

      setTimeout(() => {
        setSubmittedSuccess(false);
        onClose();
      }, 1500);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-4 sm:p-5 space-y-4 text-slate-900 dark:text-white max-h-[90vh] overflow-y-auto custom-scrollbar my-auto">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <div className="flex items-center space-x-2 text-sky-600 dark:text-sky-400">
            <Camera className="w-5 h-5 text-sky-500" />
            <h3 className="font-extrabold text-slate-900 dark:text-white text-sm">
              {t.reportModal.title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submittedSuccess ? (
          <div className="py-8 text-center space-y-3">
            <CheckCircle2 className="w-14 h-14 text-emerald-500 mx-auto animate-bounce" />
            <div>
              <p className="font-extrabold text-slate-900 dark:text-white text-base">{t.reportModal.successToast}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Ground report verified & synced across all emergency map instances.</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleInitiateSubmit} className="space-y-3.5 text-xs">
            
            {formError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-700 dark:text-red-300 flex items-center space-x-2 font-bold text-xs">
                <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {/* Reporter Contact Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
              <div>
                <label className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-bold mb-1">
                  <User className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={reporterName}
                  onChange={(e) => setReporterName(e.target.value)}
                  placeholder="e.g. Apurv Sharma"
                  className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-bold mb-1">
                  <Smartphone className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                  Mobile Number *
                </label>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  value={reporterMobile}
                  onChange={(e) => setReporterMobile(e.target.value.replace(/\D/g, ''))}
                  placeholder="e.g. 9876543210"
                  className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>

            {/* Live Camera Capture Block */}
            <div className="space-y-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-1.5 text-slate-800 dark:text-slate-200 font-extrabold">
                  <Camera className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                  Live Photo (Camera Access Only) *
                </label>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                  No File Upload
                </span>
              </div>

              <canvas ref={canvasRef} className="hidden" />

              {isCameraActive && (
                <div className="space-y-2">
                  <div className="relative overflow-hidden rounded-xl border-2 border-sky-500 bg-black aspect-video flex items-center justify-center shadow-lg">
                    <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                    <div className="absolute top-2 left-2 bg-red-600/90 text-white font-mono font-bold text-[10px] px-2 py-0.5 rounded-md flex items-center gap-1.5 animate-pulse">
                      <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                      LIVE CAMERA STREAM
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={capturePhoto}
                      className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-2 active:scale-95"
                    >
                      <Camera className="w-4 h-4" />
                      Capture Snapshot
                    </button>
                    <button
                      type="button"
                      onClick={stopCamera}
                      className="py-2 px-3 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {!isCameraActive && reportPhoto && (
                <div className="space-y-2">
                  <div className="relative overflow-hidden rounded-xl border-2 border-emerald-500 shadow-md">
                    <img src={reportPhoto} alt="Captured water sump" className="w-full max-h-48 object-cover rounded-lg" />
                    <div className="absolute top-2 left-2 bg-emerald-600 text-white font-bold text-[10px] px-2 py-0.5 rounded-md flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      LIVE PHOTO CAPTURED
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setReportPhoto(null);
                      startCamera();
                    }}
                    className="w-full py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-2 transition-all"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                    Retake Live Photo
                  </button>
                </div>
              )}

              {!isCameraActive && !reportPhoto && (
                <div className="space-y-1.5">
                  <button
                    type="button"
                    onClick={startCamera}
                    className="w-full py-3.5 rounded-xl bg-sky-50 dark:bg-sky-500/10 hover:bg-sky-100 dark:hover:bg-sky-500/20 border-2 border-dashed border-sky-400 dark:border-sky-500/40 text-sky-700 dark:text-sky-300 font-extrabold text-xs flex flex-col items-center justify-center space-y-1 transition-all"
                  >
                    <Camera className="w-5 h-5 text-sky-600 dark:text-sky-400" />
                    <span>Click Here to Capture Live Photo via Camera</span>
                  </button>
                  {cameraError && (
                    <p className="text-[11px] font-bold text-red-600 dark:text-red-400 text-center">
                      {cameraError}
                    </p>
                  )}
                </div>
              )}
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">{t.reportModal.locationLabel}:</label>
              <input
                type="text"
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                required
                className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-slate-700 dark:text-slate-300 font-bold">{t.reportModal.depthLabel}:</label>
                <span className="font-mono font-black text-sky-600 dark:text-sky-300 text-sm bg-sky-100 dark:bg-sky-500/10 px-2 py-0.5 rounded-lg border border-sky-300 dark:border-sky-500/30">{waterDepthCm} cm</span>
              </div>
              <input
                type="range"
                min={5}
                max={120}
                step={5}
                value={waterDepthCm}
                onChange={(e) => setWaterDepthCm(parseInt(e.target.value, 10))}
                className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg cursor-pointer accent-sky-500"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">{t.reportModal.obsLabel}:</label>
              <textarea
                value={userNote}
                onChange={(e) => setUserNote(e.target.value)}
                placeholder={t.reportModal.obsPlaceholder}
                rows={2}
                className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-500 hover:to-sky-500 text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center space-x-2 active:scale-95"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Verify Mobile & Submit Ground Report</span>
            </button>
          </form>
        )}
      </div>

      {/* OTP Modal */}
      {isOtpModalOpen && (
        <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-xs bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-4 space-y-3.5 text-slate-900 dark:text-white">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
              <div className="flex items-center space-x-2 text-sky-600 dark:text-sky-400 font-bold">
                <KeyRound className="w-4 h-4" />
                <h4 className="text-xs font-extrabold">Verify Mobile OTP</h4>
              </div>
              <button onClick={() => setIsOtpModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <p className="text-slate-600 dark:text-slate-300 text-[11px]">
                Enter 4-digit OTP sent to <span className="font-bold font-mono text-sky-600 dark:text-sky-400">+91 {reporterMobile}</span>.
              </p>

              <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 font-mono text-center font-bold text-[11px]">
                Demo OTP: <span className="bg-amber-200 dark:bg-amber-900/60 px-1.5 py-0.5 rounded text-xs">{generatedOtp}</span>
              </div>

              {otpError && (
                <p className="text-red-600 dark:text-red-400 font-bold text-[10.5px]">
                  {otpError}
                </p>
              )}

              <input
                type="text"
                maxLength={4}
                value={otpInput}
                onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
                className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono font-black text-center text-lg text-slate-900 dark:text-white tracking-widest focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setIsOtpModalOpen(false)}
                className="flex-1 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleVerifyOtpAndSubmit}
                className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs flex items-center justify-center gap-1 shadow-md"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Verifying...' : 'Submit'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
