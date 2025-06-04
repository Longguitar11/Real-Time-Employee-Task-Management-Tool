import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CircleUserRoundIcon } from "lucide-react";
import useUserStore from '../stores/useUserStore';

const Header = () => {
  const navigate = useNavigate()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const { logout, user } = useUserStore()

  const onProfileClick = () => {
    setIsDropdownOpen(false);
    navigate('/profile');
  };

  return (
    <div className='h-20 fixed top-0 left-0 z-10 w-full flex justify-between items-center p-4 bg-white border-b-2 border-gray-100'>
      <div className='flex items-center gap-2'>
        <div className='w-2 h-8 bg-gradient-to-b from-blue-500 to-blue-700 rounded-full'></div>
        <h1 className='text-lg font-bold text-gray-600 tracking-tight whitespace-nowrap'>
          Employee Task Management
        </h1>
      </div>
      <div className='flex justify-end items-center gap-4 px-4'>
        <div className='space-y-1 text-end'>
          <p className='font-medium text-sm text-gray-600'>{user?.name}</p>
          <p className='text-xs font-light text-blue-600 capitalize'>{user?.role}</p>
        </div>

        <div className='relative'
          onMouseEnter={() => setIsDropdownOpen(true)}
          onMouseLeave={() => setIsDropdownOpen(false)}
        >
          <CircleUserRoundIcon className='cursor-pointer w-8 h-8 text-gray-600 shadow rounded-full' />
          {
            isDropdownOpen && (
              <div className='absolute top-8 right-0 bg-gray-50 text-gray-700 text-center cursor-pointer rounded shadow-lg overflow-hidden'>
                <p className='cursor-pointer px-3 py-2 hover:bg-blue-100 hover:text-blue-500 transition-colors duration-200' onClick={onProfileClick}>Profile</p>
                <p className='cursor-pointer px-3 p-2 hover:bg-blue-100 hover:text-blue-500 transition-colors duration-200' onClick={logout}>Logout</p>
              </div>
            )
          }
        </div>
      </div>
    </div>
  )
}

export default Header