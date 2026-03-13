/**
 * Root application component
 * Manages routing between configuration, marathon, and results screens
 * Validates: Requirements 11.1, 11.2, 11.4, 11.5
 */
import React, { useEffect, useState } from 'react';
import { ConfigurationSuite, MarathonInterface, ResultGenerator } from './components';
import { MarathonConfig, MarathonResults } from './types';
import { marathonStore } from './store/MarathonStore';

const App: React.FC = () => {
  // Subscribe to store changes for routing
  const [currentScreen, setCurrentScreen] = useState(marathonStore.getCurrentScreen());
  const [marathonConfig, setMarathonConfig] = useState(marathonStore.getMarathonConfig());
  const [marathonResults, setMarathonResults] = useState(marathonStore.getMarathonResults());

  useEffect(() => {
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

  return (
    <div className="app-container">
      {renderScreen()}
    </div>
  );
};

export default App;
