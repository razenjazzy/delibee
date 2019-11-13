import { Component } from '@angular/core';
import { NavController, AlertController, App } from 'ionic-angular';
import { ProfilePage } from '../profile/profile';
import { SigninPage } from '../signin/signin';
import { LanguagePage } from '../language/language';
import { BankdatailsPage } from '../bankdatails/bankdatails';
import { SupportPage } from '../support/support';
import { Constants } from '../../models/constants.models';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'page-account',
  templateUrl: 'account.html'
})
export class AccountPage {

  constructor(public navCtrl: NavController, private alertCtrl: AlertController,
    private translate: TranslateService, private app: App) {

  }

  profile() {
    this.navCtrl.push(ProfilePage);
  }

  bankdatails() {
    this.navCtrl.push(BankdatailsPage);
  }

  contact() {
    this.navCtrl.push(SupportPage);
  }

  language() {
    this.navCtrl.push(LanguagePage);
  }

  phonenumberPage() {
    this.translate.get(['logout_title', 'logout_message', 'no', 'yes']).subscribe(text => {
      let alert = this.alertCtrl.create({
        title: text['logout_title'],
        message: text['logout_message'],
        buttons: [{
          text: text['no'],
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        },
        {
          text: text['yes'],
          handler: () => {
            window.localStorage.removeItem(Constants.KEY_USER);
            window.localStorage.removeItem(Constants.KEY_PROFILE);
            window.localStorage.removeItem(Constants.KEY_TOKEN);
            this.app.getRootNav().setRoot(SigninPage);
          }
        }]
      });
      alert.present();
    })
  }
}
