
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Brain, RefreshCw, Home, Award } from "lucide-react";
import confetti from "canvas-confetti";

interface BrainlyGameProps {
  onBack: () => void;
}

interface Question {
  question: string;
  options: string[];
  correctAnswer: string;
}

const BrainlyGame: React.FC<BrainlyGameProps> = ({ onBack }) => {
  const [questions] = useState<Question[]>([
    {
      question: "What is the capital of France?",
      options: ["London", "Berlin", "Paris", "Madrid"],
      correctAnswer: "Paris",
    },
    {
      question: "How many legs does a spider have?",
      options: ["4", "6", "8", "10"],
      correctAnswer: "8",
    },
    {
      question: "Which planet is known as the Red Planet?",
      options: ["Earth", "Mars", "Jupiter", "Venus"],
      correctAnswer: "Mars",
    },
    {
      question: "What is the largest mammal in the world?",
      options: ["Elephant", "Giraffe", "Blue Whale", "Dinosaur"],
      correctAnswer: "Blue Whale",
    },
    {
      question: "How many sides does a triangle have?",
      options: ["3", "4", "5", "6"],
      correctAnswer: "3",
    },
  ]);
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [hintUsed, setHintUsed] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15);
  
  const currentQuestion = questions[currentQuestionIndex];

  useEffect(() => {
    if (gameOver) return;
    
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          if (selectedOption === null) {
            handleAnswer("");
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [currentQuestionIndex, gameOver, selectedOption]);
  
  const handleAnswer = (option: string) => {
    if (selectedOption !== null) return;
    
    setSelectedOption(option);
    const correct = option === currentQuestion.correctAnswer;
    setIsCorrect(correct);
    
    if (correct) {
      setScore(score + (hintUsed ? 5 : 10));
      setTimeout(() => {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }, 100);
    }
    
    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setSelectedOption(null);
        setIsCorrect(null);
        setHintUsed(false);
        setTimeLeft(15);
      } else {
        setGameOver(true);
      }
    }, 1500);
  };
  
  const useHint = () => {
    if (hintUsed || selectedOption !== null) return;
    
    // Remove two wrong answers
    const wrongOptions = currentQuestion.options.filter(
      option => option !== currentQuestion.correctAnswer
    );
    const shuffled = [...wrongOptions].sort(() => 0.5 - Math.random());
    const optionsToRemove = shuffled.slice(0, 2);
    
    setHintUsed(true);
  };
  
  const resetGame = () => {
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setIsCorrect(null);
    setScore(0);
    setGameOver(false);
    setHintUsed(false);
    setTimeLeft(15);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 p-4">
      <div className="max-w-3xl mx-auto">
        <header className="flex justify-between items-center mb-6">
          <Button
            onClick={onBack}
            variant="outline"
            className="flex items-center gap-2 border-2 border-purple-300"
          >
            <Home className="w-4 h-4" /> Back to Games
          </Button>
          
          <div className="flex items-center gap-3">
            <div className="bg-white px-3 py-1 rounded-full shadow flex items-center gap-2">
              <Brain className="text-indigo-500 h-4 w-4" />
              <span className="font-medium">Score: {score}</span>
            </div>
            
            <div className="bg-white px-3 py-1 rounded-full shadow flex items-center gap-2">
              {timeLeft <= 5 ? (
                <motion.span 
                  className={`font-medium ${timeLeft <= 3 ? "text-red-500" : "text-orange-500"}`}
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                >
                  Time: {timeLeft}s
                </motion.span>
              ) : (
                <span className="font-medium">Time: {timeLeft}s</span>
              )}
            </div>
          </div>
        </header>
        
        {gameOver ? (
          <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-2 border-purple-300 p-4">
            <CardContent className="flex flex-col items-center justify-center py-10">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", duration: 0.5 }}
              >
                <Award className="h-20 w-20 text-yellow-500 mb-4" />
              </motion.div>
              
              <motion.h2
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-3xl font-bold text-center mb-4"
              >
                Game Over!
              </motion.h2>
              
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-xl text-center mb-6"
              >
                Your final score: <span className="font-bold text-indigo-600">{score}</span> points
              </motion.p>
              
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="flex gap-4"
              >
                <Button onClick={resetGame} className="game-button bg-indigo-500 hover:bg-indigo-600 flex items-center gap-2">
                  <RefreshCw className="h-4 w-4" /> Play Again
                </Button>
                <Button onClick={onBack} variant="outline" className="game-button border-2 border-indigo-300">
                  Back to Games
                </Button>
              </motion.div>
            </CardContent>
          </Card>
        ) : (
          <>
            <motion.div
              key={currentQuestionIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="mb-6"
            >
              <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-2 border-purple-300 p-6">
                <div className="flex justify-between items-center mb-4">
                  <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-medium">
                    Question {currentQuestionIndex + 1} of {questions.length}
                  </span>
                  
                  <Button 
                    onClick={useHint}
                    disabled={hintUsed || selectedOption !== null}
                    variant="outline"
                    size="sm"
                    className="text-sm border-indigo-300 hover:bg-indigo-50"
                  >
                    Use Hint
                  </Button>
                </div>
                
                <h2 className="text-2xl font-bold mb-6">{currentQuestion.question}</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {currentQuestion.options.map((option) => {
                    const isSelected = selectedOption === option;
                    const isCorrectAnswer = option === currentQuestion.correctAnswer;
                    const showAsHidden = hintUsed && 
                      !isCorrectAnswer && 
                      currentQuestion.options.indexOf(option) < 2;
                    
                    return (
                      <Button
                        key={option}
                        onClick={() => handleAnswer(option)}
                        disabled={selectedOption !== null || showAsHidden}
                        className={`p-4 h-auto text-lg justify-start normal-case font-normal ${
                          showAsHidden 
                            ? "opacity-30 bg-gray-200" 
                            : isSelected 
                              ? isCorrectAnswer 
                                ? "bg-green-500 hover:bg-green-500" 
                                : "bg-red-500 hover:bg-red-500"
                              : selectedOption !== null && isCorrectAnswer
                                ? "bg-green-500"
                                : "bg-white hover:bg-indigo-50"
                        }`}
                      >
                        <span className="text-left">{option}</span>
                      </Button>
                    );
                  })}
                </div>
              </Card>
            </motion.div>
            
            {isCorrect !== null && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center p-4 rounded-lg mb-4"
              >
                <p className={`text-xl font-bold ${isCorrect ? "text-green-600" : "text-red-600"}`}>
                  {isCorrect ? "Correct! Well done! 🎉" : "Oops! That's not right. Try the next one! 💪"}
                </p>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default BrainlyGame;
