import { Component } from '@angular/core';
import { ViewController, NavParams } from 'ionic-angular';
import { Global } from '../../providers/global';
import { TranslateService } from '@ngx-translate/core';
import { ClientService } from '../../providers/client.service';

/**
 * Generated class for the PhonePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-phone',
  templateUrl: 'phone.html',
  providers: [ClientService, Global]
})

export class PhonePage {
  private countries=new Array<any>();
  private phoneNumber: string;
  private countryCode: string;
  private phoneNumberFull: string;

  constructor(public viewCtrl: ViewController,public global: Global,
    private clientService:ClientService,public translate:TranslateService,) {
    this.getCountries();
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad PhonePage');
  }


  getCountries() {
    this.clientService.getCountries().subscribe(data => {
      this.countries = data;
    }, err => {
      console.log(err);
    })
  }

  submit(){
    if (this.countryCode && this.phoneNumber) {
      this.phoneNumberFull = "+" + this.countryCode + this.phoneNumber;
      this.viewCtrl.dismiss(this.phoneNumberFull);
    }
  }
}
