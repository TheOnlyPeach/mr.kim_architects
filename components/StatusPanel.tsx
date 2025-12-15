
import React from 'react';

interface StatusPanelProps {
  level: number;
  strikes: number;
}

export const StatusPanel: React.FC<StatusPanelProps> = ({ level, strikes }) => {
  const maxHealth = 5;
  const currentHealth = Math.max(0, maxHealth - strikes);

  const getLevelName = (lvl: number) => {
      if (lvl === 1) return '설계 사무소 (Office)';
      if (lvl === 2) return '건축 시공 현장 (Site)';
      if (lvl === 3) return '인테리어 현장 (Interior)';
      if (lvl >= 4) return '입주민 하자 보수 (Maint.)';
      return `시공 단계 ${lvl}`;
  };

  return (
    <div className="bg-slate-900/90 backdrop-blur-md border-b border-slate-700 sticky top-0 z-20 shadow-2xl">
      <div className="max-w-4xl mx-auto px-4 py-3 flex justify-between items-center">
        
        {/* Level Indicator */}
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 border border-amber-500/50 rounded flex items-center justify-center bg-slate-800 text-amber-500 font-serif font-bold text-xl shadow-[0_0_10px_rgba(245,158,11,0.2)]">
            {level > 5 ? '★' : level}
          </div>
          <div className="flex flex-col">
            <span className="text-slate-500 text-[10px] uppercase tracking-[0.2em] font-bold">현재 공정</span>
            <span className="text-slate-200 font-serif text-lg leading-none">
               {level > 5 ? '최종 점검' : getLevelName(level)}
            </span>
          </div>
        </div>

        {/* Strikes (Health) Indicator */}
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end">
            <span className="text-slate-500 text-[10px] uppercase tracking-[0.2em] font-bold mb-1">건축주 인내심 (라이프)</span>
            <div className="flex gap-1">
              {[...Array(maxHealth)].map((_, i) => (
                <div 
                  key={i} 
                  className={`
                    w-6 h-3 skew-x-[-12deg] transition-all duration-300 border border-slate-900
                    ${i < currentHealth
                      ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]' 
                      : 'bg-slate-800 opacity-30'
                    }
                  `}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
