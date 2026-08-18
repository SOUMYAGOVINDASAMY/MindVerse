
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { ArrowLeft, Piano, Volume2, VolumeX } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface MagicPianoProps {
  onBack: () => void;
}

const PIANO_KEYS = [
  { note: 'C', color: 'white', key: 'a' },
  { note: 'C#', color: 'black', key: 'w' },
  { note: 'D', color: 'white', key: 's' },
  { note: 'D#', color: 'black', key: 'e' },
  { note: 'E', color: 'white', key: 'd' },
  { note: 'F', color: 'white', key: 'f' },
  { note: 'F#', color: 'black', key: 't' },
  { note: 'G', color: 'white', key: 'g' },
  { note: 'G#', color: 'black', key: 'y' },
  { note: 'A', color: 'white', key: 'h' },
  { note: 'A#', color: 'black', key: 'u' },
  { note: 'B', color: 'white', key: 'j' }
];

const SONGS = [
  {
    name: "Twinkle Twinkle Little Star",
    notes: ["C", "C", "G", "G", "A", "A", "G", "F", "F", "E", "E", "D", "D", "C"],
    difficulty: "easy"
  },
  {
    name: "Mary Had a Little Lamb",
    notes: ["E", "D", "C", "D", "E", "E", "E", "D", "D", "D", "E", "G", "G"],
    difficulty: "easy"
  },
  {
    name: "Jingle Bells",
    notes: ["E", "E", "E", "E", "E", "E", "E", "G", "C", "D", "E", "F", "F", "F", "F", "F", "E", "E", "E", "E", "E", "D", "D", "E", "D", "G"],
    difficulty: "medium"
  }
];

