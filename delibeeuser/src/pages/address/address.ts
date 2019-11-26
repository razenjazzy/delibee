import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { Address } from '../../models/address.models';
import { Constants } from '../../models/constants.models';
import { ClientService } from '../../providers/client.service';
import { Global } from '../../providers/global';
import { Subscription } from 'rxjs/Subscription';
import { TranslateService } from '@ngx-translate/core';
import { SelectareaPage } from '../selectarea/selectarea';
import { MyLocation } from '../../models/my-location.models';

@Component({
  selector: 'page-address',
  templateUrl: 'address.html',
  providers: [ClientService, Global]
})
export class AddressPage {
  private subscriptions: Array<Subscription> = [];
  private address: Address;
  private areas = new Array<any>();

  constructor(private navCtrl: NavController, private global: Global, private service: ClientService,
    params: NavParams, private translate: TranslateService) {
    this.getAreas();
    this.address = params.get("address");
    if (!this.address) this.address = new Address();
  }

  ionViewWillLeave() {
    this.subscriptions.forEach((subscription: Subscription) => {
      subscription.unsubscribe();
    });
    this.global.dismissLoading();
  }

  ionViewDidEnter() {
    let savedLocation: MyLocation = JSON.parse(window.localStorage.getItem(Constants.KEY_LOCATION_ADDRESS));
    if (savedLocation) {
      this.address.latitude = Number(savedLocation.lat);
      this.address.longitude = Number(savedLocation.lng);
      // this.address.area = savedLocation.area;
      this.address.address = savedLocation.name;
    }
    window.localStorage.removeItem(Constants.KEY_LOCATION_ADDRESS);
  }

  detectLocation() {
    this.navCtrl.push(SelectareaPage, { choose: true });
  }

  getAreas() {
    this.service.getAreas().subscribe(data => {
      this.areas = data;
    }, err => {
      console.log(err);
    })
  }

  saveAddress() {
    console.log(this.address);
    if (!this.address.title) {
      this.translate.get('address_title_err').subscribe(value => {
        this.global.showToast(value);
      });
      // this.global.showToast("Please enter address title");
    } else if (!this.address.address) {
      this.translate.get('address_title_err1').subscribe(value => {
        this.global.showToast(value);
      });
      // this.global.showToast("Please enter address");
    } else if (!this.address.area) {
      this.translate.get('area_title_err').subscribe(value => {
        this.global.showToast(value);
      });
      // this.global.showToast("Please enter area");
    }
    else if (!(Number(this.address.latitude) && Number(this.address.latitude) > 0 && Number(this.address.longitude) && Number(this.address.longitude) > 0)) {
      this.translate.get('address_latlng_err').subscribe(value => {
        this.global.showToast(value);
      });
      // this.global.showToast("Please enter address");
    } else {
      this.translate.get('address_saving').subscribe(value => {
        this.global.presentLoading(value);
      });
      this.subscriptions.push((this.address && this.address.id) ? this.service.updateAddress(window.localStorage.getItem(Constants.KEY_TOKEN), this.address.id, this.address).subscribe(res => this.done(res), err => this.failed(err)) : this.service.saveAddress(window.localStorage.getItem(Constants.KEY_TOKEN), this.address).subscribe(res => this.done(res), err => this.failed(err)));
    }
  }

  failed(err) {
    this.global.dismissLoading();
    console.log('address', err);
    this.navCtrl.pop();
  }

  done(res) {
    window.localStorage.setItem(Constants.ADDRESS_EVENT, JSON.stringify(res));
    this.global.dismissLoading();
    this.navCtrl.pop();
  }

}
