import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http'
import firebase from 'firebase/compat/app';
import { FacebookAuthProvider } from '@angular/fire/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private authStates = {
    unknown: 0,
    loggedOut: 1,
    loggedIn: 2,
  }
  user: firebase.User | undefined;
  authState = this.authStates.unknown;

  constructor(protected auth: AngularFireAuth, router: Router, protected http: HttpClient) {
    this.auth.onAuthStateChanged((credential)=>{
      if(credential){
        console.log(credential);
        this.user = credential;
        this.authState = this.authStates.loggedIn;
        this.getUserData();
        if (router.url == "/login")
          router.navigate(["/main"])
      }
      else{
        this.authState = this.authStates.loggedOut;
        router.navigate(["/login"]);
      }
    })
  }

  async getUserData() {
    if (!this.user)
      return

    let token = this.user.uid; // Itt tokent adtam meg, lehet this.user.uid kellett volna
    let header = new HttpHeaders()
      .set("tokenkey", token)
    this.http.get("http://146.190.205.69:8080/user/get", { headers: header })
      .subscribe(body => {
        console.log(body);
        // TODO feldolgozni a response-t
    })
  }

  async isLoggedIn() {
    if (this.user)
      return true;

    return false;
  }

  async login(email: string, password: string) {
    await this.auth.signInWithEmailAndPassword(email, password);
  }

  async logout() {
    await this.auth.signOut();
  }

  async FacebookAuth() {
    return this.AuthLogin(new FacebookAuthProvider());
  }

  async AuthLogin(provider: any) {
    try {
      const result = await this.auth.signInWithPopup(provider);

      if (!this.user)
      return

      let token = this.user.uid;
      let header = new HttpHeaders()
        .set("tokenkey", token).set("isoauth", 'true')
      this.http.post("http://146.190.205.69:8080/user/create", null, { headers: header })
        .subscribe(body => {
        console.log(body);
    })

      console.log('You have been successfully logged in!');
    } catch (error) {
      console.log(error);
    }
  }

}
