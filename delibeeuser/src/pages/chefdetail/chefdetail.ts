import { Component } from '@angular/core';
import { NavController, NavParams, AlertController } from 'ionic-angular';
import { OnlinemenuPage } from '../onlinemenu/onlinemenu';
import { CartPage } from '../cart/cart';
import { FavoritedPage } from '../favorited/favorited';
import { Store } from '../../models/store.models';
import { Constants } from '../../models/constants.models';
import { ClientService } from '../../providers/client.service';
import { Global } from '../../providers/global';
import { Subscription } from 'rxjs/Subscription';
import { CartItem } from '../../models/cart-item.models';
import { Item } from '../../models/item.models';
import { StoreDetails } from '../../models/store-details.models';
import { StoreRatings } from '../../models/store-ratings.models';
import { TranslateService } from '@ngx-translate/core';
import { Helper } from '../../models/helper';
import { User } from '../../models/user.models';
import { Address } from '../../models/address.models';

@Component({
  selector: 'page-chefdetail',
  templateUrl: 'chefdetail.html',
  providers: [ClientService, Global]
})
export class ChefdetailPage {
  chef: string = "cuisine";
  private data: StoreDetails;
  private store: Store;
  private favorite: number;
  private cartItems: Array<CartItem>;
  private storeId: number;
  private categories: Array<any>;
  private subscriptions: Array<Subscription> = [];
  private cartTotal: number = 0;
  private cartSize: number = 0;
  private ratings: Array<StoreRatings>;
  private currency: string = "";
  private loadingReview = false;
  private user: User;
  private delivery_fee = "--";

  constructor(private translate: TranslateService, private navCtrl: NavController, params: NavParams,
    private service: ClientService, private global: Global, private alertCtrl: AlertController) {
    this.user = JSON.parse(window.localStorage.getItem(Constants.KEY_USER));
    this.store = params.get("store");
    this.favorite = this.store.favourite;
    let settingValues = Helper.getSettings(["currency"]);
    if (settingValues.length) {
      this.currency = settingValues[0];
    }
    this.translate.get('loading_store').subscribe(text => {
      this.global.presentLoading(text);
    });
    this.getDetails();
    this.getRatings();

    let address: Address = JSON.parse(window.localStorage.getItem(Constants.SELECTED_ADDRESS));
    if (address && address.id && this.store && this.store.id) {
      this.subscriptions.push(this.service.calculateDeliveryFee(window.localStorage.getItem(Constants.KEY_TOKEN), { address_id: Number(address.id), store_id: this.store.id }).subscribe(res => {
        console.log("calculateDeliveryFee", res);
        if (Number(res.delivery_fee)) {
          this.delivery_fee = this.currency + " " + res.delivery_fee;
        } else {
          this.delivery_fee = this.currency + " " + this.store.delivery_fee;
        }
      }, err => {
        console.log("calculateDeliveryFeeErr", err);
        this.delivery_fee = this.currency + " " + this.store.delivery_fee;
      }));
    } else {
      this.delivery_fee = this.currency + " " + this.store.delivery_fee;
    }
  }

  ionViewDidEnter() {
    this.cartItems = JSON.parse(window.localStorage.getItem(Constants.CART_ITEMS));
    this.calculateTotal();
  }

  getDetails() {
    let subscription: Subscription = this.service.getStoreDetails(window.localStorage.getItem(Constants.KEY_TOKEN), this.store.id).subscribe(res => {
      this.filterData(res);
      this.global.dismissLoading();
      // console.log(JSON.stringify(this.categories));
    }, err => {
      this.global.dismissLoading();
      this.translate.get('get_store_fail').subscribe(text => {
        this.global.showToast(text);
      });
      console.log('getStoreDetails', err);
      this.navCtrl.pop();
    });
    this.subscriptions.push(subscription);
  }

  getRatings() {
    this.loadingReview = true;
    let subscription: Subscription = this.service.getStoreRatings(window.localStorage.getItem(Constants.KEY_TOKEN), this.store.id).subscribe(res => {
      for (var i = 0; i < res.data.length; i++) {
        res.data[i].rating = Number(res.data[i].rating.toFixed(2));
      }
      this.ratings = res.data;
      this.loadingReview = false;
    }, err => {
      this.global.dismissLoading();
      console.log('ratings_err', err);
      this.loadingReview = false;
    });
    this.subscriptions.push(subscription);
  }

