import { useState, useEffect, useCallback, useRef } from 'react';
import { generateWords, countErrors, calculateWPM, calculateAccuracy, generateQuote, calculateRawWPM, calculateConsistency, generateNumbers } from '../utils/helpers';
import { State, TestMode, TestConfig, Quote, ProblemKey } from '../types';
import { DEFAULT_TEST_CONFIG } from '../constants';
import * as sounds from '../utils/sounds';
import { addToLeaderboard } from '../utils/leaderboard';

export const useEngine = () => {
  const [state, setState] = useState<State>(State.Waiting);
  const [testMode, setTestMode] = useState<TestMode>(TestMode.Time);
  const [testConfig, setTestConfig] = useState<TestConfig>(DEFAULT_TEST_CONFIG);
  const [isPunctuationEnabled, setIsPunctuationEnabled] = useState<boolean>(false);
  const [isSoundEnabled, setIsSoundEnabled] = useState<boolean>(() => localStorage.getItem('soundEnabled') === 'true');
  
  const [words, setWords] = useState<string>('');
  const [quoteSource, setQuoteSource] = useState<string>('');
  const [typed, setTyped] = useState<string>('');
  const [errors, setErrors] = useState<number>(0);
  const [totalTyped, setTotalTyped] = useState<number>(0);
  const [problemKeys, setProblemKeys] = useState<ProblemKey[]>([]);

  const [startTime, setStartTime] = useState<number | null>(null);
  const [wpm, setWpm] = useState<number>(0);
  const [rawWpm, setRawWpm] = useState<number>(0);
  const [accuracy, setAccuracy] = useState<number>(100);
  const [consistency, setConsistency] = useState<number>(0);
  const [wpmHistory, setWpmHistory] = useState<number[]>([]);

  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const wordsToType = useRef<string>('');
  const problemKeysRef = useRef<Record<string, number>>({});

  const playSound = useCallback((sound: 'keypress' | 'error' | 'finish') => {
    if (!isSoundEnabled) return;
    sounds.playSound(sound);
  }, [isSoundEnabled]);

  useEffect(() => {
    localStorage.setItem('soundEnabled', String(isSoundEnabled));
  }, [isSoundEnabled]);

  const restartTest = useCallback((selectedText?: { text: string; source: string; }) => {
    if (timer.current) clearInterval(timer.current);
    setState(State.Waiting);
    setTyped('');
    setErrors(0);
    setTotalTyped(0);
    setStartTime(null);
    setWpm(0);
    setRawWpm(0);
    setAccuracy(100);
    setConsistency(0);
    setWpmHistory([]);
    setQuoteSource('');
    problemKeysRef.current = {};
    setProblemKeys([]);
    
    let textToType: string;
    if (selectedText) {
      textToType = selectedText.text;
      setQuoteSource(selectedText.source);
    } else if (testMode === TestMode.Quote) {
      const quote = generateQuote();
      textToType = quote.text;
      setQuoteSource(quote.source);
    } else if (testMode === TestMode.Numbers) {
      textToType = generateNumbers(testConfig.numbers);
    } else {
      const wordCount = testMode === TestMode.Words ? testConfig.words : 200;
      textToType = generateWords(wordCount, isPunctuationEnabled);
    }
    wordsToType.current = textToType;
    setWords(wordsToType.current);
  }, [testMode, testConfig, isPunctuationEnabled, playSound]);

  const setQuoteForTest = useCallback((quote: Quote) => {
    restartTest({ text: quote.text, source: quote.source });
  }, [restartTest]);

  useEffect(() => {
    restartTest();
  }, [testMode, testConfig, isPunctuationEnabled, restartTest]);

  const finishTest = useCallback(() => {
    setState(State.Finished);
    playSound('finish');
    if (timer.current) clearInterval(timer.current);
    
    const elapsedTime = (Date.now() - (startTime || Date.now())) / 1000;
    const finalErrors = countErrors(typed, words);
    setErrors(finalErrors);
    const correctChars = typed.length - finalErrors;
    const finalWpm = calculateWPM(correctChars, elapsedTime);
    const finalRawWpm = calculateRawWPM(typed.length, elapsedTime);
    const finalAccuracy = calculateAccuracy(correctChars, typed.length);
    const finalWpmHistory = [...wpmHistory, finalWpm > 0 ? finalWpm : 0];
    const finalConsistency = calculateConsistency(finalWpmHistory);
    
    setWpm(finalWpm);
    setRawWpm(finalRawWpm);
    setAccuracy(finalAccuracy);
    setWpmHistory(finalWpmHistory);
    setConsistency(finalConsistency);
    setProblemKeys(
      Object.entries(problemKeysRef.current)
        .map(([key, count]) => ({ key, count }))
        .sort((a, b) => b.count - a.count)
    );

    let testType = '';
    switch(testMode) {
      case TestMode.Time: testType = `დრო ${testConfig.time}წმ`; break;
      case TestMode.Words: testType = `სიტყვები ${testConfig.words}`; break;
      case TestMode.Numbers: testType = `რიცხვები ${testConfig.numbers}`; break;
      case TestMode.Quote: testType = 'ციტატა'; break;
      default: testType = 'სავარჯიშო';
    }

    addToLeaderboard({ wpm: finalWpm, accuracy: finalAccuracy, date: Date.now(), testType });
  }, [startTime, typed, words, wpmHistory, testMode, testConfig, playSound]);


  const handleTyping = useCallback((key: string) => {
    if (state === State.Finished) return;

    if (state === State.Waiting) {
      setState(State.Running);
      setStartTime(Date.now());
    }

    setTotalTyped((prev) => prev + 1);

    if (key === 'Backspace') {
      setTyped((prev) => prev.slice(0, -1));
      // No sound on backspace
    } else if (key.length === 1) {
      const currentTypedChar = typed[typed.length];
      const expectedChar = words[typed.length];

      if (testMode === TestMode.Practice && key !== expectedChar) {
        playSound('error');
        if (expectedChar && expectedChar !== ' ') {
            problemKeysRef.current[expectedChar] = (problemKeysRef.current[expectedChar] || 0) + 1;
        }
        return; // Don't allow typing incorrect character
      }

      if (key === expectedChar) {
        playSound('keypress');
      } else {
        playSound('error');
        if (expectedChar && expectedChar !== ' ') {
            problemKeysRef.current[expectedChar] = (problemKeysRef.current[expectedChar] || 0) + 1;
        }
      }
      setTyped((prev) => prev + key);
    }
  }, [state, testMode, playSound, typed, words]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        restartTest();
        return;
      }
      const target = e.target as HTMLElement;
      if (['INPUT', 'TEXTAREA'].includes(target.tagName)) return;
      if (state !== State.Finished) {
        if (e.key === ' ') e.preventDefault();
        if (e.key.length === 1 || e.key === 'Backspace') handleTyping(e.key);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleTyping, restartTest, state]);

  useEffect(() => {
    if (state === State.Running && startTime) {
      timer.current = setInterval(() => {
        const elapsedTime = (Date.now() - startTime) / 1000;
        const currentErrors = countErrors(typed, words);
        setErrors(currentErrors);
        const correctChars = typed.length - currentErrors;
        const currentWpm = calculateWPM(correctChars, elapsedTime);
        setWpm(currentWpm);
        setAccuracy(calculateAccuracy(correctChars, typed.length));
        
        if (testMode === TestMode.Time) {
           if (elapsedTime >= testConfig.time) {
             finishTest();
           } else {
             setWpmHistory((prev) => [...prev, currentWpm]);
           }
        }
      }, 1000);
    }
    return () => { if (timer.current) clearInterval(timer.current); };
  }, [state, startTime, typed, words, testMode, testConfig.time, finishTest]);

  useEffect(() => {
    if ((testMode === TestMode.Words || testMode === TestMode.Quote || testMode === TestMode.Numbers || testMode === TestMode.Practice) &&
        words.length > 0 && typed.length >= words.length) {
      finishTest();
    }
  }, [typed, words, testMode, finishTest]);

  return {
    state, words, typed, errors, totalTyped, wpm, rawWpm, accuracy, consistency, wpmHistory, problemKeys,
    restartTest, setTestMode, testMode, testConfig, setTestConfig, quoteSource, isPunctuationEnabled, 
    setIsPunctuationEnabled, setQuoteForTest, isSoundEnabled, setIsSoundEnabled, startTime,
  };
};
