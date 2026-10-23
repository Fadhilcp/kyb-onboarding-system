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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      {status === 'success' ? (
        <div className="bg-white p-8 rounded shadow-md text-center">
          <h2 className="text-2xl font-semibold mb-4">Application Submitted!</h2>
          <p className="mb-6">Your KYB application has been received.</p>
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded"
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
            Submit Another
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
            <div className="mt-4 text-center text-red-600">{errorMsg}</div>
          )}
        </>
      )}
    </div>
  );
};

export default SubmitApplicationPage;
