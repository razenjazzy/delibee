import { Component, Inject } from '@angular/core';
import { NavController } from 'ionic-angular';
import { AdditemPage } from '../additem/additem';
import { Item } from '../../models/item.models';
import { Global } from '../../providers/global';
import { ClientService } from '../../providers/client.service';
import { TranslateService } from '@ngx-translate/core';
import { APP_CONFIG, AppConfig } from '../../app/app.config';
import { Subscription } from 'rxjs/Subscription';
import { Helper } from '../../models/helper';

@Component({
  selector: 'page-items',
  templateUrl: 'items.html',
  providers: [Global, ClientService]
})
export class ItemsPage {
  private query: string = "approved";
  private subscriptions = new Array<Subscription>();
  private currency: string;
  private toShow = new Array<Item>();
  private items = new Array<Item>();
  private itemsPending = new Array<Item>();
  private pageNo1: number = 1;
  private pageNo2: number = 1;
  private allDone1 = false;
  private allDone2 = false;
  private isLoading = true;
  private refresher: any;
  private infiniteScroll: any;

  constructor(@Inject(APP_CONFIG) private config: AppConfig, private navCtrl: NavController,
    private translate: TranslateService, private global: Global, private service: ClientService) {
    this.currency = Helper.getSetting("currency");
    this.translate.get('loading').subscribe(value => {
      this.global.presentLoading(value);
    });
    this.getItems("approved");
    this.getItems("pending");
  }

  onSegmentChange() {
    setTimeout(() => {
      this.toShow = this.query == "approved" ? this.items : this.itemsPending;
    }, 100);
  }

  ionViewDidEnter() {
    let itemUpdated: Item = JSON.parse(window.localStorage.getItem("itemUpdated"));
    let itemAdded: Item = JSON.parse(window.localStorage.getItem("itemAdded"));
    if (itemUpdated && itemUpdated.id) {
      if (this.updateItemInList(itemUpdated)) {
        this.onSegmentChange();
      }
    } else if (itemAdded && itemAdded.id) {
      this.itemsPending.unshift(itemAdded);
      this.onSegmentChange();
    }
    window.localStorage.removeItem("itemAdded");
    window.localStorage.removeItem("itemUpdated");
  }

  getItems(status) {
    let subscription: Subscription = this.service.getItems(status ? status : this.query, this.query == "approved" ? this.pageNo1 : this.pageNo2).subscribe(res => {
      this.isLoading = false;
      if ((status ? status : this.query) == "approved") {
        this.allDone1 = (!res.data || !res.data.length);
        this.items = this.items.concat(res.data);
      } else {
        this.allDone2 = (!res.data || !res.data.length);
        this.itemsPending = this.itemsPending.concat(res.data);
      }
      this.onSegmentChange();
      this.global.dismissLoading();
      if (this.infiniteScroll) this.infiniteScroll.complete();
      if (this.refresher) this.refresher.complete();
    }, err => {
      this.global.dismissLoading();
      if (this.infiniteScroll) this.infiniteScroll.complete();
      if (this.refresher) this.refresher.complete();
      console.log('items_err', err);
    });
    this.subscriptions.push(subscription);
  }

  doRefresh(refresher) {
    if (this.isLoading) refresher.complete();
    this.refresher = refresher;
    if (this.query == "approved") {
      this.pageNo1 = 1;
      this.items = new Array<Item>();
    } else {
      this.pageNo2 = 1;
      this.itemsPending = new Array<Item>();
    }
    this.getItems(null);
  }

  doInfinite(infiniteScroll: any) {
    this.infiniteScroll = infiniteScroll;
    if (this.query == "approved" && !this.allDone1) {
      this.pageNo1 = this.pageNo1 + 1;
      this.getItems(null);
    } else if (!this.allDone2) {
      this.pageNo2 = this.pageNo2 + 1;
      this.getItems(null);
    } else {
      infiniteScroll.complete();
    }
  }

  updateItem(item) {
    let categories = new Array<number>();
    for (var i = 0; i < item.categories.length; ++i) {
      categories.push(item.categories[i].id);
    }
    delete item.categories;
    // item.delete("categories");
    item.categories = categories;
    item.is_available = item.available ? '1' : '0';
    this.translate.get('address_saving').subscribe(value => {
      this.global.presentLoading(value);
    });

    // console.log(JSON.stringify(item));
    let subscription: Subscription = this.service.updateItem(item).subscribe(res => {
      if (this.updateItemInList(res)) {
        this.onSegmentChange();
      }
      this.global.dismissLoading();
    }, err => {
      this.global.dismissLoading();
      console.log('cat_err', err);
    });
    this.subscriptions.push(subscription);
  }

  updateItemInList(res: Item): boolean {
    let updated = false;
    let index = -1
    for (let i = 0; i < this.items.length; i++) {
      if (this.items[i].id == res.id) {
        index = i;
        break;
      }
    }
    if (index == -1) {
      for (let i = 0; i < this.itemsPending.length; i++) {
        if (this.itemsPending[i].id == res.id) {
          index = i;
          break;
        }
      }
      if (index != -1) {
        this.itemsPending[index] = res;
        updated = true;
      }
    } else {
      this.items[index] = res;
      updated = true;
    }
    return updated;
  }

  additem() {
    this.navCtrl.push(AdditemPage);
  }

  itemdetails(item) {
    this.navCtrl.push(AdditemPage, { item: item });
  }
}
