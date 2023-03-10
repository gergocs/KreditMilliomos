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
        return this.http.get<Question>(this.hostname + "question/get", { headers: header }); //TODO be working on it
  }

  getAllQuestion(uid: any){
    let header = new HttpHeaders().set("tokenkey", uid);
    return this.http.get<Question[]>(this.hostname + "question/admin/getAllQuestion", { headers: header });
}

  createQuestion(q: Question, uid: any){
    let header = new HttpHeaders()
    .set("tokenkey", uid)
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

    return this.http.post(this.hostname + "question/admin/create", body, {headers: header, responseType: 'text'});

    }
}
