import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { AddressPage } from '../address/address';
import { TranslateService } from '@ngx-translate/core';
import { Constants } from '../../models/constants.models';
import { ClientService } from '../../providers/client.service';
import { Global } from '../../providers/global';
import { Address } from '../../models/address.models';
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'page-mydetails',
  templateUrl: 'mydetails.html',
  providers: [ClientService, Global]
})
export class MydetailsPage {
  private user: any = {};
  private addresses: Array<Address>;
  private subscriptions: Array<Subscription> = [];
  private isLoading = true;

  constructor(private navCtrl: NavController, private global: Global,
    private service: ClientService, private translate: TranslateService) {
    this.user = JSON.parse(window.localStorage.getItem(Constants.KEY_USER));
    this.translate.get('loading').subscribe(text => {
      this.global.presentLoading(text);
      this.getAddressList();
    });
  }

  ionViewDidEnter() {
    let address: Address = JSON.parse(window.localStorage.getItem(Constants.ADDRESS_EVENT));
    if (address && address.id) {
      if (!this.addresses) this.addresses = new Array<Address>();
      let existingPos = -1;
      for (let i = 0; i < this.addresses.length; i++) {
        if (this.addresses[i].id == address.id) {
          existingPos = i;
          break;
        }
      }
      if (existingPos != -1) this.addresses[existingPos] = address; else this.addresses.push(address);
      this.addresses = this.addresses;
    }
    window.localStorage.removeItem(Constants.ADDRESS_EVENT);
  }

  getAddressList() {
    let subscription: Subscription = this.service.getAddressList(window.localStorage.getItem(Constants.KEY_TOKEN)).subscribe(res => {
      this.isLoading = false;
      this.addresses = res;
      this.global.dismissLoading();
    }, err => {
      this.isLoading = false;
      console.log('getAddressList', err);
      this.global.dismissLoading();
    });
    this.subscriptions.push(subscription);
  }

  addressPage(address) {
    this.navCtrl.push(AddressPage, { address: address });
  }
}
