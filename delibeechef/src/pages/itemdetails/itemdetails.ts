import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

@Component({
  selector: 'page-itemdetails',
  templateUrl: 'itemdetails.html'
})
export class ItemdetailsPage {
gaming: string = "nes";
  constructor(public navCtrl: NavController) {

  }

}
