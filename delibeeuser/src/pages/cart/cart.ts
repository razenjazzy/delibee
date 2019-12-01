import { Component } from '@angular/core';
import { NavController, ViewController, ModalController } from 'ionic-angular';
import { Global } from '../../providers/global';
import { CartItem } from "../../models/cart-item.models";
import { ShippingPage } from '../shipping/shipping';
import { CodePage } from '../code/code';
import { UserResponse } from '../../models/user-response.models';
import { Constants } from '../../models/constants.models';
import { SigninPage } from '../signin/signin';
import { HomePage } from '../home/home';
import { Coupon } from '../../models/coupon.models';
import { TranslateService } from '@ngx-translate/core';
import { Helper } from '../../models/helper';
import { Store } from '../../models/store.models';
import { ClientService } from '../../providers/client.service';
import { Subscription } from 'rxjs/Subscription';
import { Address } from '../../models/address.models';

@Component({
  selector: 'page-cart ',
  templateUrl: 'cart.html',
  providers: [ClientService, Global]
})
export class CartPage {
  private cartItems = new Array<CartItem>();
  private total: number = 0;
  private checkoutText = 'Proceed to checkout';
  private currencyText: string;
  private subTotal: number = 0;
  private currency: string = "";
  private tax_in_percent: string = "0";
  private delivery_fee: number = 0;
  private totalServiceFee: number = 0;
  private coupon: Coupon;
  private couponAmount: string = '0';
  private couponApplied: boolean = false;
  private discount: number = 0;
  private subscriptions: Array<Subscription> = [];
  private storeSelected: Store;

  constructor(private translate: TranslateService, private modalCtrl: ModalController,
    private global: Global, private navCtrl: NavController, private viewCtrl: ViewController,
    private service: ClientService) {
    let settingValues = Helper.getSettings(["currency", "tax_in_percent"]);
    if (settingValues.length) {
      this.currency = settingValues[0];
      this.tax_in_percent = settingValues[1];
    }
    let cartItems: Array<CartItem> = global.getCartItems();
    if (cartItems != null) {
      this.cartItems = this.cartItems.concat(cartItems);
    }
    this.calculateTotal();

    let address: Address = JSON.parse(window.localStorage.getItem(Constants.SELECTED_ADDRESS));
    this.storeSelected = JSON.parse(window.localStorage.getItem(Constants.SELECTED_STORE));
    if (address && address.id && this.storeSelected && this.storeSelected.id) {
      this.subscriptions.push(this.service.calculateDeliveryFee(window.localStorage.getItem(Constants.KEY_TOKEN), { address_id: Number(address.id), store_id: this.storeSelected.id }).subscribe(res => {
        console.log("calculateDeliveryFee", res);
        if (Number(res.delivery_fee) > 0) {
          this.delivery_fee = Number(res.delivery_fee);
          this.calculateTotal();
        }
      }, err => {
        console.log("calculateDeliveryFeeErr", err);
      }));
    }
  }

  ionViewWillLeave() {
    this.subscriptions.forEach((subscription: Subscription) => {
      subscription.unsubscribe();
    });
    this.global.dismissLoading();
  }

  removeItem(product) {
    this.global.removeCartItem(product);
    this.cartItems = this.global.getCartItems();
    this.calculateTotal();
  }

  decrementItem(product) {
    let decremented: boolean = this.global.decrementCartItem(product);
    if (decremented) {
      if (!this.cartItems || !this.cartItems.length) {
        this.navCtrl.setRoot(HomePage)
      } else this.calculateTotal();
    }
    let available: boolean = this.global.isItemAdded(product);
    this.cartItems = this.global.getCartItems();
    // this.translate.get(['itm_updated', 'itm_rmvd']).subscribe(text => {
    //   this.global.showToast(available ? text['itm_updated'] : text['itm_rmvd']);
    // });
  }

  incrementItem(product) {
    let incremented: boolean = this.global.incrementCartItem(product);
    if (incremented) {
      this.total = Number((this.total + Number(product.price)).toFixed(2));
      this.calculateTotal();
    }
    this.cartItems = this.global.getCartItems();
    // this.translate.get(['itm_updated', 'itm_max_err']).subscribe(text => {
    //   this.global.showToast(incremented ? text['itm_updated'] : text['itm_max_err']);
    // });
  }

  calculateTotal() {
    this.cartItems = this.global.getCartItems();
    let sum: number = 0;
    let offerAmmount: number = 0
    for (let item of this.cartItems) {
      sum += item.priceTotal;
    }
    this.subTotal = Number(sum.toFixed(2));
    if (!this.cartItems || !this.cartItems.length) {
      this.translate.get('cart_empty').subscribe(text => {
        this.checkoutText = text;
      })
    }
    if (this.tax_in_percent) {
      this.totalServiceFee = Number(((sum * Number(this.tax_in_percent)) / 100).toFixed(2));
    }

    if (this.coupon) {
      this.couponAmount = this.coupon.reward + (this.coupon.type == 'percent' ? '%' : '');
      this.discount = (this.coupon ? this.coupon.type == 'percent' ? (sum * Number(this.coupon.reward) / 100) : Number(this.coupon.reward) : 0);
      console.log("discount is:--" + this.discount);
      offerAmmount = sum - this.discount;
      this.total = Number((offerAmmount + this.totalServiceFee + this.delivery_fee).toFixed(2));
    } else {
      this.discount = 0;
      this.couponAmount = "0";
      this.total = Number((sum + this.totalServiceFee + this.delivery_fee).toFixed(2));
    }
  }

  proceedCheckout() {
    if (this.cartItems != null && this.cartItems.length > 0) {
      let user: UserResponse = JSON.parse(window.localStorage.getItem(Constants.KEY_USER));
      if (user != null) {
        if (this.storeSelected && this.total >= this.storeSelected.minimum_order) {
          if (this.coupon) {
            window.localStorage.setItem(Constants.SELECTED_COUPON, JSON.stringify(this.coupon));
          } else {
            window.localStorage.removeItem(Constants.SELECTED_COUPON);
          }
          this.navCtrl.push(ShippingPage, { coupon: this.coupon ? this.coupon.code : null, discount: this.discount });
        } else {
          this.translate.get('minimum_order').subscribe(value => {
            this.global.showToast(value + " " + this.storeSelected.minimum_order);
          });
        }
      } else {
        window.localStorage.setItem(Constants.TEMP_OPEN, Constants.TEMP_OPEN_CART);
        this.translate.get('login2next').subscribe(value => {
          this.global.showToast(value);
        });
        this.viewCtrl.dismiss();
        this.navCtrl.push(SigninPage);
      }
    }
  }

  dismiss() {
    this.viewCtrl.dismiss();
  }

  codePage() {
    let user: UserResponse = JSON.parse(window.localStorage.getItem(Constants.KEY_USER));
    if (user != null) {
      this.coupon = null;
      let modal = this.modalCtrl.create(CodePage);
      modal.onDidDismiss((data) => {
        this.coupon = data;
        this.calculateTotal();
      });
      modal.present();
    } else {
      window.localStorage.setItem(Constants.TEMP_OPEN, Constants.TEMP_OPEN_CART);
      this.translate.get('login2next').subscribe(value => {
        this.global.showToast(value);
      });
      this.viewCtrl.dismiss();
      this.navCtrl.push(SigninPage);
    }
  }

}