import { Component } from '@angular/core';
import { NavController, Events, AlertController } from 'ionic-angular';
import { RaterestroPage } from '../raterestro/raterestro';
import { Constants } from '../../models/constants.models';
import { ClientService } from '../../providers/client.service';
import { Global } from '../../providers/global';
import { Subscription } from 'rxjs/Subscription';
import { TranslateService } from '@ngx-translate/core';
import { Helper } from '../../models/helper';
import { TrackorderPage } from '../trackorder/trackorder';

@Component({
  selector: 'page-myorders',
  templateUrl: 'myorders.html',
  providers: [ClientService, Global]
})
export class MyordersPage {
  private subscriptions: Array<Subscription> = [];
  private currency: string = "";
  private orders: Array<any>;
  private isLoading = true;
  private infiniteScroll: any;
  private pageNo: number = 1;
  private allDone = false;
  private getOrdersInProgress = false;
  private order_id_to_open = -1;

  constructor(private translate: TranslateService, private navCtrl: NavController, private service: ClientService,
    private global: Global, private events: Events, private alertCtrl: AlertController) {
    let settingValues = Helper.getSettings(["currency"]);
    if (settingValues.length) {
      this.currency = settingValues[0];
    }
    this.translate.get('loading').subscribe(text => {
      this.global.presentLoading(text);
      this.getOrders();
    });
    this.events.subscribe("get:orders", (res) => {
      this.order_id_to_open = res;
      if (!this.getOrdersInProgress || this.pageNo != 1) {
        this.subscriptions.forEach((subscription: Subscription) => {
          subscription.unsubscribe();
        });
        this.global.dismissLoading();
        console.log("event catched means order status updates");
        this.pageNo = 1;
        this.orders = new Array<any>();
        this.translate.get('loading').subscribe(text => {
          this.global.presentLoading(text);
          this.getOrders();
        });
      }
    });
  }

  ionViewWillLeave() {
    this.subscriptions.forEach((subscription: Subscription) => {
      subscription.unsubscribe();
    });
    this.global.dismissLoading();
  }

  getOrders() {
    this.getOrdersInProgress = true;
    let subscription: Subscription = this.service.getOrders(window.localStorage.getItem(Constants.KEY_TOKEN), this.pageNo).subscribe(res => {
      this.getOrdersInProgress = false;
      this.isLoading = false;

      for (let o of res.data) {
        if (o.created_at) {
          o.main_date = new Date(o.created_at);
        }
        if (this.order_id_to_open && this.order_id_to_open == o.id) {
          o.open = true;
        }
        switch (o.status) {
          case "complete":
            o.trakingNumber = 4;
            break;
          case "intransit":
            o.trakingNumber = 3;
            break;
          case "dispatched":
            o.trakingNumber = 3;
            break;
          case "accepted":
            o.trakingNumber = 1;
            break;
          case "new":
            o.trakingNumber = 0;
            break;
        }
      }
      if (!this.orders) this.orders = new Array<any>();
      this.allDone = (!res.data || !res.data.length);
      this.orders = this.orders.concat(res.data);
      this.global.dismissLoading();
      if (this.infiniteScroll) this.infiniteScroll.complete();
    }, err => {
      this.getOrdersInProgress = false;
      this.isLoading = false;
      console.log('created order err', err);
      this.global.dismissLoading();
      if (this.infiniteScroll) this.infiniteScroll.complete();
    });
    this.subscriptions.push(subscription);
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

  isRated(id, sid): boolean {
    return this.global.isReviewGiven(id, sid);
  }

  giveReview(order) {
    this.navCtrl.push(RaterestroPage, { order: order });
  }

  showRejectReason(order) {
    if (order.status == "rejected" && order.reject_reason && order.reject_reason.length) {
      this.translate.get(['reject_reason', 'okay']).subscribe(text => {
        let alert = this.alertCtrl.create({
          title: text['reject_reason'],
          message: order.reject_reason,
          buttons: [{
            text: text['okay'],
            role: 'cancel',
            handler: () => {
              console.log('Cancel clicked');
            }
          }]
        });
        alert.present();
      });
    }
  }

  trackOrder(order) {
    if (order && order.delivery_profile && order.delivery_status == "started") {
      this.navCtrl.push(TrackorderPage, { order: order });
    } else {
      this.translate.get('track_na').subscribe(text => {
        this.global.showToast(text);
      });
    }
  }
}