const MagicPiano: React.FC<MagicPianoProps> = ({ onBack }) => {
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [currentSong, setCurrentSong] = useState<typeof SONGS[0] | null>(null);
  const [noteIndex, setNoteIndex] = useState(0);
  const [score, setScore] = useState(0);
  const { toast } = useToast();

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = PIANO_KEYS.find(k => k.key === e.key.toLowerCase());
      if (key) {
        playNote(key.note);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [currentSong, noteIndex]);

  const playNote = (note: string) => {
    if (isMuted) return;
    
    setActiveKey(note);
    setTimeout(() => setActiveKey(null), 300);
    
    // Play the actual sound (simplified - in a real app we'd use proper audio files)
    try {
      const synth = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = synth.createOscillator();
      const gainNode = synth.createGain();
      
      // Map note to frequency (simplified)
      const baseFreq = 261.63; // C4
      const noteMap = { 'C': 0, 'C#': 1, 'D': 2, 'D#': 3, 'E': 4, 'F': 5, 'F#': 6, 'G': 7, 'G#': 8, 'A': 9, 'A#': 10, 'B': 11 };
      const freq = baseFreq * Math.pow(2, (noteMap as any)[note] / 12);
      
      oscillator.type = 'sine';
      oscillator.frequency.value = freq;
      gainNode.gain.value = 0.5;
      
      oscillator.connect(gainNode);
      gainNode.connect(synth.destination);
      
      oscillator.start();
      
      setTimeout(() => {
        oscillator.stop();
        synth.close();
      }, 300);
      
      // Check if playing a song
      if (currentSong && note === currentSong.notes[noteIndex]) {
        // Correct note!
        setNoteIndex(prevIndex => {
          const newIndex = prevIndex + 1;
          
          // Check if song is complete
          if (newIndex >= currentSong.notes.length) {
            toast({
              title: "Great job!",
              description: `You completed ${currentSong.name}!`,
            });
            setScore(prevScore => prevScore + (currentSong.difficulty === "easy" ? 5 : 10));
            setCurrentSong(null);
            return 0;
          }
          
          return newIndex;
        });
      } else if (currentSong) {
        // Wrong note
        toast({
          title: "Oops!",
          description: "That's not the right note. Try again!",
          variant: "destructive"
        });
        setNoteIndex(0);
      }
    } catch (error) {
      console.error("Error playing audio:", error);
    }
  };

  const startSong = (song: typeof SONGS[0]) => {
    setCurrentSong(song);
    setNoteIndex(0);
    toast({
      title: `Let's play: ${song.name}`,
      description: "Follow the highlighted keys to play the song!",
    });
  };

  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-blue-50 to-purple-100">
      <div className="max-w-5xl mx-auto">
        <header className="mb-6 flex items-center justify-between">
          <Button variant="outline" onClick={onBack} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Games</span>
          </Button>
          <h1 className="text-3xl font-bold text-kids-primary">Magic Piano</h1>
          <Button 
            variant="ghost" 
            onClick={() => setIsMuted(!isMuted)}
            className="flex items-center gap-2"
          >
            {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
            <span>{isMuted ? "Unmute" : "Mute"}</span>
          </Button>
        </header>

        <Card className="p-4 mb-6 flex items-center justify-between">
          <div>
            {currentSong ? (
              <div>
                <p>Now playing: <strong>{currentSong.name}</strong></p>
                <p>Next note: <strong>{currentSong.notes[noteIndex]}</strong></p>
              </div>
            ) : (
              <p>Select a song to play or just have fun playing notes!</p>
            )}
          </div>
          <div>
            <p className="text-xl font-bold">Score: {score}</p>
          </div>
        </Card>

        <div className="mb-6 flex gap-2 flex-wrap">
          {SONGS.map(song => (
            <Button 
              key={song.name}
              onClick={() => startSong(song)}
              disabled={!!currentSong}
              variant={song.difficulty === "easy" ? "default" : "secondary"}
              className="flex items-center gap-2"
            >
              <Piano className="h-4 w-4" />
              {song.name}
            </Button>
          ))}
        </div>

        <div className="relative h-60 flex justify-center mb-8">
          <div className="flex h-full">
            {PIANO_KEYS.map(key => {
              const isHighlighted = currentSong && currentSong.notes[noteIndex] === key.note;
              
              return (
                <motion.div
                  key={key.note}
                  className={`cursor-pointer select-none ${
                    key.color === 'white' 
                      ? 'w-14 bg-white border border-gray-300 rounded-b' 
                      : 'w-10 bg-black absolute h-2/3 rounded-b z-10'
                  } ${
                    key.note === activeKey ? 'bg-blue-200' : ''
                  } ${
                    isHighlighted ? 'bg-yellow-200' : ''
                  }`}
                  style={{
                    left: key.color === 'black' 
                      ? (() => {
                          const index = PIANO_KEYS.findIndex(k => k.note === key.note);
                          const prevWhite = PIANO_KEYS.filter(
                            (k, i) => i < index && k.color === 'white'
                          ).length;
                          return `${prevWhite * 56 - 20}px`;
                        })() 
                      : 'auto'
                  }}
                  animate={{ 
                    y: key.note === activeKey ? 5 : 0,
                    backgroundColor: key.note === activeKey 
                      ? key.color === 'white' ? '#bee3f8' : '#4a5568'
                      : isHighlighted 
                        ? '#fef08a' 
                        : key.color === 'white' ? '#ffffff' : '#000000'
                  }}
                  onClick={() => playNote(key.note)}
                  whileHover={{ y: 2 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                >
                  <div className="absolute bottom-2 left-0 right-0 text-center">
                    <span className={`text-xs ${key.color === 'black' ? 'text-white' : 'text-black'}`}>
                      {key.note}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        <Card className="p-4">
          <h2 className="text-xl font-bold mb-2">How to Play</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>Click on piano keys or use your keyboard (a-j keys) to play notes</li>
            <li>Select a song to follow along and earn points</li>
            <li>Complete songs to increase your score</li>
            <li>The highlighted key shows you which note to play next</li>
          </ul>
        </Card>
      </div>
    </div>
  );
};

export default MagicPiano;
