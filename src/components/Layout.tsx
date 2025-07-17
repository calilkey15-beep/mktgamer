import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Users, 
  DollarSign, 
  BarChart3, 
  Settings, 
  Menu,
  X,
  Bell,
  Building2
} from 'lucide-react';
import { useState } from 'react';
import NotificationCenter from './NotificationCenter';
import { useLoans } from '../hooks/useLoans';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const { loans } = useLoans();
  
  // Calculate notification count directly
  const getNotificationCount = () => {
    const today = new Date();
    return loans.filter(loan => {
      if (loan.status === 'paid') return false;
      const dueDate = new Date(loan.due_date);
      const daysUntilDue = Math.floor((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return daysUntilDue <= 3; // Show notification for loans due in 3 days or overdue
    }).length;
  };

  const menuItems = [
    { icon: BarChart3, label: 'Dashboard', path: '/dashboard' },
    { icon: Users, label: 'Clientes', path: '/clients' },
    { icon: DollarSign, label: 'Empréstimos', path: '/loans' },
    { icon: BarChart3, label: 'Relatórios', path: '/reports' },
    { icon: Settings, label: 'Configurações', path: '/settings' },
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
        >
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Notification button */}
      <div className="fixed top-4 right-4 z-50">
        <button
          onClick={() => setNotificationOpen(true)}
          className="relative p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
        >
          <Bell size={24} className="text-white" />
          {getNotificationCount() > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {getNotificationCount() > 9 ? '9+' : getNotificationCount()}
            </span>
          )}
        </button>
      </div>

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-40 w-64 bg-gray-800 transform transition-transform duration-300 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-blue-400">LoanSaaS</h1>
                <p className="text-gray-400 text-xs">Plataforma Multi-tenant</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <button
                  key={item.path}
                  onClick={() => {
                    navigate(item.path);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-700">
            <div className="text-center">
              <div className="bg-green-900/30 border border-green-500/50 rounded-lg p-3">
                <p className="text-green-400 font-medium text-sm">🚀 Sistema Ativo</p>
                <p className="text-gray-300 text-xs mt-1">Acesso direto habilitado</p>
                <p className="text-gray-400 text-xs">Multi-tenant SaaS</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="lg:ml-64 min-h-screen">
        <main className="p-6">
          {children}
        </main>
      </div>

      {/* Notification Center */}
      <NotificationCenter
        isOpen={notificationOpen}
        onClose={() => setNotificationOpen(false)}
      />
    </div>
  );
};

export default Layout;