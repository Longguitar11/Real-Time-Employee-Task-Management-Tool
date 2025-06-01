import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useEffect } from 'react'
import { SocketProvider } from './hooks/useSocket';
import LoginPage from './pages/auth/LoginPage'
import { useUserStore } from './stores/useUserStore'
import LoadingSpinner from './components/LoadingSpinner'
import VerificationPage from './pages/auth/VerificationPage'
import ManageEmployeePage from './pages/owner/ManageEmployeePage'
import ManageTaskPage from './pages/owner/ManageTaskPage'
import MessagePage from './pages/MessagePage'
import ProfilePage from './pages/employee/ProfilePage';
import TaskPage from './pages/employee/TaskPage';
import Layout from './pages/Layout';

function App() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { email } = useLocation().state || {};

  const { checkAuth, checkingAuth, user } = useUserStore()

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (!checkingAuth && !user && pathname !== "/login" && !email) navigate("/login")
  }, [user, checkingAuth]);

  if (checkingAuth) {
    return <LoadingSpinner />
  }

  return (
    <div className='font-[Open_Sans]'>
      <SocketProvider>
        <Routes>
          <Route path="/login" element={user ? <Navigate to="/" /> : <LoginPage />} />
          <Route path="/verify" element={user ? <Navigate to="/" /> : <VerificationPage />} />
          <Route path='/' element={<Layout />}>
            <Route index element={user?.role === "owner" ? <ManageEmployeePage /> : <TaskPage />} />
            <Route path="/manage-task" element={user?.role === "owner" && <ManageTaskPage />} />
            <Route path="/message" element={<MessagePage />} />
            <Route path="/profile" element={user?.role === "employee" && <ProfilePage />} />
            {/* <Route path="/task" element={user?.role === "employee" && <TaskPage />} /> */}
            <Route path='*' element={<Navigate to="/" />} />
          </Route>

        </Routes>

        <Toaster />
      </SocketProvider>
    </div>
  )
}

export default App
