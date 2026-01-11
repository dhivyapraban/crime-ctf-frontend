import React from 'react';
import { useNavigate } from 'react-router-dom';
import doorImage from '../assets/images/door.jpeg';

const RoleSelection: React.FC = () => {
  const navigate = useNavigate();

  const handleDoorClick = (role: 'detective' | 'chief') => {
    sessionStorage.setItem('role', role);
    
    if (role === 'detective') {
      navigate('/detective-login');
    } else {
      navigate('/chief-login');
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${doorImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />

      {/* Detective Door - Left - Transparent Clickable Box */}
      <div
        className="absolute left-[12%] top-[15%] w-[38%] h-[70%] cursor-pointer"
        onClick={() => handleDoorClick('detective')}
      />

      {/* Chief Door - Right - Transparent Clickable Box */}
      <div
        className="absolute right-[12%] top-[15%] w-[38%] h-[70%] cursor-pointer"
        onClick={() => handleDoorClick('chief')}
      />
    </div>
  );
};

export default RoleSelection;
