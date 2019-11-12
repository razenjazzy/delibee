import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import 'rxjs/add/observable/from';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/concatMap';
import { Observable } from "rxjs/Observable";
import { APP_CONFIG, AppConfig } from "../app/app.config";
import { Country } from '../models/country.models';
import { Area } from '../models/area.models';
import { StoreRequest } from '../models/store-request.models';
import { StoreResponse } from '../models/store-response.models';
import { ResetPasswordResponse } from '../models/reset-password-request.models';
import { AuthResponse } from '../models/auth-response.models';
import { SignInRequest } from '../models/signin-request.models';
import { SignUpRequest } from '../models/signup-request.models';
import { Setting } from '../models/setting.models';
import { Constants } from '../models/constants.models';
import { BaseListResponse } from '../models/base-list.models';
import { Item } from '../models/item.models';
import { Address } from '../models/address.models';
import { PaymentMethod } from '../models/payment-methods.models';
import { EarningResponse } from '../models/earnings-response.models';
import { SupportRequest } from '../models/support-request.models';
import { BankDetail } from '../models/bank-details.models';
import { Order } from '../models/order.models';

@Injectable()
export class ClientService {

  constructor(@Inject(APP_CONFIG) private config: AppConfig, private http: HttpClient) {

  }

  public updateUser(id): Observable<{}> {
    const myHeaders = new HttpHeaders({ 'Content-Type': 'application/json', 'Accept': 'application/json', 'Authorization': 'Bearer ' + window.localStorage.getItem(Constants.KEY_TOKEN) });
    return this.http.put<{}>(this.config.apiBase + 'api/user', { fcm_registration_id: id }, { headers: myHeaders }).concatMap(data => {
      return Observable.of(data);
    });
  }

  public getCountries(): Observable<Array<Country>> {
    return this.http.get<Array<Country>>('./assets/json/countries.json').concatMap((data) => {
      let indiaObj: any = {};
      for (let index = 0; index < data.length; index++) {
        if (!(data[index].callingCodes.length) || data[index].callingCodes[0] == "") {
          data.splice(index, 1);
        }
        if (data[index].alpha2Code === "IN") {
          indiaObj = data[index];
          data.splice(index, 1);
        }
      }
      data.splice(0, 0, indiaObj);
      return Observable.of(data);
    });
  }

  public getAreas(): Observable<Array<Area>> {
    return this.http.get<Array<Area>>('./assets/json/areas.json').concatMap((data) => {
      return Observable.of(data);
    });
  }

  public getPaymentMethods(adminToken: string): Observable<Array<PaymentMethod>> {
    const myHeaders = new HttpHeaders({ 'Content-Type': 'application/json', 'Accept': 'application/json', 'Authorization': 'Bearer ' + adminToken });
    return this.http.get<Array<PaymentMethod>>(this.config.apiBase + "api/customer/payment-methods", { headers: myHeaders }).concatMap(data => {
      return Observable.of(data);
    });
  }

  public getAddress(id): Observable<Address> {
    const myHeaders = new HttpHeaders({ 'Content-Type': 'application/json', 'Accept': 'application/json', 'Authorization': 'Bearer ' + window.localStorage.getItem(Constants.KEY_TOKEN) });
    return this.http.get<Address>(this.config.apiBase + "api/customer/address/" + id, { headers: myHeaders }).concatMap(data => {
      return Observable.of(data);
    });
  }

  public getSettings(): Observable<Array<Setting>> {
    const myHeaders = new HttpHeaders({ 'Accept': 'application/json', 'Content-Type': 'application/json' });
    return this.http.get<Array<Setting>>(this.config.apiBase + "api/settings", { headers: myHeaders }).concatMap(data => {
      return Observable.of(data);
    });
  }

  public getEarnings(): Observable<EarningResponse> {
    const myHeaders = new HttpHeaders({ 'Content-Type': 'application/json', 'Accept': 'application/json', 'Authorization': 'Bearer ' + window.localStorage.getItem(Constants.KEY_TOKEN) });
    return this.http.get<EarningResponse>(this.config.apiBase + "api/earnings", { headers: myHeaders }).concatMap(data => {
      return Observable.of(data);
    });
  }

  public orders(status: string, active_orders: number, deliveries: number, page: number): Observable<BaseListResponse> {
    const myHeaders = new HttpHeaders({ 'Content-Type': 'application/json', 'Accept': 'application/json', 'Authorization': 'Bearer ' + window.localStorage.getItem(Constants.KEY_TOKEN) });
    let urlParams = new URLSearchParams();
    if (status && status.length)
      urlParams.append("status", status);
    urlParams.append("active_orders", String(active_orders));
    urlParams.append("deliveries", String(deliveries));
    urlParams.append("page", String(page));
    return this.http.get<BaseListResponse>(this.config.apiBase + 'api/order?' + urlParams.toString(), { headers: myHeaders }).concatMap(data => {
      for (let order of data.data) {
        order.created_at = this.formatDateTime(new Date(order.created_at));
        order.updated_at = this.formatDateTime(new Date(order.updated_at));
      }
      return Observable.of(data);
    });
  }

  public getStoreProfile(token): Observable<StoreResponse> {
    const myHeaders = new HttpHeaders({ 'Content-Type': 'application/json', 'Accept': 'application/json', 'Authorization': 'Bearer ' + token });
    return this.http.get<StoreResponse>(this.config.apiBase + 'api/store', { headers: myHeaders }).concatMap(data => {
      return Observable.of(data);
    });
  }

