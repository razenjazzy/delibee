import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { StoreRating } from '../../models/store-ratings.models';
import { Global } from '../../providers/global';
import { ClientService } from '../../providers/client.service';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'page-review',
  templateUrl: 'review.html',
  providers: [Global, ClientService]
})

export class ReviewPage {
  private subscriptions = new Array<Subscription>();
  private reviews = new Array<StoreRating>();
  private infiniteScroll: any;
  private pageNo: number = 1;
  private allDone = false;
  private isLoading = true;

  constructor(public navCtrl: NavController, private global: Global,
    private service: ClientService, private translate: TranslateService) {
    this.translate.get('loading').subscribe(value => {
      this.global.presentLoading(value);
    });
    this.getStoreRatings();
  }

  getStoreRatings() {
    let subscription: Subscription = this.service.getStoreRatings(this.pageNo).subscribe(res => {
      this.isLoading = false;
      this.allDone = (!res.data || !res.data.length);
      this.reviews = this.reviews.concat(res.data);
      this.global.dismissLoading();
      if (this.infiniteScroll) this.infiniteScroll.complete();
    }, err => {
      this.global.dismissLoading();
      if (this.infiniteScroll) this.infiniteScroll.complete();
      console.log('reviews_err', err);
    });
    this.subscriptions.push(subscription);
  }

  doInfinite(infiniteScroll: any) {
    this.infiniteScroll = infiniteScroll;
    if (!this.allDone) {
      this.pageNo = this.pageNo + 1;
      this.getStoreRatings();
    } else {
      infiniteScroll.complete();
    }
  }

}