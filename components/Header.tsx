import React from 'react';
import { TestMode, TestConfig, State } from '../types';
import { TIME_OPTIONS, WORDS_OPTIONS } from '../constants';
import { SearchIcon } from './Icons';

interface HeaderProps {
  testMode: TestMode;
  setTestMode: (mode: TestMode) => void;
  testConfig: TestConfig;
  setTestConfig: (config: TestConfig) => void;
  state: State;
  isPunctuationEnabled: boolean;
  setIsPunctuationEnabled: (enabled: boolean) => void;
  onOpenQuoteSelector: () => void;
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

const Header: React.FC<HeaderProps> = ({ testMode, setTestMode, testConfig, setTestConfig, state, isPunctuationEnabled, setIsPunctuationEnabled, onOpenQuoteSelector }) => {
  const isTestRunning = state === State.Running;

  const handleModeChange = (mode: TestMode) => {
    if (!isTestRunning) {
      setTestMode(mode);
    }
  };

  const handleConfigChange = (value: number) => {
    if (!isTestRunning) {
      setTestConfig({ ...testConfig, [testMode]: value });
    }
  };

  const handlePunctuationToggle = () => {
    if (!isTestRunning) {
      setIsPunctuationEnabled(!isPunctuationEnabled);
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full">
      <div className="text-5xl font-bold text-accent font-georgian tracking-widest">
        <span>აჩქარე</span>
      </div>
      <div className="bg-light-dark p-2 rounded-lg flex items-center gap-4 flex-wrap justify-center">
        <div className="flex items-center gap-2">
          <ConfigButton
            label="დრო"
            isActive={testMode === TestMode.Time}
            onClick={() => handleModeChange(TestMode.Time)}
            disabled={isTestRunning}
          />
          <ConfigButton
            label="სიტყვები"
            isActive={testMode === TestMode.Words}
            onClick={() => handleModeChange(TestMode.Words)}
            disabled={isTestRunning}
          />
          <ConfigButton
            label="ციტატა"
            isActive={testMode === TestMode.Quote}
            onClick={() => handleModeChange(TestMode.Quote)}
            disabled={isTestRunning}
          />
           {testMode === TestMode.Quote && (
            <button
              onClick={onOpenQuoteSelector}
              disabled={isTestRunning}
              className={`p-2 rounded-md text-sm transition-all duration-200 text-secondary hover:text-primary ${isTestRunning ? 'opacity-50 cursor-not-allowed' : ''}`}
              aria-label="ციტატის არჩევა"
            >
              <SearchIcon />
            </button>
          )}
        </div>
        {testMode !== TestMode.Quote && (
          <>
            <div className="w-px h-6 bg-secondary/50 hidden sm:block"></div>
            <div className="flex items-center gap-2">
              {testMode === TestMode.Time
                ? TIME_OPTIONS.map((time) => (
                    <ConfigButton
                      key={time}
                      label={time}
                      isActive={testConfig.time === time}
                      onClick={() => handleConfigChange(time)}
                      disabled={isTestRunning}
                    />
                  ))
                : WORDS_OPTIONS.map((words) => (
                    <ConfigButton
                      key={words}
                      label={words}
                      isActive={testConfig.words === words}
                      onClick={() => handleConfigChange(words)}
                      disabled={isTestRunning}
                    />
                  ))}
            </div>
             <div className="w-px h-6 bg-secondary/50 hidden md:block"></div>
             <div className="flex items-center gap-2">
                <ConfigButton
                    label="პუნქტუაცია"
                    isActive={isPunctuationEnabled}
                    onClick={handlePunctuationToggle}
                    disabled={isTestRunning}
                />
             </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Header;
