import React from 'react';
import type { ApplicationFormData } from '../lib/types';
import { formatFileSize } from '../utils/validation';

interface ReviewStepProps {
  data: ApplicationFormData;
  file: File | null;
  onBack: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export const ReviewStep: React.FC<ReviewStepProps> = ({
  data,
  file,
  onBack,
  onSubmit,
  isSubmitting,
}) => (
  <div className="max-w-xl mx-auto p-6 sm:p-8 bg-white rounded-2xl shadow-sm border border-gray-200 space-y-6">
    <div className="border-b border-gray-100 pb-4">
      <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Review Submission</h2>
      <p className="mt-1 text-sm text-gray-500">
        Confirm all entity details and documentation before initiating automated AI verification.
      </p>
    </div>

    <div className="space-y-4">
      <div className="rounded-xl bg-gray-50/80 p-5 border border-gray-200 text-sm space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-gray-200/60">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Business Details</span>
          <button
            type="button"
            onClick={onBack}
            className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline"
          >
            Edit
          </button>
        </div>

        <div className="flex justify-between py-1">
          <span className="text-gray-500">Business Name</span>
          <span className="font-semibold text-gray-900 text-right">{data.businessName}</span>
        </div>

        <div className="flex justify-between py-1">
          <span className="text-gray-500">Registration Number</span>
          <span className="font-mono font-semibold text-gray-900">{data.registrationNumber}</span>
        </div>

        <div className="flex justify-between py-1">
          <span className="text-gray-500">Registration Expiry</span>
          <span className="font-medium text-gray-900">{data.registrationExpiry}</span>
        </div>

        <div className="flex justify-between py-1">
          <span className="text-gray-500">Owner / Representative</span>
          <span className="font-medium text-gray-900">{data.ownerName}</span>
        </div>

        <div className="flex justify-between py-1">
          <span className="text-gray-500">Contact Email</span>
          <span className="text-blue-600 font-medium">{data.contactEmail}</span>
        </div>
      </div>

      <div className="rounded-xl bg-gray-50/80 p-5 border border-gray-200 text-sm">
        <div className="flex items-center justify-between pb-2 mb-3 border-b border-gray-200/60">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Attached Document</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-700 font-bold text-xs">
            {file?.type === 'application/pdf' ? 'PDF' : 'DOC'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-gray-900 text-sm truncate">{file?.name ?? 'No file selected'}</p>
            {file && (
              <p className="text-xs text-gray-500 mt-0.5">
                {formatFileSize(file.size)} • {file.type || 'Document'}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>

    <div className="flex justify-between items-center pt-4 border-t border-gray-100">
      <button
        type="button"
        onClick={onBack}
        disabled={isSubmitting}
        className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition-colors duration-200 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
      >
        ← Back
      </button>
      <button
        type="button"
        onClick={onSubmit}
        disabled={isSubmitting}
        className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors duration-200 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting && (
          <svg className="h-4 w-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        <span>{isSubmitting ? 'Submitting Application…' : 'Confirm & Submit Application'}</span>
      </button>
    </div>
  </div>
);

export default ReviewStep;
