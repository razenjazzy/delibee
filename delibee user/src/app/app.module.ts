import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { NativeGeocoder } from '@ionic-native/native-geocoder';
import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
import { AddressPage } from '../pages/address/address';
import { CartPage } from '../pages/cart/cart';
import { ChefdetailPage } from '../pages/chefdetail/chefdetail';
import { ConfirmorderPage } from '../pages/confirmorder/confirmorder';
import { ContactusPage } from '../pages/contactus/contactus';
import { CodePage } from '../pages/code/code';
import { FavoritedPage } from '../pages/favorited/favorited';
import { ForgotpasswordPage } from '../pages/forgotpassword/forgotpassword';
import { MydetailsPage } from '../pages/mydetails/mydetails';
import { MyordersPage } from '../pages/myorders/myorders';
import { OnlinemenuPage } from '../pages/onlinemenu/onlinemenu';
import { OtpPage } from '../pages/otp/otp';
import { PaymentdetailPage } from '../pages/paymentdetail/paymentdetail';
import { RaterestroPage } from '../pages/raterestro/raterestro';
import { RefinePage } from '../pages/refine/refine';
import { LanguagePage } from '../pages/language/language';
import { ReviewPage } from '../pages/review/review';
import { SelectareaPage } from '../pages/selectarea/selectarea';
import { ShippingPage } from '../pages/shipping/shipping';
import { SigninPage } from '../pages/signin/signin';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { Geolocation } from '@ionic-native/geolocation';
import { Network } from '@ionic-native/network';
import { Connectivity } from '../providers/connectivity-service';
import { GoogleMaps } from '../providers/google-maps';
import { APP_CONFIG, BaseAppConfig } from "./app.config";
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { Globalization } from '@ionic-native/globalization';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { TrackorderPage } from '../pages/trackorder/trackorder';
import { AppVersion } from '@ionic-native/app-version';
import { Market } from '@ionic-native/market';
import { Diagnostic } from '@ionic-native/diagnostic';

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
  declarations: [
    AddressPage,
    CodePage,
    MyApp,
    HomePage,
    CartPage,
    ChefdetailPage,
    ConfirmorderPage,
    ContactusPage,
    FavoritedPage,
    ForgotpasswordPage,
    MydetailsPage,
    MyordersPage,
    OnlinemenuPage,
    OtpPage,
    PaymentdetailPage,
    RaterestroPage,
    RefinePage,
    ReviewPage,
    SelectareaPage,
    ShippingPage,
    SigninPage,
    LanguagePage,
    TrackorderPage
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
    AddressPage,
    CodePage,
    MyApp,
    HomePage,
    CartPage,
    ChefdetailPage,
    ConfirmorderPage,
    ContactusPage,
    FavoritedPage,
    ForgotpasswordPage,
    MydetailsPage,
    MyordersPage,
    OnlinemenuPage,
    OtpPage,
    PaymentdetailPage,
    RaterestroPage,
    RefinePage,
    ReviewPage,
    SelectareaPage,
    ShippingPage,
    SigninPage,
    LanguagePage,
    TrackorderPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    Geolocation,
    Network,
    Connectivity,
    GoogleMaps,
    NativeGeocoder,
    Globalization,
    InAppBrowser,
    AppVersion,
    Market,
    Diagnostic,
    { provide: APP_CONFIG, useValue: BaseAppConfig },
    { provide: ErrorHandler, useClass: IonicErrorHandler },
  ]
})
export class AppModule { }