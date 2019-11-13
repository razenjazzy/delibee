import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { SupportRequest } from '../../models/support-request.models';
import { Global } from '../../providers/global';
import { ClientService } from '../../providers/client.service';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs/Subscription';
import { Constants } from '../../models/constants.models';
import { User } from '../../models/user.models';
import { OrdersPage } from '../../pages/orders/orders'
import { Helper } from '../../models/helper';

@Component({
  selector: 'page-support',
  templateUrl: 'support.html',
  providers: [ClientService, Global]
})

export class SupportPage {
  private user: User;
  private support: SupportRequest = new SupportRequest('', '', '');
  private subscriptions: Array<Subscription> = [];
  private support_email = "";
  private support_phone = "";

  constructor(private navCtrl: NavController, private global: Global,
    private service: ClientService, private translate: TranslateService) {
    this.user = JSON.parse(window.localStorage.getItem(Constants.KEY_USER));
    this.support.name = this.user.name;
    this.support.email = this.user.email;
    let support = Helper.getSettings(["support_email", "support_phone"]);
    if (support) {
      if (support[0]) this.support_email = support[0];
      if (support[1]) this.support_phone = support[1];
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
      let subscription: Subscription = this.service.contactUs(this.support)
        .subscribe(res => {
          console.log(JSON.stringify(res));
          this.global.dismissLoading();
          this.navCtrl.setRoot(OrdersPage);
        }, err => {
          console.log('cat_err', err);
        });
      this.subscriptions.push(subscription);
    }
  }

}