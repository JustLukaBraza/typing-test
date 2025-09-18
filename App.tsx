import React, { useState } from 'react';
import Header from './components/Header';
import TypingArea from './components/TypingArea';
import Results from './components/Results';
import Footer from './components/Footer';
import QuoteSelector from './components/QuoteSelector';
import { useEngine } from './hooks/useEngine';
import { State, TestMode, Quote } from './types';
import { RestartIcon } from './components/Icons';
import { quotes } from './utils/words';

const App: React.FC = () => {
  const {
    state,
    words,
    typed,
    errors,
    totalTyped,
    wpm,
    rawWpm,
    accuracy,
    consistency,
    wpmHistory,
    restartTest,
    setTestMode,
    testMode,
    testConfig,
    setTestConfig,
    quoteSource,
    isPunctuationEnabled,
    setIsPunctuationEnabled,
    setQuoteForTest,
  } = useEngine();

  const [isQuoteSelectorOpen, setQuoteSelectorOpen] = useState(false);
  const isFinished = state === State.Finished;

  const handleRestartClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    restartTest();
    e.currentTarget.blur();
  };

  const handleSelectQuote = (quote: Quote) => {
    setQuoteForTest(quote);
    setQuoteSelectorOpen(false);
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-8 transition-colors duration-300">
      <main className="w-full max-w-5xl mx-auto flex flex-col items-center gap-8">
        <Header 
          testMode={testMode} 
          setTestMode={setTestMode}
          testConfig={testConfig}
          setTestConfig={setTestConfig}
          state={state}
          isPunctuationEnabled={isPunctuationEnabled}
          setIsPunctuationEnabled={setIsPunctuationEnabled}
          onOpenQuoteSelector={() => setQuoteSelectorOpen(true)}
        />
        
        <div className="relative w-full text-center">
          {isFinished ? (
            <Results 
              wpm={wpm}
              rawWpm={rawWpm}
              accuracy={accuracy}
              errors={errors}
              totalTyped={totalTyped}
              consistency={consistency}
              wpmHistory={wpmHistory}
              testMode={testMode}
              testConfig={testConfig}
              quoteSource={quoteSource}
            />
          ) : (
            <>
              <TypingArea words={words} typed={typed} />
              {testMode === TestMode.Quote && quoteSource && (
                <div className="mt-4 text-right italic text-secondary pr-2">
                  - {quoteSource}
                </div>
              )}
            </>
          )}

          <div className="mt-8 flex justify-center">
            <button
              onClick={handleRestartClick}
              className="p-3 text-secondary hover:text-accent focus:outline-none focus:ring-2 focus:ring-accent rounded-full transition-colors duration-200"
              aria-label="ტესტის თავიდან დაწყება"
            >
              <RestartIcon />
            </button>
          </div>
        </div>
      </main>
      <Footer />
      <QuoteSelector 
        isOpen={isQuoteSelectorOpen}
        onClose={() => setQuoteSelectorOpen(false)}
        quotes={quotes}
        onSelect={handleSelectQuote}
      />
    </div>
  );
};

export default App;
