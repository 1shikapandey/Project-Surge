'use client';

import React, { useState } from 'react';
import { X, Shield, Lock, Mail, Building2, AlertCircle, ArrowRight, ShieldCheck, UserCheck, KeyRound, Sparkles } from 'lucide-react';
import { CityId, CITIES } from '@/lib/mock-data';
import { useLanguage } from '@/context/LanguageContext';

interface AuthorityAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultCityId?: CityId;
  onSuccessLogin: (cityId: CityId, loginId: string) => void;
}

export const AuthorityAuthModal: React.FC<AuthorityAuthModalProps> = ({
  isOpen,
  onClose,
  defaultCityId = 'mumbai',
  onSuccessLogin
}) => {
  const { t } = useLanguage();
  const [authTab, setAuthTab] = useState<'login' | 'signup'>('login');
  const [selectedCity, setSelectedCity] = useState<CityId>(defaultCityId);
  const [loginId, setLoginId] = useState(`${defaultCityId}.aqua.gov.in`);
  const [password, setPassword] = useState('12345678');
  const [officerName, setOfficerName] = useState('Chief Disaster Officer');
  const [departmentRole, setDepartmentRole] = useState('Municipal Control Room Lead');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleCityChange = (cId: CityId) => {
    setSelectedCity(cId);
    setLoginId(`${cId}.aqua.gov.in`);
  };

  const handleQuickFillDemo = (cId: CityId) => {
    setSelectedCity(cId);
    setLoginId(`${cId}.aqua.gov.in`);
    setPassword('12345678');
    setErrorMsg('');
  };

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);

    setTimeout(() => {
      const cleanLogin = loginId.trim().toLowerCase();

      // Validate login format & password
      if (password !== '12345678') {
        setErrorMsg(t.authModal.invalidCredentials || 'Invalid passcode. Please use demo passcode: 12345678');
        setIsSubmitting(false);
        return;
      }

      if (!cleanLogin.endsWith('.aqua.gov.in') && !cleanLogin.includes('aqua.gov.in')) {
        setErrorMsg('Login domain must end with .aqua.gov.in (e.g., mumbai.aqua.gov.in)');
        setIsSubmitting(false);
        return;
      }

      // Extract city from login id if available
      let detectedCity: CityId = selectedCity;
      if (cleanLogin.startsWith('mumbai')) detectedCity = 'mumbai';
      else if (cleanLogin.startsWith('delhi')) detectedCity = 'delhi';
      else if (cleanLogin.startsWith('chennai')) detectedCity = 'chennai';

      setIsSubmitting(false);
      onSuccessLogin(detectedCity, cleanLogin);
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-7 space-y-5 text-slate-900 dark:text-slate-100 transition-colors">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 dark:text-white text-base leading-tight">
                {t.authModal.title || 'Municipal Disaster Control Login'}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                Authorized Emergency Officer Portal
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
            aria-label="Close Auth Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher: Officer Login vs Register */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800/70 p-1 rounded-2xl border border-slate-200 dark:border-slate-700/60 text-xs font-bold">
          <button
            type="button"
            onClick={() => setAuthTab('login')}
            className={`flex-1 py-2 rounded-xl transition-all ${
              authTab === 'login'
                ? 'bg-gradient-to-r from-sky-600 to-blue-600 text-white font-extrabold shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Officer Sign In
          </button>
          <button
            type="button"
            onClick={() => setAuthTab('signup')}
            className={`flex-1 py-2 rounded-xl transition-all ${
              authTab === 'signup'
                ? 'bg-gradient-to-r from-sky-600 to-blue-600 text-white font-extrabold shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Register Officer Account
          </button>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-700 dark:text-amber-300 flex items-start space-x-2 animate-shake">
            <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <span className="font-semibold">{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleAuthSubmit} className="space-y-4 text-xs">
          {/* Target City Selection */}
          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1.5">
              Target Municipal Jurisdiction:
            </label>
            <div className="relative">
              <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              <select
                value={selectedCity}
                onChange={(e) => handleCityChange(e.target.value as CityId)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-bold focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 cursor-pointer transition-colors"
              >
                <option value="mumbai" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Mumbai Municipal Control Room</option>
                <option value="delhi" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Delhi NCR Disaster Response Hub</option>
                <option value="chennai" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Greater Chennai Water Management</option>
              </select>
            </div>
          </div>

          {authTab === 'signup' && (
            <>
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1.5">Officer Full Name & Rank:</label>
                <div className="relative">
                  <UserCheck className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                  <input
                    type="text"
                    value={officerName}
                    onChange={(e) => setOfficerName(e.target.value)}
                    placeholder="e.g. Chief Hydraulic Engineer"
                    required
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1.5">Department / Division:</label>
                <select
                  value={departmentRole}
                  onChange={(e) => setDepartmentRole(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-bold focus:outline-none focus:border-sky-500 cursor-pointer"
                >
                  <option value="Municipal Control Room Lead">Municipal Control Room Lead</option>
                  <option value="Stormwater Drainage SCADA Lead">Stormwater Drainage SCADA Lead</option>
                  <option value="NDRF Field Operations Commander">NDRF Field Operations Commander</option>
                  <option value="Hydraulics & Dewatering Supervisor">Hydraulics & Dewatering Supervisor</option>
                </select>
              </div>
            </>
          )}

          {/* Login ID Domain */}
          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1.5">
              {t.authModal.domainLabel || 'Official Authority Login Domain / ID'}:
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              <input
                type="text"
                value={loginId}
                onChange={(e) => setLoginId(e.target.value)}
                placeholder="e.g. mumbai.aqua.gov.in"
                required
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono font-bold focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
              />
            </div>
          </div>

          {/* Passcode */}
          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1.5">
              {t.authModal.passcodeLabel || 'Security Passcode'}:
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter 8-digit passcode"
                required
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono font-bold focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-sky-600 via-blue-600 to-sky-700 hover:from-sky-500 hover:to-blue-600 text-white font-black text-xs shadow-lg shadow-sky-500/25 transition-all flex items-center justify-center space-x-2 active:scale-98 cursor-pointer disabled:opacity-50"
          >
            <span>{isSubmitting ? 'Authenticating Official Credentials...' : 'Sign In to Authority Command Center'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};


