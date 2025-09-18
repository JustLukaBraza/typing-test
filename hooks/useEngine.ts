import { useState, useEffect, useCallback, useRef } from 'react';
import { generateWords, countErrors, calculateWPM, calculateAccuracy, generateQuote, calculateRawWPM, calculateConsistency } from '../utils/helpers';
import { State, TestMode, TestConfig, Quote } from '../types';
import { DEFAULT_TEST_CONFIG } from '../constants';

export const useEngine = () => {
  const [state, setState] = useState<State>(State.Waiting);
  const [testMode, setTestMode] = useState<TestMode>(TestMode.Time);
  const [testConfig, setTestConfig] = useState<TestConfig>(DEFAULT_TEST_CONFIG);
  const [isPunctuationEnabled, setIsPunctuationEnabled] = useState<boolean>(false);
  
  const [words, setWords] = useState<string>('');
  const [quoteSource, setQuoteSource] = useState<string>('');
  const [typed, setTyped] = useState<string>('');
  const [errors, setErrors] = useState<number>(0);
  const [totalTyped, setTotalTyped] = useState<number>(0);

  const [startTime, setStartTime] = useState<number | null>(null);
  const [wpm, setWpm] = useState<number>(0);
  const [rawWpm, setRawWpm] = useState<number>(0);
  const [accuracy, setAccuracy] = useState<number>(100);
  const [consistency, setConsistency] = useState<number>(0);
  const [wpmHistory, setWpmHistory] = useState<number[]>([]);

  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const wordsToType = useRef<string>('');

  const restartTest = useCallback((selectedQuote?: Quote) => {
    if (timer.current) {
      clearInterval(timer.current);
    }
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
    
    let textToType: string;
    if (testMode === TestMode.Quote) {
      const quote = selectedQuote || generateQuote();
      textToType = quote.text;
      setQuoteSource(quote.source);
    } else {
      const wordCount = testMode === TestMode.Words ? testConfig.words : 200;
      textToType = generateWords(wordCount, isPunctuationEnabled);
    }
    wordsToType.current = textToType;
    setWords(wordsToType.current);
  }, [testMode, testConfig, isPunctuationEnabled]);

  const setQuoteForTest = useCallback((quote: Quote) => {
    restartTest(quote);
  }, [restartTest]);

  useEffect(() => {
    restartTest();
  }, [testMode, testConfig, isPunctuationEnabled, restartTest]);

  const handleTyping = useCallback((key: string) => {
    if (state === State.Finished) return;

    if (state === State.Waiting) {
      setState(State.Running);
      setStartTime(Date.now());
    }

    setTotalTyped((prev) => prev + 1);

    if (key === 'Backspace') {
      setTyped((prev) => prev.slice(0, -1));
    } else if (key.length === 1) {
      setTyped((prev) => prev + key);
    }
  }, [state]);

  // Handle keydown events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        restartTest();
        return;
      }
      if (e.key.length === 1 || e.key === 'Backspace') {
        handleTyping(e.key);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleTyping, restartTest]);

  // Timer and WPM calculation logic
  useEffect(() => {
    if (state === State.Running && startTime) {
      timer.current = setInterval(() => {
        const elapsedTime = (Date.now() - startTime) / 1000;
        
        const currentErrors = countErrors(typed, words);
        setErrors(currentErrors);

        const correctChars = typed.length - currentErrors;
        const currentWpm = calculateWPM(correctChars, elapsedTime);
        setWpm(currentWpm);
        setWpmHistory((prev) => [...prev, currentWpm]);
        
        const currentAccuracy = calculateAccuracy(correctChars, typed.length);
        setAccuracy(currentAccuracy);
        
        // Time mode end condition
        if (testMode === TestMode.Time && elapsedTime >= testConfig.time) {
          setState(State.Finished);
          if (timer.current) clearInterval(timer.current);
          
          const finalWpmHistory = [...wpmHistory, currentWpm];
          const finalRawWpm = calculateRawWPM(typed.length, testConfig.time);
          const finalConsistency = calculateConsistency(finalWpmHistory);
          setRawWpm(finalRawWpm);
          setConsistency(finalConsistency);
          setWpmHistory(finalWpmHistory); // Update with the very last WPM
        }
      }, 1000);
    } else {
      if (timer.current) {
        clearInterval(timer.current);
      }
    }

    return () => {
      if (timer.current) {
        clearInterval(timer.current);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, startTime, typed, words, testMode, testConfig.time, wpmHistory]);

  // Words and Quote mode end condition
  useEffect(() => {
    if (
      (testMode === TestMode.Words || testMode === TestMode.Quote) &&
      words.length > 0 &&
      typed.length === words.length
    ) {
      setState(State.Finished);
      if (timer.current) clearInterval(timer.current);
      
      const elapsedTime = (Date.now() - (startTime || Date.now())) / 1000;
      const finalErrors = countErrors(typed, words);
      setErrors(finalErrors);
      const correctChars = typed.length - finalErrors;
      const finalWpm = calculateWPM(correctChars, elapsedTime);
      setWpm(finalWpm);
      
      const finalWpmHistory = [...wpmHistory, finalWpm];
      setWpmHistory(finalWpmHistory);
      setAccuracy(calculateAccuracy(correctChars, typed.length));
      
      const finalRawWpm = calculateRawWPM(typed.length, elapsedTime);
      const finalConsistency = calculateConsistency(finalWpmHistory);
      setRawWpm(finalRawWpm);
      setConsistency(finalConsistency);
    }
  }, [typed, words, testMode, startTime, wpmHistory]);

  return {
    state,
    words,
    typed,
    errors,
    totalTyped,
    wpm,
    rawWpm,
    accuracy,
    consistency,
    wpmHistory,
    restartTest,
    setTestMode,
    testMode,
    testConfig,
    setTestConfig,
    quoteSource,
    isPunctuationEnabled,
    setIsPunctuationEnabled,
    setQuoteForTest,
  };
};
