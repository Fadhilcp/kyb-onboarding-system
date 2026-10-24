import React, { useState } from 'react';
import { DetailsStep } from '../components/DetailsStep';
import { DocumentStep } from '../components/DocumentStep';
import { ReviewStep } from '../components/ReviewStep';
import { applicationService } from '../services/application.service';
import type { ApplicationFormData } from '../lib/types';

const INITIAL_FORM_DATA: ApplicationFormData = {
  businessName: '',
  registrationNumber: '',
  registrationExpiry: '',
  ownerName: '',
  contactEmail: '',
};

const STEPS = [
  { step: 1, title: 'Details', description: 'Business information' },
  { step: 2, title: 'Document', description: 'Verification certificate' },
  { step: 3, title: 'Review', description: 'Confirmation & submit' },
];

export const SubmitApplicationPage: React.FC = () => {
  const [step, setStep] = useState<number>(1);
  const [formData, setFormData] = useState<ApplicationFormData>(INITIAL_FORM_DATA);
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'error' | 'success'>('idle');
  const [errorMsg, setErrorMsg] = useState<string>('');

  const handleReset = () => {
    setStep(1);
    setFormData(INITIAL_FORM_DATA);
    setFile(null);
    setStatus('idle');
    setErrorMsg('');
  };

  const handleSubmit = async () => {
    if (!file) return;
    setStatus('loading');
    setErrorMsg('');

    const payload = new FormData();
    Object.entries(formData).forEach(([key, value]) => payload.append(key, value));
    payload.append('document', file);

    try {
      await applicationService.submit(payload);
      setStatus('success');
    } catch (err: any) {
      const serverMessage = err?.response?.data?.error || err?.message || 'Submission failed. Please check your network and try again.';
      setErrorMsg(serverMessage);
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8">
      {/* Top Header */}
      <div className="max-w-xl mx-auto w-full mb-8 text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 ring-1 ring-inset ring-blue-700/10 mb-3">
          KYB Onboarding Portal
        </span>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Know Your Business</h1>
        <p className="mt-1 text-sm text-gray-500">
          Automated identity verification and compliance onboarding
        </p>
      </div>

      {status === 'success' ? (
        <div className="max-w-xl mx-auto w-full rounded-2xl border border-gray-200 bg-white p-6 sm:p-10 text-center shadow-sm space-y-6">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 shadow-inner">
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight text-gray-900">Application Submitted!</h2>
            <p className="text-sm text-gray-600 max-w-sm mx-auto">
              Your KYB application for <strong className="text-gray-900">{formData.businessName}</strong> has been received and queued for automated AI analysis and reviewer decision.
            </p>
          </div>

          <div className="rounded-xl bg-gray-50 p-4 border border-gray-200 text-left text-xs text-gray-600 space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-400">Business Registration:</span>
              <span className="font-mono font-medium text-gray-800">{formData.registrationNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Confirmation Sent To:</span>
              <span className="font-medium text-blue-600">{formData.contactEmail}</span>
            </div>
          </div>

          <button
            onClick={handleReset}
            className="w-full inline-flex items-center justify-center rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors duration-200 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Submit Another Application
          </button>
        </div>
      ) : (
        <div className="max-w-xl mx-auto w-full space-y-6">
          {/* Multi-step progress indicator */}
          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <nav aria-label="Progress">
              <ol className="flex items-center justify-between">
                {STEPS.map((s, index) => {
                  const isCurrent = step === s.step;
                  const isCompleted = step > s.step;

                  return (
                    <li key={s.step} className="flex-1 relative">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors duration-200 ${
                            isCompleted
                              ? 'bg-emerald-600 text-white'
                              : isCurrent
                              ? 'bg-blue-600 text-white shadow-sm ring-4 ring-blue-50'
                              : 'bg-gray-100 text-gray-400'
                          }`}
                        >
                          {isCompleted ? (
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            s.step
                          )}
                        </div>
                        <div className="hidden sm:block">
                          <p
                            className={`text-xs font-semibold ${
                              isCurrent ? 'text-blue-600' : isCompleted ? 'text-gray-900' : 'text-gray-400'
                            }`}
                          >
                            {s.title}
                          </p>
                          <p className="text-[11px] text-gray-400 leading-none">{s.description}</p>
                        </div>
                      </div>

                      {index < STEPS.length - 1 && (
                        <div
                          className={`hidden md:block absolute top-4 left-[calc(100%-1rem)] w-4 h-0.5 ${
                            isCompleted ? 'bg-emerald-500' : 'bg-gray-200'
                          }`}
                        />
                      )}
                    </li>
                  );
                })}
              </ol>
            </nav>
          </div>

          {/* Submission error banner */}
          {status === 'error' && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 shadow-sm flex items-start justify-between gap-3 animate-fadeIn">
              <div className="flex items-start gap-2.5">
                <svg className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                <div>
                  <p className="font-semibold text-rose-800">Submission Error</p>
                  <p className="text-xs text-rose-600 mt-0.5">{errorMsg}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setStatus('idle')}
                className="text-xs font-medium text-rose-600 hover:text-rose-800"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Form Steps */}
          {step === 1 && (
            <DetailsStep data={formData} setData={setFormData} onNext={() => setStep(2)} />
          )}

          {step === 2 && (
            <DocumentStep file={file} setFile={setFile} onBack={() => setStep(1)} onNext={() => setStep(3)} />
          )}

          {step === 3 && (
            <ReviewStep
              data={formData}
              file={file}
              onBack={() => setStep(2)}
              onSubmit={handleSubmit}
              isSubmitting={status === 'loading'}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default SubmitApplicationPage;
