import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { GameService } from '../services/game.service';

@Component({
  selector: 'app-lobby',
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.scss'],
})
export class LobbyComponent implements OnInit {
  public userid: string | undefined;

  constructor(
    protected router: Router,
    protected gameService: GameService,
    protected auth: AuthService,
    protected authservice: AuthService
  ) {}

  ngOnInit(): void {
    let userdatas = window.localStorage.getItem("userdatas")
    if(!userdatas){
      this.authservice.logout()
      return
    }
    this.userid = JSON.parse(userdatas).tokenKey;
  }

  // Needs proper implementation
  startNewGame(category: String, difficulty: String) {
    // Hande errors
    if (
      category == 'Kategória választása' ||
      difficulty == 'Nehézség választása'
    ) {
      alert('Válassz nehézséget és kategóriát!');
      return;
    }

    // Start new game
    console.log(this.userid);
    this.gameService.startNewGame(category, difficulty, <string>this.userid).then(r => {
      this.router.navigate(['/game']);
    });
  }
}
