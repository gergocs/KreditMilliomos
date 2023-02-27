import { Component, OnInit } from '@angular/core';
import {AuthService} from "../services/auth.service";

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.scss']
})
export class RegistrationComponent implements OnInit {

  constructor(public auth: AuthService) { }

  ngOnInit(): void {
  }

  async onRegisterClicked(email: string, nickname: string, firstname: string, lastname: string, password: string, passwordagain: string) {
    if (email == "") {
      window.alert("Az e-mail cím mező nem lehet üres!");
      return;
    }

    const emailRegex: RegExp = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
    if (!emailRegex.test(email)) {
      window.alert("Az e-mail cím formátuma nem megfelelő!");
      return;
    }

    if (nickname == "") {
      window.alert("A felhasználónév mező nem lehet üres!");
      return;
    }

    if (firstname == "") {
      window.alert("A vezetéknév mező nem lehet üres!");
      return;
    }

    if (lastname == "") {
      window.alert("A keresztnév mező nem lehet üres!");
      return;
    }

    if (password == "") {
      window.alert("A jelszó mező nem lehet üres!");
      return;
    }

    if (password != passwordagain) {
      window.alert("A megadott jelszavak nem egyeznek!");
      return;
    }

    try {
      await this.auth.signup(email, nickname, firstname, lastname, password, passwordagain)
    } catch { }
  }
}
