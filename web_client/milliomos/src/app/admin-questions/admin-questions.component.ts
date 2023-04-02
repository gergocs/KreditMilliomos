import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { Question } from '../models/question';
import { QuestionCategory } from '../models/questionCategory';
import { AuthService } from '../services/auth.service';
import { QuestionService } from '../services/question.service';
import CSVFileValidator from 'csv-file-validator'

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

  public allQuestionCategories: QuestionCategory[] = [];

  categoryForm = new FormGroup({
    category: new FormControl(''),
  });


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
    await this.authservice.isAdmin().then((res) => {
      if (res == false) {
        this.router.navigate(['/main']);
        return;
      }
    });
    this.loading = true;
    let userdatas = window.localStorage.getItem('userdatas');
    if (!userdatas) {
      this.authservice.logout();
      return;
    }

    this.auth.onAuthStateChanged((credential) => {
      this.userid = credential?.uid;
      this.questionService
        .getAllQuestion(this.userid)
        .toPromise()
        .then((body) => {
          if (body) this.allquestion = body;

          this.allquestion.forEach((q) => {
            q.category = decodeURIComponent(q.category);
            q.question = decodeURIComponent(q.question);
            q.answerA = decodeURIComponent(q.answerA);
            q.answerB = decodeURIComponent(q.answerB);
            q.answerC = decodeURIComponent(q.answerC);
            q.answerD = decodeURIComponent(q.answerD);
          });

          this.loading = false;
        })
        .catch((error) => {
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
        });

      this.questionService.getQuestionCategories(this.userid).subscribe(
        (body) => {
          this.allQuestionCategories = body;
          this.allQuestionCategories.forEach((qc) => {
            qc.category = decodeURIComponent(qc.category);
          });
        },
        (error: any) => {
          let qcat: QuestionCategory = {
            category: 'Hiba',
          };
          this.allQuestionCategories.push(qcat);
        }
      );
    });
  }

  async createQuestionCategory() {
    this.loading = true;
    let newQC: QuestionCategory = {
      category: this.categoryForm.get('category')?.value,
    };
    this.questionService.createQuestionCategory(newQC, this.userid).subscribe(
      (body) => {
        if (body == null) {
          throw new Error();
        }
        this.allQuestionCategories.push(newQC);
        this.loading = false;
      },
      (error) => {
        if (error.status == 200) {
          this.allQuestionCategories.push(newQC);
        }
        this.loading = false;
      }
    );
  }

  onCreateQuestion() {
    if (this.questionForm.get('category')?.value == '') return;
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
      if (this.importError) {
        this.Importeditems.length = 0;
        this.importErrorMsg = this.importErrorMsg.substring(
          0,
          this.importErrorMsg.length - 2
        );
        return;
      }
      this.display();
    }
  }

  readFile(inputFile: any): void {
    this.importError = false;
    this.importErrorMsg = '';
    CSVFileValidator<Question>(inputFile, {
      headers: [
        {
          name: 'category',
          inputName: 'category',
          required: true,
          requiredError: function (headerName, rowNumber, columnNumber) {
            return `${headerName} a ${rowNumber}. sorban ${columnNumber}. oszlopban`
          }
        },
        {
          name: 'question',
          inputName: 'question',
          required: true,
          unique: true,
          uniqueError: function (headerName) {
            return `${headerName} nem egyedi`
          },
        },
        {
          name: 'level',
          inputName: 'level',
          required: true,
          requiredError: function (headerName, rowNumber, columnNumber) {
            return `${headerName} a ${rowNumber}. sorban ${columnNumber}. oszlopban`
          }
        },
        {
          name: 'answerA',
          inputName: 'answerA',
          required: true,
          requiredError: function (headerName, rowNumber, columnNumber) {
            return `${headerName} a ${rowNumber}. sorban ${columnNumber}. oszlopban`
          }
        },
        {
          name: 'answerB',
          inputName: 'answerB',
          required: true,
          requiredError: function (headerName, rowNumber, columnNumber) {
            return `${headerName} a ${rowNumber}. sorban ${columnNumber}. oszlopban`
          }
        },
        {
          name: 'answerC',
          inputName: 'answerC',
          required: true,
          requiredError: function (headerName, rowNumber, columnNumber) {
            return `${headerName} a ${rowNumber}. sorban ${columnNumber}. oszlopban`
          }
        },
        {
          name: 'answerD',
          inputName: 'answerD',
          required: true,
          requiredError: function (headerName, rowNumber, columnNumber) {
            return `${headerName} a ${rowNumber}. sorban ${columnNumber}. oszlopban`
          }
        },
        {
          name: 'answerCorrect',
          inputName: 'answerCorrect',
          required: true,
          requiredError: function (headerName, rowNumber, columnNumber) {
            return `${headerName} a ${rowNumber}. sorban ${columnNumber}. oszlopban`
          }
        },
      ],
    }).then(csvData => {
      if (csvData.inValidData.length == 0){
        this.Importeditems = csvData.data;
      } else {
        for (let i = 0;  i < csvData.inValidData.length; i++) {
          this.importErrorMsg += 'Hiba ' + csvData.inValidData[i].message + '| ';
        }

        this.importError = true;
      }
    }).catch(e => {
        this.importErrorMsg += 'Hiba ' + e.error.message + ' |';
        this.importError = true;
    })
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
        this.loading = false;
      });
  }
}
