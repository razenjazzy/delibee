import { Component,Inject} from '@angular/core';
import { NavController,App,Events } from 'ionic-angular';
import { APP_CONFIG, AppConfig } from "../../app/app.config";
import { HomePage } from "../home/home"
/**
 * Generated class for the LanguagePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */
@Component({
  selector: 'page-language',
  templateUrl: 'language.html',
})
export class LanguagePage {
  private languageCode:string='';
  private languages=new Array<{code:string,name:string}>();
  constructor(@Inject(APP_CONFIG) private config: AppConfig,public app:App,
    public navCtrl:NavController,private events:Events) {
    this.languages=this.config.availableLanguages;
    console.log(JSON.stringify(this.languages));
  }

  set(){
    if (!this.languageCode) return;
    this.events.publish("set:language");
    this.app.getRootNav().setRoot(HomePage);
  }
}