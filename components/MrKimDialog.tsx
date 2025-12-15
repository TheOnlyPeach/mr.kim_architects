import React from 'react';

interface MrKimDialogProps {
  text: string;
  mood: 'neutral' | 'angry' | 'happy' | 'waiting' | 'bribed';
  onNext?: () => void;
  actionLabel?: string;
}

export const MrKimDialog: React.FC<MrKimDialogProps> = ({ text, mood, onNext, actionLabel }) => {
  return (
    <div className="absolute inset-x-0 bottom-0 z-50 p-4 animate-in slide-in-from-bottom-10 fade-in duration-500">
      <div className="max-w-3xl mx-auto flex items-end">
        
        {/* Mr. Kim Portrait */}
        <div className={`
            relative z-10 mr-[-20px] transition-transform duration-300
            ${mood === 'angry' ? 'translate-x-1 translate-y-1' : ''}
            ${mood === 'happy' ? '-translate-y-2' : ''}
            ${mood === 'bribed' ? 'animate-pulse' : ''} 
        `}>
            {/* Simple CSS Art for Mr. Kim */}
            <div className={`
                w-32 h-32 md:w-40 md:h-40 rounded-full bg-amber-200 border-4 border-black relative shadow-2xl overflow-hidden
                ${mood === 'bribed' ? 'animate-[bounce_0.5s_infinite]' : ''}
            `}>
                {/* Hair */}
                <div className="absolute top-0 w-full h-12 bg-black"></div>
                {/* Eyebrows */}
                <div className={`absolute top-12 left-8 w-8 h-2 bg-black transition-transform ${mood === 'angry' ? 'rotate-12' : ''} ${mood === 'happy' || mood === 'bribed' ? '-rotate-12 top-10' : ''}`}></div>
                <div className={`absolute top-12 right-8 w-8 h-2 bg-black transition-transform ${mood === 'angry' ? '-rotate-12' : ''} ${mood === 'happy' || mood === 'bribed' ? 'rotate-12 top-10' : ''}`}></div>
                
                {/* Eyes */}
                {/* Left Eye: Wink if bribed */}
                {mood === 'bribed' ? (
                     <div className="absolute top-[68px] left-10 w-4 h-1 bg-black"></div>
                ) : (
                     <div className="absolute top-16 left-10 w-4 h-4 bg-black rounded-full"></div>
                )}
                
                {/* Right Eye */}
                <div className="absolute top-16 right-10 w-4 h-4 bg-black rounded-full"></div>
                
                {/* Glasses */}
                <div className="absolute top-14 left-6 w-12 h-8 border-4 border-black rounded-lg"></div>
                <div className="absolute top-14 right-6 w-12 h-8 border-4 border-black rounded-lg"></div>
                <div className="absolute top-17 left-1/2 -translate-x-1/2 w-4 h-1 bg-black"></div>
                
                {/* Mouth */}
                <div className={`
                    absolute bottom-8 left-1/2 -translate-x-1/2 w-12 h-2 bg-black transition-all
                    ${mood === 'happy' || mood === 'bribed' ? 'h-6 rounded-b-full' : ''}
                    ${mood === 'angry' ? 'w-10 h-1 rotate-3' : ''}
                    ${mood === 'waiting' ? 'w-8 h-2 rounded-full' : ''}
                `}></div>
            </div>
            {/* Name Plate */}
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-black text-amber-500 font-bold px-3 py-1 text-sm border-2 border-amber-500 rounded">
                MR. KIM
            </div>
        </div>

        {/* Dialogue Box */}
        <div className="flex-1 bg-white border-4 border-black rounded-lg p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.5)] relative mb-4">
            <div className="font-serif text-xl md:text-2xl leading-relaxed text-slate-900 min-h-[80px]">
                {text}
            </div>
            
            {onNext && (
                <button 
                    onClick={onNext}
                    className="absolute bottom-4 right-4 bg-amber-500 hover:bg-amber-400 text-black font-bold py-2 px-6 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1 transition-all"
                >
                    {actionLabel || 'NEXT ▶'}
                </button>
            )}
        </div>
      </div>
    </div>
  );
};