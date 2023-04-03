import {Component, OnInit} from '@angular/core';
import { Router } from '@angular/router';
import firebase from "firebase/compat/app"
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit{
  title = 'milliomos';

  constructor() {
    firebase.initializeApp(environment.firebase);
  }

  ngOnInit() {
    let cc = window as any;
    cc.cookieconsent.initialise({
      palette: {
        popup: {
          background: "#ffffff",
          text: "#333333"
        },
        button: {
          background: "#efa044",
          text: "#ffffff"
        }
      },
      theme: "classic",
      content: {
        message: "A weboldalon sütiket használunk, hogy személyre szabott élményt nyújthassunk.",
        dismiss: "Elfogadom",
        link: "Bővebb információ",
        href: "/dataprivacy"
      }
    });
  }
}
