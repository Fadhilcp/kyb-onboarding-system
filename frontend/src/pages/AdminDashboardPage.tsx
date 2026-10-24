import React, { useEffect, useState, useCallback } from "react";
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
  { label: "All Applications", value: "ALL" },
  { label: "Submitted", value: "SUBMITTED" },
  { label: "AI Reviewed", value: "AI_REVIEWED" },
  { label: "Review Failed", value: "AI_REVIEW_FAILED" },
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
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
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
      setError(
        err?.response?.data?.error || "Failed to fetch applications. Please try again."
      );
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

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error("Logout failed on server", error);
    } finally {
      dispatch(logout());
    }
  };

  const handleDecision = async (id: string, status: "APPROVED" | "REJECTED") => {
    setActionLoading(true);
    try {
      const response = await applicationService.updateDecision(id, status);
      const updatedApp: Application = response.data?.data;

      if (updatedApp) {
        setApplications((prev) =>
          prev.map((app) => (app.id === id ? updatedApp : app))
        );
        setSelectedApplication(updatedApp);
      }

      setToast({
        type: "success",
        message: `Application ${status.toLowerCase()} successfully!`,
      });
    } catch (err: any) {
      setToast({
        type: "error",
        message:
          err?.response?.data?.error || `Failed to update decision to ${status}.`,
      });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-8">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center p-4 rounded-lg shadow-lg border text-sm font-medium transition-all ${
            toast.type === "success"
              ? "bg-green-50 text-green-800 border-green-200"
              : "bg-red-50 text-red-800 border-red-200"
          }`}
        >
          <span className="mr-2">
            {toast.type === "success" ? "✓" : "⚠"}
          </span>
          {toast.message}
          <button
            onClick={() => setToast(null)}
            className="ml-4 text-gray-400 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
      )}

      {/* Top Header */}
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-6 rounded-lg shadow-sm border border-gray-200 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
            Reviewer Dashboard
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Logged in as: <span className="font-semibold text-gray-900">{email}</span> | Role:{" "}
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
              {role || "REVIEWER"}
            </span>
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-md text-sm transition shadow-sm"
        >
          Sign Out
        </button>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto mt-8 space-y-6">
        {/* Filter Controls */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider mr-1">
              Filter:
            </span>
            {STATUS_FILTERS.map((filter) => {
              const isActive = selectedStatus === filter.value;
              return (
                <button
                  key={filter.value}
                  type="button"
                  onClick={() => setSelectedStatus(filter.value)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition ${
                    isActive
                      ? "bg-blue-600 text-white shadow-xs font-semibold"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {filter.label}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500">
              Total: <strong className="text-gray-900">{applications.length}</strong>
            </span>
            <button
              type="button"
              onClick={fetchApplications}
              disabled={loading}
              className="inline-flex items-center text-xs font-medium text-gray-600 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 border border-gray-200 px-2.5 py-1.5 rounded transition disabled:opacity-50"
              title="Refresh applications"
            >
              <svg
                className={`w-3.5 h-3.5 mr-1 ${loading ? "animate-spin" : ""}`}
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
              Refresh
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 p-4 rounded-lg flex items-center justify-between text-sm text-red-800">
            <div>
              <strong className="font-semibold">Error: </strong>
              {error}
            </div>
            <button
              onClick={fetchApplications}
              className="text-xs bg-red-100 hover:bg-red-200 px-3 py-1 rounded text-red-900 font-semibold transition"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Applications Table */}
        <ApplicationsTable
          applications={applications}
          loading={loading}
          onSelectApplication={(app) => setSelectedApplication(app)}
        />
      </div>

      {/* Review Modal */}
      {selectedApplication && (
        <ApplicationDetailModal
          application={selectedApplication}
          onClose={() => setSelectedApplication(null)}
          onDecision={handleDecision}
          actionLoading={actionLoading}
        />
      )}
    </div>
  );
};

export default AdminDashboardPage;