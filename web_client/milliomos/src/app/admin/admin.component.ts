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

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})

export class AdminPageComponent implements OnInit {
  loading = true
  public userid: string | undefined

  public showForm: boolean = false;

  public visible: boolean = false
  public error: boolean = false
  public errorMsg: string = ""
  public hostname: string = "localhost"

  public file: any
  public items: any[] = []

  public allquestion: Question[] = []

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

  constructor(public router: Router,protected http: HttpClient, public questionService: QuestionService, public auth: AngularFireAuth, public authservice : AuthService, private modalService: NgbModal) {

   }

  ngOnInit(){
   this.loading=true
    this.authservice.getAllUsers()
    this.auth.onAuthStateChanged((credential) =>{this.userid = credential?.uid;
      this.questionService.getAllQuestion(this.userid).subscribe(body => {
        this.allquestion = body
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
          answerCorrect: "answerA"
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
      console.log("Created question in DB")
      console.log(body);
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

  fileChanged(e: any) {
    this.file = e.target.files[0]
  }

  load() {
    if(this.file == undefined){
      this.error = true
      this.errorMsg = "Nincs fájl kiválasztva!"
      return
    }
    else{
      this.error = false
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
        const obj = {
          category: words[0],
          question: words[1],
          level: words[2],
          a1: words[3],
          a2: words[4],
          a3: words[5],
          a4: words[6],
          correct: words[7]
        }
        this.items.push(obj)
      });
    };
  }

  display(): void{
    // Error handling
    if(this.items.length == 0){
      this.error = true
      this.visible = false
      this.errorMsg = "Még nincsennek kérdések betöltve!"
      return
    }
    else{
      this.error = false
      this.visible = true
    }
  }

  save(): void{
    if(this.items.length == 0) return

    this.items.forEach((item: any) => {
      console.log(item)
    })
  }

  delete(): void{
    if(this.items.length != 0){
     this.items.splice(0)
    }
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
          await this.http.post((this.hostname == "localhost" ? "http://localhost:8080/" : "https://kreditmilliomos.mooo.com:80/") + "user/admin/ban", body, {
            headers: header,
            responseType: 'text'
          }).toPromise().then(async body => {


            if (body == null) {
              throw new Error()
            }
            this.loading = false;
            this.authservice.helperListArray[i] = !this.authservice.helperListArray[i];
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


