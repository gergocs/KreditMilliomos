import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-endscreen',
  templateUrl: './endscreen.component.html',
  styleUrls: ['./endscreen.component.scss']
})
export class EndscreenComponent implements OnInit {

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
      //window.localStorage.removeItem('win')

      this.winDifficulty = this.win.difficulty == 0 ? 'Könnyű' : this.win.difficulty == 1 ? 'Közepes' : 'Nehéz';
      this.win.time = this.win.time/1000
      let perc = Math.floor(this.win.time/60)
      this.time = perc.toString() + " perc " + Math.round(this.win.time- 60*perc).toString() + "mp alatt"
      this.level = this.win.level
      this.eredmeny = this.win.win ? 'Gratulálok győztél' : 'Sajnos vesztettél'
    }
  }

}
