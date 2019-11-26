import { Component } from '@angular/core';
import { NavController, Loading, AlertController } from 'ionic-angular';
import { RefinePage } from '../refine/refine';
import { ChefdetailPage } from '../chefdetail/chefdetail';
import { SelectareaPage } from '../selectarea/selectarea';
import { MyLocation } from '../../models/my-location.models';
import { Constants } from '../../models/constants.models';
import { ClientService } from '../../providers/client.service';
import { Global } from '../../providers/global';
import { Subscription } from 'rxjs/Subscription';
import { CategoryFood } from '../../models/category-food.models';
import { RefineSetting } from '../../models/refine-setting.models';
import { Store } from '../../models/store.models';
import { Helper } from '../../models/helper';
import { CartPage } from '../../pages/cart/cart';
import { CartItem } from '../../models/cart-item.models';
import { TranslateService } from '@ngx-translate/core';
import { User } from '../../models/user.models';
import { Diagnostic } from '@ionic-native/diagnostic';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html',
  providers: [ClientService, Global]
})
export class HomePage {
  private loading: Loading;
  private loadingShown: Boolean = false;
  private searchText = "";
  private selectedLocation: MyLocation;
  private refineSetting: RefineSetting;
  private categories: Array<CategoryFood>;
  private stores = new Array<Store>();
  private infiniteScroll: any;
  private subscriptions: Array<Subscription> = [];
  private cartItems: Array<CartItem>;
  private cartPage: any = CartPage;
  private doneAll = false;
  private isLoading = true;
  private pageNo = 1;
  private categoryId = -1;
  private currency: string = "";
  private favorite: number;
  private user: User;

  constructor(private navCtrl: NavController, private service: ClientService, private global: Global,
    private translate: TranslateService, private alertCtrl: AlertController, private diagnostic: Diagnostic) {
    let settingValues = Helper.getSettings(["currency"]);
    if (settingValues.length) {
      this.currency = settingValues[0];
    }
    this.cartItems = global.getCartItems();
    this.selectedLocation = JSON.parse(window.localStorage.getItem(Constants.KEY_LOCATION));
    this.refineSetting = JSON.parse(window.localStorage.getItem(Constants.KEY_REFINE_SETTING));
    this.user = JSON.parse(window.localStorage.getItem(Constants.KEY_USER));
    if (!this.refineSetting) {
      this.refineSetting = new RefineSetting();
    }

    if (this.selectedLocation) {
      this.translate.get('loading_products').subscribe(value => {
        this.global.presentLoading(value);
      });
      this.getStores(-1);
    }
    // setTimeout(() => {
    //   let store = new Store();
    //   store.id = 24;
    //   this.storeDetail(store);
    // }, 2000);
  }
  checkForLocation() {
    this.diagnostic.isLocationEnabled().then((isAvailable) => {
      if (isAvailable) {
        this.navCtrl.push(SelectareaPage);
      } else {
        this.alertLocationServices();
      }
    }).catch((e) => {
      console.error(e);
      this.alertLocationServices();
    });
  }

  alertLocationServices() {
    this.translate.get(['location_services_title', 'location_services_message', 'okay', 'search_anyway']).subscribe(text => {
      let alert = this.alertCtrl.create({
        title: text['location_services_title'],
        subTitle: text['location_services_message'],
        buttons: [{
          text: text['okay'],
          role: 'cancel',
          handler: () => {
            console.log('okay clicked');
          }
        }, {
          text: text['search_anyway'],
          role: 'cancel',
          handler: () => {
            console.log('search_anyway clicked');
            this.navCtrl.push(SelectareaPage);
          }
        }]
      });
      alert.present();
    })
  }

  ionViewWillLeave() {
    this.subscriptions.forEach((subscription: Subscription) => {
      subscription.unsubscribe();
    });
    this.global.dismissLoading();
  }

