import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserModell } from '../models/usermodell';
import { AuthService } from '../services/auth.service';
import {ScoreService} from "../services/score.service";
import {Score} from "../models/score";
import { KeyValue } from '@angular/common';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {
  loggedin: boolean =false
  userdata: UserModell | undefined
  scores = new Map<string, number>();
  // Preserve original property order
  originalOrder = (a: KeyValue<string, number>, b: KeyValue<string, number>): number => {
    return 0;
  }

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
      let tmp = new Map<string, number>();
    
      // @ts-ignore
      Object.entries(score.result).forEach((entry) => {
        tmp.set(entry[0], <number>entry[1])
      });
      this.scores = tmp;
    });

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
