import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { MainLayout } from "./components/layout/MainLayout";
import { DashboardPage } from "./pages/Dashboard/DashboardPage";
import { ProductCatalogPage } from "./pages/Products/ProductCatalogPage";
import { ProductDetailPage } from "./pages/Products/ProductDetailPage";
import { DuplicateQueuePage } from "./pages/Duplicates/DuplicateQueuePage";
import { DuplicateDetailPage } from "./pages/Duplicates/DuplicateDetailPage";
import { SearchPlaygroundPage } from "./pages/Search/SearchPlaygroundPage";
import { RiskAnalysisPage } from "./pages/Risk/RiskAnalysisPage";
import { AnalyticsPage } from "./pages/Analytics/AnalyticsPage";
import { SettingsPage } from "./pages/Settings/SettingsPage";
import { LoginPage } from "./pages/Auth/LoginPage";
import { RegisterPage } from "./pages/Auth/RegisterPage";

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/products" element={<ProductCatalogPage />} />
              <Route path="/products/:id" element={<ProductDetailPage />} />
              <Route path="/duplicates" element={<DuplicateQueuePage />} />
              <Route path="/duplicates/:id" element={<DuplicateDetailPage />} />
              <Route path="/search" element={<SearchPlaygroundPage />} />
              <Route path="/risk" element={<RiskAnalysisPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
