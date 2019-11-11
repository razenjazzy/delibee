import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { TranslateService } from '@ngx-translate/core';
import { Constants } from '../../models/constants.models';
import { ClientService } from '../../providers/client.service';
import { Global } from '../../providers/global';
import { Subscription } from 'rxjs/Subscription';
import { StoreRatings } from '../../models/store-ratings.models';

@Component({
  selector: 'page-review',
  templateUrl: 'review.html',
  providers: [ClientService, Global]
})
export class ReviewPage {
  private isLoading = true;
  private user: any = {};
  private reviews = new Array<StoreRatings>();
  private subscriptions: Array<Subscription> = [];
  private infiniteScroll: any;
  private pageNo: number = 1;
  private allDone = false;

  constructor(private global: Global, private service: ClientService, private translate: TranslateService) {
    this.user = JSON.parse(window.localStorage.getItem(Constants.KEY_USER));
    this.translate.get('loading').subscribe(text => {
      this.global.presentLoading(text);
      this.getReviews();
    })
  }

  getReviews() {
    let subscription: Subscription = this.service.getReviews(window.localStorage.getItem(Constants.KEY_TOKEN), this.pageNo).subscribe(res => {
      this.allDone = (!res.data || !res.data.length);
      this.isLoading = false;
      this.reviews = this.reviews.concat(res.data);
      for (var i = 0; i < this.reviews.length; ++i) {
        this.reviews[i].rating = Number(this.reviews[i].rating);
      }
      this.global.dismissLoading();
      if (this.infiniteScroll) this.infiniteScroll.complete();
    }, err => {
      this.isLoading = false;
      console.log('getReviews', err);
      this.global.dismissLoading();
      if (this.infiniteScroll) this.infiniteScroll.complete();
    });
    this.subscriptions.push(subscription);
  }

  doInfinite(infiniteScroll: any) {
    this.infiniteScroll = infiniteScroll;
    if (!this.allDone) {
      this.pageNo = this.pageNo + 1;
      this.getReviews();
    } else {
      infiniteScroll.complete();
    }
  }

}