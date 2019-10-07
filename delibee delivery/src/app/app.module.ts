import { NgModule, ErrorHandler } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';
import { AccountPage } from '../pages/account/account';
import { BankdatailsPage } from '../pages/bankdatails/bankdatails';
import { SupportPage } from '../pages/support/support';
import { HomePage } from '../pages/home/home';
import { TabsPage } from '../pages/tabs/tabs';
import { LanguagePage } from '../pages/language/language';
import { EarningsPage } from '../pages/earnings/earnings';
import { ForgotpasswordPage } from '../pages/forgotpassword/forgotpassword';
import { OtpPage } from '../pages/otp/otp';
import { PhonePage } from '../pages/phone/phone';
import { ProfilePage } from '../pages/profile/profile';
import { SigninPage } from '../pages/signin/signin';
import { APP_CONFIG, BaseAppConfig } from "./app.config";
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { Globalization } from '@ionic-native/globalization';
import { NativeGeocoder } from '@ionic-native/native-geocoder';
import { Network } from '@ionic-native/network';
import { Connectivity } from '../providers/connectivity-service';
import { GoogleMaps } from '../providers/google-maps';
import { Geolocation } from '@ionic-native/geolocation';
import { Diagnostic } from '@ionic-native/diagnostic';

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
  declarations: [
    PhonePage,
    MyApp,
    AccountPage,
    BankdatailsPage,
    SupportPage,
    HomePage,
    TabsPage,
    LanguagePage,
    EarningsPage,
    ForgotpasswordPage,
    OtpPage,
    ProfilePage,
    SigninPage
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    IonicModule.forRoot(MyApp),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: createTranslateLoader,
        deps: [HttpClient]
      }
    })
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    PhonePage,
    MyApp,
    AccountPage,
    BankdatailsPage,
    SupportPage,
    HomePage,
    TabsPage,
    LanguagePage,
    EarningsPage,
    ForgotpasswordPage,
    OtpPage,
    ProfilePage,
    SigninPage,
  ],
  providers: [
    StatusBar,
    SplashScreen, Globalization,
    Geolocation, Connectivity,
    GoogleMaps, NativeGeocoder, Network, Diagnostic,
    { provide: APP_CONFIG, useValue: BaseAppConfig },
    { provide: ErrorHandler, useClass: IonicErrorHandler }
  ]
})

export class AppModule { }