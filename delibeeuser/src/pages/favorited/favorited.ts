import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { Constants } from '../../models/constants.models';
import { ClientService } from '../../providers/client.service';
import { Global } from '../../providers/global';
import { Subscription } from 'rxjs/Subscription';
import { ChefdetailPage } from '../chefdetail/chefdetail';
import { TranslateService } from '@ngx-translate/core';
import { Helper } from '../../models/helper';

@Component({
  selector: 'page-favorited',
  templateUrl: 'favorited.html',
  providers: [ClientService, Global]
})
export class FavoritedPage {
  private doneAll = false;
  private isLoading = true;
  private currency: string = "";
  private stores = new Array<any>();
  private subscriptions: Array<Subscription> = [];
  private infiniteScroll: any;
  private pageNo: number = 1;
  private allDone = false;

  constructor(private navCtrl: NavController, private service: ClientService,
    private global: Global, private translate: TranslateService) {
    let settingValues = Helper.getSettings(["currency"]);
    if (settingValues.length) {
      this.currency = settingValues[0];
    }
    this.translate.get('loading').subscribe(text => {
      this.global.presentLoading(text);
      this.getStores();
    })
    // this.global.presentLoading("Loading Merchants");
  }

  getStores() {
    let subscription: Subscription = this.service.getFavourites(window.localStorage.getItem(Constants.KEY_TOKEN), this.pageNo).subscribe(res => {
      this.isLoading = false;
      this.allDone = (!res.data || !res.data.length);
      this.global.dismissLoading();
      let stores: Array<any> = res.data;
      for (var i = 0; i < stores.length; i++) {
        stores[i].store.favourite = 1;
        if (stores[i].store.ratings)
          stores[i].store.ratings = Number(stores[i].store.ratings).toFixed(1);
      }
      this.stores = this.stores.concat(stores);
      if (this.infiniteScroll) this.infiniteScroll.complete();
    }, err => {
      this.isLoading = false;
      this.global.dismissLoading();
      if (this.infiniteScroll) this.infiniteScroll.complete();
      console.log('store_err', err);
    });
    this.subscriptions.push(subscription);
  }

  doInfinite(infiniteScroll: any) {
    this.infiniteScroll = infiniteScroll;
    if (!this.allDone) {
      this.pageNo = this.pageNo + 1;
      this.getStores();
    } else {
      infiniteScroll.complete();
    }
  }

  toggleFavorite(index) {
    this.service.tougleFavourite(window.localStorage.getItem(Constants.KEY_TOKEN), this.stores[index].store.id, this.stores[index].store.favourite).subscribe(res => {
      // console.log(res);
      this.stores[index].store.favourite = this.stores[index].store.favourite == 0 ? 1 : 0;
    }, err => {
      console.log('tougleFavourite err', err);
    });
    // this.stores[index].favourite=this.global.toggleFavorite(this.stores[index]);
  }

  chefdetail(store) {
    this.navCtrl.push(ChefdetailPage, { store: store });
  }
}