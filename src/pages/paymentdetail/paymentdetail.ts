import { Component, Inject } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { ConfirmorderPage } from '../confirmorder/confirmorder';
import { Constants } from '../../models/constants.models';
import { ClientService } from '../../providers/client.service';
import { Global } from '../../providers/global';
import { Subscription } from 'rxjs/Subscription';
import { PaymentMethod } from '../../models/payment-methods.models';
import { TranslateService } from '@ngx-translate/core';
import { CardInfo } from '../../models/card-info.models';
import { APP_CONFIG, AppConfig } from '../../app/app.config';

@Component({
  selector: 'page-paymentdetail',
  templateUrl: 'paymentdetail.html',
  providers: [ClientService, Global]
})
export class PaymentdetailPage {
  gaming: string = "nes";
  private subscriptions: Array<Subscription> = [];
  private payments: Array<PaymentMethod> = [];
  private payment_method_id: number = 0;
  private paymentMethodSelected: PaymentMethod;
  private order: any = {};
  private cardInfo: CardInfo;
  private savedCardInfo: CardInfo;

  constructor(@Inject(APP_CONFIG) private config: AppConfig, private translate: TranslateService,
    private navCtrl: NavController, private service: ClientService,
    private global: Global, private params: NavParams) {
    this.order = this.params.get("order");
    this.translate.get('loading').subscribe(text => {
      this.global.presentLoading(text);
    })
    // this.global.presentLoading("Loading payment methods");
    this.getPaymentMethods();
    this.savedCardInfo = JSON.parse(window.localStorage.getItem(Constants.CARD_INFO));
  }

  ionViewWillLeave() {
    this.subscriptions.forEach((subscription: Subscription) => {
      subscription.unsubscribe();
    });
    this.global.dismissLoading();
  }

  paymentModeSelected(payment: PaymentMethod) {
    this.paymentMethodSelected = payment;
    if (payment && payment.slug.toLowerCase().indexOf('stripe') != -1) {
      this.cardInfo = new CardInfo();
      if (this.savedCardInfo) {
        this.cardInfo.name = this.savedCardInfo.name;
        this.cardInfo.number = this.savedCardInfo.number;
        this.cardInfo.expMonth = this.savedCardInfo.expMonth;
        this.cardInfo.expYear = this.savedCardInfo.expYear;
      }
    } else {
      this.cardInfo = null;
    }
  }

  getPaymentMethods() {
    let subscription: Subscription = this.service.getPaymentMethods(window.localStorage.getItem(Constants.KEY_TOKEN)).subscribe(res => {
      this.payments = res;
      this.global.dismissLoading();
    }, err => {
      console.log('getPaymentMethods', err);
      this.global.dismissLoading();
    });
    this.subscriptions.push(subscription);
  }

  confirmorder() {
    if (this.payment_method_id && this.payment_method_id > 0) {
      this.order.payment_method_id = this.payment_method_id;
      this.navCtrl.push(ConfirmorderPage, { order: this.order });
      // if (this.paymentMethodSelected && this.paymentMethodSelected.slug.toLowerCase().indexOf('stripe') != -1) {
      //   if (this.cardInfo.areFieldsFilled()) {
      //     this.generateStripeCardIdToken();
      //   } else {
      //     this.translate.get('fill_valid_card').subscribe(text => {
      //       this.global.showToast(text);
      //     });
      //   }
      // } else {
      //   this.navCtrl.push(ConfirmorderPage, { order: this.order });
      // }
    }
  }

  // generateStripeCardIdToken() {
  //   this.translate.get('verifying_card').subscribe(text => {
  //     this.global.presentLoading(text);
  //   });
  //   this.stripe.setPublishableKey(this.config.stripeKey);
  //   this.stripe.createCardToken(this.cardInfo as StripeCardTokenParams).then(token => {
  //     this.global.dismissLoading();
  //     window.localStorage.setItem(Constants.CARD_INFO, JSON.stringify(this.cardInfo));
  //     this.navCtrl.push(ConfirmorderPage, { order: this.order, stripeCardTokenId: token.id });
  //   }).catch(error => {
  //     this.global.dismissLoading();
  //     this.global.presentErrorAlert(error);
  //     this.translate.get('invalid_card').subscribe(text => {
  //       this.global.showToast(text);
  //     });
  //     console.error(error);
  //   });
  // }

}