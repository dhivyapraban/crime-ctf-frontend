import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { chiefAPI } from '../api/auth';

const ChiefLogout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const performLogout = async () => {
      await chiefAPI.logout(navigate);
    };
    
    performLogout();
  }, [navigate]);

  return (
    <div className="w-screen h-screen flex items-center justify-center bg-gray-900">
      <div className="text-white text-xl">Logging out...</div>
    </div>
  );
};

export default ChiefLogout;
