// src/App.jsx
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './components/pages/Dashboard';
import Tasks from './components/pages/Tasks';
import Compliance from './components/pages/Compliance';
import Vendors from './components/pages/Vendors';
import Settings from './components/pages/Settings';
import Payroll from './components/pages/Payroll';
import Login from './components/pages/Login';
import Trash from './components/pages/Trash';
import Attendance from './components/pages/Attendance';
import ChangePassword from './components/pages/ChangePassword';
import { useAuth } from './contexts/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Protected Route component with role-based access
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" />;
  }
  
  return children;
};

// Public Route component (redirects to dashboard if already logged in)
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (user) {
    return <Navigate to="/" />;
  }
  
  return children;
};

function App() {
  return (
    <>
    <Layout>
      <Routes>
        <Route path="/login" element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } />
        <Route path="/" element={
          <ProtectedRoute allowedRoles={['admin', 'manager', 'employee']}>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/tasks" element={
          <ProtectedRoute allowedRoles={['admin', 'manager', 'employee']}>
            <Tasks />
          </ProtectedRoute>
        } />
        <Route path="/payroll" element={
          <ProtectedRoute allowedRoles={['admin', 'manager']}>
            <Payroll />
          </ProtectedRoute>
        } />
        <Route path="/attendance" element={
          <ProtectedRoute allowedRoles={['admin', 'manager', 'employee']}>
            <Attendance />
          </ProtectedRoute>
        } />
        <Route path="/compliance" element={
          <ProtectedRoute allowedRoles={['admin', 'manager']}>
            <Compliance />
          </ProtectedRoute>
        } />
        <Route path="/vendors" element={
          <ProtectedRoute allowedRoles={['admin', 'manager']}>
            <Vendors />
          </ProtectedRoute>
        } />
        <Route path="/trash" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Trash />
          </ProtectedRoute>
        } />
        <Route path="/settings" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Settings />
          </ProtectedRoute>
        } />
        <Route path="/change-password" element={
          <ProtectedRoute allowedRoles={['admin', 'manager', 'employee']}>
            <ChangePassword />
          </ProtectedRoute>
        } />
      </Routes>
    </Layout>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </>
  );
}

export default App;
