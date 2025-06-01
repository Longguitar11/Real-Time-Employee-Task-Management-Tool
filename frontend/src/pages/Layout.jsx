import React from 'react'
import { Outlet } from 'react-router-dom'
import Header from '../components/Header'
import SideBar from '../components/SideBar'

const Layout = () => {
  return (
    <div>
        <Header />
        <SideBar />
        <div className='w-[calc(100vw-256px)] h-[calc(100vh-80px)] absolute -z-10 top-20 left-64 p-4 border-t-[0.5px] border-l-[0.5px] border-gray-300 rounded-2xl'>
            <Outlet />
        </div>
    </div>
  )
}

export default Layout;