
import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, User, Timer, Flame, Volume2, VolumeX } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import confetti from "canvas-confetti";

interface Question {
  id: number;
  text: string;
  options: string[];
  correctAnswer: number;
}

interface QuizInterfaceProps {
  ageGroup: "kids" | "teens" | "pro";
  category: string;
  onComplete: (score: number, total: number) => void;
  onBack: () => void;
  playerName?: string;
}

const QuizInterface: React.FC<QuizInterfaceProps> = ({ 
  ageGroup, 
  category,
  onComplete,
  onBack,
  playerName
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [score, setScore] = useState(0);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [streak, setStreak] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [questionStartTime, setQuestionStartTime] = useState(0);
  const { toast } = useToast();

  const correctSound = useRef<HTMLAudioElement | null>(null);
  const wrongSound = useRef<HTMLAudioElement | null>(null);
  const timerSound = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Create audio elements
    correctSound.current = new Audio("/sounds/correct.mp3");
    wrongSound.current = new Audio("/sounds/wrong.mp3");
    timerSound.current = new Audio("/sounds/timer.mp3");

    // Load the questions
    setTimeout(() => {
      const mockQuestions = generateMockQuestions(ageGroup, category);
      setQuestions(mockQuestions);
      setLoading(false);
      
      // Set initial timer based on age group
      const initialTime = getInitialTime(ageGroup);
      setTimeRemaining(initialTime);
      setQuestionStartTime(Date.now());
    }, 1000);

    return () => {
      // Cleanup audio elements
      if (correctSound.current) correctSound.current.pause();
      if (wrongSound.current) wrongSound.current.pause();
      if (timerSound.current) timerSound.current.pause();
    };
  }, [ageGroup, category]);

  // Timer effect
  useEffect(() => {
    if (loading || isAnswerChecked || !questions.length) return;
    
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          // Auto-check answer if time runs out
          if (!isAnswerChecked) {
            handleTimeOut();
          }
          return 0;
        }
        // Play timer sound when time is running low
        if (prev <= 5 && soundEnabled && timerSound.current) {
          timerSound.current.play().catch(() => {});
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [loading, isAnswerChecked, questions, soundEnabled]);

  const getInitialTime = (ageGroup: string) => {
    switch(ageGroup) {
      case "kids": return 20;
      case "teens": return 30;
      case "pro": return 45;
      default: return 30;
    }
  };

  const handleOptionSelect = (optionIndex: number) => {
    if (isAnswerChecked) return;
    setSelectedOption(optionIndex);
  };

  const handleCheckAnswer = () => {
    if (selectedOption === null) {
      toast({
        title: "Select an option first!",
        description: "Please select an answer before checking.",
        variant: "destructive"
      });
      return;
    }

    checkAnswer();
  };

  const handleTimeOut = () => {
    if (selectedOption !== null) {
      checkAnswer();
    } else {
      setIsAnswerChecked(true);
      if (soundEnabled && wrongSound.current) {
        wrongSound.current.play().catch(() => {});
      }
      
      toast({
        title: "Time's up!",
        description: `The correct answer was: ${questions[currentQuestionIndex].options[questions[currentQuestionIndex].correctAnswer]}`,
        variant: "destructive"
      });
      
      // Reset streak on timeout
      setStreak(0);
    }
  };

  const checkAnswer = () => {
    setIsAnswerChecked(true);
    const isCorrect = selectedOption === questions[currentQuestionIndex].correctAnswer;
    
    // Calculate speed bonus (more points for faster answers)
    const timeElapsed = Math.floor((Date.now() - questionStartTime) / 1000);
    const timeBonus = Math.max(0, getInitialTime(ageGroup) - timeElapsed) / 10;
    
    if (isCorrect) {
      // Increment score with potential time bonus
      const pointsEarned = 1 + (streak >= 2 ? 0.5 : 0) + timeBonus;
      setScore(prevScore => prevScore + pointsEarned);
      
      // Increment streak
      setStreak(prevStreak => {
        const newStreak = prevStreak + 1;
        if (newStreak >= 3) {
          // Trigger confetti for impressive streaks
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
          });
        }
        return newStreak;
      });
      
      if (soundEnabled && correctSound.current) {
        correctSound.current.play().catch(() => {});
      }
      
      toast({
        title: "Correct!",
        description: `${streak >= 2 ? '🔥 Streak bonus! ' : ''}Great job! That's the right answer.${timeBonus > 0.1 ? ' Speed bonus: +' + timeBonus.toFixed(1) : ''}`,
        variant: "default"
      });
    } else {
      // Reset streak on wrong answer
      setStreak(0);
      
      if (soundEnabled && wrongSound.current) {
        wrongSound.current.play().catch(() => {});
      }
      
      toast({
        title: "Incorrect",
        description: `The correct answer was: ${questions[currentQuestionIndex].options[questions[currentQuestionIndex].correctAnswer]}`,
        variant: "destructive"
      });
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedOption(null);
      setIsAnswerChecked(false);
      
      // Reset timer for next question
      setTimeRemaining(getInitialTime(ageGroup));
      setQuestionStartTime(Date.now());
    } else {
      onComplete(Math.round(score), questions.length);
    }
  };

  const toggleSound = () => {
    setSoundEnabled(!soundEnabled);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-blue-500 border-b-purple-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg">Loading questions...</p>
        </div>
      </div>
    );
  }

  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  const currentQuestion = questions[currentQuestionIndex];
  const themeClass = getThemeClass(ageGroup);

  // Calculate timer color based on remaining time
  const getTimerColor = () => {
    const maxTime = getInitialTime(ageGroup);
    const percentage = (timeRemaining / maxTime) * 100;
    if (percentage > 60) return "text-green-500";
    if (percentage > 30) return "text-yellow-500";
    return "text-red-500";
  };

  return (
    <div className={`p-6 min-h-screen ${themeClass.background}`}>
      <div className="max-w-3xl mx-auto">
        <header className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <Button variant="outline" onClick={onBack}>
              Back
            </Button>
            <div className="flex items-center gap-4">
              {playerName && (
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>{playerName}</span>
                </div>
              )}
              <span className={`text-lg font-bold ${themeClass.textPrimary}`}>
                Score: {Math.round(score)} / {questions.length}
              </span>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={toggleSound}
                className="h-8 w-8"
              >
                {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
              </Button>
            </div>
          </div>
          <Progress value={progress} className={`h-2 ${themeClass.progress}`} />
          
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-2">
              <Timer className={`h-5 w-5 ${getTimerColor()}`} />
              <span className={`font-bold ${getTimerColor()}`}>
                {timeRemaining}s
              </span>
            </div>
            
            {streak >= 2 && (
              <div className="flex items-center gap-1 bg-amber-500/20 px-2 py-1 rounded-full">
                <Flame className="h-4 w-4 text-amber-500" />
                <span className="text-amber-600 font-bold">{streak}</span>
              </div>
            )}
          </div>
        </header>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestionIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className={`mb-6 ${themeClass.card}`}>
              <CardContent className="p-6">
                <h2 className={`text-xl md:text-2xl font-bold mb-6 ${themeClass.textPrimary}`}>
                  {currentQuestionIndex + 1}. {currentQuestion.text}
                </h2>

                <div className="space-y-4">
                  {currentQuestion.options.map((option, index) => (
                    <motion.div 
                      key={index}
                      whileHover={{ scale: isAnswerChecked ? 1 : 1.01 }}
                      whileTap={{ scale: isAnswerChecked ? 1 : 0.98 }}
                    >
                      <motion.div 
                        className={`p-4 rounded-lg border-2 cursor-pointer flex items-center justify-between
                          ${selectedOption === index ? themeClass.selectedOption : 'border-gray-200'} 
                          ${isAnswerChecked && index === currentQuestion.correctAnswer ? themeClass.correctOption : ''}
                          ${isAnswerChecked && selectedOption === index && index !== currentQuestion.correctAnswer ? themeClass.incorrectOption : ''}
                          ${isAnswerChecked && selectedOption !== index ? 'opacity-60' : 'hover:border-gray-300'}
                        `}
                        onClick={() => handleOptionSelect(index)}
                        animate={isAnswerChecked && index === currentQuestion.correctAnswer ? 
                          { scale: [1, 1.05, 1], backgroundColor: ["#ffffff", "#f0fdf4", "#ffffff"] } : 
                          {}
                        }
                        transition={{ duration: 0.5 }}
                      >
                        <span>{option}</span>
                        {isAnswerChecked && index === currentQuestion.correctAnswer && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2 }}
                          >
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                          </motion.div>
                        )}
                        {isAnswerChecked && selectedOption === index && index !== currentQuestion.correctAnswer && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2 }}
                          >
                            <XCircle className="h-5 w-5 text-red-500" />
                          </motion.div>
                        )}
                      </motion.div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        <div className="flex justify-end">
          {!isAnswerChecked ? (
            <Button 
              onClick={handleCheckAnswer}
              className={`${themeClass.button} relative overflow-hidden`}
              disabled={selectedOption === null}
            >
              <span>Check Answer</span>
              {selectedOption !== null && (
                <motion.span 
                  className="absolute inset-0 bg-white"
                  initial={{ scale: 1.5, opacity: 0 }}
                  animate={{ scale: [1.5, 1], opacity: [0.3, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1 }}
                />
              )}
            </Button>
          ) : (
            <Button 
              onClick={handleNextQuestion}
              className={themeClass.button}
            >
              {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'See Results'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

const getThemeClass = (ageGroup: "kids" | "teens" | "pro") => {
  switch(ageGroup) {
    case "kids":
      return {
        background: "bg-gradient-to-br from-kids-background to-kids-card",
        card: "border-kids-primary shadow-md",
        button: "bg-kids-primary hover:bg-kids-secondary text-white",
        progress: "bg-kids-primary/50",
        textPrimary: "text-kids-primary",
        selectedOption: "border-kids-primary bg-kids-card",
        correctOption: "border-green-500 bg-green-50",
        incorrectOption: "border-red-500 bg-red-50"
      };
    case "teens":
      return {
        background: "bg-gradient-to-br from-teens-background to-teens-card",
        card: "border-teens-primary shadow-md",
        button: "bg-teens-primary hover:bg-opacity-90 text-white",
        progress: "bg-teens-primary/50",
        textPrimary: "text-teens-primary",
        selectedOption: "border-teens-primary bg-teens-card",
        correctOption: "border-green-500 bg-green-50",
        incorrectOption: "border-red-500 bg-red-50"
      };
    case "pro":
      return {
        background: "bg-gradient-to-br from-pro-background to-pro-card",
        card: "border-pro-accent shadow-md",
        button: "bg-pro-primary hover:bg-opacity-90 text-white",
        progress: "bg-pro-primary/50",
        textPrimary: "text-pro-primary",
        selectedOption: "border-pro-primary bg-pro-card",
        correctOption: "border-green-500 bg-green-50",
        incorrectOption: "border-red-500 bg-red-50"
      };
  }
};

const generateMockQuestions = (ageGroup: "kids" | "teens" | "pro", category: string): Question[] => {
  const questions: Question[] = [];
  
  const questionCount = ageGroup === "kids" ? 10 : 25;
  
  if (ageGroup === "kids") {
    questions.push(
      {
        id: 1,
        text: "Which animal is known as the 'King of the Jungle'?",
        options: ["Elephant", "Lion", "Tiger", "Giraffe"],
        correctAnswer: 1
      },
      {
        id: 2,
        text: "How many legs does a spider have?",
        options: ["4", "6", "8", "10"],
        correctAnswer: 2
      },
      {
        id: 3,
        text: "What is the name of the biggest planet in our solar system?",
        options: ["Earth", "Mars", "Jupiter", "Saturn"],
        correctAnswer: 2
      },
      {
        id: 4,
        text: "Which of these is NOT a color of the rainbow?",
        options: ["Red", "Orange", "Black", "Green"],
        correctAnswer: 2
      },
      {
        id: 5,
        text: "What do you call a baby frog?",
        options: ["Cub", "Puppy", "Tadpole", "Kid"],
        correctAnswer: 2
      },
      {
        id: 6,
        text: "What do bees make?",
        options: ["Milk", "Honey", "Juice", "Water"],
        correctAnswer: 1
      },
      {
        id: 7,
        text: "Which is the tallest animal in the world?",
        options: ["Elephant", "Giraffe", "Dinosaur", "Horse"],
        correctAnswer: 1
      },
      {
        id: 8,
        text: "How many days are there in a week?",
        options: ["5", "6", "7", "8"],
        correctAnswer: 2
      },
      {
        id: 9,
        text: "What is the name of the toy cowboy in Toy Story?",
        options: ["Buzz", "Rex", "Woody", "Andy"],
        correctAnswer: 2
      },
      {
        id: 10,
        text: "Which fruit is yellow and curved?",
        options: ["Apple", "Banana", "Orange", "Strawberry"],
        correctAnswer: 1
      }
    );
  } else if (ageGroup === "teens") {
    if (category === "math") {
      questions.push(
        {
          id: 1,
          text: "Solve for x: 2x + 5 = 15",
          options: ["x = 5", "x = 7", "x = 10", "x = 3"],
          correctAnswer: 0
        },
        {
          id: 2,
          text: "What is the area of a circle with radius 5 units?",
          options: ["25π square units", "10π square units", "5π square units", "20π square units"],
          correctAnswer: 0
        },
        {
          id: 3,
          text: "What is the value of sin(90°)?",
          options: ["0", "1", "√2", "Undefined"],
          correctAnswer: 1
        }
      );
      
      for (let i = 4; i <= 25; i++) {
        questions.push({
          id: i,
          text: `Math Question ${i}`,
          options: ["Option A", "Option B", "Option C", "Option D"],
          correctAnswer: i % 4
        });
      }
    } else if (category === "science") {
      questions.push(
        {
          id: 1,
          text: "What is the chemical symbol for gold?",
          options: ["Au", "Ag", "Fe", "Gd"],
          correctAnswer: 0
        },
        {
          id: 2,
          text: "Which planet is known as the 'Red Planet'?",
          options: ["Venus", "Mars", "Jupiter", "Mercury"],
          correctAnswer: 1
        },
        {
          id: 3,
          text: "What is the process by which plants make their food?",
          options: ["Respiration", "Photosynthesis", "Transpiration", "Digestion"],
          correctAnswer: 1
        }
      );
      
      for (let i = 4; i <= 25; i++) {
        questions.push({
          id: i,
          text: `Science Question ${i}`,
          options: ["Option A", "Option B", "Option C", "Option D"],
          correctAnswer: i % 4
        });
      }
    }
  } else if (ageGroup === "pro") {
    if (category === "aptitude") {
      questions.push(
        {
          id: 1,
          text: "If 8 men can complete a work in 20 days, how many days will it take for 10 men to complete the same work?",
          options: ["16 days", "25 days", "18 days", "22 days"],
          correctAnswer: 0
        },
        {
          id: 2,
          text: "A train running at 54 kmph crosses a platform of length 200m in 24 seconds. What is the length of the train?",
          options: ["100m", "150m", "200m", "250m"],
          correctAnswer: 1
        },
        {
          id: 3,
          text: "The average of 20 numbers is zero. Of them, at the most, how many may be greater than zero?",
          options: ["0", "1", "10", "19"],
          correctAnswer: 3
        }
      );
      
      for (let i = 4; i <= 25; i++) {
        questions.push({
          id: i,
          text: `Aptitude Question ${i}`,
          options: ["Option A", "Option B", "Option C", "Option D"],
          correctAnswer: i % 4
        });
      }
    } else if (category === "logical") {
      questions.push(
        {
          id: 1,
          text: "In a row of children, Arun is 7th from the left and Vijay is 12th from the right. If they interchange their positions, Arun becomes 22nd from the left. How many children are there in the row?",
          options: ["33", "34", "35", "Cannot be determined"],
          correctAnswer: 0
        },
        {
          id: 2,
          text: "If STUDENT is coded as RUTCFMS, how is TEACHER coded?",
          options: ["SDBDGDQ", "SDBGDQD", "UFBDIFS", "UFBDGFS"],
          correctAnswer: 1
        },
        {
          id: 3,
          text: "What is the missing number in the sequence: 2, 6, 12, 20, ?",
          options: ["30", "42", "35", "28"],
          correctAnswer: 0
        }
      );
      
      for (let i = 4; i <= 25; i++) {
        questions.push({
          id: i,
          text: `Logical Reasoning Question ${i}`,
          options: ["Option A", "Option B", "Option C", "Option D"],
          correctAnswer: i % 4
        });
      }
    } else if (category === "coding") {
      questions.push(
        {
          id: 1,
          text: "What is the output of the following code?\nint x = 5;\nint y = ++x + x++;\nSystem.out.println(y);",
          options: ["11", "12", "10", "13"],
          correctAnswer: 0
        },
        {
          id: 2,
          text: "Which of the following is NOT a primitive data type in Java?",
          options: ["int", "String", "boolean", "char"],
          correctAnswer: 1
        },
        {
          id: 3,
          text: "What is the time complexity of binary search?",
          options: ["O(n)", "O(n log n)", "O(log n)", "O(n²)"],
          correctAnswer: 2
        }
      );
      
      for (let i = 4; i <= 25; i++) {
        questions.push({
          id: i,
          text: `Coding Question ${i}`,
          options: ["Option A", "Option B", "Option C", "Option D"],
          correctAnswer: i % 4
        });
      }
    }
  }
  
  return questions;
};

export default QuizInterface;
