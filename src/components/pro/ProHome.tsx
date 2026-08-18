
import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Code, Lightbulb, BrainCircuit } from "lucide-react";

interface ProHomeProps {
  onStartQuiz: (quizType: string) => void;
}

const ProHome: React.FC<ProHomeProps> = ({ onStartQuiz }) => {
  return (
    <div className="p-6 bg-gradient-to-br from-pro-background to-pro-card min-h-screen">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto"
      >
        <header className="text-center mb-8">
          <h1 className="text-4xl font-pro font-bold text-pro-primary mb-2">
            Professional Challenges
          </h1>
          <p className="text-xl text-pro-secondary">Advanced quizzes for professional development</p>
        </header>

        <div className="mb-10">
          <h2 className="text-2xl font-pro font-bold text-pro-primary mb-4">Professional Assessment</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="overflow-hidden border border-pro-accent">
              <CardContent className="p-6 flex flex-col items-center gap-4">
                <div className="w-20 h-20 rounded-full bg-pro-primary flex items-center justify-center">
                  <Lightbulb className="h-10 w-10 text-white" />
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-bold mb-2">Aptitude Test</h3>
                  <p className="mb-4">Quantitative, verbal reasoning, and data interpretation challenges</p>
                  <Button 
                    onClick={() => onStartQuiz("aptitude")}
                    className="bg-pro-primary hover:bg-opacity-90 text-white w-full"
                  >
                    Start Test
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="overflow-hidden border border-pro-accent">
              <CardContent className="p-6 flex flex-col items-center gap-4">
                <div className="w-20 h-20 rounded-full bg-pro-primary flex items-center justify-center">
                  <BrainCircuit className="h-10 w-10 text-white" />
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-bold mb-2">Logical Reasoning</h3>
                  <p className="mb-4">Critical thinking, pattern recognition, and analytical reasoning</p>
                  <Button 
                    onClick={() => onStartQuiz("logical")}
                    className="bg-pro-primary hover:bg-opacity-90 text-white w-full"
                  >
                    Start Test
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="overflow-hidden border border-pro-accent">
              <CardContent className="p-6 flex flex-col items-center gap-4">
                <div className="w-20 h-20 rounded-full bg-pro-primary flex items-center justify-center">
                  <Code className="h-10 w-10 text-white" />
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-bold mb-2">Coding Challenge</h3>
                  <p className="mb-4">Programming concepts, algorithms, and problem-solving</p>
                  <Button 
                    onClick={() => onStartQuiz("coding")}
                    className="bg-pro-primary hover:bg-opacity-90 text-white w-full"
                  >
                    Start Challenge
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

export default ProHome;
