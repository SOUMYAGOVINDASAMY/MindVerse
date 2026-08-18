
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { ArrowLeft, RotateCw, Puzzle, Zap } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import confetti from "canvas-confetti";

interface PuzzleGameProps {
  onBack: () => void;
}

interface PuzzlePiece {
  id: number;
  currentPosition: number;
  correctPosition: number;
  image: string;
}

const PuzzleGame: React.FC<PuzzleGameProps> = ({ onBack }) => {
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("easy");
  const [gameStarted, setGameStarted] = useState(false);
  const [pieces, setPieces] = useState<PuzzlePiece[]>([]);
  const [moves, setMoves] = useState(0);
  const [timer, setTimer] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [imageSet, setImageSet] = useState("animals");
  const { toast } = useToast();

  // Image sets for different puzzles
  const imageSets = {
    animals: [
      "🦊", "🦁", "🐯", "🐱",
      "🐶", "🐼", "🐨", "🐸",
      "🦄", "🐢", "🐰", "🐘",
      "🐬", "🦈", "🐙", "🦭"
    ],
    nature: [
      "🌲", "🌳", "🌴", "🌵",
      "🌷", "🌻", "🌹", "🌺",
      "🍀", "🌿", "🌱", "🌾",
      "🍄", "🌈", "☀️", "⭐"
    ],
    food: [
      "🍎", "🍌", "🍇", "🍓",
      "🍕", "🍔", "🌮", "🍦",
      "🍩", "🍰", "🧁", "🍪",
      "🍫", "🍭", "🍿", "🥤"
    ]
  };

  // Initialize the puzzle pieces based on difficulty
  const initializePuzzle = () => {
    setGameStarted(true);
    setMoves(0);
    setTimer(0);
    setIsComplete(false);

    // Determine grid size based on difficulty
    let gridSize: number;
    switch (difficulty) {
      case "easy":
        gridSize = 3; // 3x3 grid (9 pieces)
        break;
      case "medium":
        gridSize = 4; // 4x4 grid (16 pieces)
        break;
      case "hard":
        gridSize = 5; // 5x5 grid (25 pieces)
        break;
      default:
        gridSize = 3;
    }

    // Get the images for the current set
    const images = (imageSets as any)[imageSet] || imageSets.animals;
    
    // Create the puzzle pieces
    const totalPieces = gridSize * gridSize;
    const newPieces: PuzzlePiece[] = [];
    
    for (let i = 0; i < totalPieces; i++) {
      newPieces.push({
        id: i,
        currentPosition: i,
        correctPosition: i,
        image: images[i % images.length] // Cycle through available images
      });
    }
    
    // Shuffle the pieces (except for the last one in easy mode which remains empty)
    const shuffledPieces = [...newPieces];
    
    for (let i = shuffledPieces.length - 1; i > 0; i--) {
      // In easy mode, don't shuffle the last piece
      if (difficulty === "easy" && i === shuffledPieces.length - 1) continue;
      
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledPieces[i].currentPosition, shuffledPieces[j].currentPosition] = 
      [shuffledPieces[j].currentPosition, shuffledPieces[i].currentPosition];
    }
    
    setPieces(shuffledPieces);
  };

  // Check if the puzzle is solved
  const checkCompletion = () => {
    const solved = pieces.every(piece => piece.currentPosition === piece.correctPosition);
    if (solved && !isComplete) {
      setIsComplete(true);
      
      // Celebrate with confetti!
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      
      toast({
        title: "Puzzle Completed! 🎉",
        description: `You solved the puzzle in ${moves} moves and ${formatTime(timer)}!`,
      });
    }
    return solved;
  };

  // Handle timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (gameStarted && !isComplete) {
      interval = setInterval(() => {
        setTimer(prevTimer => prevTimer + 1);
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [gameStarted, isComplete]);

  // Check for completion after each move
  useEffect(() => {
    if (pieces.length > 0) {
      checkCompletion();
    }
  }, [pieces]);

  // Format time as mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Move a piece if it's adjacent to an empty slot
  const movePiece = (pieceIndex: number) => {
    if (isComplete) return;
    
    const gridSize = difficulty === "easy" ? 3 : difficulty === "medium" ? 4 : 5;
    const piecePosition = pieces[pieceIndex].currentPosition;
    const row = Math.floor(piecePosition / gridSize);
    const col = piecePosition % gridSize;
    
    // Check all four adjacent positions
    const adjacentPositions = [
      piecePosition - gridSize, // Up
      piecePosition + gridSize, // Down
      piecePosition - 1, // Left
      piecePosition + 1, // Right
    ];
    
    // Filter out invalid positions (out of bounds)
    const validAdjacentPositions = adjacentPositions.filter(pos => {
      if (pos < 0 || pos >= gridSize * gridSize) return false;
      
      // Check if it's actually adjacent (prevent wrapping around the grid)
      const adjRow = Math.floor(pos / gridSize);
      const adjCol = pos % gridSize;
      
      // Vertical adjacency is always valid, horizontal adjacency requires same row
      return (adjRow === row && Math.abs(adjCol - col) === 1) || 
             (adjCol === col && Math.abs(adjRow - row) === 1);
    });
    
    // Find the empty piece
    const emptyPiece = pieces.find(p => p.image === "");
    const emptyPosition = emptyPiece ? emptyPiece.currentPosition : -1;
    
    // Check if the empty piece is adjacent
    if (validAdjacentPositions.includes(emptyPosition)) {
      const newPieces = [...pieces];
      
      // Swap positions with the empty piece
      newPieces.forEach(piece => {
        if (piece.currentPosition === piecePosition) {
          piece.currentPosition = emptyPosition;
        } else if (piece.currentPosition === emptyPosition) {
          piece.currentPosition = piecePosition;
        }
      });
      
      setPieces(newPieces);
      setMoves(prevMoves => prevMoves + 1);
    }
  };

  // Calculate score based on difficulty, time, and moves
  const calculateScore = () => {
    if (!isComplete) return 0;
    
    // Base score depends on difficulty
    const baseScore = difficulty === "easy" ? 100 : 
                      difficulty === "medium" ? 200 : 300;
    
    // Deduct points for time and moves
    const timeDeduction = Math.floor(timer / 5); // Deduct points for each 5 seconds
    const movesDeduction = moves; // Deduct 1 point per move
    
    return Math.max(baseScore - timeDeduction - movesDeduction, 10);
  };

  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-purple-50 to-blue-100">
      <div className="max-w-5xl mx-auto">
        <header className="mb-6 flex items-center justify-between">
          <Button variant="outline" onClick={onBack} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Games</span>
          </Button>
          <h1 className="text-3xl font-bold text-kids-primary">Puzzle Game</h1>
        </header>

        {!gameStarted ? (
          <Card className="p-6 max-w-md mx-auto">
            <h2 className="text-2xl font-bold text-center mb-4">Choose Your Puzzle</h2>
            <p className="text-gray-600 mb-6 text-center">
              Rearrange the pieces to solve the puzzle. Move pieces by clicking on them.
            </p>
            
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Pick a Theme:</h3>
              <div className="grid grid-cols-3 gap-2 mb-4">
                <Button 
                  onClick={() => setImageSet("animals")} 
                  variant={imageSet === "animals" ? "default" : "outline"}
                  className="w-full"
                >
                  Animals 🦁
                </Button>
                <Button 
                  onClick={() => setImageSet("nature")} 
                  variant={imageSet === "nature" ? "default" : "outline"}
                  className="w-full"
                >
                  Nature 🌳
                </Button>
                <Button 
                  onClick={() => setImageSet("food")} 
                  variant={imageSet === "food" ? "default" : "outline"}
                  className="w-full"
                >
                  Food 🍕
                </Button>
              </div>
            </div>
            
            <div className="space-y-4">
              <Button 
                onClick={() => {
                  setDifficulty("easy");
                  initializePuzzle();
                }}
                className="w-full bg-green-500 hover:bg-green-600"
              >
                Easy (3×3)
              </Button>
              <Button 
                onClick={() => {
                  setDifficulty("medium");
                  initializePuzzle();
                }}
                className="w-full bg-yellow-500 hover:bg-yellow-600"
              >
                Medium (4×4)
              </Button>
              <Button 
                onClick={() => {
                  setDifficulty("hard");
                  initializePuzzle();
                }}
                className="w-full bg-red-500 hover:bg-red-600"
              >
                Hard (5×5)
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-4">
                  <div className="bg-white p-2 rounded-md shadow flex items-center gap-2">
                    <Zap className="h-5 w-5 text-yellow-500" />
                    <span className="font-bold">Moves: {moves}</span>
                  </div>
                  
                  <div className="bg-white p-2 rounded-md shadow flex items-center gap-2">
                    <span className="font-bold">Time: {formatTime(timer)}</span>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    onClick={() => initializePuzzle()}
                    className="flex items-center gap-2"
                    variant="outline"
                  >
                    <RotateCw className="h-4 w-4" />
                    Restart
                  </Button>
                  
                  <Button 
                    onClick={() => {
                      setGameStarted(false);
                      setPieces([]);
                    }}
                  >
                    New Puzzle
                  </Button>
                </div>
              </div>
              
              {/* Puzzle Grid */}
              <div className={`grid ${
                difficulty === "easy" ? "grid-cols-3" : 
                difficulty === "medium" ? "grid-cols-4" : 
                "grid-cols-5"
              } gap-1 aspect-square bg-white p-2 rounded-lg shadow-lg`}>
                {pieces.map((piece, index) => {
                  const gridSize = difficulty === "easy" ? 3 : difficulty === "medium" ? 4 : 5;
                  const isEmptyPiece = piece.image === "";
                  
                  return (
                    <motion.div
                      key={piece.id}
                      className={`
                        aspect-square flex items-center justify-center
                        text-3xl md:text-4xl lg:text-5xl
                        ${isEmptyPiece ? 'bg-transparent' : 'bg-blue-100 cursor-pointer'}
                        ${piece.currentPosition === piece.correctPosition ? 'bg-green-100' : ''}
                        rounded-md shadow relative overflow-hidden
                      `}
                      whileHover={{ scale: isComplete || isEmptyPiece ? 1 : 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => movePiece(index)}
                    >
                      {piece.image}
                      
                      {/* Optional: Show piece ID for debugging */}
                      {/* <div className="absolute bottom-1 right-1 text-xs">
                        {piece.id}:{piece.currentPosition}
                      </div> */}
                    </motion.div>
                  );
                })}
              </div>
              
              {isComplete && (
                <motion.div 
                  className="mt-6 p-4 bg-green-100 rounded-lg text-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <h2 className="text-2xl font-bold text-green-700 mb-2">
                    Puzzle Completed! 🎉
                  </h2>
                  <p className="mb-2">
                    You solved it in {moves} moves and {formatTime(timer)}!
                  </p>
                  <p className="text-xl font-bold">
                    Score: {calculateScore()} points
                  </p>
                  <div className="flex justify-center gap-4 mt-4">
                    <Button onClick={() => initializePuzzle()}>
                      Play Again
                    </Button>
                    <Button variant="outline" onClick={() => setGameStarted(false)}>
                      New Puzzle
                    </Button>
                  </div>
                </motion.div>
              )}
            </div>
            
            <div className="lg:col-span-1">
              <Card className="p-4 mb-6">
                <h2 className="text-xl font-bold mb-2">How to Play</h2>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Click on a piece next to an empty space to move it</li>
                  <li>Rearrange all pieces to their correct positions</li>
                  <li>Complete the puzzle as quickly as possible</li>
                  <li>Fewer moves and less time means a higher score</li>
                </ul>
              </Card>
              
              <Card className="p-4">
                <h2 className="text-xl font-bold mb-2">Difficulty Levels</h2>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span>Easy: 3×3 grid (8 pieces)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <span>Medium: 4×4 grid (15 pieces)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span>Hard: 5×5 grid (24 pieces)</span>
                  </li>
                </ul>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PuzzleGame;
