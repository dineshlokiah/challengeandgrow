/**
 * Root application component
 * Manages routing between configuration, marathon, and results screens
 * Validates: Requirements 11.1, 11.2, 11.4, 11.5
 */
import React, { useEffect, useState } from 'react';
import { ConfigurationSuite, MarathonInterface, ResultGenerator } from './components';
import { MarathonConfig, MarathonResults, SavedSession } from './types';
import { marathonStore } from './store/MarathonStore';

const App: React.FC = () => {
  // Subscribe to store changes for routing
  const [currentScreen, setCurrentScreen] = useState(marathonStore.getCurrentScreen());
  const [marathonConfig, setMarathonConfig] = useState(marathonStore.getMarathonConfig());
  const [marathonResults, setMarathonResults] = useState(marathonStore.getMarathonResults());

  const [pendingSession, setPendingSession] = useState<SavedSession | null>(null);

  useEffect(() => {
    try {
      const savedStr = localStorage.getItem('challengeandgrow_saved_session');
      if (savedStr) {
        const session: SavedSession = JSON.parse(savedStr);
        if (Date.now() - session.savedAt < 86400000) {
          setPendingSession(session);
        } else {
          localStorage.removeItem('challengeandgrow_saved_session');
        }
      }
    } catch (e) {
      localStorage.removeItem('challengeandgrow_saved_session');
    }

    // Subscribe to store updates
    const unsubscribe = marathonStore.subscribe(() => {
      setCurrentScreen(marathonStore.getCurrentScreen());
      setMarathonConfig(marathonStore.getMarathonConfig());
      setMarathonResults(marathonStore.getMarathonResults());
    });

    return unsubscribe;
  }, []);

  /**
   * Handle marathon start from configuration screen
   */
  const handleStartMarathon = (config: MarathonConfig) => {
    marathonStore.startMarathon(config);
  };

  /**
   * Handle marathon completion
   */
  const handleMarathonComplete = (results: MarathonResults) => {
    marathonStore.completeMarathon(results);
  };

  /**
   * Handle return to configuration
   */
  const handleReturnToConfiguration = () => {
    marathonStore.returnToConfiguration();
  };

  /**
   * Render current screen based on routing state
   */
  const renderScreen = () => {
    switch (currentScreen) {
      case 'configuration':
        return <ConfigurationSuite onStartMarathon={handleStartMarathon} />;
      
      case 'marathon':
        if (!marathonConfig) {
          // Fallback to configuration if no config exists
          marathonStore.returnToConfiguration();
          return <ConfigurationSuite onStartMarathon={handleStartMarathon} />;
        }
        return (
          <MarathonInterface
            config={marathonConfig}
            onComplete={handleMarathonComplete}
          />
        );
      
      case 'results':
        if (!marathonResults) {
          // Fallback to configuration if no results exist
          marathonStore.returnToConfiguration();
          return <ConfigurationSuite onStartMarathon={handleStartMarathon} />;
        }
        return (
          <ResultGenerator
            results={marathonResults}
            onReturnToConfiguration={handleReturnToConfiguration}
          />
        );
      
      default:
        return <ConfigurationSuite onStartMarathon={handleStartMarathon} />;
    }
  };

  const handleResume = () => {
    if (pendingSession) {
      marathonStore.resumeMarathon(pendingSession);
      setPendingSession(null);
    }
  };

  const handleDiscard = () => {
    localStorage.removeItem('challengeandgrow_saved_session');
    setPendingSession(null);
  };

  if (pendingSession) {
    return (
      <div className="app-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: '#2C3E50', color: '#fff', fontFamily: "'Quicksand', sans-serif" }}>
        <h1 style={{ fontFamily: "'Fredoka One', cursive", color: '#FF8C00', marginBottom: '16px', textAlign: 'center' }}>Saved Marathon Found</h1>
        <p style={{ fontSize: '18px', textAlign: 'center' }}>Would you like to resume your previous marathon?</p>
        <div style={{ display: 'flex', gap: '16px', marginTop: '32px' }}>
          <button onClick={handleResume} style={{ padding: '12px 24px', fontSize: '18px', fontWeight: 'bold', backgroundColor: '#2ECC71', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Resume Session</button>
          <button onClick={handleDiscard} style={{ padding: '12px 24px', fontSize: '18px', fontWeight: 'bold', backgroundColor: '#E74C3C', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Start New</button>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      {renderScreen()}
    </div>
  );
};

export default App;
