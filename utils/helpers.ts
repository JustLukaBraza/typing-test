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

  // With punctuation and numbers
  let words: string[] = baseWords.map(word => {
    // 10% chance to replace word with a number
    if (Math.random() < 0.1) {
      return String(Math.floor(Math.random() * 1000));
    }
    return word;
  });

  // Capitalize first word
  if (words.length > 0 && isNaN(parseInt(words[0]))) {
    words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1);
  }

  for (let i = 0; i < words.length - 1; i++) {
    // Add punctuation to words that are not numbers
    if (isNaN(parseInt(words[i])) && Math.random() < 0.2) { // 20% chance to add punctuation
      const punctuationMarks = ['.', ',', '?', '!'];
      const randomPunctuation = punctuationMarks[Math.floor(Math.random() * punctuationMarks.length)];
      words[i] += randomPunctuation;

      // Capitalize next word if it's a sentence ender, and the next word is not a number
      if (['.', '?', '!'].includes(randomPunctuation) && i + 1 < words.length && isNaN(parseInt(words[i+1]))) {
        words[i+1] = words[i+1].charAt(0).toUpperCase() + words[i+1].slice(1);
      }
    }
  }

  return words.join(' ');
};


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
  return Math.round(words / minutes);
};

export const calculateRawWPM = (totalChars: number, seconds: number): number => {
  if (seconds === 0) return 0;
  const words = totalChars / 5;
  const minutes = seconds / 60;
  return Math.round(words / minutes);
};

export const calculateConsistency = (wpmHistory: number[]): number => {
  if (wpmHistory.length < 2) return 100;
  const mean = wpmHistory.reduce((a, b) => a + b, 0) / wpmHistory.length;
  if (mean === 0) return 0;
  const variance = wpmHistory.map(wpm => Math.pow(wpm - mean, 2)).reduce((a, b) => a + b, 0) / wpmHistory.length;
  const stdDev = Math.sqrt(variance);
  
  const consistency = Math.max(0, 100 - (stdDev / mean) * 100);
  return isNaN(consistency) ? 0 : Math.round(consistency);
};


export const calculateAccuracy = (correctChars: number, totalChars: number): number => {
  if (totalChars === 0) return 100;
  return Math.round((correctChars / totalChars) * 100);
};