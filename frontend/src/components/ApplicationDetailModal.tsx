import React, { useEffect, useState } from 'react';
import type { Application } from '../lib/types';
import { StatusBadge, getRiskBadge } from './ApplicationsTable';

interface ApplicationDetailModalProps {
  application: Application | null;
  onClose: () => void;
  onDecision: (id: string, status: 'APPROVED' | 'REJECTED') => Promise<void>;
  actionLoading: boolean;
  loading?: boolean;
}

const Spinner: React.FC<{ className?: string }> = ({ className = 'h-4 w-4' }) => (
  <svg className={`animate-spin ${className}`} fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
  </svg>
);

const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="space-y-1">
    <dt className="text-xs font-medium text-gray-500">{label}</dt>
    <dd className="text-sm font-medium text-gray-900">{children}</dd>
  </div>
);

export const ApplicationDetailModal: React.FC<ApplicationDetailModalProps> = ({
  application,
  onClose,
  onDecision,
  actionLoading,
  loading = false,
}) => {
  const [decisionType, setDecisionType] = useState<'APPROVED' | 'REJECTED' | null>(null);

  // Close on Escape + lock background scroll while open
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  if (!application) return null;

  const aiSummary = application.aiReviewSummary;
  const isFinalized = application.status === 'APPROVED' || application.status === 'REJECTED';
  const riskInfo = getRiskBadge(aiSummary?.riskLevel);
  const score =
    aiSummary?.riskScore !== undefined
      ? Math.min(100, Math.max(0, aiSummary.riskScore))
      : undefined;

  const handleMakeDecision = async (status: 'APPROVED' | 'REJECTED') => {
    setDecisionType(status);
    try {
      await onDecision(application.id, status);
    } finally {
      setDecisionType(null);
    }
  };

  const formattedExpiry = application.registrationExpiry
    ? new Date(application.registrationExpiry).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : '—'; 

  const formattedSubmitted = application.createdAt
    ? new Date(application.createdAt).toLocaleString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '—';

  const initial = application.businessName ? application.businessName.charAt(0).toUpperCase() : 'B';

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-gray-900/50 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl border border-gray-200 sm:rounded-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="application-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-gray-200 px-6 py-5 sm:px-8 sm:py-6 bg-white">
          <div className="flex min-w-0 items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-lg font-semibold text-blue-700">
              {initial}
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <h2 id="application-modal-title" className="truncate text-lg font-semibold text-gray-900">
                  {application.businessName}
                </h2>
                <StatusBadge status={application.status} />
              </div>
              <p className="mt-1 truncate text-xs text-gray-500">
                ID <span className="font-mono text-gray-700">{application.id}</span> · Submitted{' '}
                {formattedSubmitted}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="-mr-2 rounded-lg p-2 text-gray-400 transition-colors duration-200 hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Close"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        {loading ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-20 sm:px-8">
            <Spinner className="h-8 w-8 text-blue-600" />
            <p className="text-sm font-medium text-gray-500">Loading application details…</p>
          </div>
        ) : (
          <div className="flex-1 space-y-6 overflow-y-auto bg-gray-50/50 p-6 sm:p-8">
            {/* Business details */}
            <section className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-900">Business details</h3>
              <dl className="grid grid-cols-1 gap-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:grid-cols-2 sm:p-8">
                <Field label="Business name">
                  <span className="font-medium">{application.businessName}</span>
                </Field>
                <Field label="Registration number">
                  <span className="font-mono">{application.registrationNumber}</span>
                </Field>
                <Field label="Registration expiry">{formattedExpiry}</Field>
                <Field label="Owner / representative">{application.ownerName}</Field>
                <Field label="Contact email">
                  <a
                    href={`mailto:${application.contactEmail}`}
                    className="text-blue-600 hover:text-blue-700 hover:underline transition-colors duration-200"
                  >
                    {application.contactEmail}
                  </a>
                </Field>
                <Field label="Attached document">
                  {application.documentUrl ? (
                    <a
                      href={application.documentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 font-medium text-blue-600 hover:text-blue-700 transition-colors duration-200"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      Open document
                    </a>
                  ) : (
                    <span className="text-gray-400">No document uploaded</span>
                  )}
                </Field>
              </dl>
            </section>

            {/* AI verification */}
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900">AI verification</h3>
                {aiSummary?.reviewedAt && (
                  <span className="text-xs text-gray-400">
                    Reviewed {new Date(aiSummary.reviewedAt).toLocaleDateString()}
                  </span>
                )}
              </div>

              <div>
                {application.status === 'AI_REVIEW_FAILED' || aiSummary?.error ? (
                  <div className="flex gap-4 rounded-xl border border-amber-200 bg-amber-50 p-6 shadow-sm">
                    <svg className="h-5 w-5 shrink-0 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <div className="text-sm text-amber-900 space-y-1">
                      <p className="font-semibold">Automatic verification failed</p>
                      <p className="text-amber-800 leading-relaxed">
                        {aiSummary?.error ||
                          'The AI check could not be completed. Review the documents manually before deciding.'}
                      </p>
                    </div>
                  </div>
                ) : aiSummary ? (
                  <div className="space-y-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                      <div>
                        <p className="text-xs font-medium text-gray-500">Risk score</p>
                        <p className="mt-1 text-2xl font-bold text-gray-900">
                          {score !== undefined ? score : 'N/A'}
                          {score !== undefined && (
                            <span className="text-sm font-normal text-gray-400">/100</span>
                          )}
                        </p>
                        {score !== undefined && (
                          <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-gray-100">
                            <div className={`h-full rounded-full ${riskInfo.bar}`} style={{ width: `${score}%` }} />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500">Risk level</p>
                        <span
                          className={`mt-2 inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${riskInfo.pill}`}
                        >
                          {riskInfo.label}
                        </span>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500">Recommendation</p>
                        <p className="mt-2 text-sm font-medium capitalize text-gray-900">
                          {aiSummary.recommendation?.replace(/_/g, ' ').toLowerCase() || 'None provided'}
                        </p>
                      </div>
                    </div>

                    {aiSummary.documentMetadata && (
                      <div className="rounded-xl bg-gray-50 p-5 border border-gray-200 space-y-3">
                        <p className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Details read from the document</p>
                        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <Field label="Business name">
                            {aiSummary.documentMetadata.verifiedName || 'N/A'}
                          </Field>
                          <Field label="Registration number">
                            <span className="font-mono">
                              {aiSummary.documentMetadata.verifiedRegistrationNumber || 'N/A'}
                            </span>
                          </Field>
                        </dl>
                      </div>
                    )}

                    {Array.isArray(aiSummary.findings) && aiSummary.findings.length > 0 && (
                      <div className="space-y-3 pt-2">
                        <p className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Findings</p>
                        <ul className="space-y-2.5">
                          {aiSummary.findings.map((item, idx) => (
                            <li key={idx} className="flex gap-3 text-sm leading-relaxed text-gray-600 bg-gray-50/70 p-3 rounded-lg border border-gray-100">
                              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center text-sm text-gray-500">
                    No AI verification result yet for this application.
                  </div>
                )}
              </div>
            </section>
          </div>
        )}

        {/* Footer */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-gray-200 bg-white px-6 py-4 sm:px-8 sm:py-5">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition-colors duration-200 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Close
          </button>

          {isFinalized ? (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              Decision finalized
              <StatusBadge status={application.status} />
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <button
                type="button"
                disabled={actionLoading || loading}
                onClick={() => handleMakeDecision('REJECTED')}
                className="inline-flex items-center gap-2 rounded-lg border border-rose-200 bg-white px-4 py-2.5 text-sm font-medium text-rose-700 shadow-sm transition-colors duration-200 hover:bg-rose-50 focus:outline-none focus:ring-2 focus:ring-rose-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {actionLoading && decisionType === 'REJECTED' ? (
                  <>
                    <Spinner /> Rejecting…
                  </>
                ) : (
                  'Reject'
                )}
              </button>
              <button
                type="button"
                disabled={actionLoading || loading}
                onClick={() => handleMakeDecision('APPROVED')}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors duration-200 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {actionLoading && decisionType === 'APPROVED' ? (
                  <>
                    <Spinner /> Approving…
                  </>
                ) : (
                  'Approve'
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApplicationDetailModal;