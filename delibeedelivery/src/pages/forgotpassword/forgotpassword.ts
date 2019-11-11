import { NavController, ToastController, Loading, LoadingController } from 'ionic-angular';
import { Component } from '@angular/core';
import { TabsPage } from '../tabs/tabs';
import { SigninPage } from '../signin/signin';
import { ClientService } from '../../providers/client.service';
import { Global } from '../../providers/global';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'page-forgotpassword',
  templateUrl: 'forgotpassword.html',
  providers: [ClientService, Global]
})
export class ForgotpasswordPage {
  private loading: Loading;
  private loadingShown: Boolean = false;
  private email = "";

  constructor(private global: Global, private translate: TranslateService, private navCtrl: NavController,
    private loadingCtrl: LoadingController, private clientService: ClientService,
    private toastCtrl: ToastController) { }

  goBack() {
    this.navCtrl.pop();
  }

  requestReset() {
    var reg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
    if (this.email.length <= 5 || !reg.test(this.email)) {
      this.translate.get('invalid_email').subscribe(text => {
        this.global.showToast(text);
      })
      // this.global.showToast('Enter valid email address');
    } else {
      this.translate.get('rqst_reset_password').subscribe(text => {
        this.global.presentLoading(text);
      })
      // this.global.presentLoading('Requesting password reset');
      this.clientService.forgetPassword({ email: this.email }).subscribe(res => {
        this.global.dismissLoading();
        this.translate.get('check_mail').subscribe(text => {
          this.global.showToast(text);
        });
        this.navCtrl.pop();
      }, err => {
        this.global.dismissLoading();
        this.navCtrl.pop();
      });
    }
  }

}
