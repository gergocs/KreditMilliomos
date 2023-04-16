import { Pipe, PipeTransform } from '@angular/core';
import {Question} from "../models/question";

@Pipe({
  name: 'questionFilter'
})
export class QuestionFilterPipe implements PipeTransform {

  transform(questions: Question[], filter: string): Question[] {
    if (!questions || !filter || filter.length === 0 || filter === 'all') {
      return questions;
    }

    return questions.filter(question => question.category === filter);
  }

}
