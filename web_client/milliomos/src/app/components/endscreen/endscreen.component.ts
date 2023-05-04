import {Component, OnDestroy, OnInit} from '@angular/core';
import {ScoreService} from '../../services/score.service';
import {AuthService} from "../../services/auth.service";

@Component({
  selector: 'app-endscreen',
  templateUrl: './endscreen.component.html',
  styleUrls: ['./endscreen.component.scss']
})
export class EndscreenComponent implements OnInit, OnDestroy {

  win: any;
  winDifficulty: string = ""
  time: string = ""
  level: number = 0
  eredmeny: string = ''
  easteregg: boolean = false
  kredit = 0
  oldKredit = 0
  winCounter = 0
  oldWinCounter = 0
  game = 0
  oldGame = 0
  gameLevel = 0
  winLevel = 0
  kreditLevel = 0

  constructor(private scoreService: ScoreService, private auth: AuthService) {
  }

  ngOnInit(): void {
    if (Math.random() < 0.05) {
      this.easteregg = true
    }

    let win1 = window.localStorage.getItem("win");

    let uid = this.auth.user?.uid

    if (uid) {
      this.scoreService.getAchievementStatus(uid).then(r => {
        r.subscribe(async data => {
          // @ts-ignore
          for (const entry of Object.entries(data.result)) {
            // @ts-ignore
            console.log(entry[0], entry[1])
            if (entry[0] === 'achievements') {
              let array = JSON.parse(<string>entry[1])
              for (let i = 0; i < array.length; i++) {
                if (array[i].includes('Games')) {
                  this.onAchievement('Játék', array[i].substr(0, 3))
                } else if (array[i].includes('Kredit')) {
                  this.onAchievement('Kredit', array[i].substr(0, 3))
                } else if (array[i].includes('win')) {
                  this.onAchievement('Győzelem', array[i].substr(0, 3))
                } else if (array[i].includes('level5')) {
                  this.onAchievement('5-ös szint', '')
                } else if (array[i].includes('level10')) {
                  this.onAchievement('10-es szint', '')
                } else if (array[i].includes('level15')) {
                  this.onAchievement('15-es szint', '')
                } else {
                  //TODO category
                }

                await new Promise(resolve => setTimeout(resolve, 12000));
              }
            } else if (entry[0] === 'kredit') {
              this.kredit = Number(entry[1]);
            } else if (entry[0] === 'oldKredit') {
              this.oldKredit = Number(entry[1]);
            } else if (entry[0] === 'game') {
              this.game = Number(entry[1]);
              this.oldGame = this.game - 1;
            } else if (entry[0] === 'win') {
              this.winCounter = Number(entry[1]);
            } else if (entry[0] === 'oldWin') {
              this.oldWinCounter = Number(entry[1]);
            } else if (entry[0] === 'kreditLevel') {
              this.kreditLevel = Number(entry[1]);
            } else if (entry[0] === 'gameLevel') {
              this.gameLevel = Number(entry[1]);
            } else if (entry[0] === 'winLevel') {
              this.winLevel = Number(entry[1]);
            }
          }

          this.kredit = this.mapValueInRange(this.kredit, this.kreditLevel,
            this.kreditLevel === 0 ?
              100 : this.kreditLevel === 100 ?
                500 : 999)

          this.oldKredit = this.mapValueInRange(this.oldKredit, this.kreditLevel,
            this.kreditLevel === 0 ?
              100 : this.kreditLevel === 100 ?
                500 : 999)

          this.game = this.mapValueInRange(this.game, this.gameLevel,
            this.gameLevel === 0 ?
              30 : this.gameLevel === 30 ?
                60 : 90)

          this.oldGame = this.mapValueInRange(this.oldGame, this.gameLevel,
            this.gameLevel === 0 ?
              30 : this.gameLevel === 30 ?
                60 : 90)

          this.winCounter = this.mapValueInRange(this.winCounter, this.winLevel,
            this.winLevel === 0 ?
              10 : this.winLevel === 10 ?
                50 : 99)

          this.oldWinCounter = this.mapValueInRange(this.oldWinCounter, this.winLevel,
            this.winLevel === 0 ?
              10 : this.winLevel === 10 ?
                50 : 99)
        })
      })
    }


    if (win1) {
      this.win = JSON.parse(win1);
      this.winDifficulty = this.win.difficulty == 0 ? 'Könnyű' : this.win.difficulty == 1 ? 'Közepes' : 'Nehéz';
      this.win.time = this.win.time / 1000
      let perc = Math.floor(this.win.time / 60)
      this.time = perc.toString() + " perc " + Math.round(this.win.time - 60 * perc).toString() + " másodperc alatt"

      if (!this.win.win) {
        let level = 0;
        switch (this.win.level - 1) {
          case 5:
          case 6:
          case 7:
          case 8:
          case 9: {
            level = 5;
            break;
          }
          case 10:
          case 11:
          case 12:
          case 13:
          case 14: {
            level = 10;
            break;
          }
          case 15: {
            level = 15;
            break;
          }
          default: {
            level = 0;
          }
        }

        this.level = level;
      } else {
        this.level = this.win.level - 1;
      }

      this.eredmeny = this.win.win ? 'Gratulálok, győztél!' : 'Sajnos vesztettél!'
    }
    setTimeout(() => {
      let first = document.getElementById("first")
      if (first)
        first.hidden = false;
    }, 3000)
    setTimeout(() => {
      let second = document.getElementById("second")
      if (second)
        second.hidden = false;
    }, 6000)
    setTimeout(() => {
      let third = document.getElementById("third")
      if (third)
        third.hidden = false;
    }, 9000)
    setTimeout(() => {
      let okbutton = document.getElementById("okbutton")
      if (okbutton)
        okbutton.hidden = false;
    }, 10000)
  }

  ngOnDestroy() {
    window.localStorage.removeItem('win');
  }

  onAchievement(name: string, score: string) {
    let achievementSound = new Audio('https://dl.dropboxusercontent.com/s/8qvrpd69ua7wio8/XboxAchievement.mp3')
    // @ts-ignore
    document.querySelector('.achiev_name').innerText = name
    // @ts-ignore
    document.querySelector('.acheive_score').innerText = score
    // @ts-ignore
    document.querySelector('.unlocked').innerText = 'Kitüntetés megszerezve'
    achievementSound.play()
    // @ts-ignore
    document.querySelector('.circle').classList.add('circle_animate')
    // @ts-ignore
    document.querySelector('.banner').classList.add('banner-animate')
    // @ts-ignore
    document.querySelector('.achieve_disp').classList.add('achieve_disp_animate')
    setTimeout(() => {
      // @ts-ignore
      document.querySelector('.circle').classList.remove('circle_animate')
      // @ts-ignore
      document.querySelector('.banner').classList.remove('banner-animate')
      // @ts-ignore
      document.querySelector('.achieve_disp').classList.remove('achieve_disp_animate')
    }, 12000)
  }

  private mapValueInRange(value: number, min: number, max: number) {
    value -= min;
    let retVal = (value / (max - min))

    if (retVal > max) {
      retVal = max;
    }

    return retVal * 100;
  }
}
