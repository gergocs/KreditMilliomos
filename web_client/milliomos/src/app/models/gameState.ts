import {Question} from './question';

export interface GameState {
  question: Question | undefined;
  win: {
    time: number,
    level: number,
    difficulty: number,
    win: boolean
  }
}
