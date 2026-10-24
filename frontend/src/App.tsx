import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import SubmitApplicationPage from "./pages/SubmitApplicationPage";
import AdminLoginPage from "./pages/AdminLoginPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import ProtectedRoute from "./routes/ProtectedRoute";
import PublicRoute from "./routes/PublicRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <main className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
              <div className="max-w-md w-full bg-white rounded-2xl border border-gray-200 shadow-sm p-8 text-center space-y-3">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">Know Your Business</h1>
                <p className="text-sm text-gray-500">KYB Onboarding & Compliance Verification System</p>
              </div>
            </main>
          }
        />
        <Route path="/submit-application" element={<SubmitApplicationPage />} />
        
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<AdminLoginPage />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["REVIEWER"]} />}>
          <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;