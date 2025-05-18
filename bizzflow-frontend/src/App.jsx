// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './components/pages/Dashboard';
import Tasks from './components/pages/Tasks';
import Compliance from './components/pages/Compliance';
import Vendors from './components/pages/Vendors';
import Settings from './components/pages/Settings';
import Payroll from './components/pages/Payroll';

function App() {
  return (
      <Layout>
        <Routes>
        <Route path="/" element={<Dashboard />} />
  <Route path="/tasks" element={<Tasks />} />
  <Route path="/payroll" element={<Payroll />} />
  <Route path="/compliance" element={<Compliance />} />
  <Route path="/vendors" element={<Vendors />} />
  <Route path="/settings" element={<Settings />} />
        </Routes>
      </Layout>
  );
}

export default App;
