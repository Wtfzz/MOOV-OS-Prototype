import { useState, useEffect, useRef, useCallback } from "react";
import { RefreshCw, CheckCircle2 } from "lucide-react";

interface SliderCaptchaProps {
  onVerify: (success: boolean) => void;
  context?: "login" | "forgotPassword";
}

const CAPTCHA_STORAGE_KEY = "moov_captcha_state";
const CAPTCHA_VALID_DURATION = 5 * 60 * 1000; // 5 minutes
const CAPTCHA_IMAGE_HEIGHT = 160;

// Realistic logistics/cargo background images from Unsplash
const BACKGROUND_IMAGES = [
  "https://images.unsplash.com/photo-1494412519320-aa613dfb7738?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1587293852726-70cdb56c2866?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1605745341112-85968b19335b?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1578575437130-527eed3abbec?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1565793298595-6a879b1d9492?q=80&w=800&auto=format&fit=crop",
];

interface CaptchaState {
  targetX: number;
  targetY: number;
  verified: boolean;
  verifiedAt: number | null;
  context: "login" | "forgotPassword";
  bgIndex: number;
}

function generateRandomPosition(): { x: number; y: number } {
  // Target position stays within the compact captcha image used in dialogs.
  return {
    x: Math.floor(Math.random() * 160) + 120,
    y: Math.floor(Math.random() * 70) + 18,
  };
}

function getCaptchaState(context: "login" | "forgotPassword"): CaptchaState | null {
  try {
    const stored = localStorage.getItem(CAPTCHA_STORAGE_KEY);
    if (!stored) return null;
    
    const state: CaptchaState = JSON.parse(stored);
    
    // Check if expired
    if (state.verified && state.verifiedAt) {
      const elapsed = Date.now() - state.verifiedAt;
      if (elapsed > CAPTCHA_VALID_DURATION) {
        localStorage.removeItem(CAPTCHA_STORAGE_KEY);
        return null;
      }
    }
    
    // Check if context matches
    if (state.context !== context) {
      return null;
    }
    
    return state;
  } catch {
    return null;
  }
}

function saveCaptchaState(state: CaptchaState) {
  localStorage.setItem(CAPTCHA_STORAGE_KEY, JSON.stringify(state));
}

export function isCaptchaValid(context: "login" | "forgotPassword"): boolean {
  const state = getCaptchaState(context);
  return state?.verified === true;
}

export function resetCaptcha(context: "login" | "forgotPassword") {
  const stored = localStorage.getItem(CAPTCHA_STORAGE_KEY);
  if (stored) {
    const state: CaptchaState = JSON.parse(stored);
    if (state.context === context) {
      localStorage.removeItem(CAPTCHA_STORAGE_KEY);
    }
  }
}

