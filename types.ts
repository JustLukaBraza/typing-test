export enum State {
  Waiting,
  Running,
  Finished,
}

export enum TestMode {
  Time = 'time',
  Words = 'words',
  Quote = 'quote',
  Practice = 'practice',
  Numbers = 'numbers',
}

export interface TestConfig {
  time: number;
  words: number;
  numbers: number;
}

export interface Quote {
  text: string;
  source: string;
}

export type Theme = 'dark' | 'light' | 'matrix';

export interface LeaderboardEntry {
  wpm: number;
  accuracy: number;
  date: number;
  testType: string;
}

export interface ProblemKey {
  key: string;
  count: number;
}
