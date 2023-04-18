import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {AngularFireAuth} from '@angular/fire/compat/auth';
import {GameState} from '../models/gameState';
import {Time} from "../models/time";
import {Question} from "../models/question";
import {Audience} from "../models/audience";

@Injectable({
  providedIn: 'root',
})
export class GameService {
  hostname: string;

  constructor(protected http: HttpClient, protected auth: AngularFireAuth) {
    if (location.hostname == 'localhost') {
      this.hostname = 'http://localhost:8080/';
    } else {
      this.hostname = 'https://kreditmilliomos.mooo.com:80/';
    }
  }

  // Needs proper implementation
  async startNewGame(c: any, d: any, time: any, uid: string) {
    let header = new HttpHeaders()
      .set('category', encodeURIComponent(c))
      .set('difficulty', d)
      .set('maxtimeperquestion', time.toString())
      .set('tokenkey', uid);

    await this.http.post(this.hostname + 'game/start', {}, {
      headers: header, responseType: 'text'
    }).toPromise().then(r => {
      //TODO: if 200 then everything is OK
    }).catch(e => {
      //TODO: process error
    });
  }

  async getTime(uid: any) {
    await this.http.get<Time>(this.hostname + 'game/getTime', {
      headers: new HttpHeaders().set('tokenkey', uid),
    }).toPromise().then(r => {

      return r;
    }).catch(e => {

      //TODO: process error
    });
  }

  // Needs proper implementation
  evaluateGame(uid: any, answer = "") {
    return this.http.get<GameState>(this.hostname + 'game/evaluateGame', {
      headers: new HttpHeaders().set('tokenkey', uid).set('answer', answer),
    }).toPromise()
  }

  async useHalf(uid: string) {
    return await this.http.get<Question>(this.hostname + 'game/useHalf', {
      headers: new HttpHeaders().set('tokenkey', uid),
    }).toPromise()
  }

  async useSwitch(uid: string) {
    return await this.http.get<{question: Question, win: boolean | undefined}>(this.hostname + 'game/useSwitch', {
      headers: new HttpHeaders().set('tokenkey', uid),
    }).toPromise()
  }

  async useAudience(uid: string) {
    return await this.http.get<Audience>(this.hostname + 'game/useAudience', {
      headers: new HttpHeaders().set('tokenkey', uid),
    }).toPromise()
  }

  async giveUp(uid: string, save: boolean) {
    return this.http.post<GameState>(this.hostname + 'game/giveUp', {}, {
      headers: new HttpHeaders().set('tokenkey', uid).set('save', save.toString()),
    }).toPromise()
  }

  async endGame(uid: any, save: boolean) {
    return this.http.post<GameState>(this.hostname + 'game/endGame', {}, {
      headers: new HttpHeaders().set('tokenkey', uid).set('save', save.toString())
    }).toPromise()
  }
}
