import { Component, Inject } from '@angular/core';
import { App, Events } from 'ionic-angular';
import { APP_CONFIG, AppConfig } from "../../app/app.config";
import { HomePage } from "../home/home"
import { Constants } from '../../models/constants.models';

@Component({
  selector: 'page-language',
  templateUrl: 'language.html',
})
export class LanguagePage {
  private languageCode: string = '';
  private languages = new Array<{ code: string, name: string }>();

  constructor(@Inject(APP_CONFIG) private config: AppConfig, private app: App,
    private events: Events) {
    this.languages = this.config.availableLanguages;
    this.languageCode = window.localStorage.getItem(Constants.KEY_DEFAULT_LANGUAGE);
    if (!this.languageCode) this.languageCode = "";
  }

  set() {
    if (this.languageCode) {
      window.localStorage.setItem(Constants.KEY_DEFAULT_LANGUAGE, this.languageCode);
      this.events.publish("set:language", this.languageCode);
      this.app.getRootNav().setRoot(HomePage);
    }
  }
}