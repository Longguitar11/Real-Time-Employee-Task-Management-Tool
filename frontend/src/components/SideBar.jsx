import { CircleArrowLeft } from 'lucide-react';
import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { SIDEBAR_EMPLOYEE_ITEMS, SIDEBAR_OWNER_ITEMS } from '../constants/sideBar';
import useUserStore from '../stores/useUserStore';

const SideBar = ({ onHideSidebarClick, className }) => {
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
        <div className={`fixed top-20 left-0 z-20 bg-white w-56 md:w-64 h-[calc(100vh-80px)] flex flex-col justify-between p-4 border-r-2 border-gray-200 whitespace-nowrap ${className}`}>
            <div className='space-y-1'>
                {
                    (user?.role === "owner" ?
                        SIDEBAR_OWNER_ITEMS : SIDEBAR_EMPLOYEE_ITEMS).map(item => (
                            <Link to={item.path} key={item.name} onClick={() => handleTabClick(item.path)} className={`block px-4 py-2 rounded hover:bg-blue-100 hover:text-blue-500 transition-colors duration-200 ${activeTab === item.path ? 'bg-blue-400 text-white' : ''}`}>
                                {item.name}
                            </Link>
                        )
                        )
                }
            </div>


            <button onClick={onHideSidebarClick} className='rounded-2xl flex justify-center items-center gap-2 cursor-pointer p-3 border-2 border-gray-100 text-gray-500 text-center hover:border-blue-100 hover:text-blue-500 transition-colors duration-200'>
                <CircleArrowLeft className='w-8 h-8' />
                Hide Sidebar
            </button>
        </div>
    )
}

export default SideBar