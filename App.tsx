import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import TypingArea from './components/TypingArea';
import Results from './components/Results';
import Footer from './components/Footer';
import QuoteSelector from './components/QuoteSelector';
import ThemeSwitcher from './components/ThemeSwitcher';
import { useEngine } from './hooks/useEngine';
import { State, TestMode, Quote, Theme } from './types';
import { RestartIcon, GenerateIcon } from './components/Icons';
import { quotes } from './utils/words';
import { GoogleGenerativeAI } from "@google/generative-ai";

const App: React.FC = () => {
  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem('theme') as Theme) || 'dark');
  const [isAiLoading, setIsAiLoading] = useState(false);
  
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
    problemKeys,
    restartTest,
    setTestMode,
    testMode,
    testConfig,
    setTestConfig,
    quoteSource,
    isPunctuationEnabled,
    setIsPunctuationEnabled,
    setQuoteForTest,
    isSoundEnabled,
    setIsSoundEnabled,
    startTime,
  } = useEngine();

  useEffect(() => {
    document.body.className = '';
    document.body.classList.add(`theme-${theme}`, 'font-mono', 'bg-bg', 'text-primary', 'transition-colors', 'duration-300');
    localStorage.setItem('theme', theme);
  }, [theme]);

  const [isQuoteSelectorOpen, setQuoteSelectorOpen] = useState(false);
  const isFinished = state === State.Finished;
  const isRunning = state === State.Running;

  const handleRestartClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    restartTest();
    e.currentTarget.blur();
  };

  const handleSelectQuote = (quote: Quote) => {
    setQuoteForTest(quote);
    setQuoteSelectorOpen(false);
  };

  const generateTextWithAI = async () => {
    setIsAiLoading(true);
    try {
      if (!process.env.API_KEY) {
        throw new Error("API key is not configured.");
      }
      const ai = new GoogleGenerativeAI(process.env.API_KEY || '');
      const model = ai.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const response = await model.generateContent('დამიგენერირე ერთი აბზაცი, დაახლოებით 40-50 სიტყვისგან შემდგარი, ქართულ ენაზე, წერის სავარჯიშო ტესტისთვის. თემა შეეხოს ტექნოლოგიურ პროგრესს.');
      const aiText = response.response.text().trim();
      if (aiText) {
        restartTest({ text: aiText, source: 'Gemini AI' });
      }
    } catch (error) {
      console.error("Failed to generate text with AI:", error);
      // Fallback to a random quote if AI fails
      restartTest();
    } finally {
      setIsAiLoading(false);
    }
  };


  return (
    <div className="min-h-screen flex flex-col items-center justify-between p-4 sm:p-8">
      <ThemeSwitcher theme={theme} setTheme={setTheme} />
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
          isSoundEnabled={isSoundEnabled}
          setIsSoundEnabled={setIsSoundEnabled}
          wpm={wpm}
          typed={typed}
          typedLength={typed.length}
          wordsLength={words.length}
          startTime={startTime}
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
              problemKeys={problemKeys}
              testMode={testMode}
              testConfig={testConfig}
              quoteSource={quoteSource}
            />
          ) : (
            <div className={`transition-opacity duration-300 ${isRunning ? 'opacity-100' : 'opacity-50'}`}>
              <TypingArea 
                words={words} 
                typed={typed} 
                isPracticeMode={testMode === TestMode.Practice} 
              />
              {testMode === TestMode.Quote && quoteSource && (
                <div className="mt-4 text-right italic text-secondary pr-2">
                  - {quoteSource}
                </div>
              )}
            </div>
          )}

          <div className="mt-8 flex justify-center gap-4">
            <button
              onClick={handleRestartClick}
              className="p-3 text-secondary hover:text-accent focus:outline-none focus:ring-2 focus:ring-accent rounded-full transition-colors duration-200"
              aria-label="ტესტის თავიდან დაწყება"
            >
              <RestartIcon />
            </button>
            <button
              onClick={generateTextWithAI}
              disabled={isAiLoading}
              className={`p-3 text-secondary hover:text-accent focus:outline-none focus:ring-2 focus:ring-accent rounded-full transition-colors duration-200 ${isAiLoading ? 'animate-spin' : ''}`}
              aria-label="ტექსტის გენერირება AI-ით"
            >
              <GenerateIcon />
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