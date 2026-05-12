import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AuthPage from './pages/AuthPage';
import Welcome from './pages/Welcome';
import Dashboard from './pages/Dashboard';
import After10th from "./pages/After10th";
import After12th from "./pages/After12th";
import DuringGraduation from "./pages/Duringgraduation";
import AfterGraduation from "./pages/Aftergraduation";
import ParentDashboard from "./pages/ParentDashboard";
import EmployeeGuide from "./pages/Employeeguide";
import OpportunitiesModule from "./pages/OpportunitiesModule";
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/login" element={<AuthPage />} />
        <Route path="/signup" element={<AuthPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/welcome" element={<Welcome />} />
        <Route path="/dashboard/student" element={<After10th />} />
        <Route path="/dashboard/after10" element={<After10th />} />
        <Route path="/dashboard/after12" element={<After12th />} />
        <Route path="/dashboard/during-grad" element={<DuringGraduation />} />
        <Route path="/dashboard/after-grad" element={<AfterGraduation />} />
        <Route path="/dashboard/parent" element={<ParentDashboard />} />
        <Route path="/dashboard/employee" element={<EmployeeGuide />} />
        <Route path="/dashboard/opportunities" element={<OpportunitiesModule />} />
        {/*<Route path="*" element={<Navigate to="/login" replace />} />*/}
      </Routes>
    </BrowserRouter>
  );
}