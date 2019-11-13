import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { TranslateService } from '@ngx-translate/core';
import { Constants } from '../../models/constants.models';
import { User } from '../../models/user.models';

@Component({
  selector: 'page-profile',
  templateUrl: 'profile.html'
})

export class ProfilePage {
  private user:User;

  constructor(public navCtrl: NavController) {
    this.user = JSON.parse(window.localStorage.getItem(Constants.KEY_USER));
    console.log(JSON.stringify(this.user));
  }
    //chefdetail(){
   // this.navCtrl.push(ChefdetailPage);
  //}


}
