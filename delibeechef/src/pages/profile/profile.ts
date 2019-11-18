import { Component } from '@angular/core';
import { NavController, App, NavParams, Platform } from 'ionic-angular';
import { Constants } from '../../models/constants.models';
import { StoreResponse } from '../../models/store-response.models';
import { User } from '../../models/user.models';
import { Global } from '../../providers/global';
import { ClientService } from '../../providers/client.service';
import { FirebaseClient } from '../../providers/firebase';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs/Subscription';
import { File, FileEntry, Entry } from '@ionic-native/file';
import { TabsPage } from "../../pages/tabs/tabs";
import { MyLocation } from '../../models/my-location.models';
import { SelectareaPage } from '../selectarea/selectarea';
import { ImagePicker } from '@ionic-native/image-picker';

@Component({
  selector: 'page-profile',
  templateUrl: 'profile.html',
  providers: [Global, ClientService, FirebaseClient]
})
export class ProfilePage {
  private user: User;
  private progress: boolean = false;
  private fileToUpload: File;
  private storeRequest = new StoreResponse();
  private subscriptions = new Array<Subscription>();
  private tokenToUse: string;
  private areas = new Array<any>();

  constructor(private navCtrl: NavController, navParam: NavParams, private imagePicker: ImagePicker,
    private file: File, private service: ClientService, private translate: TranslateService,
    private _firebase: FirebaseClient, private global: Global, private app: App, private platform: Platform) {
    this.getAreas();
    let login_res = navParam.get("login_res");
    if (login_res && login_res.token && login_res.user) {
      this.user = login_res.user;
      this.tokenToUse = login_res.token;
    } else {
      this.user = JSON.parse(window.localStorage.getItem(Constants.KEY_USER));
      this.tokenToUse = window.localStorage.getItem(Constants.KEY_TOKEN);
    }
    let savedStore: StoreResponse = JSON.parse(window.localStorage.getItem(Constants.STORE_DETAILS));
    if (savedStore && savedStore.name && savedStore.name.length) {
      this.storeRequest = savedStore;
    } else {
      this.storeRequest.image_url = "../../assets/imgs/blank.png";
    }
  }

  ionViewWillLeave() {
    this.subscriptions.forEach((subscription: Subscription) => {
      subscription.unsubscribe();
    });
    this.global.dismissLoading();
  }

  ionViewDidEnter() {
    let newSelectedLocation: MyLocation = JSON.parse(window.localStorage.getItem(Constants.KEY_LOCATION));
    if (newSelectedLocation) {
      this.storeRequest.address = newSelectedLocation.name;
      this.storeRequest.area = newSelectedLocation.area;
      this.storeRequest.latitude = newSelectedLocation.lat;
      this.storeRequest.longitude = newSelectedLocation.lng;
      console.log("newSelectedLocation", this.storeRequest);
    }
  }

  formatAMPM(date) {
    var hours = date[0];
    var minutes = date[1];
    var ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12;
    minutes = minutes < 10 ? '0' + minutes : minutes;
    var strTime = hours + ':' + minutes + ' ' + ampm;
    return strTime;
  }

  openAction() {
    if (this.platform.is('cordova')) {
      let options = {
        maximumImagesCount: 1,
      };
      this.imagePicker.getPictures(options).then((results) => {
        if (results && results[0]) {
          this.resolve(results[0]);
        }
      }, (err) => {
        console.log(err);
      });
    } else {
      this.editphoto();
    }
  }

  getAreas() {
    this.service.getAreas().subscribe(data => {
      this.areas = data;
    }, err => {
      console.log(err);
    })
  }

  checkForLocation() {
    this.navCtrl.push(SelectareaPage);
  }

