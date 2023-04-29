import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import { QuestionCategory } from '../../models/questionCategory';
import { AuthService } from '../../services/auth.service';
import { GameService } from '../../services/game.service';
import { QuestionService } from '../../services/question.service';

@Component({
  selector: 'app-lobby',
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.scss'],
})
export class LobbyComponent implements OnInit {
  public userid: string | undefined;
  public allQuestionCategories: QuestionCategory[] = []
  time: number = 60;
  loading: boolean = true

  constructor(
    protected router: Router,
    protected gameService: GameService,
    protected auth: AuthService,
    protected authservice: AuthService,
    protected questionService: QuestionService
  ) {}

  ngOnInit(): void {
    let userdatas = window.localStorage.getItem("userdatas")
    if(!userdatas){
      this.authservice.logout()
      return
    }
    this.userid = JSON.parse(userdatas).tokenKey;

    this.questionService.getPlayableQuestionCategories(this.userid).subscribe(body =>{
      this.allQuestionCategories = body;
      this.allQuestionCategories.forEach(qc => {
        qc.category = decodeURIComponent(qc.category)
      })
      this.loading = false
  },(error:any)=>{
    let qcat: QuestionCategory = {
      category: "Hiba",
    }
    this.allQuestionCategories.push(qcat)
    this.loading = false
  })
  }

  public difficulty: string = '0';

  mouseClick(what: number) {
    switch (what) {
      case 0:
        this.difficulty = '0';
        break;

      case 1:
        this.difficulty = '1';
        break;

      case 2:
        this.difficulty = '2';
        break;
    }
  }

  // Needs proper implementation
  startNewGame(category: String) {
    // Hande errors
    if (category == 'Válassz kategóriát') {
      alert('Kérlek válassz kategóriát!');
      return;
    }

    if(window.localStorage.getItem('startedQuestion')){
      alert('Egy játék már folyamatban van!');
      this.router.navigate(['/game']);
    }else{
      window.localStorage.setItem('timer',JSON.stringify(this.time))
    // Start new game
    this.gameService.startNewGame(category, this.difficulty, this.time === 0 ? NaN : this.time, <string>this.userid).then(r => {
      this.router.navigate(['/game']);
    });
  }}
}
