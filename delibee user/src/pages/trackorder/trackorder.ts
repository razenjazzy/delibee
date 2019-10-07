import { NavController, ToastController, NavParams } from 'ionic-angular';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { GoogleMaps } from '../../providers/google-maps';
import { MyLocation } from '../../models/my-location.models';
import * as firebase from 'firebase/app';
import { } from '@types/googlemaps';

@Component({
  selector: 'page-trackorder',
  templateUrl: 'trackorder.html'
})
export class TrackorderPage {
  @ViewChild('map') mapElement: ElementRef;
  @ViewChild('pleaseConnect') pleaseConnect: ElementRef;
  private order: any;
  private markerMe: google.maps.Marker;
  private markerStore: google.maps.Marker;
  private markerOrder: google.maps.Marker;
  private initialized: boolean;
  private orderRef: firebase.database.Reference;
  private orderLocation: MyLocation;

  constructor(private navCtrl: NavController, private maps: GoogleMaps,
    private toastCtrl: ToastController, navparam: NavParams) {
    this.order = navparam.get("order");
  }

  ionViewDidLoad(): void {
    if (!this.initialized) {
      let mapLoaded = this.maps.init(this.mapElement.nativeElement, this.pleaseConnect.nativeElement).then(() => {
        this.initialized = true;
        this.loadOrderLocations();
      }).catch(err => {
        console.log(err);
        this.navCtrl.pop();
      });
      mapLoaded.catch(err => {
        console.log(err);
        this.navCtrl.pop();
      });

      const component = this;
      this.orderRef = firebase.database().ref().child("cookfu").child(String(this.order.id));
      this.orderRef.on("value", function (data) {
        let newOrderLocation = data.val() as MyLocation;
        if (newOrderLocation && newOrderLocation.lat && newOrderLocation.lng) {
          component.orderLocation = newOrderLocation;
          component.loadOrderLocations();
        }
      });
    }
  }

  loadOrderLocations() {
    if (this.maps.map) {
      const component = this;
      if (!this.markerMe) {
        let centerMe = new google.maps.LatLng(Number(this.order.address.latitude), Number(this.order.address.longitude));
        this.markerMe = new google.maps.Marker({
          position: centerMe,
          map: this.maps.map,
          title: 'Home',
          label: 'H',
          icon: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'
        });
        setTimeout(() => {
          this.maps.map.panTo(centerMe);
        }, 100);

        let infoMe = new google.maps.InfoWindow({
          content: "Home"
        });
        this.markerMe.addListener('click', function () {
          infoMe.open(component.maps.map, component.markerMe);
        });
      }

      if (!this.markerStore) {
        let centerStore = new google.maps.LatLng(Number(this.order.store.latitude), Number(this.order.store.longitude));
        this.markerStore = new google.maps.Marker({
          position: centerStore,
          map: this.maps.map,
          title: 'Merchant',
          label: 'R',
          icon: 'http://maps.google.com/mapfiles/ms/icons/yellow-dot.png'
        });
        setTimeout(() => {
          this.maps.map.panTo(centerStore);
        }, 400);

        let infoStore = new google.maps.InfoWindow({
          content: "Merchant"
        });
        this.markerStore.addListener('click', function () {
          infoStore.open(component.maps.map, component.markerStore);
        });
      }

      if (this.orderLocation) {
        let centerOrder = new google.maps.LatLng(Number(this.orderLocation.lat), Number(this.orderLocation.lng));
        if (this.markerOrder) {
          this.markerOrder.setPosition(centerOrder);
        } else {
          this.markerOrder = new google.maps.Marker({
            position: centerOrder,
            map: this.maps.map,
            title: 'Your order is here!',
            label: 'F',
            icon: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png'
          });

          let infoFood = new google.maps.InfoWindow({
            content: "Your order is here!"
          });
          this.markerOrder.addListener('click', function () {
            infoFood.open(component.maps.map, component.markerOrder);
          });
        }
        setTimeout(() => {
          this.maps.map.panTo(centerOrder);
        }, 1000);
      }
    }
  }

  showToast(message: string) {
    let toast = this.toastCtrl.create({
      message: message,
      duration: 3000,
      position: 'bottom'
    });
    toast.onDidDismiss(() => {
      console.log('Dismissed toast');
    });
    toast.present();
  }

}