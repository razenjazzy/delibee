import { Component, Inject } from '@angular/core';
import { NavParams, NavController, Platform, PopoverController } from 'ionic-angular';
import { Category } from '../../models/category.models';
import { FirebaseClient } from '../../providers/firebase';
import { Item } from '../../models/item.models';
import { Global } from '../../providers/global';
import { ClientService } from '../../providers/client.service';
import { TranslateService } from '@ngx-translate/core';
import { APP_CONFIG, AppConfig } from '../../app/app.config';
import { Subscription } from 'rxjs/Subscription';
import { File, FileEntry, Entry } from '@ionic-native/file';
import { CategoriesPage } from "../../pages/categories/categories";
import { ImagePicker } from '@ionic-native/image-picker';

@Component({
  selector: 'page-additem',
  templateUrl: 'additem.html',
  providers: [Global, ClientService, FirebaseClient]
})
export class AdditemPage {
  gaming: string = "nes";
  private progress: boolean = false;
  private fileToUpload: File;
  private subscriptions = new Array<Subscription>();
  private item = new Item();
  private categories = new Array<Category>();
  private paramsItem: Item;

  constructor(@Inject(APP_CONFIG) private config: AppConfig, private navCtrl: NavController, private file: File,
    private service: ClientService, private translate: TranslateService, private popoverCtrl: PopoverController, private _firebase: FirebaseClient,
    private global: Global, private imagePicker: ImagePicker, private platform: Platform, private params: NavParams) {
    this.getCategories();
    this.paramsItem = this.params.get("item");
    if (this.paramsItem && this.paramsItem.id) {
      this.item = JSON.parse(JSON.stringify(this.paramsItem));
      delete this.item.categories;
      this.item.categories = new Array<number>();
      for (let sc of this.paramsItem.categories)
        this.item.categories.push(sc.id);
    }
    console.log("paramsItem", this.paramsItem);
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

  editphoto() {
    if (this.progress) return false;
    let fileInput = document.getElementById("pres-item-image");
    fileInput.click();
  }

  getCategories() {
    this.translate.get('loading').subscribe(value => {
      this.global.presentLoading(value);
    });
    let subscription: Subscription = this.service.getCategories().subscribe(res => {
      let categories: Array<Category> = res.data.sort((a, b) => a.id < b.id ? -1 : 1);
      this.categories = categories;
      this.global.dismissLoading();
    }, err => {
      this.global.dismissLoading();
      console.log('cat_err', err);
    });
    this.subscriptions.push(subscription);
  }

  saveItem() {
    if (!this.item.image_url) {
      this.translate.get('store_pic_err').subscribe(value => {
        this.global.showToast(value);
      });
    } else if (!this.item.title) {
      this.translate.get('store_name_err').subscribe(value => {
        this.global.showToast(value);
      });
    } else if (!this.item.categories.length) {
      this.translate.get('itm_categories_err').subscribe(value => {
        this.global.showToast(value);
      });
    } else if (!this.item.specification) {
      this.translate.get('specification_err').subscribe(value => {
        this.global.showToast(value);
      });
    } else if (!this.item.price) {
      this.translate.get('itm_price_err').subscribe(value => {
        this.global.showToast(value);
      });
    } else if (!this.item.quantity) {
      this.translate.get('itm_quantity_err').subscribe(value => {
        this.global.showToast(value);
      });
    }
    else if (!this.item.detail) {
      this.translate.get('store_details_err').subscribe(value => {
        this.global.showToast(value);
      });
    } else {
      this.translate.get('address_saving').subscribe(value => {
        this.global.presentLoading(value);
      });

      console.log(JSON.stringify(this.item));
      if (this.item.id) {
        let subscription: Subscription = this.service.updateItem(this.item).subscribe(res => {
          window.localStorage.setItem("itemUpdated", JSON.stringify(res));
          this.item = res;
          this.global.dismissLoading();
          this.navCtrl.pop();
        }, err => {
          this.global.dismissLoading();
          console.log('cat_err', err);
        });
        this.subscriptions.push(subscription);
      } else {
        let subscription: Subscription = this.service.saveItem(this.item).subscribe(res => {
          window.localStorage.setItem("itemAdded", JSON.stringify(res));
          this.item = res;
          this.global.dismissLoading();
          this.navCtrl.pop();
        }, err => {
          this.global.dismissLoading();
          console.log('cat_err', err);
        });
        this.subscriptions.push(subscription);
      }
    }
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
    this.translate.get('upload_pic').subscribe(value => {
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
        console.log("Url is:--" + JSON.stringify(url));
        this.item.image_url = String(url);
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
        // this.global.presentLoading("Uploading image");
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
      this.item.image_url = String(url);
    }).catch(err => {
      this.progress = false;
      console.log(err);
      this.global.dismissLoading();
      this.global.showToast(JSON.stringify(err));
    });
  }

}