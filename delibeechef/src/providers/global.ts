import { LoadingController, Loading, AlertController, ToastController } from 'ionic-angular';
import { Injectable } from '@angular/core';
import { StoreResponse } from "../models/store-response.models";
import { TranslateService } from '@ngx-translate/core';

@Injectable()
export class Global {
  private favorites: Array<StoreResponse>;
  private searchHistory: Array<string>;
  private loadingShown: Boolean = false;
  private loading: Loading;

  constructor(public loadingCtrl: LoadingController, public toastCtrl: ToastController,
    public alertCtrl: AlertController, public translate: TranslateService) {
  }

  presentLoading(message: string) {
    this.loading = this.loadingCtrl.create({
      content: message
    });
    this.loading.onDidDismiss(() => { });
    this.loading.present();
    this.loadingShown = true;
  }

  dismissLoading() {
    if (this.loadingShown) {
      this.loadingShown = false;
      this.loading.dismiss();
    }
  }

  showToast(message: string) {
    let toast = this.toastCtrl.create({
      message: message,
      duration: 3000,
      position: 'bottom'
    });
    toast.onDidDismiss(() => {
      console.log('Dismissed toast');
    });
    toast.present();
  }

  presentErrorAlert(msg: string) {
    this.translate.get(['error', 'dismiss']).subscribe(text => {
      let alert = this.alertCtrl.create({
        title: text['error'],
        subTitle: msg,
        buttons: [text['dismiss']]
      });
      alert.present();
    })
  }
}