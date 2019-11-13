import { LoadingController, Loading, AlertController, ToastController } from 'ionic-angular';
import { Injectable } from '@angular/core';
import { Store } from "../models/store.models";
import { TranslateService } from '@ngx-translate/core';

@Injectable()
export class Global {
  private favorites: Array<Store>;
  private searchHistory: Array<string>;
  private loadingShown: Boolean = false;
  private loading: Loading;

  constructor(public loadingCtrl: LoadingController, public toastCtrl: ToastController,
    public alertCtrl: AlertController, public translate: TranslateService) {
  }

  checkFavorites() {
    if (this.favorites == null) {
      let favProducts: Array<Store> = JSON.parse(window.localStorage.getItem('favoriteStores'));
      if (favProducts != null) {
        this.favorites = favProducts;
      } else {
        this.favorites = new Array<Store>();
      }
    }
  }

  toggleFavorite(pro): boolean {
    this.checkFavorites();
    let toggleResult: boolean = false;
    let pos: number = -1;
    for (let i = 0; i < this.favorites.length; i++) {
      if (pro.id == this.favorites[i].id) {
        pos = i;
        break;
      }
    }
    if (pos != -1) {
      this.favorites.splice(pos, 1);
      window.localStorage.setItem('favoriteStores', JSON.stringify(this.favorites));
      console.log('saving remove');
      toggleResult = false;
    } else {
      this.favorites.push(pro);
      window.localStorage.setItem('favoriteStores', JSON.stringify(this.favorites));
      console.log('saving save');
      toggleResult = true;
    }
    return toggleResult;
  }

  removeFavorite(pro): boolean {
    this.checkFavorites();
    let removed: boolean = false;
    let pos: number = -1;
    for (let i = 0; i < this.favorites.length; i++) {
      if (pro.id == this.favorites[i].id) {
        pos = i;
        break;
      }
    }
    if (pos != -1) {
      this.favorites.splice(pos, 1);
      window.localStorage.setItem('favoriteStores', JSON.stringify(this.favorites));
      removed = true;
    }
    return removed;
  }

  isFavorite(pro): boolean {
    this.checkFavorites();
    let fav: boolean = false;
    for (let product of this.favorites) {
      if (pro.id == product.id) {
        fav = true;
        break;
      }
    }
    return fav;
  }

  addInSearchHistory(query: string) {
    this.checkSearchHistory();
    let index: number = this.searchHistory.indexOf(query);
    if (index == -1) {
      if (this.searchHistory.length == 5) {
        this.searchHistory.splice(0, 1);
      }
      this.searchHistory.push(query);
      window.localStorage.setItem('searchHistory', JSON.stringify(this.searchHistory));
    }
  }

  clearSearchHistory() {
    this.searchHistory = new Array<string>();
    window.localStorage.setItem('searchHistory', JSON.stringify(this.searchHistory));
  }

  checkSearchHistory() {
    if (this.searchHistory == null) {
      let history: Array<string> = JSON.parse(window.localStorage.getItem('searchHistory'));
      if (history != null) {
        this.searchHistory = history;
      } else {
        this.searchHistory = new Array<string>();
      }
    }
  }

  getSearchHistory() {
    this.checkSearchHistory();
    return this.searchHistory;
  }

  getFavorites() {
    this.checkFavorites();
    return this.favorites;
  }

  refreshFavorites() {
    let favProducts: Array<Store> = JSON.parse(window.localStorage.getItem('favoriteStores'));
    if (favProducts != null) {
      this.favorites = favProducts;
    } else {
      this.favorites = new Array<Store>();
    }
  }

  getDistanceBetweenTwoCoordinates(lat1, lon1, lat2, lon2) {
    var R = 6371; // Radius of the earth in km 
    var dLat = this.deg2rad(lat2 - lat1);  // deg2rad below 
    var dLon = this.deg2rad(lon2 - lon1);
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c; // Distance in km 
    return d;
  }

  deg2rad(deg) {
    return deg * (Math.PI / 180);
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