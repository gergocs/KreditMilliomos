import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/authService/auth.service';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {

  constructor(public auth: AuthService, protected router: Router) {
    if (!auth.user?.emailVerified && auth.authState == 2) {
      window.alert("A bejelentkezéshez meg kell erősítened az e-mail címedet!");
      auth.logout();
    }
  }

  ngOnInit(): void {
  }

  async onLogoutPress() {
    await this.auth.logout();
  }
}
