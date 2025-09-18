import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Label } from 'recharts';
import { TestMode, TestConfig } from '../types';

interface ResultsProps {
  wpm: number;
  rawWpm: number;
  accuracy: number;
  errors: number;
  totalTyped: number;
  consistency: number;
  wpmHistory: number[];
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
  <div className="flex flex-col items-center justify-center p-4 bg-light-dark rounded-lg h-full">
    <div className="text-secondary text-sm font-georgian">{label}</div>
    <div className={`font-bold ${className}`}>{value}</div>
    {subValue && <div className="text-xs text-secondary">{subValue}</div>}
  </div>
);

const Results: React.FC<ResultsProps> = ({ wpm, rawWpm, accuracy, errors, totalTyped, consistency, wpmHistory, testMode, testConfig, quoteSource }) => {
  const chartData = wpmHistory.map((wpm, index) => ({
    second: index + 1,
    wpm,
  }));

  const testTypeString = () => {
    switch (testMode) {
      case TestMode.Time: return `დრო ${testConfig.time}წმ`;
      case TestMode.Words: return `სიტყვები ${testConfig.words}`;
      case TestMode.Quote: return `ციტატა`;
      default: return '';
    }
  };

  const correctChars = totalTyped - errors;

  return (
    <div className="w-full flex flex-col items-center gap-8 animate-fade-in">
      <div className="flex flex-col items-center">
        <span className="text-secondary text-lg">სწ/წთ</span>
        <span className="text-accent text-7xl font-bold">{wpm}</span>
      </div>

      <div className="w-full grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
        <StatCard label="საწყისი" value={rawWpm} subValue="სწ/წთ" className="text-primary text-4xl" />
        <StatCard label="სიზუსტე" value={`${accuracy}%`} className="text-correct text-4xl" />
        <StatCard label="თანმიმდევრულობა" value={`${consistency}%`} className="text-primary text-4xl" />
        <StatCard label="ტესტის ტიპი" value={testTypeString()} className="text-primary text-2xl" />
        <StatCard label="სიმბოლოები" value={`${correctChars}/${totalTyped}`} className="text-primary text-4xl" />
        <StatCard label="შეცდომები" value={errors} className="text-incorrect text-4xl" />
      </div>

      {quoteSource && (
        <div className="w-full text-center italic text-secondary border-t border-b border-secondary/20 py-4">
          - {quoteSource}
        </div>
      )}
      
      {chartData.length > 1 && (
        <div className="w-full h-64 mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 20 }}>
              <defs>
                <linearGradient id="colorWpm" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7aa2f7" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#7aa2f7" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2c3a" />
              <XAxis dataKey="second" stroke="#565f89">
                <Label value="დრო (წმ)" position="insideBottom" offset={-15} fill="#565f89" />
              </XAxis>
              <YAxis stroke="#565f89">
                 <Label value="სწ/წთ" angle={-90} position="insideLeft" fill="#565f89" />
              </YAxis>
              <Tooltip 
                contentStyle={{ backgroundColor: '#1a1b26', border: '1px solid #2a2c3a', borderRadius: '0.5rem' }}
                labelStyle={{ color: '#a9b1d6' }}
                cursor={{ stroke: '#565f89' }}
              />
              <Area type="monotone" dataKey="wpm" stroke="#7aa2f7" strokeWidth={2} fillOpacity={1} fill="url(#colorWpm)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default Results;