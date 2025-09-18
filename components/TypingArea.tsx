import React, { useMemo, useRef, useEffect, useState } from 'react';
import Caret from './Caret';

interface TypingAreaProps {
  words: string;
  typed: string;
  isPracticeMode: boolean;
}

interface CharacterProps {
  char: string;
  typedChar: string | undefined;
  state: 'correct' | 'incorrect' | 'untyped';
  isCurrent: boolean;
  isErrorChar: boolean;
}

const Character: React.FC<CharacterProps> = React.memo(({ char, typedChar, state, isCurrent, isErrorChar }) => {
  let displayChar = char;
  let className: string;

  if (state === 'correct') {
    className = 'text-primary';
  } else if (state === 'incorrect') {
    if (char === ' ') {
      className = 'bg-incorrect rounded';
    } else {
      className = 'text-incorrect';
      displayChar = typedChar || char;
    }
  } else {
    className = 'text-secondary';
  }

  const animationClass = isErrorChar ? 'animate-shake' : '';

  return (
    <span className={`${className} relative ${animationClass}`}>
      {displayChar}
      {isCurrent && <Caret />}
    </span>
  );
});

const TypingArea: React.FC<TypingAreaProps> = ({ words, typed, isPracticeMode }) => {
  const [errorIndex, setErrorIndex] = useState<number | null>(null);

  const characters = useMemo(() => {
    return words.split('').map((char, index) => {
      let state: 'correct' | 'incorrect' | 'untyped' = 'untyped';
      let typedChar: string | undefined;
      
      if (index < typed.length) {
        state = typed[index] === char ? 'correct' : 'incorrect';
        typedChar = typed[index];
      }

      const isErrorCharInPractice = isPracticeMode && state === 'untyped' && typed.length === index && typed[index-1] !== words[index-1] && index > 0;
      
      return (
        <Character
          key={`${char}_${index}`}
          char={char}
          typedChar={typedChar}
          state={state}
          isCurrent={index === typed.length}
          isErrorChar={index === errorIndex}
        />
      );
    });
  }, [words, typed, isPracticeMode, errorIndex]);

  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (containerRef.current) containerRef.current.focus();
  }, [words]);

  useEffect(() => {
    if (isPracticeMode) {
      const firstError = typed.split('').findIndex((char, i) => char !== words[i]);
      if (firstError !== -1 && typed.length > firstError) {
        setErrorIndex(firstError);
        setTimeout(() => setErrorIndex(null), 200);
      }
    }
  }, [typed, words, isPracticeMode]);

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      className="text-2xl sm:text-3xl leading-relaxed tracking-wider break-all max-h-48 overflow-y-auto p-2 focus:outline-none font-georgian"
    >
      {characters}
    </div>
  );
};

export default TypingArea;
