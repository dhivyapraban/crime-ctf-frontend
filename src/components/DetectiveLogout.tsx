import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { detectiveAPI } from '../api/auth';

const DetectiveLogout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const performLogout = async () => {
      await detectiveAPI.logout(navigate);
    };
    
    performLogout();
  }, [navigate]);

  return (
    <div className="w-screen h-screen flex items-center justify-center bg-gray-900">
      <div className="text-white text-xl">Logging out...</div>
    </div>
  );
};

export default DetectiveLogout;
