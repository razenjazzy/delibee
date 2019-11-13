import { Component } from '@angular/core';
import { NavController, AlertController, App } from 'ionic-angular';
import { ProfilePage } from '../profile/profile';
import { ReviewPage } from '../review/review';
import { BankdatailsPage } from '../bankdatails/bankdatails';
import { EarningsPage } from '../earnings/earnings';
import { SupportPage } from '../support/support';
import { SigninPage } from '../signin/signin';
import { Constants } from '../../models/constants.models';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'page-account',
  templateUrl: 'account.html'
})

export class AccountPage {

  constructor(private navCtrl: NavController, private alertCtrl: AlertController,
    private translate: TranslateService, private app: App) {

  }

  profile() {
    this.navCtrl.push(ProfilePage);
  }

  review() {
    this.navCtrl.push(ReviewPage);
  }

  bankdatails() {
    this.navCtrl.push(BankdatailsPage);
  }

  earnings() {
    this.navCtrl.push(EarningsPage);
  }

  support() {
    this.navCtrl.push(SupportPage);
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
            window.localStorage.removeItem(Constants.STORE_DETAILS);
            window.localStorage.removeItem(Constants.KEY_TOKEN);
            this.app.getRootNav().setRoot(SigninPage);
          }
        }]
      });
      alert.present();
    });
  }
}