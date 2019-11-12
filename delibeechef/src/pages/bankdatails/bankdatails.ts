import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { Global } from '../../providers/global';
import { ClientService } from '../../providers/client.service';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs/Subscription';
import { BankDetail } from '../../models/bank-details.models';

@Component({
  selector: 'page-bankdatails',
  templateUrl: 'bankdatails.html',
  providers:[Global,ClientService]
})

export class BankdatailsPage {
  private subscriptions=new Array<Subscription>();
  private bankDetail=new BankDetail('','','','');

  constructor(private navCtrl: NavController,private global:Global,
    private service:ClientService,private translate:TranslateService) {
    this.getBankDetail();
  }

  getBankDetail(){
    this.translate.get('loading').subscribe(value => {
      this.global.presentLoading(value);
    });
    let subscription: Subscription = this.service.getBankDetail()
    .subscribe(res => {
      this.bankDetail=res;
      console.log(JSON.stringify(res));
      this.global.dismissLoading();
    }, err => {
      this.global.dismissLoading();
      console.log('cat_err', err);
    });
    this.subscriptions.push(subscription);
  }

  send() {
    if (!this.bankDetail.name.length) {
      this.translate.get('a/c_hldr_name_err').subscribe(value => {
        this.global.showToast(value);
      });
    } else if (!this.bankDetail.bank_name.length) {
      this.translate.get('bank_name_err').subscribe(value => {
        this.global.showToast(value);
      });
    } else if (!this.bankDetail.ifsc.length) {
      this.translate.get('ifsc_err').subscribe(value => {
        this.global.showToast(value);
      });
    } else if (!this.bankDetail.account_number.length) {
      this.translate.get('account_number_err').subscribe(value => {
        this.global.showToast(value);
      });
    } else {
      this.translate.get('sending').subscribe(text => {
        this.global.presentLoading(text);
      })
      let subscription: Subscription = this.service.saveBankDetails(this.bankDetail)
      .subscribe(res => {
        console.log(JSON.stringify(res));
        this.global.dismissLoading();
        this.navCtrl.pop();
      }, err => {
        console.log('cat_err', err);
      });
      this.subscriptions.push(subscription);
    }
  }
}