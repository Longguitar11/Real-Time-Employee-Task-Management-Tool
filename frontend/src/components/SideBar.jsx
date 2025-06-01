import React, { useEffect, useState } from 'react'
import { SIDEBAR_EMPLOYEE_ITEMS, SIDEBAR_OWNER_ITEMS } from '../constants/sideBar';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import useUserStore from '../stores/useUserStore';

const SideBar = () => {
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const { user } = useUserStore()
    const [activeTab, setActiveTab] = useState(pathname || '/');


    const handleTabClick = (path) => {
        setActiveTab(path);
        navigate(path);
    }

    useEffect(() => {
        setActiveTab(pathname);
    }, [pathname]);

    return (
        <div className='fixed top-20 left-0 z-50 w-64 h-[calc(100vh-80px)] p-4 space-y-1'>
            {
                (user?.role === "owner" ?
                    SIDEBAR_OWNER_ITEMS : SIDEBAR_EMPLOYEE_ITEMS).map(item => (
                        <Link to={item.path} key={item.name} onClick={() => handleTabClick(item.path)} className={`block px-4 py-2 rounded hover:bg-blue-200 transition-colors duration-200 ${activeTab === item.path ? 'bg-blue-400 text-white' : ''}`}>
                            {item.name}
                        </Link>
                    ))

            }
        </div>
    )
}

export default SideBar