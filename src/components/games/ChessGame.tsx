
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { ArrowLeft, RotateCw } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface ChessGameProps {
  onBack: () => void;
}

interface ChessPiece {
  type: 'pawn' | 'rook' | 'knight' | 'bishop' | 'queen' | 'king';
  color: 'white' | 'black';
  icon: string;
  hasMoved?: boolean;
}

interface Square {
  piece: ChessPiece | null;
  isSelected: boolean;
  isValidMove: boolean;
  position: string;
}

const INITIAL_BOARD: Square[][] = Array(8).fill(null).map((_, rowIndex) => 
  Array(8).fill(null).map((_, colIndex) => {
    const position = `${String.fromCharCode(97 + colIndex)}${8 - rowIndex}`;
    let piece: ChessPiece | null = null;
    
    // Setup pawns
    if (rowIndex === 1) {
      piece = { type: 'pawn', color: 'black', icon: '♟', hasMoved: false };
    } else if (rowIndex === 6) {
      piece = { type: 'pawn', color: 'white', icon: '♙', hasMoved: false };
    } 
    // Setup back rows
    else if (rowIndex === 0 || rowIndex === 7) {
      const color = rowIndex === 0 ? 'black' : 'white';
      
      if (colIndex === 0 || colIndex === 7) {
        piece = { type: 'rook', color, icon: color === 'white' ? '♖' : '♜', hasMoved: false };
      } else if (colIndex === 1 || colIndex === 6) {
        piece = { type: 'knight', color, icon: color === 'white' ? '♘' : '♞' };
      } else if (colIndex === 2 || colIndex === 5) {
        piece = { type: 'bishop', color, icon: color === 'white' ? '♗' : '♝' };
      } else if (colIndex === 3) {
        piece = { type: 'queen', color, icon: color === 'white' ? '♕' : '♛' };
      } else if (colIndex === 4) {
        piece = { type: 'king', color, icon: color === 'white' ? '♔' : '♚', hasMoved: false };
      }
    }
    
    return {
      piece,
      isSelected: false,
      isValidMove: false,
      position
    };
  })
);

const SIMPLIFIED_LESSON = [
  { title: "What is Chess?", content: "Chess is a strategic board game played by two players on a checkered board with 64 squares. Each player controls an army of pieces with different movement patterns." },
  { title: "The Goal", content: "The goal is to capture the opponent's king by putting it in 'checkmate' - a position where it is under attack and has no legal moves to escape." },
  { title: "Basic Piece Movement", content: "Pawns move forward but capture diagonally. Rooks move in straight lines. Knights move in an L-shape. Bishops move diagonally. The Queen moves in any direction. The King moves one square in any direction." },
  { title: "Special Rules", content: "Castling allows the king and rook to move together. Pawns can move two squares on their first move. En passant allows capturing a pawn that has moved two squares. A pawn that reaches the opposite end of the board can be promoted to any other piece." }
];

