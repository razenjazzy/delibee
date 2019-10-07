import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { EarningResponse } from '../../models/earning-response.models';
import { Earning } from '../../models/earnings.models';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs/Subscription';
import { Global } from '../../providers/global';
import { ClientService } from '../../providers/client.service';
import { Helper } from '../../models/helper.models';

@Component({
  selector: 'page-earnings',
  templateUrl: 'earnings.html',
  providers: [Global, ClientService]
})

export class EarningsPage {
  private subscriptions = new Array<Subscription>();
  private currency: string;
  private earnings = new Array<Earning>();
  private earning = new EarningResponse();

  constructor(public navCtrl: NavController, private translate: TranslateService,
    private global: Global, private service: ClientService) {
    this.currency = Helper.getSetting("currency");
    console.log(JSON.stringify(this.currency));
  }

  ionViewDidEnter() {
    this.getEarnings();
  }

  getEarnings() {
    this.translate.get('loading').subscribe(value => {
      this.global.presentLoading(value);
    });
    let subscription: Subscription = this.service.getEarnings().subscribe(res => {
      this.earning = res;
      if (!this.earning.last_earning_date) {
        this.earning.last_earning_date = String(new Date());
      }
      this.earnings = res.earnings.data;
      console.clear();
      // console.log(JSON.stringify(this.items));
      this.global.dismissLoading();
    }, err => {
      this.global.dismissLoading();
      console.log('cat_err', err);
    });
    this.subscriptions.push(subscription);
  }

}