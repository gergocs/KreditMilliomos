import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { Question } from '../models/question';
import { AuthService } from '../services/auth.service';
import { QuestionService } from '../services/question.service';

@Component({
  selector: 'app-admin-questions',
  templateUrl: './admin-questions.component.html',
  styleUrls: ['./admin-questions.component.scss'],
})
export class AdminQuestionsComponent implements OnInit {
  loading = true;
  public userid: string | undefined;

  public showForm: boolean = false;

  // VARS FOR FILE IMPORT
  public importsVisible: boolean = false;
  public importError: boolean = false;
  public importErrorMsg: string = '';
  public file: any;
  public Importeditems: Question[] = [];

  public hostname: string = 'localhost';

  public allquestion: Question[] = [];

  questionForm = new FormGroup({
    category: new FormControl(''),
    question: new FormControl(''),
    level: new FormControl(''),
    answerA: new FormControl(''),
    answerB: new FormControl(''),
    answerC: new FormControl(''),
    answerD: new FormControl(''),
    correctAnswer: new FormControl(''),
  });

  constructor(
    public router: Router,
    protected http: HttpClient,
    public questionService: QuestionService,
    public auth: AngularFireAuth,
    public authservice: AuthService
  ) {}

  async ngOnInit() {
    this.loading = true;
    let userdatas = window.localStorage.getItem('userdatas');
    if (!userdatas) {
      this.authservice.logout();
      return;
    }

    this.auth.onAuthStateChanged((credential) => {
      this.userid = credential?.uid;
      this.questionService.getAllQuestion(this.userid).subscribe(
        (body) => {
          this.allquestion = body;

          this.allquestion.forEach((q) => {
            q.category = decodeURIComponent(q.category);
            q.question = decodeURIComponent(q.question);
            q.answerA = decodeURIComponent(q.answerA);
            q.answerB = decodeURIComponent(q.answerB);
            q.answerC = decodeURIComponent(q.answerC);
            q.answerD = decodeURIComponent(q.answerD);
          });

          this.loading = false;
        },
        (error: any) => {
          let question: Question = {
            category: 'Hiba',
            question: 'Sikerült az adatbázis elérése?',
            level: '-1',
            answerA: 'Hát nem',
            answerB: 'úgy néz ki.',
            answerC: 'De lehet, hogy még nincs',
            answerD: 'is kérdés az adatbázisban.',
            answerCorrect: 'A',
          };
          this.allquestion.push(question);
          this.loading = false;
        }
      );
    });
  }
  onCreateQuestion() {
    //validity check
    this.loading = true;
    let newQ: Question = {
      category: this.questionForm.get('category')?.value,
      question: this.questionForm.get('question')?.value,
      level: this.questionForm.get('level')?.value.toString(),
      answerA: this.questionForm.get('answerA')?.value,
      answerB: this.questionForm.get('answerB')?.value,
      answerC: this.questionForm.get('answerC')?.value,
      answerD: this.questionForm.get('answerD')?.value,
      answerCorrect: this.questionForm.get('correctAnswer')?.value,
    };
    this.questionService.createQuestion(newQ, this.userid).subscribe(
      (body) => {
        if (body == null) {
          throw new Error();
        }
        this.allquestion.push(newQ);
        this.loading = false;
      },
      (error) => {
        console.log(error);
        if (error.status == 200) {
          this.allquestion.push(newQ);
        }
        this.loading = false;
      }
    );
    this.showForm = false;
  }
  // FILE IMPORT START
  fileChanged(e: any) {
    this.file = e.target.files[0];
  }

  sleep = (ms: any) => new Promise((r) => setTimeout(r, ms));

  async load() {
    if (this.file == undefined) {
      this.importError = true;
      this.importErrorMsg = 'Nincs kiválasztva fájl.';
      return;
    } else {
      this.importError = false;
      this.readFile(this.file);
      await this.sleep(500);
      this.display();
    }
  }

  readFile(inputFile: any): void {
    const fileReader = new FileReader();
    fileReader.readAsText(inputFile);

    fileReader.onload = () => {
      const fileContent = fileReader.result as string;
      const lines = fileContent.split('\n');

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
          answerCorrect: words[7].trim(),
        };
        this.Importeditems.push(obj);
      });
    };
  }

  display(): void {
    this.importError = false;
    this.importsVisible = true;
  }

  async save() {
    if (this.Importeditems.length == 0) return;
    this.loading = true;

    await this.questionService
      .importQuestions(this.Importeditems, this.userid)
      .toPromise()
      .then((body) => {
        if (body == null) {
          throw new Error();
        }
        this.allquestion = this.allquestion.concat(this.Importeditems);
      })
      .catch((error) => {
        console.log(error);
        if (error.status == 200) {
          this.allquestion = this.allquestion.concat(this.Importeditems);
        }
      });
    this.loading = false;
  }

  delete(): void {
    if (this.Importeditems.length != 0) {
      this.Importeditems.splice(0);
    }
    this.importsVisible = false;
  }
  // FILE IMPORT END

  async deleteexistingquestion(q: string, i: number) {
    this.loading = true;
    await this.questionService
      .deleteQuestion(q, this.authservice.user?.uid)
      .then((thing) => {
        this.allquestion.splice(i, 1);
        this.loading = false;
      })
      .catch((err) => {
        console.log(err);
        this.loading = false;
      });
  }
}
