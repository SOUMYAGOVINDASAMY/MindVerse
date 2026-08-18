
// Define the interface for our score records
interface ScoreRecord {
  id: number;
  playerName: string;
  ageGroup: "kids" | "teens" | "pro";
  category: string;
  score: number;
  totalQuestions: number;
  timestamp: string;
}

// Define interface for game statistics
interface GameStats {
  totalGamesPlayed: number;
  correctAnswers: number;
  incorrectAnswers: number;
  averageTime: number;
  bestStreak: number;
  lastPlayed: string;
}

// Local storage keys
const SCORES_STORAGE_KEY = 'quiz_game_scores';
const STATS_STORAGE_KEY = 'quiz_game_stats';

// Initialize the local storage with empty array if it doesn't exist
const initializeLocalStorage = () => {
  if (!localStorage.getItem(SCORES_STORAGE_KEY)) {
    localStorage.setItem(SCORES_STORAGE_KEY, JSON.stringify([]));
  }
  
  if (!localStorage.getItem(STATS_STORAGE_KEY)) {
    const initialStats = {
      totalGamesPlayed: 0,
      correctAnswers: 0,
      incorrectAnswers: 0,
      averageTime: 0,
      bestStreak: 0,
      lastPlayed: new Date().toISOString()
    };
    localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(initialStats));
  }
};

// Call this function when the app starts
initializeLocalStorage();

// Save a new score record
export const saveScore = async (
  playerName: string,
  ageGroup: "kids" | "teens" | "pro",
  category: string,
  score: number,
  totalQuestions: number
): Promise<ScoreRecord> => {
  try {
    // Get current scores
    const scoresJson = localStorage.getItem(SCORES_STORAGE_KEY) || '[]';
    const scores: ScoreRecord[] = JSON.parse(scoresJson);
    
    // Create new record
    const newRecord: ScoreRecord = {
      id: Date.now(), // Use timestamp as a simple unique ID
      playerName,
      ageGroup,
      category,
      score,
      totalQuestions,
      timestamp: new Date().toISOString()
    };
    
    // Add to scores and save back to localStorage
    scores.push(newRecord);
    localStorage.setItem(SCORES_STORAGE_KEY, JSON.stringify(scores));
    
    // Update game stats
    updateGameStats(score, totalQuestions);
    
    console.log("Score saved to local storage:", newRecord);
    return newRecord;
    
  } catch (error) {
    console.error("Error saving score:", error);
    // Fallback to returning a local object if storage fails
    const newRecord: ScoreRecord = {
      id: Math.floor(Math.random() * 10000),
      playerName,
      ageGroup,
      category,
      score,
      totalQuestions,
      timestamp: new Date().toISOString()
    };
    return newRecord;
  }
};

// Update game statistics
const updateGameStats = (score: number, totalQuestions: number) => {
  try {
    const statsJson = localStorage.getItem(STATS_STORAGE_KEY) || '{}';
    const stats: GameStats = JSON.parse(statsJson);
    
    // Update stats
    stats.totalGamesPlayed += 1;
    stats.correctAnswers += score;
    stats.incorrectAnswers += (totalQuestions - score);
    stats.lastPlayed = new Date().toISOString();
    
    localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(stats));
  } catch (error) {
    console.error("Error updating game stats:", error);
  }
};

// Save game streak
export const saveGameStreak = (streak: number) => {
  try {
    const statsJson = localStorage.getItem(STATS_STORAGE_KEY) || '{}';
    const stats: GameStats = JSON.parse(statsJson);
    
    // Update best streak if current streak is higher
    if (streak > stats.bestStreak) {
      stats.bestStreak = streak;
      localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(stats));
      return true;
    }
    return false;
  } catch (error) {
    console.error("Error saving game streak:", error);
    return false;
  }
};

// Get game statistics
export const getGameStats = (): GameStats => {
  try {
    const statsJson = localStorage.getItem(STATS_STORAGE_KEY) || '{}';
    return JSON.parse(statsJson);
  } catch (error) {
    console.error("Error getting game stats:", error);
    return {
      totalGamesPlayed: 0,
      correctAnswers: 0,
      incorrectAnswers: 0,
      averageTime: 0,
      bestStreak: 0,
      lastPlayed: new Date().toISOString()
    };
  }
};

// Get leaderboard data filtered by age group and/or category
export const getLeaderboard = async (
  ageGroup?: "kids" | "teens" | "pro",
  category?: string
): Promise<ScoreRecord[]> => {
  try {
    // Get current scores
    const scoresJson = localStorage.getItem(SCORES_STORAGE_KEY) || '[]';
    const scores: ScoreRecord[] = JSON.parse(scoresJson);
    
    // Filter scores based on ageGroup and category if provided
    const filteredScores = scores.filter(score => {
      let match = true;
      
      if (ageGroup) {
        match = match && score.ageGroup === ageGroup;
      }
      
      if (category) {
        match = match && score.category === category;
      }
      
      return match;
    });
    
    // Sort by score in descending order
    const sortedScores = filteredScores.sort((a, b) => b.score - a.score);
    
    return sortedScores;
    
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    // Return empty array if storage fails
    return [];
  }
};

// This function is just for development/testing - it adds some sample scores
export const addSampleScores = () => {
  const sampleScores: ScoreRecord[] = [
    {
      id: 1,
      playerName: "Alice",
      ageGroup: "kids",
      category: "animals",
      score: 8,
      totalQuestions: 10,
      timestamp: new Date(Date.now() - 3600000).toISOString()
    },
    {
      id: 2,
      playerName: "Bob",
      ageGroup: "kids",
      category: "animals",
      score: 7,
      totalQuestions: 10,
      timestamp: new Date(Date.now() - 7200000).toISOString()
    },
    {
      id: 3,
      playerName: "Charlie",
      ageGroup: "teens",
      category: "science",
      score: 9,
      totalQuestions: 10,
      timestamp: new Date(Date.now() - 10800000).toISOString()
    },
    {
      id: 4,
      playerName: "Diana",
      ageGroup: "pro",
      category: "history",
      score: 10,
      totalQuestions: 10,
      timestamp: new Date(Date.now() - 14400000).toISOString()
    }
  ];
  
  localStorage.setItem(SCORES_STORAGE_KEY, JSON.stringify(sampleScores));
  console.log("Sample scores added to local storage");
};

// Expose a function to reset all scores (for testing/development)
export const resetScores = () => {
  localStorage.setItem(SCORES_STORAGE_KEY, JSON.stringify([]));
  console.log("All scores reset");
};
