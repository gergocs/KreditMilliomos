import { Component, OnInit } from '@angular/core'

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})

export class AdminPageComponent implements OnInit {

  public visible: boolean = false
  public error: boolean = false
  public errorMsg: string = ""

  public file: any
  public items: any[] = []

  public showForm: boolean = false;
  constructor() { }

  ngOnInit(): void {
  }

  fileChanged(e: any) {
    this.file = e.target.files[0]
  }

  load() {
    if(this.file == undefined){
      this.error = true
      this.errorMsg = "Nincs fájl kiválasztva!"
      return
    }
    else{
      this.error = false
      this.readFile(this.file)
    }
    
  }

  readFile(inputFile: any): void {
    const fileReader = new FileReader()
    fileReader.readAsText(inputFile)

    fileReader.onload = () => {
      const fileContent = fileReader.result as string
      const lines = fileContent.split('\n')

      lines.forEach((line: string) => {
        const words = line.split(';');
        const obj = {
          category: words[0],
          question: words[1],
          level: words[2],
          a1: words[3],
          a2: words[4],
          a3: words[5],
          a4: words[6],
          correct: words[7]
        }
        this.items.push(obj)
      });
    };
  }

  display(): void{
    // Error handling
    if(this.items.length == 0){
      this.error = true
      this.visible = false
      this.errorMsg = "Még nincsennek kérdések betöltve!"
      return
    }
    else{
      this.error = false
      this.visible = true
    }
  }

  save(): void{
    if(this.items.length == 0) return

    this.items.forEach((item: any) => {
      console.log(item)
    })
  }

  delete(): void{
    if(this.items.length != 0){
     this.items.splice(0) 
    }
  }
}


