import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminPageComponent implements OnInit {
  public showForm: boolean = false;
  constructor() { }

  ngOnInit(): void {
  }

}
