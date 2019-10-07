import { Component, Inject, ViewChild } from '@angular/core';
import { Platform, App, Events, NavController } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { Globalization } from '@ionic-native/globalization';
import { TabsPage } from '../pages/tabs/tabs';
import { SigninPage } from '../pages/signin/signin';
import { TranslateService } from '../../node_modules/@ngx-translate/core';
import { Constants } from '../models/constants.models';
import { User } from '../models/user.models';
import { APP_CONFIG, AppConfig } from "./app.config";
import { ClientService } from "../providers/client.service";
import { Global } from "../providers/global";
import { Subscription } from 'rxjs/Subscription';
import firebase from 'firebase';

@Component({
  templateUrl: 'app.html',
  providers: [ClientService, Global]
})
export class MyApp {
  rootPage: any;
  @ViewChild('myNav') navCtrl: NavController;
  private subscriptions = new Array<Subscription>();
  private user: User;
  constructor(@Inject(APP_CONFIG) private config: AppConfig, private service: ClientService,
    private platform: Platform, private statusBar: StatusBar, private splashScreen: SplashScreen,
    public translate: TranslateService, private globalization: Globalization, private app: App,
    private events: Events) {
    this.initializeApp();
    this.events.subscribe("event:user", (res) => {
      console.log("user_event", res);
      this.user = res;
      if (this.platform.is('cordova')) {
        this.initFCM();
      }
    });
  }

  refreshSettings() {
    this.service.getSettings().subscribe(res => {
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
      this.splashScreen.hide();
      this.user = JSON.parse(window.localStorage.getItem(Constants.KEY_USER));
      if (this.user) {
        if (this.platform.is('cordova')) {
          // this.initOneSignal();
          this.initFCM();
        }
        this.getPaymentMethods();
        this.app.getRootNav().setRoot(TabsPage);
      } else {
        this.app.getRootNav().setRoot(SigninPage);
      }
      this.refreshSettings();
      this.globalize();
    });
  }

  initFCM() {
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
        component.app.getRootNav().setRoot(TabsPage);
        component.events.publish("order:fetch");
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
    this.service.updateUser(token).subscribe((res) => {
      console.log("updated fcm token in user:---" + JSON.stringify(res));
    }, (err) => {
      console.log("error in update fcm token:--" + JSON.stringify(err));
    })
  }

  getPaymentMethods() {
    let subscription: Subscription = this.service.getPaymentMethods(window.localStorage.getItem(Constants.KEY_TOKEN)).subscribe(res => {
      window.localStorage.setItem(Constants.PAYMENT_GATEWAYS, JSON.stringify(res));
    }, err => {
      console.log('payment_method', err);
    });
    this.subscriptions.push(subscription);
  }

  globalize() {
    // this language will be used as a fallback when a translation isn't found in the current language
    this.translate.setDefaultLang('en');
    console.log("globalaizing...");
    if (this.platform.is('cordova')) {
      // this.initOneSignal();
      console.log("cordova detected");
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
    } else {
      console.log("cordova not detected");
      this.translate.use('en');
      this.setDirectionAccordingly('en');
      // this.translate.use('pt');
      // this.setDirectionAccordingly('ar');
    }
  }

  setDirectionAccordingly(lang: string) {
    switch (lang) {
      case 'ar': {
        this.platform.setDir('ltr', false);
        this.platform.setDir('rtl', true);
        break;
      }
      default: {
        this.platform.setDir('rtl', false);
        this.platform.setDir('ltr', true);
        break;
      }
    }
    // this.translate.use('pt');
    // this.platform.setDir('rtl', false);
    // this.platform.setDir('ltr', true);
    // this.rtlSide = "left";
  }

  getSideOfCurLang() {
    return this.platform.dir() === 'rtl' ? "right" : "left";
  }

  getSuitableLanguage(language) {
    language = language.substring(0, 2).toLowerCase();
    console.log('check for: ' + language);
    return this.config.availableLanguages.some(x => x.code == language) ? language : 'en';
  }
}