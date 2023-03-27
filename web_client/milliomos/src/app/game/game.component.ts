import {Component, OnInit, HostListener, OnDestroy} from '@angular/core';
import {Question} from '../models/question';
import {GameService} from '../services/game.service';
import {AuthService} from "../services/auth.service";
import { Router } from '@angular/router';
import { AnimationEvent } from '@angular/animations';
import { trigger, transition, style, animate , state } from '@angular/animations';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss'],
  animations: [
    trigger('dotRotate', [
      state('void', style({
        transform: 'rotate(0deg) scale(100%)',
      })),
      state('rotationEnd', style({
        transform: 'rotate(360deg) scale(100%)',
      })),
      state('scaleStart', style({
        transform: 'rotate(360deg) scale(250%)',
      })),
      state('scaleEnd', style({
        transform: 'rotate(360deg) scale(250%)'
      })),
      transition('void => rotationEnd', [
        animate('15.15s')
      ]),
      transition('rotationEnd => scaleStart', [
        animate('3s')
      ]),
      transition('scaleStart => scaleEnd', [
        animate('1s')
      ])
    ])
  ]
})
export class GameComponent implements OnInit, OnDestroy {
  // User data
  public userid: string | undefined;

  // Selections
  public selectedA: Boolean = false;
  public selectedB: Boolean = false;
  public selectedC: Boolean = false;
  public selectedD: Boolean = false;

  // Restrictions for user
  public userCanSelect: Boolean = true; // Wait for the first question to load, then set it to true
  public userCanSubmit: Boolean = false; // If no answer selected, or already submitted, this should be false

  // Question - temporary only for testing
  public currentQuestion: Question | undefined;

  // Sounds
  private submitAnswerSound = new Audio('../assets/sounds/final_answer.mp3');
  private correctAnswerSound = new Audio('../assets/sounds/correct_answer.mp3');
  private wrongAnswerSound = new Audio('../assets/sounds/wrong_answer.mp3');
  private backgroundMusic = new Audio('../assets/sounds/background_music.mp3');
  private introMusic = new Audio('../assets/sounds/intro_music.mp3');

  animationState: string = 'rotationEnd';
  constructor(
    protected auth: AuthService,
    protected gameService: GameService,
    protected router: Router
  ) {
    let userdatas = window.localStorage.getItem("userdatas")
    if(!userdatas){
      this.auth.logout()
      return
    }
    this.userid = JSON.parse(userdatas).tokenKey
    this.gameService.evaluateGame(this.userid).then(r => {
      if (!r) {
        //TODO: Error
      } else {
        if (r.win !== undefined) {
          console.log(r.win) //TODO: Win or lose
        } else if (r.question !== undefined) {
          this.currentQuestion = r.question;
        } else {
          // TODO: More error
        }
      }
    })
  }

  // Needs proper implementation -> gets the first question on init
  ngOnInit() {
    this.backgroundMusic.loop = true
    this.submitAnswerSound.volume=0.05;
    this.correctAnswerSound.volume=0.05;
    this.wrongAnswerSound.volume=0.05;
    this.backgroundMusic.volume=0.1;
    this.introMusic.volume=0.05;
    this.introMusic.play();
  }

