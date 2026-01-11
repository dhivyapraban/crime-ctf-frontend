import React, { useEffect, useState } from 'react';
import { leaderboardAPI } from '../api/game';

interface Attachment {
  type: 'link' | 'file';
  name: string;
  url?: string;
}

interface CasePopupProps {
  caseData: {
    id: string;
    title: string;
    narrative: string;
    attachments?: Attachment[];
    hints?: {
      id: string;
      text: string;
      pointDeduction: number;
      released: boolean;
    }[];
  };
  onClose: () => void;
  onFlagSubmitted?: () => void;
}

const CasePopup: React.FC<CasePopupProps> = ({ caseData, onClose, onFlagSubmitted }) => {
  const [hintRequested, setHintRequested] = useState(false);
  const [showHintModal, setShowHintModal] = useState(false);
  const [flag, setFlag] = useState('');
  const [submissionMessage, setSubmissionMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Track previously used hints for this case so history is always visible
  const [usedHintsForCase, setUsedHintsForCase] = useState<Set<string>>(
    () => {
      const raw = localStorage.getItem('usedHints');
      if (!raw) return new Set<string>();
      try {
        const parsed = JSON.parse(raw) as { caseId: string; hintId: string }[];
        return new Set(
          parsed.filter((h) => h.caseId === caseData.id).map((h) => h.hintId)
        );
      } catch {
        return new Set<string>();
      }
    }
  );

  // Keep local state in sync if localStorage changes from elsewhere
  useEffect(() => {
    const sync = () => {
      const raw = localStorage.getItem('usedHints');
      if (!raw) {
        setUsedHintsForCase(new Set<string>());
        return;
      }
      try {
        const parsed = JSON.parse(raw) as { caseId: string; hintId: string }[];
        setUsedHintsForCase(
          new Set(
            parsed.filter((h) => h.caseId === caseData.id).map((h) => h.hintId)
          )
        );
      } catch {
        // ignore
      }
    };

    sync();

    const listener = () => sync();
    window.addEventListener('storage', listener);
    return () => window.removeEventListener('storage', listener);
  }, [caseData.id]);

  const handleRequestHint = () => {
    setShowHintModal(true);
  };

  const confirmHint = () => {
    setShowHintModal(false);
    setHintRequested(true);
    // This generic button now just explains that individual hints below carry deductions
  };

  const handleSubmitFlag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!flag.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const response = await leaderboardAPI.submitSolution(caseData.id, flag.trim());
      if (response.success) {
        setSubmissionMessage(`✓ Correct! ${response.message}`);
        setFlag('');
        // Refresh leaderboard in parent component
        if (onFlagSubmitted) {
          onFlagSubmitted();
        }
        setTimeout(() => {
          setSubmissionMessage('');
          onClose(); // Close popup after successful submission
        }, 2000);
      }
    } catch (error: any) {
      const errorMsg = error.message || 'Incorrect flag. Try again!';
      setSubmissionMessage(`✗ ${errorMsg}`);
      setTimeout(() => {
        setSubmissionMessage('');
      }, 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80"
      onClick={onClose}
    >
      <div 
        className="bg-noir-brown border-4 border-noir-red max-w-4xl w-full max-h-[90vh] overflow-y-auto m-4 shadow-[0_0_50px_rgba(139,0,0,0.7)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-noir-red p-6 flex justify-between items-center">
          <h2 className="text-3xl font-serif font-bold text-noir-beige text-shadow-lg">
            {caseData.title}
          </h2>
          <button
            onClick={onClose}
            className="text-noir-beige hover:text-white text-3xl font-bold w-10 h-10 flex items-center justify-center hover:bg-noir-red-light transition-colors"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6">
          {/* Narrative */}
          <div>
            <h3 className="text-xl font-serif font-bold text-noir-beige mb-4 text-shadow">
              Case Narrative
            </h3>
            <p className="text-noir-beige-dark leading-relaxed text-lg whitespace-pre-wrap">
              {caseData.narrative}
            </p>
          </div>

          {/* Attachments */}
          {caseData.attachments && caseData.attachments.length > 0 && (
            <div>
              <h3 className="text-xl font-serif font-bold text-noir-beige mb-4 text-shadow">
                Attachments
              </h3>
              <div className="space-y-3">
                {caseData.attachments.map((attachment, index) => (
                  <div
                    key={index}
                    className="bg-noir-dark border-2 border-noir-red p-4 hover:border-noir-red-light transition-colors"
                  >
                    {attachment.type === 'link' ? (
                      <a
                        href={attachment.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-noir-beige hover:text-noir-red-light flex items-center gap-2 text-lg"
                      >
                        <span>🔗</span>
                        <span className="underline">{attachment.name}</span>
                        <span className="text-sm">(External Link)</span>
                      </a>
                    ) : (
                      <div className="text-noir-beige flex items-center gap-2 text-lg">
                        <span>📎</span>
                        <span>{attachment.name}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Hint Box */}
          <div className="bg-amber-50 bg-opacity-70 backdrop-blur-sm border-4 border-amber-800 border-opacity-70 p-6 shadow-2xl">
            <h3 className="text-2xl font-serif font-bold text-amber-900 mb-4 text-shadow border-b-2 border-amber-700 pb-2">
              HINT BOX
            </h3>
            <div className="bg-white bg-opacity-80 border-2 border-amber-700 border-opacity-70 p-4 mb-4 min-h-[120px] shadow-inner" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='lines' width='100' height='20' patternUnits='userSpaceOnUse'%3E%3Cpath d='M 0 19 L 100 19' fill='none' stroke='%23e5e5e5' stroke-width='1'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100' height='100' fill='url(%23lines)'/%3E%3C/svg%3E")`,
            }}>
              {caseData.hints && caseData.hints.length > 0 ? (
                <div className="space-y-3">
                  {caseData.hints
                    .filter((h) => h.released)
                    .map((hint, index) => {
                      const hintIdToUse = (hint as any)._id || hint.id || index;
                      const alreadyUsed = usedHintsForCase.has(hintIdToUse);
                      return (
                        <div
                          key={hintIdToUse}
                          className="border border-amber-700 border-opacity-50 p-3 bg-amber-50 bg-opacity-80"
                        >
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-xs font-serif text-amber-800">
                              Hint • -{hint.pointDeduction} pts
                            </span>
                            <button
                              type="button"
                              disabled={alreadyUsed}
                              onClick={async () => {
                                if (alreadyUsed) return;
                                
                                try {
                                  // Use MongoDB _id if available, fallback to id
                                  const caseIdToUse = (caseData as any)._id || caseData.id;
                                  const hintIdToUse = (hint as any)._id || hint.id;
                                  
                                  const response = await leaderboardAPI.useHint(caseIdToUse, hintIdToUse);
                                  if (response.success) {
                                    // Update local state to show hint
                                    setUsedHintsForCase((prev) => {
                                      const next = new Set(prev);
                                      next.add(hintIdToUse);
                                      return next;
                                    });
                                    
                                    // Update localStorage for persistence
                                    const raw = localStorage.getItem('usedHints');
                                    const parsed: { caseId: string; hintId: string }[] = raw ? JSON.parse(raw) : [];
                                    const updated = [...parsed, { caseId: caseIdToUse, hintId: hintIdToUse }];
                                    localStorage.setItem('usedHints', JSON.stringify(updated));
                                    
                                    // Refresh leaderboard to show updated score
                                    if (onFlagSubmitted) {
                                      onFlagSubmitted();
                                    }
                                  }
                                } catch (error: any) {
                                  alert(error.message || 'Failed to use hint');
                                }
                              }}
                              className={`text-xs font-serif font-bold px-2 py-1 border ${
                                alreadyUsed
                                  ? 'bg-gray-300 border-gray-400 text-gray-700 cursor-default'
                                  : 'bg-amber-800 border-amber-900 text-amber-50 hover:bg-amber-900'
                              }`}
                            >
                              {alreadyUsed ? 'ALREADY TAKEN' : 'USE HINT'}
                            </button>
                          </div>
                          {/* Once a hint is used, it remains visible permanently */}
                          {alreadyUsed && (
                            <p className="text-amber-900 leading-relaxed font-serif text-sm mt-1">
                              {hint.text}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  {caseData.hints.filter((h) => h.released).length === 0 && (
                    <p className="text-amber-700 text-center font-serif italic text-sm">
                      All {caseData.hints.length} hint(s) are currently locked by the Chief.
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-amber-700 text-center flex items-center justify-center h-full font-serif italic text-sm">
                  No hints configured for this case.
                </p>
              )}
            </div>
            <button
              onClick={handleRequestHint}
              disabled={hintRequested}
              className="bg-amber-800 text-amber-50 font-serif font-bold py-3 px-6 hover:bg-amber-900 hover:shadow-lg transition-all duration-300 active:scale-95 border-2 border-amber-900 disabled:opacity-50 disabled:cursor-not-allowed w-full"
            >
              {hintRequested ? 'HINTS ACTIVE' : 'ACKNOWLEDGE POINT DEDUCTIONS'}
            </button>
          </div>

          {/* Flag Submission Box */}
          <div className="bg-noir-dark border-4 border-noir-red p-6 shadow-2xl">
            <h3 className="text-2xl font-serif font-bold text-noir-beige mb-4 text-shadow border-b-2 border-noir-red pb-2">
              SUBMIT FLAG
            </h3>
            <form onSubmit={handleSubmitFlag} className="space-y-4">
              <div>
                <label className="block text-noir-beige mb-2 font-serif font-bold">
                  Flag:
                </label>
                <input
                  type="text"
                  value={flag}
                  onChange={(e) => setFlag(e.target.value)}
                  className="w-full bg-noir-brown border-2 border-noir-red text-noir-beige px-4 py-3 focus:outline-none focus:border-noir-red-light focus:ring-2 focus:ring-noir-red font-serif"
                  placeholder="Enter your flag here..."
                  required
                />
              </div>
              {submissionMessage && (
                <div className={`border-2 p-3 font-serif text-sm ${
                  submissionMessage.includes('✓') 
                    ? 'bg-green-900 bg-opacity-70 border-green-600 text-green-100'
                    : 'bg-red-900 bg-opacity-70 border-red-600 text-red-100'
                }`}>
                  {submissionMessage}
                </div>
              )}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-noir-red text-noir-beige font-serif font-bold py-3 px-6 hover:bg-noir-red-light hover:shadow-lg transition-all duration-300 active:scale-95 border-2 border-noir-red-light disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'SUBMITTING...' : 'SUBMIT FLAG'}
              </button>
            </form>
          </div>

          {/* Close Button */}
          <div className="flex justify-end pt-4">
            <button
              onClick={onClose}
              className="bg-noir-red text-noir-beige font-serif font-bold px-8 py-3 hover:bg-noir-red-light hover:shadow-[0_0_20px_rgba(139,0,0,0.6)] transition-all duration-300"
            >
              CLOSE CASE FILE
            </button>
          </div>
        </div>
      </div>

      {/* Hint Confirmation Modal */}
      {showHintModal && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-90"
          onClick={() => setShowHintModal(false)}
        >
          <div
            className="bg-amber-50 bg-opacity-95 border-4 border-amber-800 border-opacity-70 p-8 max-w-md w-full shadow-[0_0_50px_rgba(184,134,11,0.7)] backdrop-blur-sm"
            onClick={(e) => e.stopPropagation()}
            style={{
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
            }}
          >
            <h3 className="text-2xl font-serif font-bold text-amber-900 mb-4 text-shadow">
              Confirm Hint Request
            </h3>
            <p className="text-amber-700 mb-6 text-lg font-serif">
              Using released hints for this case will reduce your score according to each hint&apos;s deduction. Proceed?
            </p>
            <div className="flex gap-4">
              <button
                onClick={confirmHint}
                className="flex-1 bg-amber-800 text-amber-50 font-serif font-bold py-3 hover:bg-amber-900 transition-all duration-300 border-2 border-amber-900"
              >
                YES, PROCEED
              </button>
              <button
                onClick={() => setShowHintModal(false)}
                className="flex-1 bg-white border-2 border-amber-800 text-amber-900 font-serif font-bold py-3 hover:bg-amber-100 transition-all duration-300"
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

export default CasePopup;

