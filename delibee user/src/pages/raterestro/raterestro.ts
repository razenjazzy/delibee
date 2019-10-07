import { Component } from '@angular/core';
import { NavController, NavParams, Events } from 'ionic-angular';
import { ClientService } from '../../providers/client.service';
import { Global } from '../../providers/global';
import { Subscription } from 'rxjs/Subscription';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'page-raterestro',
  templateUrl: 'raterestro.html',
  providers: [ClientService, Global]
})
export class RaterestroPage {
  private review = { review: '', rating: 3 };
  private order;
  private subscriptions: Array<Subscription> = [];

  constructor(private translate: TranslateService, private navCtrl: NavController, private service: ClientService,
    private global: Global, private params: NavParams, private events: Events) {
    this.order = this.params.get("order");
  }

  ionViewWillLeave() {
    this.subscriptions.forEach((subscription: Subscription) => {
      subscription.unsubscribe();
    });
    this.global.dismissLoading();
  }

  validate() {
    if (this.review.review.length > 140) {
      setTimeout(() => {
        let msg = this.review.review.slice(0, 140);
        this.review.review = msg;
      }, 100);
      this.translate.get('enter_review').subscribe(text => {
        this.global.showToast(text);
      })
    }
  }

  postReview() {
    if (!this.review.review.length) {
      this.translate.get('enter_review').subscribe(text => {
        this.global.showToast(text);
      })
    } else {
      this.translate.get('sending').subscribe(text => {
        this.global.presentLoading(text);
      });
      this.subscriptions.push(this.service.postReview(this.review, this.order.store.id).subscribe((res) => {
        this.global.giveReview(this.order.id, this.order.store.id);
        this.events.publish("get:orders");
        this.navCtrl.pop();
        this.global.dismissLoading();
      }, (err) => {
        console.log("Error rating:", JSON.stringify(err));
        this.global.dismissLoading();
      }));
    }
  }

}