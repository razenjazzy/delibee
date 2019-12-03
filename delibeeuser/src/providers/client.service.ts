import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import 'rxjs/add/observable/from';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/concatMap';
import { Observable } from "rxjs/Observable";
import { APP_CONFIG, AppConfig } from "../app/app.config";
import { Country } from '../models/country.models';
import { Area } from '../models/area.models';
import { Item } from '../models/item.models';
import { ResetPasswordResponse } from '../models/reset-password-request.models';
import { AuthResponse } from '../models/auth-response.models';
import { SignInRequest } from '../models/signin-request.models';
import { SignUpRequest } from '../models/signup-request.models';
import { Setting } from '../models/setting.models';
import { BaseListResponse } from '../models/base-list.models';
import { RefineSetting } from '../models/refine-setting.models';
import { MyLocation } from '../models/my-location.models';
import { StoreDetails } from '../models/store-details.models';
import { Coupon } from '../models/coupon.models';
import { Address } from '../models/address.models';
import { Constants } from '../models/constants.models';
import { Review } from '../models/review.models';
import { PaymentMethod } from '../models/payment-methods.models';
import { SupportRequest } from '../models/support-request.models';
import { User } from '../models/user.models';
import { CouponUser } from '../models/coupon-user.models';

@Injectable()
export class ClientService {

  constructor(@Inject(APP_CONFIG) private config: AppConfig, private http: HttpClient) {

  }

  public getCountries(): Observable<Array<Country>> {
    return this.http.get<Array<Country>>('./assets/json/countries.json').concatMap((data) => {
      let indiaIndex = -1;
      if (data) {
        for (let i = 0; i < data.length; i++) {
          if (data[i].name == "India") {
            indiaIndex = i;
            break;
          }
        }
      }
      if (indiaIndex != -1) data.unshift(data.splice(indiaIndex, 1)[0]);
      return Observable.of(data);
    });
  }

  public getAreas(): Observable<Array<Area>> {
    return this.http.get<Array<Area>>('./assets/json/areas.json').concatMap((data) => {
      return Observable.of(data);
    });
  }

  public updateUser(updateRequest): Observable<{}> {
    const myHeaders = new HttpHeaders({ 'Content-Type': 'application/json', 'Accept': 'application/json', 'Authorization': 'Bearer ' + window.localStorage.getItem(Constants.KEY_TOKEN) });
    return this.http.put<{}>(this.config.apiBase + 'api/user', updateRequest, { headers: myHeaders }).concatMap(data => {
      return Observable.of(data);
    });
  }

  public getPaymentMethods(adminToken: string): Observable<Array<PaymentMethod>> {
    const myHeaders = new HttpHeaders({ 'Content-Type': 'application/json', 'Accept': 'application/json', 'Authorization': 'Bearer ' + adminToken });
    return this.http.get<Array<PaymentMethod>>(this.config.apiBase + "api/customer/payment-methods", { headers: myHeaders }).concatMap(data => {
      return Observable.of(data);
    });
  }

  public getSettings(): Observable<Array<Setting>> {
    const myHeaders = new HttpHeaders({ 'Content-Type': 'application/json', 'Accept': 'application/json', 'Authorization': 'Bearer ' + window.localStorage.getItem(Constants.KEY_TOKEN) });
    return this.http.get<Array<Setting>>(this.config.apiBase + "api/settings", { headers: myHeaders }).concatMap(data => {
      return Observable.of(data);
    });
  }

  public getReviews(token, pageNo): Observable<BaseListResponse> {
    const myHeaders = new HttpHeaders({ 'Content-Type': 'application/json', 'Accept': 'application/json', 'Authorization': 'Bearer ' + token });
    return this.http.get<BaseListResponse>(this.config.apiBase + "api/customer/rating/me?page=" + pageNo, { headers: myHeaders }).concatMap(data => {
      return Observable.of(data);
    });
  }

