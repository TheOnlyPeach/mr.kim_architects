import React from 'react';
import { Item } from '../types';

interface BuildingPreviewProps {
  items: Item[];
}

export const BuildingPreview: React.FC<BuildingPreviewProps> = ({ items }) => {
  // Logic to determine building appearance based on items
  const structureItem = items.find(i => i.category === 'structure') || { id: 'default', name: 'Default' };
  const decorationItems = items.filter(i => i.category === 'decoration' || i.category === 'special');
  const natureItems = items.filter(i => i.category === 'nature');

  // Determine wall style
  const getWallStyle = () => {
    switch (structureItem.id) {
        case 'brick': return { background: 'repeating-linear-gradient(45deg, #7f1d1d, #7f1d1d 10px, #991b1b 10px, #991b1b 20px)' };
        case 'concrete': return { background: '#94a3b8', border: '4px solid #475569' };
        case 'glass': return { background: 'rgba(147, 197, 253, 0.3)', border: '1px solid white' };
        default: return { background: '#cbd5e1' };
    }
  };

  // Determine environment
  const hasIce = items.some(i => i.id === 'ice');
  const hasFire = items.some(i => i.id === 'fire');
  const hasNeon = items.some(i => i.id === 'neon');

  return (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-b from-sky-900 to-black overflow-hidden relative">
        
        {/* Environment Effects */}
        {hasIce && <div className="absolute inset-0 bg-blue-500/10 pointer-events-none backdrop-blur-[2px]"></div>}
        {hasFire && <div className="absolute inset-0 bg-orange-500/10 pointer-events-none animate-pulse"></div>}

        {/* 3D Scene */}
        <div className="building-scene">
            <div className="cube">
                {/* Walls */}
                <div className="cube-face face-front" style={getWallStyle()}>
                    {/* Door */}
                    <div className="absolute bottom-0 w-16 h-24 bg-black/40 border-t-2 border-x-2 border-black/50"></div>
                </div>
                <div className="cube-face face-back" style={getWallStyle()}></div>
                <div className="cube-face face-right" style={getWallStyle()}>
                    {/* Window */}
                    <div className="w-20 h-20 bg-blue-300/50 border-4 border-white grid grid-cols-2 grid-rows-2 gap-1">
                        <div className="bg-transparent border border-black/10"></div>
                        <div className="bg-transparent border border-black/10"></div>
                        <div className="bg-transparent border border-black/10"></div>
                        <div className="bg-transparent border border-black/10"></div>
                    </div>
                </div>
                <div className="cube-face face-left" style={getWallStyle()}></div>
                
                {/* Roof */}
                <div className="cube-face face-top bg-slate-800 flex items-center justify-center">
                    {/* Nature items on roof? */}
                    {natureItems.map((item, i) => (
                        <span key={i} className="text-4xl absolute transform -translate-y-10" style={{ left: `${20 + i * 20}px` }}>
                            {item.icon}
                        </span>
                    ))}
                </div>
                
                {/* Floor/Base */}
                <div className="cube-face face-bottom shadow-[0_0_100px_rgba(255,255,255,0.2)]"></div>

                {/* Decorations (Floating around) */}
                {decorationItems.map((item, i) => (
                    <div 
                        key={i} 
                        className="absolute text-5xl animate-bounce"
                        style={{ 
                            transform: `rotateY(${i * 90}deg) translateZ(150px) translateY(-50px)`,
                            animationDelay: `${i * 0.5}s`
                        }}
                    >
                        {item.icon}
                        {item.id === 'neon' && <div className="absolute inset-0 blur-md bg-pink-500/50 -z-10"></div>}
                    </div>
                ))}
            </div>
        </div>

        {/* Dynamic Title */}
        <div className="absolute bottom-32 w-full text-center">
            <h3 className="text-white font-serif text-2xl drop-shadow-[0_2px_2px_rgba(0,0,0,1)]">
                {structureItem.name} 레지던스
            </h3>
            <div className="flex justify-center gap-2 mt-2">
                 {items.map(i => <span key={i.id} className="text-sm bg-black/50 px-2 rounded text-slate-300">{i.name}</span>)}
            </div>
        </div>
    </div>
  );
};