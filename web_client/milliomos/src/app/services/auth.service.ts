import {Injectable, NgZone} from '@angular/core';
import {AngularFireAuth} from '@angular/fire/compat/auth';
import {Router} from '@angular/router';
import {HttpClient, HttpErrorResponse, HttpHeaders, HttpResponse} from '@angular/common/http'
import firebase from 'firebase/compat/app';
import {FacebookAuthProvider, getAdditionalUserInfo, GoogleAuthProvider} from '@angular/fire/auth';
import { UserModell } from '../models/usermodell';
import { catchError, map, Observable, Subject, throwError } from 'rxjs';

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
  authState = this.authStates.unknown;

  hostname: string;

  constructor(private zone:NgZone, protected auth: AngularFireAuth, protected router: Router, protected http: HttpClient) {
    if(location.hostname == "localhost"){
      this.hostname = "http://localhost:8080/";
    }else{
      this.hostname = "https://kreditmilliomos.mooo.com:80/"
    }

    this.auth.user.subscribe(user=>{
      if(user){
        this.authState = this.authStates.loggedIn;
        this.user = user
      } else {
        this.authState = this.authStates.loggedOut;
        this.user = undefined
        this.router.navigate(['/main']);
      }
    })

    this.auth.onAuthStateChanged((credential) => {
      if (credential) {

        this.user = credential;
        this.authState = this.authStates.loggedIn;
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

  async isAdmin(){
    try {
      if (this.user) {
        const res = await this.http.get<boolean>(this.hostname + "user/isAdmin", {headers: new HttpHeaders().set('tokenKey', this.user.uid)}).toPromise();
        return true;
      } else {
        return false;
      }
    } catch (err: any) {
      if (err.status === 200) {
        return true;
      } else {
        return false;
      }
    }
  }

  async getUserData() {
    if (!this.user)
      return

    let token = this.user.uid;
    let header = new HttpHeaders()
      .set("tokenkey", token)
    await this.http.get<UserModell>(this.hostname + "user", {headers: header}).toPromise().then(body =>{

      this.userdata = body
      window.localStorage.setItem("userdatas", JSON.stringify(body))
        if(body?.isAdmin){
          this.zone.run(() => {
            this.router.navigate(['/admin-users']);
        });
        }else {
          this.zone.run(() => {
            this.router.navigate(['/profile']);
        })
        }
    }).catch(error =>{
      return new Promise((resolve, reject) => {reject();})
    })

  }

  async isLoggedIn() {
    return !!this.user;
  }

  async login(email: string, password: string) {
    await this.auth.signInWithEmailAndPassword(email, password)
    return await this.getUserData()
  }

  async logout() {
    window.localStorage.removeItem("userdatas")
    await this.auth.signOut();
    this.zone.run(() => {
      this.router.navigate(['/main']);
  });
  }

  async GoogleAuth() {
    await this.AuthLogin(new GoogleAuthProvider()).catch((error)=>{
      return new Promise((resolve, reject) => {reject();})
    });
  }

  async AuthLogin(provider: any) {
    try {
      const result = await this.auth.signInWithPopup(provider);

      let firstlogin = result.additionalUserInfo?.isNewUser;

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

      if (!this.user)
        return

      let token = this.user.uid;
      let header = new HttpHeaders()
        .set("tokenkey", token)
        .set("isoauth", 'true')
        .set("email", encodeURIComponent(email))
        .set("nickname", encodeURIComponent(nickname))
        .set("firstname", encodeURIComponent(firstname))
        .set("lastname", encodeURIComponent(lastname))
      if(firstlogin){
          await this.http.post(this.hostname + "user", header, {headers: header, responseType: 'text'}).toPromise().then(async body =>{
            if (body == null){
              throw new Error() //remeljuk mukodik
            }
            return await this.getUserData() //mukodik
          }).catch(error =>{
            this.delfromfire()
            return new Promise((resolve, reject) => {reject();}) //mukodik
          })
        }else{
            return await this.getUserData() //mukodik
        }


    } catch (error) {
      return new Promise((resolve, reject) => {reject();}) //mukodik
    }
  }

  async signup(email: string, nickname: string, firstname: string, lastname: string, password: string, passwordagain: string) {

    if (password != passwordagain) {
      return
    }
    await this.auth.createUserWithEmailAndPassword(email, password).then(async cred => {
      if (!this.user)
        return

      let token = this.user.uid;
      let header = new HttpHeaders()
        .set("tokenkey", token)
        .set("email", encodeURIComponent(email))
        .set("nickname", encodeURIComponent(nickname))
        .set("firstname", encodeURIComponent(firstname))
        .set("lastname", encodeURIComponent(lastname))
        .set("admin", "false")
      await this.http.post(this.hostname + "user", null, {headers: header, responseType: 'text'}).toPromise().then(async body =>{
        if (body == null){
          throw new Error() //remeljuk mukodik
        }
        if (this.user)
        this.user.sendEmailVerification().then(() => {
          window.alert("Erősítsd meg az e-mail címedet!");
          this.zone.run(() => {
            this.router.navigate(['/login']);
        });
        });
      }).catch(error =>{
        this.delfromfire()
        return new Promise((resolve, reject) => {reject();}) //tesztre var TODO
      })
    });
  }

  async updateuser(userdata: UserModell){
    let header = new HttpHeaders()
      .set("tokenkey", userdata.tokenKey)
      .set("nickname", encodeURIComponent(userdata.name))
      .set("firstname", encodeURIComponent(userdata.firstName))
      .set("lastname", encodeURIComponent(userdata.lastName))
    return await this.http.put(this.hostname + "user", null, {headers: header, responseType: 'text'}).toPromise()
  }

  async getAllUsers(tokenkey: string){
      let header = new HttpHeaders()
        .set("tokenkey", tokenkey)
      return await this.http.get<UserModell[]>(this.hostname + "user/admin/allUsers", {headers: header}).toPromise()

  }



  async bannedUserList() {
    if (!this.user)
      return

    let token = this.user.uid;
    let header = new HttpHeaders().set("tokenkey",token)//json egyből alakítható
    return await this.http.get<string[]>(this.hostname + "user/admin/bannedUsers", {headers: header}).toPromise()

  }

  async delfromfire(){
    this.user?.delete();
  }


}