  public contactUs(adminToken: string, obj): Observable<SupportRequest> {
    const myHeaders = new HttpHeaders({ 'Content-Type': 'application/json', 'Accept': 'application/json', 'Authorization': 'Bearer ' + adminToken });
    return this.http.post<SupportRequest>(this.config.apiBase + 'api/support', obj, { headers: myHeaders }).concatMap(data => {
      return Observable.of(data);
    });
  }

  public saveAddress(adminToken: string, obj): Observable<Address> {
    const myHeaders = new HttpHeaders({ 'Content-Type': 'application/json', 'Accept': 'application/json', 'Authorization': 'Bearer ' + adminToken });
    return this.http.post<Address>(this.config.apiBase + 'api/customer/address', obj, { headers: myHeaders }).concatMap(data => {
      return Observable.of(data);
    });
  }

  public updateAddress(adminToken: string, addressId, obj): Observable<Address> {
    const myHeaders = new HttpHeaders({ 'Content-Type': 'application/json', 'Accept': 'application/json', 'Authorization': 'Bearer ' + adminToken });
    return this.http.put<Address>(this.config.apiBase + 'api/customer/address/' + addressId + '/update', obj, { headers: myHeaders }).concatMap(data => {
      return Observable.of(data);
    });
  }

  public tougleFavourite(adminToken: string, id, value): Observable<{}> {
    const myHeaders = new HttpHeaders({ 'Content-Type': 'application/json', 'Accept': 'application/json', 'Authorization': 'Bearer ' + adminToken });
    let obj = { "favourite": (value == 0 ? 1 : 0) };
    return this.http.post<{}>(this.config.apiBase + 'api/customer/favourite/' + id, obj, { headers: myHeaders }).concatMap(data => {
      return Observable.of(data);
    });
  }

  public getFavourites(adminToken: string, pageNo): Observable<BaseListResponse> {
    const myHeaders = new HttpHeaders({ 'Content-Type': 'application/json', 'Accept': 'application/json', 'Authorization': 'Bearer ' + adminToken });
    return this.http.get<BaseListResponse>(this.config.apiBase + "api/customer/favourite?page=" + pageNo, { headers: myHeaders }).concatMap(data => {
      return Observable.of(data);
    });
  }

  public getOrders(adminToken: string, pageNo): Observable<BaseListResponse> {
    const myHeaders = new HttpHeaders({ 'Content-Type': 'application/json', 'Accept': 'application/json', 'Authorization': 'Bearer ' + adminToken });
    return this.http.get<BaseListResponse>(this.config.apiBase + "api/customer/order?page=" + pageNo, { headers: myHeaders }).concatMap(data => {
      return Observable.of(data);
    });
  }

