import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Quote } from '../types';
import { CloseIcon } from './Icons';

interface QuoteSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  quotes: Quote[];
  onSelect: (quote: Quote) => void;
}

const QuoteSelector: React.FC<QuoteSelectorProps> = ({ isOpen, onClose, quotes, onSelect }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const modalRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const filteredQuotes = useMemo(() => {
    const query = searchQuery.toLowerCase();
    if (!query) return quotes;
    return quotes.filter(
      (quote) =>
        quote.text.toLowerCase().includes(query) ||
        quote.source.toLowerCase().includes(query)
    );
  }, [searchQuery, quotes]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      // Focus the search input when modal opens
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-dark/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div
        ref={modalRef}
        className="bg-light-dark rounded-xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[80vh]"
      >
        <header className="flex items-center justify-between p-4 border-b border-secondary/20">
          <h2 className="text-xl text-primary font-georgian">ციტატის არჩევა</h2>
          <button onClick={onClose} className="text-secondary hover:text-accent p-1 rounded-full">
            <CloseIcon />
          </button>
        </header>

        <div className="p-4">
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="მოძებნე ციტატა ან ავტორი..."
            className="w-full bg-dark px-4 py-2 rounded-lg text-primary focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>

        <ul className="overflow-y-auto flex-1 px-4 pb-4 space-y-2">
          {filteredQuotes.map((quote, index) => (
            <li key={index}>
              <button
                onClick={() => onSelect(quote)}
                className="w-full text-left p-3 bg-dark hover:bg-secondary/20 rounded-lg transition-colors duration-200"
              >
                <p className="text-primary truncate">{quote.text}</p>
                <p className="text-sm text-accent italic mt-1">- {quote.source}</p>
              </button>
            </li>
          ))}
          {filteredQuotes.length === 0 && (
            <div className="text-center text-secondary py-8">
              ციტატა არ მოიძებნა.
            </div>
          )}
        </ul>
      </div>
    </div>
  );
};

export default QuoteSelector;
