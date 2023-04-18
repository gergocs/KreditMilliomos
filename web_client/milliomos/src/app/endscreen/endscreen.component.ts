import {Component, OnDestroy, OnInit} from '@angular/core';

@Component({
  selector: 'app-endscreen',
  templateUrl: './endscreen.component.html',
  styleUrls: ['./endscreen.component.scss']
})
export class EndscreenComponent implements OnInit, OnDestroy{

  constructor() { }
  win:any;
  winDifficulty: string = ""
  time: string = ""
  level: number = 0
  eredmeny: string = ''
  easteregg: boolean = false
  ngOnInit(): void {
    if(Math.random() < 0.05){
      this.easteregg = true}

    let win1 = window.localStorage.getItem("win");
    if(win1){
      this.win = JSON.parse(win1);
      this.winDifficulty = this.win.difficulty == 0 ? 'Könnyű' : this.win.difficulty == 1 ? 'Közepes' : 'Nehéz';
      this.win.time = this.win.time/1000
      let perc = Math.floor(this.win.time/60)
      this.time = perc.toString() + " perc " + Math.round(this.win.time- 60*perc).toString() + " másodperc alatt"

      if (!this.win.win){
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
        this.level = this.win.level -1;
      }

      this.eredmeny = this.win.win ? 'Gratulálok, győztél!' : 'Sajnos vesztettél!'
    }
    setTimeout(()=>{
      let first = document.getElementById("first")
      if(first)
        first.hidden=false;
    },3000)
    setTimeout(()=>{
      let second = document.getElementById("second")
      if(second)
        second.hidden=false;
    },6000)
    setTimeout(()=>{
      let third = document.getElementById("third")
      if(third)
        third.hidden=false;
    },9000)
    setTimeout(()=>{
      let okbutton = document.getElementById("okbutton")
      if(okbutton)
        okbutton.hidden=false;
    },10000)
  }
  ngOnDestroy(){
    window.localStorage.removeItem('win');
  }
}
