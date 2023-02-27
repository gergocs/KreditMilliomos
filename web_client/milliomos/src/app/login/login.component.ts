import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})

export class LoginComponent implements OnInit {

  public error: boolean = false
  public errorMsg: string = ""

  constructor(public auth: AuthService, protected router: Router) {
    console.log(auth.authState)
  }

  ngOnInit(): void {
  }

  async onLoginClicked(email: string, password: string) {
    
    if (email == "") {
      this.errorMsg = "Az e-mail cím mező nem lehet üres!"
      this.error = true
      return;
    }

    if (password == "") {
      this.errorMsg = "A jelszó mező nem lehet üres!"
      this.error = true
      return;
    }

    try {
      await this.auth.login(email, password);
      this.router.navigate(["/main"]);
    } catch {
      this.errorMsg = "Hibás e-mail cím vagy jelszó!"
      this.error = true
    }
  }
}
