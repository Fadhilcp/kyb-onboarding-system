import React from 'react';
import type { Application, ApplicationStatus } from '../lib/types';

interface ApplicationsTableProps {
  applications: Application[];
  loading: boolean;
  onSelectApplication: (app: Application) => void;
  searchQuery?: string;
}

export const getStatusBadge = (status: ApplicationStatus | string) => {
  switch (status) {
    case 'APPROVED':
      return { bg: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20', dot: 'bg-emerald-500', label: 'Approved' };
    case 'REJECTED':
      return { bg: 'bg-rose-50 text-rose-700 ring-rose-600/20', dot: 'bg-rose-500', label: 'Rejected' };
    case 'AI_REVIEWED':
      return { bg: 'bg-sky-50 text-sky-700 ring-sky-600/20', dot: 'bg-sky-500', label: 'AI reviewed' };
    case 'AI_REVIEW_FAILED':
      return { bg: 'bg-amber-50 text-amber-800 ring-amber-600/20', dot: 'bg-amber-500', label: 'Review failed' };
    case 'SUBMITTED':
      return { bg: 'bg-indigo-50 text-indigo-700 ring-indigo-600/20', dot: 'bg-indigo-500', label: 'Submitted' };
    case 'DRAFT':
    default: {
      const text = status ? String(status).replace(/_/g, ' ').toLowerCase() : 'draft';
      return {
        bg: 'bg-slate-100 text-slate-700 ring-slate-500/20',
        dot: 'bg-slate-400',
        label: text.charAt(0).toUpperCase() + text.slice(1),
      };
    }
  }
};

export const getRiskBadge = (level?: 'LOW' | 'MEDIUM' | 'HIGH' | string) => {
  switch (level) {
    case 'LOW':
      return { pill: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20', bar: 'bg-emerald-500', label: 'Low risk' };
    case 'MEDIUM':
      return { pill: 'bg-amber-50 text-amber-800 ring-amber-600/20', bar: 'bg-amber-500', label: 'Medium risk' };
    case 'HIGH':
      return { pill: 'bg-rose-50 text-rose-700 ring-rose-600/20', bar: 'bg-rose-500', label: 'High risk' };
    default:
      return { pill: 'bg-slate-100 text-slate-600 ring-slate-500/20', bar: 'bg-slate-400', label: 'Pending' };
  }
};

export const StatusBadge: React.FC<{ status: ApplicationStatus | string }> = ({ status }) => {
  const info = getStatusBadge(status);
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${info.bg}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${info.dot}`} />
      {info.label}
    </span>
  );
};

const HEADERS: { label: string; align?: 'right'; hideBelow?: 'md' | 'lg' }[] = [
  { label: 'Business' },
  { label: 'Registration no.', hideBelow: 'lg' },
  { label: 'Status' },
  { label: 'AI risk', hideBelow: 'md' },
  { label: 'Submitted', hideBelow: 'lg' },
  { label: '', align: 'right' },
];

const hideClass = (h?: 'md' | 'lg') =>
  h === 'md' ? 'hidden md:table-cell' : h === 'lg' ? 'hidden lg:table-cell' : '';

export const ApplicationsTable: React.FC<ApplicationsTableProps> = ({
  applications,
  loading,
  onSelectApplication,
  searchQuery,
}) => {
  if (loading) {
    return (
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="divide-y divide-gray-100">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex animate-pulse items-center gap-4 p-6">
              <div className="h-10 w-10 shrink-0 rounded-xl bg-gray-200" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-48 rounded bg-gray-200" />
                <div className="h-3 w-64 max-w-full rounded bg-gray-100" />
              </div>
              <div className="hidden h-6 w-24 rounded-full bg-gray-100 sm:block" />
              <div className="hidden h-6 w-28 rounded bg-gray-100 md:block" />
              <div className="h-8 w-20 rounded-lg bg-gray-100" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (applications.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-8 sm:p-16 text-center shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-400 mb-2">
          <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
        </div>
        <h3 className="mt-4 text-base font-semibold text-gray-900">No applications found</h3>
        <p className="mx-auto mt-1 max-w-sm text-sm text-gray-500">
          {searchQuery
            ? `Nothing matches “${searchQuery}”. Try a different name, email or registration number.`
            : 'There are no applications with this status yet. Try another filter.'}
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-md">
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-slate-50 border-b border-gray-200">
            <tr>
              {HEADERS.map((h, i) => (
                <th
                  key={i}
                  scope="col"
                  className={`px-8 py-5 text-xs font-bold uppercase tracking-wider text-slate-500 ${
                  h.align === 'right' ? 'text-right' : 'text-left'
                } ${hideClass(h.hideBelow)}`}
              >
                {h.label || <span className="sr-only">Actions</span>}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {applications.map((app) => {
              const aiSummary = app.aiReviewSummary;
              const riskInfo = getRiskBadge(aiSummary?.riskLevel);
              const score =
                aiSummary?.riskScore !== undefined
                  ? Math.min(100, Math.max(0, aiSummary.riskScore))
                  : undefined;

              const formattedDate = app.createdAt
                ? new Date(app.createdAt).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })
                : '—';

              const initial = app.businessName ? app.businessName.charAt(0).toUpperCase() : 'B';

              return (
                <tr
                key={app.id}
                onClick={() => onSelectApplication(app)}
                className="group cursor-pointer transition-colors duration-200 hover:bg-blue-50/50"
              >
                  <td className="px-8 py-5">
                  <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-sm font-semibold text-blue-700">
                        {initial}
                      </div>
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-200">
                          {app.businessName}
                        </div>
                        <div className="truncate text-xs text-gray-500 mt-0.5">
                          {app.ownerName} · {app.contactEmail}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className={`whitespace-nowrap px-8 py-5 ${hideClass('lg')}`}>
                    <span className="rounded-lg bg-gray-100 px-2.5 py-1 font-mono text-xs text-gray-700 border border-gray-200/80">
                      {app.registrationNumber}
                    </span>
                  </td>

                  <td className="whitespace-nowrap px-8 py-5">
                    <StatusBadge status={app.status} />
                  </td>

                  <td className={`whitespace-nowrap px-8 py-5 ${hideClass('md')}`}>
                    {score !== undefined ? (
                      <div className="w-32">
                        <div className="mb-1.5 flex items-center justify-between text-xs">
                          <span className="font-semibold text-gray-900">
                            {score}
                            <span className="font-normal text-gray-400">/100</span>
                          </span>
                          <span
                            className={`rounded px-1.5 py-0.5 text-[11px] font-medium ring-1 ring-inset ${riskInfo.pill}`}
                          >
                            {riskInfo.label}
                          </span>
                        </div>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                          <div
                            className={`h-full rounded-full ${riskInfo.bar}`}
                            style={{ width: `${score}%` }}
                          />
                        </div>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">Not evaluated</span>
                    )}
                  </td>

                  <td className={`whitespace-nowrap px-8 py-5 text-sm text-gray-500 font-medium ${hideClass('lg')}`}>
                    {formattedDate}
                  </td>

                  <td className="whitespace-nowrap px-8 py-5 text-right">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectApplication(app);
                      }}
                      className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-3.5 py-1.5 text-sm font-medium text-gray-700 shadow-sm transition-colors duration-200 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      Review
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ApplicationsTable;