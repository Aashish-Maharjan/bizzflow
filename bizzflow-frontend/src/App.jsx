import Layout from './components/layout/Layout';
import { Sidebar } from './components/layout/Sidebar';
import { Topbar } from './components/layout/Topbar';
import Dashboard from './components/pages/Dashboard';


function App() {
  return (
    <Layout>
      <Dashboard/>
      <Sidebar/>
      <Topbar/>
    </Layout>
  );
}

export default App;
