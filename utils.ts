
import { Operator, PinSlot, Difficulty } from './types';

const OPERATORS: Operator[] = ['+', '-', '*', '/'];

const getRandomInt = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const evaluateSimple = (a: number, op: Operator, b: number): number => {
  switch (op) {
    case '+': return a + b;
    case '-': return a - b;
    case '*': return a * b;
    case '/': return b !== 0 ? a / b : 0;
    default: return 0;
  }
};

export const generateRound = (difficulty: Difficulty): { target: number, pins: PinSlot[], operators: Operator[] } => {
  let target = 0;
  let pins: PinSlot[] = [];
  let operators: Operator[] = [];
  let valid = false;

  // Retry until we get a clean integer result in range 24-100
  while (!valid) {
    const tempPins: number[] = [];
    const tempOps: Operator[] = [];
    
    // Generate initial values
    for (let i = 0; i < difficulty; i++) {
      tempPins.push(getRandomInt(1, 12));
    }
    for (let i = 0; i < difficulty - 1; i++) {
      tempOps.push(OPERATORS[getRandomInt(0, OPERATORS.length - 1)]);
    }

    // Left-to-right evaluation for simplicity in game logic
    let result = tempPins[0];
    let possible = true;
    for (let i = 0; i < tempOps.length; i++) {
      const nextVal = tempPins[i + 1];
      const op = tempOps[i];
      
      // Ensure divisions are clean and no negative results
      if (op === '/' && (nextVal === 0 || result % nextVal !== 0)) {
        possible = false;
        break;
      }
      result = evaluateSimple(result, op, nextVal);
      if (result < 0 || result > 1000) { // arbitrary upper cap to keep it sane
        possible = false;
        break;
      }
    }

    if (possible && result >= 24 && result <= 100 && Number.isInteger(result)) {
      target = result;
      operators = tempOps;
      pins = tempPins.map(val => {
        const options = [val];
        while (options.length < 3) {
          const decoy = getRandomInt(1, 15);
          if (!options.includes(decoy)) options.push(decoy);
        }
        // Shuffle options
        return {
          correctValue: val,
          options: options.sort(() => Math.random() - 0.5),
          selectedValue: null
        };
      });
      valid = true;
    }
  }

  return { target, pins, operators };
};

export const checkGuess = (currentPins: PinSlot[], operators: Operator[]): number => {
  if (currentPins.some(p => p.selectedValue === null)) return -1;

  let result = currentPins[0].selectedValue!;
  for (let i = 0; i < operators.length; i++) {
    result = evaluateSimple(result, operators[i], currentPins[i + 1].selectedValue!);
  }
  return result;
};
