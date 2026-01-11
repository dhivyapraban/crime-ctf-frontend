import React, { useState, useEffect } from 'react';
import chiefImage from '../assets/images/chief.png';
import { leaderboardAPI, casesAPI, gameAPI } from '../api/game';

interface Case {
  id: string;
  _id?: string;
  title: string;
  description: string;
  difficulty: string;
  points: number;
  flag: string;
  // Admin-configured hints for this case
  hints?: Hint[];
  attachmentType?: 'file' | 'link';
  attachmentName?: string;
  attachmentUrl?: string;
}

interface Hint {
  id: string;
  _id?: string;
  text: string;
  type?: string;
  pointDeduction: number;
  released: boolean;
}

interface LeaderboardEntry {
  rank: number;
  name: string;
  score: number;
  time: string;
  solvedCount?: number;
  lastUpdated?: string;
}

const ChiefDashboard: React.FC = () => {
  // Timer state - countdown mode (initialize from localStorage for cross-tab sync)
  const getInitialTimer = () => {
    const savedTimer = localStorage.getItem('gameTimer');
    return savedTimer ? parseInt(savedTimer) : 0;
  };
  const getInitialRunning = () => {
    return localStorage.getItem('timerRunning') === 'true';
  };
  const getInitialContestStarted = () => {
    return localStorage.getItem('contestStarted') === 'true';
  };

  const [contestStarted, setContestStarted] = useState(getInitialContestStarted);
  const [timerRunning, setTimerRunning] = useState(getInitialRunning);
  const [timerSeconds, setTimerSeconds] = useState(getInitialTimer); // Remaining time in seconds
  const [cases, setCases] = useState<Case[]>([]);

  // Fetch cases from backend on mount
  useEffect(() => {
    const fetchCases = async () => {
      try {
        const response = await casesAPI.getAll();
        if (response.success) {
          // Map _id to id for consistency
          const mapped = response.cases.map((c: any) => ({
            ...c,
            id: c._id
          }));
          setCases(mapped);
        }
      } catch (error) {
        console.error('Error fetching cases:', error);
      }
    };
    fetchCases();
  }, []);

  const [showAddCaseModal, setShowAddCaseModal] = useState(false);
  const [newCase, setNewCase] = useState<{
    title: string;
    description: string;
    points: number;
    flag: string;
    attachmentType: 'file' | 'link';
    attachmentName: string;
    attachmentUrl: string;
    attachmentFile: File | null;
  }>({
    title: '',
    description: '',
    points: 100,
    flag: '',
    attachmentType: 'link',
    attachmentName: '',
    attachmentUrl: '',
    attachmentFile: null,
  });
  const [newCaseHints, setNewCaseHints] = useState<Hint[]>([]);

  // Leaderboard data - fetched from backend
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  // Fetch leaderboard from API
  const fetchLeaderboard = async () => {
    try {
      const response = await leaderboardAPI.get();
      if (response.success) {
        setLeaderboard(response.leaderboard);
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

  // Fetch game state from backend on mount
  useEffect(() => {
    const fetchGameState = async () => {
      try {
        const response = await gameAPI.getState();
        if (response.success) {
          const { contestStarted, timerRunning, timerSeconds } = response.gameState;
          setContestStarted(contestStarted);
          setTimerRunning(timerRunning);
          setTimerSeconds(timerSeconds);
          localStorage.setItem('contestStarted', contestStarted.toString());
          localStorage.setItem('timerRunning', timerRunning.toString());
          localStorage.setItem('gameTimer', timerSeconds.toString());
        }
      } catch (error) {
        console.error('Error fetching game state:', error);
      }
    };
    fetchGameState();
  }, []);

  // Timer effect - fetch updates from backend (backend now handles countdown)
  useEffect(() => {
    if (!contestStarted) return;
    
    // Poll backend every second for timer updates
    const interval = setInterval(async () => {
      try {
        const response = await gameAPI.getState();
        if (response.success) {
          setTimerSeconds(response.gameState.timerSeconds);
          setContestStarted(response.gameState.contestStarted);
          setTimerRunning(response.gameState.timerRunning);
          localStorage.setItem('gameTimer', response.gameState.timerSeconds.toString());
          localStorage.setItem('contestStarted', response.gameState.contestStarted.toString());
          localStorage.setItem('timerRunning', response.gameState.timerRunning.toString());
        }
      } catch (error) {
        console.error('Error fetching game state:', error);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [contestStarted]);

  // Save timer state to localStorage whenever it changes (for initial set and manual changes)
  useEffect(() => {
    localStorage.setItem('gameTimer', timerSeconds.toString());
    localStorage.setItem('timerRunning', timerRunning.toString());
    localStorage.setItem('contestStarted', contestStarted.toString());
  }, [timerSeconds, timerRunning, contestStarted]);

  // Cases are now persisted to backend automatically via API calls

  const handleStartContest = async () => {
    if (timerSeconds > 0) {
      try {
        const response = await gameAPI.startContest(timerSeconds);
        if (response.success) {
          setContestStarted(true);
          setTimerRunning(true);
          localStorage.setItem('contestStarted', 'true');
          localStorage.setItem('timerRunning', 'true');
        }
      } catch (error) {
        console.error('Error starting contest:', error);
        alert('Failed to start contest. Please try again.');
      }
    } else {
      alert('Please set a timer duration before starting the contest');
    }
  };

  const handleEndContest = async () => {
    try {
      const response = await gameAPI.stopContest();
      if (response.success) {
        setContestStarted(false);
        setTimerRunning(false);
        setTimerSeconds(0);
        localStorage.setItem('contestStarted', 'false');
        localStorage.setItem('timerRunning', 'false');
        localStorage.setItem('gameTimer', '0');
      }
    } catch (error) {
      console.error('Error ending contest:', error);
      alert('Failed to end contest. Please try again.');
    }
  };

  const handleAddTime = (minutes: number) => {
    const secondsToAdd = minutes * 60;
    setTimerSeconds((prev) => {
      const newTime = prev + secondsToAdd;
      localStorage.setItem('gameTimer', newTime.toString());
      return newTime;
    });
  };

  const handleSetTime = (minutes: number) => {
    const seconds = minutes * 60;
    setTimerSeconds(seconds);
    localStorage.setItem('gameTimer', seconds.toString());
  };

  const formatTime = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAddCase = async () => {
    // Validate required fields
    if (!newCase.title.trim()) {
      alert('Please enter a Title');
      return;
    }
    if (!newCase.flag.trim()) {
      alert('Please enter a Flag');
      return;
    }

    // Determine difficulty based on points
    let difficulty = 'Easy';
    if (newCase.points >= 300) {
      difficulty = 'Hard';
    } else if (newCase.points >= 150) {
      difficulty = 'Medium';
    }

    try {
      // Send case to backend API
      const caseData = {
        title: newCase.title.trim(),
        description: newCase.description.trim(),
        difficulty: difficulty,
        points: parseInt(newCase.points.toString()) || 100,
        flag: newCase.flag.trim(),
        attachmentType: newCase.attachmentType,
        attachmentName: newCase.attachmentName.trim() || undefined,
        attachmentUrl: newCase.attachmentUrl.trim() || undefined,
        hints: newCaseHints
          .filter((h) => h.text.trim() !== '') // Only include hints with text
          .map((h) => ({
            text: h.text.trim(),
            pointDeduction: h.pointDeduction,
            released: false,
          })),
      };

      const response = await casesAPI.add(caseData);

      if (response.success) {
        // Add to local cases list
        setCases([...cases, response.case]);

        // Reset form
        setNewCase({
          title: '',
          description: '',
          points: 100,
          flag: '',
          attachmentType: 'link',
          attachmentName: '',
          attachmentUrl: '',
          attachmentFile: null,
        });
        setNewCaseHints([]);

        // Close modal and show success
        setShowAddCaseModal(false);
        alert(`Case "${response.case.title}" uploaded to database successfully!`);
      }
    } catch (error: any) {
      console.error('Error adding case:', error);
      alert('Failed to add case: ' + error.message);
    }
  };

  const handleRemoveCase = async (id: string) => {
    if (window.confirm('Are you sure you want to remove this case?')) {
      try {
        const response = await casesAPI.delete(id);
        if (response.success) {
          setCases(cases.filter((c) => {
            const caseId = (c as any)._id || c.id;
            return caseId !== id;
          }));
        }
      } catch (error) {
        console.error('Error deleting case:', error);
        alert('Failed to delete case');
      }
    }
  };

  const handleDownloadCSV = () => {
    // Generate CSV from actual leaderboard data
    const headers = 'Rank,Detective Name,Score,Cases Solved,Last Updated\n';
    const rows = leaderboard.map(entry => 
      `${entry.rank},"${entry.name}",${entry.score},${entry.solvedCount || 0},${entry.lastUpdated ? new Date(entry.lastUpdated).toLocaleString() : 'N/A'}`
    ).join('\n');
    
    const csvContent = headers + rows;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leaderboard_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
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

  return (
    <div className="w-screen h-screen relative overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${chiefImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />
      
      {/* Subtle overlay for better contrast */}
      <div className="absolute inset-0 bg-black bg-opacity-20" />

      {/* Main Content Overlay */}
      <div className="relative w-screen h-screen flex flex-col z-10">
        {/* Header */}
        <div className="bg-amber-900 bg-opacity-60 backdrop-blur-sm px-8 py-6 border-b-4 border-amber-800 border-opacity-70 shadow-lg">
          <h1 className="text-4xl font-serif font-bold text-amber-100 text-shadow-lg text-center">
            CHIEF DASHBOARD - ADMIN CONTROL
          </h1>
        </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Timer Control Section */}
          <div className="bg-amber-50 bg-opacity-70 backdrop-blur-sm border-4 border-amber-800 border-opacity-70 p-6 shadow-2xl">
            <h2 className="text-3xl font-serif font-bold text-amber-900 mb-4 text-shadow">
              COUNTDOWN TIMER CONTROL
            </h2>
            <div className="space-y-4">
              {/* Timer Display */}
              <div className="bg-white bg-opacity-80 border-2 border-amber-700 border-opacity-70 p-6 text-center shadow-inner">
                <div className={`text-5xl font-mono font-bold mb-2 ${timerSeconds === 0 && contestStarted ? 'text-red-600' : 'text-amber-900'}`}>
                  {formatTime(timerSeconds)}
                </div>
                <div className="text-amber-700 text-sm font-serif">
                  Status: <span className={contestStarted ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>
                    {contestStarted ? 'CONTEST RUNNING' : 'CONTEST STOPPED'}
                  </span>
                </div>
              </div>

              {/* Manual Time Setting */}
              <div className="bg-white bg-opacity-60 border-2 border-amber-700 border-opacity-50 p-4">
                <h3 className="text-lg font-serif font-bold text-amber-900 mb-3">Set Initial Time (Minutes):</h3>
                <div className="flex gap-3 items-center">
                  <input
                    type="number"
                    id="time-input"
                    min="0"
                    step="1"
                    placeholder="Enter minutes"
                    className="flex-1 bg-white border-2 border-amber-700 border-opacity-70 text-amber-900 px-4 py-2 focus:outline-none focus:border-amber-900 focus:ring-2 focus:ring-amber-600 font-serif"
                  />
                  <button
                    onClick={() => {
                      const input = document.getElementById('time-input') as HTMLInputElement;
                      const minutes = parseInt(input?.value || '0') || 0;
                      if (minutes >= 0) {
                        handleSetTime(minutes);
                        input.value = '';
                      }
                    }}
                    className="bg-blue-600 text-white font-serif font-bold py-2 px-6 hover:bg-blue-700 transition-all duration-300 active:scale-95"
                  >
                    SET TIME
                  </button>
                </div>
              </div>

              {/* Main Contest Controls */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={handleStartContest}
                  disabled={contestStarted || timerSeconds === 0}
                  className="bg-green-600 text-white font-serif font-bold py-4 px-6 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 active:scale-95 text-lg"
                >
                  START THE CONTEST
                </button>
                <button
                  onClick={handleEndContest}
                  disabled={!contestStarted}
                  className="bg-red-600 text-white font-serif font-bold py-4 px-6 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 active:scale-95 text-lg"
                >
                  END THE CONTEST
                </button>
                <button
                  onClick={() => handleAddTime(1)}
                  className="bg-amber-800 text-amber-50 font-serif font-bold py-4 px-6 hover:bg-amber-900 transition-all duration-300 active:scale-95 text-lg border-2 border-amber-900"
                >
                  ADD TIME ANYTIME (+1 MIN)
                </button>
              </div>
            </div>
          </div>

          {/* Case Management Section */}
          <div className="bg-amber-50 bg-opacity-70 backdrop-blur-sm border-4 border-amber-800 border-opacity-70 p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-3xl font-serif font-bold text-amber-900 text-shadow">
                CASE MANAGEMENT
              </h2>
              <button
                onClick={() => setShowAddCaseModal(true)}
                className="bg-amber-800 text-amber-50 font-serif font-bold px-6 py-3 hover:bg-amber-900 hover:shadow-lg transition-all duration-300 active:scale-95 border-2 border-amber-900"
              >
                + ADD CASE
              </button>
            </div>
            
            <div className="space-y-3">
              {cases.length === 0 ? (
                <p className="text-amber-700 text-center py-8 font-serif">No cases added yet</p>
              ) : (
                cases.map((caseItem) => (
                  <div
                    key={caseItem.id}
                    className="bg-white bg-opacity-80 border-2 border-amber-700 border-opacity-70 p-4 hover:border-amber-800 transition-colors shadow-inner"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h3 className="text-xl font-serif font-bold text-amber-900 text-shadow mb-1">
                          {caseItem.title}
                        </h3>
                        <p className="text-amber-700 font-serif text-sm mb-1">
                          {caseItem.difficulty} - {caseItem.points} points
                        </p>
                        {caseItem.description && (
                          <p className="text-amber-600 font-serif text-xs italic mb-2">
                            {caseItem.description.substring(0, 100)}{caseItem.description.length > 100 ? '...' : ''}
                          </p>
                        )}
                        <div className="flex gap-4 text-xs text-amber-600 font-serif">
                          {caseItem.attachmentType && <span>Attachment: {caseItem.attachmentType === 'link' ? 'Link' : 'File'}</span>}
                          {caseItem.flag && <span>Flag: Set</span>}
                          {caseItem.hints && caseItem.hints.length > 0 && (
                            <span>Hints: {caseItem.hints.length}</span>
                          )}
                        </div>
                        
                        {/* Hints Management */}
                        {caseItem.hints && caseItem.hints.length > 0 && (
                          <div className="mt-3 p-2 bg-amber-100 bg-opacity-50 border border-amber-600 border-opacity-40">
                            <div className="text-xs font-serif font-bold text-amber-800 mb-2">Hint Controls:</div>
                            <div className="space-y-1">
                              {caseItem.hints.map((hint, index) => (
                                <div key={hint._id || hint.id || index} className="flex justify-between items-center text-xs">
                                  <span className="text-amber-700 font-serif">
                                    -{hint.pointDeduction}pts: {hint.text.substring(0, 30)}...
                                  </span>
                                  <button
                                    onClick={async () => {
                                      try {
                                        // Use _id from backend (MongoDB ID) for the API call
                                        const caseIdForAPI = caseItem._id || caseItem.id;
                                        const hintIdForAPI = hint._id || hint.id;
                                        
                                        const response = await casesAPI.releaseHint(caseIdForAPI, hintIdForAPI);
                                        if (response.success) {
                                          // Refresh cases to show updated state
                                          const casesResponse = await casesAPI.getAll();
                                          if (casesResponse.success) {
                                            const mapped = casesResponse.cases.map((c: any) => ({
                                              ...c,
                                              id: c._id
                                            }));
                                            setCases(mapped);
                                          }
                                        }
                                      } catch (error: any) {
                                        console.error('Error toggling hint:', error);
                                        alert(`Failed to toggle hint release: ${error.message || 'Unknown error'}`);
                                      }
                                    }}
                                    className={`px-2 py-1 font-serif font-bold text-xs ${
                                      hint.released
                                        ? 'bg-green-600 text-white hover:bg-green-700'
                                        : 'bg-gray-500 text-white hover:bg-gray-600'
                                    }`}
                                  >
                                    {hint.released ? '✓ RELEASED' : '🔒 LOCKED'}
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => handleRemoveCase((caseItem as any)._id || caseItem.id)}
                        className="bg-red-600 text-white font-serif font-bold px-4 py-2 hover:bg-red-700 transition-all duration-300 active:scale-95 ml-4"
                      >
                        REMOVE
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Leaderboard Section */}
          <div className="bg-amber-50 bg-opacity-70 backdrop-blur-sm border-4 border-amber-800 border-opacity-70 p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-3xl font-serif font-bold text-amber-900 text-shadow">
                LEADERBOARD
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={fetchLeaderboard}
                  className="bg-amber-700 text-amber-50 font-serif font-bold px-4 py-2 hover:bg-amber-800 hover:shadow-lg transition-all duration-300 active:scale-95 border-2 border-amber-900"
                  title="Refresh leaderboard"
                >
                  🔄 REFRESH
                </button>
                <button
                  onClick={handleDownloadCSV}
                  className="bg-amber-800 text-amber-50 font-serif font-bold px-6 py-2 hover:bg-amber-900 hover:shadow-lg transition-all duration-300 active:scale-95 border-2 border-amber-900"
                >
                  📥 DOWNLOAD CSV
                </button>
              </div>
            </div>
            <div className="bg-white bg-opacity-80 border-2 border-amber-700 border-opacity-70 shadow-inner">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-amber-800 bg-opacity-80">
                    <th className="px-4 py-3 text-amber-50 font-serif font-bold text-left">Rank</th>
                    <th className="px-4 py-3 text-amber-50 font-serif font-bold text-left">Detective Name</th>
                    <th className="px-4 py-3 text-amber-50 font-serif font-bold text-left">Score</th>
                    <th className="px-4 py-3 text-amber-50 font-serif font-bold text-left">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map((entry) => (
                    <tr
                      key={entry.rank}
                      className="border-b border-amber-300 border-opacity-50 hover:bg-amber-100 hover:bg-opacity-50"
                    >
                      <td className="px-4 py-3 text-amber-900 font-serif font-bold">{entry.rank}</td>
                      <td className="px-4 py-3 text-amber-900 font-serif">{entry.name}</td>
                      <td className="px-4 py-3 text-amber-900 font-serif">{entry.score}</td>
                      <td className="px-4 py-3 text-amber-900 font-mono text-xs">{formatLeaderboardTime(entry.time)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      </div>

      {/* Add Case Modal - Comprehensive Form */}
      {showAddCaseModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 overflow-y-auto p-4"
          onClick={() => setShowAddCaseModal(false)}
        >
          <div
            className="bg-amber-50 bg-opacity-95 backdrop-blur-sm border-4 border-amber-800 border-opacity-70 p-8 max-w-3xl w-full shadow-[0_0_50px_rgba(184,134,11,0.7)] my-8"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-3xl font-serif font-bold text-amber-900 mb-6 text-shadow text-center">
              INJECT NEW PROBLEM
            </h3>
            
            <div className="space-y-6 max-h-[80vh] overflow-y-auto pr-2">
              {/* TITLE */}
              <div>
                <label className="block text-amber-900 mb-2 font-serif font-bold text-lg">
                  TITLE
                </label>
                <input
                  type="text"
                  value={newCase.title}
                  onChange={(e) => setNewCase({ ...newCase, title: e.target.value })}
                  className="w-full bg-white bg-opacity-90 border-2 border-amber-700 border-opacity-70 text-amber-900 px-4 py-3 focus:outline-none focus:border-amber-900 focus:ring-2 focus:ring-amber-600 font-serif"
                  placeholder="e.g. The Fibonacci Stack"
                  required
                />
              </div>

              {/* DESCRIPTION */}
              <div>
                <label className="block text-amber-900 mb-2 font-serif font-bold text-lg">
                  DESCRIPTION
                </label>
                <textarea
                  value={newCase.description}
                  onChange={(e) => setNewCase({ ...newCase, description: e.target.value })}
                  className="w-full bg-white bg-opacity-90 border-2 border-amber-700 border-opacity-70 text-amber-900 px-4 py-3 focus:outline-none focus:border-amber-900 focus:ring-2 focus:ring-amber-600 font-serif resize-y min-h-[120px]"
                  placeholder="Problem details..."
                />
              </div>

              {/* POINTS */}
              <div>
                <label className="block text-amber-900 mb-2 font-serif font-bold text-lg">
                  POINTS
                </label>
                <input
                  type="number"
                  value={newCase.points}
                  onChange={(e) => setNewCase({ ...newCase, points: parseInt(e.target.value) || 0 })}
                  className="w-full bg-white bg-opacity-90 border-2 border-amber-700 border-opacity-70 text-amber-900 px-4 py-3 focus:outline-none focus:border-amber-900 focus:ring-2 focus:ring-amber-600 font-serif"
                  placeholder="Enter points (e.g., 100)"
                  min="0"
                  required
                />
              </div>

              {/* FLAG */}
              <div className="border-t-2 border-amber-700 border-opacity-50 pt-4">
                <label className="block text-amber-900 mb-2 font-serif font-bold text-lg">
                  FLAG <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={newCase.flag}
                  onChange={(e) => setNewCase({ ...newCase, flag: e.target.value })}
                  className="w-full bg-white bg-opacity-90 border-2 border-amber-700 border-opacity-70 text-amber-900 px-4 py-3 focus:outline-none focus:border-amber-900 focus:ring-2 focus:ring-amber-600 font-serif"
                  placeholder="Enter the flag for this case"
                  required
                />
              </div>

              {/* HINTS CONFIGURATION (optional) */}
              <div className="border-t-2 border-amber-700 border-opacity-50 pt-4">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-xl font-serif font-bold text-amber-900">
                    HINTS (Optional)
                  </h4>
                  <button
                    type="button"
                    onClick={() => {
                      const id = `new-${Date.now()}`;
                      setNewCaseHints((prev) => [
                        ...prev,
                      {
                        id,
                        text: '',
                        pointDeduction: 0,
                        released: false,
                      },
                      ]);
                    }}
                    className="bg-amber-800 text-amber-50 font-serif text-sm font-bold px-3 py-2 border-2 border-amber-900 hover:bg-amber-900 transition-all duration-200"
                  >
                    + ADD HINT
                  </button>
                </div>
                {newCaseHints.length === 0 ? (
                  <p className="text-sm text-amber-700 font-serif italic">
                    No hints added for this case yet.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {newCaseHints.map((hint, index) => (
                      <div
                        key={hint.id || index}
                        className="bg-white bg-opacity-90 border-2 border-amber-700 border-opacity-60 p-3 flex flex-col gap-2"
                      >
                        <div className="flex gap-3">
                          <div className="flex-1">
                            <label className="block text-amber-900 mb-1 font-serif text-xs font-semibold">
                              Hint Text
                            </label>
                            <input
                              type="text"
                              value={hint.text}
                              onChange={(e) =>
                                setNewCaseHints((prev) =>
                                  prev.map((h) =>
                                    h.id === hint.id ? { ...h, text: e.target.value } : h
                                  )
                                )
                              }
                              className="w-full bg-white border border-amber-700 text-amber-900 px-2 py-1 text-xs font-serif"
                              placeholder="Write the hint detectives will see"
                            />
                          </div>
                          <div className="w-1/4">
                            <label className="block text-amber-900 mb-1 font-serif text-xs font-semibold">
                              Points (-)
                            </label>
                            <input
                              type="number"
                              min="0"
                              value={hint.pointDeduction}
                              onChange={(e) => {
                                const val = parseInt(e.target.value || '0', 10);
                                setNewCaseHints((prev) =>
                                  prev.map((h) =>
                                    h.id === hint.id
                                      ? { ...h, pointDeduction: isNaN(val) ? 0 : val }
                                      : h
                                  )
                                );
                              }}
                              className="w-full bg-white border border-amber-700 text-amber-900 px-2 py-1 text-xs font-serif"
                            />
                          </div>
                          <div className="w-1/4 flex items-end">
                            <button
                              type="button"
                              onClick={() =>
                                setNewCaseHints((prev) =>
                                  prev.map((h) =>
                                    h.id === hint.id ? { ...h, released: !h.released } : h
                                  )
                                )
                              }
                              className={`w-full px-2 py-1 text-xs font-serif font-bold border transition-all duration-200 ${
                                hint.released
                                  ? 'bg-green-600 border-green-700 text-white hover:bg-green-700'
                                  : 'bg-gray-300 border-gray-500 text-gray-800 hover:bg-gray-400'
                              }`}
                            >
                              {hint.released ? '🔓 UNLOCK' : '🔒 LOCK'}
                            </button>
                          </div>
                        </div>
                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={() =>
                              setNewCaseHints((prev) =>
                                prev.filter((h) => h.id !== hint.id)
                              )
                            }
                            className="text-xs font-serif font-bold text-red-700 border border-red-700 px-2 py-1 hover:bg-red-600 hover:text-white transition-all duration-200"
                          >
                            REMOVE HINT
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* UPLOAD FILE OR LINK */}
              <div className="border-t-2 border-amber-700 border-opacity-50 pt-4">
                <h4 className="text-xl font-serif font-bold text-amber-900 mb-4">
                  ATTACHMENT (Optional)
                </h4>
                <div className="space-y-4">
                  {/* Attachment Type Selection */}
                  <div>
                    <label className="block text-amber-900 mb-3 font-serif font-bold">
                      Attachment Type:
                    </label>
                    <div className="flex gap-4">
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          name="attachmentType"
                          value="link"
                          checked={newCase.attachmentType === 'link'}
                          onChange={(e) => setNewCase({ ...newCase, attachmentType: e.target.value as 'file' | 'link' })}
                          className="mr-2 w-4 h-4 text-amber-800 focus:ring-amber-600"
                        />
                        <span className="text-amber-900 font-serif">Upload Link</span>
                      </label>
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          name="attachmentType"
                          value="file"
                          checked={newCase.attachmentType === 'file'}
                          onChange={(e) => setNewCase({ ...newCase, attachmentType: e.target.value as 'file' | 'link' })}
                          className="mr-2 w-4 h-4 text-amber-800 focus:ring-amber-600"
                        />
                        <span className="text-amber-900 font-serif">Upload File</span>
                      </label>
                    </div>
                  </div>

                  {/* Attachment Name */}
                  <div>
                    <label className="block text-amber-900 mb-2 font-serif">
                      Attachment Name
                    </label>
                    <input
                      type="text"
                      value={newCase.attachmentName}
                      onChange={(e) => setNewCase({ ...newCase, attachmentName: e.target.value })}
                      className="w-full bg-white bg-opacity-90 border-2 border-amber-700 border-opacity-70 text-amber-900 px-4 py-3 focus:outline-none focus:border-amber-900 focus:ring-2 focus:ring-amber-600 font-serif"
                      placeholder="e.g., Evidence File.pdf or Evidence Link"
                    />
                  </div>

                  {/* Link URL (only show if link type) */}
                  {newCase.attachmentType === 'link' && (
                    <div>
                      <label className="block text-amber-900 mb-2 font-serif">
                        Link URL
                      </label>
                      <input
                        type="url"
                        value={newCase.attachmentUrl}
                        onChange={(e) => setNewCase({ ...newCase, attachmentUrl: e.target.value })}
                        className="w-full bg-white bg-opacity-90 border-2 border-amber-700 border-opacity-70 text-amber-900 px-4 py-3 focus:outline-none focus:border-amber-900 focus:ring-2 focus:ring-amber-600 font-serif"
                        placeholder="https://example.com/file.pdf"
                      />
                    </div>
                  )}

                  {/* File Upload (only show if file type) */}
                  {newCase.attachmentType === 'file' && (
                    <div>
                      <label htmlFor="case-file-upload" className="block text-amber-900 mb-2 font-serif font-bold">
                        Upload File:
                      </label>
                      <input
                        id="case-file-upload"
                        type="file"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setNewCase({ 
                              ...newCase, 
                              attachmentName: file.name,
                              attachmentFile: file
                            });
                            // In a real app, you would upload the file to a server here
                          }
                        }}
                        className="w-full bg-white bg-opacity-90 border-2 border-amber-700 border-opacity-70 text-amber-900 px-4 py-3 focus:outline-none focus:border-amber-900 focus:ring-2 focus:ring-amber-600 font-serif file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-serif file:bg-amber-800 file:text-amber-50 hover:file:bg-amber-900"
                      />
                      {newCase.attachmentFile && (
                        <p className="mt-2 text-sm text-amber-700 font-serif">
                          Selected: {newCase.attachmentName} ({(newCase.attachmentFile.size / 1024).toFixed(2)} KB)
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex gap-4 mt-6">
              <button
                onClick={handleAddCase}
                className="flex-1 bg-green-600 text-white font-serif font-bold py-4 text-lg hover:bg-green-700 transition-all duration-300 border-2 border-green-700"
              >
                UPLOAD TO DATABASE
              </button>
              <button
                type="button"
                onClick={() => setShowAddCaseModal(false)}
                className="flex-1 bg-white bg-opacity-80 border-2 border-amber-800 text-amber-900 font-serif font-bold py-4 hover:bg-amber-100 transition-all duration-300"
              >
                CANCEL
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChiefDashboard;
