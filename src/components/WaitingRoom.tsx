import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { gameAPI } from '../api/game';

const WaitingRoom: React.FC = () => {
  const navigate = useNavigate();

  const checkGameState = async () => {
    try {
      const response = await gameAPI.getState();
      if (response.success && response.gameState.contestStarted) {
        navigate('/detective-dashboard');
      }
    } catch (error) {
      console.error('Error checking game state:', error);
    }
  };

  useEffect(() => {
    checkGameState();
    // Poll every 2 seconds to check if contest has started
    const interval = setInterval(checkGameState, 2000);

    return () => clearInterval(interval);
  }, [navigate]);

  return (
    <div className="w-screen h-screen bg-noir-dark flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-5xl font-serif font-bold text-noir-beige mb-8 text-shadow-lg animate-pulse-slow">
          WAITING FOR MISSION TO BEGIN...
        </h1>
        <div className="flex justify-center items-center space-x-2">
          <div className="w-3 h-3 bg-noir-red rounded-full animate-pulse"></div>
          <div className="w-3 h-3 bg-noir-red rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-3 h-3 bg-noir-red rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
        </div>
        <button
          onClick={checkGameState}
          className="mt-6 px-6 py-3 bg-amber-800 text-amber-50 font-serif font-bold border-2 border-amber-900 hover:bg-amber-900 transition-all duration-300"
        >
          REFRESH STATUS
        </button>
      </div>
    </div>
  );
};

export default WaitingRoom;