  ionViewDidEnter() {
    let needRefresh = false;
    this.cartItems = this.global.getCartItems();
    let newSelectedLocation: MyLocation = JSON.parse(window.localStorage.getItem(Constants.KEY_LOCATION));
    if (this.selectedLocation != null && newSelectedLocation != null && !Helper.isEquivalent(newSelectedLocation, this.selectedLocation)) {
      this.selectedLocation = newSelectedLocation;
      needRefresh = true;
    } else if (this.selectedLocation == null && newSelectedLocation != null) {
      this.selectedLocation = newSelectedLocation;
      needRefresh = true;
    }
    if (!this.selectedLocation) {
      this.checkForLocation();
      this.translate.get('select_location_text').subscribe(value => {
        this.global.showToast(value);
      });
      return;
    }
    let newRefineSetting: RefineSetting = JSON.parse(window.localStorage.getItem(Constants.KEY_REFINE_SETTING));
    console.log('new_rs', newRefineSetting);
    if (this.refineSetting != null && newRefineSetting != null && !Helper.isEquivalent(this.refineSetting, newRefineSetting)) {
      this.refineSetting = newRefineSetting;
      needRefresh = true;
    }
    if (needRefresh) {
      this.pageNo = 1;
      this.categories = new Array<CategoryFood>();
      this.stores = new Array<Store>();
      this.global.presentLoading("Refreshing DeliBee Chefs");
      this.getStores(-1);
      this.getCategories();
    }
  }
  
  // doRefresh(event) {
  //   console.log('Begin async operation');
  //   this.translate.get('loading_products').subscribe(value => {
  //     this.getStores(-1);
  //     this.getCategories();
  //     event.complete();
  //   });
  // }

  doRefresh(refresher) {
    console.log('Begin async operation', refresher);
    this.getStores(-1);
    this.getCategories();
    if(refresher){
      refresher.complete();
    }
  }

  getCategories() {
    this.subscriptions.push(this.service.categories(window.localStorage.getItem(Constants.KEY_TOKEN)).subscribe(res => {
      let cats: Array<CategoryFood> = res.data;
      this.categories = cats;
    }, err => {
      console.log('categories', err);
    }));
  }

  getStores(category_id: number) {
    this.isLoading = true;
    this.subscriptions.push(this.service.searchStores(window.localStorage.getItem(Constants.KEY_TOKEN), this.searchText, this.selectedLocation, this.refineSetting, category_id, String(this.pageNo), this.user).subscribe(res => {
      if (!this.categories || !this.categories.length) {
        this.getCategories();
      }
      this.doneAll = (!res.data || !res.data.length);
      this.global.dismissLoading();
      let stores: Array<any> = res.data;
        for (var i = 0; i < stores.length; i++) {
          if (stores[i].ratings)
            stores[i].ratings = Number(stores[i].ratings).toFixed(1);
        }
      this.stores = this.stores.concat(stores);
      if (this.infiniteScroll) {
        this.infiniteScroll.complete();
      }
      this.isLoading = false;
    }, err => {
      this.global.dismissLoading();
      console.log('store_err', err);
      if (this.infiniteScroll) {
        this.infiniteScroll.complete();
      }
      this.isLoading = false;
    }));
  }

  doInfinite(infiniteScroll: any) {
    if (this.doneAll) {
      infiniteScroll.complete();
    } else {
      this.infiniteScroll = infiniteScroll;
      this.pageNo = this.pageNo + 1;
      this.getStores(-1);
    }
  }

  getStoreByCategory(categoryId: number) {
    if (this.categoryId != categoryId) {
      this.categoryId = categoryId;
      this.pageNo = 1;
      this.searchText = "";
      this.stores = new Array<Store>();
      this.global.presentLoading("Loading..");
      this.getStores(categoryId);
    }
  }

  getItems() {
    this.searchText = this.searchText.trim();
    this.pageNo = 1;
    this.stores = new Array<Store>();
    this.getStores(-1);
  }

  toggleFavorite(index) {
    this.subscriptions.push(this.service.tougleFavourite(window.localStorage.getItem(Constants.KEY_TOKEN), this.stores[index].id, this.stores[index].favourite).subscribe(res => {
      console.log(res);
      this.stores[index].favourite = this.stores[index].favourite == 0 ? 1 : 0;
    }, err => {
      console.log('tougleFavourite err', err);
    }));
    this.stores[index].favourite = Number (this.global.toggleFavorite(this.stores[index]));
  }

  refine() {
    this.navCtrl.push(RefinePage);
  }

  storeDetail(store: Store) {
    this.navCtrl.push(ChefdetailPage, { store: store });
  }
}