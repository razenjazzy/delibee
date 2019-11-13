import { NgModule, ErrorHandler } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';
import { AccountPage } from '../pages/account/account';
import { AdditemPage } from '../pages/additem/additem';
import { BankdatailsPage } from '../pages/bankdatails/bankdatails';
import { DeliveryPage } from '../pages/delivery/delivery';
import { EarningsPage } from '../pages/earnings/earnings';
import { ForgotpasswordPage } from '../pages/forgotpassword/forgotpassword';
import { ItemsPage } from '../pages/items/items';
import { PhonePage } from '../pages/phone/phone';
import { ItemdetailsPage } from '../pages/itemdetails/itemdetails';
import { OrdersPage } from '../pages/orders/orders';
import { OrdersinfoPage } from '../pages/ordersinfo/ordersinfo';
import { OrderstatusPage } from '../pages/orderstatus/orderstatus';
import { OtpPage } from '../pages/otp/otp';
import { ProfilePage } from '../pages/profile/profile';
import { ReviewPage } from '../pages/review/review';
import { SigninPage } from '../pages/signin/signin';
import { SupportPage } from '../pages/support/support';
import { CategoriesPage } from '../pages/categories/categories';
import { TabsPage } from '../pages/tabs/tabs';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { APP_CONFIG, BaseAppConfig } from "./app.config";
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { Globalization } from '@ionic-native/globalization';
import { File } from '@ionic-native/file';
import { SelectareaPage } from '../pages/selectarea/selectarea';
import { Network } from '@ionic-native/network';
import { Connectivity } from '../providers/connectivity-service';
import { GoogleMaps } from '../providers/google-maps';
import { Geolocation } from '@ionic-native/geolocation';
import { NativeGeocoder } from '@ionic-native/native-geocoder';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { ImagePicker } from '@ionic-native/image-picker';

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
  declarations: [
    PhonePage,
    CategoriesPage,
    MyApp,
    AccountPage,
    AdditemPage,
    BankdatailsPage,
    DeliveryPage,
    EarningsPage,
    ForgotpasswordPage,
    ItemsPage,
    ItemdetailsPage,
    OrdersPage,
    OrdersinfoPage,
    OrderstatusPage,
    OtpPage,
    OtpPage,
    ProfilePage,
    ReviewPage,
    SigninPage,
    SupportPage,
    TabsPage,
    SelectareaPage
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
    CategoriesPage,
    MyApp,
    AccountPage,
    AdditemPage,
    BankdatailsPage,
    DeliveryPage,
    EarningsPage,
    ForgotpasswordPage,
    ItemsPage,
    ItemdetailsPage,
    OrdersPage,
    OrdersinfoPage,
    OrderstatusPage,
    OtpPage,
    OtpPage,
    ProfilePage,
    ReviewPage,
    SigninPage,
    SupportPage,
    TabsPage,
    SelectareaPage
  ],
  providers: [
    StatusBar, ImagePicker, File,
    SplashScreen, Globalization,
    Geolocation,
    GoogleMaps,
    NativeGeocoder,
    Network,
    Connectivity,
    InAppBrowser,
    { provide: APP_CONFIG, useValue: BaseAppConfig },
    { provide: ErrorHandler, useClass: IonicErrorHandler }
  ]
})
export class AppModule { }
