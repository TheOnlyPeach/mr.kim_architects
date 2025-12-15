
import React from 'react';

interface LevelStartModalProps {
  level: number;
  onStart: () => void;
}

export const LevelStartModal: React.FC<LevelStartModalProps> = ({ level, onStart }) => {
  const getLevelInfo = (lvl: number) => {
    if (lvl === 1) {
      return {
        contractName: "제 1호: 업무 태만 감사 대응 지침",
        content: "사장 '미스터 킴'이 예고 없이 사무실 감사를 나왔다! 직원들이 모두 자고 있다. 사장님에게 들키기 전에 직원들을 깨워 도면을 확보하라.",
        conditions: [
          "일반 직원(5명): 필수 도면을 가지고 있음. 한번 클릭으로 기상.",
          "BIM 매니저(1명): 선택 사항. 깨우기 힘들지만 성공 시 사장님을 얼리고 뇌물을 줌.",
          "검은 돈 가방(뇌물): 3개를 모으면 사장님에게 바치고 자유를 얻을 수 있음.",
          "검은 돈 가방(뇌물) 1개 소지 시: 사장님에게 잡혀도 한 번은 무사함(자동 소비)."
        ]
      };
    } else if (lvl === 2) {
      return {
        contractName: "제 2호: 자재 납품 및 시공 계약서",
        content: "'을'은 시공 현장에서 낙하하는 건축 자재를 안전하게 수령하여 시공률 100%를 달성해야 한다.",
        conditions: [
          "좌우 방향키(←→)로 신속히 이동할 것.",
          "벽돌(🧱)과 철골(🏗️)을 받아내어 점수를 확보할 것.",
          "검은 돈 가방(💼)은 높은 점수(뇌물)를 제공함.",
          "폐기물(💩) 및 폭발물 수령 시 계약 파기 위기."
        ]
      };
    } else if (lvl === 3) {
      return {
        contractName: "제 3호: 실내 인테리어 공사 계약서",
        content: "'을'은 디자인 아이디어(공)를 활용하여 삭막한 내부 공간의 빈 구역(블록)을 가구로 채워 넣어야 한다.",
        conditions: [
            "스페이스바(SPACE)로 아이디어를 발사할 것.",
            "좌우 방향키(←→)로 바를 이동하여 공을 받아낼 것.",
            "공을 떨어뜨릴 시 미스터 킴의 분노를 감당할 것."
        ]
      };
    } else {
       return {
         contractName: "제 4호: 하자 보수 이행 각서",
         content: "준공 후 발생하는 모든 크랙과 누수에 대하여 '을'은 즉각적인 보수 의무를 진다.",
         conditions: [
             "마우스 클릭으로 하자를 신속히 제거할 것.",
             "제한 시간 내 20건의 하자를 처리할 것.",
             "입주민(👵)에게 피해를 주지 말 것."
         ]
       };
    }
  };

  const info = getLevelInfo(level);
  const today = new Date().toLocaleDateString();

  return (
    <div className="absolute inset-0 z-[60] bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-300">
      {/* Contract Paper Container */}
      <div className="bg-white w-full max-w-2xl shadow-2xl overflow-hidden relative border border-slate-300 transform rotate-1">
        
        {/* Document Header Line */}
        <div className="h-4 bg-slate-800 w-full"></div>
        
        <div className="p-6 md:p-12 text-slate-900 flex flex-col h-full min-h-[500px]">
            
            {/* Title */}
            <div className="text-center mb-8 border-b-4 border-double border-black pb-4">
                <h1 className="text-4xl md:text-5xl font-serif font-black tracking-tighter mb-2">
                    업무 계약서
                </h1>
                <p className="text-sm font-serif text-slate-500 uppercase tracking-widest">{info.contractName}</p>
            </div>

            {/* Body */}
            <div className="flex-1 space-y-6 font-serif">
                {/* Clause 1 */}
                <div>
                    <h3 className="font-bold text-lg mb-1">[제 1조: 목적]</h3>
                    <p className="text-sm md:text-base leading-relaxed text-justify bg-slate-100 p-3 border-l-4 border-slate-400">
                        {info.content}
                    </p>
                </div>

                {/* Clause 2 */}
                <div>
                    <h3 className="font-bold text-lg mb-1">[제 2조: 수행 수칙]</h3>
                    <ul className="list-disc list-inside space-y-1 text-sm md:text-base pl-2 text-slate-700 bg-amber-50 p-3 border border-amber-100">
                        {info.conditions.map((cond, idx) => (
                            <li key={idx} className="pl-2">{cond}</li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Footer / Signature */}
            <div className="mt-8 pt-6 border-t border-slate-300">
                <div className="flex flex-col md:flex-row justify-between items-end gap-6">
                    <div className="text-sm text-slate-500 font-serif">
                        <p>계약 일자: {today}</p>
                        <p>갑: Mr. Kim 사장실</p>
                        <p>을: (주)고생 건축사무소</p>
                    </div>
                    
                    <div className="flex flex-col items-center gap-2 w-full md:w-auto">
                         <div className="text-sm font-bold text-slate-800 animate-pulse">▼ 아래 버튼을 눌러 서명하세요 ▼</div>
                         <button 
                            onClick={onStart}
                            className="group relative"
                         >
                             {/* Stamp Visual */}
                             <div className="w-32 h-32 rounded-full border-4 border-red-600 flex items-center justify-center bg-white shadow-xl group-hover:bg-red-50 group-hover:scale-105 transition-all duration-200">
                                 <div className="w-28 h-28 rounded-full border border-red-600 border-dashed flex items-center justify-center flex-col transform -rotate-12">
                                     <span className="text-red-600 font-serif font-black text-2xl leading-none block mb-1">계약서</span>
                                     <span className="text-red-600 font-serif font-black text-3xl leading-none block">서명</span>
                                     <span className="text-[10px] text-red-500 mt-1">서명 즉시 효력 발생</span>
                                 </div>
                             </div>
                             
                             {/* Click Prompt */}
                             <div className="absolute -right-12 top-0 bg-yellow-400 text-black text-xs font-bold px-2 py-1 rounded shadow-md animate-bounce">
                                 CLICK!
                             </div>
                         </button>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};
