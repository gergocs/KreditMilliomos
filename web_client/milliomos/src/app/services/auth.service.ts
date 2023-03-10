import {Injectable, NgZone} from '@angular/core';
import {AngularFireAuth} from '@angular/fire/compat/auth';
import {Router} from '@angular/router';
import {HttpClient, HttpHeaders} from '@angular/common/http'
import firebase from 'firebase/compat/app';
import {FacebookAuthProvider, getAdditionalUserInfo, GoogleAuthProvider} from '@angular/fire/auth';
import { UserModell } from '../models/usermodell';

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
  userdata: UserModell | undefined;
  userList: UserModell[] | undefined;
  authState = this.authStates.unknown;

  hostname: string;

  constructor(private zone:NgZone, protected auth: AngularFireAuth, protected router: Router, protected http: HttpClient) {
    if(location.hostname == "localhost"){
      this.hostname = "http://localhost:8080/";
    }else{
      this.hostname = "https://kreditmilliomos.mooo.com:80/"
    }

    this.auth.onAuthStateChanged((credential) => {
      if (credential) {
        console.log(credential);
        this.user = credential;
        this.authState = this.authStates.loggedIn;
        this.getUserData();
        this.getAllUsers();
        if (router.url == "/login" || router.url == "/register")
        this.zone.run(() => {
          //this.router.navigate(['/main']);
      });
      } else {
        this.authState = this.authStates.loggedOut;
        this.zone.run(() => {
          this.router.navigate(['/login']);
      });
      }
    })
  }

  async getUserData() {
    if (!this.user)
      return

    console.log(location.hostname)

    let token = this.user.uid;
    let header = new HttpHeaders()
      .set("tokenkey", token)
    this.http.get<UserModell>(this.hostname + "user/get", {headers: header})
      .subscribe(body => {
        console.log("body: ", body)
        this.userdata = body
        if(body.isAdmin){
          this.zone.run(() => {
            this.router.navigate(['/admin']);
        });
        }else {
          this.zone.run(() => {
            this.router.navigate(['/main']);
        })
        }
        
      })

  }

  async isLoggedIn() {
    if (this.user)
      return true;

    return false;
  }

  async login(email: string, password: string) {
    return await this.auth.signInWithEmailAndPassword(email, password);
  }

  async logout() {
    await this.auth.signOut();
  }

  async GoogleAuth() {
    return this.AuthLogin(new GoogleAuthProvider());
  }

  async AuthLogin(provider: any) {
    try {
      const result = await this.auth.signInWithPopup(provider);

      console.log(result.additionalUserInfo?.profile)

      //@ts-ignore
      let email=result.additionalUserInfo?.profile?.email
      if(!email) {email = "missing@missing.com"}
      //@ts-ignore
      let firstname=result.additionalUserInfo?.profile?.family_name
      if(!firstname) {firstname = "Missing"}
      //@ts-ignore
      let lastname=result.additionalUserInfo?.profile?.given_name
      if(!lastname) {lastname = "Lajos"}
      //@ts-ignore
      let nickname=result.additionalUserInfo?.profile?.email.split("@")[0]
      if(!nickname) {nickname = "missingnickname"}

      console.log(email + " " + firstname + " " +  lastname + " " +  nickname)



      if (!this.user)
        return

      if(!this.user.emailVerified)
      await this.user.sendEmailVerification()

      let token = this.user.uid;
      let header = new HttpHeaders()
        .set("tokenkey", token).set("isoauth", 'true').set("email", email).set("nickname",nickname).set("firstname", firstname).set("lastname", lastname)
        this.http.post(this.hostname + "user/create", header, {headers: header})
        .subscribe(body => {
          console.log(body);
        })

      console.log("You have been successfully logged in!");
    } catch (error) {
      console.log(error);
      return new Promise((resolve, reject) => {
        reject();
        })
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
        window.alert("Erősítsd meg az e-mail címedet!");
        this.zone.run(() => {
          this.router.navigate(['/login']);
      });
      });

      let token = this.user.uid;
      let header = new HttpHeaders()
        .set("tokenkey", token).set("email", email).set("nickname",nickname).set("firstname", firstname).set("lastname", lastname).set("admin", "false")
      this.http.post(this.hostname + "user/create", null, {headers: header})
        .subscribe(body => {
          console.log(body);
          this.getUserData();
        })
    });


  }

  async getAllUsers(){
    try{
      if (!this.user)
        return
      console.log('getallUsers')
      let token = this.user.uid;
      let header = new HttpHeaders()
        .set("tokenkey", token)
      this.http.get<UserModell[]>(this.hostname + "user/getAllUsers", {headers: header})
        .subscribe(body => {
          console.log("body: ", body)
          this.userList = body        
        })
    }catch(error){
      console.log(error);
      return new Promise((resolve, reject) => {
        reject();
        })
    }
  }
}
