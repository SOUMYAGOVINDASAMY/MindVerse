import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Home, Heart, Star, RefreshCw, PlayCircle, PauseCircle, Trophy } from "lucide-react";
import confetti from "canvas-confetti";

interface MarioGameProps {
  onBack: () => void;
}

interface Platform {
  x: number;
  y: number;
  width: number;
  height: number;
  type?: string;
  direction?: number;
  speed?: number;
}

interface Coin {
  x: number;
  y: number;
  collected: boolean;
}

interface Enemy {
  x: number;
  y: number;
  direction: number;
  alive: boolean;
  type?: string;
}

interface PowerUp {
  x: number;
  y: number;
  type: string;
  active: boolean;
  collected: boolean;
}

const GAME_WIDTH = 800;
const GAME_HEIGHT = 400;
const GRAVITY = 0.6;
const JUMP_FORCE = -12;
const MOVE_SPEED = 5;

const MarioGame: React.FC<MarioGameProps> = ({ onBack }) => {
  const [gameStarted, setGameStarted] = useState(false);
  const [gamePaused, setGamePaused] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [levelCompleted, setLevelCompleted] = useState(false);
  const [level, setLevel] = useState(1);
  const [invincible, setInvincible] = useState(false);
  
  const gameLoopRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  
  const [playerPosition, setPlayerPosition] = useState({ x: 50, y: 200 });
  const [playerVelocity, setPlayerVelocity] = useState({ x: 0, y: 0 });
  const [playerDirection, setPlayerDirection] = useState(1);
  const [isJumping, setIsJumping] = useState(false);
  const [powerUpActive, setPowerUpActive] = useState<string | null>();
  
  const [platforms, setPlatforms] = useState<Platform[]>([
    { x: 0, y: 350, width: GAME_WIDTH, height: 50, type: "ground" },
    { x: 200, y: 250, width: 100, height: 20, type: "platform" },
    { x: 400, y: 200, width: 100, height: 20, type: "platform" },
    { x: 600, y: 250, width: 100, height: 20, type: "platform" },
  ]);
  
  const [coins, setCoins] = useState<Coin[]>([
    { x: 220, y: 220, collected: false },
    { x: 250, y: 220, collected: false },
    { x: 440, y: 170, collected: false },
    { x: 470, y: 170, collected: false },
    { x: 620, y: 220, collected: false },
    { x: 650, y: 220, collected: false },
    { x: 700, y: 320, collected: false },
  ]);
  
  const [enemies, setEnemies] = useState<Enemy[]>([
    { x: 300, y: 320, direction: 1, alive: true, type: "basic" },
    { x: 500, y: 320, direction: -1, alive: true, type: "basic" },
  ]);
  
  const [powerUps, setPowerUps] = useState<PowerUp[]>([
    { x: 350, y: 250, type: "star", active: false, collected: false },
  ]);
  
  const [keysPressed, setKeysPressed] = useState<Set<string>>(new Set());
  
  const levels = [
    {
      platforms: [
        { x: 0, y: 350, width: GAME_WIDTH, height: 50, type: "ground" },
        { x: 200, y: 250, width: 100, height: 20, type: "platform" },
        { x: 400, y: 200, width: 100, height: 20, type: "platform" },
        { x: 600, y: 250, width: 100, height: 20, type: "platform" },
      ],
      coins: [
        { x: 220, y: 220, collected: false },
        { x: 250, y: 220, collected: false },
        { x: 440, y: 170, collected: false },
        { x: 470, y: 170, collected: false },
        { x: 620, y: 220, collected: false },
        { x: 650, y: 220, collected: false },
        { x: 700, y: 320, collected: false },
      ],
      enemies: [
        { x: 300, y: 320, direction: 1, alive: true, type: "basic" },
        { x: 500, y: 320, direction: -1, alive: true, type: "basic" },
      ],
      powerUps: [
        { x: 350, y: 250, type: "star", active: false, collected: false },
      ],
    },
    {
      platforms: [
        { x: 0, y: 350, width: GAME_WIDTH, height: 50, type: "ground" },
        { x: 150, y: 280, width: 80, height: 20, type: "platform" },
        { x: 300, y: 230, width: 80, height: 20, type: "platform" },
        { x: 450, y: 180, width: 80, height: 20, type: "platform" },
        { x: 600, y: 230, width: 80, height: 20, type: "platform" },
        { x: 700, y: 280, width: 100, height: 20, type: "moving", direction: 1, speed: 1 },
      ],
      coins: [
        { x: 150, y: 250, collected: false },
        { x: 300, y: 200, collected: false },
        { x: 450, y: 150, collected: false },
        { x: 600, y: 200, collected: false },
        { x: 700, y: 250, collected: false },
        { x: 200, y: 320, collected: false },
        { x: 400, y: 320, collected: false },
        { x: 600, y: 320, collected: false },
      ],
      enemies: [
        { x: 200, y: 320, direction: 1, alive: true, type: "basic" },
        { x: 400, y: 320, direction: -1, alive: true, type: "jumping" },
        { x: 600, y: 320, direction: 1, alive: true, type: "basic" },
      ],
      powerUps: [
        { x: 450, y: 150, type: "star", active: false, collected: false },
        { x: 250, y: 320, type: "heart", active: false, collected: false },
      ],
    }
  ];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      setKeysPressed(prev => new Set(prev).add(e.key));
      
      if ((e.key === "ArrowUp" || e.key === " " || e.key === "w") && !isJumping && gameStarted && !gamePaused) {
        setPlayerVelocity(prev => ({ ...prev, y: JUMP_FORCE }));
        setIsJumping(true);
      }
      
      if ((e.key === "p" || e.key === "Escape") && gameStarted && !gameOver) {
        setGamePaused(prev => !prev);
      }
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      setKeysPressed(prev => {
        const newKeys = new Set(prev);
        newKeys.delete(e.key);
        return newKeys;
      });
    };
    
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [isJumping, gameStarted, gamePaused, gameOver]);
  
  useEffect(() => {
    if (invincible) {
      const timer = setTimeout(() => {
        setInvincible(false);
        setPowerUpActive(prev => prev === "star" ? null : prev);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [invincible]);
  
  useEffect(() => {
    if (!gameStarted || gamePaused || gameOver || levelCompleted) {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
        gameLoopRef.current = null;
      }
      return;
    }
    
    const gameLoop = () => {
      let newVelocityX = 0;
      if (keysPressed.has("ArrowLeft") || keysPressed.has("a")) {
        newVelocityX = -MOVE_SPEED;
        setPlayerDirection(-1);
      } else if (keysPressed.has("ArrowRight") || keysPressed.has("d")) {
        newVelocityX = MOVE_SPEED;
        setPlayerDirection(1);
      }
      
      setPlayerVelocity(prev => ({ x: newVelocityX, y: prev.y + GRAVITY }));
      
      setPlayerPosition(prev => {
        let newX = prev.x + playerVelocity.x;
        let newY = prev.y + playerVelocity.y;
        
        if (newX < 0) newX = 0;
        if (newX > GAME_WIDTH - 30) newX = GAME_WIDTH - 30;
        
        let onPlatform = false;
        platforms.forEach(platform => {
          if (
            newY + 40 >= platform.y && 
            prev.y + 40 <= platform.y &&
            newX + 30 > platform.x && 
            newX < platform.x + platform.width
          ) {
            newY = platform.y - 40;
            setPlayerVelocity(prev => ({ ...prev, y: 0 }));
            setIsJumping(false);
            onPlatform = true;
          }
        });
        
        setCoins(prevCoins => {
          let coinsCollected = false;
          const newCoins = prevCoins.map(coin => {
            if (
              !coin.collected &&
              newX + 30 > coin.x && 
              newX < coin.x + 20 &&
              newY + 40 > coin.y && 
              newY < coin.y + 20
            ) {
              coinsCollected = true;
              setScore(prev => prev + 10);
              return { ...coin, collected: true };
            }
            return coin;
          });
          
          if (coinsCollected) {
            // Play coin sound or animation
          }
          
          const allCoinsCollected = newCoins.every(coin => coin.collected);
          if (allCoinsCollected && !levelCompleted) {
            setLevelCompleted(true);
            confetti({
              particleCount: 200,
              spread: 100,
              origin: { y: 0.5 }
            });
          }
          
          return newCoins;
        });
        
        setPowerUps(prevPowerUps => {
          return prevPowerUps.map(powerUp => {
            if (
              !powerUp.collected &&
              newX + 30 > powerUp.x && 
              newX < powerUp.x + 30 &&
              newY + 40 > powerUp.y && 
              newY < powerUp.y + 30
            ) {
              if (powerUp.type === "star") {
                setInvincible(true);
                setPowerUpActive("star");
                setScore(prev => prev + 30);
              } else if (powerUp.type === "heart") {
                setLives(prev => Math.min(prev + 1, 5));
                setScore(prev => prev + 50);
              }
              
              return { ...powerUp, collected: true, active: true };
            }
            return powerUp;
          });
        });
        
        setEnemies(prevEnemies => {
          let playerHit = false;
          
          const newEnemies = prevEnemies.map(enemy => {
            if (!enemy.alive) return enemy;
            
            let newEnemyX = enemy.x + enemy.direction * (enemy.type === "basic" ? 1 : 1.5);
            let newEnemyY = enemy.y;
            
            if (enemy.type === "jumping" && Math.random() < 0.01) {
              newEnemyY -= 5;
            }
            
            const onGround = platforms.some(platform => 
              newEnemyX + 30 > platform.x && 
              newEnemyX < platform.x + platform.width &&
              enemy.y + 30 >= platform.y - 1 && 
              enemy.y + 30 <= platform.y + 1
            );
            
            if (!onGround || newEnemyX <= 0 || newEnemyX >= GAME_WIDTH - 30) {
              return {
                ...enemy,
                x: enemy.x,
                direction: -enemy.direction
              };
            }
            
            if (
              newX + 30 > enemy.x && 
              newX < enemy.x + 30 &&
              newY + 40 > enemy.y && 
              newY < enemy.y + 30
            ) {
              if (playerVelocity.y > 0 && newY < enemy.y) {
                setPlayerVelocity(prev => ({ ...prev, y: JUMP_FORCE * 0.7 }));
                setScore(prev => prev + 20);
                return { ...enemy, alive: false };
              } else if (enemy.alive && !invincible) {
                playerHit = true;
              }
            }
            
            return { ...enemy, x: newEnemyX, y: newEnemyY };
          });
          
          if (playerHit) {
            setLives(prev => {
              const newLives = prev - 1;
              if (newLives <= 0) {
                setGameOver(true);
              }
              return newLives;
            });
            
            setPlayerPosition({ x: 50, y: 200 });
            setPlayerVelocity({ x: 0, y: 0 });
          }
          
          return newEnemies;
        });
        
        setPlatforms(prevPlatforms => {
          return prevPlatforms.map(platform => {
            if (platform.type === "moving" && platform.direction !== undefined) {
              let newX = platform.x + (platform.direction || 1) * (platform.speed || 1);
              
              if (newX <= 0 || newX + platform.width >= GAME_WIDTH) {
                return {
                  ...platform,
                  x: platform.x,
                  direction: -platform.direction
                };
              }
              
              return { ...platform, x: newX };
            }
            return platform;
          });
        });
        
        if (playerPosition.y > GAME_HEIGHT) {
          setLives(prev => {
            const newLives = prev - 1;
            if (newLives <= 0) {
              setGameOver(true);
              return 0;
            }
            return newLives;
          });
          setPlayerPosition({ x: 50, y: 200 });
          setPlayerVelocity({ x: 0, y: 0 });
        }
        
        return { x: newX, y: newY };
      });
      
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };
    
    gameLoopRef.current = requestAnimationFrame(gameLoop);
    
    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameStarted, gamePaused, playerVelocity, keysPressed, platforms, coins, enemies, powerUps, gameOver, levelCompleted, invincible]);
  
  const startGame = () => {
    const currentLevel = levels[level - 1] || levels[0];
    
    setPlayerPosition({ x: 50, y: 200 });
    setPlayerVelocity({ x: 0, y: 0 });
    setIsJumping(false);
    setScore(0);
    setLives(3);
    setGameOver(false);
    setLevelCompleted(false);
    setInvincible(false);
    setPowerUpActive(null);
    
    setPlatforms(currentLevel.platforms);
    setCoins(currentLevel.coins);
    setEnemies(currentLevel.enemies);
    setPowerUps(currentLevel.powerUps);
    
    setGameStarted(true);
    setGamePaused(false);
  };
  
  const nextLevel = () => {
    if (level < levels.length) {
      setLevel(prev => prev + 1);
      startGame();
    } else {
      setGameOver(true);
    }
  };
  
  const togglePause = () => {
    if (gameStarted && !gameOver && !levelCompleted) {
      setGamePaused(!gamePaused);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-blue-100 p-4">
      <div className="max-w-5xl mx-auto">
        <header className="flex flex-wrap justify-between items-center mb-6 gap-3">
          <Button
            onClick={onBack}
            variant="outline"
            className="flex items-center gap-2 border-2 border-blue-300"
          >
            <Home className="w-4 h-4" /> Back to Games
          </Button>
          
          <div className="flex items-center gap-4">
            <div className="bg-white px-4 py-1.5 rounded-full shadow flex items-center">
              <Star className="text-yellow-400 mr-2 h-5 w-5" />
              <span className="font-semibold">{score}</span>
            </div>
            
            <div className="bg-white px-4 py-1.5 rounded-full shadow flex items-center">
              {Array.from({ length: 3 }).map((_, i) => (
                <Heart 
                  key={i} 
                  className={`h-5 w-5 ${i < lives ? "text-red-500" : "text-gray-300"}`} 
                />
              ))}
            </div>
            
            <div className="bg-white px-4 py-1.5 rounded-full shadow flex items-center">
              <Trophy className="text-amber-500 mr-2 h-5 w-5" />
              <span className="font-semibold">Level {level}</span>
            </div>
            
            {gameStarted && !gameOver && !levelCompleted && (
              <Button 
                onClick={togglePause}
                variant="outline"
                size="sm"
                className="border-blue-300"
              >
                {gamePaused ? (
                  <PlayCircle className="h-5 w-5 text-green-500 mr-1" />
                ) : (
                  <PauseCircle className="h-5 w-5 text-amber-500 mr-1" />
                )}
                {gamePaused ? "Resume" : "Pause"}
              </Button>
            )}
          </div>
        </header>
        
        <motion.div 
          className="relative bg-white border-2 border-blue-300 rounded-xl overflow-hidden shadow-lg"
          style={{ width: "100%", height: GAME_HEIGHT }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          ref={canvasRef}
        >
          <div 
            className="absolute inset-0 bg-gradient-to-b from-sky-200 to-sky-400"
            style={{ width: GAME_WIDTH, height: GAME_HEIGHT }}
          >
            <div className="absolute top-20 left-100 w-32 h-16 rounded-full bg-white bg-opacity-90"></div>
            <div className="absolute top-40 left-400 w-48 h-20 rounded-full bg-white bg-opacity-80"></div>
            <div className="absolute top-10 left-600 w-36 h-18 rounded-full bg-white bg-opacity-90"></div>
            
            <div className="absolute bottom-0 left-0 w-full">
              <div className="absolute bottom-0 left-50 w-64 h-24 rounded-t-full bg-green-700"></div>
              <div className="absolute bottom-0 left-200 w-96 h-32 rounded-t-full bg-green-800"></div>
              <div className="absolute bottom-0 left-500 w-72 h-28 rounded-t-full bg-green-700"></div>
            </div>
          </div>
          
          {gameStarted && (
            <>
              {platforms.map((platform, index) => (
                <motion.div
                  key={index}
                  className={`absolute ${
                    platform.type === "ground" 
                      ? "bg-gradient-to-b from-green-800 to-green-900" 
                      : platform.type === "moving"
                      ? "bg-gradient-to-b from-blue-400 to-blue-600"
                      : "bg-gradient-to-b from-amber-700 to-amber-800"
                  }`}
                  style={{
                    left: platform.x,
                    top: platform.y,
                    width: platform.width,
                    height: platform.height,
                    borderRadius: platform.type !== "ground" ? "4px" : "0px",
                    boxShadow: platform.type !== "ground" ? "0 2px 4px rgba(0,0,0,0.2)" : "none"
                  }}
                  animate={
                    platform.type === "moving" ? {
                      x: [0, 20, 0, -20, 0],
                    } : {}
                  }
                  transition={
                    platform.type === "moving" ? {
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut"
                    } : {}
                  }
                >
                  {platform.type === "ground" && (
                    <div className="absolute top-0 left-0 right-0 h-6 bg-green-600"></div>
                  )}
                </motion.div>
              ))}
              
              {coins.map((coin, index) => (
                !coin.collected && (
                  <motion.div
                    key={index}
                    className="absolute"
                    style={{
                      left: coin.x,
                      top: coin.y,
                      width: 20,
                      height: 20,
                    }}
                    animate={{ 
                      y: [0, -5, 0],
                      rotateY: [0, 180, 360]
                    }}
                    transition={{ 
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeInOut" 
                    }}
                  >
                    <div className="w-full h-full rounded-full bg-yellow-400 flex items-center justify-center border border-yellow-600">
                      <div className="w-3/5 h-3/5 rounded-full bg-yellow-300"></div>
                    </div>
                  </motion.div>
                )
              ))}
              
              {powerUps.map((powerUp, index) => (
                !powerUp.collected && (
                  <motion.div
                    key={index}
                    className="absolute"
                    style={{
                      left: powerUp.x,
                      top: powerUp.y,
                      width: 30,
                      height: 30,
                    }}
                    animate={{ 
                      y: [0, -8, 0],
                      rotateY: [0, 360],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut" 
                    }}
                  >
                    {powerUp.type === "star" ? (
                      <div className="w-full h-full bg-yellow-400 rotate-45 flex items-center justify-center shadow-lg">
                        <div className="w-4/5 h-4/5 bg-yellow-300 rotate-45"></div>
                      </div>
                    ) : (
                      <div className="w-full h-full bg-red-500 rounded-sm transform rotate-45 flex items-center justify-center shadow-lg">
                        <div className="w-3/4 h-3/4 bg-red-400 rounded-sm transform rotate-45"></div>
                      </div>
                    )}
                  </motion.div>
                )
              ))}
              
              {enemies.map((enemy, index) => (
                enemy.alive && (
                  <motion.div
                    key={index}
                    className="absolute"
                    style={{
                      left: enemy.x,
                      top: enemy.y,
                      width: 30,
                      height: 30,
                      backgroundColor: enemy.type === "basic" ? "#8B0000" : "#9B2C2C",
                      borderRadius: '50% 50% 0 0'
                    }}
                    animate={{ 
                      scaleX: enemy.direction > 0 ? 1 : -1,
                      y: enemy.type === "jumping" ? [0, -10, 0] : 0
                    }}
                    transition={{ 
                      y: { 
                        duration: 1.5,
                        repeat: enemy.type === "jumping" ? Infinity : 0,
                        ease: "easeInOut"
                      }
                    }}
                  >
                    <div className="absolute top-1 left-2 w-4 h-4 bg-white rounded-full"></div>
                    <div className="absolute top-1 right-2 w-4 h-4 bg-white rounded-full"></div>
                    <div className="absolute top-2 left-3 w-2 h-2 bg-black rounded-full"></div>
                    <div className="absolute top-2 right-3 w-2 h-2 bg-black rounded-full"></div>
                    {enemy.type === "jumping" && (
                      <div className="absolute -bottom-1 left-0 right-0 h-2 bg-red-700 rounded-t-full"></div>
                    )}
                  </motion.div>
                )
              ))}
              
              <motion.div
                className={`absolute ${invincible ? "animate-pulse" : ""}`}
                style={{
                  left: playerPosition.x,
                  top: playerPosition.y,
                  width: 30,
                  height: 40,
                  backgroundColor: powerUpActive === "star" ? "#FFD700" : "#ff0000",
                  borderRadius: '8px',
                  boxShadow: invincible ? "0 0 8px 4px rgba(255,215,0,0.6)" : "none"
                }}
                animate={{ 
                  scaleX: playerDirection > 0 ? 1 : -1
                }}
              >
                <div className="absolute top-0 left-0 right-0 h-1/3 bg-blue-500"></div>
                <div className="absolute top-6 left-2 w-5 h-5 bg-white rounded-full"></div>
                <div className="absolute top-6 left-3 w-3 h-3 bg-black rounded-full"></div>
                <div className="absolute bottom-0 left-0 w-14 h-3 bg-brown-500"></div>
              </motion.div>
            </>
          )}
          
          <AnimatePresence>
            {!gameStarted && (
              <motion.div 
                className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-60 text-white"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <motion.h2 
                  className="text-4xl font-bold mb-6"
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  Platform Adventure
                </motion.h2>
                <motion.p 
                  className="text-lg mb-8 text-center max-w-md"
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  Collect all coins while avoiding enemies to complete the level!
                </motion.p>
                <motion.button
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-full text-xl font-medium transition-colors flex items-center gap-2"
                  onClick={startGame}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ 
                    type: "spring",
                    stiffness: 400,
                    damping: 10,
                    delay: 0.6
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <PlayCircle className="h-5 w-5" /> Start Game
                </motion.button>
                
                <motion.div 
                  className="mt-8 bg-gray-800 bg-opacity-80 p-4 rounded-md max-w-sm"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.8 }}
                >
                  <h3 className="text-center font-medium mb-2">Controls</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>Arrow Keys / WASD</div>
                    <div>Move</div>
                    <div>Space / Up Arrow</div>
                    <div>Jump</div>
                    <div>P / Escape</div>
                    <div>Pause</div>
                  </div>
                </motion.div>
              </motion.div>
            )}
            
            {gamePaused && (
              <motion.div 
                className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-60 text-white"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.div 
                  className="text-center"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                >
                  <h2 className="text-4xl font-bold mb-6">Paused</h2>
                  <div className="space-x-4">
                    <Button 
                      onClick={() => setGamePaused(false)}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <PlayCircle className="h-4 w-4 mr-2" />
                      Resume
                    </Button>
                    <Button 
                      onClick={onBack} 
                      variant="outline"
                      className="border-white text-white hover:bg-white/10"
                    >
                      Exit Game
                    </Button>
                  </div>
                </motion.div>
              </motion.div>
            )}
            
            {gameOver && (
              <motion.div 
                className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70 text-white"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.div 
                  className="text-center"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                >
                  <h2 className="text-4xl font-bold mb-2 text-red-500">Game Over</h2>
                  <p className="mb-6">Score: {score}</p>
                  <div className="space-x-4">
                    <Button 
                      onClick={startGame}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Play Again
                    </Button>
                    <Button 
                      onClick={onBack} 
                      variant="outline"
                      className="border-white text-white hover:bg-white/10"
                    >
                      Back to Games
                    </Button>
                  </div>
                </motion.div>
              </motion.div>
            )}
            
            {levelCompleted && (
              <motion.div 
                className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-indigo-900/70 to-purple-900/70 text-white"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.div 
                  className="text-center"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                >
                  <motion.h2 
                    className="text-4xl font-bold mb-2 text-yellow-300"
                    initial={{ y: -20 }}
                    animate={{ y: 0 }}
                  >
                    Level Complete!
                  </motion.h2>
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <p className="text-xl mb-2">Final Score: {score}</p>
                    <p className="mb-6">Lives Remaining: {lives}</p>
                  </motion.div>
                  <div className="space-x-4">
                    {level < levels.length ? (
                      <Button 
                        onClick={nextLevel}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Trophy className="h-4 w-4 mr-2" />
                        Next Level
                      </Button>
                    ) : (
                      <Button 
                        onClick={startGame}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Play Again
                      </Button>
                    )}
                    <Button 
                      onClick={onBack} 
                      variant="outline"
                      className="border-white text-white hover:bg-white/10"
                    >
                      Back to Games
                    </Button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
          
          <div className="absolute bottom-2 left-2 text-xs text-white/70">
            Use arrow keys or WASD to move, Space/Up to jump
          </div>
        </motion.div>
        
        {gameStarted && !gameOver && !levelCompleted && (
          <div className="lg:hidden mt-4 flex justify-between">
            <div className="flex gap-2">
              <button 
                className="bg-black/20 w-16 h-16 rounded-full flex items-center justify-center"
                onTouchStart={() => setKeysPressed(prev => new Set(prev).add("ArrowLeft"))}
                onTouchEnd={() => setKeysPressed(prev => {
                  const newKeys = new Set(prev);
                  newKeys.delete("ArrowLeft");
                  return newKeys;
                })}
              >
                <span className="text-white text-2xl">←</span>
              </button>
              <button
                className="bg-black/20 w-16 h-16 rounded-full flex items-center justify-center"
                onTouchStart={() => setKeysPressed(prev => new Set(prev).add("ArrowRight"))}
                onTouchEnd={() => setKeysPressed(prev => {
                  const newKeys = new Set(prev);
                  newKeys.delete("ArrowRight");
                  return newKeys;
                })}
              >
                <span className="text-white text-2xl">→</span>
              </button>
            </div>
            
            <button 
              className="bg-black/20 w-16 h-16 rounded-full flex items-center justify-center"
              onTouchStart={() => {
                if (!isJumping) {
                  setPlayerVelocity(prev => ({ ...prev, y: JUMP_FORCE }));
                  setIsJumping(true);
                }
              }}
            >
              <span className="text-white text-2xl">↑</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MarioGame;
