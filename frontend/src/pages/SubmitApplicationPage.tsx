import React, { useState } from 'react';
import { DetailsStep } from '../components/DetailsStep';
import { DocumentStep } from '../components/DocumentStep';
import { ReviewStep } from '../components/ReviewStep';
import { applicationService } from '../services/application.service';
import type { ApplicationFormData } from '../lib/types';

export const SubmitApplicationPage: React.FC = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<ApplicationFormData>({
    businessName: '',
    registrationNumber: '',
    registrationExpiry: '',
    ownerName: '',
    contactEmail: '',
  });
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'error' | 'success'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async () => {
    if (!file) return;
    setStatus('loading');
    const payload = new FormData();
    Object.entries(formData).forEach(([key, value]) => payload.append(key, value));
    payload.append('document', file);
    try {
      await applicationService.submit(payload);
      setStatus('success');
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.error || 'Submission failed');
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 sm:p-8">
      {status === 'success' ? (
        <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 sm:p-8 text-center shadow-sm space-y-6">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight text-gray-900">Application Submitted!</h2>
            <p className="text-sm text-gray-600">Your KYB application has been received and is currently under review.</p>
          </div>
          <button
            className="w-full inline-flex items-center justify-center rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors duration-200 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            onClick={() => {
              setStep(1);
              setFormData({
                businessName: '',
                registrationNumber: '',
                registrationExpiry: '',
                ownerName: '',
                contactEmail: '',
              });
              setFile(null);
              setStatus('idle');
            }}
          >
            Submit Another Application
          </button>
        </div>
      ) : (
        <>
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
          {status === 'error' && (
            <div className="mt-6 max-w-xl w-full rounded-xl border border-rose-200 bg-rose-50 p-4 text-center text-sm font-medium text-rose-700 shadow-sm">
              {errorMsg}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SubmitApplicationPage;
