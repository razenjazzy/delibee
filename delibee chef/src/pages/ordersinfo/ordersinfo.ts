import { Component, Inject } from '@angular/core';
import { NavController, NavParams, Events, AlertController } from 'ionic-angular';
import { OrderstatusPage } from '../orderstatus/orderstatus';
import { Global } from '../../providers/global';
import { ClientService } from '../../providers/client.service';
import { TranslateService } from '@ngx-translate/core';
import { APP_CONFIG, AppConfig } from '../../app/app.config';
import { Subscription } from 'rxjs/Subscription';
import { Constants } from '../../models/constants.models';
import { PaymentMethod } from '../../models/payment-methods.models';
import { Order } from '../../models/order.models';
import { Helper } from '../../models/helper';

@Component({
  selector: 'page-ordersinfo',
  templateUrl: 'ordersinfo.html',
  providers: [Global, ClientService]
})
export class OrdersinfoPage {
  private order: Order;
  private currency: string;
  private toUpdate: string = "accepted";
  private subscriptions = new Array<Subscription>();
  private payments: Array<PaymentMethod>;

  constructor(@Inject(APP_CONFIG) private config: AppConfig, private events: Events,
    private navCtrl: NavController, private global: Global, private params: NavParams,
    private service: ClientService, private translate: TranslateService, private alertCtrl: AlertController) {
    this.order = this.params.get("order");
    this.currency = Helper.getSetting("currency");
    this.payments = JSON.parse(window.localStorage.getItem(Constants.PAYMENT_GATEWAYS));
  }

  getPaymentMethodName(id) {
    let toReturn = "COD";
    if (this.payments && id) {
      for (let pmnt of this.payments) {
        if (pmnt.id == id) {
          toReturn = pmnt.title;
          break;
        }
      }
    }
    return toReturn;
  }

  confirmReject() {
    this.translate.get(['cancel_order', 'cancel_order_message', 'cancel_order_reason', 'cancel', 'confirm']).subscribe(text => {
      let alert = this.alertCtrl.create({
        title: text['cancel_order'],
        message: text['cancel_order_message'],
        inputs: [
          {
            name: 'reject_reason',
            placeholder: text['cancel_order_reason']
          }
        ],
        buttons: [{
          text: text['cancel'],
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        },
        {
          text: text['confirm'],
          handler: (data) => {
            this.updateOrder('rejected', data.reject_reason);
          }
        }]
      });
      alert.present();
    });
  }

  updateOrder(status, rejectReason) {
    this.toUpdate = status;
    this.translate.get('address_saving').subscribe(value => {
      this.global.presentLoading(value);
    });
    let subscription: Subscription = this.service.updateOrder(this.order.id, status == 'rejected' ? { status: this.toUpdate, reject_reason: rejectReason } : { status: this.toUpdate }).subscribe(res => {
      this.order = res;
      this.events.publish("update:order", res);
      this.global.dismissLoading();
    }, err => {
      let toastMsg: string;
      this.translate.get('smthng_wrng').subscribe(value => {
        toastMsg = value;
      });
      if (this.toUpdate == "dispatched") {
        if (err.status == 422) {
          this.translate.get('dlvry_guy_just_assigned').subscribe(value => {
            toastMsg = value;
          });
        } else if (err.status == 404) {
          this.translate.get('dlvry_guy_not_found').subscribe(value => {
            toastMsg = value;
          });
        }
      }
      this.global.dismissLoading();
      this.global.showToast(toastMsg);
      console.log('cat_err', err);
    });
    this.subscriptions.push(subscription);
  }

  navUser() {
    window.open("https://www.google.com/maps?q=" + this.order.address.latitude + "," + this.order.address.longitude, "_blank");
  }

  orderstatus() {
    this.navCtrl.push(OrderstatusPage);
  }

}