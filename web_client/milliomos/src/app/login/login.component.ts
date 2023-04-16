import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { AngularFireAuth } from '@angular/fire/compat/auth';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})

export class LoginComponent implements OnInit {

  public error: boolean = false
  public errorMsg: string = ""
  public loading: boolean = false
  public isNewPassClicked: boolean = false
  newpassemail: string = "";

  loginForm = new FormGroup({
    email: new FormControl(''),
    password: new FormControl('')
  });

  constructor(public auth: AuthService, protected router: Router, public firebase: AngularFireAuth) {
  }

  ngOnInit(): void {
    this.loading = false;
  }

  async onGoogleLogin(){
    this.loading = true
    await this.auth.GoogleAuth().catch(error=>{
      this.loading=false;
    })
  }

  async onLoginClicked(email: string, password: string) {

    if (email == "") {
      this.errorMsg = "Az e-mail cím mező kitöltése kötelező!"
      this.error = true
      return;
    }

    if (password == "") {
      this.errorMsg = "A jelszó mező kitöltése kötelező!"
      this.error = true
      return;
    }

    if (email.length > 64) {
      this.errorMsg = "Az email cím maximum 64 karakter hosszúságú lehet!"
      this.error = true
      return;
    }

    if (password.length > 24) {
      this.errorMsg = "A jelszó maximum 24 karakter hosszúságú lehet!"
      this.error = true
      return;
    }

    this.loading = true;
    try {
      await this.auth.login(email, password).catch(error=>{
        this.error = true
        this.errorMsg = "Hibás e-mail cím vagy jelszó!"
        this.loading=false
      })
      //this.router.navigate(["/main"]);
    } catch {}
  }

  async onNewPass() {
    const emailRegex = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
    if(emailRegex.test(this.newpassemail)){
      try {
        await this.firebase.sendPasswordResetEmail(this.newpassemail)
      }catch(e){
      }finally{
        alert("Sikeresen kiküldtük az e-mailt, amennyiben van felhasználónk ilyen e-mail címmel!") 
      }
    }else{
      alert("Nem megfelelő e-mail cím!")
    }
  }

}
