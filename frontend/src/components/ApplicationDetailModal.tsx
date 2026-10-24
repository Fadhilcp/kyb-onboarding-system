import React, { useState } from 'react';
import type { Application, ApplicationStatus } from '../lib/types';
import { getStatusBadge, getRiskBadge } from './ApplicationsTable';

interface ApplicationDetailModalProps {
  application: Application | null;
  onClose: () => void;
  onDecision: (id: string, status: 'APPROVED' | 'REJECTED') => Promise<void>;
  actionLoading: boolean;
}

export const ApplicationDetailModal: React.FC<ApplicationDetailModalProps> = ({
  application,
  onClose,
  onDecision,
  actionLoading,
}) => {
  const [decisionType, setDecisionType] = useState<'APPROVED' | 'REJECTED' | null>(null);

  if (!application) return null;

  const aiSummary = application.aiReviewSummary;
  const isFinalized =
    application.status === 'APPROVED' || application.status === 'REJECTED';

  const handleMakeDecision = async (status: 'APPROVED' | 'REJECTED') => {
    setDecisionType(status);
    try {
      await onDecision(application.id, status);
    } finally {
      setDecisionType(null);
    }
  };

  const formattedExpiry = new Date(application.registrationExpiry).toLocaleDateString(
    undefined,
    { year: 'numeric', month: 'short', day: 'numeric' }
  );

  const formattedSubmitted = new Date(application.createdAt).toLocaleString(
    undefined,
    { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div
        className="bg-white rounded-xl shadow-2xl max-w-3xl w-full overflow-hidden border border-gray-200 animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
              {application.businessName}
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusBadge(
                  application.status
                )}`}
              >
                {application.status.replace(/_/g, ' ')}
              </span>
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Application ID: <span className="font-mono text-gray-700">{application.id}</span> &bull; Submitted {formattedSubmitted}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 rounded-lg p-1.5 hover:bg-gray-100 transition"
            aria-label="Close modal"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 max-h-[75vh] overflow-y-auto space-y-6">
          {/* Business Details Section */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-3">
              Business Registration Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg border border-gray-100 text-sm">
              <div>
                <span className="text-gray-500 block text-xs">Business Name</span>
                <span className="font-semibold text-gray-900">{application.businessName}</span>
              </div>
              <div>
                <span className="text-gray-500 block text-xs">Registration Number</span>
                <span className="font-mono font-semibold text-gray-900">{application.registrationNumber}</span>
              </div>
              <div>
                <span className="text-gray-500 block text-xs">Registration Expiry Date</span>
                <span className="font-medium text-gray-900">{formattedExpiry}</span>
              </div>
              <div>
                <span className="text-gray-500 block text-xs">Owner / Representative</span>
                <span className="font-medium text-gray-900">{application.ownerName}</span>
              </div>
              <div>
                <span className="text-gray-500 block text-xs">Contact Email</span>
                <a href={`mailto:${application.contactEmail}`} className="text-blue-600 hover:underline">
                  {application.contactEmail}
                </a>
              </div>
              <div>
                <span className="text-gray-500 block text-xs">Attached Document</span>
                {application.documentUrl ? (
                  <a
                    href={application.documentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium text-xs mt-1"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    View Document (Cloudinary)
                  </a>
                ) : (
                  <span className="text-gray-400 italic text-xs">No document URL</span>
                )}
              </div>
            </div>
          </div>

          {/* AI Verification Section */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-3 flex items-center justify-between">
              <span>AI Automated Verification Result</span>
              {aiSummary?.reviewedAt && (
                <span className="text-xs font-normal text-gray-400">
                  Reviewed on: {new Date(aiSummary.reviewedAt).toLocaleDateString()}
                </span>
              )}
            </h3>

            {application.status === 'AI_REVIEW_FAILED' || aiSummary?.error ? (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800">
                <div className="flex items-center gap-2 font-semibold text-amber-900 mb-1">
                  <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  Automated Verification Alert
                </div>
                <p>{aiSummary?.error || 'AI verification could not be completed automatically. Manual reviewer decision is required.'}</p>
              </div>
            ) : aiSummary ? (
              <div className="bg-white border border-gray-200 rounded-lg p-5 space-y-4 shadow-xs">
                {/* Score and Recommendation */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pb-4 border-b border-gray-100">
                  <div>
                    <span className="text-xs text-gray-500 block">Risk Score</span>
                    <span className="text-2xl font-extrabold text-gray-900">
                      {aiSummary.riskScore !== undefined ? `${aiSummary.riskScore}/100` : 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 block">Assessed Risk Level</span>
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold border mt-1 ${getRiskBadge(
                        aiSummary.riskLevel
                      )}`}
                    >
                      {aiSummary.riskLevel || 'UNKNOWN'}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 block">Recommendation</span>
                    <span className="text-sm font-semibold text-gray-800 block mt-1">
                      {aiSummary.recommendation?.replace(/_/g, ' ') || 'None provided'}
                    </span>
                  </div>
                </div>

                {/* Document Extraction Metadata */}
                {aiSummary.documentMetadata && (
                  <div className="text-xs bg-gray-50 p-3 rounded border border-gray-200/80">
                    <span className="font-semibold text-gray-700 block mb-1">OCR Extracted Metadata:</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-gray-600">
                      <div>
                        Verified Name: <span className="font-medium text-gray-900">{aiSummary.documentMetadata.verifiedName || 'N/A'}</span>
                      </div>
                      <div>
                        Verified Reg. No: <span className="font-mono font-medium text-gray-900">{aiSummary.documentMetadata.verifiedRegistrationNumber || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Findings list */}
                {Array.isArray(aiSummary.findings) && aiSummary.findings.length > 0 && (
                  <div>
                    <span className="text-xs font-semibold text-gray-700 block mb-2">Detailed Findings:</span>
                    <ul className="space-y-1.5 pl-4 list-disc text-xs text-gray-600">
                      {aiSummary.findings.map((item, idx) => (
                        <li key={idx} className="leading-relaxed">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center text-sm text-gray-500">
                No AI verification data available for this application yet.
              </div>
            )}
          </div>
        </div>

        {/* Action Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex flex-wrap justify-between items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
          >
            Close
          </button>

          {isFinalized ? (
            <div className="text-sm font-semibold text-gray-600 flex items-center gap-2">
              <span>Decision has been finalized as</span>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${getStatusBadge(
                  application.status
                )}`}
              >
                {application.status}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => handleMakeDecision('REJECTED')}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-medium rounded-md text-sm transition shadow-xs flex items-center"
              >
                {actionLoading && decisionType === 'REJECTED' ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Rejecting...
                  </>
                ) : (
                  'Reject Application'
                )}
              </button>

              <button
                type="button"
                disabled={actionLoading}
                onClick={() => handleMakeDecision('APPROVED')}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-medium rounded-md text-sm transition shadow-xs flex items-center"
              >
                {actionLoading && decisionType === 'APPROVED' ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Approving...
                  </>
                ) : (
                  'Approve Application'
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
