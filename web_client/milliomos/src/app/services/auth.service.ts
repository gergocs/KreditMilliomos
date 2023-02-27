import {Injectable} from '@angular/core';
import {AngularFireAuth} from '@angular/fire/compat/auth';
import {Router} from '@angular/router';
import {HttpClient, HttpHeaders, HttpResponse} from '@angular/common/http'
import firebase from 'firebase/compat/app';
import {FacebookAuthProvider} from '@angular/fire/auth';

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
    this.auth.onAuthStateChanged((credential) => {
      if (credential) {
        console.log(credential);
        this.user = credential;
        this.authState = this.authStates.loggedIn;
        this.getUserData();
        if (router.url == "/login")
          router.navigate(["/main"])
      } else {
        this.authState = this.authStates.loggedOut;
        router.navigate(["/login"]);
      }
    })
  }

  async getUserData() {
    if (!this.user)
      return

    let token = this.user.uid;
    let header = new HttpHeaders()
      .set("tokenkey", token)
    this.http.get<HttpResponse<any>>("http://146.190.205.69:8080/user/get", {headers: header})
      .subscribe(response => {
        console.log(response);
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

      if(!this.user.emailVerified)
      await this.user.sendEmailVerification()

      let token = this.user.uid;
      let header = new HttpHeaders()
        .set("tokenkey", token).set("isoauth", 'true')
      this.http.post<HttpResponse<any>>("http://146.190.205.69:8080/user/create", null, {headers: header})
        .subscribe(response => {
          console.log(response.status);
        })

      console.log('You have been successfully logged in!');
    } catch (error) {
      console.log(error);
    }
  }

  signup(email: string, nickname: string, firstname: string, lastname: string, password: string, passwordagain: string) {

    if (password != passwordagain) {
      return
    }

    this.auth.createUserWithEmailAndPassword(email, password).then(cred => {
      if (!this.user)
        return

      this.user.sendEmailVerification().then(() => {
        window.alert('Erősítsd meg az e-mail címedet.');
      });

      let token = this.user.uid;
      let header = new HttpHeaders()
        .set("tokenkey", token).set("email", email).set("nickname",nickname).set("firstname", firstname).set("lastname", lastname)
      this.http.post<HttpResponse<any>>("http://146.190.205.69:8080/user/create", null, {headers: header})
        .subscribe(response => {
          console.log(response.status);
        })
    });
  }
}
