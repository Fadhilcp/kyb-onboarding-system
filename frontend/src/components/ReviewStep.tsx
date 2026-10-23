import React from 'react';
import type { ApplicationFormData } from '../lib/types';

interface ReviewStepProps {
  data: ApplicationFormData;
  file: File | null;
  onBack: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export const ReviewStep: React.FC<ReviewStepProps> = ({ data, file, onBack, onSubmit, isSubmitting }) => (
  <div className="max-w-xl mx-auto p-6 bg-white rounded-lg shadow-md">
    <h2 className="text-2xl font-semibold mb-4">Review Your Submission</h2>
    <div className="grid gap-2 mb-4">
      <p><strong>Business Name:</strong> {data.businessName}</p>
      <p><strong>Registration Number:</strong> {data.registrationNumber}</p>
      <p><strong>Registration Expiry:</strong> {data.registrationExpiry}</p>
      <p><strong>Owner Name:</strong> {data.ownerName}</p>
      <p><strong>Contact Email:</strong> {data.contactEmail}</p>
      <p><strong>Document:</strong> {file?.name ?? 'No file selected'}</p>
    </div>
    <div className="flex justify-between mt-6">
      <button type="button" onClick={onBack} className="bg-gray-300 text-gray-800 px-4 py-2 rounded">Back</button>
      <button type="button" onClick={onSubmit} disabled={isSubmitting} className="bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50">
        {isSubmitting ? 'Submitting…' : 'Submit'}
      </button>
    </div>
  </div>
);
