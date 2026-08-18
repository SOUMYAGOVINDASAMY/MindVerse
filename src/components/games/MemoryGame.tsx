
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { ArrowLeft, Trophy, Clock, RotateCw } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import confetti from "canvas-confetti";

interface MemoryCard {
  id: number;
  emoji: string;
  isFlipped: boolean;
  isMatched: boolean;
}

interface MemoryGameProps {
  onBack: () => void;
}

const EMOJIS = [
  "🐶", "🐱", "🐭", "🐰", "🦊", "🐻", "🐼", "🐨", 
  "🦁", "🐯", "🐮", "🐷", "🐸", "🐵", "🦄", "🐬"
];

const MemoryGame: React.FC<MemoryGameProps> = ({ onBack }) => {
  const [cards, setCards] = useState<MemoryCard[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [matchedPairs, setMatchedPairs] = useState<number>(0);
  const [moves, setMoves] = useState<number>(0);
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [gameCompleted, setGameCompleted] = useState<boolean>(false);
  const [timer, setTimer] = useState<number>(0);
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("easy");
  const { toast } = useToast();

  // Start game with selected difficulty
  const startGame = (selectedDifficulty: "easy" | "medium" | "hard") => {
    setDifficulty(selectedDifficulty);
    setGameStarted(true);
    setGameCompleted(false);
    setMatchedPairs(0);
    setMoves(0);
    setTimer(0);
    setFlippedCards([]);
    
    let cardCount: number;
    switch (selectedDifficulty) {
      case "easy":
        cardCount = 8; // 4 pairs
        break;
      case "medium":
        cardCount = 12; // 6 pairs
        break;
      case "hard":
        cardCount = 16; // 8 pairs
        break;
      default:
        cardCount = 8;
    }
    
    // Create shuffled deck
    const selectedEmojis = EMOJIS.slice(0, cardCount / 2);
    const cardDeck = [...selectedEmojis, ...selectedEmojis]
      .map((emoji, index) => ({
        id: index,
        emoji,
        isFlipped: false,
        isMatched: false,
      }))
      .sort(() => Math.random() - 0.5);
    
    setCards(cardDeck);
  };

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (gameStarted && !gameCompleted) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer + 1);
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [gameStarted, gameCompleted]);

  // Card flipping logic
  const handleCardClick = (cardId: number) => {
    // Prevent clicking if already two cards are flipped or the card is already flipped/matched
    const card = cards.find((c) => c.id === cardId);
    if (flippedCards.length >= 2 || card?.isFlipped || card?.isMatched) {
      return;
    }
    
    // Flip the card
    const newCards = cards.map((card) => 
      card.id === cardId ? { ...card, isFlipped: true } : card
    );
    setCards(newCards);
    
    // Add to flipped cards
    const newFlippedCards = [...flippedCards, cardId];
    setFlippedCards(newFlippedCards);
    
    // If two cards are flipped, check for match
    if (newFlippedCards.length === 2) {
      setMoves((prev) => prev + 1);
      
      const firstCard = cards.find((card) => card.id === newFlippedCards[0]);
      const secondCard = cards.find((card) => card.id === newFlippedCards[1]);
      
      if (firstCard?.emoji === secondCard?.emoji) {
        // It's a match!
        setTimeout(() => {
          const matchedCards = cards.map((card) => 
            card.id === newFlippedCards[0] || card.id === newFlippedCards[1]
              ? { ...card, isMatched: true }
              : card
          );
          setCards(matchedCards);
          setFlippedCards([]);
          setMatchedPairs((prev) => {
            const newMatches = prev + 1;
            if (newMatches === cards.length / 2) {
              // Game completed
              setGameCompleted(true);
              celebrateWin();
            }
            return newMatches;
          });
        }, 500);
      } else {
        // Not a match, flip cards back
        setTimeout(() => {
          const resetCards = cards.map((card) => 
            card.id === newFlippedCards[0] || card.id === newFlippedCards[1]
              ? { ...card, isFlipped: false }
              : card
          );
          setCards(resetCards);
          setFlippedCards([]);
        }, 1000);
      }
    }
  };

  // Restart game
  const restartGame = () => {
    startGame(difficulty);
  };

  // Format time for display (mm:ss)
  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  // Calculate score based on difficulty, time, and moves
  const calculateScore = () => {
    if (!gameCompleted) return 0;
    
    const baseScore = difficulty === "easy" ? 100 : difficulty === "medium" ? 200 : 300;
    const timeDeduction = Math.floor(timer / 5); // Deduct points for time
    const movesDeduction = moves * 2; // Deduct points for moves
    
    return Math.max(baseScore - timeDeduction - movesDeduction, 0);
  };

  // Celebration animation
  const celebrateWin = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
    
    const score = calculateScore();
    
    toast({
      title: "Congratulations! 🎉",
      description: `You completed the game in ${formatTime(timer)} with ${moves} moves. Score: ${score}`,
    });
  };

  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-kids-background to-kids-card">
      <div className="max-w-5xl mx-auto">
        <header className="mb-6 flex items-center justify-between">
          <Button variant="outline" onClick={onBack} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Games</span>
          </Button>
          <h1 className="text-3xl font-bold text-kids-primary">Memory Match</h1>
        </header>

        {!gameStarted ? (
          <Card className="p-6 max-w-md mx-auto">
            <h2 className="text-2xl font-bold text-center mb-4">Choose Difficulty</h2>
            <p className="text-gray-600 mb-6 text-center">
              Flip cards to find matching pairs. The faster you match them all, the higher your score!
            </p>
            <div className="space-y-4">
              <Button 
                onClick={() => startGame("easy")} 
                className="w-full bg-green-500 hover:bg-green-600"
              >
                Easy (4 pairs)
              </Button>
              <Button 
                onClick={() => startGame("medium")} 
                className="w-full bg-yellow-500 hover:bg-yellow-600"
              >
                Medium (6 pairs)
              </Button>
              <Button 
                onClick={() => startGame("hard")} 
                className="w-full bg-red-500 hover:bg-red-600"
              >
                Hard (8 pairs)
              </Button>
            </div>
          </Card>
        ) : (
          <>
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-4">
                <div className="bg-white p-2 rounded-md shadow flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  <span className="font-bold">{matchedPairs}/{cards.length / 2}</span>
                </div>
                
                <div className="bg-white p-2 rounded-md shadow flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-500" />
                  <span className="font-bold">{formatTime(timer)}</span>
                </div>
              </div>
              
              <Button onClick={restartGame} className="flex items-center gap-2">
                <RotateCw className="h-4 w-4" />
                Restart
              </Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-3 mb-6">
              {cards.map((card) => (
                <motion.div
                  key={card.id}
                  className={`aspect-square cursor-pointer perspective-1000 transform-3d`}
                  whileHover={{ scale: card.isMatched || card.isFlipped ? 1 : 1.05 }}
                  onClick={() => handleCardClick(card.id)}
                >
                  <div 
                    className={`w-full h-full transition-transform duration-500 transform-style-3d relative ${
                      card.isFlipped || card.isMatched ? 'rotate-y-180' : ''
                    }`}
                  >
                    {/* Card Back */}
                    <div className={`absolute w-full h-full backface-hidden bg-kids-primary rounded-lg flex items-center justify-center text-white text-2xl font-bold ${
                      card.isFlipped || card.isMatched ? 'opacity-0' : 'opacity-100'
                    }`}>
                      ?
                    </div>
                    
                    {/* Card Front */}
                    <div className={`absolute w-full h-full backface-hidden rotate-y-180 rounded-lg flex items-center justify-center text-5xl ${
                      card.isMatched ? 'bg-green-100' : 'bg-white'
                    }`}>
                      {card.emoji}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {gameCompleted && (
              <Card className="p-4 max-w-md mx-auto">
                <h2 className="text-2xl font-bold text-center">You Won! 🎉</h2>
                <p className="text-center my-2">
                  Completed in {formatTime(timer)} with {moves} moves.
                </p>
                <p className="text-center text-2xl font-bold my-2">
                  Score: {calculateScore()}
                </p>
                <div className="flex justify-center gap-2 mt-4">
                  <Button onClick={restartGame} className="flex-1">Play Again</Button>
                  <Button onClick={onBack} variant="outline" className="flex-1">Back to Games</Button>
                </div>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MemoryGame;
