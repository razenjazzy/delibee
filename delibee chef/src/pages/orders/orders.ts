import { Component, Inject } from '@angular/core';
import { NavController, Events } from 'ionic-angular';
import { Constants } from '../../models/constants.models';
import { Order } from '../../models/order.models';
import { OrdersinfoPage } from '../ordersinfo/ordersinfo';
import { Global } from '../../providers/global';
import { ClientService } from '../../providers/client.service';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs/Subscription';
import { APP_CONFIG, AppConfig } from '../../app/app.config';
import { Helper } from '../../models/helper';
import { PaymentMethod } from '../../models/payment-methods.models';

@Component({
  selector: 'page-orders',
  templateUrl: 'orders.html',
  providers: [Global, ClientService]
})
export class OrdersPage {
  private subscriptions = new Array<Subscription>();
  private query: string = "new";
  private toShow = new Array<Order>();
  private upcoming = new Array<Order>();
  private complete = new Array<Order>();
  private currency: string;
  private pageNo1: number = 1;
  private pageNo2: number = 1;
  private allDone1 = false;
  private allDone2 = false;
  private isLoading = true;
  private refresher: any;
  private infiniteScroll: any;
  private payments = new Array<PaymentMethod>();

  constructor(@Inject(APP_CONFIG) private config: AppConfig,
    private navCtrl: NavController, private global: Global, events: Events,
    private service: ClientService, private translate: TranslateService) {
    this.currency = Helper.getSetting("currency");
    let payments = JSON.parse(window.localStorage.getItem(Constants.PAYMENT_GATEWAYS));
    if (payments) this.payments = payments;
    this.translate.get('loading').subscribe(value => {
      this.global.presentLoading(value);
    });
    this.getOrders(true);
    this.getOrders(false);
    events.subscribe("get:orders", (res) => {
      console.log("orderrefresh");
      this.pageNo1 = 1;
      this.pageNo2 = 1;
      this.getOrders(true);
      this.getOrders(false);
    });
    events.subscribe("update:order", (order) => {
      console.log("orderupdate");
      let pos = -1;
      for (let i = 0; i < this.upcoming.length; i++) {
        if (order.id == this.upcoming[i].id) {
          pos = i;
          break;
        }
      }
      if (pos != -1) {
        this.upcoming[pos] = order;
        this.onSegmentChange();
      } else {
        for (let j = 0; j < this.complete.length; j++) {
          if (order.id == this.complete[j].id) {
            pos = j;
            break;
          }
        }
        if (pos != -1) {
          this.complete[pos] = order;
          this.onSegmentChange();
        }
      }
    });
  }

  onSegmentChange() {
    setTimeout(() => {
      this.toShow = this.query == "new" ? this.upcoming : this.complete;
    }, 100);
  }

  getOrders(showNew: boolean) {
    let subscription: Subscription = this.service.orders(showNew ? null : "complete", Number(showNew), 0, showNew ? this.pageNo1 : this.pageNo2).subscribe(res => {
      this.isLoading = false;
      for (let o of res.data) {
        if (o.status == "new" || o.status == "accepted" || o.status == "dispatched") {
          this.upcoming.push(o);
        } else {
          this.complete.push(o);
        }
      }
      if (showNew) {
        this.allDone1 = (!res.data || !res.data.length);
      } else {
        this.allDone2 = (!res.data || !res.data.length);
      }
      this.onSegmentChange();
      this.global.dismissLoading();
      if (this.infiniteScroll) this.infiniteScroll.complete();
      if (this.refresher) this.refresher.complete();
    }, err => {
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
    if (this.query == "new") {
      this.pageNo1 = 1;
      this.upcoming = new Array<Order>();
    } else {
      this.pageNo2 = 1;
      this.complete = new Array<Order>();
    }
    this.getOrders(this.query == "new");
  }

  doInfinite(infiniteScroll: any) {
    this.infiniteScroll = infiniteScroll;
    if (this.query == "new" && !this.allDone1) {
      this.pageNo1 = this.pageNo1 + 1;
      this.getOrders(true);
    } else if (!this.allDone2) {
      this.pageNo2 = this.pageNo2 + 1;
      this.getOrders(false);
    } else {
      infiniteScroll.complete();
    }
  }

  ordersinfo(order) {
    this.navCtrl.push(OrdersinfoPage, { order: order });
  }
}