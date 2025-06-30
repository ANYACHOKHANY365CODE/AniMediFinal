import React from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import { Heart, Stethoscope, Users, User } from 'lucide-react';
import AIAssistant from './AIAssistant';

const DashboardLayout: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', icon: Heart, label: 'Dashboard' },
    { path: '/healthcare', icon: Stethoscope, label: 'Healthcare' },
    { path: '/medicare', icon: Heart, label: 'Medicare' },
    { path: '/profile', icon: User, label: 'Profile' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <main style={{ flex: 1, paddingBottom: '80px' }}>
        <Outlet />
      </main>
      
      <AIAssistant />
      
      <nav style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#FFFFFF',
        borderTop: '1px solid #E5E7EB',
        padding: '8px 0',
        height: '60px',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        zIndex: 1000,
        boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.1)'
      }}>
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const IconComponent = item.icon;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textDecoration: 'none',
                color: isActive ? '#8B5CF6' : '#9CA3AF',
                fontSize: '12px',
                fontWeight: '600',
                fontFamily: 'Nunito',
                transition: 'color 0.3s ease'
              }}
            >
              <IconComponent size={24} />
              <span style={{ marginTop: '4px' }}>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default DashboardLayout;