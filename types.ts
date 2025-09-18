export enum State {
  Waiting,
  Running,
  Finished,
}

export enum TestMode {
  Time = 'time',
  Words = 'words',
  Quote = 'quote',
}

export interface TestConfig {
  time: number;
  words: number;
}

export interface Quote {
  text: string;
  source: string;
}
