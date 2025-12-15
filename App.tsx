
import React, { useState, useEffect } from 'react';
import { StatusPanel } from './components/StatusPanel';
import { GameScene } from './components/GameScene';
import { CraftingTable } from './components/CraftingTable';
import { MrKimDialog } from './components/MrKimDialog';
import { BuildingPreview } from './components/BuildingPreview';
import { LevelStartModal } from './components/LevelStartModal';
import { initializeGame, sendMessageToKim } from './services/geminiService';
import { GameState, GameStatus, Item, LocationId } from './types';
import { ITEMS_DB, BLUEPRINT_TYPES } from './constants';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    status: GameStatus.IDLE,
    level: 1,
    strikes: 0,
    messages: [],
    inventory: [],
    currentLocation: 'OFFICE',
    selectedItems: [],
    blueprintProgress: 0,
    hasBlueprint: false
  });

  const [kimMood, setKimMood] = useState<'neutral' | 'angry' | 'happy' | 'waiting' | 'bribed'>('neutral');
  const [lastKimMessage, setLastKimMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [builtItems, setBuiltItems] = useState<Item[]>([]);

  // Initialize Game
  const startGame = async () => {
    setIsLoading(true);
    setLastKimMessage(""); 
    try {
      const initialText = await initializeGame();
      setLastKimMessage(initialText);
      setGameState(prev => ({ 
        ...prev, 
        status: GameStatus.BRIEFING, // Starts with Briefing
        level: 1,
        strikes: 0,
        inventory: [],
        selectedItems: [],
        currentLocation: 'OFFICE',
        blueprintProgress: 0,
        hasBlueprint: false
      }));
      setKimMood('neutral');
    } catch (err) {
      console.error(err);
      setLastKimMessage("오류: API Key가 설정되지 않았거나 미스터 킴이 응답하지 않습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleNextPhase = () => {
    // Flow: BRIEFING -> LEVEL_START -> EXPLORING
    if (gameState.status === GameStatus.BRIEFING) {
        setGameState(prev => ({ ...prev, status: GameStatus.LEVEL_START }));
    } else if (gameState.status === GameStatus.VICTORY || gameState.status === GameStatus.GAME_OVER) {
        startGame();
    }
  };

  const handleLevelStart = () => {
      setGameState(prev => ({ 
          ...prev, 
          status: GameStatus.EXPLORING,
          currentLocation: prev.level === 1 ? 'OFFICE' : (prev.level === 2 ? 'SITE' : (prev.level === 3 ? 'INTERIOR' : 'MAINTENANCE'))
      }));
  };

  const handleNavigate = (loc: LocationId) => {
    setGameState(prev => ({ ...prev, currentLocation: loc }));
  };

  const handleCollectItem = (item: Item) => {
    setGameState(prev => {
        let newState = { ...prev };
        let triggerHandover = false;
        
        // Add to inventory
        // Allow duplicates for structure items AND bribes (since we need 3 for the bonus)
        const alreadyHas = prev.inventory.some(i => i.id === item.id);
        if (!alreadyHas || item.category === 'structure' || item.id === 'bribe') { 
             newState.inventory = [...prev.inventory, item];
        }

        // Check Blueprint Collection (Level 1)
        if (prev.level === 1 && BLUEPRINT_TYPES.includes(item.id)) {
             // Check if we have all 5 now
             const currentBlueprints = newState.inventory.filter(i => BLUEPRINT_TYPES.includes(i.id));
             if (currentBlueprints.length >= 5) {
                 newState.hasBlueprint = true;
                 triggerHandover = true;
                 // Add the "Mega Blueprint" item for crafting logic compatibility
                 newState.inventory.push(ITEMS_DB['blueprint']); 
             }
        } else if (item.id === 'blueprint') {
             // Logic for Level 2, 3, 4 where 'blueprint' is dropped as a reward
             newState.hasBlueprint = true;
             if (prev.level > 1) {
                 triggerHandover = true;
             }
        }

        if (triggerHandover) {
            newState.status = GameStatus.HANDOVER;
            setTimeout(() => {
                handleHandoverComplete();
            }, 4000);
        }
        
        return newState;
    });
  };

  const handleHandoverComplete = () => {
      setLastKimMessage("좋아! 5가지 도면이 모두 현장 소장에게 넘어갔군. 이제 시공 현장(SITE)으로 가서 건물을 올려!");
      setKimMood('happy');
      setGameState(prev => ({
          ...prev,
          level: 2, // NOTE: This is just a default, logic below should handle dynamic next level
          status: GameStatus.BRIEFING, // Briefing -> Level Start -> Exploring
          currentLocation: 'SITE'
      }));
      
      // Correct Next Level Logic handled by current level context
      setGameState(prev => {
          const nextLevel = prev.level; // Actually we shouldn't increment here, Handover leads to Briefing for NEXT level? 
          // Wait, the Handover screen says "Next Step". 
          // The `handleSubmitBuild` increments the level.
          // BUT, currently levels are 1->Craft->2->Craft->3...
          // If we are just finishing the mini-game, we go to CRAFTING.
          
          return {
              ...prev,
              status: GameStatus.CRAFTING, // Handover done -> Go to Crafting
          };
      });
  };

  const handleConsumeItem = (itemId: string) => {
      setGameState(prev => {
          // Remove only one instance of the item
          const index = prev.inventory.findIndex(i => i.id === itemId);
          if (index > -1) {
              const newInventory = [...prev.inventory];
              newInventory.splice(index, 1);
              return { ...prev, inventory: newInventory };
          }
          return prev;
      });
  };

  const handleBlueprintWork = (amount: number) => {};

  const handleStunned = () => {
      setGameState(prev => {
          const newStrikes = prev.strikes + 1;
          if (newStrikes >= 5) {
              setLastKimMessage("건축주 인내심이 바닥났습니다! 계약 파기!");
              setKimMood('angry');
              return { ...prev, strikes: 5, status: GameStatus.GAME_OVER };
          }
          return { ...prev, strikes: newStrikes };
      });
  };

  const handleToggleCraftItem = (item: Item) => {
    setGameState(prev => {
        const exists = prev.selectedItems.find(i => i.id === item.id);
        if (exists) {
            return { ...prev, selectedItems: prev.selectedItems.filter(i => i.id !== item.id) };
        } else {
            return { ...prev, selectedItems: [...prev.selectedItems, item] };
        }
    });
  };

  const handleSubmitBuild = async () => {
    const hasBlueprintSelected = gameState.selectedItems.some(i => i.id === 'blueprint');
    
    if (!hasBlueprintSelected) {
        setLastKimMessage("설계 도면도 없이 집을 짓겠다고? 제정신인가?!");
        setKimMood('angry');
        setGameState(prev => ({ ...prev, status: GameStatus.BRIEFING })); 
        return;
    }

    setIsLoading(true);
    const itemsToBuild = [...gameState.selectedItems];
    setBuiltItems(itemsToBuild);

    setGameState(prev => ({ ...prev, status: GameStatus.EVALUATING }));
    setKimMood('waiting');
    setLastKimMessage("흐음... 어디 맛(디자인) 좀 볼까?");

    const hasBribe = itemsToBuild.some(i => i.id === 'bribe');
    const materialsList = itemsToBuild.map(i => i.name).join(', ');
    const prompt = `[재료 목록]: ${materialsList}`;

    try {
        await new Promise(r => setTimeout(r, 4000));
        
        let responseText = "";
        if (hasBribe) {
             responseText = "아니 이건... [검은 돈 가방]?! 허허... 자네가 세상을 좀 아는구만. 이번만 특별히... [합격]일세.";
        } else {
             responseText = await sendMessageToKim(prompt);
        }
        
        setLastKimMessage(responseText);

        let nextLevel = gameState.level;
        let nextStrikes = gameState.strikes;
        let nextStatus = GameStatus.BRIEFING; 
        
        // Determine location based on next level
        let nextLocation = gameState.currentLocation;

        if (responseText.includes('[합격]')) {
            nextLevel += 1;
            setKimMood(hasBribe ? 'bribed' : 'happy');
            if (nextLevel > 5) {
                nextStatus = GameStatus.VICTORY;
            } else {
                // Set appropriate location for next level
                if (nextLevel === 2) nextLocation = 'SITE';
                else if (nextLevel === 3) nextLocation = 'INTERIOR';
                else if (nextLevel >= 4) nextLocation = 'MAINTENANCE';
            }
        } else if (responseText.includes('[불합격]')) {
            nextStrikes += 1;
            setKimMood('angry');
            if (nextStrikes >= 5) {
                nextStatus = GameStatus.GAME_OVER;
            }
        } else {
            setKimMood('neutral');
        }

        setGameState(prev => ({
            ...prev,
            status: nextStatus === GameStatus.BRIEFING ? nextStatus : nextStatus,
            level: nextLevel,
            strikes: nextStrikes,
            currentLocation: nextLocation,
            selectedItems: [], 
            hasBlueprint: false, 
            blueprintProgress: 0,
            inventory: prev.inventory.filter(i => !itemsToBuild.includes(i)), 
        }));

    } catch (err) {
        console.error(err);
        setLastKimMessage("평가 중 정전이 발생했습니다.");
    } finally {
        setIsLoading(false);
    }
  };

  // --- Render Logic ---

  if (gameState.status === GameStatus.IDLE) {
    return (
        <div className="h-screen w-full bg-slate-900 flex items-center justify-center p-4 overflow-y-auto">
            <div className="max-w-3xl w-full text-center py-10">
                <div className="w-32 h-32 md:w-40 md:h-40 bg-amber-400 border-4 border-black rounded-full mx-auto mb-6 flex items-center justify-center shadow-[8px_8px_0_0_#000] animate-bounce">
                    <span className="text-5xl md:text-6xl">👷</span>
                </div>
                <h1 className="text-4xl md:text-6xl font-black text-white mb-2 tracking-tighter uppercase leading-tight">
                    공포의 Mr.Kim<br/><span className="text-amber-400">건축 사무소</span>
                </h1>
                
                {/* Game Mode Manual */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left my-8 bg-black/40 p-6 rounded-xl border border-slate-700 backdrop-blur-sm">
                    <div className="p-4 border border-slate-600 rounded bg-slate-800/80 hover:bg-slate-700 transition-all hover:-translate-y-1">
                        <h3 className="text-amber-400 font-bold mb-1 flex items-center gap-2">
                            <span className="bg-amber-500 text-black text-xs px-1 rounded">LV.1</span> 
                            설계 사무소 (RPG)
                        </h3>
                        <p className="text-slate-300 text-xs leading-relaxed">
                            잠든 직원을 깨워 5개의 도면을 훔치... 아니, 확보하세요! 미스터 킴을 피해 숨어다녀야 합니다.
                            <br/><span className="text-slate-500 text-[10px] mt-1 block">조작: 방향키, 스페이스바</span>
                        </p>
                    </div>
                    <div className="p-4 border border-slate-600 rounded bg-slate-800/80 hover:bg-slate-700 transition-all hover:-translate-y-1">
                        <h3 className="text-amber-400 font-bold mb-1 flex items-center gap-2">
                            <span className="bg-amber-500 text-black text-xs px-1 rounded">LV.2</span>
                            시공 현장 (Catcher)
                        </h3>
                        <p className="text-slate-300 text-xs leading-relaxed">
                            하늘에서 쏟아지는 건축 자재(벽돌, 철골)를 받아내세요. 똥이나 폭탄을 받으면 큰일납니다!
                            <br/><span className="text-slate-500 text-[10px] mt-1 block">조작: 좌우 방향키</span>
                        </p>
                    </div>
                    <div className="p-4 border border-slate-600 rounded bg-slate-800/80 hover:bg-slate-700 transition-all hover:-translate-y-1">
                        <h3 className="text-amber-400 font-bold mb-1 flex items-center gap-2">
                            <span className="bg-amber-500 text-black text-xs px-1 rounded">LV.3</span>
                            인테리어 (Breakout)
                        </h3>
                        <p className="text-slate-300 text-xs leading-relaxed">
                            공(아이디어)을 튕겨서 방 안의 빈 공간을 가구로 채우는 벽돌깨기 게임입니다. 공을 놓치지 마세요.
                            <br/><span className="text-slate-500 text-[10px] mt-1 block">조작: 좌우 방향키, 스페이스바(발사)</span>
                        </p>
                    </div>
                    <div className="p-4 border border-slate-600 rounded bg-slate-800/80 hover:bg-slate-700 transition-all hover:-translate-y-1">
                        <h3 className="text-amber-400 font-bold mb-1 flex items-center gap-2">
                            <span className="bg-amber-500 text-black text-xs px-1 rounded">LV.4</span>
                            하자 보수 (Mole)
                        </h3>
                        <p className="text-slate-300 text-xs leading-relaxed">
                            두더지 잡기! 건물 여기저기서 터지는 금(Crack)과 누수(Leak)를 클릭해서 긴급 수리하세요.
                            <br/><span className="text-slate-500 text-[10px] mt-1 block">조작: 마우스 클릭</span>
                        </p>
                    </div>
                </div>

                {lastKimMessage && (
                    <div className="mb-6 p-4 bg-red-900/80 border border-red-500 rounded-lg animate-in slide-in-from-top-2 fade-in">
                        <p className="text-red-200 font-bold mb-1">⚠️ 연결 실패</p>
                        <p className="text-white text-sm">{lastKimMessage}</p>
                    </div>
                )}
                <button 
                    onClick={startGame}
                    disabled={isLoading}
                    className="w-full md:w-auto bg-white border-4 border-black px-12 py-4 font-black text-2xl hover:bg-amber-400 hover:scale-105 shadow-[6px_6px_0_0_#000] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? '연결 중...' : '계약서 서명 및 게임 시작'}
                </button>
            </div>
        </div>
    );
  }

  return (
    <div className="h-screen w-full bg-black relative overflow-hidden font-sans select-none">
      <StatusPanel level={gameState.level} strikes={gameState.strikes} />
      
      <div className="absolute inset-0 pt-14 pb-0">
         {/* Render GameScene for Exploring, Briefing (bg), LevelStart (bg), Handover */}
         {(gameState.status === GameStatus.EXPLORING || gameState.status === GameStatus.BRIEFING || gameState.status === GameStatus.LEVEL_START || gameState.status === GameStatus.HANDOVER) && (
            <GameScene 
                location={gameState.currentLocation} 
                inventory={gameState.inventory}
                blueprintProgress={gameState.blueprintProgress}
                hasBlueprint={gameState.hasBlueprint}
                level={gameState.level}
                onCollectItem={handleCollectItem}
                onConsumeItem={handleConsumeItem}
                onNavigate={handleNavigate}
                onBlueprintWork={handleBlueprintWork}
                onCollectBlueprint={() => {}}
                onStunned={handleStunned}
                isHandover={gameState.status === GameStatus.HANDOVER}
                isPaused={gameState.status === GameStatus.LEVEL_START || gameState.status === GameStatus.BRIEFING}
            />
         )}

         {(gameState.status === GameStatus.EVALUATING || gameState.status === GameStatus.VICTORY || gameState.status === GameStatus.GAME_OVER) && (
            <BuildingPreview items={builtItems} />
         )}

         {gameState.currentLocation === 'OFFICE' && gameState.status === GameStatus.EXPLORING && gameState.level > 1 && (
            <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-30 animate-bounce">
                <button 
                    onClick={() => setGameState(prev => ({ ...prev, status: GameStatus.CRAFTING }))}
                    className="bg-amber-500 text-black font-bold px-6 py-2 border-2 border-black shadow-[4px_4px_0_0_#000] hover:scale-110 transition-transform"
                >
                    제작 테이블 열기
                </button>
            </div>
         )}
      </div>

      {gameState.status === GameStatus.CRAFTING && (
        <CraftingTable 
            inventory={gameState.inventory}
            selectedItems={gameState.selectedItems}
            onToggleItem={handleToggleCraftItem}
            onSubmit={handleSubmitBuild}
            isSubmitting={isLoading}
        />
      )}
      
      {gameState.status === GameStatus.CRAFTING && !isLoading && (
        <button 
            onClick={() => setGameState(prev => ({ ...prev, status: GameStatus.EXPLORING }))}
            className="absolute top-20 left-4 z-50 text-white underline"
        >
            &larr; 사무실로 돌아가기
        </button>
      )}

      {/* Manual Modal */}
      {gameState.status === GameStatus.LEVEL_START && (
          <LevelStartModal level={gameState.level} onStart={handleLevelStart} />
      )}

      {/* Mr. Kim Dialog Overlay */}
      {(gameState.status === GameStatus.BRIEFING || gameState.status === GameStatus.EVALUATING || gameState.status === GameStatus.VICTORY || gameState.status === GameStatus.GAME_OVER) && (
        <MrKimDialog 
            text={lastKimMessage}
            mood={kimMood}
            onNext={gameState.status !== GameStatus.EVALUATING ? handleNextPhase : undefined} 
            actionLabel={
                gameState.status === GameStatus.VICTORY ? '새 게임' : 
                gameState.status === GameStatus.GAME_OVER ? '다시 도전' : 
                gameState.status === GameStatus.BRIEFING ? '매뉴얼 확인' : undefined
            }
        />
      )}
    </div>
  );
};

export default App;
