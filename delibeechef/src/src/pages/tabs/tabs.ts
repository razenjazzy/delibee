import { Component } from '@angular/core';
import { OrdersPage } from '../orders/orders';
import { DeliveryPage } from '../delivery/delivery';
import { ItemsPage } from '../items/items';
import { AccountPage } from '../account/account';

@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage {

  tab1Root = OrdersPage;
  tab2Root = DeliveryPage;
  tab3Root = ItemsPage;
  tab4Root = AccountPage;

  constructor() {

  }

}
