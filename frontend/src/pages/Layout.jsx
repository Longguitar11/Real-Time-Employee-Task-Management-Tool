import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { CircleArrowRight } from 'lucide-react'
import Header from '../components/Header'
import SideBar from '../components/SideBar'

const Layout = () => {
  const [isSidebarHidden, setIsSidebarHidden] = useState(localStorage.getItem('isSidebarHidden') || false);
  const onHideSidebarClick = () => {
    setIsSidebarHidden(!isSidebarHidden);
    localStorage.setItem('isSidebarHidden', !isSidebarHidden);
  }

  return (
    <div>
      <Header />
      <SideBar 
        className={`transition-transform duration-300 ease-in-out ${isSidebarHidden ? '-translate-x-full' : 'translate-x-0'}`} 
        onHideSidebarClick={onHideSidebarClick} 
      />

      <div className={`h-[calc(100vh-80px)] overflow-y-auto mt-20 p-4 transition-discrete duration-300 ease-in-out ${isSidebarHidden ? 'w-full ml-0' : 'w-[calc(100vw-224px)] md:w-[calc(100vw-256px)] ml-56 md:ml-64'}`}>
        <Outlet />
      </div>

      {
        isSidebarHidden &&
        <CircleArrowRight onClick={onHideSidebarClick} className='fixed bottom-5 left-5 w-14 h-14 text-blue-500/50 hover:opacity-80 transition-opacity duration-200 cursor-pointer z-10 animate-fade-in' />
      }
    </div>
  )
}

export default Layout;