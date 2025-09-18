import { commonWords, quotes } from './words';
import { Quote } from '../types';

export const generateWords = (count: number, punctuation: boolean = false): string => {
  let baseWords: string[] = [];
  for (let i = 0; i < count; i++) {
    const randomIndex = Math.floor(Math.random() * commonWords.length);
    baseWords.push(commonWords[randomIndex]);
  }

  if (!punctuation) {
    return baseWords.join(' ');
  }

  let words: string[] = baseWords.map(word => {
    if (Math.random() < 0.1) {
      return String(Math.floor(Math.random() * 1000));
    }
    return word;
  });

  if (words.length > 0 && isNaN(parseInt(words[0]))) {
    words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1);
  }

  for (let i = 0; i < words.length - 1; i++) {
    if (isNaN(parseInt(words[i])) && Math.random() < 0.2) {
      const punctuationMarks = ['.', ',', '?', '!'];
      const randomPunctuation = punctuationMarks[Math.floor(Math.random() * punctuationMarks.length)];
      words[i] += randomPunctuation;

      if (['.', '?', '!'].includes(randomPunctuation) && i + 1 < words.length && isNaN(parseInt(words[i+1]))) {
        words[i+1] = words[i+1].charAt(0).toUpperCase() + words[i+1].slice(1);
      }
    }
  }

  return words.join(' ');
};

export const generateNumbers = (count: number): string => {
  const numbers: string[] = [];
  for (let i = 0; i < count; i++) {
    numbers.push(String(Math.floor(Math.random() * 1000)));
  }
  return numbers.join(' ');
}

export const generateQuote = (): Quote => {
  const randomIndex = Math.floor(Math.random() * quotes.length);
  return quotes[randomIndex];
};

export const countErrors = (typed: string, expected: string): number => {
  const expectedChars = expected.slice(0, typed.length);
  let errors = 0;
  for (let i = 0; i < typed.length; i++) {
    if (typed[i] !== expectedChars[i]) {
      errors++;
    }
  }
  return errors;
};

export const calculateWPM = (correctChars: number, seconds: number): number => {
  if (seconds === 0) return 0;
  const words = correctChars / 5;
  const minutes = seconds / 60;
  return Math.round(words / minutes) || 0;
};

export const calculateRawWPM = (totalChars: number, seconds: number): number => {
  if (seconds === 0) return 0;
  const words = totalChars / 5;
  const minutes = seconds / 60;
  return Math.round(words / minutes) || 0;
};

export const calculateConsistency = (wpmHistory: number[]): number => {
  if (wpmHistory.length < 2) return 100;
  
  const wpmValues = wpmHistory.filter(wpm => wpm > 0);
  if (wpmValues.length < 2) return 100;

  const mean = wpmValues.reduce((a, b) => a + b, 0) / wpmValues.length;
  if (mean === 0) return 100;

  const fluctuations = wpmValues.slice(1).map((wpm, i) => Math.abs(wpm - wpmValues[i]));
  const avgFluctuation = fluctuations.reduce((a, b) => a + b, 0) / fluctuations.length;

  const consistency = Math.max(0, 100 - (avgFluctuation / mean) * 100);
  return isNaN(consistency) ? 0 : Math.round(consistency);
};


export const calculateAccuracy = (correctChars: number, totalChars: number): number => {
  if (totalChars === 0) return 100;
  return Math.round((correctChars / totalChars) * 100) || 0;
};
