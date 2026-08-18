import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { ArrowLeft, Download, Trash2, Palette, Image } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import * as PIXI from "pixi.js";

type Template = {
  id: string;
  name: string;
  imageUrl: string;
};

type Color = {
  hex: string;
  name: string;
};

interface PaintingGameProps {
  onBack: () => void;
}

const PaintingGame: React.FC<PaintingGameProps> = ({ onBack }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [selectedColor, setSelectedColor] = useState<Color>({ hex: "#FF5252", name: "Red" });
  const [brushSize, setBrushSize] = useState(10);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const appRef = useRef<PIXI.Application | null>(null);
  const graphicsRef = useRef<PIXI.Graphics | null>(null);
  const { toast } = useToast();

  const templates: Template[] = [
    { id: "animal1", name: "Cute Fox", imageUrl: "/images/templates/fox.png" },
    { id: "animal2", name: "Happy Bear", imageUrl: "/images/templates/bear.png" },
    { id: "house1", name: "Cottage", imageUrl: "/images/templates/cottage.png" },
    { id: "landscape1", name: "Forest", imageUrl: "/images/templates/forest.png" },
    { id: "landscape2", name: "Beach", imageUrl: "/images/templates/beach.png" },
  ];

  const colors: Color[] = [
    { hex: "#FF5252", name: "Red" },
    { hex: "#FF9800", name: "Orange" },
    { hex: "#FFEB3B", name: "Yellow" },
    { hex: "#4CAF50", name: "Green" },
    { hex: "#2196F3", name: "Blue" },
    { hex: "#673AB7", name: "Purple" },
    { hex: "#795548", name: "Brown" },
    { hex: "#000000", name: "Black" },
    { hex: "#FFFFFF", name: "White" },
    { hex: "#E91E63", name: "Pink" },
    { hex: "#009688", name: "Teal" },
    { hex: "#8BC34A", name: "Light Green" },
  ];

  useEffect(() => {
    if (templates.length > 0 && !selectedTemplate) {
      setSelectedTemplate(templates[0]);
    }
  }, []);

  useEffect(() => {
    if (!canvasRef.current || !selectedTemplate) return;

    if (appRef.current) {
      appRef.current.destroy(true);
    }

    try {
      const app = new PIXI.Application({
        view: canvasRef.current as HTMLCanvasElement,
        width: 600,
        height: 400,
        backgroundColor: 0xFFFFFF,
        antialias: true,
      });
      appRef.current = app;

      const background = new PIXI.Container();
      app.stage.addChild(background);

      const templateSprite = PIXI.Sprite.from(selectedTemplate.imageUrl);
      templateSprite.alpha = 0.3;
      templateSprite.width = 600;
      templateSprite.height = 400;
      background.addChild(templateSprite);

      const graphics = new PIXI.Graphics();
      app.stage.addChild(graphics);
      graphicsRef.current = graphics;

      app.view.addEventListener('pointerdown', startDrawing);
      app.view.addEventListener('pointermove', draw);
      app.view.addEventListener('pointerup', stopDrawing);
      app.view.addEventListener('pointerout', stopDrawing);
    } catch (error) {
      console.error("Error initializing PIXI application:", error);
    }

    return () => {
      if (appRef.current) {
        const app = appRef.current;
        app.view.removeEventListener('pointerdown', startDrawing);
        app.view.removeEventListener('pointermove', draw);
        app.view.removeEventListener('pointerup', stopDrawing);
        app.view.removeEventListener('pointerout', stopDrawing);
        app.destroy(true);
      }
    };
  }, [selectedTemplate]);

  const startDrawing = (e: PointerEvent) => {
    if (!graphicsRef.current) return;
    
    setIsDrawing(true);
    const { x, y } = getCanvasCoordinates(e);
    
    graphicsRef.current.lineStyle(brushSize, parseInt(selectedColor.hex.replace('#', '0x')), 1);
    graphicsRef.current.beginFill(parseInt(selectedColor.hex.replace('#', '0x')));
    graphicsRef.current.drawCircle(x, y, brushSize / 2);
    graphicsRef.current.endFill();
    graphicsRef.current.moveTo(x, y);
  };

  const draw = (e: PointerEvent) => {
    if (!isDrawing || !graphicsRef.current) return;
    
    const { x, y } = getCanvasCoordinates(e);
    
    graphicsRef.current.lineStyle(brushSize, parseInt(selectedColor.hex.replace('#', '0x')), 1);
    graphicsRef.current.lineTo(x, y);
  };

  const stopDrawing = () => {
    if (!graphicsRef.current) return;
    setIsDrawing(false);
    graphicsRef.current.endFill();
  };

  const getCanvasCoordinates = (e: PointerEvent) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = canvasRef.current.width / rect.width;
    const scaleY = canvasRef.current.height / rect.height;
    
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const clearCanvas = () => {
    if (!graphicsRef.current) return;
    graphicsRef.current.clear();
    toast({
      title: "Canvas cleared!",
      description: "You can start painting from scratch.",
    });
  };

  const downloadImage = () => {
    if (!canvasRef.current) return;
    
    const link = document.createElement('a');
    link.download = `${selectedTemplate?.name || 'painting'}.png`;
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
    
    toast({
      title: "Painting downloaded!",
      description: "Your masterpiece has been saved to your device.",
    });
  };

  const selectTemplate = (template: Template) => {
    setSelectedTemplate(template);
  };

  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-kids-background to-kids-card">
      <div className="max-w-5xl mx-auto">
        <header className="mb-6 flex items-center justify-between">
          <Button variant="outline" onClick={onBack} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Games</span>
          </Button>
          <h1 className="text-3xl font-bold text-kids-primary">Painting Studio</h1>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="p-4 col-span-1 lg:col-span-2 flex flex-col">
            <div className="bg-white rounded-lg overflow-hidden mb-4 flex-grow">
              <canvas 
                ref={canvasRef}
                width={600}
                height={400}
                className="w-full h-full object-contain touch-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-4 mt-2">
              <Button 
                variant="outline" 
                onClick={clearCanvas}
                className="flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Clear Canvas
              </Button>
              <Button 
                onClick={downloadImage} 
                className="bg-kids-primary hover:bg-kids-secondary flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Save Painting
              </Button>
            </div>
          </Card>

          <div className="space-y-4">
            <Card className="p-4">
              <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Colors
              </h2>
              <div className="grid grid-cols-4 gap-2">
                {colors.map((color) => (
                  <motion.div
                    key={color.hex}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedColor(color)}
                    className={`w-12 h-12 rounded-full cursor-pointer flex items-center justify-center ${
                      selectedColor.hex === color.hex ? 'ring-4 ring-kids-primary' : ''
                    }`}
                    style={{ backgroundColor: color.hex }}
                    title={color.name}
                  />
                ))}
              </div>
              <div className="mt-4">
                <h3 className="text-sm font-medium mb-1">Brush Size</h3>
                <input
                  type="range"
                  min="1"
                  max="30"
                  value={brushSize}
                  onChange={(e) => setBrushSize(Number(e.target.value))}
                  className="w-full"
                />
                <div 
                  className="w-10 h-10 rounded-full mx-auto mt-2"
                  style={{ 
                    backgroundColor: selectedColor.hex,
                    width: `${brushSize}px`,
                    height: `${brushSize}px` 
                  }}
                />
              </div>
            </Card>

            <Card className="p-4">
              <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
                <Image className="h-5 w-5" />
                Templates
              </h2>
              <div className="grid grid-cols-2 gap-2">
                {templates.map((template) => (
                  <motion.div
                    key={template.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => selectTemplate(template)}
                    className={`cursor-pointer rounded-lg overflow-hidden border-2 ${
                      selectedTemplate?.id === template.id ? 'border-kids-primary' : 'border-gray-200'
                    }`}
                  >
                    <div className="aspect-w-4 aspect-h-3 bg-gray-100">
                      <div className="w-full h-full flex items-center justify-center text-xs text-gray-400 p-1 text-center">
                        {template.name}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaintingGame;
