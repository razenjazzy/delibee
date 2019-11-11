import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { HomePage } from '../home/home';
import { TranslateService } from '@ngx-translate/core';
import { Constants } from '../../models/constants.models';
import { ClientService } from '../../providers/client.service';
import { Global } from '../../providers/global';
import { Subscription } from 'rxjs/Subscription';
import { SupportRequest } from '../../models/support-request.models';
import { User } from '../../models/user.models';
import { Helper } from '../../models/helper';

@Component({
  selector: 'page-contactus',
  templateUrl: 'contactus.html',
  providers: [ClientService, Global]
})

export class ContactusPage {
  private user: User;
  private support_email = "";
  private support_phone = "";
  private support: SupportRequest = new SupportRequest('', '', '');
  private subscriptions: Array<Subscription> = [];

  constructor(private navCtrl: NavController, private global: Global,
    private service: ClientService, private translate: TranslateService) {
    this.user = JSON.parse(window.localStorage.getItem(Constants.KEY_USER));
    this.support.name = this.user.name;
    this.support.email = this.user.email;
    let settingValues = Helper.getSettings(["support_email", "support_phone"]);
    if (settingValues.length) {
      this.support_email = settingValues[0];
      this.support_phone = settingValues[1];
    }
  }

  send() {
    let reg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
    if (!this.support.name.length) {
      this.translate.get('empty_name').subscribe(value => {
        this.global.showToast(value);
      });
    } else if (!this.support.email.length || !reg.test(this.support.email)) {
      this.translate.get('invalid_email').subscribe(value => {
        this.global.showToast(value);
      });
    } else if (!this.support.message.length) {
      this.translate.get('empty_msg').subscribe(value => {
        this.global.showToast(value);
      });
    } else {
      this.translate.get('sending').subscribe(text => {
        this.global.presentLoading(text);
      })
      let subscription: Subscription = this.service.contactUs(window.localStorage.getItem(Constants.KEY_TOKEN), this.support).subscribe(res => {
        console.log("contactUs", res);
        this.global.dismissLoading();
        this.navCtrl.setRoot(HomePage);
      }, err => {
        console.log('contactUs', err);
        this.global.dismissLoading();
      });
      this.subscriptions.push(subscription);
    }
  }

}