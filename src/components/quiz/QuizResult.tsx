
import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Trophy } from "lucide-react";

interface QuizResultProps {
  score: number;
  total: number;
  ageGroup: "kids" | "teens" | "pro";
  onRetake: () => void;
  onHome: () => void;
  onViewLeaderboard?: () => void;
  playerName?: string;
}

interface ThemeClass {
  background: string;
  card: string;
  button: string;
  secondaryButton: string;
}

const QuizResult: React.FC<QuizResultProps> = ({
  score,
  total,
  ageGroup,
  onRetake,
  onHome,
  onViewLeaderboard,
  playerName
}) => {
  const percentage = Math.round((score / total) * 100);
  
  let message = "";
  
  // Initialize themeClass with proper types
  let themeClass: ThemeClass = {
    background: "bg-gradient-to-br from-background to-background",
    card: "border-primary",
    button: "bg-primary hover:bg-opacity-90 text-white",
    secondaryButton: "bg-white text-primary border border-primary hover:bg-background"
  };
  
  if (percentage >= 80) {
    message = "Excellent work! You're a master!";
  } else if (percentage >= 60) {
    message = "Good job! Keep practicing to improve!";
  } else {
    message = "Nice try! Practice more to improve your score!";
  }
  
  switch(ageGroup) {
    case "kids":
      themeClass = {
        background: "bg-gradient-to-br from-kids-background to-kids-card",
        card: "border-kids-primary",
        button: "bg-kids-primary hover:bg-kids-secondary text-white",
        secondaryButton: "bg-white text-kids-primary border border-kids-primary hover:bg-kids-card",
      };
      break;
    case "teens":
      themeClass = {
        background: "bg-gradient-to-br from-teens-background to-teens-card",
        card: "border-teens-primary",
        button: "bg-teens-primary hover:bg-opacity-90 text-white",
        secondaryButton: "bg-white text-teens-primary border border-teens-primary hover:bg-teens-card",
      };
      break;
    case "pro":
      themeClass = {
        background: "bg-gradient-to-br from-pro-background to-pro-card",
        card: "border-pro-accent",
        button: "bg-pro-primary hover:bg-opacity-90 text-white",
        secondaryButton: "bg-white text-pro-primary border border-pro-primary hover:bg-pro-card",
      };
      break;
  }
  
  return (
    <div className={`p-6 min-h-screen ${themeClass.background}`}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-lg mx-auto"
      >
        <Card className={`overflow-hidden shadow-lg ${themeClass.card}`}>
          <CardContent className="p-8">
            <div className="flex flex-col items-center text-center">
              <div className="w-24 h-24 mb-6 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-12 w-12 text-green-600" />
              </div>
              
              {playerName && (
                <h3 className="text-xl mb-2">
                  Well done, <span className="font-bold">{playerName}</span>!
                </h3>
              )}
              
              <h2 className="text-3xl font-bold mb-2">Quiz Completed!</h2>
              <p className="mb-6 text-gray-600">{message}</p>
              
              <div className="text-5xl font-bold mb-2">
                {percentage}%
              </div>
              <p className="mb-8">
                You scored <span className="font-bold">{score}</span> out of <span className="font-bold">{total}</span> questions
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-xs">
                <Button 
                  onClick={onHome}
                  className={themeClass.secondaryButton}
                >
                  Go Home
                </Button>
                <Button 
                  onClick={onRetake}
                  className={themeClass.button}
                >
                  Try Again
                </Button>
              </div>

              {onViewLeaderboard && (
                <Button 
                  onClick={onViewLeaderboard}
                  className="mt-4 flex items-center gap-2"
                  variant="outline"
                >
                  <Trophy className="h-4 w-4" />
                  View Leaderboard
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default QuizResult;
