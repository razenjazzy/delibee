import { Component, ViewChild, ElementRef } from '@angular/core';
import { NavController, Events, AlertController } from 'ionic-angular';
import { Constants } from '../../models/constants.models';
import { Profile } from '../../models/profile.models';
import { Order } from '../../models/order.models';
import { MyLocation } from '../../models/my-location.models';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs/Subscription';
import { Global } from '../../providers/global';
import { ClientService } from '../../providers/client.service';
import { Diagnostic } from '@ionic-native/diagnostic';
import { Geolocation, Geoposition } from '@ionic-native/geolocation';
import { Helper } from '../../models/helper.models';
import * as firebase from 'firebase/app';
import { GoogleMaps } from '../../providers/google-maps';

declare var google;

@Component({
  selector: 'page-home',
  templateUrl: 'home.html',
  providers: [Global, ClientService]
})
export class HomePage {
  @ViewChild('map') mapElement: ElementRef;
  @ViewChild('pleaseConnect') pleaseConnect: ElementRef;
  private profile: Profile;
  private order: Order;
  private subscriptions = new Array<Subscription>();
  private geoSubscription: Subscription;
  private currency: string;
  private online = true;
  private refreshingOrder = false;
  private distance: number = 0;
  private location: MyLocation;
  private markerMe: any;
  private markerStore: any;
  private markerCustomer: any;
  private initialized: boolean;

  constructor(private translate: TranslateService, private maps: GoogleMaps,
    private global: Global, private service: ClientService, events: Events,
    private diagnostic: Diagnostic, private alertCtrl: AlertController, private geolocation: Geolocation) {
    this.profile = JSON.parse(window.localStorage.getItem(Constants.KEY_PROFILE));
    this.currency = Helper.getSetting("currency");
    this.location = JSON.parse(window.localStorage.getItem(Constants.KEY_LOCATION));
    if (!this.location) { this.location = new MyLocation(); }
    if (this.profile) {
      this.online = this.profile.is_online == 1;
      if (this.online) this.refreshOrder();
    } else {
      this.online = true;
      this.toggleOnline();
    }
    events.subscribe('order:fetch', () => {
      this.refreshOrder();
    });
  }

  ionViewDidLoad() {
    if (!this.initialized) {
      let mapLoaded = this.maps.init(this.mapElement.nativeElement, this.pleaseConnect.nativeElement).then(() => {
        this.maps.map.addListener('click', (event) => {
          if (event && event.latLng) { }
        });
        this.initialized = true;
      }).catch(err => {
        console.log(err);
      });
      mapLoaded.catch(err => {
        console.log(err);
      });
    }
  }

  ionViewDidEnter() {
    this.diagnostic.isLocationEnabled().then((isAvailable) => {
      if (isAvailable) {
        if (this.order && this.order.delivery_status == 'started' && !this.geoSubscription) {
          this.watchLocation();
        } else if (!this.order) {
          const component = this;
          this.geolocation.getCurrentPosition().then((resp) => {
            if (!component.location) component.location = new MyLocation();
            component.location.lat = String(resp.coords.latitude);
            component.location.lng = String(resp.coords.longitude);
            window.localStorage.setItem(Constants.KEY_LOCATION, JSON.stringify(component.location));

            component.subscriptions.push(component.service.updateDeliveryProfile({
              is_online: component.online,
              longitude: component.location.lng,
              latitude: component.location.lat
            }).subscribe(res => {
              component.profile = res;
              window.localStorage.setItem(Constants.KEY_PROFILE, JSON.stringify(res));
              if (res.is_online == 1 && !component.refreshingOrder && (!component.order || !component.order.id || component.order.status == "complete")) {
                component.refreshOrder();
              }
            }, err => {
              console.log('updateDeliveryProfile', JSON.stringify(err));
            }));

            if (component.maps.map) {
              let center = new google.maps.LatLng(resp.coords.latitude, resp.coords.longitude);
              if (component.markerMe) {
                component.markerMe.setPosition(center);
              } else {
                component.markerMe = new google.maps.Marker({
                  position: center,
                  map: component.maps.map,
                  title: 'You are here!',
                  icon: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'
                });
              }
              setTimeout(() => {
                component.maps.map.panTo(center);
              }, 1000);
            }

          }).catch((error) => {
            console.log('Error getting location', JSON.stringify(error));
          });
        }
      } else {
        this.alertLocationServices();
      }
    }).catch((e) => {
      console.error(e);
      this.alertLocationServices();
    });
  }

