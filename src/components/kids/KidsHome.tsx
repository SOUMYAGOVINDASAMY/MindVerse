import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Brush, Brain, Gamepad2, Puzzle, Grid3X3, ToyBrick, Piano, Dice3 } from "lucide-react";

interface KidsHomeProps {
  onStartQuiz: (category?: string) => void;
  onStartGame: (game: string) => void;
}

const KidsHome: React.FC<KidsHomeProps> = ({ onStartQuiz, onStartGame }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 p-6">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-12">
          <motion.h1 
            className="text-4xl md:text-5xl font-bold text-kids-primary mb-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Welcome to Kids Zone!
          </motion.h1>
          <motion.p 
            className="text-xl text-gray-600 max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            Learn fun facts and play cool games made just for kids!
          </motion.p>
        </header>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <motion.div 
            className="col-span-1"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <Card className="h-full bg-blue-50 border-2 border-kids-primary overflow-hidden">
              <div className="p-6 flex flex-col h-full">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 rounded-full bg-kids-primary flex items-center justify-center mr-3">
                    <Brain className="h-5 w-5 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-kids-primary">Fun Quizzes</h2>
                </div>
                
                <p className="mb-6 text-gray-600">Test your knowledge with these fun and educational quizzes!</p>
                
                <div className="space-y-3 mt-auto">
                  <Button 
                    onClick={() => onStartQuiz("animals")}
                    className="w-full bg-kids-primary hover:bg-kids-secondary"
                  >
                    Animal Quiz
                  </Button>
                  
                  <Button 
                    onClick={() => onStartQuiz("nature")}
                    className="w-full bg-kids-primary hover:bg-kids-secondary"
                  >
                    Nature Quiz
                  </Button>
                  
                  <Button 
                    onClick={() => onStartQuiz("general")} 
                    className="w-full bg-kids-primary hover:bg-kids-secondary"
                  >
                    General Knowledge
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
          
          <motion.div 
            className="col-span-1"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <Card className="h-full bg-purple-50 border-2 border-kids-primary overflow-hidden">
              <div className="p-6 flex flex-col h-full">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 rounded-full bg-kids-primary flex items-center justify-center mr-3">
                    <Gamepad2 className="h-5 w-5 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-kids-primary">Cool Games</h2>
                </div>
                
                <p className="mb-6 text-gray-600">Play these awesome games that are both fun and help you learn!</p>
                
                <div className="space-y-3 mt-auto">
                  <Button 
                    onClick={() => onStartGame("painting")}
                    className="w-full bg-kids-primary hover:bg-kids-secondary flex items-center justify-center gap-2"
                  >
                    <Brush className="h-4 w-4" />
                    Painting Studio
                  </Button>
                  
                  <Button 
                    onClick={() => onStartGame("memory")}
                    className="w-full bg-kids-primary hover:bg-kids-secondary"
                  >
                    Memory Match
                  </Button>
                  
                  <Button 
                    onClick={() => onStartGame("brainly")} 
                    className="w-full bg-kids-primary hover:bg-kids-secondary flex items-center justify-center gap-2"
                  >
                    <Brain className="h-4 w-4" />
                    Brainly Quiz
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
          
          <motion.div 
            className="col-span-1 lg:col-span-1"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <Card className="h-full bg-green-50 border-2 border-kids-primary overflow-hidden">
              <div className="p-6 flex flex-col h-full">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 rounded-full bg-kids-primary flex items-center justify-center mr-3">
                    <ToyBrick className="h-5 w-5 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-kids-primary">More Games</h2>
                </div>
                
                <p className="mb-6 text-gray-600">Even more fun games to play and enjoy!</p>
                
                <div className="space-y-3 mt-auto">
                  <Button 
                    onClick={() => onStartGame("pixels")}
                    className="w-full bg-kids-primary hover:bg-kids-secondary flex items-center justify-center gap-2"
                  >
                    <Grid3X3 className="h-4 w-4" />
                    Pixel Art
                  </Button>
                  
                  <Button 
                    onClick={() => onStartGame("mario")}
                    className="w-full bg-kids-primary hover:bg-kids-secondary"
                  >
                    Platform Adventure
                  </Button>
                  
                  <Button 
                    onClick={() => onStartGame("puzzle")}
                    className="w-full bg-kids-primary hover:bg-kids-secondary flex items-center justify-center gap-2"
                  >
                    <Puzzle className="h-4 w-4" />
                    Puzzles
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div 
            className="col-span-1 lg:col-span-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <Card className="h-full bg-yellow-50 border-2 border-kids-primary overflow-hidden">
              <div className="p-6 flex flex-col h-full">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 rounded-full bg-kids-primary flex items-center justify-center mr-3">
                    <Gamepad2 className="h-5 w-5 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-kids-primary">New Games</h2>
                </div>
                
                <p className="mb-6 text-gray-600">Try our newest games that help you learn while having fun!</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Button 
                    onClick={() => onStartGame("piano")}
                    className="w-full bg-kids-primary hover:bg-kids-secondary flex items-center justify-center gap-2"
                  >
                    <Piano className="h-4 w-4" />
                    Magic Piano
                  </Button>
                  
                  <Button 
                    onClick={() => onStartGame("chess")}
                    className="w-full bg-kids-primary hover:bg-kids-secondary flex items-center justify-center gap-2"
                  >
                    Chess for Kids
                  </Button>
                  
                  <Button 
                    onClick={() => onStartGame("level-devil")}
                    className="w-full bg-kids-primary hover:bg-kids-secondary flex items-center justify-center gap-2"
                  >
                    <Dice3 className="h-4 w-4" />
                    Level Devil
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default KidsHome;
