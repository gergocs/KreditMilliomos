import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  constructor(public auth: AuthService, protected router: Router) {
    console.log(auth.authState)
  }

  ngOnInit(): void {
  }

  async onLoginClicked(email: string, password: string) {
    if (email == "") {
      window.alert("Az e-mail cím mező nem lehet üres!");
      return;
    }

    if (password == "") {
      window.alert("A jelszó mező nem lehet üres!");
      return;
    }

    try {
      await this.auth.login(email, password);
      this.router.navigate(["/main"]);
    } catch {
      window.alert("Hibás e-mail cím vagy jelszó!");
    }
  }
}
