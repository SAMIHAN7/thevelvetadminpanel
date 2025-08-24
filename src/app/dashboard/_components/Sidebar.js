'use client';
import { useState } from 'react';
import { 
  Menu, 
  Clock, 
  Calendar, 
  Users, 
  Gift, 
  LogOut, 
  ChevronLeft, 
  ChevronRight,
  Home
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCookies } from 'next-client-cookies';

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeItem, setActiveItem] = useState('Menu');
   const cookie = useCookies();
 const navigate = useRouter();
  const handleLogout = async () =>
    {
        console.log("Logging out...");
        cookie.remove('auth'); // Remove auth cookie
        cookie.remove('role'); // Remove role cookie
        navigate.replace("/"); // Redirect to login page
        console.log("Logged out successfully");
    }
 const menuItems = [
  {
    id: 'menu',
    name: 'Menu',
    icon: Menu,
    color: 'from-red-500 to-orange-500',
    hoverColor: 'hover:bg-red-500/10',
    activeColor: 'bg-red-500/20 border-red-500/50'
  },
  {
    id: 'hpyhrs',
    name: 'Happy Hours',
    icon: Clock,
    color: 'from-orange-500 to-yellow-500',
    hoverColor: 'hover:bg-orange-500/10',
    activeColor: 'bg-orange-500/20 border-orange-500/50'
  },
  {
    id: 'events',
    name: 'Events',
    icon: Calendar,
    color: 'from-yellow-500 to-green-500',
    hoverColor: 'hover:bg-yellow-500/10',
    activeColor: 'bg-yellow-500/20 border-yellow-500/50'
  },
  {
    id: 'customers',
    name: 'Customers',
    icon: Users,
    color: 'from-green-500 to-red-500',
    hoverColor: 'hover:bg-green-500/10',
    activeColor: 'bg-green-500/20 border-green-500/50'
  },
  {
    id: 'offers',
    name: 'Offers',
    icon: Gift,
    color: 'from-red-500 to-yellow-500',
    hoverColor: 'hover:bg-red-500/10',
    activeColor: 'bg-red-500/20 border-red-500/50'
  },
  {
    id: 'gallery',
    name: 'Gallery',
    icon: Home, // Replace with better icon if needed
    color: 'from-green-500 to-yellow-500',
    hoverColor: 'hover:bg-green-500/10',
    activeColor: 'bg-green-500/20 border-green-500/50'
  }
];


  const handleItemClick = (itemName) => {
    navigate.push(`/dashboard/${itemName.toLowerCase()}`);
    setActiveItem(itemName);
  };



  return (
    <div className={`${isCollapsed ? 'w-16' : 'w-64'} bg-gray-900 border-r border-gray-700 flex flex-col transition-all duration-300 ease-in-out`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-red-500 via-orange-500 to-yellow-500 rounded-full flex items-center justify-center">
                <div className="w-6 h-6 bg-gradient-to-br from-yellow-400 to-green-500 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-gray-900">TVL</span>
                </div>
              </div>
              <div>
                <h2 className="text-white font-semibold text-sm">Admin Panel</h2>
                <p className="text-gray-400 text-xs">Dashboard</p>
              </div>
            </div>
          )}
          
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
          >
            {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeItem === item.name;
          
          return (
            <button
              key={item.name}
              onClick={() => handleItemClick(item.id)}
              className={`w-full flex items-center space-x-3 px-3 py-3 rounded-lg transition-all duration-200 border border-transparent ${
                isActive 
                  ? item.activeColor 
                  : `${item.hoverColor} hover:border-gray-600`
              } group`}
            >
              <div className={`p-2 rounded-lg bg-gradient-to-r ${item.color} ${isActive ? 'shadow-lg' : 'shadow-md'} transition-all duration-200`}>
                <Icon size={16} className="text-white" />
              </div>
              
              {!isCollapsed && (
                <div className="flex-1 text-left">
                  <span className={`font-medium transition-colors ${
                    isActive ? 'text-white' : 'text-gray-300 group-hover:text-white'
                  }`}>
                    {item.name}
                  </span>
                </div>
              )}
              
              {!isCollapsed && isActive && (
                <div className="w-2 h-2 bg-gradient-to-r from-orange-400 to-yellow-400 rounded-full animate-pulse"></div>
              )}
            </button>
          );
        })}
      </nav>

      {/* User Profile Section */}
      <div className="p-4 border-t border-gray-700">
        {/* {!isCollapsed && (
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-yellow-500 rounded-full flex items-center justify-center">
              <span className="text-xs font-bold text-gray-900">JD</span>
            </div>
            <div className="flex-1">
              <p className="text-white text-sm font-medium">John Doe</p>
              <p className="text-gray-400 text-xs">Administrator</p>
            </div>
          </div>
        )} */}
        
        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 px-3 py-3 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all duration-200 group"
        >
          <div className="p-2 rounded-lg bg-gradient-to-r from-red-500 to-red-600 shadow-md transition-all duration-200">
            <LogOut size={16} className="text-white" />
          </div>
          
          {!isCollapsed && (
            <span className="font-medium">Logout</span>
          )}
        </button>
      </div>

      {/* Animated Background Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-2 w-32 h-32 bg-gradient-to-r from-red-500/5 to-orange-500/5 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-2 w-24 h-24 bg-gradient-to-r from-yellow-500/5 to-green-500/5 rounded-full blur-2xl animate-pulse delay-1000"></div>
      </div>
    </div>
  );
}