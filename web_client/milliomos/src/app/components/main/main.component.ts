import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserModell } from '../../models/usermodell';
import { AuthService } from '../../services/auth.service';
import {ScoreService} from "../../services/score.service";
import { KeyValue } from '@angular/common';
import {filter} from "rxjs";

const Filter = require('bad-words');

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {
  loggedin: boolean =false
  userdata: UserModell | undefined
  scores = new Map<string, number>();
  achievements = new Map<string, Map<string, string>>();
  customFilter = new Filter({ placeHolder: 'x'});
  // Preserve original property order
  originalOrder = (a: KeyValue<string, number>, b: KeyValue<string, number>): number => {
    return 0;
  }

  beRunning = false;

  public showForm: boolean = false;

  constructor(public auth: AuthService, protected router: Router, private scoreService: ScoreService) {
    let beRunning = this.auth.isBackEndRunning();

    beRunning.then(r => {
      this.beRunning = r;

      if (!r){
        localStorage.clear()
        window.alert("Néhány óra múlva próbáld újra");
      } else {
        let csunyacska = ["szar","pöcs", "fos","kurva","anyád","csicska","geci","picsa","kuki","fasz","pina","puna","punci","pöcs","suna","pitákoló","okádék","basz","kúr","kur","bazd","bazdmeg","nigger","Aberált","Aberrált","Abortuszmaradék","Abszolút hülye","Agyalágyult","Agyatlan","Agybatetovált","Ágybavizelős","Agyfasz","Agyhalott","Agyonkúrt","Agyonvert","Agyrákos","AIDS-es","Alapvetően fasz","Animalsex-mániás","Antibarom","Aprófaszú","Arcbarakott","Aszaltfaszú","Aszott","Átbaszott","Azt a kurva de fasz","Balfasz","Balfészek","Baromfifasz","Basz-o-matic","Baszhatatlan","Basznivaló","Bazmeg","Bazdmeg","Bazd meg","Bazzeg","Bebaszott","Befosi","Békapicsa","Bélböfi","Beleiből kiforgatott","Bélszél","Brunya","Büdösszájú","Búvalbaszott","Buzeráns","Buzernyák","Buzi","Buzikurva","Cafat","Cafka","Céda","Cérnafaszú","Cigány","Cottonfej","Cseszett","Csibefasz","Csipszar","Csirkefaszú","Csitri","Csöcs","Csöcsfej","Csöppszar","Csupaszfarkú","Cuncipunci","Deformáltfaszú","Dekorált pofájú","Döbbenetesen segg","Dobseggű","Dughatatlan","Dunyhavalagú","Duplafaszú","Ebfasz","Egyszerűen fasz","Elbaszott","Eleve hülye","Extrahülye","Fantasztikusan segg","Fasszopó","Fasz","Fasz-emulátor","Faszagyú","Faszarc","Faszfej","Faszfészek","Faszkalap","Faszkarika","Faszkedvelő","Faszkópé","Faszogány","Faszpörgettyű","Faszsapka","Faszszagú","Faszszopó","Fasztalan","Fasztarisznya","Fasztengely","Fasztolvaj","Faszváladék","Faszverő","Feka","Félrebaszott","Félrefingott","Félreszart","Félribanc","Fing","Fölcsinált","Fölfingott","Fos","Foskemence","Fospisztoly","Fospumpa","Fostalicska","Fütyi","Fütyinyalogató","Fütykös","Geci","Gecinyelő","Geciszaró","Geciszívó","Genny","Gennyesszájú","Gennygóc","Genyac","Genyó","Gólyafos","Görbefaszú","Gyennyszopó","Gyíkfing","Hájpacni","Hatalmas nagy fasz","Hátbabaszott","Házikurva","Hererákos","Hígagyú","Hihetetlenül fasz","Hikomat","Hímnőstény","Hímringyó","Hiperstrici","Hitler-imádó","Hitlerista","Hivatásos balfasz","Hú de segg","Hugyagyú","Hugyos","Hugytócsa","Hüje","Hüle","Hülye","Hülyécske","Hülyegyerek","Inkubátor-szökevény","Integrált barom","Ionizált faszú","IQ bajnok","IQ fighter","IQ hiányos","Irdatlanul köcsög","Íveltfaszú","Jajj de barom","Jókora fasz","Kaka","Kakamatyi","Kaki","Kaksi","Kecskebaszó","Kellően fasz","Képlékeny faszú","Keresve sem található fasz","Kétfaszú","Kétszer agyonbaszott","Ki-bebaszott","Kibaszott","Kifingott","Kiherélt","Kikakkantott","Kikészült","Kimagaslóan fasz","Kimondhatatlan pöcs","Kis szaros","Kisfütyi","Klotyószagú","Kojak-faszú","Kopárfaszú","Korlátolt gecizésű","Kotonszökevény","Középszar","Kretén","Kuki","Kula","Kunkorított faszú","Kurva","Kurvaanyjú","Kurvapecér","Kutyakaki","Kutyapina","Kutyaszar","Lankadtfaszú","Lebaszirgált","Lebaszott","Lecseszett","Leírhatatlanul segg","Lemenstruált","Leokádott","Lepkefing","Leprafészek","Leszart","Leszbikus","Lőcs","Lőcsgéza","Lófasz","Lógócsöcsű","Lóhugy","Lotyó","Lucskos","Lugnya","Lyukasbelű","Lyukasfaszú","Lyukát vakaró","Lyuktalanított","Mamutsegg","Maszturbációs görcs","Maszturbagép","Maszturbáltatott","Megfingatott","Megkettyintett","Megkúrt","Megszopatott","Mesterséges faszú","Méteres kékeres","Mikrotökű","Mojfing","Műfaszú","Muff","Multifasz","Műtöttpofájú","Náci","  [ REDACTED ]","Nikotinpatkány","Nimfomániás","Nuna","Nunci","Nuncóka","Nyalábfasz","Nyasgem","Nyelestojás","Nyúlszar","Oltári nagy fasz","Ondónyelő","Orbitálisan hülye","Ordenálé","Összebaszott","Ötcsillagos fasz","Óvszerezett","Pénisz","Peremesfaszú","Picsa","Picsafej","Picsameresztő","Picsánnyalt","Picsánrugott","Picsányi","Pina","Pinna","Pisa","Pisaszagú","Pisis","Pöcs","Pöcsfej","Porbafingó","Pornóbuzi","Pornómániás","Pudvás","Pudváslikú","Puhafaszú","Punci","Puncimókus","Puncis","Punciutáló","Puncivirág","Qki","Qrva","Qtyaszar","Rágcsáltfaszú","Redva","Rendkívül fasz","Rétó-román","Ribanc","Riherongy","Rivalizáló","Rőfös fasz","Rojtospicsájú","Rongyospinájú","Roppant hülye","Rossz kurva","Saját nemével kefélő","Segg","Seggarc","Seggdugó","Seggfej","Seggnyaló","Seggszőr","Seggtorlasz","Strici","Suttyó","Sutyerák","Szálkafaszú","Szar","Szaralak","Szárazfing","Szarbojler","Szarcsimbók","Szarevő","Szarfaszú","Szarházi","Szarjankó","Szarnivaló","Szarosvalagú","Szarrá vágott","Szarrágó","Szarszagú","Szarszájú","Szartragacs","Szarzsák","Szégyencsicska","Szifiliszes","Szivattyús kurva","Szófosó","Szokatlanul fasz","Szop-o-matic","Szopógép","Szopógörcs","Szopós kurva","Szopottfarkú","Szűklyukú","Szúnyogfaszni","Szuperbuzi","Szuperkurva","Szűzhártya-repedéses","Szűzkurva","Szűzpicsa","Szűzpunci","Tikfos","Tikszar","Tompatökű","Törpefaszú","Toszatlan","Toszott","Totálisan hülye","Tyű de picsa","Tyúkfasznyi","Tyúkszar","Vadfasz","Valag","Valagváladék","Végbélféreg","Xar","Zsugorított faszú"]
        this.customFilter.addWords(...csunyacska);

        if (!auth.user?.emailVerified && auth.authState == 2) {
          auth.user?.sendEmailVerification()
          window.alert("A bejelentkezéshez meg kell erősítened az e-mail címedet! (Nézd meg a spam mappádat is!)");
          auth.logout();
        }
        if (!window.localStorage.getItem("userdatas")){
          auth.logout();
        }

        this.scoreService.getTopX().subscribe(score => {
          this.scores = new Map<string, number>();
          let tmp = new Map<string, number>();

          // @ts-ignore
          Object.entries(score.result).forEach((entry) => {
            // @ts-ignore
            tmp.set(this.customFilter.clean(entry[0]), <number>entry[1]);
            if (this.customFilter.clean(decodeURIComponent(entry[0]).toLowerCase()) == decodeURIComponent(entry[0]).toLowerCase()){
                // @ts-ignore
                this.scores.set(decodeURIComponent(entry[0]), <number>entry[1]);
            } else {
                this.scores.set(this.customFilter.clean(decodeURIComponent(entry[0]).toLocaleLowerCase()), <number>entry[1]);
            }
          });

          this.scoreService.getAchievements(Array.from(tmp.keys())).subscribe(achievements => {
            this.achievements = new Map<string, Map<string, string>>();

            // @ts-ignore
            Object.entries(achievements).forEach((entry) => {
              // @ts-ignore
              let array = entry[1];
              let val = new Map<string, string>();

              for (let i = 0; i < array.length; i++) {
                  val.set(decodeURIComponent(array[i]), "assets/images/achievements/" + decodeURIComponent(array[i]) + ".svg")
              }

              // @ts-ignore
              this.achievements.set(this.customFilter.clean(decodeURIComponent(entry[0])), val);
            });
          })


        });
      }
    })

  }

  ngOnInit(){
    let userdatas = window.localStorage.getItem("userdatas")
    if(!userdatas){
      this.loggedin = false;
    }else{
      this.loggedin = true;
      this.userdata = JSON.parse(userdatas)
  }
  }


}
