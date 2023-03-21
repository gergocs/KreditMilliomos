import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { UserModell } from '../models/usermodell';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {

  loading: Boolean = false

  userdata: UserModell | undefined

  updateForm = new FormGroup({
    username: new FormControl(''),
    firstName: new FormControl(''),
    lastName: new FormControl('')
  });
  
  constructor(public router: Router, private auth: AuthService) { }

  ngOnInit(): void {
    let userdatas = window.localStorage.getItem("userdatas")
    if (userdatas){
      this.userdata = JSON.parse(userdatas)
      let userdata = JSON.parse(userdatas)
      this.updateForm.get('username')?.setValue(decodeURIComponent(userdata.name))
      this.updateForm.get('firstName')?.setValue(decodeURIComponent(userdata.firstName))
      this.updateForm.get('lastName')?.setValue(decodeURIComponent(userdata.lastName))
    } else {
      this.router.navigate(['/login']);
  }
  }

  redirectToLobby(){
    this.router.navigate(['/lobby']);
  }

  async updateuser(){
    if (!this.userdata)
    return
    this.userdata.name = this.updateForm.get("username")?.value
    this.userdata.firstName = this.updateForm.get("firstName")?.value
    this.userdata.lastName = this.updateForm.get("lastName")?.value

    this.loading = true
    await this.auth.updateuser(this.userdata).then(body => {
      console.log("sikeres frissités")
      console.log(body)
      window.localStorage.setItem("userdatas", JSON.stringify(this.userdata))
      this.loading = false
    }).catch(err =>{
      console.log(err)
      this.loading = false
    })
  }

}
