import { HttpClient, HttpHeaders } from '@angular/common/http'
import { Component, EventEmitter, OnInit, Output } from '@angular/core'
import { AngularFireAuth } from '@angular/fire/compat/auth'
import { FormControl, FormGroup } from '@angular/forms'
import { catchError } from 'rxjs'
import { AppModule } from '../app.module'
import { Question } from '../models/question'
import { AuthService } from '../services/auth.service'
import { QuestionService } from '../services/question.service'

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

  constructor(protected http: HttpClient, public questionService: QuestionService, protected auth: AngularFireAuth) {
    
   }

  ngOnInit(){
   this.loading=true
    this.auth.onAuthStateChanged((credential) =>{this.userid = credential?.uid;
      this.questionService.getAllQuestion(this.userid).subscribe(body => {
        console.log(body)
       
        this.allquestion = body
        console.log(this.allquestion)
      },(error: any) => {
        let question: Question = {
          category: "Matek",
          question: "Nehez a matek?",
          level: "3",
          answerA: "igen  blabla hosszu szöveg teszt asdasdasdasd  blabla hosszu szöveg teszt asdasdasdasd",
          answerB: "nagyon  blabla hosszu szöveg teszt asdasdasdasd  blabla hosszu szöveg teszt asdasdasdasd",
          answerC: "nem  blabla hosszu szöveg teszt asdasdasdasd  blabla hosszu szöveg teszt asdasdasdasd",
          answerD: "SzabóT megment blabla hosszu szöveg teszt asdasdasdasd  blabla hosszu szöveg teszt asdasdasdasd",
          answerCorrect: "D"
        }
        console.log(error)
        this.allquestion.push(question)
        this.allquestion.push(question)
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
      console.log("Created question in DB")
      console.log(body);
      this.loading=false
    },(error) => {
      console.log(error)
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

  deleteexistingquestion(q: any) {
    console.log(q)
  }

}


