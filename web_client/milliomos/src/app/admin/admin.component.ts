import { HttpClient, HttpHeaders } from '@angular/common/http'
import { Component, EventEmitter, Inject, OnInit, Output } from '@angular/core'
import { AngularFireAuth } from '@angular/fire/compat/auth'
import { FormControl, FormGroup } from '@angular/forms'
import { Router } from '@angular/router'
import { catchError } from 'rxjs'
import { AppModule } from '../app.module'
import { Question } from '../models/question'
import { AuthService } from '../services/auth.service'
import { QuestionService } from '../services/question.service'
import {MatIconModule} from '@angular/material/icon';
import {ConfirmationDialogComponent} from "../confirmation-dialog/confirmation-dialog.component";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import { waitForAsync } from '@angular/core/testing'
import { UserModell } from '../models/usermodell'
import { QuestionCategory } from '../models/questionCategory'

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})

export class AdminPageComponent implements OnInit {
  loading = true
  public userid: string | undefined

  public showForm: boolean = false;

  // VARS FOR FILE IMPORT
  public importsVisible: boolean = false
  public importError: boolean = false
  public importErrorMsg: string = ""
  public file: any
  public Importeditems: Question[] = []

  public hostname: string = "localhost"

  public allquestion: Question[] = []
  public allQuestionCategories: QuestionCategory[] = []

  categoryForm = new FormGroup({
    category: new FormControl(''),
  }) 

  questionForm = new FormGroup({
    category: new FormControl(''),
    question: new FormControl(''),
    level: new FormControl(''),
    answerA: new FormControl(''),
    answerB: new FormControl(''),
    answerC: new FormControl(''),
    answerD: new FormControl(''),
    correctAnswer: new FormControl('')
  });

  userList: UserModell[] | undefined
  helperListArray: boolean[] = new Array(1);
  bannedUserIDs: string[] | undefined

  constructor(public router: Router,protected http: HttpClient, public questionService: QuestionService, public auth: AngularFireAuth, public authservice : AuthService, private modalService: NgbModal) {

   }

  async ngOnInit(){
   this.loading=true
    let userdatas = window.localStorage.getItem("userdatas")
    if(!userdatas){
      this.authservice.logout()
      return
    }

    await this.authservice.getAllUsers(JSON.parse(userdatas).tokenKey).then(async (body) => {
      if(!body)
      return

      this.userList = body;

      this.userList.forEach(u=>{
        u.name = decodeURIComponent(u.name)
        u.firstName = decodeURIComponent(u.firstName)
        u.lastName = decodeURIComponent(u.lastName)
        u.email = decodeURIComponent(u.email)
      })

      this.helperListArray = new Array(body.length);
      await this.authservice.bannedUserList().then(async body => {
        if (body == null) {
          throw new Error()
        }
  
        this.bannedUserIDs = body;
  
      }).catch(error =>{
  
        console.log(error)
      })


      body.forEach((user, index) => {
        if(this.bannedUserIDs && this.helperListArray)
        {
          this.helperListArray[index] = this.bannedUserIDs?.includes(user.tokenKey);
        }

      });
      this.loading=false
    }).catch(err =>{
      console.log(err)
      this.loading=false
    })




    this.auth.onAuthStateChanged((credential) =>{this.userid = credential?.uid;
      this.questionService.getQuestionCategories(this.userid).subscribe(body =>{
          this.allQuestionCategories = body;
          this.allQuestionCategories.forEach(qc => {
            qc.category = decodeURIComponent(qc.category)
          })
      },(error:any)=>{
        let qcat: QuestionCategory = {
          category: "Hiba",
        }
        this.allQuestionCategories.push(qcat)
      })
      this.questionService.getAllQuestion(this.userid).subscribe(body => {
        this.allquestion = body

        this.allquestion.forEach(q => {
          q.category = decodeURIComponent(q.category)
          q.question = decodeURIComponent(q.question)
          q.answerA = decodeURIComponent(q.answerA)
          q.answerB = decodeURIComponent(q.answerB)
          q.answerC = decodeURIComponent(q.answerC)
          q.answerD = decodeURIComponent(q.answerD)
        })

        this.loading=false

      },(error: any) => {
        let question: Question = {
          category: "Hiba",
          question: "Sikerült az adatbázis elérése?",
          level: "-1",
          answerA: "Hát nem",
          answerB: "úgy néz ki.",
          answerC: "De lehet, hogy még nincs",
          answerD: "is kérdés az adatbázisban.",
          answerCorrect: "A"
        }
        this.allquestion.push(question)
        this.loading=false
      })
    })



  }

  

