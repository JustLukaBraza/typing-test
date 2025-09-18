import React, { useState, useEffect } from 'react';
import { TestMode, TestConfig } from '../types';

interface LiveStatsProps {
  wpm: number;
  testMode: TestMode;
  testConfig: TestConfig;
  startTime: number | null;
  typed: string;
  typedLength: number;
  wordsLength: number;
}

const LiveStats: React.FC<LiveStatsProps> = ({ wpm, testMode, testConfig, startTime, typed, typedLength, wordsLength }) => {
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
    switch (testMode) {
      case TestMode.Time:
        return timer;
      case TestMode.Words: {
        const typedWords = typed.match(/\S+/g)?.length || 0;
        return `${typedWords}/${testConfig.words}`;
      }
      case TestMode.Numbers: {
        const typedNumbers = typed.match(/\S+/g)?.length || 0;
        return `${typedNumbers}/${testConfig.numbers}`;
      }
      case TestMode.Quote:
      case TestMode.Practice:
        return `${typedLength}/${wordsLength}`;
      default:
        return 0;
    }
  };

  return (
    <div className="absolute -top-16 left-1/2 -translate-x-1/2 flex items-center gap-8 text-2xl animate-fade-in">
      <div className="text-accent font-bold">{wpm} <span className="text-secondary text-base">სწ/წთ</span></div>
      <div className="text-primary font-bold">{getProgressDisplay()}</div>
    </div>
  );
};

export default LiveStats;