  public updateStore(token, storeRequest: StoreRequest): Observable<StoreResponse> {
    const myHeaders = new HttpHeaders({ 'Content-Type': 'application/json', 'Accept': 'application/json', 'Authorization': 'Bearer ' + token });
    return this.http.put<StoreResponse>(this.config.apiBase + "api/store/update", JSON.stringify(storeRequest), { headers: myHeaders }).concatMap(data => {
      return Observable.of(data);
    });
  }

  public updateOrder(id, body): Observable<Order> {
    const myHeaders = new HttpHeaders({ 'Content-Type': 'application/json', 'Accept': 'application/json', 'Authorization': 'Bearer ' + window.localStorage.getItem(Constants.KEY_TOKEN) });
    return this.http.put<Order>(this.config.apiBase + "api/order/" + id, body, { headers: myHeaders }).concatMap(data => {
      data.created_at = this.formatDateTime(new Date(data.created_at));
      data.updated_at = this.formatDateTime(new Date(data.updated_at));
      return Observable.of(data);
    });
  }

  public saveItem(itemRequest): Observable<Item> {
    const myHeaders = new HttpHeaders({ 'Content-Type': 'application/json', 'Accept': 'application/json', 'Authorization': 'Bearer ' + window.localStorage.getItem(Constants.KEY_TOKEN) });
    return this.http.post<Item>(this.config.apiBase + "api/menuitem", JSON.stringify(itemRequest), { headers: myHeaders }).concatMap(data => {
      return Observable.of(data);
    });
  }

  public updateItem(itemRequest): Observable<Item> {
    const myHeaders = new HttpHeaders({ 'Content-Type': 'application/json', 'Accept': 'application/json', 'Authorization': 'Bearer ' + window.localStorage.getItem(Constants.KEY_TOKEN) });
    return this.http.post<Item>(this.config.apiBase + "api/menuitem/" + itemRequest.id, JSON.stringify(itemRequest), { headers: myHeaders }).concatMap(data => {
      data.available = data.is_available == '1';
      return Observable.of(data);
    });
  }

  public getCategories(): Observable<BaseListResponse> {
    const myHeaders = new HttpHeaders({ 'Content-Type': 'application/json', 'Accept': 'application/json', 'Authorization': 'Bearer ' + window.localStorage.getItem(Constants.KEY_TOKEN) });
    return this.http.get<BaseListResponse>(this.config.apiBase + "api/category", { headers: myHeaders }).concatMap(data => {
      return Observable.of(data);
    });
  }

  public getItems(query: string, page): Observable<BaseListResponse> {
    const myHeaders = new HttpHeaders({ 'Content-Type': 'application/json', 'Accept': 'application/json', 'Authorization': 'Bearer ' + window.localStorage.getItem(Constants.KEY_TOKEN) });
    return this.http.get<BaseListResponse>(this.config.apiBase + "api/menuitem?status=" + query + "&page=" + page, { headers: myHeaders }).concatMap(data => {
      for (let item of data.data) {
        item.available = item.is_available == '1';
      }
      return Observable.of(data);
    });
  }

  public forgetPassword(resetRequest: any): Observable<ResetPasswordResponse> {
    const myHeaders = new HttpHeaders({ 'Content-Type': 'application/json', 'Accept': 'application/json' });
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
    const myHeaders = new HttpHeaders({ 'Content-Type': 'application/json', 'Accept': 'application/json' });
    return this.http.post<AuthResponse>(this.config.apiBase + "api/verify-mobile", JSON.stringify(verifyRequest), { headers: myHeaders }).concatMap(data => {
      return Observable.of(data);
    });
  }

  public contactUs(obj): Observable<SupportRequest> {
    const myHeaders = new HttpHeaders({ 'Content-Type': 'application/json', 'Accept': 'application/json' });
    return this.http.post<SupportRequest>(this.config.apiBase + 'api/support', obj, { headers: myHeaders }).concatMap(data => {
      return Observable.of(data);
    });
  }

  public saveBankDetails(obj): Observable<BankDetail> {
    const myHeaders = new HttpHeaders({ 'Content-Type': 'application/json', 'Accept': 'application/json', 'Authorization': 'Bearer ' + window.localStorage.getItem(Constants.KEY_TOKEN) });
    return this.http.post<BankDetail>(this.config.apiBase + 'api/bank-detail', obj, { headers: myHeaders }).concatMap(data => {
      return Observable.of(data);
    });
  }

  public getBankDetail(): Observable<BankDetail> {
    const myHeaders = new HttpHeaders({ 'Content-Type': 'application/json', 'Accept': 'application/json', 'Authorization': 'Bearer ' + window.localStorage.getItem(Constants.KEY_TOKEN) });
    return this.http.get<BankDetail>(this.config.apiBase + 'api/bank-detail', { headers: myHeaders }).concatMap(data => {
      return Observable.of(data);
    });
  }

  public getStoreRatings(page): Observable<BaseListResponse> {
    const myHeaders = new HttpHeaders({ 'Content-Type': 'application/json', 'Accept': 'application/json', 'Authorization': 'Bearer ' + window.localStorage.getItem(Constants.KEY_TOKEN) });
    return this.http.get<BaseListResponse>(this.config.apiBase + 'api/rating?page=' + page, { headers: myHeaders }).concatMap(data => {
      for (let review of data.data) {
        review.rating = Number(review.rating);
        review.created_at = this.formatDateTime(new Date(review.created_at));
        review.updated_at = this.formatDateTime(new Date(review.updated_at));
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