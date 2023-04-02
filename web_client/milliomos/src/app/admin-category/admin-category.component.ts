import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { FormGroup, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { QuestionCategory } from '../models/questionCategory';
import { AuthService } from '../services/auth.service';
import { QuestionService } from '../services/question.service';

@Component({
  selector: 'app-admin-category',
  templateUrl: './admin-category.component.html',
  styleUrls: ['./admin-category.component.scss']
})
export class AdminCategoryComponent implements OnInit {

  loading = true;

  public allQuestionCategories: QuestionCategory[] = []

  categoryForm = new FormGroup({
    category: new FormControl(''),
  })
  userid: string | undefined;

  constructor(
    public router: Router,
    protected http: HttpClient,
    public questionService: QuestionService,
    public auth: AngularFireAuth,
    public authservice: AuthService) { }

    public showForm: boolean = false;

  async ngOnInit(): Promise<void> {
    await this.authservice.isAdmin().then(res => {
      if(res == false){
        this.router.navigate(['/main'])
        return
      }
    })
    this.loading = true;
    let userdatas = window.localStorage.getItem('userdatas');
    if (!userdatas) {
      this.authservice.logout();
      return;
    } else {
      this.userid = JSON.parse(userdatas).tokenKey
    }

    await this.questionService.getQuestionCategories(this.userid).toPromise().then(body =>{
      if(body){
      this.allQuestionCategories = body;
      this.allQuestionCategories.forEach(qc => {
        qc.category = decodeURIComponent(qc.category)
      })
    } else {
      let qcat: QuestionCategory = {
        category: "Hiba",
      }
    }
    this.loading = false
    }).catch((error:any)=>{
    this.loading = false
    let qcat: QuestionCategory = {
      category: "Hiba",
    }
    this.loading = false
    this.allQuestionCategories.push(qcat)
  })
  }


  async createQuestionCategory(){
    this.loading=true
    let newQC: QuestionCategory = {
      category: this.categoryForm.get('category')?.value,
    }
    this.questionService.createQuestionCategory(newQC, this.userid)
    .subscribe(body => {
      if( body == null){
        throw new Error()
      }
      console.log("Created question category in DB")
      console.log(body);
      this.allQuestionCategories.push(newQC);
      this.loading=false
    },(error) => {
      console.log(error)
      if(error.status == 200){
        this.allQuestionCategories.push(newQC);
      }
      this.loading=false
    }
    );
    this.showForm = false;
  }

}