  saveStoreDetails() {
    console.log("saveStoreDetails", this.storeRequest);
    if (!this.storeRequest.image_url) {
      this.translate.get('store_pic_err').subscribe(value => {
        this.global.showToast(value);
      });
    } else if (!this.storeRequest.name) {
      this.translate.get('store_name_err').subscribe(value => {
        this.global.showToast(value);
      });
    } else if (!this.storeRequest.tagline) {
      this.translate.get('store_tag_err').subscribe(value => {
        this.global.showToast(value);
      });
    } else if (!this.storeRequest.opens_at) {
      this.translate.get('store_opentime_err').subscribe(value => {
        this.global.showToast(value);
      });
    } else if (!this.storeRequest.closes_at) {
      this.translate.get('store_closetime_err').subscribe(value => {
        this.global.showToast(value);
      });
    } else if (!this.storeRequest.delivery_time) {
      this.translate.get('store_delivery_err').subscribe(value => {
        this.global.showToast(value);
      });
    } else if (!this.storeRequest.delivery_fee) {
      this.translate.get('store_dlvr_fee_err').subscribe(value => {
        this.global.showToast(value);
      });
    } else if (!this.storeRequest.minimum_order) {
      this.translate.get('store_min_err').subscribe(value => {
        this.global.showToast(value);
      });
    } else if (!this.storeRequest.address || !this.storeRequest.address.length || !this.storeRequest.latitude || !this.storeRequest.longitude) {
      this.translate.get('store_address_err').subscribe(value => {
        this.global.showToast(value);
      });
    } else if (!this.storeRequest.area || !this.storeRequest.area.length) {
      this.translate.get('store_address_err').subscribe(value => {
        this.global.showToast(value);
      });
    } else if (!this.storeRequest.details) {
      this.translate.get('store_details_err').subscribe(value => {
        this.global.showToast(value);
      });
    } else {
      this.translate.get('address_saving').subscribe(value => {
        this.global.presentLoading(value);
      });
      let subscription: Subscription = this.service.updateStore(this.tokenToUse, this.storeRequest).subscribe(res => {
        window.localStorage.setItem(Constants.STORE_DETAILS, JSON.stringify(res));
        window.localStorage.setItem(Constants.KEY_USER, JSON.stringify(this.user));
        window.localStorage.setItem(Constants.KEY_TOKEN, this.tokenToUse);
        this.global.dismissLoading();
        this.app.getRootNav().setRoot(TabsPage);
      }, err => {
        this.global.dismissLoading();
        console.log('cat_err', err);
        this.translate.get('update_info_fail').subscribe(value => {
          this.global.showToast(value);
        });
      });
      this.subscriptions.push(subscription);
    }
  }

  editphoto() {
    if (this.progress) return false;
    let fileInput = document.getElementById("pres-image");
    fileInput.click();
  }

  resolve(uri: string) {
    console.log('uri: ' + uri);
    if (uri.startsWith('content://') && uri.indexOf('/storage/') != -1) {
      uri = "file://" + uri.substring(uri.indexOf("/storage/"), uri.length);
      console.log('file: ' + uri);
    }
    this.file.resolveLocalFilesystemUrl(uri).then((entry: Entry) => {
      console.log(entry);
      var fileEntry = entry as FileEntry;
      fileEntry.file(success => {
        var mimeType = success.type;
        console.log(mimeType);
        let dirPath = entry.nativeURL;
        this.upload(dirPath, entry.name, mimeType);
      }, error => {
        console.log(error);
      });
    })
  }

  upload(path, name, mime) {
    this.global.dismissLoading();
    this.translate.get('just_moment').subscribe(value => {
      this.global.presentLoading(value);
    });
    console.log('original: ' + path);
    let dirPathSegments = path.split('/');
    dirPathSegments.pop();
    path = dirPathSegments.join('/');
    console.log('dir: ' + path);
    this.file.readAsArrayBuffer(path, name).then(buffer => {
      this.global.dismissLoading();
      this.translate.get('upload_pic').subscribe(value => {
        this.global.presentLoading(value);
      });
      this.progress = true;
      this._firebase.uploadBlob(new Blob([buffer], { type: mime })).then(url => {
        this.global.dismissLoading();
        this.translate.get('pic_uploaded').subscribe(value => {
          this.global.showToast(value);
        });
        // this.global.showToast("Image uploaded");
        console.log("Url is:--" + JSON.stringify(url));
        this.storeRequest.image_url = String(url);
      }).catch(err => {
        this.progress = false;
        this.global.dismissLoading();
        this.global.showToast(JSON.stringify(err));
        console.log(err);
      })
    }).catch(err => {
      this.global.dismissLoading();
      this.global.showToast(JSON.stringify(err));
      console.log(err);
    })
  }

  changeFileListener($event) {
    this.fileToUpload = $event.target.files[0];
    let file = $event.target.files[0];
    if (file && file.type) {
      let strArr = file.type.split('/');
      if (strArr.length != 2) return false;
      if (strArr[0] == 'image') {
        this.progress = true;
        console.log("file picked:", this.fileToUpload);
        this.startUploadFile();
      }
    }
  }

  startUploadFile() {
    this.translate.get('upload_pic').subscribe(value => {
      this.global.presentLoading(value);
    });
    this._firebase.uploadFile(this.fileToUpload).then(url => {
      this.global.dismissLoading();
      this.translate.get('pic_uploaded').subscribe(value => {
        this.global.showToast(value);
      });
      console.log("Url is:--" + JSON.stringify(url));
      // this.saveUrl(String(url));
      this.progress = false;
      this.storeRequest.image_url = String(url);
    }).catch(err => {
      this.progress = false;
      console.log(err);
      this.global.dismissLoading();
      this.global.showToast(JSON.stringify(err));
    });
  }

}