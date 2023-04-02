import {HttpClient, HttpHeaders, HttpResponse} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Observable } from 'rxjs';
import { Question } from '../models/question';
import { QuestionCategory } from '../models/questionCategory';

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
    return this.http.get<Question[]>(this.hostname + "question/admin/allQuestion", { headers: header });
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

    return this.http.post(this.hostname + "question/admin", body, {headers: header, responseType: 'text'});

    }

    importQuestions(q: Question[], uid: any){
      for (let index = 0; index < q.length; index++) {
        q[index].category= encodeURIComponent(q[index].category),
        q[index].question= encodeURIComponent(q[index].question),
        q[index].level= encodeURIComponent(q[index].level),
        q[index].answerA= encodeURIComponent(q[index].answerA),
        q[index].answerB= encodeURIComponent(q[index].answerB),
        q[index].answerC= encodeURIComponent(q[index].answerC),
        q[index].answerD= encodeURIComponent(q[index].answerD),
        q[index].answerCorrect= encodeURIComponent(q[index].answerCorrect)
      }

      let header = new HttpHeaders()
      .set("tokenkey", uid)

      return this.http.post(this.hostname + "question/admin/import", q, {headers: header, responseType: 'text'});

      }

    async deleteQuestion(q: string, uid: any){
      let header = new HttpHeaders()
        .set("tokenkey", uid)
      await this.http.delete(this.hostname + "question/admin", {headers: header, body: {question: q}}).toPromise().then(r => {
        if (r){
          return new Promise((resolve, reject) => {resolve(r);})
        }
        return new Promise((resolve, reject) => {resolve(r);})
        //window.location.reload() //TODO something nicer and faster
      }).catch(e => {
        return new Promise((resolve, reject) => {reject(e);})
      })
    }

    getQuestionCategories(uid: any){
      let header = new HttpHeaders().set("tokenkey", uid);
      return this.http.get<QuestionCategory[]>(this.hostname + "question/allQuestionCategories", { headers: header });
    }

    createQuestionCategory(qc:QuestionCategory,uid:any){
      let header = new HttpHeaders()
      .set("tokenkey", uid)
      let body = {
        category: encodeURIComponent(qc.category),
      }

      return this.http.post(this.hostname + "question/admin/createQuestionCategory", body, {headers: header, responseType: 'text'});
    }
}
