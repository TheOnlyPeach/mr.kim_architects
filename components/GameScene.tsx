
import React, { useState, useEffect, useRef } from 'react';
import { LocationId, Item } from '../types';
import { ITEMS_DB, LOCATIONS, BLUEPRINT_TYPES } from '../constants';
import { Character } from './Character';

interface GameSceneProps {
  location: LocationId;
  inventory: Item[];
  blueprintProgress: number; 
  hasBlueprint: boolean;
  level: number;
  onCollectItem: (item: Item) => void;
  onConsumeItem: (itemId: string) => void;
  onNavigate: (loc: LocationId) => void;
  onBlueprintWork: (amount: number) => void; 
  onCollectBlueprint: () => void;
  onStunned: () => void;
  isHandover?: boolean;
  isPaused?: boolean;
}

// === TYPES FOR MINI GAMES ===

// Level 1: RPG Entities
interface Employee {
    id: number;
    x: number;
    y: number;
    type: 'NORMAL' | 'BIM';
    isAwake: boolean;
    hp: number; 
    drops: string; 
}

// Level 1: Bribe Item (Money Bag)
interface BribeItem {
    id: number;
    x: number;
    y: number;
}

// Level 2: Catcher Game
interface FallingItem {
    id: number;
    x: number;
    y: number;
    type: 'good' | 'bad' | 'bonus' | 'bribe';
    icon: string;
    speed: number;
}

// Level 3: Breakout/Pong
interface Ball {
    x: number;
    y: number;
    dx: number;
    dy: number;
    active: boolean;
}
interface Brick {
    id: number;
    x: number;
    y: number;
    active: boolean;
    color: string;
}

// Level 4: Whack-a-Mole
interface Mole {
    id: number;
    x: number; // grid col 0-2
    y: number; // grid row 0-2
    type: 'crack' | 'leak' | 'resident';
    lifeTime: number;
    maxLife: number;
}

