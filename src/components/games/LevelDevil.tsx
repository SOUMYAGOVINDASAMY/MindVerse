
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { ArrowLeft, Heart, Star, Trophy } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import confetti from "canvas-confetti";

interface LevelDevilProps {
  onBack: () => void;
}

interface GameLevel {
  id: number;
  challenge: string;
  solution: string[];
  hint: string;
  difficulty: 1 | 2 | 3;
}

const GAME_LEVELS: GameLevel[] = [
  {
    id: 1,
    challenge: "Rearrange the letters to form an animal: A T C",
    solution: ["cat"],
    hint: "It meows!",
    difficulty: 1
  },
  {
    id: 2,
    challenge: "What's the next number in the sequence? 2, 4, 6, 8, _",
    solution: ["10"],
    hint: "These are even numbers.",
    difficulty: 1
  },
  {
    id: 3,
    challenge: "What goes up but never comes down?",
    solution: ["age", "your age"],
    hint: "Think about something that only increases as time passes.",
    difficulty: 2
  },
  {
    id: 4,
    challenge: "Solve this riddle: I have cities, but no houses. I have mountains, but no trees. I have water, but no fish. What am I?",
    solution: ["map", "a map"],
    hint: "You use it to find your way.",
    difficulty: 2
  },
  {
    id: 5,
    challenge: "Decode this word: BLAPPENI (Hint: It's a fruit)",
    solution: ["pineapple"],
    hint: "The letters need to be rearranged completely.",
    difficulty: 3
  },
  {
    id: 6,
    challenge: "Complete the pattern: 1, 4, 9, 16, 25, _",
    solution: ["36"],
    hint: "These are perfect square numbers.",
    difficulty: 3
  }
];

