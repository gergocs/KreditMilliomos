import { Component, OnInit, Inject} from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import {AuthService} from "../services/auth.service";


@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.scss']  
})
export class RegistrationComponent implements OnInit {

  public error: boolean = false
  public errorMsg: string = ""
    
  public animationStarted: boolean = false;

  regForm = new FormGroup({
    username: new FormControl(''),
    email: new FormControl(''),
    lastName: new FormControl(''),
    firstName: new FormControl(''),
    password: new FormControl(''),
    passwordAgain: new FormControl('')
  });
  
  constructor(public auth: AuthService, @Inject(Router) private router: Router) { }
  

  ngOnInit(): void {
    
  }

  

  async onRegisterClicked(email: string, nickname: string, firstname: string, lastname: string, password: string, passwordagain: string) {
    // check email format
    const emailRegex: RegExp = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
    if (!emailRegex.test(email)) {
      this.errorMsg = "Az e-mail cím formátuma nem megfelelő!"
      this.error = true
      return;
    }

    // check empty inputs
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

    // check input lengths
    if (nickname.length < 4 || nickname.length > 24){
      this.errorMsg = "A felhasználónév 4-24 karakter hosszúságú lehet!"
      this.error = true
      return;
    }

    if (email.length < 4 || email.length > 64){
      this.errorMsg = "Az email cím hosszúsága nem megfelelő!"
      this.error = true
      return;
    }

    if (firstname.length > 24){
      this.errorMsg = "A vezetéknév maximum 24 karakter hosszúságú lehet!"
      this.error = true
      return;
    }

    if (lastname.length > 24){
      this.errorMsg = "A keresztnév maximum 24 karakter hosszúságú lehet!"
      this.error = true
      return;
    }

    if (password.length < 4 || password.length > 24){
      this.errorMsg = "A jelszó 4-24 karakter hosszúságú lehet!"
      this.error = true
      return;
    }

    // check password match
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


  //Loading screen 
  show: boolean = false;
  startLoading() {
    this.animationStarted = true;
    this.show = true;    
      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 8500); // <------- DELAY -- Ide kell majd a response ideje 
  }

  

}
