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
  ngOnInit(): void {

    let win1 = window.localStorage.getItem("win");
    if(win1){
      this.win = JSON.parse(win1);
      this.winDifficulty = this.win.difficulty == 0 ? 'Könnyű' : this.win.difficulty == 1 ? 'Közepes' : 'Nehéz';
      this.win.time = this.win.time/1000
      let perc = Math.floor(this.win.time/60)
      this.time = perc.toString() + " perc " + Math.round(this.win.time- 60*perc).toString() + "mp alatt"
      this.level = this.win.level
      this.eredmeny = this.win.win ? 'Gratulálok győztél' : 'Sajnos vesztettél'
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
