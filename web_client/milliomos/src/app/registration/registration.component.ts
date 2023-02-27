import { Component, OnInit } from '@angular/core';
import {AuthService} from "../services/auth.service";

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.scss']
})
export class RegistrationComponent implements OnInit {

  public error: boolean = false
  public errorMsg: string = ""

  constructor(public auth: AuthService) { }

  ngOnInit(): void {
  }

  async onRegisterClicked(email: string, nickname: string, firstname: string, lastname: string, password: string, passwordagain: string) {
    if (email == "") {
      this.errorMsg = "Az e-mail cím mező nem lehet üres!"
      this.error = true
      return;
    }

    const emailRegex: RegExp = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
    if (!emailRegex.test(email)) {
      this.errorMsg = "Az e-mail cím formátuma nem megfelelő!"
      this.error = true
      return;
    }

    if (nickname == "") {
      this.errorMsg = "A felhasználónév mező nem lehet üres!"
      this.error = true
      return;
    }

    if (firstname == "") {
      this.errorMsg = "A vezetéknév mező nem lehet üres!"
      this.error = true
      return;
    }

    if (lastname == "") {
      this.errorMsg = "A keresztnév mező nem lehet üres!"
      this.error = true
      return;
    }

    if (password == "") {
      this.errorMsg = "A jelszó mező nem lehet üres!"
      this.error = true
      return;
    }

    if (password != passwordagain) {
      this.errorMsg = "A megadott jelszavak nem egyeznek!"
      this.error = true
      return;
    }

    try {
      await this.auth.signup(email, nickname, firstname, lastname, password, passwordagain)
    } catch {
      this.errorMsg = "A regisztráció sikertelen!"
      this.error = true
    }
  }
}
