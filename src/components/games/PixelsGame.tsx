
import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Toggle } from "@/components/ui/toggle";
import { Grid, Eraser, Download, Home, RotateCcw, Palette } from "lucide-react";
import { motion } from "framer-motion";

interface PixelsGameProps {
  onBack: () => void;
}

interface PixelState {
  x: number;
  y: number;
  color: string;
}

const COLORS = [
  "#000000", "#FFFFFF", "#FF0000", "#00FF00", "#0000FF", 
  "#FFFF00", "#FF00FF", "#00FFFF", "#FFA500", "#800080", 
  "#008000", "#800000", "#008080", "#FFC0CB", "#A52A2A"
];

const DEFAULT_GRID_SIZE = 16;
const MAX_GRID_SIZE = 32;

const PixelsGame: React.FC<PixelsGameProps> = ({ onBack }) => {
  const [gridSize, setGridSize] = useState(DEFAULT_GRID_SIZE);
  const [pixels, setPixels] = useState<PixelState[]>([]);
  const [currentColor, setCurrentColor] = useState(COLORS[0]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [eraseMode, setEraseMode] = useState(false);
  const [lastAction, setLastAction] = useState<PixelState[][]>([]);
  const [currentActionIndex, setCurrentActionIndex] = useState(-1);
  
  const canvasRef = useRef<HTMLDivElement>(null);
  
  // Initialize the grid
  useEffect(() => {
    resetCanvas();
  }, [gridSize]);
  
  const resetCanvas = () => {
    const initialPixels = [];
    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize; x++) {
        initialPixels.push({ x, y, color: "#FFFFFF" });
      }
    }
    setPixels(initialPixels);
    setLastAction([initialPixels]);
    setCurrentActionIndex(0);
  };
  
  const handlePixelClick = (x: number, y: number) => {
    setPixels(current => {
      const newPixels = current.map(pixel => {
        if (pixel.x === x && pixel.y === y) {
          return { ...pixel, color: eraseMode ? "#FFFFFF" : currentColor };
        }
        return pixel;
      });
      
      // Save this action for undo
      const newLastAction = [...lastAction.slice(0, currentActionIndex + 1), newPixels];
      setLastAction(newLastAction);
      setCurrentActionIndex(newLastAction.length - 1);
      
      return newPixels;
    });
  };
  
  const handleMouseDown = (x: number, y: number) => {
    setIsDrawing(true);
    handlePixelClick(x, y);
  };
  
  const handleMouseOver = (x: number, y: number) => {
    if (isDrawing) {
      handlePixelClick(x, y);
    }
  };
  
  const handleMouseUp = () => {
    setIsDrawing(false);
  };
  
  const undo = () => {
    if (currentActionIndex > 0) {
      setCurrentActionIndex(currentActionIndex - 1);
      setPixels(lastAction[currentActionIndex - 1]);
    }
  };
  
  const redo = () => {
    if (currentActionIndex < lastAction.length - 1) {
      setCurrentActionIndex(currentActionIndex + 1);
      setPixels(lastAction[currentActionIndex + 1]);
    }
  };
  
  const downloadImage = () => {
    if (!canvasRef.current) return;
    
    const canvas = document.createElement('canvas');
    const size = 512; // Final image size
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const pixelSize = size / gridSize;
    
    // Draw the pixels
    pixels.forEach(pixel => {
      ctx.fillStyle = pixel.color;
      ctx.fillRect(
        pixel.x * pixelSize,
        pixel.y * pixelSize,
        pixelSize,
        pixelSize
      );
    });
    
    // Draw grid lines
    ctx.strokeStyle = '#DDDDDD';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= gridSize; i++) {
      // Horizontal lines
      ctx.beginPath();
      ctx.moveTo(0, i * pixelSize);
      ctx.lineTo(size, i * pixelSize);
      ctx.stroke();
      
      // Vertical lines
      ctx.beginPath();
      ctx.moveTo(i * pixelSize, 0);
      ctx.lineTo(i * pixelSize, size);
      ctx.stroke();
    }
    
    // Create download link
    const link = document.createElement('a');
    link.download = 'pixel-art.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        <header className="flex flex-wrap justify-between items-center mb-6 gap-3">
          <Button
            onClick={onBack}
            variant="outline"
            className="flex items-center gap-2 border-2 border-indigo-300"
          >
            <Home className="w-4 h-4" /> Back to Games
          </Button>
          
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center bg-white rounded-md shadow px-3 py-1">
              <span className="text-gray-700 mr-2">Grid:</span>
              <Slider
                value={[gridSize]}
                min={8}
                max={MAX_GRID_SIZE}
                step={4}
                className="w-24"
                onValueChange={(value) => {
                  if (confirm("Changing grid size will reset your canvas. Continue?")) {
                    setGridSize(value[0]);
                  }
                }}
              />
              <span className="ml-2 text-sm text-gray-600">{gridSize}x{gridSize}</span>
            </div>
            
            <div className="space-x-2">
              <Button 
                size="sm" 
                variant="outline" 
                onClick={undo}
                disabled={currentActionIndex <= 0}
                className="border-indigo-300"
              >
                Undo
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={redo}
                disabled={currentActionIndex >= lastAction.length - 1}
                className="border-indigo-300"
              >
                Redo
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={resetCanvas}
                className="border-indigo-300"
              >
                <RotateCcw className="h-4 w-4 mr-1" /> Reset
              </Button>
              <Button 
                size="sm"
                onClick={downloadImage}
                className="bg-indigo-500 hover:bg-indigo-600"
              >
                <Download className="h-4 w-4 mr-1" /> Save
              </Button>
            </div>
          </div>
        </header>
        
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="lg:w-3/4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="relative bg-white rounded-lg border-2 border-indigo-300 shadow-lg p-4"
            >
              <div 
                ref={canvasRef}
                className="relative aspect-square w-full select-none"
                onMouseLeave={() => setIsDrawing(false)}
              >
                <div
                  className="grid aspect-square h-full"
                  style={{
                    gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
                    gridTemplateRows: `repeat(${gridSize}, 1fr)`
                  }}
                >
                  {pixels.map((pixel, index) => (
                    <div
                      key={index}
                      style={{ 
                        backgroundColor: pixel.color,
                        border: '0.5px solid #ddd'
                      }}
                      className="aspect-square cursor-pointer"
                      onMouseDown={() => handleMouseDown(pixel.x, pixel.y)}
                      onMouseOver={() => handleMouseOver(pixel.x, pixel.y)}
                      onMouseUp={handleMouseUp}
                      onTouchStart={() => handleMouseDown(pixel.x, pixel.y)}
                      onTouchMove={() => handleMouseOver(pixel.x, pixel.y)}
                      onTouchEnd={handleMouseUp}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
          
          <div className="lg:w-1/4 flex flex-col gap-4">
            <div className="bg-white rounded-lg border-2 border-indigo-300 shadow p-4">
              <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
                <Palette className="h-5 w-5" /> Colors
              </h3>
              
              <div className="grid grid-cols-5 gap-2 mb-4">
                {COLORS.map((color, index) => (
                  <button
                    key={index}
                    className={`aspect-square rounded-md border-2 ${
                      currentColor === color && !eraseMode 
                        ? 'border-black scale-110' 
                        : 'border-gray-300'
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => {
                      setCurrentColor(color);
                      setEraseMode(false);
                    }}
                  />
                ))}
              </div>
              
              <div className="flex items-center gap-3 mt-2">
                <Toggle
                  pressed={eraseMode}
                  onPressedChange={(pressed) => {
                    setEraseMode(pressed);
                  }}
                >
                  <Eraser className={`h-5 w-5 ${eraseMode ? "text-red-500" : ""}`} />
                </Toggle>
                <span>Eraser</span>
              </div>
            </div>
            
            <div className="bg-white rounded-lg border-2 border-indigo-300 shadow p-4">
              <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
                <Grid className="h-5 w-5" /> Tips
              </h3>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Click or drag to draw pixels</li>
                <li>• Toggle eraser to remove pixels</li>
                <li>• Save your artwork as a PNG</li>
                <li>• Adjust grid size for more detail</li>
                <li>• Use undo/redo for mistakes</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PixelsGame;
