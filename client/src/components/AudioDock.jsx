import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Volume2, VolumeX, RotateCcw, FileText, BookOpen, Sparkles, Music } from 'lucide-react';

export default function AudioDock({
  book,
  isPdfMode,
  onTogglePdfMode,
  reciterName = "Zia Mohyeddin (Classical Tarannum)",
  audioTitle = "Dastoor — Audio Recitation",
  audioSrc
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(28); // Percentage
  const [currentTime, setCurrentTime] = useState(48); // seconds
  const [duration, setDuration] = useState(172); // seconds
  const [isMuted, setIsMuted] = useState(false);

  // Simulated audio playback progression for seamless aesthetic experience
  useEffect(() => {
    let interval = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= duration) {
            setIsPlaying(false);
            return 0;
          }
          const next = prev + 1;
          setProgress((next / duration) * 100);
          return next;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, duration]);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const newPercent = Math.max(0, Math.min(100, (clickX / width) * 100));
    setProgress(newPercent);
    setCurrentTime(Math.floor((newPercent / 100) * duration));
  };

  // 32 aesthetic waveform bar heights
  const waveformHeights = [
    20, 35, 60, 45, 80, 50, 65, 90, 75, 40, 55, 70, 85, 95, 60, 40,
    30, 50, 70, 85, 100, 65, 45, 80, 60, 40, 75, 55, 35, 60, 45, 25
  ];

  return (
    <footer className="fixed bottom-0 inset-x-0 h-16 bg-[#FAF9F6]/95 backdrop-blur-md border-t border-[#E2DDD5] z-30 flex items-center px-4 sm:px-6 shadow-md select-none transition-all">
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-4">
        
        {/* Left: Reciter & Track Info */}
        <div className="flex items-center gap-3 min-w-0 w-1/4">
          <div className="w-9 h-9 rounded-xl bg-[#F2EFE9] border border-[#E2DDD5] flex items-center justify-center shrink-0 shadow-2xs">
            <Music className={`w-4 h-4 ${isPlaying ? 'text-[#BA4E36] animate-pulse' : 'text-[#66615B]'}`} />
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-bold text-[#1E1B18] truncate font-editorial">
              {book ? (book.title_hi || book.title_en || audioTitle) : audioTitle}
            </h4>
            <p className="text-[10px] text-[#66615B] truncate flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#BA4E36]"></span>
              <span>{reciterName}</span>
            </p>
          </div>
        </div>

        {/* Center: Waveform Scrubber & Playback Controls */}
        <div className="flex-1 max-w-xl flex items-center gap-3">
          {/* Play/Pause Button */}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-8 h-8 rounded-full bg-[#1E1B18] hover:bg-[#BA4E36] text-white flex items-center justify-center shrink-0 shadow-xs transition cursor-pointer"
            title={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <Pause className="w-3.5 h-3.5 fill-current" />
            ) : (
              <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
            )}
          </button>

          {/* Current Time */}
          <span className="text-[11px] font-mono text-[#66615B] shrink-0 w-8 text-right">
            {formatTime(currentTime)}
          </span>

          {/* Interactive Waveform Scrubber */}
          <div
            onClick={handleSeek}
            className="flex-1 h-8 flex items-center gap-0.5 sm:gap-1 cursor-pointer group px-1"
            title="Click to seek"
          >
            {waveformHeights.map((h, i) => {
              const barPercent = (i / waveformHeights.length) * 100;
              const isPassed = barPercent <= progress;
              return (
                <div
                  key={i}
                  className={`w-1 rounded-full transition-all duration-150 ${
                    isPassed
                      ? 'bg-[#BA4E36]'
                      : 'bg-[#E2DDD5] group-hover:bg-[#d5cfc5]'
                  } ${isPlaying && isPassed ? 'opacity-90' : ''}`}
                  style={{
                    height: `${Math.max(15, h * (isPlaying ? 0.7 + Math.random() * 0.3 : 0.7))}%`
                  }}
                />
              );
            })}
          </div>

          {/* Total Duration */}
          <span className="text-[11px] font-mono text-[#66615B] shrink-0 w-8">
            {formatTime(duration)}
          </span>

          {/* Volume Button */}
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-1 text-[#66615B] hover:text-[#1E1B18] transition cursor-pointer"
            title={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-500" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>

        {/* Right: Mode Toggle Button (Editorial vs PDF Edition) */}
        <div className="flex items-center gap-2 justify-end w-1/4">
          <button
            onClick={onTogglePdfMode}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow-xs cursor-pointer border ${
              isPdfMode
                ? 'bg-[#1E1B18] text-white border-[#1E1B18] hover:bg-black'
                : 'bg-[#FAF9F6] text-[#1E1B18] border-[#E2DDD5] hover:border-[#BA4E36] hover:text-[#BA4E36]'
            }`}
            title={isPdfMode ? "Switch to Modern Typography View" : "Switch to Facsimile PDF Reader"}
          >
            {isPdfMode ? (
              <>
                <BookOpen className="w-3.5 h-3.5 text-[#BA4E36]" />
                <span className="hidden sm:inline">Editorial Canvas</span>
              </>
            ) : (
              <>
                <FileText className="w-3.5 h-3.5 text-[#BA4E36]" />
                <span className="hidden sm:inline">Open PDF Edition</span>
              </>
            )}
          </button>
        </div>

      </div>
    </footer>
  );
}
