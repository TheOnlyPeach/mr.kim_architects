import React from 'react';
import { Item } from '../types';

interface CraftingTableProps {
  inventory: Item[];
  selectedItems: Item[];
  onToggleItem: (item: Item) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export const CraftingTable: React.FC<CraftingTableProps> = ({ 
  inventory, 
  selectedItems, 
  onToggleItem, 
  onSubmit, 
  isSubmitting 
}) => {
  const isSelected = (item: Item) => selectedItems.some(i => i.id === item.id);

  return (
    <div className="absolute inset-0 z-40 bg-slate-900/95 flex flex-col items-center justify-center p-6 animate-in fade-in zoom-in duration-300">
      <h2 className="text-3xl font-serif text-white mb-2">건축가의 책상</h2>
      <p className="text-slate-400 mb-8">미스터 킴에게 제출할 재료를 선택하세요.</p>

      {/* Blueprint Area (Selected) */}
      <div className="w-full max-w-2xl min-h-[160px] bg-blue-600 border-4 border-white rounded-lg p-6 mb-8 relative shadow-[0_0_20px_rgba(37,99,235,0.5)] blueprint-bg">
         <div className="absolute top-2 left-4 text-blue-200 text-sm font-mono tracking-widest">설계 구성 확인</div>
         
         <div className="flex justify-center items-center gap-6 h-full flex-wrap">
            {selectedItems.length === 0 && (
                <div className="text-blue-300/50 text-center italic">
                    재료를 여기에 올리세요...
                </div>
            )}
            {selectedItems.map(item => (
                <div key={item.id} className="bg-white/10 p-4 rounded border border-white/30 backdrop-blur flex flex-col items-center animate-in slide-in-from-bottom-2">
                    <span className="text-4xl mb-2">{item.icon}</span>
                    <span className="text-white text-xs font-bold">{item.name}</span>
                    <button 
                        onClick={() => onToggleItem(item)}
                        className="mt-2 text-[10px] text-red-300 hover:text-red-100 hover:underline"
                    >
                        제거
                    </button>
                </div>
            ))}
         </div>
      </div>

      {/* Inventory Grid */}
      <div className="w-full max-w-3xl">
        <h3 className="text-slate-400 text-sm uppercase tracking-wider mb-2">보유 자재 목록</h3>
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-3 p-4 bg-slate-800 rounded-lg border border-slate-700 h-48 overflow-y-auto">
            {inventory.length === 0 && (
                <div className="col-span-full text-center text-slate-600 py-10">
                    가방이 비었습니다. 현장을 탐색하세요!
                </div>
            )}
            {inventory.map(item => (
                <button
                    key={item.id}
                    onClick={() => onToggleItem(item)}
                    disabled={isSelected(item)}
                    className={`
                        p-2 rounded flex flex-col items-center justify-center transition-all border
                        ${isSelected(item) 
                            ? 'bg-slate-700 opacity-30 border-transparent cursor-not-allowed grayscale' 
                            : 'bg-slate-600 border-slate-500 hover:bg-amber-600 hover:border-amber-400 hover:scale-105 shadow-md'
                        }
                    `}
                >
                    <span className="text-2xl mb-1">{item.icon}</span>
                    <span className="text-[10px] text-slate-200 text-center leading-tight">{item.name}</span>
                </button>
            ))}
        </div>
      </div>

      {/* Actions */}
      <div className="mt-8 flex gap-4">
        <button 
            onClick={onSubmit}
            disabled={selectedItems.length === 0 || isSubmitting}
            className={`
                px-8 py-3 rounded-full font-bold text-lg shadow-lg transition-all transform
                ${selectedItems.length > 0 && !isSubmitting
                    ? 'bg-green-500 text-white hover:bg-green-400 hover:scale-110'
                    : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                }
            `}
        >
            {isSubmitting ? '건축 중...' : '건축 및 보고'}
        </button>
      </div>
    </div>
  );
};