  public createOrder(adminToken: string, obj): Observable<any> {
    const myHeaders = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': 'Bearer ' + adminToken
    });
    return this.http.post<any>(this.config.apiBase + 'api/customer/order', obj, { headers: myHeaders }).concatMap(data => {
      return Observable.of(data);
    });
  }

  public updateOrder(adminToken: string, orderId: number, obj): Observable<{}> {
    const myHeaders = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': 'Bearer ' + adminToken
    });
    return this.http.post<{}>(this.config.apiBase + 'api/customer/order/' + orderId, obj, { headers: myHeaders }).concatMap(data => {
      return Observable.of(data);
    });
  }

  public calculateDeliveryFee(adminToken: string, obj: { address_id: number, store_id: number }): Observable<any> {
    const myHeaders = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': 'Bearer ' + adminToken
    });
    return this.http.post<any>(this.config.apiBase + 'api/customer/order/calculate-delivery-fee', obj, { headers: myHeaders }).concatMap(data => {
      return Observable.of(data);
    });
  }

  public stripePayment(adminToken: string, orderId, token): Observable<{}> {
    const myHeaders = new HttpHeaders({ 'Content-Type': 'application/json', 'Accept': 'application/json', 'Authorization': 'Bearer ' + window.localStorage.getItem(Constants.KEY_TOKEN) });
    return this.http.post<{}>(this.config.apiBase + 'api/customer/order/' + orderId + '/payment/stripe', JSON.stringify(token), { headers: myHeaders }).concatMap(data => {
      return Observable.of(data);
    });
  }

  public applyCouponCode(adminToken: string, cCode: string): Observable<Coupon> {
    const myHeaders = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': 'Bearer ' + adminToken
    });
    return this.http.get<Coupon>(this.config.apiBase + 'api/customer/coupon-validity?code=' + cCode, { headers: myHeaders }).concatMap(data => {
      return Observable.of(data);
    });
  }

  public getAddressList(adminToken: string): Observable<Array<Address>> {
    const myHeaders = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': 'Bearer ' + adminToken
    });
    return this.http.get<Array<Address>>(this.config.apiBase + 'api/customer/address', { headers: myHeaders }).concatMap(data => {
      return Observable.of(data);
    });
  }

  public postReview(review, id): Observable<Review> {
    const myHeaders = new HttpHeaders({ 'Content-Type': 'application/json', 'Accept': 'application/json', 'Authorization': 'Bearer ' + window.localStorage.getItem(Constants.KEY_TOKEN) });
    return this.http.post<Review>(this.config.apiBase + 'api/customer/rating/' + id, review, { headers: myHeaders }).concatMap(data => {
      return Observable.of(data);
    });
  }

  public postCoupon(obj): Observable<CouponUser> {
    const myHeaders = new HttpHeaders({ 'Content-Type': 'application/json', 'Accept': 'application/json', 'Authorization': 'Bearer ' + window.localStorage.getItem(Constants.KEY_TOKEN) });
    return this.http.post<CouponUser>(this.config.apiBase + 'api/customer/coupon-user', obj, { headers: myHeaders }).concatMap(data => {
      return Observable.of(data);
    });
  }

  public forgetPassword(resetRequest: any): Observable<ResetPasswordResponse> {
    const myHeaders = new HttpHeaders({ 'Accept': 'application/json', 'Content-Type': 'application/json' });
    return this.http.post<ResetPasswordResponse>(this.config.apiBase + "api/forgot-password", JSON.stringify(resetRequest), { headers: myHeaders }).concatMap(data => {
      return Observable.of(data);
    });
  }

  public login(loginRequest: SignInRequest): Observable<AuthResponse> {
    const myHeaders = new HttpHeaders({ 'Accept': 'application/json', 'Content-Type': 'application/json' });
    return this.http.post<AuthResponse>(this.config.apiBase + "api/login", JSON.stringify(loginRequest), { headers: myHeaders }).concatMap(data => {
      return Observable.of(data);
    });
  }

  public loginSocial(socialLoginRequest: any): Observable<AuthResponse> {
    const myHeaders = new HttpHeaders({ 'Accept': 'application/json', 'Content-Type': 'application/json' });
    return this.http.post<AuthResponse>(this.config.apiBase + "api/social/login", JSON.stringify(socialLoginRequest), { headers: myHeaders }).concatMap(data => {
      return Observable.of(data);
    });
  }

  public signUp(signUpRequest: SignUpRequest): Observable<AuthResponse> {
    const myHeaders = new HttpHeaders({ 'Accept': 'application/json', 'Content-Type': 'application/json' });
    return this.http.post<AuthResponse>(this.config.apiBase + "api/register", JSON.stringify(signUpRequest), { headers: myHeaders }).concatMap(data => {
      return Observable.of(data);
    });
  }

  public verifyMobile(verifyRequest: any): Observable<AuthResponse> {
    let api = this.config.apiBase + "api/verify-mobile";
    const myHeaders = new HttpHeaders({ 'Accept': 'application/json', 'Content-Type': 'application/json' });
    return this.http.post<AuthResponse>(api, JSON.stringify(verifyRequest), { headers: myHeaders }).concatMap(data => {
      return Observable.of(data);
    });
  }

  public categories(token: string): Observable<BaseListResponse> {
    const myHeaders = new HttpHeaders({ 'Accept': 'application/json', 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token });
    return this.http.get<BaseListResponse>(this.config.apiBase + "api/customer/category", { headers: myHeaders }).concatMap(data => {
      return Observable.of(data);
    });
  }

  public getStoreDetails(token: string, id): Observable<StoreDetails> {
    const myHeaders = new HttpHeaders({ 'Accept': 'application/json', 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token });
    return this.http.get<StoreDetails>(this.config.apiBase + "api/customer/store/" + id, { headers: myHeaders }).concatMap(data => {
      return Observable.of(data);
    });
  }

  public getStoreRatings(token: string, id): Observable<BaseListResponse> {
    const myHeaders = new HttpHeaders({ 'Accept': 'application/json', 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token });
    return this.http.get<BaseListResponse>(this.config.apiBase + "api/customer/rating/" + id, { headers: myHeaders }).concatMap(data => {
      for (let review of data.data) {
        review.created_at = this.formatDateTime(new Date(review.created_at));
      }
      return Observable.of(data);
    });
  }

  public updateItem (adminToken: string, itemId, obj): Observable<Item> {
    const myHeaders = new HttpHeaders({ 'Content-Type': 'application/json', 'Accept': 'application/json', 'Authorization': 'Bearer ' + adminToken });
    return this.http.post<Item>(this.config.apiBase + 'api/menuitem/' + itemId + '/update-quantity', obj, { headers: myHeaders }).concatMap(data => {
      return Observable.of(data);
    });
  }

  public searchStores(token: string, query: string, location: MyLocation, refineSetting: RefineSetting, category_id: number, page: string, user: User): Observable<BaseListResponse> {
    const myHeaders = new HttpHeaders({ 'Accept': 'application/json', 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token });
    let urlParams = new URLSearchParams();
    if (query && query.length)
      urlParams.append("search", query);
    if (category_id && category_id != -1)
      urlParams.append("category_id", String(category_id));
    urlParams.append("lat", location.lat);
    urlParams.append("long", location.lng);
    urlParams.append("cost_for_two_min", String(refineSetting.cost_for_two_min));
    urlParams.append("cost_for_two_max", String(refineSetting.cost_for_two_max));
    urlParams.append("veg_only", refineSetting.vegOnly ? "1" : "0");
    urlParams.append("cost_for_two_sort", String(refineSetting.cost_for_two_sort));
    urlParams.append("page", page);
    if (user && user.id)
      urlParams.append("user_id", String(user.id));
    console.log('url', this.config.apiBase + "api/customer/store?" + urlParams.toString());
    console.log('header', token);
    return this.http.get<BaseListResponse>(this.config.apiBase + "api/customer/store?" + urlParams.toString(), { headers: myHeaders }).concatMap(data => {
      return Observable.of(data);
    });
  }

  private formatDateTime(date: Date): string {
    let locale = window.localStorage.getItem("locale");
    if (!locale) locale = "en-US";
    let options = {
      weekday: "short", month: "short",
      day: "numeric", hour: "2-digit", minute: "2-digit"
    };
    return date.toLocaleTimeString(locale, options);
  }

  private formatDate(date: Date): string {
    let months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    return date.getDate() + " " + months[date.getMonth()] + " " + date.getFullYear();
  }

  private formatTime(date: Date): string {
    let hours = date.getHours();
    return this.addZero(hours > 11 ? Math.abs(12 - hours) : hours) + ":" + this.addZero(date.getMinutes()) + (hours > 11 ? " pm" : " am");
  }

  private addZero(num) {
    return String(num < 10 ? ("0" + num) : (num));
  }

}