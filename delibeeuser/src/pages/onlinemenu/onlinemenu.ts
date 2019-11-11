import { Component } from '@angular/core';
import { NavController, NavParams, AlertController } from 'ionic-angular';
import { CartPage } from '../cart/cart';
import { ClientService } from '../../providers/client.service';
import { Global } from '../../providers/global';
import { Subscription } from 'rxjs/Subscription';
import { CartItem } from '../../models/cart-item.models';
import { Item } from '../../models/item.models';
import { TranslateService } from '@ngx-translate/core';
import { Helper } from '../../models/helper';
import { Store } from '../../models/store.models';
import { Constants } from '../../models/constants.models';

@Component({
  selector: 'page-onlinemenu',
  templateUrl: 'onlinemenu.html',
  providers: [ClientService, Global]
})
export class OnlinemenuPage {
  private subscriptions: Array<Subscription> = [];
  private cartTotal: number = 0;
  private currency: string = "";
  private cartItems: Array<CartItem>;
  private categories: Array<any>;
  private cartSize: number = 0;
  private item: Item;
  private quantity: number = 1;
  private priceToShow = 0;
  private added: boolean = false;
  private store: Store;

  constructor(private navCtrl: NavController, params: NavParams, private translate: TranslateService,
    private global: Global, private alertCtrl: AlertController) {
    this.cartItems = global.getCartItems();
    this.item = params.get("item");
    this.store = params.get("store");
    let settingValues = Helper.getSettings(["currency"]);
    if (settingValues.length) {
      this.currency = settingValues[0];
    }
    this.priceToShow = this.item.price;
    console.log("item", this.item);
    for (let ci of this.cartItems) {
      if (this.item.id == ci.item_id) {
        this.item.quantity = ci.quantity;
        this.added = true;
        this.priceToShow = ci.priceTotal;

        if (this.item.menu_item_groups && this.item.menu_item_groups.length && ci.item.menu_item_groups && ci.item.menu_item_groups.length) {
          let choices = new Array<{ groupId: number, choiceId: number }>();

          for (let gci of ci.item.menu_item_groups) {
            for (let cci of gci.menu_item_choices) {
              if (cci.selected) {
                choices.push({ groupId: gci.id, choiceId: cci.id });
              }
            }
          }

          if (choices.length) {
            for (let cs of choices) {
              for (let g of this.item.menu_item_groups) {
                if (g.id == cs.groupId) {
                  for (let c of g.menu_item_choices) {
                    if (c.id == cs.choiceId) {
                      c.selected = true;
                      if (g.max_choices == 1) {
                        g.singleChoiceId = c.id;
                      }
                    }
                  }
                }
              }
            }
          }
        }
        break;
      }
    }
  }

  cart() {
    this.navCtrl.push(CartPage);
  }

  quantDown() {
    if (this.quantity > 1) {
      this.quantity--;
      this.previewPrice();
    }
  }

  quantUp() {
    if (this.quantity < this.item.quantity) {
      this.quantity++;
    }
    this.previewPrice();
  }

  choiceEvent() {
    this.previewPrice();
  }

  previewPrice() {
    let choicesTotal = 0;
    if (this.item.menu_item_groups) {
      for (let g of this.item.menu_item_groups) {
        for (let c of g.menu_item_choices) {
          if (g.max_choices == 1) {
            c.selected = c.id == g.singleChoiceId;
          }
          if (c.selected) choicesTotal += c.price;
        }
      }
    }
    this.priceToShow = Number((this.quantity * (this.item.price + choicesTotal)).toFixed(2));
  }

  ionViewDidEnter() {
    this.cartItems = JSON.parse(window.localStorage.getItem(Constants.CART_ITEMS));
    this.calculateTotal();
  }
  
  addToCart() {
    let store: Store = JSON.parse(window.localStorage.getItem(Constants.SELECTED_STORE));
    if (store && (store.id != this.store.id)) {
      this.showConflict();
    } else {
      window.localStorage.setItem(Constants.SELECTED_STORE, JSON.stringify(this.store));
      if (this.added) {
        this.global.updateCartQuantity(this.item, this.quantity, false);
        this.translate.get('card_update2').subscribe(text => {
          this.global.showToast(text);
        });
      } else {
        if (this.quantity > 1) {
          this.global.updateCartQuantity(this.item, this.quantity, true);
        } else this.global.addCartItem(this.item);
        this.translate.get('card_update1').subscribe(text => {
          this.global.showToast(text);
        });
      }
      this.cartItems = this.global.getCartItems();
      console.log("ci", this.cartItems);
      window.localStorage.setItem('changed', 'changed');
      this.calculateTotal();
    }
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

  removeCart(parentIndex, childIndex) {
    this.categories[parentIndex].items[childIndex].added = !(this.global.removeCartItem(this.categories[parentIndex].items[childIndex]));
    this.calculateTotal();
  }

  showConflict() {
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
              this.addToCart();
            }
          }
        ]
      });
      confirm.present();
    })
  }

}