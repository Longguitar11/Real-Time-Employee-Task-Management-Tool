import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BellIcon, CircleUserRoundIcon } from "lucide-react";
import useUserStore from '../stores/useUserStore';

const Header = () => {
  const navigate = useNavigate()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const { logout, user } = useUserStore()

  const onProfileClick = () => {
    setIsDropdownOpen(false);
    navigate('/profile');
  };

  // Prevent dropdown from closing when clicking inside it
  const handleDropdownClick = (e) => {
    e.stopPropagation();
  };

  return (
    <div className='h-20 fixed top-0 left-0 w-full flex items-center justify-end p-4'>
      <div className='flex items-center gap-4 px-4 relative'>
        <CircleUserRoundIcon className='cursor-pointer w-8 h-8 text-gray-600 shadow rounded-full' onClick={() => setIsDropdownOpen(!isDropdownOpen)} />
        {
          isDropdownOpen && (
            <div className='absolute top-10 right-0 bg-gray-50 text-black cursor-pointer rounded shadow-lg overflow-hidden'
              onClick={handleDropdownClick}>
              {user?.role === "employee" && <p className='cursor-pointer p-2 hover:bg-blue-200 transition-colors duration-200' onClick={onProfileClick}>Profile</p>}
              <p className='cursor-pointer p-2 hover:bg-blue-200 transition-colors duration-200' onClick={logout}>Logout</p>
            </div>
          )
        }
      </div>
    </div>
  )
}

export default Header