import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserModell } from '../../models/usermodell';
import { AuthService } from '../../services/auth.service';
import {ScoreService} from "../../services/score.service";
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
  achievements = new Map<string, Map<string, string>>();
  // Preserve original property order
  originalOrder = (a: KeyValue<string, number>, b: KeyValue<string, number>): number => {
    return 0;
  }

  beRunning = false;

  public showForm: boolean = false;

  constructor(public auth: AuthService, protected router: Router, private scoreService: ScoreService) {
    let beRunning = this.auth.isBackEndRunning();

    beRunning.then(r => {
      this.beRunning = r;

      if (!r){
        localStorage.clear()
        window.alert("Néhány óra múlva próbáld újra");
      } else {
        if (!auth.user?.emailVerified && auth.authState == 2) {
          auth.user?.sendEmailVerification()
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
            tmp.set(entry[0], <number>entry[1]);
            this.scores.set(decodeURIComponent(entry[0]), <number>entry[1]);
          });

          this.scoreService.getAchievements(Array.from(tmp.keys())).subscribe(achievements => {
            this.achievements = new Map<string, Map<string, string>>();

            // @ts-ignore
            Object.entries(achievements).forEach((entry) => {
              // @ts-ignore
              let array = entry[1];
              let val = new Map<string, string>();

              for (let i = 0; i < array.length; i++) {
                  val.set(decodeURIComponent(array[i]), "assets/images/achievements/" + decodeURIComponent(array[i]) + ".svg")
              }

              this.achievements.set(decodeURIComponent(entry[0]), val);
            });
          })


        });
      }
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
