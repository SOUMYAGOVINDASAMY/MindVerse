
import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";

interface AgeSelectorProps {
  onSelectAge: (ageGroup: "kids" | "teens" | "pro") => void;
}

const AgeSelector: React.FC<AgeSelectorProps> = ({ onSelectAge }) => {
  return (
    <div className="flex flex-col items-center justify-center p-6 gap-8">
      <h1 className="text-4xl md:text-5xl font-bold text-center bg-gradient-to-r from-purple-600 via-blue-500 to-pink-500 bg-clip-text text-transparent">
        Welcome to AgeWise QuizFest
      </h1>
      
      <p className="text-xl text-center max-w-2xl text-gray-600">
        Select your age group to get started with quizzes and games designed just for you!
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
        <motion.div 
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          className="col-span-1"
        >
          <Card className="bg-kids-pattern overflow-hidden border-2 border-kids-primary">
            <div className="p-6 flex flex-col items-center">
              <div className="w-24 h-24 rounded-full bg-kids-primary mb-4 flex items-center justify-center">
                <span className="text-3xl font-bold text-white">5-12</span>
              </div>
              <h2 className="text-2xl font-bold font-kids mb-2 text-kids-primary">Kids Zone</h2>
              <p className="text-center mb-4">Fun quizzes and interactive games!</p>
              <Button 
                onClick={() => onSelectAge("kids")}
                className="bg-kids-primary hover:bg-opacity-90 text-white font-medium px-6"
              >
                Enter Kids Zone
              </Button>
            </div>
          </Card>
        </motion.div>

        <motion.div 
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          className="col-span-1"
        >
          <Card className="bg-teens-pattern overflow-hidden border-2 border-teens-primary">
            <div className="p-6 flex flex-col items-center">
              <div className="w-24 h-24 rounded-full bg-teens-primary mb-4 flex items-center justify-center">
                <span className="text-3xl font-bold text-white">13-17</span>
              </div>
              <h2 className="text-2xl font-bold font-teens mb-2 text-teens-primary">Teen Academy</h2>
              <p className="text-center mb-4">Math and Science challenges!</p>
              <Button 
                onClick={() => onSelectAge("teens")}
                className="bg-teens-primary hover:bg-opacity-90 text-white font-medium px-6"
              >
                Enter Teen Academy
              </Button>
            </div>
          </Card>
        </motion.div>

        <motion.div 
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          className="col-span-1"
        >
          <Card className="overflow-hidden border-2 border-pro-primary">
            <div className="p-6 flex flex-col items-center">
              <div className="w-24 h-24 rounded-full bg-pro-primary mb-4 flex items-center justify-center">
                <span className="text-3xl font-bold text-white">18+</span>
              </div>
              <h2 className="text-2xl font-bold font-pro mb-2 text-pro-primary">Pro Challenges</h2>
              <p className="text-center mb-4">Aptitude, Logic, and Coding tests!</p>
              <Button 
                onClick={() => onSelectAge("pro")}
                className="bg-pro-primary hover:bg-opacity-90 text-white font-medium px-6"
              >
                Enter Pro Zone
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default AgeSelector;
