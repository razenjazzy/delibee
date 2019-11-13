import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import 'rxjs/add/observable/from';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/concatMap';
import { Observable } from "rxjs/Observable";
import { APP_CONFIG, AppConfig } from "../app/app.config";
import { Country } from '../models/country.models';
import { ResetPasswordResponse } from '../models/reset-password-request.models';
import { AuthResponse } from '../models/auth-response.models';
import { SignInRequest } from '../models/signin-request.models';
import { SignUpRequest } from '../models/signup-request.models';
import { Setting } from '../models/setting.models';
import { SupportRequest } from '../models/support-request.models';
import { PaymentMethod } from '../models/payment-methods.models';
import { BankDetail } from '../models/bank-details.models';
import { Constants } from '../models/constants.models';
import { Order } from '../models/order.models';
import { EarningResponse } from '../models/earning-response.models';
import { Profile } from '../models/profile.models';
import { BaseListResponse } from '../models/base-list.models';

interface Any {

}

@Injectable()
export class ClientService {

  constructor(@Inject(APP_CONFIG) private config: AppConfig, private http: HttpClient) {

  }

  public getCountries(): Observable<Array<Country>> {
    return this.http.get<Array<Country>>('./assets/json/countries.json').concatMap((data) => {
      return Observable.of(data);
    });
  }

  public getPaymentMethods(adminToken: string): Observable<Array<PaymentMethod>> {
    const myHeaders = new HttpHeaders({ 'Accept': 'application/json', 'Authorization': 'Bearer ' + adminToken });
    return this.http.get<Array<PaymentMethod>>(this.config.apiBase + "api/customer/payment-methods", { headers: myHeaders })
      .concatMap(data => {
        return Observable.of(data);
      });
  }

  public getSettings(): Observable<Array<Setting>> {
    const myHeaders = new HttpHeaders({ 'Accept': 'application/json', 'Content-Type': 'application/json' });
    return this.http.get<Array<Setting>>(this.config.apiBase + "api/settings", { headers: myHeaders }).concatMap(data => {
      return Observable.of(data);
    });
  }

  public getBankDetail(): Observable<BankDetail> {
    const myHeaders = new HttpHeaders({ 'Accept': 'application/json', 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + window.localStorage.getItem(Constants.KEY_TOKEN) });
    return this.http.get<BankDetail>(this.config.apiBase + 'api/bank-detail', { headers: myHeaders }).concatMap(data => {
      return Observable.of(data);
    });
  }

  public getEarnings(): Observable<EarningResponse> {
    const myHeaders = new HttpHeaders({ 'Accept': 'application/json', 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + window.localStorage.getItem(Constants.KEY_TOKEN) });
    return this.http.get<EarningResponse>(this.config.apiBase + "api/earnings/", { headers: myHeaders }).concatMap(data => {
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

  public contactUs(obj): Observable<SupportRequest> {
    const myHeaders = new HttpHeaders({ 'Accept': 'application/json', 'Content-Type': 'application/json' });
    return this.http.post<SupportRequest>(this.config.apiBase + 'api/support', obj, { headers: myHeaders }).concatMap(data => {
      return Observable.of(data);
    });
  }

  public saveBankDetails(obj): Observable<BankDetail> {
    const myHeaders = new HttpHeaders({ 'Accept': 'application/json', 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + window.localStorage.getItem(Constants.KEY_TOKEN) });
    return this.http.post<BankDetail>(this.config.apiBase + 'api/bank-detail', obj, { headers: myHeaders }).concatMap(data => {
      return Observable.of(data);
    });
  }

  public updateDeliveryProfile(obj): Observable<Profile> {
    const myHeaders = new HttpHeaders({ 'Accept': 'application/json', 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + window.localStorage.getItem(Constants.KEY_TOKEN) });
    return this.http.put<Profile>(this.config.apiBase + 'api/delivery/profile/update', obj, { headers: myHeaders }).concatMap(data => {
      return Observable.of(data);
    });
  }

  public getDeliveryProfile(): Observable<Profile> {
    const myHeaders = new HttpHeaders({ 'Accept': 'application/json', 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + window.localStorage.getItem(Constants.KEY_TOKEN) });
    return this.http.get<Profile>(this.config.apiBase + 'api/delivery/profile', { headers: myHeaders }).concatMap(data => {
      return Observable.of(data);
    });
  }

  public getCurrentOrder(): Observable<Order> {
    const myHeaders = new HttpHeaders({ 'Accept': 'application/json', 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + window.localStorage.getItem(Constants.KEY_TOKEN) });
    return this.http.get<Order>(this.config.apiBase + 'api/delivery/order', { headers: myHeaders }).concatMap(data => {
      data.created_at = this.formatDateTime(new Date(data.created_at));
      data.updated_at = this.formatDateTime(new Date(data.updated_at));
      return Observable.of(data);
    });
  }

  public updateOrderStatus(status: string, id): Observable<Order> {
    const myHeaders = new HttpHeaders({ 'Accept': 'application/json', 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + window.localStorage.getItem(Constants.KEY_TOKEN) });
    return this.http.put<Order>(this.config.apiBase + 'api/delivery/update-delivery-status/' + id, { delivery_status: status }, { headers: myHeaders }).concatMap(data => {
      return Observable.of(data);
    });
  }

  public updateUser(id): Observable<Any> {
    const myHeaders = new HttpHeaders({ 'Accept': 'application/json', 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + window.localStorage.getItem(Constants.KEY_TOKEN) });
    return this.http.put<Any>(this.config.apiBase + 'api/user/', { fcm_registration_id: id }, { headers: myHeaders }).concatMap(data => {
      return Observable.of(data);
    });
  }

  public verifyMobile(verifyRequest: any): Observable<AuthResponse> {
    const myHeaders = new HttpHeaders({ 'Accept': 'application/json', 'Content-Type': 'application/json' });
    return this.http.post<AuthResponse>(this.config.apiBase + "api/verify-mobile", JSON.stringify(verifyRequest), { headers: myHeaders }).concatMap(data => {
      return Observable.of(data);
    });
  }

  public ordersDelivery(pageNo: number): Observable<BaseListResponse> {
    const myHeaders = new HttpHeaders({ 'Content-Type': 'application/json', 'Accept': 'application/json', 'Authorization': 'Bearer ' + window.localStorage.getItem(Constants.KEY_TOKEN) });
    return this.http.get<BaseListResponse>(this.config.apiBase + "api/delivery/my-orders?page=" + pageNo, { headers: myHeaders }).concatMap(data => {
      for (let o of data.data) {
        o.created_at = this.formatDate(o.created_at ? new Date(o.created_at) : new Date());
        o.updated_at = this.formatDate(o.updated_at ? new Date(o.updated_at) : new Date());
      }
      return Observable.of(data);
    });
  }

  public deliveryPaymentHistory(pageNo: number): Observable<BaseListResponse> {
    const myHeaders = new HttpHeaders({ 'Content-Type': 'application/json', 'Accept': 'application/json', 'Authorization': 'Bearer ' + window.localStorage.getItem(Constants.KEY_TOKEN) });
    return this.http.get<BaseListResponse>(this.config.apiBase + "api/delivery/my-payment-history?page=" + pageNo, { headers: myHeaders }).concatMap(data => {
      for (let dph of data.data) {
        dph.created_at = this.formatDateTime(dph.created_at ? new Date(dph.created_at) : new Date());
        dph.updated_at = this.formatDateTime(dph.updated_at ? new Date(dph.updated_at) : new Date());
      }
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