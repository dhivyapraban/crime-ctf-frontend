import { Navigate } from 'react-router-dom';
import { type ReactNode, useEffect, useState } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
  redirectTo: string;
  requiredRole?: 'detective' | 'chief';
}

const ProtectedRoute = ({ children, redirectTo, requiredRole }: ProtectedRouteProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const token = localStorage.getItem('authToken');
  const userRole = localStorage.getItem('userRole');
  
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setIsAuthenticated(false);
        return;
      }

      // Check role mismatch before making API call
      if (requiredRole && userRole !== requiredRole) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userRole');
        setIsAuthenticated(false);
        return;
      }

      try {
        // Verify token with backend by trying to fetch profile
        const apiUrl = requiredRole === 'detective' || redirectTo.includes('detective')
          ? `${import.meta.env.VITE_API_URL}/api/detective/profile`
          : `${import.meta.env.VITE_API_URL}/api/chief/profile`;
          
        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });

        if (response.ok) {
          setIsAuthenticated(true);
        } else {
          // Token is invalid or expired
          localStorage.removeItem('authToken');
          localStorage.removeItem('userRole');
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Auth verification failed:', error);
        localStorage.removeItem('authToken');
        localStorage.removeItem('userRole');
        setIsAuthenticated(false);
      }
    };

    verifyToken();
  }, [token, redirectTo, requiredRole, userRole]);

  // Show loading state while verifying
  if (isAuthenticated === null) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-noir-dark">
        <div className="text-center">
          <div className="text-xl text-amber-100 font-serif">Verifying authentication...</div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
