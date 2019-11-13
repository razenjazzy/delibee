import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs/Subscription';
import { Global } from '../../providers/global';
import { ClientService } from '../../providers/client.service';
import { Order } from '../../models/order.models';
import { Helper } from '../../models/helper';
import { PaymentMethod } from '../../models/payment-methods.models';
import { Constants } from '../../models/constants.models';

@Component({
  selector: 'page-delivery',
  templateUrl: 'delivery.html',
  providers: [Global, ClientService]
})

export class DeliveryPage {
  private subscriptions = new Array<Subscription>();
  private currency: string;
  private orders: Array<Order>;
  private infiniteScroll: any;
  private pageNo: number = 1;
  private allDone = false;
  private isLoading = true;
  private refresher: any;
  private payments = new Array<PaymentMethod>();

  constructor(public navCtrl: NavController, private translate: TranslateService,
    private global: Global, private service: ClientService) {
    this.currency = Helper.getSetting("currency");
    let payments = JSON.parse(window.localStorage.getItem(Constants.PAYMENT_GATEWAYS));
    if (payments) this.payments = payments;
    this.getOrders();
  }

  getOrders() {
    this.translate.get('loading').subscribe(value => {
      this.global.presentLoading(value);
    });
    let subscription: Subscription = this.service.orders(null, 0, 1, this.pageNo).subscribe(res => {
      if (!this.orders) this.orders = new Array<Order>();
      this.isLoading = false;
      this.allDone = (!res.data || !res.data.length);
      this.orders = this.orders.concat(res.data);
      this.global.dismissLoading();
      if (this.infiniteScroll) this.infiniteScroll.complete();
      if (this.refresher) this.refresher.complete();
    }, err => {
      this.isLoading = false;
      this.global.dismissLoading();
      if (this.infiniteScroll) this.infiniteScroll.complete();
      if (this.refresher) this.refresher.complete();
      console.log('orders_err', err);
    });
    this.subscriptions.push(subscription);
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

  doRefresh(refresher) {
    if (this.isLoading) refresher.complete();
    this.refresher = refresher;
    this.pageNo = 1;
    this.orders = new Array<Order>();
    this.getOrders();
  }

  doInfinite(infiniteScroll: any) {
    this.infiniteScroll = infiniteScroll;
    if (!this.allDone) {
      this.pageNo = this.pageNo + 1;
      this.getOrders();
    } else {
      infiniteScroll.complete();
    }
  }

}