import {Component, OnInit, HostListener, OnDestroy} from '@angular/core';
import {Question} from '../../models/question';
import {GameService} from '../../services/game.service';
import {AuthService} from "../../services/auth.service";
import { Router } from '@angular/router';
import { AnimationEvent } from '@angular/animations';
import { trigger, transition, style, animate , state } from '@angular/animations';
import {EventSourcePolyfill} from "event-source-polyfill";

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

  // Question
  public currentQuestion: Question | undefined;
  public helps: boolean[] = [false, false, false]

  //ChartBoolean
  audienceused: boolean = false

  // Sounds
  private submitAnswerSound = new Audio('../assets/sounds/final_answer.mp3');
  private correctAnswerSound = new Audio('../assets/sounds/correct_answer.mp3');
  private wrongAnswerSound = new Audio('../assets/sounds/wrong_answer.mp3');
  private backgroundMusic = new Audio('../assets/sounds/background_music.mp3');
  private introMusic = new Audio('../assets/sounds/intro_music.mp3');
  public hangero: any

  // Variables for timer
  submitted: boolean = false
  startNum: number = 0
  currentNum: number = 0
  refreshIntervalId: any

  animationState: string = 'rotationEnd';
  diff: number = 1;
  vago: boolean = false;

  private eventSource: EventSourcePolyfill | undefined
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

    let startedquestion = window.localStorage.getItem('startedQuestion')
    let storagehelps = window.localStorage.getItem('helps')
    let diff = window.localStorage.getItem('diff')
    if(startedquestion && storagehelps && diff){
      this.currentQuestion = JSON.parse(startedquestion)
      this.decodeCurrentQuestion()
      this.helps = JSON.parse(storagehelps)
      this.diff = Number(JSON.parse(diff))
    }else{
      this.diff = 1
    this.gameService.evaluateGame(this.userid).then(r => {
      if (!r) {
        //TODO: Error
      } else {
        if (r.win !== undefined) {
           //TODO: Win or lose
        } else if (r.question !== undefined) {
          this.currentQuestion = r.question;
          window.localStorage.setItem('startedQuestion',JSON.stringify(this.currentQuestion))
          window.localStorage.setItem('helps',JSON.stringify(this.helps))
          window.localStorage.setItem('diff',JSON.stringify(this.diff))
          this.decodeCurrentQuestion()
          let timer = window.localStorage.getItem('timer')
          if(timer){
          this.startNum = JSON.parse(timer)
          } else {
            this.startNum = 0
          }
          this.startCountdown()
        } else {
          // TODO: More error
        }
      }
    })}
  }

  setAnswerFont(length: number, answer: String) {
    let answerDiv = document.getElementById('answer' + answer + 'Length');
    if (length >= 80 && answerDiv)
      answerDiv.style.fontSize = "13px";
  }

  decodeCurrentQuestion(){
    if(this.currentQuestion){
    this.currentQuestion.category = decodeURIComponent(this.currentQuestion.category)
    this.currentQuestion.question = decodeURIComponent(this.currentQuestion.question)
    this.currentQuestion.level = decodeURIComponent(this.currentQuestion.level)
    this.currentQuestion.answerA = decodeURIComponent(this.currentQuestion.answerA)
    this.currentQuestion.answerB = decodeURIComponent(this.currentQuestion.answerB)
    this.currentQuestion.answerC = decodeURIComponent(this.currentQuestion.answerC)
    this.currentQuestion.answerD = decodeURIComponent(this.currentQuestion.answerD)
    this.setAnswerFont(this.currentQuestion.answerA.length, "A");
    this.setAnswerFont(this.currentQuestion.answerB.length, "B");
    this.setAnswerFont(this.currentQuestion.answerC.length, "C");
    this.setAnswerFont(this.currentQuestion.answerD.length, "D");
    this.currentQuestion.answerCorrect = decodeURIComponent(this.currentQuestion.answerCorrect)
    }
  }

  // Needs proper implementation -> gets the first question on init
  ngOnInit() {
    let timer = window.localStorage.getItem('timer')

    if(timer){
      this.startNum = JSON.parse(timer)
    } else {
      this.startNum = 0
    }
    this.startCountdown()
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

    let storagehelps = window.localStorage.getItem('helps')
    if(storagehelps){
    this.helps = JSON.parse(storagehelps)
      if(this.helps[0]){
        let button = document.getElementById('halving_help')
        if(button){button.classList.add("disabled")}
        let line = document.getElementById('halving_line')
        if(line){line.hidden = false}
      }
      if(this.helps[1]){
        let button = document.getElementById('group_help')
        if(button){button.classList.add("disabled")}
        let line = document.getElementById('group_line')
        if(line){line.hidden = false}
      }
      if(this.helps[2]){
        let button = document.getElementById('skip_help')
        if(button){button.classList.add("disabled")}
        let line = document.getElementById('skip_line')
        if(line){line.hidden = false}
      }
    }

    let introSkipped = window.localStorage.getItem('introSkipped')
    if(introSkipped == 'true'){
      this.skipIntro()
    }else{
      this.introMusic.play();
    }
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

    if(Math.random() <= 0.25){
      this.vago = true
      setTimeout(() => {
        this.vago = false
      }, 20000);
    }

  }


  setBackgroundColor() {
    let body = document.getElementsByTagName("body")[0];
    if (body)
      body.style.backgroundColor = "#f5ebea";
  }

  // Submit a choice
  async submit() {
    if (this.getAnswer() == 'None') {
      return;
    }

    if (!this.userCanSubmit) {
      return;
    }

    clearInterval(this.refreshIntervalId) // timer stop

    this.submitted = true
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

    await new Promise(f => setTimeout(f, 1000))

    this.gameService.evaluateGame(this.userid, this.getAnswer()).then(async r => {
      if (!r) {
        //TODO: Error
      } else {

        if (r.win !== undefined) {
           //TODO: Win or lose
           window.localStorage.removeItem('startedQuestion')
           window.localStorage.removeItem('helps')
           window.localStorage.removeItem('diff')

          let selected = Array.from(
            document.getElementsByClassName('answer-selected') as HTMLCollectionOf<HTMLElement>,
          );
          if(!r.win.win){
            let correctdiv = document.getElementById('answer' + (r.win.correct ? r.win.correct : ""))
            if(correctdiv){
              correctdiv.style.backgroundColor = "#51dc35";
              let correctdivborder = correctdiv.getElementsByClassName("answer")[0] as HTMLElement;
              if (correctdivborder) {
                correctdivborder.style.borderColor = "#51dc35";
              }
            }
            selected[0].style.backgroundColor = "#ef0d00"
            selected[0].style.borderColor = "#ef0d00";
            this.wrongAnswerSound.play()
            await new Promise(f => setTimeout(f,3333))
          }
          else {
            selected[0].style.backgroundColor = "#51dc35"
            selected[0].style.borderColor = "#51dc35"
          }
            await new Promise(f => setTimeout(f,1500))
            this.gameService.endGame(this.userid, true).then((gamestate)=>{
              selected[0].style.backgroundColor = ""
              if(gamestate){
                if(gamestate.win){
                  window.localStorage.setItem("win",JSON.stringify(gamestate.win))
                  this.setBackgroundColor();
                  this.router.navigateByUrl("/endscreen")
                }}
          })
        } else if (r.question !== undefined) {
          this.diff ++;
          let selected = Array.from(
            document.getElementsByClassName('answer-selected') as HTMLCollectionOf<HTMLElement>,
          );
          selected[0].style.backgroundColor = "#51dc35"
          selected[0].style.borderColor = "#51dc35"

          let backgrounds = Array.from(
            document.getElementsByClassName('answerbackground') as HTMLCollectionOf<HTMLElement>,
          );
          backgrounds.forEach(element => {
            element.style.background = ''
          });

          this.correctAnswerSound.play()
          await new Promise(f => setTimeout(f,1500))
          selected[0].style.backgroundColor = ""
          selected[0].style.borderColor = "#efa044"
          this.backgroundMusic.play()
          this.currentQuestion = r.question;
          window.localStorage.setItem('startedQuestion',JSON.stringify(this.currentQuestion))
          window.localStorage.setItem('diff',JSON.stringify(this.diff))
          this.decodeCurrentQuestion()
          this.clearSelection();
          this.userCanSelect = true;
          this.userCanSubmit = false;
          document.body.style.backgroundColor = "#f5ebea";
          this.submitted = false
          this.startCountdown()
        } else {
          // TODO: More error
        }
      }
    })

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
    window.localStorage.setItem("introSkipped", "true")
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
    this.eventSource?.close()
    this.backgroundMusic.pause()
    this.wrongAnswerSound.play()
    window.localStorage.removeItem('startedQuestion')
    window.localStorage.removeItem('helps')
    window.localStorage.removeItem('diff')
    this.gameService.endGame(this.userid, true).then((gamestate)=>{
      if(gamestate){
        if(gamestate.win){
          window.localStorage.setItem("win",JSON.stringify(gamestate.win))
          this.setBackgroundColor();
          this.router.navigateByUrl("/endscreen")
        }}
    })
  }

  async use_halving() {
    if(this.userid){
      await this.gameService.useHalf(this.userid).then(r => {
        this.currentQuestion = r;
        window.localStorage.setItem('startedQuestion',JSON.stringify(this.currentQuestion))
        this.decodeCurrentQuestion()
        this.helps[0] = true
        window.localStorage.setItem('helps',JSON.stringify(this.helps))

        let button = document.getElementById('halving_help')
        if(button){button.classList.add("disabled")}
        let line = document.getElementById('halving_line')
        if(line){line.hidden = false}

        if(this.audienceused){
          if(this.currentQuestion?.answerA == ''){
            this.animatedchart('chartA', 'answerA', 0, 0)}
          if(this.currentQuestion?.answerB == ''){
            this.animatedchart('chartB', 'answerB', 0, 0)}
          if(this.currentQuestion?.answerC == ''){
            this.animatedchart('chartC', 'answerC', 0, 0)}
          if(this.currentQuestion?.answerD == ''){
            this.animatedchart('chartD', 'answerD', 0, 0)}
        }
      }).catch(e => {
        //TODO: process error
      });
    }
  }

  async animatedchart(id: string, id2 : string, value: number, timeout: number){
    document.body.style.backgroundColor = "#983630";
    await new Promise(f => setTimeout(f, timeout));
    const animationDuration = 1000; // 1.5 másodperc
    const numSteps = 100;
    const increment = value / numSteps;
    const initialWaitTime = animationDuration / numSteps;
    const lastSteps = 2;


    let chartdiv = document.getElementById(id);
    let answerdiv = document.getElementById(id2)
    if (chartdiv && answerdiv) {
      for (let index = 0; index <= value; index += increment) {
        let waitTime = initialWaitTime;

        // Az utolsó pár lépésnél növelem a várakozási időt
        if (value - index <= lastSteps * increment) {
          const diff = value - index;
          const extraWaitTime = (lastSteps - diff / increment) * initialWaitTime;
          waitTime += extraWaitTime;
        }

        chartdiv.style.setProperty("--bar-value", index + "%");
        answerdiv.style.background = 'linear-gradient(to right, rgba(111,211,20,0.5), rgba(111,211,20,0.5) '+ index + '%, rgba(0,0,0,0) '+ (index == 0 ? 0 : index+5) +'%)'
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

          this.helps[1] = true
          window.localStorage.setItem('helps',JSON.stringify(this.helps))

          let osszeg = (r.guess[0]+r.guess[1]+r.guess[2]+r.guess[3])/100

          this.animatedchart('chartA', 'answerA', r.guess[0]/osszeg, 1000)
          this.animatedchart('chartB', 'answerB', r.guess[1]/osszeg, 1000)
          this.animatedchart('chartC', 'answerC', r.guess[2]/osszeg, 1000)
          this.animatedchart('chartD', 'answerD', r.guess[3]/osszeg, 1000)
        }

        let button = document.getElementById('group_help')
        if(button){button.classList.add("disabled")}
        let line = document.getElementById('group_line')
        if(line){line.hidden = false}
        this.audienceused = true
      }).catch(e => {

        //TODO: process error
      });
    }
  }

  hideModal() {
    let chartModal = document.getElementById("chart-modal");

    if (chartModal)
      chartModal.style.display = "none";
  }

  async use_skip(){
    if(this.userid){
      await this.gameService.useSwitch(this.userid).then(r => {

        if(r){
          this.currentQuestion = r.question
          window.localStorage.setItem('startedQuestion',JSON.stringify(this.currentQuestion))
          this.decodeCurrentQuestion()
          this.helps[2] = true
          window.localStorage.setItem('helps',JSON.stringify(this.helps))
        }

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

        let backgrounds = Array.from(
          document.getElementsByClassName('answerbackground') as HTMLCollectionOf<HTMLElement>,
        );
        backgrounds.forEach(element => {
          element.style.background = ''
        });

        let button = document.getElementById('skip_help')
        if(button){button.classList.add("disabled")}
        let line = document.getElementById('skip_line')
        if(line){line.hidden = false}
      }).catch(e => {

        //TODO: process error
      });
    }
  }

startCountdown() {
  if (this.startNum === 0) {
    return;
  }

  this.currentNum = this.startNum;
  let eCountdown = document.getElementById('countdown')

  if (this.eventSource){
    this.eventSource.close()
  }

  if (eCountdown) {
    eCountdown.textContent = this.currentNum.toString()
    this.eventSource = this.gameService.getTime(this.userid)
    this.eventSource.onmessage = (data) => {
      if (this.currentNum == 0) {
        setTimeout(() => {
          if (!this.submitted)
            this.exitGame();
        }, 1000)
      }

      this.currentNum = Math.floor(data.data / 1000);

      if (eCountdown) {
        eCountdown.textContent = (this.currentNum + 1).toString();
        eCountdown.classList.remove('puffer');
      }
    }
  }
}

giveup(){
  if(this.userid)
  this.gameService.giveUp(this.userid, true).then(gamestate =>{
    if(gamestate){
      if(gamestate.win){
        window.localStorage.removeItem('startedQuestion')
        window.localStorage.removeItem('helps')
        window.localStorage.removeItem('diff')

        window.localStorage.setItem("win",JSON.stringify(gamestate.win))
        this.setBackgroundColor();
        this.router.navigateByUrl("/endscreen")
      }}
  })
}

}
