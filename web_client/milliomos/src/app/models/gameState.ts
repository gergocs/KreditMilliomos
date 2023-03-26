import { Question } from './question';

export interface GameState {
  question: Question | undefined;
  win: boolean | undefined;
}
