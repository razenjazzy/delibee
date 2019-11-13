import { Component, Inject } from '@angular/core';
import { NavController, MenuController, AlertController, Events, ModalController } from 'ionic-angular';
import { OtpPage } from '../otp/otp';
import { SignInRequest } from '../../models/signin-request.models';
import { ClientService } from '../../providers/client.service';
import { Constants } from '../../models/constants.models';
import { SignUpRequest } from '../../models/signup-request.models';
import { APP_CONFIG, AppConfig } from '../../app/app.config';
import { TabsPage } from '../tabs/tabs';
import { ForgotpasswordPage } from '../forgotpassword/forgotpassword';
import { Global } from '../../providers/global';
import { TranslateService } from '@ngx-translate/core';
import { PhonePage } from '../phone/phone';
import { ProfilePage } from '../profile/profile';

@Component({
  selector: 'page-signin',
  templateUrl: 'signin.html',
  providers: [ClientService, Global]
})
export class SigninPage {
  login: string = "signin";
  gaming: string = "nes";
  private passwordType = 'password';
  private passwordIcon = 'eye-off';
  private signInRequest = new SignInRequest('', '');
  private signUpRequest = new SignUpRequest('', '', '', '');
  private passwordConfirm = '';
  private countries: any;
  private phoneNumber: string;
  private countryCode: string = "880";
  private phoneNumberFull: string;

  constructor(@Inject(APP_CONFIG) public config: AppConfig, public navCtrl: NavController, public menuCtrl: MenuController,
    private alertCtrl: AlertController, private modalCtrl: ModalController, private global: Global,
    private clientService: ClientService, private translate: TranslateService, private events: Events) {
    this.menuCtrl.enable(false, 'myMenu');
    this.getCountries();
  }

  openPhone() {
    const modal = this.modalCtrl.create(PhonePage);
    modal.present();
    modal.onDidDismiss((res) => {
      console.log("Phone page dismissed");
      this.phoneNumberFull = res;
      this.alertPhone(true);
    })
  }

  getCountries() {
    this.clientService.getCountries().subscribe(data => {
      this.countries = data;
    }, err => {
      console.log(err);
    })
  }

  requestSignIn() {
    var reg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
    if (this.signInRequest.email.length <= 5 || !reg.test(this.signInRequest.email)) {
      // this.showToast('Enter valid email address');
      this.translate.get('invalid_email').subscribe(value => {
        this.global.showToast(value);
      });
    } else if (!this.signInRequest.password.length) {
      // this.showToast('Enter password');
      this.translate.get('enter_password').subscribe(value => {
        this.global.showToast(value);
      });
    } else {
      this.translate.get('loading').subscribe(value => {
        this.global.presentLoading(value);
      });
      // this.global.presentLoading('Loading in');
      this.clientService.login(this.signInRequest).subscribe(res => {
        this.global.dismissLoading();
        if (res.user.mobile_verified == 1) {
          this.checkForProfile(res);
        } else {
          this.navCtrl.setRoot(OtpPage, { phoneNumberFull: res.user.mobile_number });
        }
      }, err => {
        console.log(err);
        this.global.dismissLoading();
        this.translate.get('invalid_credentials').subscribe(value => {
          this.global.presentErrorAlert(value);
        });
        // this.global.presentErrorAlert('Unable to authorise with provided credentials');
      });
    }
  }

