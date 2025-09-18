import { LeaderboardEntry } from '../types';

const LEADERBOARD_KEY = 'typingTestLeaderboard';
const MAX_ENTRIES = 10;

export const getLeaderboard = (): LeaderboardEntry[] => {
  try {
    const data = localStorage.getItem(LEADERBOARD_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Failed to retrieve leaderboard:", error);
    return [];
  }
};

export const addToLeaderboard = (newEntry: LeaderboardEntry) => {
  if (newEntry.wpm <= 0) return; // Don't save empty results

  try {
    const leaderboard = getLeaderboard();
    
    leaderboard.push(newEntry);
    
    leaderboard.sort((a, b) => b.wpm - a.wpm);
    
    const updatedLeaderboard = leaderboard.slice(0, MAX_ENTRIES);
    
    localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(updatedLeaderboard));
  } catch (error) {
    console.error("Failed to update leaderboard:", error);
  }
};
