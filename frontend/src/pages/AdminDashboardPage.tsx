import React, { useEffect, useMemo, useState, useCallback } from "react";
import { logout } from "../features/authSlice";
import { authService } from "../services/auth.service";
import { applicationService } from "../services/application.service";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../store/store";
import type { Application, ApplicationStatus } from "../lib/types";
import { ApplicationsTable } from "../components/ApplicationsTable";
import { ApplicationDetailModal } from "../components/ApplicationDetailModal";

type FilterStatus = ApplicationStatus | "ALL";

const STATUS_FILTERS: { label: string; value: FilterStatus }[] = [
  { label: "All", value: "ALL" },
  { label: "Submitted", value: "SUBMITTED" },
  { label: "AI reviewed", value: "AI_REVIEWED" },
  { label: "Review failed", value: "AI_REVIEW_FAILED" },
  { label: "Approved", value: "APPROVED" },
  { label: "Rejected", value: "REJECTED" },
];

export const AdminDashboardPage: React.FC = () => {
  const dispatch = useDispatch();
  const { role, user } = useSelector((state: RootState) => state.auth);
  const email = user?.email || "Admin";

  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<FilterStatus>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [detailLoading, setDetailLoading] = useState<boolean>(false);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const statusParam = selectedStatus === "ALL" ? undefined : selectedStatus;
      const response = await applicationService.getApplications(statusParam);
      setApplications(response.data?.data || []);
    } catch (err: any) {
      setError(err?.response?.data?.error || "Failed to fetch applications. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [selectedStatus]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  // Auto-dismiss toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Client-side search over the loaded list
  const visibleApplications = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return applications;
    return applications.filter((a) =>
      [a.businessName, a.ownerName, a.contactEmail, a.registrationNumber]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q))
    );
  }, [applications, searchQuery]);

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error("Logout failed on server", error);
    } finally {
      dispatch(logout());
    }
  };

  const handleSelectApplication = async (app: Application) => {
    setSelectedApplication(app);
    setDetailLoading(true);
    try {
      const response = await applicationService.getApplicationById(app.id);
      if (response.data?.data) {
        setSelectedApplication(response.data.data);
      }
    } catch (err: any) {
      setToast({
        type: "error",
        message: err?.response?.data?.error || "Failed to load full application details.",
      });
    } finally {
      setDetailLoading(false);
    }
  };

  const handleDecision = async (id: string, status: "APPROVED" | "REJECTED") => {
    setActionLoading(true);
    try {
      const response = await applicationService.updateDecision(id, status);
      const updatedApp: Application = response.data?.data;

      if (updatedApp) {
        setApplications((prev) => prev.map((app) => (app.id === id ? updatedApp : app)));
        setSelectedApplication(updatedApp);
      }

      setToast({
        type: "success",
        message: `Application ${status.toLowerCase()} successfully.`,
      });
    } catch (err: any) {
      setToast({
        type: "error",
        message: err?.response?.data?.error || `Failed to update decision to ${status}.`,
      });
    } finally {
      setActionLoading(false);
    }
  };

  const userInitial = email.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Toast */}
      {toast && (
        <div
          role="status"
          className={`fixed right-5 top-5 z-[60] flex items-center gap-3 rounded-lg border bg-white px-4 py-3 text-sm font-medium shadow-lg ${
            toast.type === "success" ? "border-emerald-200 text-emerald-800" : "border-rose-200 text-rose-800"
          }`}
        >
          <span
            className={`flex h-5 w-5 items-center justify-center rounded-full text-xs text-white ${
              toast.type === "success" ? "bg-emerald-500" : "bg-rose-500"
            }`}
          >
            {toast.type === "success" ? "✓" : "!"}
          </span>
          {toast.message}
          <button
            onClick={() => setToast(null)}
            className="ml-2 text-slate-400 hover:text-slate-700"
            aria-label="Dismiss"
          >
            ✕
          </button>
        </div>
      )}

      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <span className="text-base font-semibold text-slate-900">Reviewer dashboard</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden items-center gap-3 sm:flex">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-sm font-semibold text-slate-700">
                {userInitial}
              </div>
              <div className="leading-tight">
                <p className="text-sm font-medium text-slate-900">{email}</p>
                <p className="text-xs text-slate-500 capitalize">{(role || "REVIEWER").toLowerCase()}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-8">
        {/* Page heading */}
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">Merchant applications</h1>
            <p className="mt-1 text-sm text-gray-500">
              Review onboarding submissions and the AI verification results.
            </p>
          </div>
          <p className="text-sm font-medium text-gray-500">
            Showing <span className="font-semibold text-gray-900">{visibleApplications.length}</span>
            {searchQuery && applications.length !== visibleApplications.length && (
              <> of {applications.length}</>
            )}{" "}
            {visibleApplications.length === 1 ? "application" : "applications"}
          </p>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6 lg:flex-row lg:items-center lg:justify-between">
          <div
            role="tablist"
            aria-label="Filter by status"
            className="flex items-center gap-1.5 overflow-x-auto rounded-xl bg-gray-100 p-1.5"
          >
            {STATUS_FILTERS.map((filter) => {
              const isActive = selectedStatus === filter.value;
              return (
                <button
                  key={filter.value}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setSelectedStatus(filter.value)}
                  className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isActive
                      ? "bg-white text-blue-700 shadow-sm font-semibold"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-200/50"
                  }`}
                >
                  {filter.label}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-3">
            <div className="relative flex-1 lg:w-72 lg:flex-none">
              <svg
                className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" />
              </svg>
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search business, owner or email"
                className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
              />
            </div>
            <button
              type="button"
              onClick={fetchApplications}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition-colors duration-200 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              title="Refresh applications"
            >
              <svg
                className={`h-4 w-4 ${loading ? "animate-spin text-blue-600" : "text-gray-500"}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div
            role="alert"
            className="flex items-center justify-between gap-4 rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-800 shadow-sm"
          >
            <p>
              <span className="font-semibold">Couldn’t load applications.</span> {error}
            </p>
            <button
              onClick={fetchApplications}
              className="shrink-0 rounded-lg bg-white px-4 py-2 text-xs font-semibold text-rose-700 shadow-sm ring-1 ring-inset ring-rose-200 transition-colors duration-200 hover:bg-rose-100 focus:outline-none focus:ring-2 focus:ring-rose-500"
            >
              Try again
            </button>
          </div>
        )}

        {/* Table */}
        <ApplicationsTable
          applications={visibleApplications}
          loading={loading}
          onSelectApplication={handleSelectApplication}
          searchQuery={searchQuery.trim()}
        />
      </main>

      {/* Review modal */}
      {selectedApplication && (
        <ApplicationDetailModal
          application={selectedApplication}
          onClose={() => setSelectedApplication(null)}
          onDecision={handleDecision}
          actionLoading={actionLoading}
          loading={detailLoading}
        />
      )}
    </div>
  );
};

export default AdminDashboardPage;