  checkForProfile(resLogin) {
    this.translate.get('loading_profile').subscribe(value => {
      this.global.presentLoading(value);
    });
    this.clientService.getStoreProfile(resLogin.token).subscribe(res => {
      this.global.dismissLoading();
      if (res.id && res.name && res.name.length) {
        window.localStorage.setItem(Constants.STORE_DETAILS, JSON.stringify(res));
        window.localStorage.setItem(Constants.KEY_USER, JSON.stringify(resLogin.user));
        window.localStorage.setItem(Constants.KEY_TOKEN, resLogin.token);
        this.events.publish("event:user", resLogin.user);
        this.navCtrl.setRoot(TabsPage);
      } else {
        this.translate.get('profile_need').subscribe(value => {
          this.global.showToast(value);
        });
        this.navCtrl.setRoot(ProfilePage, { login_res: resLogin });
      }
    }, err => {
      this.translate.get('profile_need').subscribe(value => {
        this.global.showToast(value);
      });
      this.global.dismissLoading();
      console.log('profile_err', err);
      this.navCtrl.setRoot(ProfilePage, { login_res: resLogin });
    });
  }

  validateSignupForm() {
    var reg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
    if (!this.signUpRequest.name.length) {
      this.translate.get('invalid_name').subscribe(value => {
        this.global.showToast(value);
      });
      // this.global.showToast('Enter valid name');
    } else if (this.signUpRequest.email.length <= 5 || !reg.test(this.signUpRequest.email)) {
      this.translate.get('invalid_email').subscribe(value => {
        this.global.showToast(value);
      });
      // this..globalshowToast('Enter valid email address');
    } else if (this.signUpRequest.password.length < 6) {
      this.translate.get('invalid_password').subscribe(value => {
        this.global.showToast(value);
      });
      // this.global.showToast('Enter atleast 6 character password');
    } else if (this.signUpRequest.password != this.passwordConfirm) {
      this.translate.get('invalid_password1').subscribe(value => {
        this.global.showToast(value);
      });
      // this.global.showToast('Enter valid password twice');
    } else if (!this.countryCode || !this.countryCode.length) {
      this.translate.get('select_country').subscribe(value => {
        this.global.showToast(value);
      });
      // this.global.showToast('Enter valid password twice');
    } else if (!this.phoneNumber || !this.phoneNumber.length) {
      this.translate.get('select_phone').subscribe(value => {
        this.global.showToast(value);
      });
      // this.global.showToast('Enter valid password twice');
    } else {
      this.alertPhone(false);
    }
  }

  requestSignUp() {
    this.translate.get('signing_up').subscribe(value => {
      this.global.presentLoading(value);
    });
    // this.global.presentLoading('signing_up');
    this.clientService.signUp(this.signUpRequest).subscribe(res => {
      this.global.dismissLoading();
      this.navCtrl.setRoot(OtpPage, { phoneNumberFull: res.user.mobile_number });
    }, err => {
      console.log(err);
      this.global.dismissLoading();
      let errMsg;
      this.translate.get('invalid_credentials').subscribe(value => {
        errMsg = value;
        if (err && err.errors) {
          if (err.errors.email) {
            errMsg = err.errors.email[0];
          } else if (err.errors.password) {
            errMsg = err.errors.password[0];
          } else if (err.errors.mobile_number) {
            errMsg = err.errors.mobile_number[0];
          }
        }
        this.global.presentErrorAlert(errMsg);
      });
    });
  }

  alertPhone(modal) {
    if (!modal) this.phoneNumberFull = "+" + this.countryCode + this.phoneNumber.substr(this.phoneNumber.length-10,this.phoneNumber.length);
    this.translate.get(['yes', 'no', 'alert_msg']).subscribe(text => {
      let alert = this.alertCtrl.create({
        title: this.phoneNumberFull,
        message: text['alert_msg'],
        buttons: [{
          text: text['no'],
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        },
        {
          text: text['yes'],
          handler: () => {
            this.signUpRequest.mobile_number = this.phoneNumberFull;
            this.requestSignUp();
          }
        }]
      });
      alert.present();
    })
  }

  showHidePassword() {
    this.passwordType = this.passwordType == 'text' ? 'password' : 'text';
    this.passwordIcon = this.passwordIcon == 'eye-off' ? 'eye' : 'eye-off';
  }

  forgotpassword() {
    this.navCtrl.push(ForgotpasswordPage);
  }
}