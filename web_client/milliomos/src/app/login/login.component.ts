import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
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
  public loading: boolean = false

  loginForm = new FormGroup({
    email: new FormControl(''),
    password: new FormControl('')
  });

  constructor(public auth: AuthService, protected router: Router) {
    console.log(auth.authState)
  }

  ngOnInit(): void {
    this.loading = false;
  }
  onGoogleLogin(){
    this.loading = true
    this.auth.GoogleAuth().catch((error)=>{
      this.loading=false;
    })
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

    if (email.length > 64 || password.length > 24) {
      this.errorMsg = "Túl hosszú inputok"
      this.error = true
      return;
    }
    this.loading = true;
    try {
      await this.auth.login(email, password);
      //this.router.navigate(["/main"]);
    } catch {
      this.errorMsg = "Hibás e-mail cím vagy jelszó!"
      this.error = true;
      this.loading = false;
    }
  }
}
