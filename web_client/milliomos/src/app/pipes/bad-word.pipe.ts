import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'badWord'
})
export class BadWordPipe implements PipeTransform {
  public readonly obscenities = require('badwords-list');
  //Please, God send us help
  public csunyacska = ["szar", "pöcs", "fos", "kurva", "anyád", "csicska", "geci", "picsa", "kuki", "fasz", "pina", "puna", "punci", "pöcs", "suna", "pitákoló", "okádék", "basz", "kúr", "kur", "bazd", "bazdmeg", "nigger", "Aberált", "Aberrált", "Abortuszmaradék", "Abszolút hülye", "Agyalágyult", "Agyatlan", "Agybatetovált", "Ágybavizelős", "Agyfasz", "Agyhalott", "Agyonkúrt", "Agyonvert", "Agyrákos", "AIDS-es", "Alapvetően fasz", "Animalsex-mániás", "Antibarom", "Aprófaszú", "Arcbarakott", "Aszaltfaszú", "Aszott", "Átbaszott", "Azt a kurva de fasz", "Balfasz", "Balfészek", "Baromfifasz", "Basz-o-matic", "Baszhatatlan", "Basznivaló", "Bazmeg", "Bazdmeg", "Bazd meg", "Bazzeg", "Bebaszott", "Befosi", "Békapicsa", "Bélböfi", "Beleiből kiforgatott", "Bélszél", "Brunya", "Büdösszájú", "Búvalbaszott", "Buzeráns", "Buzernyák", "Buzi", "Buzikurva", "Cafat", "Cafka", "Céda", "Cérnafaszú", "Cigány", "Cottonfej", "Cseszett", "Csibefasz", "Csipszar", "Csirkefaszú", "Csitri", "Csöcs", "Csöcsfej", "Csöppszar", "Csupaszfarkú", "Cuncipunci", "Deformáltfaszú", "Dekorált pofájú", "Döbbenetesen segg", "Dobseggű", "Dughatatlan", "Dunyhavalagú", "Duplafaszú", "Ebfasz", "Egyszerűen fasz", "Elbaszott", "Eleve hülye", "Extrahülye", "Fantasztikusan segg", "Fasszopó", "Fasz", "Fasz-emulátor", "Faszagyú", "Faszarc", "Faszfej", "Faszfészek", "Faszkalap", "Faszkarika", "Faszkedvelő", "Faszkópé", "Faszogány", "Faszpörgettyű", "Faszsapka", "Faszszagú", "Faszszopó", "Fasztalan", "Fasztarisznya", "Fasztengely", "Fasztolvaj", "Faszváladék", "Faszverő", "Feka", "Félrebaszott", "Félrefingott", "Félreszart", "Félribanc", "Fing", "Fölcsinált", "Fölfingott", "Fos", "Foskemence", "Fospisztoly", "Fospumpa", "Fostalicska", "Fütyi", "Fütyinyalogató", "Fütykös", "Geci", "Gecinyelő", "Geciszaró", "Geciszívó", "Genny", "Gennyesszájú", "Gennygóc", "Genyac", "Genyó", "Gólyafos", "Görbefaszú", "Gyennyszopó", "Gyíkfing", "Hájpacni", "Hatalmas nagy fasz", "Hátbabaszott", "Házikurva", "Hererákos", "Hígagyú", "Hihetetlenül fasz", "Hikomat", "Hímnőstény", "Hímringyó", "Hiperstrici", "Hitler-imádó", "Hitlerista", "Hivatásos balfasz", "Hú de segg", "Hugyagyú", "Hugyos", "Hugytócsa", "Hüje", "Hüle", "Hülye", "Hülyécske", "Hülyegyerek", "Inkubátor-szökevény", "Integrált barom", "Ionizált faszú", "IQ bajnok", "IQ fighter", "IQ hiányos", "Irdatlanul köcsög", "Íveltfaszú", "Jajj de barom", "Jókora fasz", "Kaka", "Kakamatyi", "Kaki", "Kaksi", "Kecskebaszó", "Kellően fasz", "Képlékeny faszú", "Keresve sem található fasz", "Kétfaszú", "Kétszer agyonbaszott", "Ki-bebaszott", "Kibaszott", "Kifingott", "Kiherélt", "Kikakkantott", "Kikészült", "Kimagaslóan fasz", "Kimondhatatlan pöcs", "Kis szaros", "Kisfütyi", "Klotyószagú", "Kojak-faszú", "Kopárfaszú", "Korlátolt gecizésű", "Kotonszökevény", "Középszar", "Kretén", "Kuki", "Kula", "Kunkorított faszú", "Kurva", "Kurvaanyjú", "Kurvapecér", "Kutyakaki", "Kutyapina", "Kutyaszar", "Lankadtfaszú", "Lebaszirgált", "Lebaszott", "Lecseszett", "Leírhatatlanul segg", "Lemenstruált", "Leokádott", "Lepkefing", "Leprafészek", "Leszart", "Leszbikus", "Lőcs", "Lőcsgéza", "Lófasz", "Lógócsöcsű", "Lóhugy", "Lotyó", "Lucskos", "Lugnya", "Lyukasbelű", "Lyukasfaszú", "Lyukát vakaró", "Lyuktalanított", "Mamutsegg", "Maszturbációs görcs", "Maszturbagép", "Maszturbáltatott", "Megfingatott", "Megkettyintett", "Megkúrt", "Megszopatott", "Mesterséges faszú", "Méteres kékeres", "Mikrotökű", "Mojfing", "Műfaszú", "Muff", "Multifasz", "Műtöttpofájú", "Náci", "  [ REDACTED ]", "Nikotinpatkány", "Nimfomániás", "Nuna", "Nunci", "Nuncóka", "Nyalábfasz", "Nyasgem", "Nyelestojás", "Nyúlszar", "Oltári nagy fasz", "Ondónyelő", "Orbitálisan hülye", "Ordenálé", "Összebaszott", "Ötcsillagos fasz", "Óvszerezett", "Pénisz", "Peremesfaszú", "Picsa", "Picsafej", "Picsameresztő", "Picsánnyalt", "Picsánrugott", "Picsányi", "Pina", "Pinna", "Pisa", "Pisaszagú", "Pisis", "Pöcs", "Pöcsfej", "Porbafingó", "Pornóbuzi", "Pornómániás", "Pudvás", "Pudváslikú", "Puhafaszú", "Punci", "Puncimókus", "Puncis", "Punciutáló", "Puncivirág", "Qki", "Qrva", "Qtyaszar", "Rágcsáltfaszú", "Redva", "Rendkívül fasz", "Rétó-román", "Ribanc", "Riherongy", "Rivalizáló", "Rőfös fasz", "Rojtospicsájú", "Rongyospinájú", "Roppant hülye", "Rossz kurva", "Saját nemével kefélő", "Segg", "Seggarc", "Seggdugó", "Seggfej", "Seggnyaló", "Seggszőr", "Seggtorlasz", "Strici", "Suttyó", "Sutyerák", "Szálkafaszú", "Szar", "Szaralak", "Szárazfing", "Szarbojler", "Szarcsimbók", "Szarevő", "Szarfaszú", "Szarházi", "Szarjankó", "Szarnivaló", "Szarosvalagú", "Szarrá vágott", "Szarrágó", "Szarszagú", "Szarszájú", "Szartragacs", "Szarzsák", "Szégyencsicska", "Szifiliszes", "Szivattyús kurva", "Szófosó", "Szokatlanul fasz", "Szop-o-matic", "Szopógép", "Szopógörcs", "Szopós kurva", "Szopottfarkú", "Szűklyukú", "Szúnyogfaszni", "Szuperbuzi", "Szuperkurva", "Szűzhártya-repedéses", "Szűzkurva", "Szűzpicsa", "Szűzpunci", "Tikfos", "Tikszar", "Tompatökű", "Törpefaszú", "Toszatlan", "Toszott", "Totálisan hülye", "Tyű de picsa", "Tyúkfasznyi", "Tyúkszar", "Vadfasz", "Valag", "Valagváladék", "Végbélféreg", "Xar", "Zsugorított faszú"]


  transform(value: string, ...args: unknown[]): string {
    this.csunyacska = this.csunyacska.concat(this.obscenities.array);
    let tmpValue = value.toLowerCase();

    this.csunyacska.forEach((curse: any) => {
      if (tmpValue.includes(curse)) {
        const length = value.length;
        value = '';

        for (let i = 0; i < length; i++) {
          value += 'x';
        }

        return
      }
    });

    return value;
  }

}
