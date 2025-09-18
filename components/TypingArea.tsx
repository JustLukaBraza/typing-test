import React, { useMemo, useRef, useEffect } from 'react';
import Caret from './Caret';

interface TypingAreaProps {
  words: string;
  typed: string;
}

const Character: React.FC<{
  char: string;
  state: 'correct' | 'incorrect' | 'untyped';
  isCurrent: boolean;
}> = React.memo(({ char, state, isCurrent }) => {
  const getClassName = () => {
    if (state === 'correct') return 'text-primary';
    if (state === 'incorrect') {
       if (char === ' ') return 'bg-incorrect rounded';
       return 'text-incorrect';
    }
    return 'text-secondary';
  };

  return (
    <span className={`${getClassName()} relative`}>
      {char}
      {isCurrent && <Caret />}
    </span>
  );
});

const TypingArea: React.FC<TypingAreaProps> = ({ words, typed }) => {
  const characters = useMemo(() => {
    return words.split('').map((char, index) => {
      let state: 'correct' | 'incorrect' | 'untyped' = 'untyped';
      if (index < typed.length) {
        state = typed[index] === char ? 'correct' : 'incorrect';
      }
      return (
        <Character
          key={`${char}_${index}`}
          char={char}
          state={state}
          isCurrent={index === typed.length}
        />
      );
    });
  }, [words, typed]);

  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.focus();
    }
  }, [words]);

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      className="text-2xl leading-relaxed tracking-wider break-all max-h-48 overflow-y-auto p-2 focus:outline-none"
    >
      {characters}
    </div>
  );
};

export default TypingArea;