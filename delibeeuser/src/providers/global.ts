import { LoadingController, Loading, AlertController, ToastController } from 'ionic-angular';
import { Injectable } from '@angular/core';
import { Store } from "../models/store.models";
import { CartItem } from "../models/cart-item.models";
import { Constants } from "../models/constants.models";
import { TranslateService } from '@ngx-translate/core';
import { Item } from '../models/item.models';

@Injectable()
export class Global {
  private favorites: Array<Store>;
  private cartItems: Array<CartItem>;
  private searchHistory: Array<string>;
  private loadingShown: Boolean = false;
  private loading: Loading;

  constructor(public loadingCtrl: LoadingController, public toastCtrl: ToastController,
    public alertCtrl: AlertController, public translate: TranslateService) {
  }

  giveReview(id, sid) {
    let ctr = 0;
    let reviews: Array<{ orderId: number, storeId: number }> = JSON.parse(window.localStorage.getItem(Constants.REVIEWS_LIST));
    if (!reviews) reviews = new Array<{ orderId: number, storeId: number }>();
    for (var i = 0; i < reviews.length; i++) {
      if (reviews[i].orderId == id && reviews[i].storeId == sid) {
        ctr++;
        break;
      }
    }
    if (ctr == 0) reviews.push({ orderId: id, storeId: sid });
    window.localStorage.setItem(Constants.REVIEWS_LIST, JSON.stringify(reviews));
  }

