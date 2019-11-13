import { InjectionToken } from "@angular/core";

export let APP_CONFIG = new InjectionToken<AppConfig>("app.config");

export interface FirebaseConfig {
  apiKey: string,
  authDomain: string,
  databaseURL: string,
  projectId: string,
  storageBucket: string,
  messagingSenderId: string,
  webApplicationId: string
}

export interface AppConfig {
  appName: string;
  apiBase: string;
  googleApiKey: string;
  stripeKey: string;
  availableLanguages: Array<any>;
  firebaseConfig: FirebaseConfig;
}

export const BaseAppConfig: AppConfig = {
  appName: "DeliBee Home",
  apiBase: "http://54.213.204.238/",
  googleApiKey: "AIzaSyDBZjAUb_BqMgaE6ZanWXaSgWP_VX-NynQ",
  stripeKey: "",
  availableLanguages: [{
    code: 'en',
    name: 'English'
  }, {
    code: 'ar',
    name: 'Arabic'
  }, {
    code: 'nl',
    name: 'Dutch'
  }],
  firebaseConfig: {
    webApplicationId: "175133208389-6la29vj3suksjhiutsp2v0dk866veard.apps.googleusercontent.com",
    apiKey: "AIzaSyDBZjAUb_BqMgaE6ZanWXaSgWP_VX-NynQ",
    authDomain: "delibee-acfc0.firebaseapp.com",
    databaseURL: "https://delibee-acfc0.firebaseio.com",
    projectId: "delibee-acfc0",
    storageBucket: "delibee-acfc0.appspot.com",
    messagingSenderId: "175133208389"
  }
};
