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

  //ChartBoolean
  audienceused: boolean = false

  // Sounds
  private submitAnswerSound = new Audio('../assets/sounds/final_answer.mp3');
  private correctAnswerSound = new Audio('../assets/sounds/correct_answer.mp3');
  private wrongAnswerSound = new Audio('../assets/sounds/wrong_answer.mp3');
  private backgroundMusic = new Audio('../assets/sounds/background_music.mp3');
  private introMusic = new Audio('../assets/sounds/intro_music.mp3');
  public hangero: any

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
    let hangero2 = window.localStorage.getItem('hangero')
    if(hangero2){
      
      this.hangero = JSON.parse(hangero2)
    } else{
      this.hangero = 50
    }
    this.backgroundMusic.loop = true
    this.submitAnswerSound.volume=this.hangero/100;
    this.correctAnswerSound.volume=this.hangero/100;
    this.wrongAnswerSound.volume=this.hangero/100;
    this.backgroundMusic.volume=this.hangero/100;
    this.introMusic.volume=this.hangero/100;
    this.introMusic.play();
  }

  onVolumeChange(volume: any){
    this.hangero = volume
    window.localStorage.setItem("hangero",JSON.stringify(this.hangero))
    this.submitAnswerSound.volume=this.hangero/100;
    this.correctAnswerSound.volume=this.hangero/100;
    this.wrongAnswerSound.volume=this.hangero/100;
    this.backgroundMusic.volume=this.hangero/100;
    this.introMusic.volume=this.hangero/100;
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
        if(this.currentQuestion?.answerA === ""){break}
        this.clearSelection();
        this.selectedA = true;
        this.userCanSubmit = true;
        break;

      case 'b':
        if(this.currentQuestion?.answerB === ""){break}
        this.clearSelection();
        this.selectedB = true;
        this.userCanSubmit = true;
        break;

      case 'c':
        if(this.currentQuestion?.answerC === ""){break}
        this.clearSelection();
        this.selectedC = true;
        this.userCanSubmit = true;
        break;

      case 'd':
        if(this.currentQuestion?.answerD === ""){break}
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
        if(this.currentQuestion?.answerA === ""){break}
        this.clearSelection();
        this.selectedA = true;
        this.userCanSubmit = true;
        break;

      case 'B':
        if(this.currentQuestion?.answerB === ""){break}
        this.clearSelection();
        this.selectedB = true;
        this.userCanSubmit = true;
        break;

      case 'C':
        if(this.currentQuestion?.answerC === ""){break}
        this.clearSelection();
        this.selectedC = true;
        this.userCanSubmit = true;
        break;

      case 'D':
        if(this.currentQuestion?.answerD === ""){break}
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

    for (let index = 0; index <= 20; index++) {
      setTimeout(() => {
        let chartdiv = document.getElementById('chart')
        if(chartdiv){
        chartdiv.style.width = 20-index + "%"}
        if(index == 20){
          this.audienceused = false
        }
      }, index * 40);
    }

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

          let backgrounds = Array.from(
            document.getElementsByClassName('answerbackground') as HTMLCollectionOf<HTMLElement>,
          );
          backgrounds.forEach(element => {
            element.style.background = ''
          });

          this.correctAnswerSound.play()
          await new Promise(f => setTimeout(f,1500))
          selected[0].style.backgroundColor = ""
          this.backgroundMusic.play()
          this.currentQuestion = r.question;
          this.clearSelection();
          this.userCanSelect = true;
          this.userCanSubmit = false;
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

  async use_halving() {
    if(this.userid){
      await this.gameService.useHalf(this.userid).then(r => {
        this.currentQuestion = r;

        let button = document.getElementById('halving_help')
        if(button){button.classList.add("disabled")}
        let line = document.getElementById('halving_line')
        if(line){line.hidden = false}
      }).catch(e => {
        console.log(e);
        //TODO: process error
      });
    }
  }

  async animatedchart(id: string, id2 : string, value: number){
    await new Promise(f => setTimeout(f, 1000));
    const animationDuration = 1000; // 1.5 másodperc
    const numSteps = 100;
    const increment = value / numSteps;
    const initialWaitTime = animationDuration / numSteps;
    const lastSteps = 2;
  
    let chartdiv = document.getElementById(id);
    let answerdiv = document.getElementById(id2)
    if (chartdiv && answerdiv) {
      for (let index = 0; index < value; index += increment) {
        let waitTime = initialWaitTime;
  
        // Az utolsó pár lépésnél növelem a várakozási időt
        if (value - index <= lastSteps * increment) {
          const diff = value - index;
          const extraWaitTime = (lastSteps - diff / increment) * initialWaitTime;
          waitTime += extraWaitTime;
        }
  
        chartdiv.style.setProperty("--bar-value", index + "%");
        answerdiv.style.background = 'linear-gradient(to right, rgba(111,211,20,0.5), rgba(111,211,20,0.5) '+ index + '%, rgba(0,0,0,0) '+ (index+5) +'%)'
        await new Promise(f => setTimeout(f, waitTime));
      }
    }
  }

  async use_audience(){
    if(this.userid){
      await this.gameService.useAudience(this.userid).then(async r => {

        if(r && r.guess){
          
            for (let index = 0; index <= 20; index++) {
              setTimeout(() => {
                let chartdiv = document.getElementById('chart')
                if(chartdiv){
                chartdiv.style.width = index + "%"}
              }, index * 20);
            }

          

          let osszeg = (r.guess[0]+r.guess[1]+r.guess[2]+r.guess[3])/100
          
          this.animatedchart('chartA', 'answerA', r.guess[0]/osszeg)
          this.animatedchart('chartB', 'answerB', r.guess[1]/osszeg)
          this.animatedchart('chartC', 'answerC', r.guess[2]/osszeg)
          this.animatedchart('chartD', 'answerD', r.guess[3]/osszeg)
        }

        let button = document.getElementById('group_help')
        if(button){button.classList.add("disabled")}
        let line = document.getElementById('group_line')
        if(line){line.hidden = false}
        this.audienceused = true
      }).catch(e => {
        console.log(e);

        //TODO: process error
      });
    }
  }

  async use_skip(){
    if(this.userid){
      await this.gameService.useSwitch(this.userid).then(r => {

        if(r){
        this.currentQuestion = r.question}

        let button = document.getElementById('skip_help')
        if(button){button.classList.add("disabled")}
        let line = document.getElementById('skip_line')
        if(line){line.hidden = false}
      }).catch(e => {
        console.log(e);

        //TODO: process error
      });
    }
  }
}
