import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { HomePage } from '../home/home';
import { Constants } from '../../models/constants.models';
import { CartItem } from '../../models/cart-item.models';
import { ClientService } from '../../providers/client.service';
import { Global } from '../../providers/global';
import { Subscription } from 'rxjs/Subscription';
import { Store } from '../../models/store.models';
import { Coupon } from '../../models/coupon.models';
import { TranslateService } from '@ngx-translate/core';
import { Helper } from '../../models/helper';
import { CartPage } from '../cart/cart';
import { CouponUser } from '../../models/coupon-user.models';

@Component({
  selector: 'page-confirmorder',
  templateUrl: 'confirmorder.html',
  providers: [ClientService, Global]
})
export class ConfirmorderPage {
  private subscriptions: Array<Subscription> = [];
  private cartItems = new Array<CartItem>();
  private order: any = {};
  private store: Store;
  private currency: string = "";
  private tax_in_percent: string = "0";
  private delivery_fee = 0;
  private subTotal: number = 0;
  private remaining: number = 0;
  private totalServiceFee: number = 0;
  private total: number = 0;
  private couponAmount: string;
  private discount: number = 0;
  private coupon: Coupon;
  private couponUser: CouponUser;
  private stripeCardTokenId: string;

  constructor(private translate: TranslateService, private navCtrl: NavController,
    private service: ClientService, private global: Global, private params: NavParams) {
    let settingValues = Helper.getSettings(["currency", "tax_in_percent"]);
    if (settingValues.length) {
      this.currency = settingValues[0];
      this.tax_in_percent = settingValues[1];
    }

    this.order = this.params.get("order");
    this.stripeCardTokenId = this.params.get("stripeCardTokenId");
    this.cartItems = global.getCartItems();
    this.store = JSON.parse(window.localStorage.getItem(Constants.SELECTED_STORE));
    console.log("order", this.order);
    console.log("cart items", this.cartItems);
    this.calculateTotal();

    let address = JSON.parse(window.localStorage.getItem(Constants.SELECTED_ADDRESS));
    if (address && address.id && this.store && this.store.id) {
      this.subscriptions.push(this.service.calculateDeliveryFee(window.localStorage.getItem(Constants.KEY_TOKEN), { address_id: Number(address.id), store_id: this.store.id }).subscribe(res => {
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

  calculateTotal() {
    this.cartItems = this.global.getCartItems();
    let sum: number = 0;
    let offerAmmount: number = 0
    for (let item of this.cartItems) {
      sum += item.priceTotal;
    }
    this.subTotal = Number(sum.toFixed(2));
    if (this.tax_in_percent) {
      this.totalServiceFee = Number(((sum * Number(this.tax_in_percent)) / 100).toFixed(2));
    }
    let couponCode: Coupon = JSON.parse(window.localStorage.getItem(Constants.SELECTED_COUPON));
    if (couponCode) {
      this.coupon = couponCode;
      this.couponAmount = Number(this.coupon.reward).toFixed(2) + (this.coupon.type == 'percent' ? '%' : '');
      let discount = (this.coupon ? this.coupon.type == 'percent' ? (sum * Number(this.coupon.reward) / 100) : Number(this.coupon.reward) : 0);
      offerAmmount = sum - discount;
      this.total = Number((offerAmmount + this.totalServiceFee + this.delivery_fee).toFixed(2));
    } else this.total = Number((sum + this.totalServiceFee + this.delivery_fee).toFixed(2));
  }

  createOrder() {
    this.order.address_id = Number(this.order.address_id);
    this.order.payment_method_id = Number(this.order.payment_method_id);
    this.order.store_id = this.store.id;
    this.order.items = [];
    for (let ci of this.cartItems) {
      let cs = new Array<{ menu_item_choice_id: number }>();
      if (ci.item.menu_item_groups) {
        for (let g of ci.item.menu_item_groups) {
          for (let c of g.menu_item_choices) {
            if (c.selected) cs.push({ menu_item_choice_id: c.id });
          }
        }
      }
      if (ci.item.quantity >= ci.quantity) {
        this.order.items.push({
          menu_item_id: ci.item_id,
          quantity: ci.quantity
        })
      } else {
        this.global.dismissLoading();
        this.translate.get('item_qty_overflow').subscribe(text => {
          this.global.showToast(text);
        });
        break;
      }
    }

    this.translate.get('creating_order').subscribe(text => {
      this.global.presentLoading(text);
    })
    let subscription: Subscription = this.service.createOrder(window.localStorage.getItem(Constants.KEY_TOKEN), this.order).subscribe(res => {
      console.log('created order', res);
      this.global.dismissLoading();
      this.global.clearCart();
      this.translate.get('order_success').subscribe(text => {
        this.global.showToast(text);
      });
      for (let x of this.cartItems) {
        this.remaining = x.item.quantity - x.quantity;
        x.item.quantity = this.remaining;
        if (this.remaining < 0) {
          this.global.dismissLoading();
          this.translate.get('item_qty_overflow').subscribe(text => {
            this.global.showToast(text);
          });
          break;
        }
        this.quantityUpdated(x.item);
        if (this.coupon) {
          this.couponUser = new CouponUser();
          this.couponUser.coupon_id = this.coupon.id;
          console.log('Coupon user', this.couponUser);
          this.couponUserCreated(this.couponUser);
        }
      }
      this.orderCreated(res.id);
    }, err => {
      console.log('created order err', err);
      this.global.dismissLoading();
    });
    this.subscriptions.push(subscription);
  }

  quantityUpdated(item) {
    let subscription: Subscription = this.service.updateItem(window.localStorage.getItem(Constants.KEY_TOKEN), item.id, item).subscribe(res => {
      console.log('quantity updated', res);
    }, err => {
      this.global.dismissLoading();
      console.log('quantity not updated', err);
    });
    this.subscriptions.push(subscription);

  }

  couponUserCreated(couponUser) {
    let subscription: Subscription = this.service.postCoupon(couponUser).subscribe(res => {
      console.log('coupon user created', res);
    }, err => {
      this.global.dismissLoading();
      console.log('coupon user not created', err);
    });
    this.subscriptions.push(subscription);
  }

  orderCreated(orderId) {
    if (this.stripeCardTokenId) {
      this.translate.get('order_success').subscribe(text => {
        this.global.presentLoading(text);
      });
      let subscription: Subscription = this.service.stripePayment(window.localStorage.getItem(Constants.KEY_TOKEN), orderId, { token: this.stripeCardTokenId }).subscribe(data => {
        this.global.dismissLoading();
        console.log(data);
        this.translate.get('payment_success').subscribe(text => {
          this.global.showToast(text);
        });
        this.navCtrl.setRoot(HomePage);
      }, err => {
        this.translate.get('payment_fail').subscribe(text => {
          this.global.showToast(text);
        });
        this.global.dismissLoading();
        console.log(err);
        this.navCtrl.setRoot(HomePage);
      });
      this.subscriptions.push(subscription);

    } else {
      this.navCtrl.setRoot(HomePage);
    }
  }

}