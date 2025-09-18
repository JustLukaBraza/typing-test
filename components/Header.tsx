import React, { useState, useEffect } from 'react';
import { TestMode, TestConfig, State } from '../types';
import { TIME_OPTIONS, WORDS_OPTIONS, NUMBERS_OPTIONS } from '../constants';
import { SearchIcon, SoundOnIcon, SoundOffIcon } from './Icons';

interface HeaderProps {
  testMode: TestMode;
  setTestMode: (mode: TestMode) => void;
  testConfig: TestConfig;
  setTestConfig: (config: TestConfig) => void;
  state: State;
  isPunctuationEnabled: boolean;
  setIsPunctuationEnabled: (enabled: boolean) => void;
  onOpenQuoteSelector: () => void;
  isSoundEnabled: boolean;
  setIsSoundEnabled: (enabled: boolean) => void;
  wpm?: number;
  typed?: string;
  typedLength?: number;
  wordsLength?: number;
  startTime?: number;
}

const ConfigButton: React.FC<{
  label: string | number;
  isActive: boolean;
  onClick: () => void;
  disabled: boolean;
}> = ({ label, isActive, onClick, disabled }) => {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    onClick();
    e.currentTarget.blur();
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={`px-3 py-1 rounded-md text-sm transition-all duration-200
        ${isActive ? 'text-primary bg-accent/20' : 'text-secondary hover:text-primary'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      {label}
    </button>
  );
};

const Header: React.FC<HeaderProps> = ({ testMode, setTestMode, testConfig, setTestConfig, state, isPunctuationEnabled, setIsPunctuationEnabled, onOpenQuoteSelector, isSoundEnabled, setIsSoundEnabled, wpm, typed, typedLength, wordsLength, startTime }) => {
  const isTestRunning = state === State.Running;
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (startTime && testMode === TestMode.Time) {
      interval = setInterval(() => {
        const elapsedTime = (Date.now() - startTime) / 1000;
        setTimer(Math.max(0, testConfig.time - Math.floor(elapsedTime)));
      }, 1000);
    } else {
      if (testMode === TestMode.Time) {
        setTimer(testConfig.time);
      }
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [startTime, testMode, testConfig.time]);

  const getProgressDisplay = () => {
    if (!isTestRunning) return null;
    
    switch (testMode) {
      case TestMode.Time:
        return timer;
      case TestMode.Words: {
        const typedWords = typed?.match(/\S+/g)?.length || 0;
        return `${typedWords}/${testConfig.words}`;
      }
      case TestMode.Numbers: {
        const typedNumbers = typed?.match(/\S+/g)?.length || 0;
        return `${typedNumbers}/${testConfig.numbers}`;
      }
      case TestMode.Quote:
      case TestMode.Practice:
        return `${typedLength}/${wordsLength}`;
      default:
        return null;
    }
  };

  const handleModeChange = (mode: TestMode) => {
    if (!isTestRunning) setTestMode(mode);
  };

  const handleConfigChange = (value: number) => {
    if (!isTestRunning) setTestConfig({ ...testConfig, [testMode]: value });
  };

  const ModeSelector = () => (
    <div className="flex items-center gap-2">
      <ConfigButton label="დრო" isActive={testMode === TestMode.Time} onClick={() => handleModeChange(TestMode.Time)} disabled={isTestRunning} />
      <ConfigButton label="სიტყვები" isActive={testMode === TestMode.Words} onClick={() => handleModeChange(TestMode.Words)} disabled={isTestRunning} />
      <ConfigButton label="ციტატა" isActive={testMode === TestMode.Quote} onClick={() => handleModeChange(TestMode.Quote)} disabled={isTestRunning} />
      <ConfigButton label="რიცხვები" isActive={testMode === TestMode.Numbers} onClick={() => handleModeChange(TestMode.Numbers)} disabled={isTestRunning} />
      <ConfigButton label="სავარჯიშო" isActive={testMode === TestMode.Practice} onClick={() => handleModeChange(TestMode.Practice)} disabled={isTestRunning} />
    </div>
  );

  const ConfigSelector = () => {
    let options: number[] = [];
    let currentConfigValue: number = 0;
    
    switch (testMode) {
      case TestMode.Time:
        options = TIME_OPTIONS;
        currentConfigValue = testConfig.time;
        break;
      case TestMode.Words:
        options = WORDS_OPTIONS;
        currentConfigValue = testConfig.words;
        break;
      case TestMode.Numbers:
        options = NUMBERS_OPTIONS;
        currentConfigValue = testConfig.numbers;
        break;
      default:
        return null;
    }

    return (
      <div className="flex items-center gap-2">
        {options.map((value) => (
          <ConfigButton key={value} label={value} isActive={currentConfigValue === value} onClick={() => handleConfigChange(value)} disabled={isTestRunning} />
        ))}
      </div>
    );
  };
  
  const PunctuationToggle = () => (
    (testMode === TestMode.Words || testMode === TestMode.Time || testMode === TestMode.Practice) && (
      <ConfigButton label="პუნქტუაცია" isActive={isPunctuationEnabled} onClick={() => setIsPunctuationEnabled(!isPunctuationEnabled)} disabled={isTestRunning} />
    )
  );

  const QuoteSearchButton = () => (
    testMode === TestMode.Quote && (
      <button onClick={onOpenQuoteSelector} disabled={isTestRunning} className={`p-2 rounded-md text-sm transition-all duration-200 text-secondary hover:text-primary ${isTestRunning ? 'opacity-50 cursor-not-allowed' : ''}`} aria-label="ციტატის არჩევა">
        <SearchIcon />
      </button>
    )
  );

  return (
    <div className="flex flex-col items-center gap-6 w-full">
      <div className="text-4xl sm:text-5xl font-bold text-accent font-georgian tracking-widest">
        <span>აჩქარე</span>
      </div>
      <div className="bg-bg-alt p-2 rounded-lg flex items-center gap-4 flex-wrap justify-center w-full">
        <div className="flex items-center gap-4 flex-wrap justify-center flex-1">
          <ModeSelector />
          <QuoteSearchButton />
          <div className="w-px h-6 bg-secondary/50 hidden sm:block"></div>
          <ConfigSelector />
          <PunctuationToggle />
        </div>
        <div className="flex items-center gap-4">
          {isTestRunning && wpm !== undefined && (
            <>
              <div className="text-accent font-bold text-lg">
                {wpm} <span className="text-secondary text-sm">სწ/წთ</span>
              </div>
              {getProgressDisplay() && (
                <div className="text-primary font-bold text-lg">
                  {getProgressDisplay()}
                </div>
              )}
            </>
          )}
          <button onClick={() => setIsSoundEnabled(!isSoundEnabled)} className="text-secondary hover:text-primary p-1">
            {isSoundEnabled ? <SoundOnIcon /> : <SoundOffIcon />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Header;