  ionViewWillLeave() {
    this.subscriptions.forEach((subscription: Subscription) => {
      subscription.unsubscribe();
    });
    if (this.geoSubscription) {
      this.geoSubscription.unsubscribe();
      this.geoSubscription = null;
    }
    this.global.dismissLoading();
  }

  toggleOnline() {
    this.translate.get('just_a_mmnt').subscribe(value => {
      this.global.presentLoading(value);
    });
    this.subscriptions.push(this.service.updateDeliveryProfile({ is_online: this.online }).subscribe(res => {
      this.profile = res;
      window.localStorage.setItem(Constants.KEY_PROFILE, JSON.stringify(res));
      if (res.is_online == 1) {
        if (!this.refreshingOrder) {
          this.refreshOrder();
        } else {
          this.global.dismissLoading();
        }
      } else {
        this.global.dismissLoading();
      }
    }, err => {
      console.log('updateDeliveryProfile', JSON.stringify(err));
      this.global.showToast("Unable to toggle availability at the moment");
      this.global.dismissLoading();
    }));
  }

  refreshOrder() {
    this.refreshingOrder = true;
    this.subscriptions.push(this.service.getCurrentOrder().subscribe(res => {
      this.refreshingOrder = false;
      console.log("getCurrentOrder", JSON.stringify(this.order));
      this.global.dismissLoading();
      if (res.status == "complete") {
        this.order = null;
        this.translate.get('no_order').subscribe(value => {
          this.global.showToast(value);
        });
      } else {
        if (!this.order || this.order.id != res.id || this.order.status != res.status) {
          this.order = res;
          if (res.delivery_status == "allotted") {
            this.translate.get(res.status == "dispatched" ? "dispatched" : "dispatched_not").subscribe(value => {
              this.global.showToast(value);
            });
          }
          let distance: number = this.global.getDistanceBetweenTwoCoordinates(this.order.store.latitude, this.order.store.latitude, this.location.lat, this.location.lng);
          if (distance) this.distance = Number(distance.toFixed(2));
          this.checkAndSetMarkers();
        }
      }
    }, err => {
      this.refreshingOrder = false;
      this.global.dismissLoading();
      console.log('getCurrentOrder', JSON.stringify(err));
      let toastMessage: string;
      this.translate.get('no_order_err').subscribe(value => {
        toastMessage = value;
      });
      if (err.status == 404) {
        this.translate.get('no_order').subscribe(value => {
          toastMessage = value;
        });
      }
      this.global.showToast(toastMessage);
    }));
  }

  updateOrder() {
    let toUpdate: string;
    if (this.order) {
      switch (this.order.delivery_status) {
        case "allotted":
          if (this.order.status == "dispatched") {
            toUpdate = "started";
          } else {
            this.translate.get("dispatched_not").subscribe(value => {
              this.global.showToast(value);
            });
          }
          break;
        case "started":
          toUpdate = "complete";
          break;
      }
    }

    if (toUpdate) {
      this.translate.get('loading').subscribe(value => {
        this.global.presentLoading(value);
      });
      this.subscriptions.push(this.service.updateOrderStatus(toUpdate, this.order.id).subscribe(res => {
        if (res.status == "complete") {
          if (this.geoSubscription) {
            this.geoSubscription.unsubscribe();
            this.geoSubscription = null;
          }
          this.order = null;
          this.translate.get('completed').subscribe(value => {
            this.global.showToast(value);
          });
        } else {
          this.order = res;
          if (this.order.delivery_status == 'started') {
            this.diagnostic.isLocationEnabled().then((isAvailable) => {
              if (isAvailable) {
                this.watchLocation();
              } else {
                this.alertLocationServices();
              }
            }).catch((e) => {
              console.error(e);
              this.alertLocationServices();
            });
          } else {
            if (this.geoSubscription) {
              this.geoSubscription.unsubscribe();
              this.geoSubscription = null;
            }
          }
        }
        this.global.dismissLoading();
      }, err => {
        this.global.dismissLoading();
        console.log('updateOrderStatus', JSON.stringify(err));
      }));
    }
  }

