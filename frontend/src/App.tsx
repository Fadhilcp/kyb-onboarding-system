import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import SubmitApplicationPage from "./pages/SubmitApplicationPage";
import AdminLoginPage from "./pages/AdminLoginPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import ProtectedRoute from "./routes/ProtectedRoute";
import PublicRoute from "./routes/PublicRoute";
import { useInitializeAuth } from "./hooks/useInitializeAuth";

function App() {

  const { isInitializing } = useInitializeAuth();

  if (isInitializing) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>
        Loading...
      </div>
    );
  }
  return (
    <BrowserRouter>
      <Routes>
        
        <Route element={<PublicRoute />}>
        <Route path="/" element={<SubmitApplicationPage />} />
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