const ChessGame: React.FC<ChessGameProps> = ({ onBack }) => {
  const [board, setBoard] = useState<Square[][]>(() => JSON.parse(JSON.stringify(INITIAL_BOARD)));
  const [selectedSquare, setSelectedSquare] = useState<[number, number] | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<'white' | 'black'>('white');
  const [gameMode, setGameMode] = useState<'play' | 'learn'>('learn');
  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  const [lessonIndex, setLessonIndex] = useState(0);
  const { toast } = useToast();

  const resetGame = () => {
    setBoard(JSON.parse(JSON.stringify(INITIAL_BOARD)));
    setSelectedSquare(null);
    setCurrentPlayer('white');
    setMoveHistory([]);
  };

  const selectSquare = (rowIndex: number, colIndex: number) => {
    if (gameMode !== 'play') return;
    
    const square = board[rowIndex][colIndex];
    
    // If no piece is selected yet and the clicked square has a piece of the current player's color
    if (!selectedSquare && square.piece && square.piece.color === currentPlayer) {
      // Select this square
      const newBoard = [...board];
      newBoard[rowIndex][colIndex].isSelected = true;
      setBoard(newBoard);
      setSelectedSquare([rowIndex, colIndex]);
      
      // Show valid moves
      showValidMoves(rowIndex, colIndex, newBoard);
    } 
    // If a piece is already selected
    else if (selectedSquare) {
      const [selectedRow, selectedCol] = selectedSquare;
      const selectedPiece = board[selectedRow][selectedCol].piece;
      
      // If clicking on the same piece, deselect it
      if (rowIndex === selectedRow && colIndex === selectedCol) {
        clearHighlights();
        return;
      }
      
      // If the square is a valid move, make the move
      if (square.isValidMove) {
        makeMove(selectedRow, selectedCol, rowIndex, colIndex);
      } 
      // If clicking on another piece of the same color, select that piece instead
      else if (square.piece && square.piece.color === currentPlayer) {
        clearHighlights();
        const newBoard = [...board];
        newBoard[rowIndex][colIndex].isSelected = true;
        setBoard(newBoard);
        setSelectedSquare([rowIndex, colIndex]);
        showValidMoves(rowIndex, colIndex, newBoard);
      } 
      // Otherwise, just clear the selection
      else {
        clearHighlights();
      }
    }
  };

  const clearHighlights = () => {
    const newBoard = board.map(row => 
      row.map(square => ({
        ...square,
        isSelected: false,
        isValidMove: false
      }))
    );
    setBoard(newBoard);
    setSelectedSquare(null);
  };

  // This is a simplified version of calculating valid moves
  const showValidMoves = (rowIndex: number, colIndex: number, currentBoard: Square[][]) => {
    const piece = currentBoard[rowIndex][colIndex].piece;
    if (!piece) return;
    
    const newBoard = [...currentBoard];
    
    // Simple move calculation based on piece type
    switch (piece.type) {
      case 'pawn': {
        const direction = piece.color === 'white' ? -1 : 1;
        
        // Forward move (if not blocked)
        const forwardRow = rowIndex + direction;
        if (
          forwardRow >= 0 && 
          forwardRow < 8 && 
          !newBoard[forwardRow][colIndex].piece
        ) {
          newBoard[forwardRow][colIndex].isValidMove = true;
          
          // Two square move on first move
          if (!piece.hasMoved) {
            const doubleForwardRow = rowIndex + 2 * direction;
            if (
              doubleForwardRow >= 0 && 
              doubleForwardRow < 8 && 
              !newBoard[doubleForwardRow][colIndex].piece &&
              !newBoard[forwardRow][colIndex].piece
            ) {
              newBoard[doubleForwardRow][colIndex].isValidMove = true;
            }
          }
        }
        
        // Diagonal captures
        const captureCols = [colIndex - 1, colIndex + 1];
        for (const captureCol of captureCols) {
          if (captureCol >= 0 && captureCol < 8) {
            const captureSquare = newBoard[forwardRow][captureCol];
            if (
              captureSquare && 
              captureSquare.piece && 
              captureSquare.piece.color !== piece.color
            ) {
              newBoard[forwardRow][captureCol].isValidMove = true;
            }
          }
        }
        break;
      }
      
      case 'rook': {
        // Horizontal and vertical moves
        const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
        for (const [dr, dc] of directions) {
          for (let i = 1; i < 8; i++) {
            const r = rowIndex + dr * i;
            const c = colIndex + dc * i;
            
            if (r < 0 || r >= 8 || c < 0 || c >= 8) break;
            
            if (!newBoard[r][c].piece) {
              newBoard[r][c].isValidMove = true;
            } else {
              if (newBoard[r][c].piece.color !== piece.color) {
                newBoard[r][c].isValidMove = true;
              }
              break;
            }
          }
        }
        break;
      }
      
      case 'knight': {
        // L-shaped moves
        const knightMoves = [
          [-2, -1], [-2, 1], [-1, -2], [-1, 2],
          [1, -2], [1, 2], [2, -1], [2, 1]
        ];
        
        for (const [dr, dc] of knightMoves) {
          const r = rowIndex + dr;
          const c = colIndex + dc;
          
          if (r >= 0 && r < 8 && c >= 0 && c < 8) {
            if (!newBoard[r][c].piece || newBoard[r][c].piece.color !== piece.color) {
              newBoard[r][c].isValidMove = true;
            }
          }
        }
        break;
      }
      
      case 'bishop': {
        // Diagonal moves
        const directions = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
        for (const [dr, dc] of directions) {
          for (let i = 1; i < 8; i++) {
            const r = rowIndex + dr * i;
            const c = colIndex + dc * i;
            
            if (r < 0 || r >= 8 || c < 0 || c >= 8) break;
            
            if (!newBoard[r][c].piece) {
              newBoard[r][c].isValidMove = true;
            } else {
              if (newBoard[r][c].piece.color !== piece.color) {
                newBoard[r][c].isValidMove = true;
              }
              break;
            }
          }
        }
        break;
      }
      
      case 'queen': {
        // Combines rook and bishop moves
        const directions = [
          [-1, 0], [1, 0], [0, -1], [0, 1],  // Rook-like
          [-1, -1], [-1, 1], [1, -1], [1, 1]  // Bishop-like
        ];
        
        for (const [dr, dc] of directions) {
          for (let i = 1; i < 8; i++) {
            const r = rowIndex + dr * i;
            const c = colIndex + dc * i;
            
            if (r < 0 || r >= 8 || c < 0 || c >= 8) break;
            
            if (!newBoard[r][c].piece) {
              newBoard[r][c].isValidMove = true;
            } else {
              if (newBoard[r][c].piece.color !== piece.color) {
                newBoard[r][c].isValidMove = true;
              }
              break;
            }
          }
        }
        break;
      }
      
      case 'king': {
        // One square in any direction
        const directions = [
          [-1, -1], [-1, 0], [-1, 1],
          [0, -1],           [0, 1],
          [1, -1],  [1, 0],  [1, 1]
        ];
        
        for (const [dr, dc] of directions) {
          const r = rowIndex + dr;
          const c = colIndex + dc;
          
          if (r >= 0 && r < 8 && c >= 0 && c < 8) {
            if (!newBoard[r][c].piece || newBoard[r][c].piece.color !== piece.color) {
              newBoard[r][c].isValidMove = true;
            }
          }
        }
        
        // Castling (simplified)
        if (!piece.hasMoved && piece.color === currentPlayer) {
          // Kingside castling
          if (
            newBoard[rowIndex][7].piece &&
            newBoard[rowIndex][7].piece.type === 'rook' &&
            !newBoard[rowIndex][7].piece.hasMoved &&
            !newBoard[rowIndex][5].piece &&
            !newBoard[rowIndex][6].piece
          ) {
            newBoard[rowIndex][6].isValidMove = true;
          }
          
          // Queenside castling
          if (
            newBoard[rowIndex][0].piece &&
            newBoard[rowIndex][0].piece.type === 'rook' &&
            !newBoard[rowIndex][0].piece.hasMoved &&
            !newBoard[rowIndex][1].piece &&
            !newBoard[rowIndex][2].piece &&
            !newBoard[rowIndex][3].piece
          ) {
            newBoard[rowIndex][2].isValidMove = true;
          }
        }
        break;
      }
    }
    
    setBoard(newBoard);
  };

  const makeMove = (fromRow: number, fromCol: number, toRow: number, toCol: number) => {
    const newBoard = [...board];
    const piece = newBoard[fromRow][fromCol].piece;
    
    if (!piece) return;
    
    // Save the move in algebraic notation
    const from = newBoard[fromRow][fromCol].position;
    const to = newBoard[toRow][toCol].position;
    const captured = newBoard[toRow][toCol].piece ? 'x' : '';
    const moveNotation = `${piece.type.charAt(0).toUpperCase()}${from}${captured}${to}`;
    
    // Update piece's hasMoved status if needed
    if (piece.type === 'pawn' || piece.type === 'rook' || piece.type === 'king') {
      piece.hasMoved = true;
    }
    
    // Handle special moves
    
    // Castling
    if (piece.type === 'king' && Math.abs(fromCol - toCol) > 1) {
      // Kingside castling
      if (toCol === 6) {
        newBoard[toRow][5].piece = newBoard[toRow][7].piece;
        newBoard[toRow][7].piece = null;
      }
      // Queenside castling
      else if (toCol === 2) {
        newBoard[toRow][3].piece = newBoard[toRow][0].piece;
        newBoard[toRow][0].piece = null;
      }
    }
    
    // Pawn promotion (simplified)
    if (piece.type === 'pawn' && (toRow === 0 || toRow === 7)) {
      piece.type = 'queen';
      piece.icon = piece.color === 'white' ? '♕' : '♛';
      toast({
        title: "Pawn Promotion",
        description: "Your pawn has been promoted to a Queen!",
      });
    }
    
    // Move the piece
    newBoard[toRow][toCol].piece = piece;
    newBoard[fromRow][fromCol].piece = null;
    
    // Check for captures
    if (newBoard[toRow][toCol].piece && newBoard[toRow][toCol].piece.color !== piece.color) {
      toast({
        title: "Piece Captured",
        description: `${currentPlayer} captured a ${newBoard[toRow][toCol].piece.type}!`,
      });
    }
    
    // Clear all highlights
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        newBoard[r][c].isSelected = false;
        newBoard[r][c].isValidMove = false;
      }
    }
    
    // Update the board
    setBoard(newBoard);
    setSelectedSquare(null);
    setMoveHistory([...moveHistory, moveNotation]);
    
    // Switch players
    setCurrentPlayer(currentPlayer === 'white' ? 'black' : 'white');
  };

  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-5xl mx-auto">
        <header className="mb-6 flex items-center justify-between">
          <Button variant="outline" onClick={onBack} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Games</span>
          </Button>
          <h1 className="text-3xl font-bold text-kids-primary">Chess for Kids</h1>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="p-4 mb-4">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${currentPlayer === 'white' ? 'bg-blue-500' : 'bg-gray-400'}`}></div>
                  <span className="font-bold">White</span>
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={resetGame}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <RotateCw className="h-4 w-4" />
                    Reset
                  </Button>
                  <Button 
                    onClick={() => setGameMode(gameMode === 'play' ? 'learn' : 'play')}
                  >
                    {gameMode === 'play' ? 'Learn Mode' : 'Play Mode'}
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold">Black</span>
                  <div className={`w-3 h-3 rounded-full ${currentPlayer === 'black' ? 'bg-blue-500' : 'bg-gray-400'}`}></div>
                </div>
              </div>

              {gameMode === 'learn' ? (
                <div className="mb-4">
                  <Card className="p-4 bg-blue-50">
                    <h3 className="text-xl font-bold mb-2">{SIMPLIFIED_LESSON[lessonIndex].title}</h3>
                    <p className="mb-4">{SIMPLIFIED_LESSON[lessonIndex].content}</p>
                    <div className="flex justify-between">
                      <Button
                        variant="outline"
                        onClick={() => setLessonIndex(prev => Math.max(0, prev - 1))}
                        disabled={lessonIndex === 0}
                      >
                        Previous
                      </Button>
                      <Button
                        onClick={() => setLessonIndex(prev => Math.min(SIMPLIFIED_LESSON.length - 1, prev + 1))}
                        disabled={lessonIndex === SIMPLIFIED_LESSON.length - 1}
                      >
                        Next
                      </Button>
                    </div>
                  </Card>
                </div>
              ) : null}

              <div className="grid grid-cols-8 border border-gray-300 w-full aspect-square">
                {board.map((row, rowIndex) => (
                  <React.Fragment key={`row-${rowIndex}`}>
                    {row.map((square, colIndex) => {
                      const isBlack = (rowIndex + colIndex) % 2 === 1;
                      return (
                        <motion.div
                          key={`${rowIndex}-${colIndex}`}
                          className={`
                            flex items-center justify-center text-2xl md:text-3xl
                            ${isBlack ? 'bg-gray-400' : 'bg-gray-200'}
                            ${square.isSelected ? 'bg-blue-300' : ''}
                            ${square.isValidMove ? 'bg-green-300' : ''}
                            relative
                          `}
                          whileHover={{ scale: 1.05 }}
                          transition={{ type: "spring", stiffness: 300, damping: 30 }}
                          onClick={() => selectSquare(rowIndex, colIndex)}
                        >
                          {square.piece?.icon}
                          
                          {/* Position label */}
                          {colIndex === 0 && (
                            <span className="absolute top-0 left-1 text-xs font-bold">
                              {8 - rowIndex}
                            </span>
                          )}
                          {rowIndex === 7 && (
                            <span className="absolute bottom-0 right-1 text-xs font-bold">
                              {String.fromCharCode(97 + colIndex)}
                            </span>
                          )}
                          
                          {/* Valid move indicator */}
                          {square.isValidMove && !square.piece && (
                            <div className="w-3 h-3 rounded-full bg-green-500 opacity-70" />
                          )}
                        </motion.div>
                      );
                    })}
                  </React.Fragment>
                ))}
              </div>
            </Card>
          </div>
          
          <div className="lg:col-span-1">
            <Card className="p-4 mb-4">
              <h2 className="font-bold text-xl mb-2">Move History</h2>
              {moveHistory.length > 0 ? (
                <div className="h-48 overflow-y-auto">
                  {moveHistory.map((move, index) => (
                    <div key={index} className="flex items-center py-1 border-b border-gray-100">
                      <span className="font-mono w-8">{Math.floor(index / 2) + 1}.</span>
                      <span className={`flex-1 ${index % 2 === 0 ? 'text-blue-600' : 'text-gray-700'}`}>
                        {move}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No moves yet</p>
              )}
            </Card>
            
            <Card className="p-4">
              <h2 className="font-bold text-xl mb-2">How to Play</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>Click on a piece to select it</li>
                <li>Green squares show valid moves</li>
                <li>Click on a valid move to move the piece</li>
                <li>Capture opponent pieces by landing on them</li>
                <li>Switch between Play and Learn modes</li>
                <li>White goes first, then players alternate turns</li>
              </ul>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChessGame;