  // Handle keyboard input
  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (!this.userCanSelect) return;
    switch (event.key) {
      case 'Enter':
        this.submit();
        break;

      case 'a':
        this.clearSelection();
        this.selectedA = true;
        this.userCanSubmit = true;
        break;

      case 'b':
        this.clearSelection();
        this.selectedB = true;
        this.userCanSubmit = true;
        break;

      case 'c':
        this.clearSelection();
        this.selectedC = true;
        this.userCanSubmit = true;
        break;

      case 'd':
        this.clearSelection();
        this.selectedD = true;
        this.userCanSubmit = true;
        break;
    }
  }

  // Handle mouse selection
  mouseClick(what: String) {
    if (!this.userCanSelect) return;
    switch (what) {
      case 'A':
        this.clearSelection();
        this.selectedA = true;
        this.userCanSubmit = true;
        break;

      case 'B':
        this.clearSelection();
        this.selectedB = true;
        this.userCanSubmit = true;
        break;

      case 'C':
        this.clearSelection();
        this.selectedC = true;
        this.userCanSubmit = true;
        break;

      case 'D':
        this.clearSelection();
        this.selectedD = true;
        this.userCanSubmit = true;
        break;
    }
  }

  // Submit a choice
  async submit() {
    if (this.getAnswer() == 'None') {
      console.log('No answer selected');
      return;
    }

    if (!this.userCanSubmit) {
      console.log("You can't submit your answer!");
      return;
    }
    this.userCanSelect = false;
    this.userCanSubmit = false;
    this.backgroundMusic.pause()
    this.submitAnswerSound.play().then(() => {
    });

    await new Promise(f => setTimeout(f, 5000))

    this.gameService.evaluateGame(this.userid, this.getAnswer()).then(async r => {
      if (!r) {
        //TODO: Error
      } else {
        if (r.win !== undefined) {
          console.log(r.win) //TODO: Win or lose
          let selected = Array.from(
            document.getElementsByClassName('answer-selected') as HTMLCollectionOf<HTMLElement>,
          );
          if(!r.win){
            selected[0].style.backgroundColor = "red"
            this.wrongAnswerSound.play()}
          else {
            selected[0].style.backgroundColor = "green"
          }
            await new Promise(f => setTimeout(f,1500))
            this.gameService.endGame(this.userid, true).then(()=>{
              selected[0].style.backgroundColor = ""
            this.router.navigateByUrl("/lobby")
          })
        } else if (r.question !== undefined) {
          let selected = Array.from(
            document.getElementsByClassName('answer-selected') as HTMLCollectionOf<HTMLElement>,
          );
          selected[0].style.backgroundColor = "green"
          this.correctAnswerSound.play()
          await new Promise(f => setTimeout(f,1500))
          selected[0].style.backgroundColor = ""
          this.backgroundMusic.play()
          this.currentQuestion = r.question;
          this.clearSelection();
          this.userCanSelect = true;
          this.userCanSubmit = false;
          console.log(this.currentQuestion)
        } else {
          console.log(r);
          // TODO: More error
        }
      }
    })
    console.log(`Answer [${this.getAnswer()}] was submitted!`);

  }

  // Get selected answer
  getAnswer() {
    if (this.selectedA) return 'A';
    if (this.selectedB) return 'B';
    if (this.selectedC) return 'C';
    if (this.selectedD) return 'D';
    return 'None';
  }
  ngOnDestroy(){
    this.backgroundMusic.pause();
}
  // Clean previous selection
  clearSelection() {
    this.selectedA = false;
    this.selectedB = false;
    this.selectedC = false;
    this.selectedD = false;
  }

  alreadyspeeched: boolean = false
  async skipIntro() {
    let introBox = document.getElementById('introBox');
    if (introBox) {
      introBox.style.display = "none";
    }
    this.introMusic.pause();

    let userdatas = window.localStorage.getItem("userdatas")
    if (userdatas && !this.alreadyspeeched) {
      this.alreadyspeeched = true
      var to_speak = new SpeechSynthesisUtterance('A stúdióban Vágó István és' + decodeURI(JSON.parse(userdatas).name));
      to_speak.volume=0.6;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(to_speak);
      await new Promise(f => setTimeout(f, 2500))
    }

    this.backgroundMusic.play();

  }

  introDone(event:AnimationEvent) {
    if(this.alreadyspeeched){return}
    console.log(event);
    if(event.toState == "rotationEnd"){
      this.animationState = "scaleStart"
    }
    if(event.toState == "scaleStart"){
      this.animationState = "scaleEnd"
    }
    if(event.toState == "scaleEnd"){
      this.skipIntro()
    }
  }

  // Exit game code
  exitGame() {
    this.backgroundMusic.pause()
    this.wrongAnswerSound.play()
    this.gameService.endGame(this.userid, true).then(()=>{
      this.router.navigateByUrl("/lobby")
    })
  }
}
