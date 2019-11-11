import { Component, ViewChild, Inject } from '@angular/core';
import { Nav, Platform, App, AlertController, Events } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { HomePage } from '../pages/home/home';
import { ContactusPage } from '../pages/contactus/contactus';
import { SigninPage } from '../pages/signin/signin';
import { FavoritedPage } from '../pages/favorited/favorited';
import { ReviewPage } from '../pages/review/review';
import { MyordersPage } from '../pages/myorders/myorders';
import { MydetailsPage } from '../pages/mydetails/mydetails';
import { LanguagePage } from '../pages/language/language';
import { APP_CONFIG, AppConfig } from "./app.config";
import { Constants } from '../models/constants.models';
import { ClientService } from '../providers/client.service';
import { Globalization } from '@ionic-native/globalization';
import { TranslateService } from '../../node_modules/@ngx-translate/core';
import { CartItem } from '../models/cart-item.models';
import { User } from '../models/user.models';
import { AppVersion } from '@ionic-native/app-version';
import { Market } from '@ionic-native/market';
import firebase from 'firebase';

@Component({
  templateUrl: 'app.html',
  providers: [ClientService]
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;
  pages: Array<{ title: string, component: any }>;
  private user = new User();
  rtlSide: string = "left"

  constructor(@Inject(APP_CONFIG) private config: AppConfig, private platform: Platform, private app: App,
    private statusBar: StatusBar, private splashScreen: SplashScreen,
    private clientService: ClientService, private events: Events, private translate: TranslateService,
    private globalization: Globalization, private alertCtrl: AlertController,
    private appVersion: AppVersion, private market: Market) {
    //window.localStorage.setItem(Constants.KEY_LOCATION, "{\"name\":\"fdfgdg\",\"lat\":23.7725706,\"lng\":90.4104677}");
    this.initializeApp();
    window.localStorage.removeItem(Constants.SELECTED_COUPON);
    this.events.subscribe("set:language", (languageCode) => {
      this.translate.use(languageCode);
      this.setDirectionAccordingly(languageCode);
    });
    this.events.subscribe("event:user", (res) => {
      console.log("user_event", res);
      this.user = res;
      if (this.platform.is('cordova')) {
        this.setupFcm();
      }
    });
  }

  refreshSettings() {
    this.clientService.getSettings().subscribe(res => {
      console.log('setting_setup_success', res);
      window.localStorage.setItem(Constants.KEY_SETTING, JSON.stringify(res));
    }, err => {
      console.log('setting_setup_error', err);
    });
  }

  initializeApp() {
    this.platform.ready().then(() => {
      firebase.initializeApp({
        apiKey: this.config.firebaseConfig.apiKey,
        authDomain: this.config.firebaseConfig.authDomain,
        databaseURL: this.config.firebaseConfig.databaseURL,
        projectId: this.config.firebaseConfig.projectId,
        storageBucket: this.config.firebaseConfig.storageBucket,
        messagingSenderId: this.config.firebaseConfig.messagingSenderId
      });
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      this.statusBar.styleDefault();
      this.user = JSON.parse(window.localStorage.getItem(Constants.KEY_USER));
      if (this.platform.is('cordova')) {
        this.setupFcm();
      }
      this.app.getRootNav().setRoot(HomePage);
      this.splashScreen.hide();
      this.globalize();
      this.refreshSettings();
      this.platform.registerBackButtonAction(() => {
        if (this.nav.canGoBack()) {
          this.nav.pop();
        } else if (this.nav.getActive().instance instanceof HomePage) {
          this.platform.exitApp();
        } else {
          this.home();
        }
      }, 1);
    });
  }

  setupFcm() {
    if (this.user) {
      const component = this;
      // (<any>window).FirebasePlugin.subscribe("all");
      // (<any>window).FirebasePlugin.subscribe("ios");
      // (<any>window).FirebasePlugin.subscribe("android");
      (<any>window).FirebasePlugin.getToken(function (token) {
        // save this server-side and use it to push notifications to this device
        console.log("fcm.getToken()", JSON.stringify(token));
        component.updateFCMUser(token);
      }, function (error) {
        console.error(error);
      });

      (<any>window).FirebasePlugin.onNotificationOpen(function (notification) {
        console.log("fcm.onNotification()", JSON.stringify(notification));
        component.myorders();
        component.events.publish("get:orders", notification.order_id);
      }, function (error) {
        console.error(error);
      });

      (<any>window).FirebasePlugin.onTokenRefresh(function (token) {
        // save this server-side and use it to push notifications to this device
        console.log("fcm.onTokenRefresh()", JSON.stringify(token));
        component.updateFCMUser(token);
      }, function (error) {
        console.error(error);
      });
    } else {
      // (<any>window).FirebasePlugin.unsubscribe("all");
      // (<any>window).FirebasePlugin.unsubscribe("ios");
      // (<any>window).FirebasePlugin.unsubscribe("android");
    }
  }

  updateFCMUser(token) {
    this.clientService.updateUser({ fcm_registration_id: token }).subscribe((res) => {
      console.log("FCM token registered");
    }, (err) => {
      console.log("FCM token registeration failed", JSON.stringify(err));
    });
  }

  globalize() {
    // this language will be used as a fallback when a translation isn't found in the current language
    this.translate.setDefaultLang('en');
    let defaultLang = window.localStorage.getItem(Constants.KEY_DEFAULT_LANGUAGE);
    console.log("globalaizing...");
    if (this.platform.is('cordova')) {
      // this.initOneSignal();
      if (defaultLang) {
        this.translate.use(defaultLang);
        this.setDirectionAccordingly(defaultLang);
      } else {
        this.globalization.getPreferredLanguage().then(result => {
          console.log("language detected:----" + JSON.stringify(result));
          let suitableLang = this.getSuitableLanguage(result.value);
          console.log(suitableLang);
          this.translate.use(suitableLang);
          this.setDirectionAccordingly(suitableLang);
        }).catch(e => {
          console.log(e);
          this.translate.use('en');
          this.setDirectionAccordingly('en');
        });
      }
    } else {
      console.log("cordova not detected");
      if (defaultLang) {
        this.translate.use(defaultLang);
        this.setDirectionAccordingly(defaultLang);
      } else {
        this.translate.use('en');
        this.setDirectionAccordingly('en');
      }
    }
  }

  setDirectionAccordingly(lang: string) {
    switch (lang) {
      case 'ar': {
        this.platform.setDir('ltr', false);
        this.platform.setDir('rtl', true);
        this.rtlSide = "right";
        break;
      }
      default: {
        this.platform.setDir('rtl', false);
        this.platform.setDir('ltr', true);
        this.rtlSide = "left";
        break;
      }
    }
    // this.translate.use('pt');
    // this.platform.setDir('rtl', false);
    // this.platform.setDir('ltr', true);
    // this.rtlSide = "left";
  }

  getSideOfCurLang() {
    this.rtlSide = this.platform.dir() === 'rtl' ? "right" : "left";
    return this.rtlSide;
  }

  getSuitableLanguage(language) {
    language = language.substring(0, 2).toLowerCase();
    console.log('check for: ' + language);
    return this.config.availableLanguages.some(x => x.code == language) ? language : 'en';
  }

  phonenumberPage() {
    this.translate.get(['logout_title', 'logout_message', 'no', 'yes']).subscribe(text => {
      let alert = this.alertCtrl.create({
        title: text['logout_title'],
        message: text['logout_message'],
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
            this.events.publish("event:user", null);
            this.user = null;
            window.localStorage.setItem(Constants.CART_ITEMS, JSON.stringify(new Array<CartItem>()));
            window.localStorage.removeItem(Constants.SELECTED_STORE);
            window.localStorage.removeItem(Constants.KEY_USER);
            window.localStorage.removeItem(Constants.KEY_TOKEN);
            this.signin();
          }
        }]
      });
      alert.present();
    });
  }

  favorited() {
    if (!(this.nav.getActive().instance instanceof FavoritedPage))
      this.nav.setRoot(FavoritedPage);
  }

  review() {
    if (!(this.nav.getActive().instance instanceof ReviewPage))
      this.nav.setRoot(ReviewPage);
  }

  home() {
    if (!(this.nav.getActive().instance instanceof HomePage))
      this.nav.setRoot(HomePage);
  }

  contactus() {
    if (!(this.nav.getActive().instance instanceof ContactusPage))
      this.nav.setRoot(ContactusPage);
  }

  myorders() {
    if (!(this.nav.getActive().instance instanceof MyordersPage))
      this.nav.setRoot(MyordersPage);
  }

  mydetails() {
    if (this.user) {
      if (!(this.nav.getActive().instance instanceof MydetailsPage))
        this.nav.setRoot(MydetailsPage);
    } else {
      this.nav.push(SigninPage);
    }
  }

  signin() {
    if (!(this.nav.getActive().instance instanceof SigninPage))
      this.nav.setRoot(SigninPage);
  }

  raterestro() {
    this.appVersion.getPackageName().then(pn => this.market.open(pn));
  }

  language() {
    if (!(this.nav.getActive().instance instanceof LanguagePage))
      this.nav.setRoot(LanguagePage);
  }
}
