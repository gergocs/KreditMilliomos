export interface Question {
    category: string;
    question: string;
    level: string;
    answerA: string;
    answerB: string;
    answerC: string;
    answerD: string;
    answerCorrect: string; // TODO: In the future this field will be removed from the frontend
 }
