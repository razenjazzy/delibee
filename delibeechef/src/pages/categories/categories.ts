import { Component, Inject } from '@angular/core';
import { NavController, NavParams, ViewController } from 'ionic-angular';
import { Category } from '../../models/category.models';
import { Constants } from '../../models/constants.models';
import { Global } from '../../providers/global';
import { TranslateService } from '@ngx-translate/core';
import { APP_CONFIG, AppConfig } from '../../app/app.config';

/**
 * Generated class for the CategoriesPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-categories',
  templateUrl: 'categories.html',
  providers: [Global]
})
export class CategoriesPage {
  private categories = new Array<Category>();

  constructor(@Inject(APP_CONFIG) private config: AppConfig, public navCtrl: NavController,
    public navParams: NavParams, private viewCtrl: ViewController, private translate: TranslateService) {

  }

  ionViewDidLoad() {
    let Ids: Array<number> = JSON.parse(window.localStorage.getItem("selectedIds"));
    let categories: Array<Category> = this.navParams.get("categories");
    if (categories) {
      if (!Ids) Ids = new Array<number>();
      for (var i = 0; i < categories.length; i++) {
        for (var j = 0; j < Ids.length; j++) {
          if (Number(Ids[j]) == categories[i].id) {
            categories[i].selected = true;
          }
        }
      }
      this.categories = JSON.parse(JSON.stringify(categories));
    }
    console.log('ionViewDidLoad CategoriesPage');
  }

  dismiss(ok) {
    if (ok) {
      let Ids = new Array<number>();
      for (var i = 0; i < this.categories.length; i++) {
        if (this.categories[i].selected) {
          Ids.push(this.categories[i].id);
        }
      }
      if (Ids.length)
        window.localStorage.setItem("selectedIds", JSON.stringify(Ids));
    }
    this.viewCtrl.dismiss(ok);
  }
}