  onCreateQuestion() {
    //validity check
    this.loading=true
    let newQ: Question = {
      category: this.questionForm.get('category')?.value,
      question: this.questionForm.get('question')?.value,
      level: this.questionForm.get('level')?.value.toString(),
      answerA: this.questionForm.get('answerA')?.value,
      answerB: this.questionForm.get('answerB')?.value,
      answerC: this.questionForm.get('answerC')?.value,
      answerD: this.questionForm.get('answerD')?.value,
      answerCorrect: this.questionForm.get('correctAnswer')?.value
    }
    this.questionService.createQuestion(newQ, this.userid)
    .subscribe(body => {
      if( body == null){
        throw new Error()
      }
      this.allquestion.push(newQ);
      this.loading=false
    },(error) => {
      console.log(error)
      if(error.status == 200){
        this.allquestion.push(newQ);
      }
      this.loading=false
    }
    );
  }
// FILE IMPORT START
  fileChanged(e: any) {
    this.file = e.target.files[0]
  }

  load() {
    if(this.file == undefined){
      this.importError = true
      this.importErrorMsg = "Nincs fájl kiválasztva!"
      return
    }
    else{
      this.importError = false
      this.readFile(this.file)
    }

  }

  readFile(inputFile: any): void {
    const fileReader = new FileReader()
    fileReader.readAsText(inputFile)

    fileReader.onload = () => {
      const fileContent = fileReader.result as string
      const lines = fileContent.split('\n')

      lines.forEach((line: string) => {
        const words = line.split(';');
        const obj: Question = {
          category: words[0],
          question: words[1],
          level: words[2],
          answerA: words[3],
          answerB: words[4],
          answerC: words[5],
          answerD: words[6],
          answerCorrect: words[7].trim()
        }
        this.Importeditems.push(obj)
      });
    };
  }

  display(): void{
    // Error handling
    if(this.Importeditems.length == 0){
      this.importError = true
      this.importsVisible = false
      this.importErrorMsg = "Még nincsennek kérdések betöltve!"
      return
    }
    else{
      this.importError = false
      this.importsVisible = true
    }
  }

  async save(){
    if(this.Importeditems.length == 0) return
    this.loading=true


      await this.questionService.importQuestions(this.Importeditems, this.userid).toPromise().then(body => {
        if( body == null){
          throw new Error()
        }
        this.allquestion= this.allquestion.concat(this.Importeditems)
      }).catch(error => {
        console.log(error)
        if(error.status == 200){
          this.allquestion= this.allquestion.concat(this.Importeditems)
        }
      })
    this.loading=false
  }

  delete(): void{
    if(this.Importeditems.length != 0){
     this.Importeditems.splice(0)
    }
  }
// FILE IMPORT END

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
  }

  async deleteexistingquestion(q: string, i: number) {
    this.loading=true
    await this.questionService.deleteQuestion(q, this.authservice.user?.uid).then(thing =>{
      this.allquestion.splice(i, 1)
      this.loading=false
    }).catch(err => {
      console.log(err)
      this.loading=false
    })
  }


  async banUser(tokenKey: string, disable: boolean,i: number) {
    let text = "Biztosan " +( disable ? "bannolni akarod" : "fel akarod oldani" )+ "?";
    await this.confirm(text,tokenKey).then(async confirmed => {
      if (confirmed) {
        this.loading = true;
        if (this.userid) {
          let body = {
            isBan: disable,
            tokenkey: tokenKey
          }
          let header = new HttpHeaders().set("tokenkey", this.userid)
          await this.http.put((location.hostname == "localhost" ? "http://localhost:8080/" : "https://kreditmilliomos.mooo.com:80/") + "user/admin/ban", body, {
            headers: header,
            responseType: 'text'
          }).toPromise().then(async body => {


            if (body == null) {
              throw new Error()
            }
            this.loading = false;
            this.helperListArray[i] = !this.helperListArray[i];
          }).catch(error => {
            this.loading = false;
            console.log(error)
          })
        }
      }

    }).catch(error=>{return})

  }
  public confirm(
    title: string,
    message: string,
    btnOkText: string = 'OK',
    btnCancelText: string = 'Cancel',
    dialogSize: 'sm'|'lg' = 'sm'): Promise<boolean> {
    const modalRef = this.modalService.open(ConfirmationDialogComponent, { size: dialogSize });
    modalRef.componentInstance.title = title;
    modalRef.componentInstance.message = message;
    modalRef.componentInstance.btnOkText = btnOkText;
    modalRef.componentInstance.btnCancelText = btnCancelText;

    return modalRef.result;
  }
}