  filterData(res) {
    this.data = res;
    if (res.store.ratings)
      res.store.ratings = Number(res.store.ratings.toFixed(2));
    else res.store.ratings = 0;
    this.store = res.store;
    let items = res.menu_items;
    let categories = [];
    for (let i = 0; i < items.length; i++) {
      if (items[i].quantity > 0) {
        for (let j = 0; j < items[i].categories.length; j++) {
          let ctr = 0;
          for (let k = 0; k < categories.length; k++) {
            if (categories[k].id == items[i].categories[j].id) {
              ctr++;
            }
          }
          if (ctr == 0) {
            categories.push(items[i].categories[j]);
          }
        }
      }
    }
    for (let i = 0; i < categories.length; i++) {
      categories[i].items = new Array<Item>();
      for (let j = 0; j < items.length; j++) {
        let ctr = 0;
        for (var k = 0; k < items[j].categories.length; k++) {
          if (categories[i].id == items[j].categories[k].id && items[j].quantity > 0) {
            ctr++;
          }
        }
        if (ctr > 0) categories[i].items.push(items[j]);
      }
    }
    for (let i = 0; i < categories.length; i++) {
      for (let j = 0; j < categories[i].items.length; j++) {
        categories[i].items[j].categories = [];
        categories[i].items[j].added = this.global.isItemAdded(categories[i].items[j]);
      }
    }
    this.categories = categories;
    console.log(categories.length + " categories found");
  }

  calculateTotal() {
    this.cartItems = JSON.parse(window.localStorage.getItem(Constants.CART_ITEMS));
    let sum: number = 0;
    if (this.cartItems) {
      this.cartSize = this.cartItems.length;
      for (let item of this.cartItems) {
        sum += item.priceTotal;
      }
    } else this.cartItems = new Array<CartItem>();
    this.cartTotal = sum;
    if (this.cartItems.length == 0)
      window.localStorage.removeItem(Constants.SELECTED_STORE);
  }

  tootgleCategory(index) {
    this.categories[index].active = !this.categories[index].active;
  }

  /*toggleFavorite() {
    this.favorite=this.global.toggleFavorite(this.store);
  }*/

  toggleFavorite() {
    this.service.tougleFavourite(window.localStorage.getItem(Constants.KEY_TOKEN), this.store.id, this.store.favourite).subscribe(res => {
      console.log(res);
      this.favorite = this.favorite == 0 ? 1 : 0;
    }, err => {
      console.log('tougleFavourite err', err);
    });
  }

  addToCart(parentIndex, childIndex) {
    let store: Store = JSON.parse(window.localStorage.getItem(Constants.SELECTED_STORE));
    if (store && (store.id != this.categories[parentIndex].items[childIndex].store_id)) {
      this.showConflict(parentIndex, childIndex);
    } else {
      this.categories[parentIndex].items[childIndex].added = this.global.addCartItem(this.categories[parentIndex].items[childIndex]);
      window.localStorage.setItem('changed', 'changed');
      this.calculateTotal();
      window.localStorage.setItem(Constants.SELECTED_STORE, JSON.stringify(this.store));
    }
  }

  removeCart(parentIndex, childIndex) {
    this.categories[parentIndex].items[childIndex].added = !(this.global.removeCartItem(this.categories[parentIndex].items[childIndex]));
    this.calculateTotal();
  }

  showConflict(parentIndex, childIndex) {
    this.translate.get(['yes', 'no', 'cart_conflict', 'cart_conflict_msg']).subscribe(text => {
      const confirm = this.alertCtrl.create({
        title: text['cart_conflict'],
        message: text['cart_conflict_msg'],
        buttons: [
          {
            text: text['no'],
            handler: () => {
              console.log('Disagree clicked');
            }
          },
          {
            text: text['yes'],
            handler: () => {
              this.global.clearCart();
              console.log('Agree clicked');
              this.addToCart(parentIndex, childIndex);
            }
          }
        ]
      });
      confirm.present();
    })
  }

  onlinemenu(item) {
    this.navCtrl.push(OnlinemenuPage, { item: item, store: this.store });
  }

  cart() {
    this.navCtrl.push(CartPage);
  }

  favorited() {
    this.navCtrl.push(FavoritedPage);
  }
}