  watchLocation() {
    if (!this.geoSubscription) {
      this.geoSubscription = this.geolocation.watchPosition().subscribe(position => {
        if ((position as Geoposition).coords != undefined) {
          var geoposition = (position as Geoposition);
          console.log('Latitude: ' + geoposition.coords.latitude + ' - Longitude: ' + geoposition.coords.longitude);
          if (!this.location.lat || !this.location.lng || this.location.lat != String(geoposition.coords.latitude) || this.location.lng != String(geoposition.coords.longitude)) {
            this.location.lat = String(geoposition.coords.latitude);
            this.location.lng = String(geoposition.coords.longitude);
            window.localStorage.setItem(Constants.KEY_LOCATION, JSON.stringify(this.location));

            firebase.database().ref().child("cookfu").child(String(this.order.id)).set(this.location);

            this.subscriptions.push(this.service.updateDeliveryProfile({
              is_online: this.online,
              longitude: this.location.lng,
              latitude: this.location.lat
            }).subscribe(res => {
              console.log('updateDeliveryProfile', JSON.stringify(res));
            }, err => {
              console.log('updateDeliveryProfile', JSON.stringify(err));
              this.global.showToast("Unable to toggle availability at the moment");
              this.global.dismissLoading();
            }));

            if (this.maps.map) {
              let center = new google.maps.LatLng(geoposition.coords.latitude, geoposition.coords.longitude);
              if (this.markerMe) {
                this.markerMe.setPosition(center);
              } else {
                this.markerMe = new google.maps.Marker({
                  position: center,
                  map: this.maps.map,
                  title: 'You are here!',
                  icon: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'
                });
              }
              setTimeout(() => {
                this.maps.map.panTo(center);
              }, 1000);
            }
          }
        } else {
          var positionError = (position as any);
          console.log('Error ' + positionError.code + ': ' + positionError.message);
        }
      });
    }
  }

  alertLocationServices() {
    this.translate.get(['location_services_title', 'location_services_message', 'okay']).subscribe(text => {
      let alert = this.alertCtrl.create({
        title: text['location_services_title'],
        subTitle: text['location_services_message'],
        buttons: [{
          text: text['okay'],
          role: 'cancel',
          handler: () => {
            console.log('okay clicked');
          }
        }]
      });
      alert.present();
    })
  }

  checkAndSetMarkers() {
    if (this.maps.map && this.order) {
      let store = null;
      if (this.order.store && this.order.store.latitude && this.order.store.longitude)
        store = new google.maps.LatLng(this.order.store.latitude, this.order.store.longitude);
      let customer = null;
      if (this.order.address && this.order.address.latitude && this.order.address.longitude)
        customer = new google.maps.LatLng(this.order.address.latitude, this.order.address.longitude);
      //this.map.panTo(center);
      if (store) {
        if (this.markerStore) {
          this.markerStore.setPosition(store);
        } else {
          this.markerStore = new google.maps.Marker({
            position: store,
            map: this.maps.map,
            title: 'Merchant',
            icon: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
          });
        }
        setTimeout(() => {
          this.maps.map.panTo(store);
        }, 1000);
      }
      if (customer) {
        if (this.markerCustomer) {
          this.markerCustomer.setPosition(customer);
        } else {
          this.markerCustomer = new google.maps.Marker({
            position: customer,
            map: this.maps.map,
            title: 'Customer',
            icon: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png'
          });
        }
        setTimeout(() => {
          this.maps.map.panTo(customer);
        }, 1500);
      }
    }
  }

}
