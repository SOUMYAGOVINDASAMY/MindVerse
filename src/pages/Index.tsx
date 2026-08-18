
import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import AgeSelector from "@/components/AgeSelector";
import AgeValidationForm from "@/components/AgeValidationForm";
import KidsHome from "@/components/kids/KidsHome";
import TeensHome from "@/components/teens/TeensHome";
import ProHome from "@/components/pro/ProHome";
import QuizInterface from "@/components/quiz/QuizInterface";
import QuizResult from "@/components/quiz/QuizResult";
import GameInterface from "@/components/games/GameInterface";
import Leaderboard from "@/components/quiz/Leaderboard";
import { saveScore } from "@/services/dbService";

type AgeGroup = "kids" | "teens" | "pro" | null;
type AppState = "age-selection" | "age-validation" | "home" | "quiz" | "game" | "results" | "leaderboard";

const Index = () => {
  const [ageGroup, setAgeGroup] = useState<AgeGroup>(null);
  const [appState, setAppState] = useState<AppState>("age-validation");
  const [quizCategory, setQuizCategory] = useState("");
  const [gameId, setGameId] = useState("");
  const [quizScore, setQuizScore] = useState({ score: 0, total: 0 });
  const [playerName, setPlayerName] = useState("");

  const handleAgeValidationComplete = (age: AgeGroup, name: string) => {
    setAgeGroup(age);
    setPlayerName(name);
    setAppState("home");
  };

  const handleSelectInitialAge = () => {
    setAppState("age-selection");
  };

  const handleAgeSelect = (age: AgeGroup) => {
    setAgeGroup(age);
    setAppState("age-validation");
  };

  const handleStartQuiz = (category: string = "general") => {
    setQuizCategory(category);
    setAppState("quiz");
  };

  const handleStartGame = (game: string) => {
    setGameId(game);
    setAppState("game");
  };

  const handleQuizComplete = (score: number, total: number) => {
    setQuizScore({ score, total });
    
    // Save score to database
    if (ageGroup && playerName) {
      saveScore(playerName, ageGroup, quizCategory, score, total);
    }
    
    setAppState("results");
  };

  const handleRetakeQuiz = () => {
    setAppState("home");
  };

  const handleHome = () => {
    setAppState("home");
  };

  const handleBack = () => {
    setAppState("home");
  };

  const handleViewLeaderboard = () => {
    setAppState("leaderboard");
  };

  const renderContent = () => {
    switch (appState) {
      case "age-validation":
        return (
          <motion.div
            key="age-validation"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen flex items-center justify-center bg-gray-50"
          >
            <div className="w-full max-w-md">
              <AgeValidationForm onSelectAge={handleAgeValidationComplete} />
              <div className="text-center mt-4">
                <button 
                  onClick={handleSelectInitialAge}
                  className="text-blue-500 hover:text-blue-700 text-sm"
                >
                  Or select your age group directly
                </button>
              </div>
            </div>
          </motion.div>
        );
      case "age-selection":
        return (
          <motion.div
            key="age-selection"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen flex items-center justify-center"
          >
            <AgeSelector onSelectAge={handleAgeSelect} />
          </motion.div>
        );
      case "home":
        if (ageGroup === "kids") {
          return (
            <motion.div
              key="kids-home"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <KidsHome onStartQuiz={handleStartQuiz} onStartGame={handleStartGame} />
            </motion.div>
          );
        } else if (ageGroup === "teens") {
          return (
            <motion.div
              key="teens-home"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <TeensHome onStartQuiz={handleStartQuiz} />
            </motion.div>
          );
        } else if (ageGroup === "pro") {
          return (
            <motion.div
              key="pro-home"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <ProHome onStartQuiz={handleStartQuiz} />
            </motion.div>
          );
        }
        break;
      case "quiz":
        return (
          <motion.div
            key="quiz"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {ageGroup && (
              <QuizInterface
                ageGroup={ageGroup}
                category={quizCategory}
                onComplete={handleQuizComplete}
                onBack={handleBack}
                playerName={playerName}
              />
            )}
          </motion.div>
        );
      case "game":
        return (
          <motion.div
            key="game"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <GameInterface gameId={gameId} onBack={handleBack} />
          </motion.div>
        );
      case "results":
        return (
          <motion.div
            key="results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {ageGroup && (
              <QuizResult
                score={quizScore.score}
                total={quizScore.total}
                ageGroup={ageGroup}
                onRetake={handleRetakeQuiz}
                onHome={handleHome}
                onViewLeaderboard={handleViewLeaderboard}
                playerName={playerName}
              />
            )}
          </motion.div>
        );
      case "leaderboard":
        return (
          <motion.div
            key="leaderboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {ageGroup && (
              <Leaderboard
                ageGroup={ageGroup}
                category={quizCategory}
                onClose={handleHome}
              />
            )}
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AnimatePresence mode="wait">{renderContent()}</AnimatePresence>
    </div>
  );
};

export default Index;
