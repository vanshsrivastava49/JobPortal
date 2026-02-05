import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // ✅ Wait until auth state is known
    if (!isAuthenticated) {
      navigate('/login', { replace: true });
      return;
    }

    if (!user || !user.role) return;

    // ✅ Role-based redirect
    const routes = {
      jobseeker: '/jobseeker/dashboard',
      recruiter: '/recruiter/dashboard',
      business: '/business/dashboard',
      admin: '/admin/dashboard'
    };

    const targetRoute = routes[user.role];

    if (targetRoute) {
      navigate(targetRoute, { replace: true });
    } else {
      navigate('/login', { replace: true });
    }

  }, [user, isAuthenticated, navigate]);

  return (
    <div style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100vh",
      fontSize: "18px",
      color: "#6b7280"
    }}>
      Redirecting...
    </div>
  );
};

export default Dashboard;
