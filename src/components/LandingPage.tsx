import React from 'react';
import { useNavigate } from 'react-router-dom';
import crimeSceneImage from '../assets/images/crimescene.jpeg';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  const handleEnter = () => {
    navigate('/role-selection');
  };

  return (
    <div className="relative w-screen h-screen bg-noir-dark overflow-hidden flex items-center justify-center">
      {/* Crime Scene Background Image */}
      <div 
        className="absolute inset-0 bg-noir-brown"
        style={{
          backgroundImage: `url(${crimeSceneImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />
      {/* Dark overlay for better contrast */}
      <div className="absolute inset-0 bg-black bg-opacity-40" />

      {/* Enter Button - Styled as Dark Evidence Marker/Case File */}
      <button
        onClick={handleEnter}
        className="relative z-30 group cursor-pointer"
      >
        {/* Dark Case File Background */}
        <div className="relative bg-gradient-to-b from-noir-brown via-[#1a0f0a] to-noir-brown border-4 border-noir-red px-12 py-8 shadow-2xl transform transition-all duration-500 hover:scale-110 hover:rotate-1 group-hover:shadow-[0_0_50px_rgba(139,0,0,0.8)] group-hover:border-noir-red-light backdrop-blur-sm bg-opacity-90">
          {/* Aged paper texture effect */}
          <div className="absolute inset-0 opacity-5 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')]"></div>
          
          {/* Evidence marker badge - like the ones in the crime scene */}
          <div className="absolute -top-5 -left-5 w-12 h-12 bg-noir-red rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg animate-pulse border-2 border-noir-red-light">
            !
          </div>
          
          {/* Case file label */}
          <div className="relative z-10">
            <div className="text-noir-beige-dark text-xs font-mono mb-2 tracking-widest uppercase opacity-60">
              Case File #001
            </div>
            <div className="text-noir-beige text-4xl font-serif font-bold tracking-wide mb-2 group-hover:text-white transition-colors text-shadow-lg">
            Click Here
            </div>
            <div className="text-noir-beige-dark text-sm font-mono italic opacity-70">
              Click to begin investigation
            </div>
          </div>
          
          {/* Red stamp effect - darker */}
          <div className="absolute bottom-3 right-3 text-noir-red text-xs font-mono font-bold opacity-40 transform rotate-12 border border-noir-red px-2 py-1">
            CLASSIFIED
          </div>
          
          {/* Subtle corner wear effect */}
          <div className="absolute top-0 right-0 w-6 h-6 bg-black opacity-30 transform rotate-45 translate-x-3 -translate-y-3"></div>
        </div>
        
        {/* Red glow effect on hover - matches crime scene lighting */}
        <div className="absolute inset-0 bg-noir-red opacity-0 group-hover:opacity-25 blur-2xl -z-10 transition-opacity duration-500 rounded-lg"></div>
        
        {/* Subtle pulse ring animation on hover - red theme */}
        <div className="absolute -inset-6 border-2 border-noir-red opacity-0 group-hover:opacity-30 rounded-lg animate-ping"></div>
        
        {/* Continuous subtle red glow - like evidence marker glow */}
        <div className="absolute -inset-2 border border-noir-red opacity-10 rounded-lg animate-pulse"></div>
      </button>
    </div>
  );
};

export default LandingPage;
