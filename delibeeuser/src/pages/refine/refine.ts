import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { RefineSetting } from '../../models/refine-setting.models';
import { Constants } from '../../models/constants.models';

@Component({
  selector: 'page-refine',
  templateUrl: 'refine.html'
})
export class RefinePage {
  private refineSetting: RefineSetting;
  private structure: any;
  private veg_only = 0;
  private price_sort = 0;

  constructor(private navCtrl: NavController) {
    this.refineSetting = JSON.parse(window.localStorage.getItem(Constants.KEY_REFINE_SETTING));
    if (!this.refineSetting) {
      this.refineSetting = new RefineSetting();
    }
    this.veg_only = this.refineSetting.vegOnly ? 1 : 0;
    this.price_sort = this.refineSetting.cost_for_two_sort == "asc" ? 0 : 1;
    this.structure = { lower: this.refineSetting.cost_for_two_min, upper: this.refineSetting.cost_for_two_max };
  }

  resetRefine() {
    this.refineSetting = new RefineSetting();
    this.veg_only = this.refineSetting.vegOnly ? 1 : 0;
    this.price_sort = this.refineSetting.cost_for_two_sort == "asc" ? 0 : 1;
    this.structure = { lower: this.refineSetting.cost_for_two_min, upper: this.refineSetting.cost_for_two_max };
  }

  setRange(range) {
    this.refineSetting.cost_for_two_min = range.lower;
    this.refineSetting.cost_for_two_max = range.upper;
  }

  applyFilter() {
    this.refineSetting.vegOnly = this.veg_only == 1;
    this.refineSetting.cost_for_two_sort = this.price_sort == 0 ? "asc" : "dsc";
    console.log('on-apply', this.refineSetting);
    window.localStorage.setItem(Constants.KEY_REFINE_SETTING, JSON.stringify(this.refineSetting));
    this.navCtrl.pop();
  }

}
