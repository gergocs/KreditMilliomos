import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Observable } from 'rxjs';
import { Question } from '../models/question';

@Injectable({
  providedIn: 'root'
})
export class QuestionService {
  hostname: string;

  constructor(protected http: HttpClient, protected auth: AngularFireAuth) { 
    if(location.hostname == "localhost"){
      this.hostname = "http://localhost:8080/";
    }else{
      this.hostname = "https://kreditmilliomos.mooo.com:80/"
    }
  }

  getQuestion(q: any, uid: any){
        let header = new HttpHeaders().set("question", q).set("tokenkey", uid);
        return this.http.get<Question>(this.hostname + "question/get", { headers: header });
  }

  getAllQuestion(uid: any){
    let header = new HttpHeaders().set("question", "all").set("tokenkey", uid);
    return this.http.get<Question[]>(this.hostname + "question/get", { headers: header });
}

  createQuestion(q: Question, uid: any){
    let header = new HttpHeaders()
    .set("tokenkey", uid)
    .set("category", q.category)
    .set("question", q.question)
    .set("level", q.level)
    .set("answerA", q.answerA)
    .set("answerB", q.answerB)
    .set("answerC", q.answerC)
    .set("answerD", q.answerD)
    .set("answerCorrect", q.answerCorrect)
    let body = {
      category: q.category,
      question: q.question,
      level: q.level,
      answerA: q.answerA,
      answerB: q.answerB,
      answerC: q.answerC,
      answerD: q.answerD,
      answerCorrect: q.answerCorrect
    }
   
    return this.http.post(this.hostname + "question/create", body, {headers: header});
    
    }
}
