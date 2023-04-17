import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserModell } from '../models/usermodell';
import { AuthService } from '../services/auth.service';
import {Score} from "../models/score";
import {ScoreService} from "../services/score.service";
import {KeyValue} from "@angular/common";

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {

  loading: Boolean = false
  introSkip: Boolean = false
  userdata: UserModell | undefined

  updateForm = new FormGroup({
    username: new FormControl(''),
    firstName: new FormControl(''),
    lastName: new FormControl('')
  });

  skipIntroChecked: Boolean = false;
  skipIntro: Boolean | null = false;

  scores: Score[] = [];

  constructor(public router: Router, private auth: AuthService, private scoreService: ScoreService) {
    let userdatas = window.localStorage.getItem("userdatas")
    if (userdatas){
      this.userdata = JSON.parse(userdatas)
      let userdata = JSON.parse(userdatas)
      this.updateForm.get('username')?.setValue(decodeURIComponent(userdata.name))
      this.updateForm.get('firstName')?.setValue(decodeURIComponent(userdata.firstName))
      this.updateForm.get('lastName')?.setValue(decodeURIComponent(userdata.lastName))
    } else {
      this.router.navigate(['/login']);
    }

    this.scoreService.getUserScores(<string>this.userdata?.tokenKey).subscribe(score => {
      score.forEach(element => {
        if (this.scores.length < 10) {
          this.scores.push({
            category: decodeURI(element.category),
            level: element.level,
            time: element.time,
            tokenKey: ""
          });
        }
      })
      this.scores.sort((a, b) => {
        // először rendezzük a level szerint csökkenő sorrendben
        if (b.level !== a.level) {
          return b.level - a.level;
        }
        // ha a két elem azonos szinten van, akkor rendezzük a time szerint növekvő sorrendben
        return Number(a.time.valueOf()) - Number(b.time.valueOf());
      });
    })
  }

  ngOnInit(): void {
    if (window.localStorage.getItem('introSkipped') == "true")
      this.skipIntro = true;
    else
      this.skipIntro = false;
  }

  skipIntroChange(event: any) {
    this.skipIntroChecked = event.target.checked;
  }

  redirectToLobby(){
    this.router.navigate(['/lobby']);
  }

  async updateuser(){
    if (!this.userdata)
    return
    this.userdata.name = this.updateForm.get("username")?.value
    this.userdata.firstName = this.updateForm.get("firstName")?.value
    this.userdata.lastName = this.updateForm.get("lastName")?.value

    this.loading = true
    await this.auth.updateuser(this.userdata).then(body => {
      window.localStorage.setItem("userdatas", JSON.stringify(this.userdata))

      if (this.skipIntroChecked) {
        this.introSkip = true;
      } else {
        this.introSkip = false;
      }
      window.localStorage.setItem('introSkipped',JSON.stringify(this.introSkip))

      this.loading = false
    }).catch(err =>{
      this.loading = false
    })
  }

  async onLogoutPress() {
    await this.auth.logout();
  }

  timeToString(time: bigint) {
    let nTime = Number(time)/1000
    if (nTime > 60){
      let perc = Math.floor(nTime/60)
      let mp = Math.round(nTime - perc*60)
      return (perc.toString() + " perc " + mp.toString() + " másodperc")
    }else{
      return Math.round(nTime).toString() + " másodperc"
    }
  }

  protected readonly decodeURI = decodeURI;
}
