import './App.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { Provider } from 'react-redux'
import { store } from './redux/store'
import Home from './components/Home';
import Login from './components/auth/Login';
import Signup from './components/auth/Signup';
import PanSubmission from './components/PanSubmission';
import AdminDashboard from './components/AdminDashboard';
import SubAdminManagement from './components/SubAdminManagement';
import SubAdminDashboard from './components/SubAdminDashboard';
import useAuth from './hooks/useAuth';

// Error Boundary Component
const ErrorBoundary = ({ error }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Something went wrong!</h1>
        <p className="text-gray-600 mb-4">{error?.message || 'An unexpected error occurred'}</p>
        <button 
          onClick={() => window.location.href = '/'}
          className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg"
        >
          Go to Home
        </button>
      </div>
    </div>
  );
};

const router = createBrowserRouter([
  {
    path: '/',
    element: <Home />,
    errorElement: <ErrorBoundary />
  },
  {
    path: '/login',
    element: <Login />,
    errorElement: <ErrorBoundary />
  },
  {
    path: '/signup',
    element: <Signup />,
    errorElement: <ErrorBoundary />
  },
  {
    path: '/pan-submission',
    element: <PanSubmission />,
    errorElement: <ErrorBoundary />
  },
  {
    path: '/admin/dashboard',
    element: <AdminDashboard />,
    errorElement: <ErrorBoundary />
  },
  {
    path: '/subadmin-management',
    element: <SubAdminManagement />,
    errorElement: <ErrorBoundary />
  },
  {
    path: '/subadmin/dashboard',
    element: <SubAdminDashboard />,
    errorElement: <ErrorBoundary />
  }
]);

function AppContent() {
  useAuth(); // Check authentication on app load
  
  return (
    <div>
      <RouterProvider router={router} />
    </div>
  );
}

function App() {

  return (
    <>
      <Provider store={store}>
        <AppContent />
      </Provider>
    </>
  )
}

export default App
