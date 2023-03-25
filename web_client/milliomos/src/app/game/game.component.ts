import { Component, OnInit, HostListener } from '@angular/core';
import { Question } from '../models/question';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss'],
})
export class GameComponent implements OnInit {
  // Selections
  public selectedA: Boolean = false;
  public selectedB: Boolean = false;
  public selectedC: Boolean = false;
  public selectedD: Boolean = false;

  // Question - temporary only for testing
  public currentQuestion: Question = {
    category: 'grafika',
    question:
      'Mit kell használnunk, hogy adatot tudjunk küldeni a vertex shaderből a fragment shaderbe?',
    level: '16',
    answerA: 'attribute',
    answerB: 'varying',
    answerC: 'uniform',
    answerD: 'precision',
    answerCorrect: 'B',
  };

  // Sounds
  private submitAnswerSound = new Audio('../assets/sounds/final_answer.mp3');

  constructor() {}

  ngOnInit(): void {}

  // Handle keyboard input
  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    switch (event.key) {
      case 'Enter':
        this.submit();
        break;

      case 'a':
        this.clearSelection();
        this.selectedA = true;
        break;

      case 'b':
        this.clearSelection();
        this.selectedB = true;
        break;

      case 'c':
        this.clearSelection();
        this.selectedC = true;
        break;

      case 'd':
        this.clearSelection();
        this.selectedD = true;
        break;
    }
  }

  // Handle mouse selection
  mouseClick(what: String) {
    switch (what) {
      case 'A':
        this.clearSelection();
        this.selectedA = true;
        break;

      case 'B':
        this.clearSelection();
        this.selectedB = true;
        break;

      case 'C':
        this.clearSelection();
        this.selectedC = true;
        break;

      case 'D':
        this.clearSelection();
        this.selectedD = true;
        break;
    }
  }

  // Handle the next button event
  nextQuestion() {
    console.log('Next button is pressed!');
  }

  // Submit a choice
  submit() {
    if (this.getAnswer() == 'None') {
      console.log('No answer selected');
      return;
    }

    // Call back-end TODO
    console.log(`Answer [${this.getAnswer()}] was submitted!`);
    this.submitAnswerSound.play();
  }

  // Get selected answer
  getAnswer() {
    if (this.selectedA) return 'A';
    if (this.selectedB) return 'B';
    if (this.selectedC) return 'C';
    if (this.selectedD) return 'D';
    return 'None';
  }

  // Clean previous selection
  clearSelection() {
    this.selectedA = false;
    this.selectedB = false;
    this.selectedC = false;
    this.selectedD = false;
  }
}