const LevelDevil: React.FC<LevelDevilProps> = ({ onBack }) => {
  const [currentLevel, setCurrentLevel] = useState<number>(1);
  const [userAnswer, setUserAnswer] = useState<string>("");
  const [lives, setLives] = useState<number>(3);
  const [score, setScore] = useState<number>(0);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [gameWon, setGameWon] = useState<boolean>(false);
  const [gameLost, setGameLost] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const { toast } = useToast();

  // Manage timer
  useEffect(() => {
    if (gameWon || gameLost) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setGameLost(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameWon, gameLost]);

  const handleAnswerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserAnswer(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const level = GAME_LEVELS.find(lvl => lvl.id === currentLevel);
    if (!level) return;
    
    const isCorrect = level.solution.some(sol => 
      userAnswer.trim().toLowerCase() === sol.toLowerCase()
    );
    
    if (isCorrect) {
      // Correct answer!
      const pointsEarned = level.difficulty * 10;
      setScore(prev => prev + pointsEarned);
      
      toast({
        title: "Correct!",
        description: `You earned ${pointsEarned} points.`,
      });
      
      // Small celebration for correct answer
      confetti({
        particleCount: 30,
        spread: 70,
        origin: { y: 0.6 }
      });
      
      // Check if all levels completed
      if (currentLevel === GAME_LEVELS.length) {
        setGameWon(true);
        // Big celebration for completing the game
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      } else {
        // Move to next level
        setCurrentLevel(prev => prev + 1);
        setUserAnswer("");
        setShowHint(false);
        setTimeLeft(60); // Reset timer for new level
      }
    } else {
      // Wrong answer
      setLives(prev => prev - 1);
      
      toast({
        title: "Incorrect",
        description: "Try again or use a hint!",
        variant: "destructive"
      });
      
      // Check if game over
      if (lives <= 1) {
        setGameLost(true);
      }
    }
  };

  const handleUseHint = () => {
    const level = GAME_LEVELS.find(lvl => lvl.id === currentLevel);
    if (!level) return;
    
    setShowHint(true);
    
    // Using a hint costs points based on difficulty
    const hintCost = level.difficulty * 2;
    setScore(prev => Math.max(0, prev - hintCost));
    
    toast({
      title: "Hint Used",
      description: `You lost ${hintCost} points for using a hint.`,
    });
  };

  const handleRestart = () => {
    setCurrentLevel(1);
    setUserAnswer("");
    setLives(3);
    setScore(0);
    setShowHint(false);
    setGameWon(false);
    setGameLost(false);
    setTimeLeft(60);
  };

  const currentLevelData = GAME_LEVELS.find(lvl => lvl.id === currentLevel);
  
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-red-50 to-orange-100">
      <div className="max-w-5xl mx-auto">
        <header className="mb-6 flex items-center justify-between">
          <Button variant="outline" onClick={onBack} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Games</span>
          </Button>
          <h1 className="text-3xl font-bold text-red-600">Level Devil</h1>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="border-2 border-red-400">
              <div className="flex items-center justify-between p-4 bg-red-50">
                <div className="flex items-center gap-3">
                  <div className="flex">
                    {[...Array(3)].map((_, i) => (
                      <Heart 
                        key={i} 
                        fill={i < lives ? "#ef4444" : "transparent"} 
                        stroke={i < lives ? "#ef4444" : "#cccccc"}
                        className="w-5 h-5" 
                      />
                    ))}
                  </div>
                  <div className="font-bold">Lives</div>
                </div>
                
                <div className="text-center">
                  <div className={`font-bold text-xl ${timeLeft <= 10 ? 'text-red-500 animate-pulse' : ''}`}>
                    {formatTime(timeLeft)}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-500" />
                  <span className="font-bold text-xl">{score}</span>
                </div>
              </div>

              <CardContent className="p-6">
                {(gameWon || gameLost) ? (
                  <div className="text-center py-10">
                    {gameWon ? (
                      <div>
                        <motion.div 
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="flex justify-center mb-6"
                        >
                          <div className="relative">
                            <Trophy className="w-20 h-20 text-yellow-500" />
                            <motion.div
                              animate={{ y: [0, -10, 0] }}
                              transition={{ repeat: Infinity, duration: 2 }}
                              className="absolute top-0 right-0"
                            >
                              <Star className="w-8 h-8 text-yellow-300" />
                            </motion.div>
                          </div>
                        </motion.div>
                        <h2 className="text-3xl font-bold mb-3">Congratulations!</h2>
                        <p className="text-lg mb-6">You've completed all levels!</p>
                        <p className="text-2xl font-bold mb-10">Final Score: {score}</p>
                      </div>
                    ) : (
                      <div>
                        <h2 className="text-3xl font-bold text-red-500 mb-3">Game Over</h2>
                        <p className="text-lg mb-6">You ran out of lives or time.</p>
                        <p className="text-xl mb-2">You reached level {currentLevel}</p>
                        <p className="text-2xl font-bold mb-10">Final Score: {score}</p>
                      </div>
                    )}
                    
                    <div className="flex justify-center gap-4">
                      <Button onClick={handleRestart}>Play Again</Button>
                      <Button variant="outline" onClick={onBack}>Back to Games</Button>
                    </div>
                  </div>
                ) : currentLevelData ? (
                  <div>
                    <div className="flex justify-between items-center mb-6">
                      <div className="font-bold text-gray-600">Level {currentLevelData.id}/{GAME_LEVELS.length}</div>
                      <div className="flex">
                        {[...Array(currentLevelData.difficulty)].map((_, i) => (
                          <Star key={i} className="w-5 h-5 text-yellow-400" fill="#facc15" />
                        ))}
                      </div>
                    </div>
                    
                    <h2 className="text-xl font-bold mb-6">{currentLevelData.challenge}</h2>
                    
                    <form onSubmit={handleSubmit}>
                      <input
                        type="text"
                        value={userAnswer}
                        onChange={handleAnswerChange}
                        className="w-full p-3 border-2 rounded mb-4 focus:border-red-400 focus:ring focus:ring-red-200 outline-none"
                        placeholder="Type your answer here..."
                        autoFocus
                      />
                      <div className="flex justify-between">
                        <Button 
                          type="button"
                          variant="outline"
                          onClick={handleUseHint}
                          disabled={showHint}
                          className="flex items-center gap-2"
                        >
                          <span>Use Hint</span>
                          <span className="text-xs text-gray-500">(-{currentLevelData.difficulty * 2} points)</span>
                        </Button>
                        <Button type="submit">Submit Answer</Button>
                      </div>
                    </form>
                    
                    {showHint && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-6 p-3 bg-yellow-50 border border-yellow-200 rounded"
                      >
                        <p className="text-sm"><strong>Hint:</strong> {currentLevelData.hint}</p>
                      </motion.div>
                    )}
                  </div>
                ) : null}
              </CardContent>
            </Card>
          </div>
          
          <div>
            <Card className="border-2 border-red-400 mb-6">
              <div className="p-4 bg-red-50 font-bold">Game Rules</div>
              <CardContent className="p-4">
                <ul className="list-disc pl-5 space-y-2">
                  <li>Solve each level's challenge within the time limit</li>
                  <li>You have 3 lives - each wrong answer loses one life</li>
                  <li>Using hints will cost you points</li>
                  <li>Earn more points for harder challenges</li>
                  <li>Complete all levels to win!</li>
                </ul>
              </CardContent>
            </Card>
            
            <Card className="border-2 border-red-400">
              <div className="p-4 bg-red-50 font-bold">Difficulty Levels</div>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-400" fill="#facc15" />
                    <span>Easy: Simple puzzles for beginners</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      <Star className="w-5 h-5 text-yellow-400" fill="#facc15" />
                      <Star className="w-5 h-5 text-yellow-400" fill="#facc15" />
                    </div>
                    <span>Medium: More challenging puzzles</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      <Star className="w-5 h-5 text-yellow-400" fill="#facc15" />
                      <Star className="w-5 h-5 text-yellow-400" fill="#facc15" />
                      <Star className="w-5 h-5 text-yellow-400" fill="#facc15" />
                    </div>
                    <span>Hard: For expert puzzle solvers</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LevelDevil;
