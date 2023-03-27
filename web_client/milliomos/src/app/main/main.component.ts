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
  userdata: UserModell | undefined

  constructor(public auth: AuthService, protected router: Router) {
    if (!auth.user?.emailVerified && auth.authState == 2) {
      window.alert("A bejelentkezéshez meg kell erősítened az e-mail címedet!");
      auth.logout();
    }
    if (!window.localStorage.getItem("userdatas")){
      auth.logout();
    }
  }

  ngOnInit(){
    let userdatas = window.localStorage.getItem("userdatas")
    if(!userdatas){
      this.auth.logout()
      return;
    }
    this.userdata = JSON.parse(userdatas)
  }

  async onLogoutPress() {
    await this.auth.logout();
  }
}
