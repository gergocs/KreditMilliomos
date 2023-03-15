import {HttpClient, HttpHeaders, HttpResponse} from '@angular/common/http';
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
      category: encodeURIComponent(q.category),
      question: encodeURIComponent(q.question),
      level: encodeURIComponent(q.level),
      answerA: encodeURIComponent(q.answerA),
      answerB: encodeURIComponent(q.answerB),
      answerC: encodeURIComponent(q.answerC),
      answerD: encodeURIComponent(q.answerD),
      answerCorrect: encodeURIComponent(q.answerCorrect)
    }

    return this.http.post(this.hostname + "question/admin/create", body, {headers: header, responseType: 'text'});

    }

    importQuestions(q: Question[], uid: any){
      let header = new HttpHeaders()
      .set("tokenkey", uid)
    
      return this.http.post(this.hostname + "question/admin/import", q, {headers: header, responseType: 'text'});
  
      }

    async deleteQuestion(q: string, uid: any){
      let header = new HttpHeaders()
        .set("tokenkey", uid)
      await this.http.delete(this.hostname + "question/admin/deleteQuestion", {headers: header, body: {question: q}}).toPromise().then(r => {
        if (r){
          console.log(r)
          return new Promise((resolve, reject) => {resolve(r);})
        }
        console.log()
        return new Promise((resolve, reject) => {resolve(r);})
        //window.location.reload() //TODO something nicer and faster
      }).catch(e => {
        return new Promise((resolve, reject) => {reject(e);})
      })
    }
}
