import { Component, Inject } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { PaymentdetailPage } from '../paymentdetail/paymentdetail';
import { AddressPage } from '../address/address';
import { Address } from '../../models/address.models';
import { Constants } from '../../models/constants.models';
import { ClientService } from '../../providers/client.service';
import { Global } from '../../providers/global';
import { Subscription } from 'rxjs/Subscription';
import { TranslateService } from '@ngx-translate/core';
import { APP_CONFIG, AppConfig } from '../../app/app.config';

@Component({
  selector: 'page-shipping',
  templateUrl: 'shipping.html',
  providers: [ClientService, Global]
})
export class ShippingPage {
  private addresses: Array<Address>;
  private subscriptions: Array<Subscription> = [];
  private address_id: number = 0;
  private discount: number = 0;
  private special_instructions: string;
  private order_time = "ASAP";
  private dateTime: string;

  constructor(@Inject(APP_CONFIG) private config: AppConfig, private navCtrl: NavController, private service: ClientService,
    private global: Global, private translate: TranslateService, private params: NavParams) {
    this.dateTime = new Date().toISOString();
    this.translate.get('loading').subscribe(text => {
      this.global.presentLoading(text);
    });
    this.getAddressList();
    let discount = this.params.get("discount");
    if (discount) this.discount = discount;
    let address: Address = JSON.parse(window.localStorage.getItem(Constants.SELECTED_ADDRESS));
    if (address && address.id) this.address_id = Number(address.id);
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

  paymentdetail() {
    if (this.address_id && this.address_id > 0) {
      let addressSelected = null;
      for (let address of this.addresses) {
        if (address.id == this.address_id) {
          addressSelected = address;
          break;
        }
      }
      if (addressSelected) {
        window.localStorage.setItem(Constants.SELECTED_ADDRESS, JSON.stringify(addressSelected));
        if (this.order_time && this.order_time == "LATER") {
          let dt = new Date(this.dateTime.substring(0, this.dateTime.lastIndexOf(".")));
          if (dt.getTime() - new Date().getTime() >= 60 * 60000) {
            let date = dt.getFullYear() + "-" + this.addZero(dt.getMonth() + 1) + "-" + this.addZero(dt.getDate());
            let time = this.addZero(dt.getHours()) + ":" + this.addZero(dt.getMinutes()) + ":00";
            this.navCtrl.push(PaymentdetailPage, { order: { discount: this.discount, address_id: this.address_id, special_instructions: this.special_instructions, type: this.order_time, scheduled_on: date + " " + time } });
          } else {
            this.translate.get('select_time_apart').subscribe(text => {
              this.global.showToast(text);
            });
          }
        } else {
          this.navCtrl.push(PaymentdetailPage, { order: { discount: this.discount, address_id: this.address_id, special_instructions: this.special_instructions } });
        }
      } else {
        this.translate.get('ur_saved_address').subscribe(text => {
          this.global.showToast(text);
        });
      }
    } else {
      this.translate.get('ur_saved_address').subscribe(text => {
        this.global.showToast(text);
      });
    }
  }

  getAddressList() {
    let subscription: Subscription = this.service.getAddressList(window.localStorage.getItem(Constants.KEY_TOKEN)).subscribe(res => {
      this.addresses = res;
      this.global.dismissLoading();
    }, err => {
      console.log('getAddressList', err);
      this.global.dismissLoading();
    });
    this.subscriptions.push(subscription);
  }

  addAddress(address) {
    this.navCtrl.push(AddressPage, { address: address });
  }

  addZero(num) {
    return String(num < 10 ? ("0" + num) : (num));
  }

}
