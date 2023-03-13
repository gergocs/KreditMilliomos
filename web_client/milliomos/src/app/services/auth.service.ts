import {Injectable, NgZone} from '@angular/core';
import {AngularFireAuth} from '@angular/fire/compat/auth';
import {Router} from '@angular/router';
import {HttpClient, HttpErrorResponse, HttpHeaders, HttpResponse} from '@angular/common/http'
import firebase from 'firebase/compat/app';
import {FacebookAuthProvider, getAdditionalUserInfo, GoogleAuthProvider} from '@angular/fire/auth';
import { UserModell } from '../models/usermodell';
import { catchError, map, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class AuthService {

  private authStates = {
    unknown: 0,
    loggedOut: 1,
    loggedIn: 2,
  }
  bannedUserIDs: string[] | undefined;
  helperListArray: boolean[] = new Array(1);
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

  async getUserData() {
    if (!this.user)
      return

    let token = this.user.uid;
    let header = new HttpHeaders()
      .set("tokenkey", token)
    await this.http.get<UserModell>(this.hostname + "user/get", {headers: header}).toPromise().then(body =>{

      this.userdata = body
        if(body?.isAdmin){
          this.zone.run(() => {
            this.router.navigate(['/admin']);
        });
        }else {
          this.zone.run(() => {
            this.router.navigate(['/main']);
        })
        }
    }).catch(error =>{
      return new Promise((resolve, reject) => {reject();})
    })

  }

  async isLoggedIn() {
    if (this.user)
      return true;

    return false;
  }

  async login(email: string, password: string) {
    await this.auth.signInWithEmailAndPassword(email, password)
    return await this.getUserData()
  }

  async logout() {
    await this.auth.signOut();
  }

  async GoogleAuth() {
    await this.AuthLogin(new GoogleAuthProvider()).catch((error)=>{
      return new Promise((resolve, reject) => {reject();})
    });
  }

  async AuthLogin(provider: any) {
    try {
      const result = await this.auth.signInWithPopup(provider);

      console.log(result)

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
        .set("tokenkey", token).set("isoauth", 'true').set("email", email).set("nickname",nickname).set("firstname", firstname).set("lastname", lastname)
      if(firstlogin){
          await this.http.post(this.hostname + "user/create", header, {headers: header, responseType: 'text'}).toPromise().then(async body =>{
            if (body == null){
              throw new Error() //remeljuk mukodik
            }
            console.log(body)
            console.log("You have been successfully logged in with a new google account!");
            return await this.getUserData() //mukodik
          }).catch(error =>{
            console.log(error)
            console.log("nem sikerult a DB-be letrehozni a usert")
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
        .set("tokenkey", token).set("email", email).set("nickname",nickname).set("firstname", firstname).set("lastname", lastname).set("admin", "false")
      await this.http.post(this.hostname + "user/create", null, {headers: header, responseType: 'text'}).toPromise().then(async body =>{
        console.log(body)
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
        console.log(error)
        console.log("nem sikerult a DB-be letrehozni a usert regnel")
        this.delfromfire()
        return new Promise((resolve, reject) => {reject();}) //tesztre var TODO
      })
    });


  }

  async getAllUsers(){
    try{
      if (!this.user)
        return
      let token = this.user.uid;
      let header = new HttpHeaders()
        .set("tokenkey", token)
      await this.http.get<UserModell[]>(this.hostname + "user/admin/getAllUsers", {headers: header})
        .subscribe(async (body) => {
          this.userList = body;
         this.helperListArray = new Array(body.length);
          await this.bannedUserList();
          body.forEach((user, index) => {
            if(this.bannedUserIDs && this.helperListArray)
            {
              this.helperListArray[index] = this.bannedUserIDs?.includes(user.tokenKey);
            }

          });
        })
    }catch(error){
      console.log(error);
      return new Promise((resolve, reject) => {reject();})
    }
  }



  async bannedUserList() {
    if (!this.user)
      return

    let token = this.user.uid;
    let header = new HttpHeaders().set("tokenkey",token)//json egyből alakítható
    await this.http.get<string[]>(this.hostname + "user/admin/getBannedUsers", {headers: header}).toPromise().then(async body => {
      if (body == null) {
        throw new Error()
      }

      this.bannedUserIDs = body;

    }).catch(error =>{

      console.log(error)
    })

  }

  async delfromfire(){
    this.user?.delete();
  }


}
