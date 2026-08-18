
import React from "react";
import PaintingGame from "./PaintingGame";
import MemoryGame from "./MemoryGame";
import BrainlyGame from "./BrainlyGame";
import PixelsGame from "./PixelsGame";
import MarioGame from "./MarioGame";
import MagicPiano from "./MagicPiano";
import ChessGame from "./ChessGame";
import LevelDevil from "./LevelDevil";
import PuzzleGame from "./PuzzleGame";
import { toast } from "@/components/ui/use-toast";

interface GameInterfaceProps {
  gameId: string;
  onBack: () => void;
}

const GameInterface: React.FC<GameInterfaceProps> = ({ gameId, onBack }) => {
  // Display a toast notification when a game is loaded
  React.useEffect(() => {
    toast({
      title: "Game Loaded",
      description: `${gameId.charAt(0).toUpperCase() + gameId.slice(1)} game is ready to play!`,
      duration: 3000,
    });
  }, [gameId]);

  switch (gameId) {
    case "painting":
      return <PaintingGame onBack={onBack} />;
    case "memory":
      return <MemoryGame onBack={onBack} />;
    case "brainly":
      return <BrainlyGame onBack={onBack} />;
    case "pixels":
      return <PixelsGame onBack={onBack} />;
    case "mario":
      return <MarioGame onBack={onBack} />;
    case "piano":
      return <MagicPiano onBack={onBack} />;
    case "chess":
      return <ChessGame onBack={onBack} />;
    case "level-devil":
      return <LevelDevil onBack={onBack} />;
    case "puzzle":
      return <PuzzleGame onBack={onBack} />;
    default:
      return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
          <h2 className="text-2xl font-bold mb-4">Game Coming Soon!</h2>
          <p className="text-gray-600 mb-6">We're working on adding this game. Please check back later.</p>
          <button 
            onClick={onBack}
            className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            Back to Games
          </button>
        </div>
      );
  }
};

export default GameInterface;
