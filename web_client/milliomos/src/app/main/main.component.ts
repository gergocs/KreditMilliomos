import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserModell } from '../models/usermodell';
import { AuthService } from '../services/auth.service';
import {ScoreService} from "../services/score.service";
import {Score} from "../models/score";

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {
  loggedin: boolean =false
  userdata: UserModell | undefined
  scores = new Map<string, number>();

  constructor(public auth: AuthService, protected router: Router, private scoreService: ScoreService) {
    if (!auth.user?.emailVerified && auth.authState == 2) {
      auth.user?.sendEmailVerification()
      console.log(auth.user)
      window.alert("A bejelentkezéshez meg kell erősítened az e-mail címedet! (Nézd meg a spam mappádat is!)");
      auth.logout();
    }
    if (!window.localStorage.getItem("userdatas")){
      auth.logout();
    }

    this.scoreService.getTopX().subscribe(score => {
      this.scores = new Map<string, number>();

      // @ts-ignore
      Object.entries(score.result).forEach((key, value) => {
        this.scores.set(key[0], <number>key[1])
      })
    })

  }

  ngOnInit(){
    let userdatas = window.localStorage.getItem("userdatas")
    if(!userdatas){
      this.loggedin = false;
    }else{
      this.loggedin = true;
      this.userdata = JSON.parse(userdatas)
  }
  }
}