export default function SliderCaptcha({ onVerify, context = "login" }: SliderCaptchaProps) {
  const [bgIndex, setBgIndex] = useState(Math.floor(Math.random() * BACKGROUND_IMAGES.length));
  const [targetPos, setTargetPos] = useState(generateRandomPosition());
  const [sliderX, setSliderX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [showError, setShowError] = useState(false);
  const [startX, setStartX] = useState(0);
  
  const trackRef = useRef<HTMLDivElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);

  const PIECE_SIZE = 42; // Puzzle piece size

  // SVG path for realistic jigsaw puzzle piece shape
  // Top: tab (bump out), Right: blank (indent), Bottom: tab (bump out), Left: flat
  const PUZZLE_PATH = "M 0,12 L 0,30 L 0,42 L 12,42 C 12,35 18,30 21,30 C 24,30 30,35 30,42 L 42,42 L 42,30 C 35,30 30,24 30,21 C 30,18 35,12 42,12 L 42,0 L 30,0 C 30,7 24,12 21,12 C 18,12 12,7 12,0 L 0,0 Z";

  // Check if already verified on mount
  useEffect(() => {
    const state = getCaptchaState(context);
    if (state?.verified) {
      setIsVerified(true);
      setTargetPos({ x: state.targetX, y: state.targetY });
      setBgIndex(state.bgIndex);
      onVerify(true);
    }
  }, [context, onVerify]);

  const handleMouseDown = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (isVerified) return;
    
    setIsDragging(true);
    setShowError(false);
    
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    setStartX(clientX - sliderX);
  }, [isVerified, sliderX]);

  const handleMouseMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (!isDragging || isVerified) return;
    
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const newX = clientX - startX;
    
    // Clamp between 0 and max track width
    const maxX = trackRef.current ? trackRef.current.offsetWidth - PIECE_SIZE : 300;
    const clampedX = Math.max(0, Math.min(newX, maxX));
    
    setSliderX(clampedX);
  }, [isDragging, isVerified, startX]);

  const handleMouseUp = useCallback(() => {
    if (!isDragging || isVerified) return;
    
    setIsDragging(false);
    
    // Check if within tolerance (±5px for realistic feel)
    const tolerance = 5;
    const diff = Math.abs(sliderX - targetPos.x);
    
    if (diff <= tolerance) {
      // Success
      setIsVerified(true);
      setShowError(false);
      
      const state: CaptchaState = {
        targetX: targetPos.x,
        targetY: targetPos.y,
        verified: true,
        verifiedAt: Date.now(),
        context,
        bgIndex,
      };
      saveCaptchaState(state);
      
      onVerify(true);
    } else {
      // Failed
      setShowError(true);
      setTimeout(() => {
        setSliderX(0);
        setShowError(false);
      }, 600);
    }
  }, [isDragging, isVerified, sliderX, targetPos, context, onVerify, bgIndex]);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleMouseMove);
      document.addEventListener('touchend', handleMouseUp);
    }
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleMouseMove);
      document.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const handleRefresh = () => {
    setSliderX(0);
    setTargetPos(generateRandomPosition());
    setBgIndex(Math.floor(Math.random() * BACKGROUND_IMAGES.length));
    setShowError(false);
    setIsVerified(false);
    localStorage.removeItem(CAPTCHA_STORAGE_KEY);
    onVerify(false);
  };

  if (isVerified) {
    return (
      <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-md">
        <CheckCircle2 className="w-5 h-5 text-green-600" />
        <span className="text-sm text-green-700 font-medium">验证通过</span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Captcha Image Area with Puzzle */}
      <div 
        ref={trackRef}
        className="relative w-full h-[160px] rounded-lg overflow-hidden border border-border shadow-sm"
      >
        {/* Background Image */}
        <img
          src={BACKGROUND_IMAGES[bgIndex]}
          alt="captcha"
          className="absolute inset-0 w-full h-full object-cover"
          draggable={false}
        />
        
        {/* Dark overlay for better contrast */}
        <div className="absolute inset-0 bg-black/10" />
        
        {/* Target Gap Position - shows where the puzzle piece should go */}
        <div
          className="absolute"
          style={{
            left: `${targetPos.x}px`,
            top: `${targetPos.y}px`,
            width: `${PIECE_SIZE + 12}px`,
            height: `${PIECE_SIZE + 12}px`,
          }}
        >
          <svg width={PIECE_SIZE + 12} height={PIECE_SIZE + 12} viewBox="-6 -6 54 54">
            <path
              d={PUZZLE_PATH}
              fill="rgba(0,0,0,0.3)"
              stroke="rgba(255,255,255,0.8)"
              strokeWidth="2"
              filter="url(#gap-shadow)"
            />
            <defs>
              <filter id="gap-shadow">
                <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="rgba(0,0,0,0.5)" />
              </filter>
            </defs>
          </svg>
        </div>

        {/* Draggable Puzzle Piece */}
        <div
          className={`absolute shadow-xl cursor-grab active:cursor-grabbing transition-transform ${
            showError ? 'ring-2 ring-red-500' : ''
          }`}
          style={{
            left: `${sliderX}px`,
            top: `${targetPos.y}px`,
            width: `${PIECE_SIZE + 12}px`,
            height: `${PIECE_SIZE + 12}px`,
            transform: showError ? 'translateX(-3px)' : 'none',
          }}
        >
          <svg width={PIECE_SIZE + 12} height={PIECE_SIZE + 12} viewBox="-6 -6 54 54" style={{ overflow: 'visible' }}>
            <defs>
              <clipPath id="puzzle-clip">
                <path d={PUZZLE_PATH} />
              </clipPath>
              <pattern id="puzzle-bg" x="0" y="0" width={trackRef.current?.offsetWidth || 400} height={CAPTCHA_IMAGE_HEIGHT} patternUnits="userSpaceOnUse">
                <image href={BACKGROUND_IMAGES[bgIndex]} width={trackRef.current?.offsetWidth || 400} height={CAPTCHA_IMAGE_HEIGHT} />
              </pattern>
            </defs>
            <rect
              x="-6"
              y="-6"
              width={PIECE_SIZE + 12}
              height={PIECE_SIZE + 12}
              fill="url(#puzzle-bg)"
              clipPath="url(#puzzle-clip)"
            />
            <path
              d={PUZZLE_PATH}
              fill="none"
              stroke="rgba(255,255,255,0.6)"
              strokeWidth="2"
            />
          </svg>
        </div>
        
        {/* Refresh Button */}
        <button
          type="button"
          onClick={handleRefresh}
          className="absolute top-2 right-2 p-2 bg-white/90 hover:bg-white rounded-md shadow-md transition-colors"
          title="刷新验证码"
        >
          <RefreshCw className="w-4 h-4 text-muted-foreground" />
        </button>
        
        {/* Instructions */}
        <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/50 rounded text-xs text-white/90">
          拖动拼图块到缺口处
        </div>
      </div>
      
      {/* Slider Control */}
      <div className="relative h-10 bg-gray-100 rounded-lg border border-border overflow-hidden">
        <div 
          className={`absolute inset-y-0 left-0 transition-colors ${
            showError ? 'bg-red-100' : 'bg-brand/20'
          }`}
          style={{ width: `${sliderX + PIECE_SIZE}px` }}
        />
        
        <div
          ref={sliderRef}
          onMouseDown={handleMouseDown}
          onTouchStart={handleMouseDown}
          className={`absolute top-0 left-0 h-10 w-10 bg-white border-2 rounded-lg shadow-md cursor-grab active:cursor-grabbing flex items-center justify-center transition-all ${
            isDragging ? 'scale-105 shadow-lg' : ''
          } ${showError ? 'border-red-500' : 'border-brand'}`}
          style={{ left: `${sliderX}px` }}
        >
          <div className="flex gap-0.5">
            <div className="w-1 h-3 bg-muted-foreground/40 rounded-full" />
            <div className="w-1 h-3 bg-muted-foreground/40 rounded-full" />
          </div>
        </div>
        
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="text-sm text-muted-foreground select-none">
            {showError ? '未对齐，请重试' : '拖动滑块完成验证'}
          </span>
        </div>
      </div>
    </div>
  );
}
