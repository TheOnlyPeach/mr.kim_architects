
import React from 'react';

interface CharacterProps {
  x: number; 
  y: number; 
  isMoving?: boolean;
  direction?: 'left' | 'right';
  variant?: 'PLAYER' | 'EMPLOYEE' | 'BIM' | 'MR_KIM';
  state?: 'IDLE' | 'WALK' | 'SLEEP' | 'STUNNED';
  label?: string;
  speech?: string;
  isHighlighted?: boolean;
}

export const Character: React.FC<CharacterProps> = ({ 
  x, 
  y, 
  isMoving = false, 
  direction = 'right', 
  variant = 'PLAYER', 
  state = 'IDLE',
  label,
  speech,
  isHighlighted = false
}) => {
  const isSleeping = state === 'SLEEP';
  const isKim = variant === 'MR_KIM';
  
  // Colors based on variant
  const getColors = () => {
      switch(variant) {
          case 'MR_KIM': return { hat: 'bg-stone-900', body: 'bg-slate-900', skin: 'bg-orange-300' };
          case 'BIM': return { hat: 'bg-red-600', body: 'bg-red-800', skin: 'bg-orange-200' };
          case 'EMPLOYEE': return { hat: 'bg-yellow-400', body: 'bg-blue-600', skin: 'bg-orange-200' };
          default: return { hat: 'bg-black', body: 'bg-white', skin: 'bg-orange-100' }; // Player: Young Employee (Black hair, White shirt)
      }
  };
  const colors = getColors();

  return (
    <div 
      className={`absolute transition-none z-20 pointer-events-none billboard ${isHighlighted ? 'z-30' : ''}`}
      style={{ 
        left: `${x}%`, 
        top: `${y}%`,
        marginLeft: '-32px',
        marginTop: '-96px',
        width: '64px',
        height: '96px',
      }}
    >
      <div className={`relative w-full h-full transition-transform duration-200 ${direction === 'left' ? 'scale-x-[-1]' : ''}`}>
        
        {/* --- SHADOW (8-bit style: rectangular) --- */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-2 bg-black/40 z-[-1]"></div>

        {/* --- MAIN BODY CONTAINER --- */}
        <div className={`
            relative w-full h-full transition-transform duration-500
            ${isMoving ? 'animate-bounce' : ''}
            ${isSleeping ? 'translate-y-4 rotate-6 scale-y-90' : ''}
            ${isHighlighted ? 'drop-shadow-[0_0_8px_rgba(250,204,21,1)]' : ''} 
        `}>
            
            {/* --- SPEECH BUBBLE (Pixel style) --- */}
            {speech && (
                <div className={`
                    absolute -top-20 left-1/2 -translate-x-1/2 w-32 bg-white border-4 border-black p-2 text-center z-50
                    ${direction === 'left' ? 'scale-x-[-1]' : ''}
                    animate-[bounce_2s_infinite] shadow-lg
                `}>
                    <p className="text-xs font-black text-red-600 whitespace-normal leading-tight break-keep font-mono">{speech}</p>
                    {/* Pixel arrow */}
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-2 h-2 bg-black"></div>
                </div>
            )}

            {/* --- Zzz Particles (Sleeping Only) --- */}
            {isSleeping && (
                <div className="absolute -top-10 right-0 z-50">
                    <div className="absolute animate-[ping_2s_infinite] text-blue-300 font-bold text-xl font-mono" style={{ animationDelay: '0s' }}>Z</div>
                    <div className="absolute animate-[ping_2s_infinite] text-blue-300 font-bold text-sm font-mono -top-4 -right-4" style={{ animationDelay: '0.5s' }}>z</div>
                </div>
            )}

            {/* --- HEAD GROUP (Boxy) --- */}
            <div className={`
                absolute left-1/2 -translate-x-1/2 w-10 z-20 transition-transform duration-500
                ${isSleeping ? 'top-10 rotate-12' : 'top-4'}
            `}>
                {/* Hair / Hat */}
                {isKim ? (
                    // Fedora for Mr. Kim
                    <div className="absolute -top-4 left-[-8px] right-[-8px] h-6 bg-stone-900 z-30 border-4 border-black flex items-center justify-center">
                        <div className="absolute bottom-0 w-full h-2 bg-slate-800"></div>
                        {/* Fedora Brim */}
                        <div className="absolute bottom-[-4px] left-[-4px] right-[-4px] h-2 bg-stone-900 border-x-4 border-b-4 border-black"></div>
                    </div>
                ) : variant === 'PLAYER' ? (
                    // Player Hair (Blocky)
                    <div className="absolute -top-2 left-[-2px] right-[-2px] h-6 bg-black z-30 border-x-4 border-t-4 border-black">
                        {/* Sideburns */}
                        <div className="absolute top-4 -left-1 w-2 h-3 bg-black"></div>
                    </div>
                ) : (
                    // Hard Hat for others
                    <div className={`absolute -top-3 left-[-4px] right-[-4px] h-6 ${colors.hat} border-4 border-black z-30`}>
                        <div className="absolute top-1 left-2 w-2 h-2 bg-white/40"></div>
                    </div>
                )}

                {/* Face */}
                <div className={`h-10 ${colors.skin} border-4 border-black relative overflow-hidden`}>
                     {/* Angry Eyebrows for Kim */}
                     {isKim && (
                         <div className="absolute top-2 w-full flex justify-center gap-1">
                             <div className="w-3 h-1 bg-black rotate-12"></div>
                             <div className="w-3 h-1 bg-black -rotate-12"></div>
                         </div>
                     )}
                     
                     {/* Mustache for Kim */}
                     {isKim && (
                         <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-6 h-1 bg-slate-800"></div>
                     )}
                </div>

                {/* Eyes (Pixel) */}
                {isSleeping ? (
                    <div className="absolute top-4 left-0 right-0 flex justify-center gap-2 opacity-60">
                         <div className="w-2 h-1 bg-black"></div>
                         <div className="w-2 h-1 bg-black"></div>
                    </div>
                ) : (
                    <div className="absolute top-3 left-0 right-0 flex justify-center gap-2">
                        <div className="w-1 h-1 bg-black"></div>
                        <div className="w-1 h-1 bg-black"></div>
                    </div>
                )}
            </div>
            
            {/* --- TORSO GROUP (Boxy) --- */}
            <div className={`
                absolute left-1/2 -translate-x-1/2 w-10 z-10 transition-transform
                ${isSleeping ? 'top-16 h-8' : 'top-12 h-12'}
                ${colors.body} border-4 border-black
            `}>
                {/* Tie */}
                {(variant === 'PLAYER' || isKim) && (
                    <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-2 h-full ${isKim ? 'bg-amber-500' : 'bg-blue-500'}`}></div>
                )}
                
                {/* ID Badge (Employees) */}
                {variant !== 'PLAYER' && !isKim && <div className="absolute top-2 left-2 w-3 h-2 bg-white border border-black/20"></div>}

                {/* Suit Detail for Kim */}
                {isKim && (
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 flex flex-col gap-2 z-10">
                        <div className="w-1 h-1 bg-amber-200"></div>
                        <div className="w-1 h-1 bg-amber-200"></div>
                    </div>
                )}
            </div>
            
            {/* --- ARMS & LEGS (Boxy) --- */}
            {!isSleeping && (
                <>
                    {/* Legs */}
                    <div className={`absolute top-22 left-5 w-3 h-8 border-4 border-black z-0 ${variant === 'PLAYER' ? 'bg-slate-900' : 'bg-slate-800'}`}></div>
                    <div className={`absolute top-22 right-5 w-3 h-8 border-4 border-black z-0 ${variant === 'PLAYER' ? 'bg-slate-900' : 'bg-slate-800'}`}></div>
                </>
            )}

            {/* Blueprint (If Awake Employee or Player) */}
            {((variant === 'EMPLOYEE' && !isSleeping) || variant === 'PLAYER') && (
                 <div className="absolute top-16 -right-4 w-4 h-10 bg-blue-500 border-2 border-white rotate-12 z-30"></div>
            )}
            
        </div>
        
        {/* Label */}
        {label && (
            <div className={`
                absolute left-1/2 -translate-x-1/2 bg-black text-white text-[10px] px-2 py-0.5 whitespace-nowrap border-2 border-white z-50 transition-all font-mono
                ${isSleeping ? '-top-4 opacity-50' : '-top-8 opacity-100'}
            `}>
                {label}
            </div>
        )}
      </div>
    </div>
  );
};
