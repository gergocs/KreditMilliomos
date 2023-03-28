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
          background: "#164969" //TODO: Colors
        },
        button: {
          background: "#ffe000",
          text: "#164969"
        }
      },
      theme: "classic",
      content: {
        message: "Az oldal nagyon finom sütiket használ",
        dismiss: "Rendben",
        link: "Több információ",
        href: "/dataprivacy"
      }
    });
  }
}
