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
  async startNewGame(c: any, d: any, uid: string) {
    let header = new HttpHeaders()
      .set('category', c)
      .set('difficulty', d)
      .set('tokenkey', uid);

    await this.http.post(this.hostname + 'game/start', {}, {
      headers: header, responseType: 'text'
    }).toPromise().then(r => {
      console.log(r);
      //TODO: if 200 then everything is OK
    }).catch(e => {
      console.log(e);
      //TODO: process error
    });
  }

  async getTime(uid: any) {
    await this.http.get<Time>(this.hostname + 'game/getTime', {
      headers: new HttpHeaders().set('tokenkey', uid),
    }).toPromise().then(r => {
      console.log(r);

      return r;
    }).catch(e => {
      console.log(e);

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
    await this.http.get<Question>(this.hostname + 'game/useHalf', {
      headers: new HttpHeaders().set('tokenkey', uid),
    }).toPromise().then(r => {
      console.log(r);

      return r; // the 2 removed questions are empty strings
    }).catch(e => {
      console.log(e);

      //TODO: process error
    });
  }

  async useSwitch(uid: string) {
    await this.http.get<Question>(this.hostname + 'game/useSwitch', {
      headers: new HttpHeaders().set('tokenkey', uid),
    }).toPromise().then(r => {
      console.log(r);

      return r;
    }).catch(e => {
      console.log(e);

      //TODO: process error
    });
  }

  async useAudience(uid: string) {
    await this.http.get<Audience>(this.hostname + 'game/useAudience', {
      headers: new HttpHeaders().set('tokenkey', uid),
    }).toPromise().then(r => {
      console.log(r);

      return r;
    }).catch(e => {
      console.log(e);

      //TODO: process error
    });
  }

  async giveUp(uid: string, save: boolean) {
    await this.http.post(this.hostname + 'game/giveUp', {}, {
      headers: new HttpHeaders().set('tokenkey', uid).set('save', save.toString()),
    }).toPromise().then(r => {
      console.log(r);

      //200 if give up
    }).catch(e => {
      console.log(e);

      //TODO: process error
    });
  }

  async endGame(uid: any, save: boolean) {
    await this.http.post(this.hostname + 'game/endGame', {}, {
      headers: new HttpHeaders().set('tokenkey', uid).set('save', save.toString()), responseType: 'text'
    }).toPromise().then(r => {
      console.log(r);

      //200 if give up
    }).catch(e => {
      console.log(e);

      //TODO: process error
    });
  }
}
