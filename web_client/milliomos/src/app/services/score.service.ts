import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {AngularFireAuth} from "@angular/fire/compat/auth";
import {Score} from "../models/score";

@Injectable({
  providedIn: 'root'
})
export class ScoreService {

  hostname: string;

  constructor(protected http: HttpClient, protected auth: AngularFireAuth) {
    if (location.hostname == "localhost") {
      this.hostname = "http://localhost:8080/";
    } else {
      this.hostname = "https://kreditmilliomos.mooo.com:80/"
    }
  }

  getUserScores(uid: string) {
    return this.http.get<Score[]>(this.hostname + "scoreBoard", {headers: new HttpHeaders().set("tokenkey", uid).set("istoken", "true")});
  }

  getTopX(x = 10) {
    return this.http.get(this.hostname + "scoreBoard/top", {headers: new HttpHeaders().set("topx", x.toString())});
  }

  getAchievements(names: string[], uid = "") {
    return this.http.get(this.hostname + "achievements", {headers: new HttpHeaders().set("tokens", JSON.stringify(names)).set("tokenkey", uid)});
  }

  async getAchievementStatus(uid: string) {
    await new Promise(resolve => setTimeout(resolve, 2000));
    return this.http.get(this.hostname + "achievements/status", {headers: new HttpHeaders().set("tokenkey", uid)});
  }
}
