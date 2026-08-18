
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, Medal, Award } from "lucide-react";
import { getLeaderboard } from "@/services/dbService";

interface ScoreRecord {
  id: number;
  playerName: string;
  ageGroup: "kids" | "teens" | "pro";
  category: string;
  score: number;
  totalQuestions: number;
  timestamp: string;
}

interface LeaderboardProps {
  ageGroup: "kids" | "teens" | "pro";
  category: string;
  onClose: () => void;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ ageGroup, category, onClose }) => {
  const [leaderboardData, setLeaderboardData] = useState<ScoreRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const data = await getLeaderboard(ageGroup, category);
        setLeaderboardData(data);
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [ageGroup, category]);

  const getThemeClass = () => {
    switch (ageGroup) {
      case "kids":
        return {
          background: "bg-gradient-to-br from-kids-background to-kids-card",
          header: "bg-kids-primary text-white",
          button: "bg-kids-primary hover:bg-kids-secondary text-white",
        };
      case "teens":
        return {
          background: "bg-gradient-to-br from-teens-background to-teens-card",
          header: "bg-teens-primary text-white",
          button: "bg-teens-primary hover:bg-opacity-90 text-white",
        };
      case "pro":
        return {
          background: "bg-gradient-to-br from-pro-background to-pro-card",
          header: "bg-pro-primary text-white",
          button: "bg-pro-primary hover:bg-opacity-90 text-white",
        };
    }
  };

  const themeClass = getThemeClass();
  const categoryTitle = category.charAt(0).toUpperCase() + category.slice(1);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`p-6 min-h-screen ${themeClass.background}`}
    >
      <div className="max-w-3xl mx-auto">
        <Card>
          <CardHeader className={themeClass.header}>
            <CardTitle className="text-center flex justify-center items-center gap-2">
              <Trophy className="h-6 w-6" />
              {ageGroup.charAt(0).toUpperCase() + ageGroup.slice(1)} {categoryTitle} Leaderboard
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {loading ? (
              <div className="flex justify-center p-8">
                <div className="w-12 h-12 border-4 border-t-blue-500 border-b-purple-500 rounded-full animate-spin"></div>
              </div>
            ) : leaderboardData.length === 0 ? (
              <div className="text-center p-8">
                <p className="text-lg">No scores recorded yet for this category.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-12 font-bold pb-2 border-b">
                  <div className="col-span-1">Rank</div>
                  <div className="col-span-5">Player</div>
                  <div className="col-span-3 text-center">Score</div>
                  <div className="col-span-3 text-right">Date</div>
                </div>
                
                {leaderboardData.map((record, index) => (
                  <motion.div
                    key={record.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ 
                      opacity: 1, 
                      y: 0,
                      transition: { delay: index * 0.1 }
                    }}
                    className="grid grid-cols-12 items-center py-2 border-b border-gray-100"
                  >
                    <div className="col-span-1 flex items-center">
                      {index === 0 ? (
                        <Trophy className="h-5 w-5 text-yellow-500" />
                      ) : index === 1 ? (
                        <Medal className="h-5 w-5 text-gray-400" />
                      ) : index === 2 ? (
                        <Award className="h-5 w-5 text-amber-700" />
                      ) : (
                        <span className="font-medium">{index + 1}</span>
                      )}
                    </div>
                    <div className="col-span-5 font-medium">{record.playerName}</div>
                    <div className="col-span-3 text-center">
                      {record.score} / {record.totalQuestions}
                      <span className="text-xs ml-1 text-gray-500">
                        ({Math.round((record.score / record.totalQuestions) * 100)}%)
                      </span>
                    </div>
                    <div className="col-span-3 text-right text-sm text-gray-500">
                      {new Date(record.timestamp).toLocaleDateString()}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            <div className="mt-8 flex justify-center">
              <Button 
                onClick={onClose}
                className={themeClass.button}
              >
                Back to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
};

export default Leaderboard;
