import React, { useState, useEffect } from 'react';
import CasePopup from './CasePopup';
import dasImage from '../assets/images/das.png';
import { leaderboardAPI, casesAPI, gameAPI } from '../api/game';

interface Hint {
  id: string;
  text: string;
  pointDeduction: number;
  released: boolean;
}

interface Case {
  id: string;
  title: string;
  narrative: string;
  difficulty: string;
  points: number;
  status: 'locked' | 'unlocked' | 'solved';
  attachments?: Array<{ type: 'link' | 'file'; name: string; url?: string }>;
  hints?: Hint[];
}

interface LeaderboardEntry {
  rank: number;
  name: string;
  score: number;
  time: string;
}

const DetectiveDashboard: React.FC = () => {
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [mounted, setMounted] = useState(false);
  const [cases, setCases] = useState<Case[]>([]);
  const [contestEnded, setContestEnded] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Load initial timer from localStorage (set by Chief)
  useEffect(() => {
    const savedTimer = localStorage.getItem('gameTimer');
    if (savedTimer) {
      setTimeElapsed(parseInt(savedTimer));
    }
  }, []);

  // Fetch cases from backend API
  useEffect(() => {
    const fetchCases = async () => {
      try {
        const response = await casesAPI.getAll();
        if (response.success) {
          const mapped: Case[] = response.cases.map((c: any) => ({
            id: c._id,
            title: c.title,
            narrative: c.description || '',
            difficulty: c.difficulty,
            points: c.points,
            status: 'unlocked',
            attachments:
              c.attachmentType && (c.attachmentName || c.attachmentUrl)
                ? [
                    {
                      type: c.attachmentType,
                      name: c.attachmentName || 'Attachment',
                      url: c.attachmentUrl,
                    },
                  ]
                : [],
            hints: c.hints || [],
          }));
          setCases(mapped);
        }
      } catch (error) {
        console.error('Error fetching cases:', error);
      }
    };

    fetchCases();
    // Refresh cases every 2 seconds for near real-time updates
    const interval = setInterval(fetchCases, 2000);
    return () => clearInterval(interval);
  }, []);

  // Leaderboard data - fetched from backend
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [myScore, setMyScore] = useState(0);

  // Fetch leaderboard from API
  const fetchLeaderboard = async () => {
    try {
      const response = await leaderboardAPI.get();
      if (response.success) {
        setLeaderboard(response.leaderboard);
      }
      
      // Also fetch my own score
      const myScoreResponse = await leaderboardAPI.getMyScore();
      if (myScoreResponse.success) {
        setMyScore(myScoreResponse.score.score || 0);
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    }
  };

  useEffect(() => {
    fetchLeaderboard(); // Fetch once on mount
    // Auto-refresh leaderboard every 3 seconds for real-time sync
    const interval = setInterval(fetchLeaderboard, 3000);
    return () => clearInterval(interval);
  }, []);

  // Timer effect - syncs with backend game state
  useEffect(() => {
    const fetchTimer = async () => {
      try {
        const response = await gameAPI.getState();
        if (response.success) {
          setTimeElapsed(response.gameState.timerSeconds);
          setContestEnded(!response.gameState.contestStarted);
          localStorage.setItem('gameTimer', response.gameState.timerSeconds.toString());
        }
      } catch (error) {
        console.error('Error fetching game state:', error);
      }
    };

    // Load immediately on mount
    fetchTimer();

    // Poll backend for updates every 500ms for real-time sync
    const interval = setInterval(fetchTimer, 500);

    return () => {
      clearInterval(interval);
    };
  }, []);

  const formatTime = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCaseClick = (caseItem: Case) => {
    if (caseItem.status === 'unlocked') {
      setSelectedCase(caseItem);
    }
  };

  const formatLeaderboardTime = (timeString: string): string => {
    if (!timeString) return '-';
    const date = new Date(timeString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  };

  const solvedCases = cases.filter((c) => c.status === 'solved').length;
  return (
    <div className="w-screen h-screen relative overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${dasImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />
      
      {/* Subtle overlay for better contrast */}
      <div className="absolute inset-0 bg-black bg-opacity-20" />

      {/* Main Content Overlay */}
      <div className="relative w-screen h-screen flex flex-col z-10">
        {/* Top: Timer - Styled as desk clock/document */}
        <div className="bg-amber-900 bg-opacity-60 backdrop-blur-sm px-8 py-4 flex justify-center items-center border-b-4 border-amber-800 border-opacity-70 shadow-lg">
          <div className={`text-4xl font-mono font-bold text-amber-100 text-shadow-lg tracking-wider transition-all duration-500 ${
            mounted ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          } animate-timer-glow ${timeElapsed === 0 ? 'text-red-400' : ''}`}>
            ⏱️ {formatTime(timeElapsed)}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Center: Case Files Wall - Styled as investigation board */}
          <div className="flex-1 p-8 overflow-y-auto mx-auto max-w-7xl">
            <h2 className={`text-3xl font-serif font-bold text-amber-50 mb-6 text-shadow-lg text-center transition-all duration-700 ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
            }`}>
              CASE FILES
            </h2>
            
            {contestEnded && (
              <div className="mb-6 bg-red-900 bg-opacity-90 border-4 border-red-700 p-6 text-center shadow-2xl">
                <h3 className="text-2xl font-serif font-bold text-red-100 mb-2">
                  🚫 CONTEST ENDED 🚫
                </h3>
                <p className="text-red-200 font-serif">
                  The investigation has concluded. No more submissions are allowed.
                </p>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cases.map((caseItem, index) => (
                <div
                  key={caseItem.id}
                  onClick={() => !contestEnded && handleCaseClick(caseItem)}
                  className={`relative bg-gradient-to-b from-amber-50 to-amber-100 bg-opacity-75 border-4 p-6 transition-all duration-500 shadow-2xl ${
                    contestEnded || caseItem.status === 'locked'
                      ? 'border-gray-600 border-opacity-50 opacity-50 cursor-not-allowed'
                      : caseItem.status === 'solved'
                      ? 'border-green-600 border-opacity-70 hover:border-green-500 cursor-pointer'
                      : 'border-amber-800 border-opacity-70 hover:border-amber-900 hover:shadow-[0_0_30px_rgba(184,134,11,0.6)] cursor-pointer'
                  } ${
                    mounted ? 'opacity-100 scale-100 rotate-0' : 'opacity-0 scale-90 rotate-2'
                  }`}
                  style={{
                    transitionDelay: `${index * 100}ms`,
                    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255,255,255,0.3)',
                  }}
                >
                  {/* Paper texture */}
                  <div 
                    className="absolute inset-0 opacity-10 pointer-events-none"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='paper' width='100' height='100' patternUnits='userSpaceOnUse'%3E%3Cpath d='M 100 0 L 0 0 0 100' fill='none' stroke='%23000' stroke-width='0.5'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100' height='100' fill='url(%23paper)'/%3E%3C/svg%3E")`,
                    }}
                  />
                  
                  {/* Pushpin effect */}
                  <div className="absolute -top-2 left-4 w-4 h-4 bg-noir-red rounded-full shadow-lg border-2 border-amber-800"></div>
                  <div className="absolute top-2 left-4 w-0.5 h-3 bg-amber-800"></div>

                  <div className="text-center relative z-10">
                    <div className="text-6xl mb-4 animate-float-gentle">
                      {caseItem.status === 'locked' ? '🔒' : caseItem.status === 'solved' ? '✅' : '📁'}
                    </div>
                    <h3 className="text-xl font-serif font-bold text-amber-900 mb-2 text-shadow">
                      {caseItem.title}
                    </h3>
                    <p className="text-amber-700 mb-1 font-serif text-sm">
                      {caseItem.difficulty} - {caseItem.points} pts
                    </p>
                    {caseItem.hints && caseItem.hints.length > 0 && (
                      <p className="text-amber-700 font-serif text-xs">
                        Hints: {caseItem.hints.length}{' '}
                        {caseItem.hints.filter((h) => h.released).length === 0
                          ? '(locked by Chief)'
                          : `(${caseItem.hints.filter((h) => h.released).length} unlocked)`}
                      </p>
                    )}
                    {caseItem.status === 'solved' && (
                      <p className="text-green-600 font-bold font-serif">SOLVED</p>
                    )}
                    {caseItem.status === 'locked' && (
                      <p className="text-gray-500 font-serif">LOCKED</p>
                    )}
                  </div>

                  {/* Corner fold */}
                  <div className="absolute top-0 right-0 w-6 h-6 bg-amber-200 border-b-4 border-l-4 border-amber-600 transform rotate-45 translate-x-3 -translate-y-3 opacity-60"></div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Panel: Leaderboard - Styled as case file */}
          <div className={`w-80 bg-amber-50 bg-opacity-70 backdrop-blur-sm border-l-4 border-amber-800 border-opacity-70 p-6 overflow-y-auto shadow-2xl transition-all duration-700 ${
            mounted ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
          }`}>
            <div className="flex justify-between items-center mb-4 border-b-2 border-amber-700 pb-2">
              <h3 className="text-2xl font-serif font-bold text-amber-900 text-shadow">
                LEADERBOARD
              </h3>
              <button
                onClick={fetchLeaderboard}
                className="bg-amber-700 text-amber-50 font-serif text-xs font-bold px-2 py-1 hover:bg-amber-800 transition-all duration-200 border border-amber-900"
                title="Refresh leaderboard"
              >
                🔄
              </button>
            </div>
            <div className="bg-white bg-opacity-80 border-2 border-amber-700 border-opacity-70 shadow-inner">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-amber-800 bg-opacity-80">
                    <th className="px-2 py-2 text-amber-50 font-serif font-bold text-left">Rank</th>
                    <th className="px-2 py-2 text-amber-50 font-serif font-bold text-left">Name</th>
                    <th className="px-2 py-2 text-amber-50 font-serif font-bold text-left">Score</th>
                    <th className="px-2 py-2 text-amber-50 font-serif font-bold text-left">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map((entry) => (
                    <tr
                      key={entry.rank}
                      className={`border-b border-amber-300 border-opacity-50 ${
                        entry.name === 'You' ? 'bg-amber-200 bg-opacity-70 font-bold' : ''
                      }`}
                    >
                      <td className="px-2 py-2 text-amber-900 font-serif">{entry.rank}</td>
                      <td className="px-2 py-2 text-amber-900 font-serif">{entry.name}</td>
                      <td className="px-2 py-2 text-amber-900 font-serif">{entry.score}</td>
                      <td className="px-2 py-2 text-amber-900 font-mono text-xs">{formatLeaderboardTime(entry.time)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Bottom: Stats - Styled as desk notes */}
        <div className={`bg-amber-900 bg-opacity-60 backdrop-blur-sm px-8 py-4 flex justify-around items-center border-t-4 border-amber-800 border-opacity-70 shadow-lg transition-all duration-700 ${
          mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}>
          <div className="text-center">
            <div className="text-2xl font-serif font-bold text-amber-100 text-shadow">
              SOLVED CASES
            </div>
            <div className="text-4xl font-mono font-bold text-amber-50 mt-2">
              {solvedCases} / {cases.length}
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-serif font-bold text-amber-100 text-shadow">
              TOTAL SCORE
            </div>
            <div className="text-4xl font-mono font-bold text-amber-50 mt-2">
              {myScore}
            </div>
          </div>
        </div>
      </div>

      {/* Case Popup Modal */}
      {selectedCase && (
        <CasePopup 
          caseData={selectedCase} 
          onClose={() => setSelectedCase(null)} 
          onFlagSubmitted={fetchLeaderboard}
        />
      )}


      <style>{`
        @keyframes timer-glow {
          0%, 100% { text-shadow: 0 0 10px rgba(245, 245, 220, 0.5), 0 0 20px rgba(184, 134, 11, 0.3); }
          50% { text-shadow: 0 0 15px rgba(245, 245, 220, 0.8), 0 0 30px rgba(184, 134, 11, 0.5); }
        }
        .animate-timer-glow {
          animation: timer-glow 2s ease-in-out infinite;
        }
        @keyframes float-gentle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        .animate-float-gentle {
          animation: float-gentle 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default DetectiveDashboard;
