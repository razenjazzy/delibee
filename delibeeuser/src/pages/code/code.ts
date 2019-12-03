import { Component } from '@angular/core';
import { ViewController, Loading } from 'ionic-angular';
import { ClientService } from '../../providers/client.service';
import { Global } from '../../providers/global';
import { Subscription } from '../../../node_modules/rxjs/Subscription';
import { Constants } from '../../models/constants.models';
import { Coupon } from '../../models/coupon.models';
import { TranslateService } from '@ngx-translate/core';

@Component({
	selector: 'page-code ',
	templateUrl: 'code.html',
	providers: [ClientService, Global]
})
export class CodePage {
	private cCode = "";
	private loading: Loading;
	private loadingShown: Boolean = false;
	private subscriptions: Array<Subscription> = [];

	constructor(private translate: TranslateService, private service: ClientService,
		private global: Global, private viewCtrl: ViewController) {
	}

	checkCode() {
		if (!this.cCode.length) {
			this.translate.get('invalid_coupon_1').subscribe(text => {
				this.global.showToast(text);
			})
			// this.global.showToast('Enter valid coupon code.');
		} else {
			this.translate.get('just_a_mmnt').subscribe(text => {
				this.global.presentLoading(text);
			})
			// this.global.presentLoading('Just a moment');
			let subscription: Subscription = this.service.applyCouponCode(window.localStorage.getItem(Constants.KEY_TOKEN), this.cCode).subscribe(data => {
				this.global.dismissLoading();
				let coupon: Coupon = data;
				if (!coupon) {
					this.translate.get('invalid_coupon').subscribe(text => {
						this.global.showToast(text);
					})
				} else {
					if (new Date(coupon.expires_at) > new Date()) {
						//window.localStorage.setItem(Constants.SELECTED_COUPON, JSON.stringify(coupon));
						this.dismiss(coupon);
					} else {
						window.localStorage.removeItem(Constants.SELECTED_COUPON);
						this.translate.get('coupon_expired').subscribe(text => {
							this.global.showToast(text);
						});
						this.dismiss(null);
					}
				}
			}, err => {
				this.global.dismissLoading();
				this.translate.get('invalid_coupon').subscribe(text => {
					this.global.showToast(text);
				})
				// this.global.showToast('Invalid coupon code');
			});
			this.subscriptions.push(subscription);
		}
	}

	dismiss(coupon) {
		this.viewCtrl.dismiss(coupon);
	}
}