export const GameScene: React.FC<GameSceneProps> = ({ 
  location, 
  inventory, 
  hasBlueprint,
  level,
  onCollectItem, 
  onConsumeItem,
  onNavigate,
  onStunned,
  isHandover,
  isPaused
}) => {
  // --- Refs & State ---
  const [charPos, setCharPos] = useState({ x: 50, y: 70 });
  const [direction, setDirection] = useState<'left' | 'right'>('right');
  const [isMoving, setIsMoving] = useState(false);
  const [gameMessage, setGameMessage] = useState<string>("");
  
  // Level 1 States
  const [employees, setEmployees] = useState<Employee[]>([]);
  const employeesRef = useRef<Employee[]>([]); // Ref to avoid stale closure in animate loop
  
  const [bribes, setBribes] = useState<BribeItem[]>([]);
  const bribesRef = useRef<BribeItem[]>([]); 

  const [kimFrozenUntil, setKimFrozenUntil] = useState<number>(0); 
  const [kimPos, setKimPos] = useState({ x: 10, y: 10 });
  const [kimNag, setKimNag] = useState("감리 시작!");
  const [kimDistracted, setKimDistracted] = useState(false);
  
  const [interactionProgress, setInteractionProgress] = useState(0); 
  const interactionProgressRef = useRef(0); // Ref for loop
  
  const [interactingTargetId, setInteractingTargetId] = useState<number | null>(null);
  const interactingTargetIdRef = useRef<number | null>(null); // Ref for loop

  const kimPosRef = useRef({ x: 10, y: 10 });

  // Level 2 States (Catcher)
  const [fallingItems, setFallingItems] = useState<FallingItem[]>([]);
  const fallingItemsRef = useRef<FallingItem[]>([]);
  const [scoreLvl2, setScoreLvl2] = useState(0);
  const scoreLvl2Ref = useRef(0);

  // Level 3 States (Breakout)
  const [ball, setBall] = useState<Ball>({ x: 50, y: 80, dx: 0, dy: 0, active: false });
  const ballRef = useRef<Ball>({ x: 50, y: 80, dx: 0, dy: 0, active: false });
  const [bricks, setBricks] = useState<Brick[]>([]);
  const bricksRef = useRef<Brick[]>([]);

  // Level 4 States (Whack-a-Mole)
  const [moles, setMoles] = useState<Mole[]>([]);
  const molesRef = useRef<Mole[]>([]);
  const [scoreLvl4, setScoreLvl4] = useState(0);

  // Common Loop Refs
  const posRef = useRef({ x: 50, y: 70 });
  const keysPressed = useRef<Set<string>>(new Set());
  const requestRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);
  const isSpaceDownRef = useRef(false);

  // --- Initialization based on Level ---
  useEffect(() => {
    // Reset States on Level Change
    setGameMessage("");
    setScoreLvl2(0);
    scoreLvl2Ref.current = 0;
    setScoreLvl4(0);
    setFallingItems([]);
    fallingItemsRef.current = [];
    setMoles([]);
    molesRef.current = [];
    setKimDistracted(false);
    
    // Reset Interaction Refs
    setInteractionProgress(0);
    interactionProgressRef.current = 0;
    setInteractingTargetId(null);
    interactingTargetIdRef.current = null;
    
    setBribes([]);
    bribesRef.current = [];
    
    // Level 1 Setup
    if (level === 1) {
        // Spawn 5 Normal Employees (Essential Blueprints)
        const newEmployees: Employee[] = [];
        for (let i = 0; i < 5; i++) {
            newEmployees.push({
                id: i,
                x: Math.random() * 80 + 10,
                y: Math.random() * 50 + 20,
                type: 'NORMAL',
                isAwake: false,
                hp: 1,
                drops: BLUEPRINT_TYPES[i] 
            });
        }
        // Spawn 1 BIM Manager (Optional Bonus)
        newEmployees.push({
            id: 99,
            x: Math.random() * 80 + 10,
            y: Math.random() * 50 + 20,
            type: 'BIM',
            isAwake: false,
            hp: 1,
            drops: 'bribe' 
        });

        setEmployees(newEmployees);
        employeesRef.current = newEmployees; // Sync Ref

        // Spawn Bribes (Money Bags) - Spawn 4 to allow collecting 3
        const newBribes: BribeItem[] = [];
        for (let i = 0; i < 4; i++) { 
            newBribes.push({
                id: i,
                x: Math.random() * 80 + 10,
                y: Math.random() * 50 + 20,
            });
        }
        setBribes(newBribes);
        bribesRef.current = newBribes;

        posRef.current = { x: 50, y: 70 };

        // Cycle Nagging for Mr. Kim
        const nags = ["야! 야! 야!", "돈 아껴!", "도면 가져와!", "그게 최선이야?", "다시 해!", "부실공사야?", "뛰어!", "예산 삭감!"];
        const nagInterval = setInterval(() => {
            setKimNag(prev => {
                if (prev === "돈 세는 중...") return prev;
                return nags[Math.floor(Math.random() * nags.length)];
            });
        }, 2500);
        return () => clearInterval(nagInterval);
    }

    // Level 2 Setup (Catcher)
    if (level === 2) {
        posRef.current = { x: 50, y: 90 }; // Bottom fixed
    }

    // Level 3 Setup (Breakout)
    if (level === 3) {
        posRef.current = { x: 50, y: 90 }; // Paddle fixed at bottom
        const newBricks: Brick[] = [];
        for(let r=0; r<4; r++) {
            for(let c=0; c<8; c++) {
                newBricks.push({
                    id: r*10+c,
                    x: c * 12 + 5,
                    y: r * 8 + 10,
                    active: true,
                    color: ['#f87171', '#fbbf24', '#4ade80', '#60a5fa'][r]
                });
            }
        }
        setBricks(newBricks);
        bricksRef.current = newBricks;
        ballRef.current = { x: 50, y: 85, dx: 0, dy: 0, active: false };
        setBall(ballRef.current);
    }
  }, [level, location]);

  // --- Input Handling ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (isPaused) return;
        keysPressed.current.add(e.key);

        if (e.code === 'Space') {
            isSpaceDownRef.current = true;
            if (level === 3 && !ballRef.current.active) launchBall();
        }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
        keysPressed.current.delete(e.key);
        if (e.code === 'Space') {
            isSpaceDownRef.current = false;
        }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [level, isPaused, employees, inventory]);


  const handleEmployeeDrop = (e: Employee) => {
      if (e.drops && ITEMS_DB[e.drops]) {
          onCollectItem(ITEMS_DB[e.drops]);
      }
      if (e.type === 'BIM') {
          // Freeze Mr. Kim and give bonus
          setKimFrozenUntil(Date.now() + 5000);
          setGameMessage("BIM 매니저의 활약! 사장님 얼음 + 뇌물 획득!");
      }
  };

  // --- Level 3 Logic (Ball Launch) ---
  const launchBall = () => {
      ballRef.current = { 
          ...ballRef.current, 
          active: true, 
          dx: (Math.random() > 0.5 ? 1 : -1) * (0.05 + Math.random() * 0.02),
          dy: -0.06 
      };
      setBall(ballRef.current);
  };

  // --- Level 4 Logic (Click) ---
  const handleMoleClick = (id: number, type: string) => {
      if (type === 'resident') {
          setGameMessage("입주민을 건드렸다! 민원 폭주!");
          onStunned(); // Penalty
      } else {
          setScoreLvl4(prev => {
              const newScore = prev + 1;
              if (newScore >= 20) {
                  onCollectItem(ITEMS_DB['receipt']); 
                  onCollectItem(ITEMS_DB['blueprint']); 
              }
              return newScore;
          });
      }
      const newMoles = molesRef.current.filter(m => m.id !== id);
      molesRef.current = newMoles;
      setMoles(newMoles);
  };


  // === MAIN GAME LOOP ===
  const animate = (time: number) => {
      if (isPaused) {
          lastTimeRef.current = time;
          requestRef.current = requestAnimationFrame(animate);
          return;
      }
      if (lastTimeRef.current === 0) lastTimeRef.current = time;
      const deltaTime = time - lastTimeRef.current;
      lastTimeRef.current = time;

      // -- Player Movement --
      if (level <= 3 && !isHandover) {
          let speed = 0.05 * deltaTime;
          if (level === 2 || level === 3) speed = 0.08 * deltaTime;

          let dx = 0; let dy = 0;
          if (keysPressed.current.has('ArrowLeft')) dx -= speed;
          if (keysPressed.current.has('ArrowRight')) dx += speed;
          
          if (level === 1) {
              if (keysPressed.current.has('ArrowUp')) dy -= speed;
              if (keysPressed.current.has('ArrowDown')) dy += speed;
          }

          if (dx !== 0 || dy !== 0) {
              setIsMoving(true);
              if (dx > 0) setDirection('right');
              if (dx < 0) setDirection('left');
              
              let newX = posRef.current.x + dx;
              let newY = posRef.current.y + dy;
              
              newX = Math.max(5, Math.min(95, newX));
              newY = Math.max(5, Math.min(95, newY));

              if (level === 2 || level === 3) newY = 90;

              posRef.current = { x: newX, y: newY };
              setCharPos({ x: newX, y: newY });
          } else {
              setIsMoving(false);
          }
      }

      // === LEVEL 1 LOGIC (RPG Chase & Interaction) ===
      if (level === 1 && !isHandover) {
          // Check Bribe Count for Boss Distraction
          const bribeCount = inventory.filter(i => i.id === 'bribe').length;
          if (bribeCount >= 3 && !kimDistracted) {
              setKimDistracted(true);
              setKimNag("돈 세는 중...");
              setGameMessage("사장님이 뇌물 3개에 현혹되었습니다! 추격 중단.");
          }

          // 0. Bribe Collection Logic (Movement Based)
          if (bribesRef.current.length > 0) {
              const charX = posRef.current.x;
              const charY = posRef.current.y;
              const remainingBribes: BribeItem[] = [];
              let collected = false;

              bribesRef.current.forEach(b => {
                  if (Math.hypot(charX - b.x, charY - b.y) < 5) {
                      collected = true;
                      onCollectItem(ITEMS_DB['bribe']);
                      setGameMessage("검은 돈 가방 획득! (면책권 +1)");
                  } else {
                      remainingBribes.push(b);
                  }
              });

              if (collected) {
                  bribesRef.current = remainingBribes;
                  setBribes(remainingBribes);
              }
          }

          // 1. Interaction Logic (Holding Space)
          const charX = posRef.current.x;
          const charY = posRef.current.y;
          
          // Check range for current interaction to allow "Cumulative" progress
          if (interactingTargetIdRef.current !== null) {
              const target = employeesRef.current.find(e => e.id === interactingTargetIdRef.current);
              // If target is gone, or too far, reset progress
              if (!target || Math.hypot(charX - target.x, charY - target.y) >= 20 || target.isAwake) {
                  interactionProgressRef.current = 0;
                  setInteractionProgress(0); // Sync State
                  interactingTargetIdRef.current = null;
                  setInteractingTargetId(null); // Sync State
              }
          }

          if (isSpaceDownRef.current) {
              // Find closest sleeping employee using Ref
              const targetEmp = employeesRef.current.find(e => !e.isAwake && Math.hypot(charX - e.x, charY - e.y) < 15);
              
              if (targetEmp) {
                  interactingTargetIdRef.current = targetEmp.id;
                  setInteractingTargetId(targetEmp.id);
                  
                  if (targetEmp.type === 'BIM') {
                      // Needs continuous hold, but now it's cumulative (doesn't reset on keyup)
                      interactionProgressRef.current += (0.1 * deltaTime);
                      if (interactionProgressRef.current >= 100) {
                          // Awake!
                          const updated = employeesRef.current.map(e => e.id === targetEmp.id ? { ...e, isAwake: true } : e);
                          employeesRef.current = updated;
                          setEmployees(updated);
                          
                          handleEmployeeDrop(targetEmp);
                          interactionProgressRef.current = 0;
                      }
                      setInteractionProgress(interactionProgressRef.current);
                  } else {
                      // Normal employee: Instant wake
                      const updated = employeesRef.current.map(e => e.id === targetEmp.id ? { ...e, isAwake: true } : e);
                      employeesRef.current = updated;
                      setEmployees(updated);
                      
                      setGameMessage("필수 도면 확보!");
                      handleEmployeeDrop(targetEmp);
                      
                      interactionProgressRef.current = 0; // Reset immediately
                      setInteractionProgress(0);
                  }
              }
          }

          // 2. Mr. Kim Chase Logic
          const isFrozen = Date.now() < kimFrozenUntil;
          if (!isFrozen && !kimDistracted) { // Check distracted state
              const chaseSpeed = 0.02 * deltaTime;
              const dxKim = posRef.current.x - kimPosRef.current.x;
              const dyKim = posRef.current.y - kimPosRef.current.y;
              const distKim = Math.hypot(dxKim, dyKim);

              if (distKim > 5) {
                  kimPosRef.current.x += (dxKim / distKim) * chaseSpeed;
                  kimPosRef.current.y += (dyKim / distKim) * chaseSpeed;
                  setKimPos({ ...kimPosRef.current });
              } else {
                  // Caught by Mr. Kim!
                  const hasBribe = inventory.some(i => i.id === 'bribe');
                  
                  if (hasBribe) {
                      // Consume Bribe for Immunity
                      onConsumeItem('bribe');
                      setGameMessage("뇌물을 전달했습니다! 사장님이 물러갑니다.");
                      // Reset Kim's position
                      kimPosRef.current = { x: 10, y: 10 };
                      setKimPos({ x: 10, y: 10 });
                      setKimFrozenUntil(Date.now() + 2000); // Brief pause
                  } else {
                      setGameMessage("사장님에게 잡혔습니다! 해고!");
                      onStunned();
                      // Reset positions
                      kimPosRef.current = { x: 10, y: 10 };
                      posRef.current = { x: 50, y: 70 };
                  }
              }
          }
      }

      // === LEVEL 2 LOGIC (Falling Catcher) ===
      if (level === 2 && !isHandover) {
          if (Math.random() < 0.03) { 
              const types = ['good', 'good', 'bad', 'bonus', 'bribe'] as const;
              const type = types[Math.floor(Math.random() * types.length)];
              fallingItemsRef.current.push({
                  id: Date.now() + Math.random(),
                  x: Math.random() * 90 + 5,
                  y: -10,
                  type: type as any,
                  icon: type === 'good' ? '🧱' : (type === 'bonus' ? '🏗️' : (type === 'bribe' ? '💼' : '💩')),
                  speed: (Math.random() * 0.03 + 0.02)
              });
          }

          const nextItems: FallingItem[] = [];
          fallingItemsRef.current.forEach(item => {
              item.y += item.speed * deltaTime;
              if (item.y > 80 && item.y < 95 && Math.abs(item.x - posRef.current.x) < 8) {
                  if (item.type === 'good') {
                      scoreLvl2Ref.current += 10;
                      setScoreLvl2(scoreLvl2Ref.current);
                  } else if (item.type === 'bonus') {
                      scoreLvl2Ref.current += 20;
                      setScoreLvl2(scoreLvl2Ref.current);
                  } else if (item.type === 'bribe') {
                      scoreLvl2Ref.current += 30; // High score for bribe
                      setScoreLvl2(scoreLvl2Ref.current);
                      onCollectItem(ITEMS_DB['bribe']); // Also collect item
                  } else {
                      onStunned();
                      setGameMessage("폐기물을 뒤집어 썼습니다!");
                  }

                  // Check for Win Condition (100 Points)
                  if (scoreLvl2Ref.current >= 100 && scoreLvl2Ref.current - 10 < 100) {
                      onCollectItem(ITEMS_DB['brick']); 
                      onCollectItem(ITEMS_DB['blueprint']); // Triggers handover in App.tsx
                  }

              } else if (item.y < 100) {
                  nextItems.push(item);
              }
          });
          fallingItemsRef.current = nextItems;
          setFallingItems(nextItems);
      }

      // === LEVEL 3 LOGIC (Breakout) ===
      if (level === 3 && !isHandover) {
          if (ballRef.current.active) {
              let { x, y, dx, dy } = ballRef.current;
              x += dx * deltaTime;
              y += dy * deltaTime;

              if (x <= 0 || x >= 100) dx = -dx;
              if (y <= 0) dy = -dy;
              if (y >= 100) {
                  ballRef.current.active = false;
                  setGameMessage("아이디어(공)를 놓쳤습니다!");
                  onStunned();
              }

              if (y >= 88 && y <= 92 && Math.abs(x - posRef.current.x) < 10) {
                  dy = -Math.abs(dy); 
                  dx += (x - posRef.current.x) * 0.002;
              }

              const remainingBricks: Brick[] = [];
              bricksRef.current.forEach(b => {
                  if (!b.active) return;
                  if (Math.abs(x - b.x) < 6 && Math.abs(y - b.y) < 4) {
                      dy = -dy; 
                  } else {
                      remainingBricks.push(b);
                  }
              });
              
              if (remainingBricks.length === 0 && bricksRef.current.length > 0) {
                  onCollectItem(ITEMS_DB['tile']);
                  onCollectItem(ITEMS_DB['blueprint']); 
              }

              bricksRef.current = remainingBricks;
              setBricks(remainingBricks);

              ballRef.current = { x, y, dx, dy, active: ballRef.current.active };
              setBall(ballRef.current);
          }
      }

      // === LEVEL 4 LOGIC (Whack-a-Mole) ===
      if (level === 4 && !isHandover) {
          if (Math.random() < 0.02 && molesRef.current.length < 5) {
              const types = ['crack', 'leak', 'resident'] as const;
              const type = types[Math.floor(Math.random() * (Math.random() > 0.8 ? 3 : 2))]; 
              molesRef.current.push({
                  id: Date.now(),
                  x: Math.floor(Math.random() * 3), 
                  y: Math.floor(Math.random() * 3),
                  type: type as any,
                  lifeTime: 0,
                  maxLife: 2000 
              });
          }

          const nextMoles: Mole[] = [];
          molesRef.current.forEach(m => {
              m.lifeTime += deltaTime;
              if (m.lifeTime < m.maxLife) {
                  nextMoles.push(m);
              } else {
                  if (m.type !== 'resident') {
                      onStunned();
                      setGameMessage("하자를 방치해서 민원이 들어왔습니다!");
                  }
              }
          });
          molesRef.current = nextMoles;
          setMoles(nextMoles);
      }

      requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current!);
  }, [level, isHandover, isPaused]);


  // === RENDERING ===

  const getFloorTexture = () => {
      if (level === 1) return 'repeating-linear-gradient(0deg, #334155 0px, #334155 1px, #1e293b 1px, #1e293b 40px)'; 
      if (level === 2) return 'radial-gradient(circle, #2d2a26 20%, transparent 20%) 0 0 / 10px 10px, #1c1917'; 
      if (level === 3) return 'conic-gradient(#f0f9ff 90deg, #e0f2fe 90deg 180deg, #f0f9ff 180deg 270deg, #e0f2fe 270deg) 0 0 / 40px 40px'; 
      if (level === 4) return 'repeating-linear-gradient(45deg, #450a0a 0, #450a0a 10px, #7f1d1d 10px, #7f1d1d 20px)'; 
      return '#000';
  };

  return (
    <div className="relative w-full h-full overflow-hidden select-none bg-black scene-container font-mono">
      <div 
        className="absolute inset-0 w-full h-full transition-colors duration-700"
        style={{ background: getFloorTexture(), opacity: 0.8 }}
      ></div>

      {/* --- LEVEL 1 RENDER (RPG) --- */}
      {level === 1 && (
          <div className="relative w-full h-full perspective-grid">
              {/* Bribes on Floor */}
              {bribes.map(b => {
                  const dist = Math.hypot(charPos.x - b.x, charPos.y - b.y);
                  const isNear = dist < 15;
                  return (
                      <div 
                          key={b.id} 
                          className={`absolute billboard animate-bounce ${isNear ? 'drop-shadow-[0_0_10px_rgba(250,204,21,0.8)]' : ''}`}
                          style={{ left: `${b.x}%`, top: `${b.y}%`, marginLeft: '-20px', marginTop: '-40px' }}
                      >
                          <div className="text-4xl drop-shadow-md">💼</div>
                          <div className="text-[8px] bg-black text-white px-1 absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap border border-white">
                              GET
                          </div>
                      </div>
                  );
              })}

              {employees.map(e => {
                   const dist = Math.hypot(charPos.x - e.x, charPos.y - e.y);
                   const isNear = dist < 15;
                   const isBIM = e.type === 'BIM';
                   
                   return (
                       <div key={e.id}>
                           <Character 
                                x={e.x} 
                                y={e.y} 
                                variant={isBIM ? 'BIM' : 'EMPLOYEE'} 
                                state={e.isAwake ? 'IDLE' : 'SLEEP'}
                                label={e.isAwake ? (isBIM ? 'BIM Manager' : 'Staff') : undefined}
                                isHighlighted={!e.isAwake && isNear}
                           />
                           
                           {/* Gauge UI for BIM Manager */}
                           {!e.isAwake && isNear && interactingTargetId === e.id && isBIM && (
                               <div className="absolute z-50 billboard" style={{ left: `${e.x}%`, top: `${e.y}%`, marginTop: '-140px', marginLeft: '-32px' }}>
                                   <div className="w-16 h-3 bg-slate-700 border-2 border-white overflow-hidden">
                                       <div className="h-full bg-green-500 transition-all duration-75 ease-linear" style={{ width: `${Math.min(100, interactionProgress)}%` }}></div>
                                   </div>
                               </div>
                           )}

                           {/* Interaction Hint */}
                           {!e.isAwake && isNear && (
                               <div className="absolute z-40 animate-bounce billboard" 
                                    style={{ left: `${e.x}%`, top: `${e.y}%`, marginTop: '-120px', marginLeft: '-40px' }}>
                                   <div className="bg-white border-4 border-black px-2 py-1 text-xs font-bold whitespace-nowrap shadow-lg">
                                       {isBIM ? 'HOLD SPACE' : 'PRESS SPACE'}
                                   </div>
                               </div>
                           )}
                       </div>
                   );
              })}
              
              {/* Mr. Kim Chaser */}
              <Character 
                x={kimPos.x} 
                y={kimPos.y}
                variant="MR_KIM"
                direction={kimPos.x > charPos.x ? 'left' : 'right'} 
                isMoving={true}
                label="사장님"
                speech={kimFrozenUntil > Date.now() ? "..." : kimNag}
                state={kimDistracted ? 'IDLE' : (kimFrozenUntil > Date.now() ? 'STUNNED' : 'WALK')}
                isHighlighted={kimDistracted}
              />
              
              {/* Player */}
              <Character 
                x={charPos.x} 
                y={charPos.y} 
                isMoving={isMoving} 
                direction={direction} 
                variant="PLAYER"
                label="You"
              />
          </div>
      )}

      {/* --- LEVEL 2 RENDER (Catcher) --- */}
      {level === 2 && (
          <div className="relative w-full h-full">
               <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-full border border-yellow-500 z-50">
                   자재 점수: {scoreLvl2} / 100
               </div>
               
               {fallingItems.map(item => (
                   <div key={item.id} className="absolute text-4xl" style={{ left: `${item.x}%`, top: `${item.y}%` }}>
                       {item.icon}
                   </div>
               ))}
               
               <div className="absolute bottom-0 w-full h-2 bg-yellow-600"></div>
               <Character 
                  x={charPos.x} 
                  y={90} 
                  isMoving={isMoving} 
                  direction={direction} 
                  variant="EMPLOYEE" 
                  label="Catcher"
                />
          </div>
      )}

      {/* --- LEVEL 3 RENDER (Breakout) --- */}
      {level === 3 && (
          <div className="relative w-full h-full">
              {!ball.active && (
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white animate-pulse font-bold text-2xl z-50">
                      PRESS SPACE TO START
                  </div>
              )}

              {bricks.map(b => (
                  <div key={b.id} 
                       className="absolute w-[10%] h-[5%] border border-white/20 shadow-md rounded"
                       style={{ left: `${b.x}%`, top: `${b.y}%`, backgroundColor: b.color }}
                  >
                      <span className="opacity-50 text-xs flex justify-center items-center h-full">🪑</span>
                  </div>
              ))}

              <div className="absolute w-[15%] h-4 bg-blue-500 rounded-full shadow-lg border-2 border-white transition-all duration-75"
                   style={{ left: `${charPos.x}%`, top: '90%', transform: 'translateX(-50%)' }}
              >
                  <div className="absolute inset-x-2 top-1 h-1 bg-white/30 rounded-full"></div>
              </div>

              {ball.active && (
                  <div className="absolute w-6 h-6 bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,0.8)]"
                       style={{ left: `${ball.x}%`, top: `${ball.y}%`, transform: 'translate(-50%, -50%)' }}
                  >
                       <span className="absolute inset-0 flex items-center justify-center text-[10px]">💡</span>
                  </div>
              )}
          </div>
      )}

      {/* --- LEVEL 4 RENDER (Whack-a-Mole) --- */}
      {level === 4 && (
          <div className="relative w-full h-full flex flex-col items-center justify-center">
              <div className="absolute top-4 bg-red-600 text-white px-6 py-2 rounded font-bold shadow-lg animate-pulse">
                  긴급 보수 현황: {scoreLvl4} / 20
              </div>

              <div className="grid grid-cols-3 gap-4 w-full max-w-md aspect-square p-4">
                  {[0,1,2,3,4,5,6,7,8].map(idx => {
                      const mole = moles.find(m => (m.y * 3 + m.x) === idx);
                      return (
                          <div key={idx} className="relative bg-stone-700 border-4 border-stone-800 rounded-lg overflow-hidden shadow-inner flex items-center justify-center cursor-pointer active:scale-95 transition-transform"
                               onClick={() => mole && handleMoleClick(mole.id, mole.type)}
                          >
                              <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/concrete-wall.png')]"></div>
                              
                              {mole && (
                                  <div className="text-7xl animate-in zoom-in duration-200 cursor-pointer select-none hover:scale-110 transition-transform">
                                      {mole.type === 'crack' && '⚡'}
                                      {mole.type === 'leak' && '💧'}
                                      {mole.type === 'resident' && '👵'}
                                  </div>
                              )}
                              
                              {mole && mole.type !== 'resident' && (
                                  <div className="absolute bottom-0 left-0 h-1 bg-red-500 transition-all duration-1000 ease-linear" style={{ width: `${100 - (mole.lifeTime / mole.maxLife) * 100}%` }}></div>
                              )}
                          </div>
                      );
                  })}
              </div>
          </div>
      )}

      {isHandover && (
          <div className="absolute inset-0 z-[1000] bg-black/90 flex items-center justify-center animate-in fade-in duration-500">
             <div className="text-center">
                 <div className="text-6xl mb-4 animate-bounce">📦</div>
                 <h2 className="text-2xl text-yellow-400 font-bold mb-2">작업 완료!</h2>
                 <p className="text-white">다음 단계로 넘어갑니다...</p>
             </div>
          </div>
      )}

      {gameMessage && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-red-600 text-white px-6 py-3 border-4 border-white font-bold text-xl animate-bounce whitespace-nowrap shadow-[8px_8px_0_0_#000]">
              {gameMessage}
          </div>
      )}

      {isPaused && (
          <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px] z-40 pointer-events-none"></div>
      )}

      {level === 1 && (
        <div className="absolute bottom-4 left-4 z-50 bg-slate-900/80 p-2 border-2 border-slate-500 flex gap-2">
            <span className="text-xs text-slate-400">BAG:</span>
            {inventory.map((item, i) => <span key={i} className="text-lg">{item.icon}</span>)}
        </div>
      )}
    </div>
  );
};
