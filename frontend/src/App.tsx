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
            <main className="center-container">
              <h1>Know your Business</h1>
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