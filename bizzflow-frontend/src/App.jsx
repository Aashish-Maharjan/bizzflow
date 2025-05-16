import Layout from './components/layout/Layout';
import Dashboard from './components/pages/Dashboard';
import Tasks from './components/pages/Tasks';


function App() {
  return (
    <Layout>
      <Dashboard/>
      <Tasks/>
    </Layout>
  );
}

export default App;
