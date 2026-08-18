
import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calculator, Beaker } from "lucide-react";

interface TeensHomeProps {
  onStartQuiz: (subject: string) => void;
}

const TeensHome: React.FC<TeensHomeProps> = ({ onStartQuiz }) => {
  return (
    <div className="p-6 bg-gradient-to-br from-teens-background to-teens-card min-h-screen">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto"
      >
        <header className="text-center mb-8">
          <h1 className="text-4xl font-teens font-bold text-teens-primary mb-2">
            Teen Academy
          </h1>
          <p className="text-xl text-teens-secondary">Academic challenges for ages 13-17!</p>
        </header>

        <div className="mb-10">
          <h2 className="text-2xl font-teens font-bold text-teens-primary mb-4">Subject Quizzes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="overflow-hidden border-2 border-teens-primary">
              <CardContent className="p-6 flex flex-col md:flex-row items-center gap-6">
                <div className="w-24 h-24 rounded-full bg-teens-primary flex items-center justify-center">
                  <Calculator className="h-12 w-12 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-2">Mathematics Quiz</h3>
                  <p className="mb-4">Test your skills with 25 math problems covering algebra, geometry, and more!</p>
                  <Button 
                    onClick={() => onStartQuiz("math")}
                    className="bg-teens-primary hover:bg-opacity-90 text-white"
                  >
                    Start Math Quiz
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="overflow-hidden border-2 border-teens-primary">
              <CardContent className="p-6 flex flex-col md:flex-row items-center gap-6">
                <div className="w-24 h-24 rounded-full bg-teens-primary flex items-center justify-center">
                  <Beaker className="h-12 w-12 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-2">Science Quiz</h3>
                  <p className="mb-4">Challenge yourself with 25 questions about physics, chemistry, biology, and more!</p>
                  <Button 
                    onClick={() => onStartQuiz("science")}
                    className="bg-teens-primary hover:bg-opacity-90 text-white"
                  >
                    Start Science Quiz
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default TeensHome;
