import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserModell } from '../models/usermodell';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {
  loggedin: boolean =false
  userdata: UserModell | undefined

  constructor(public auth: AuthService, protected router: Router) {
    if (!auth.user?.emailVerified && auth.authState == 2) {
      auth.user?.sendEmailVerification()
      console.log(auth.user)
      window.alert("A bejelentkezéshez meg kell erősítened az e-mail címedet! (Nézd meg a spam mappádat is!)");
      auth.logout();
    }
    if (!window.localStorage.getItem("userdatas")){
      auth.logout();
    }
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
