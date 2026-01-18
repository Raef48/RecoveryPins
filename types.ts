
export enum Difficulty {
  EASY = 3,
  MEDIUM = 4,
  HARD = 6
}

export type Operator = '+' | '-' | '*' | '/';

export interface PinSlot {
  correctValue: number;
  options: number[];
  selectedValue: number | null;
}

export interface GameState {
  difficulty: Difficulty;
  target: number;
  pins: PinSlot[];
  operators: Operator[];
  isLocked: boolean;
  attempts: number;
  logs: string[];
  victory: boolean;
  gameStarted: boolean;
}

export interface EquationPart {
  type: 'number' | 'operator';
  value: number | Operator;
}
