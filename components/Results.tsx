import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Label } from 'recharts';
import { TestMode, TestConfig, ProblemKey, LeaderboardEntry } from '../types';
import { getLeaderboard } from '../utils/leaderboard';

interface ResultsProps {
  wpm: number;
  rawWpm: number;
  accuracy: number;
  errors: number;
  totalTyped: number;
  consistency: number;
  wpmHistory: number[];
  problemKeys: ProblemKey[];
  testMode: TestMode;
  testConfig: TestConfig;
  quoteSource?: string;
}

const StatCard: React.FC<{
  label: string;
  value: string | number;
  subValue?: string;
  className?: string;
}> = ({ label, value, subValue, className = '' }) => (
  <div className="flex flex-col items-center justify-center p-4 bg-bg-alt rounded-lg h-full">
    <div className="text-secondary text-sm font-georgian">{label}</div>
    <div className={`font-bold ${className}`}>{value}</div>
    {subValue && <div className="text-xs text-secondary">{subValue}</div>}
  </div>
);

const Results: React.FC<ResultsProps> = ({ wpm, rawWpm, accuracy, errors, totalTyped, consistency, wpmHistory, problemKeys, testMode, testConfig, quoteSource }) => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  
  const testTypeString = () => {
    switch (testMode) {
      case TestMode.Time: return `დრო ${testConfig.time}წმ`;
      case TestMode.Words: return `სიტყვები ${testConfig.words}`;
      case TestMode.Numbers: return `რიცხვები ${testConfig.numbers}`;
      case TestMode.Quote: return `ციტატა`;
      case TestMode.Practice: return `სავარჯიშო`;
      default: return '';
    }
  };

  useEffect(() => {
    setLeaderboard(getLeaderboard());
  }, [wpm]);

  const correctChars = totalTyped - errors;
  const chartData = wpmHistory.map((wpmVal, index) => ({ second: index + 1, wpm: wpmVal }));

  return (
    <div className="w-full flex flex-col items-center gap-8 animate-fade-in">
      <div className="flex flex-col items-center">
        <span className="text-secondary text-lg">სწ/წთ</span>
        <span className="text-accent text-6xl sm:text-7xl font-bold">{wpm}</span>
      </div>

      <div className="w-full grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
        <StatCard label="საწყისი" value={rawWpm} subValue="სწ/წთ" className="text-primary text-3xl sm:text-4xl" />
        <StatCard label="სიზუსტე" value={`${accuracy}%`} className="text-correct text-3xl sm:text-4xl" />
        <StatCard label="თანმიმდევრულობა" value={`${consistency}%`} className="text-primary text-3xl sm:text-4xl" />
        <StatCard label="ტესტის ტიპი" value={testTypeString()} className="text-primary text-xl sm:text-2xl" />
        <StatCard label="სიმბოლოები" value={`${correctChars}/${totalTyped}`} className="text-primary text-3xl sm:text-4xl" />
        <StatCard label="შეცდომები" value={errors} className="text-incorrect text-3xl sm:text-4xl" />
      </div>

      {quoteSource && (
        <div className="w-full text-center italic text-secondary border-t border-b border-secondary/20 py-4">
          - {quoteSource}
        </div>
      )}

      <div className="w-full grid md:grid-cols-2 gap-8">
        {problemKeys.length > 0 && (
          <div className="w-full bg-bg-alt rounded-lg p-4">
            <h3 className="text-lg font-bold text-primary mb-2 text-center font-georgian">პრობლემური სიმბოლოები</h3>
            <div className="flex flex-wrap justify-center gap-4">
              {problemKeys.slice(0, 5).map(({ key, count }) => (
                <div key={key} className="flex items-center gap-2 bg-bg p-2 rounded">
                  <span className="font-bold text-incorrect text-2xl">{key === ' ' ? '␣' : key}</span>
                  <span className="text-secondary">{count}x</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {leaderboard.length > 0 && (
          <div className="w-full bg-bg-alt rounded-lg p-4">
             <h3 className="text-lg font-bold text-primary mb-2 text-center font-georgian">საუკეთესო შედეგები</h3>
             <ul className="space-y-1 text-sm">
                {leaderboard.slice(0, 3).map((entry, index) => (
                    <li key={index} className="flex justify-between items-center p-2 bg-bg rounded">
                        <span className="text-secondary">{entry.testType}</span>
                        <div className="flex gap-4">
                          <span className="text-correct">{entry.accuracy}%</span>
                          <span className="font-bold text-accent">{entry.wpm} სწ/წთ</span>
                        </div>
                    </li>
                ))}
             </ul>
          </div>
        )}
      </div>
      
      {chartData.length > 1 && (
        <div className="w-full h-64 mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 20 }}>
              <defs>
                <linearGradient id="colorWpm" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-accent)" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="var(--color-accent)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-bg-alt)" />
              <XAxis dataKey="second" stroke="var(--color-text-secondary)">
                <Label value="დრო (წმ)" position="insideBottom" offset={-15} fill="var(--color-text-secondary)" />
              </XAxis>
              <YAxis stroke="var(--color-text-secondary)">
                 <Label value="სწ/წთ" angle={-90} position="insideLeft" fill="var(--color-text-secondary)" />
              </YAxis>
              <Tooltip 
                contentStyle={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-bg-alt)', borderRadius: '0.5rem' }}
                labelStyle={{ color: 'var(--color-text-primary)' }}
                cursor={{ stroke: 'var(--color-text-secondary)' }}
              />
              <Area type="monotone" dataKey="wpm" stroke="var(--color-accent)" strokeWidth={2} fillOpacity={1} fill="url(#colorWpm)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default Results;
