
export type Role = 'user' | 'model' | 'system';

export interface Message {
  id: string;
  role: Role;
  text: string;
  timestamp: number;
}

export enum GameStatus {
  IDLE = 'IDLE',
  BRIEFING = 'BRIEFING',
  LEVEL_START = 'LEVEL_START', // New: Manual/Guide screen before level
  EXPLORING = 'EXPLORING', 
  CRAFTING = 'CRAFTING',   
  EVALUATING = 'EVALUATING',
  HANDOVER = 'HANDOVER', 
  GAME_OVER = 'GAME_OVER',
  VICTORY = 'VICTORY',
}

export interface Item {
  id: string;
  name: string;
  icon: string;
  description: string;
  category: 'structure' | 'decoration' | 'nature' | 'special' | 'key' | 'defect';
}

export type LocationId = 'OFFICE' | 'SITE' | 'INTERIOR' | 'MAINTENANCE';

export interface GameState {
  status: GameStatus;
  level: number;
  strikes: number;
  messages: Message[];
  inventory: Item[];
  currentLocation: LocationId;
  selectedItems: Item[]; 
  blueprintProgress: number; 
  hasBlueprint: boolean;
}