  isReviewGiven(id, sid) {
    let reviews: Array<{ orderId: number, storeId: number }> = JSON.parse(window.localStorage.getItem(Constants.REVIEWS_LIST));
    if (!reviews) reviews = new Array<{ orderId: number, storeId: number }>();
    for (var i = 0; i < reviews.length; i++) {
      if (reviews[i].orderId == id && reviews[i].storeId == sid) {
        return true;
      }
    }
    return false;
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

  isItemAdded(pro): boolean {
    this.checkCartItems();
    let added: boolean = false;
    if (this.cartItems) {
      for (let i = 0; i < this.cartItems.length; i++) {
        if (pro.id == this.cartItems[i].item_id) {
          added = true;
          break;
        }
      }
    }
    return added;
  }

  decrementCartItem(pro): boolean {
    this.checkCartItems();
    let decrement: boolean = false;
    let pos: number = -1;
    for (let i = 0; i < this.cartItems.length; i++) {
      if (pro.id == this.cartItems[i].item_id) {
        pos = i;
        break;
      }
    }
    if (pos != -1) {
      if (this.cartItems[pos].quantity > 1) {
        this.cartItems[pos].quantity = this.cartItems[pos].quantity - 1;
        this.cartItems[pos].priceBase = this.calculateItemPrice(this.cartItems[pos].item);
        this.cartItems[pos].priceTotal = Number((this.cartItems[pos].quantity * this.cartItems[pos].priceBase).toFixed(2));
      } else {
        this.cartItems.splice(pos, 1);
      }
      decrement = true;
      window.localStorage.setItem(Constants.CART_ITEMS, JSON.stringify(this.cartItems));
    }
    return decrement;
  }

  incrementCartItem(pro): boolean {
    this.checkCartItems();
    let increment: boolean = false;
    let pos: number = -1;
    for (let i = 0; i < this.cartItems.length; i++) {
      if (pro.id == this.cartItems[i].item_id && pro.quantity > this.cartItems[i].quantity) {
        pos = i;
        break;
      }
    }
    if (pos != -1) {
      this.cartItems[pos].quantity = this.cartItems[pos].quantity + 1;
      this.cartItems[pos].priceBase = this.calculateItemPrice(this.cartItems[pos].item);
      this.cartItems[pos].priceTotal = Number((this.cartItems[pos].quantity * this.cartItems[pos].priceBase).toFixed(2));
      increment = true;
      window.localStorage.setItem(Constants.CART_ITEMS, JSON.stringify(this.cartItems));
    } else { }
    return increment;
  }

  removeCartItem(pro): boolean {
    this.checkCartItems();
    let removed: boolean = false;
    let pos: number = -1;
    for (let i = 0; i < this.cartItems.length; i++) {
      if (pro.id == this.cartItems[i].item_id) {
        pos = i;
        break;
      }
    }
    if (pos != -1) {
      this.cartItems.splice(pos, 1);
      window.localStorage.setItem(Constants.CART_ITEMS, JSON.stringify(this.cartItems));
      removed = true;
    }
    return removed;
  }

  addCartItem(pro): boolean {
    this.checkCartItems();
    let added: boolean = false;
    let pos: number = -1;
    for (let i = 0; i < this.cartItems.length; i++) {
      if (pro.id == this.cartItems[i].item_id) {
        pos = i;
        break;
      }
    }
    if (pos != -1) {
      this.cartItems[pos].item = pro;
      this.cartItems[pos].quantity = this.cartItems[pos].quantity + 1;
      this.cartItems[pos].priceBase = this.calculateItemPrice(this.cartItems[pos].item);
      this.cartItems[pos].priceTotal = Number((this.cartItems[pos].quantity * this.cartItems[pos].priceBase).toFixed(2));
    } else {
      let cartItem = new CartItem();
      cartItem.item = pro;
      cartItem.item_id = pro.id;
      cartItem.quantity = 1;
      cartItem.priceBase = this.calculateItemPrice(cartItem.item);
      cartItem.priceTotal = Number((cartItem.quantity * cartItem.priceBase).toFixed(2));

      this.cartItems.push(cartItem);
      added = true;
    }
    window.localStorage.setItem(Constants.CART_ITEMS, JSON.stringify(this.cartItems));
    return added;
  }

  updateCartQuantity(item, quantity, adding): boolean {
    this.checkCartItems();
    let updated: boolean = false;
    if (adding) {
      this.addCartItem(item);
      this.updateCartQuantity(item, quantity, false);
    } else {
      for (let i = 0; i < this.cartItems.length; i++) {
        if (item.id == this.cartItems[i].item_id) {
          this.cartItems[i].item = item;
          this.cartItems[i].quantity = quantity;
          this.cartItems[i].priceBase = this.calculateItemPrice(this.cartItems[i].item);
          this.cartItems[i].priceTotal = Number((this.cartItems[i].quantity * this.cartItems[i].priceBase).toFixed(2));
          updated = true;
          break;
        }
      }
    }
    window.localStorage.setItem(Constants.CART_ITEMS, JSON.stringify(this.cartItems));
    return updated;
  }

  calculateItemPrice(item: Item): number {
    let choicesPrice = 0;
    if (item.menu_item_groups) {
      for (let g of item.menu_item_groups) {
        for (let c of g.menu_item_choices) {
          if (c.selected) choicesPrice += c.price;
        }
      }
    }
    return Number((item.price + choicesPrice).toFixed(2));
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

  clearCart() {
    this.cartItems = new Array<CartItem>();
    window.localStorage.setItem(Constants.CART_ITEMS, JSON.stringify(this.cartItems));
    window.localStorage.removeItem(Constants.SELECTED_STORE);
  }

  clearSearchHistory() {
    this.searchHistory = new Array<string>();
    window.localStorage.setItem('searchHistory', JSON.stringify(this.searchHistory));
  }

  checkCartItems() {
    let cartItems: Array<CartItem> = JSON.parse(window.localStorage.getItem(Constants.CART_ITEMS));
    if (cartItems != null) {
      this.cartItems = cartItems;
    } else {
      this.cartItems = new Array<CartItem>();
    }
    //   if (this.cartItems == null) {
    // }
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

  getCartItems() {
    this.checkCartItems();
    return this.cartItems;
  }

  refreshFavorites() {
    let favProducts: Array<Store> = JSON.parse(window.localStorage.getItem('favoriteStores'));
    if (favProducts != null) {
      this.favorites = favProducts;
    } else {
      this.favorites = new Array<Store>();
    }
  }

  refreshCartItems() {
    let cartItems: Array<CartItem> = JSON.parse(window.localStorage.getItem(Constants.CART_ITEMS));
    if (cartItems != null) {
      this.cartItems = cartItems;
    } else {
      this.cartItems = new Array<CartItem>();
    }
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
    this.translate.get(['error', 'dismiss'])
      .subscribe(text => {
        let alert = this.alertCtrl.create({
          title: text['error'],
          subTitle: msg,
          buttons: [text['dismiss']]
        });
        alert.present();
      })
  }
}