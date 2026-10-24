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
  <div className="max-w-xl mx-auto p-6 sm:p-8 bg-white rounded-2xl shadow-sm border border-gray-200 space-y-6">
    <div>
      <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Review Your Submission</h2>
      <p className="mt-1 text-sm text-gray-500">Confirm all details before dispatching for automated AI verification.</p>
    </div>
    <div className="grid gap-3.5 rounded-xl bg-gray-50 p-6 border border-gray-200 text-sm">
      <div className="flex justify-between py-1 border-b border-gray-200/60">
        <span className="text-gray-500">Business Name:</span>
        <span className="font-semibold text-gray-900">{data.businessName}</span>
      </div>
      <div className="flex justify-between py-1 border-b border-gray-200/60">
        <span className="text-gray-500">Registration Number:</span>
        <span className="font-mono font-semibold text-gray-900">{data.registrationNumber}</span>
      </div>
      <div className="flex justify-between py-1 border-b border-gray-200/60">
        <span className="text-gray-500">Registration Expiry:</span>
        <span className="font-medium text-gray-900">{data.registrationExpiry}</span>
      </div>
      <div className="flex justify-between py-1 border-b border-gray-200/60">
        <span className="text-gray-500">Owner Name:</span>
        <span className="font-medium text-gray-900">{data.ownerName}</span>
      </div>
      <div className="flex justify-between py-1 border-b border-gray-200/60">
        <span className="text-gray-500">Contact Email:</span>
        <span className="text-blue-600 font-medium">{data.contactEmail}</span>
      </div>
      <div className="flex justify-between py-1">
        <span className="text-gray-500">Attached Document:</span>
        <span className="font-mono text-xs font-semibold text-gray-800">{file?.name ?? 'No file selected'}</span>
      </div>
    </div>
    <div className="flex justify-between items-center pt-2">
      <button
        type="button"
        onClick={onBack}
        className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition-colors duration-200 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        Back
      </button>
      <button
        type="button"
        onClick={onSubmit}
        disabled={isSubmitting}
        className="rounded-lg bg-emerald-600 px-6 py-2.5 text-sm font-medium text-white shadow-sm transition-colors duration-200 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? 'Submitting…' : 'Submit Application'}
      </button>
    </div>
  </div>
);
