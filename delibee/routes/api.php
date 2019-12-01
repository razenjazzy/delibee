<?php

use Illuminate\Http\Request;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::namespace('Api')->name('api.')->group(function () {

    // Backend Api
    Route::namespace('Admin')->prefix('admin')->name('admin.')->group(function () {

        // auth related
        Route::namespace('Auth')->group(function () {
            Route::post('/login', 'LoginController@authenticate');
        });

        Route::middleware('auth:api')->group(function () {

            // category
            Route::get('/categories/all', 'CategoryController@allCategories');
            Route::apiResource('categories', 'CategoryController');

            // coupons
            Route::apiResource('coupons', 'CouponController');

            // user
            Route::get('/users/roles', 'UserController@roles');
            Route::apiResource('users', 'UserController');

            // store
            Route::apiResource('stores', 'StoreController');

            // menuitems
            Route::apiResource('menuitems', 'MenuItemController');

            // deliveryprofiles
            Route::get('/deliveryprofiles/{deliveryprofile}/favourite', 'FavouriteDriverController@store');
            Route::apiResource('deliveryprofiles', 'DeliveryProfileController')->except('create');

            // order
            Route::apiResource('orders', 'OrderController')->except('create');

            // support
            Route::get('/supports', 'SupportController@index');

            // transactions
            Route::get('/transactions', 'TransactionController@index');
            Route::get('/transactions/earning-analytics', 'TransactionController@earningAnalytics');

            // plan
            Route::apiResource('plans', 'PlanController')->except('create')->except('delete');

            // settings
            Route::get('/settings', 'SettingController@index');
            Route::post('/settings', 'SettingController@update');
            Route::get('/settings/env', 'SettingController@envList');
            Route::post('/settings/env', 'SettingController@updateEnv');

            // dashboard
            Route::get('/dashboard/order-analytics', 'DashboardController@orderAnalytics');
            Route::get('/dashboard/user-analytics', 'DashboardController@userAnalytics');
            Route::get('/dashboard/user-statitics', 'DashboardController@userStatitics');
            Route::get('/dashboard/active-orders', 'DashboardController@activeOrders');
            Route::get('/dashboard/active-delivery', 'DashboardController@activeDelivery');
        });
    });

    Route::namespace('Auth')->group(function () {
        Route::post('/login', 'LoginController@authenticate')->name('login');
        Route::post('/register', 'RegisterController@register')->name('register');
        Route::post('/verify-mobile', 'RegisterController@verifyMobile')->name('verifyMobile');
        Route::post('/forgot-password', 'RegisterController@sendResetLinkEmail')->name('forgotPassword');
        Route::post('social/login', 'SocialLoginController@authenticate')->name('social.authenticate');
    });

    Route::post('/support', 'SupportController@store')->name('support.store');

    // system wide settings
    Route::get('/settings', 'SettingController@index')->name('setting.index');

    Route::namespace('Customer')->prefix('customer')->name('customer.')->group(function () {
        Route::get('/category', 'CategoryController@index')->name('category.index');

        // list of store
        Route::get('/store', 'StoreController@index')->name('store.index');

        // show store by id
        Route::get('/store/{store}', 'StoreController@show')->name('store.show');

        // get a list of ratings
        Route::get('/rating/{store}', 'RatingController@index')->name('rating.index');

        // Payment gateway - Paystack
        Route::get('/order/{order}/payment/paystack', 'OrderController@makePaystackPayment')->name('order.makePaystackPayment');
        Route::get('/order/{order}/payment/paystack/callback', 'OrderController@paystackCallback')->name('order.paystackCallback');
        Route::get('/order/{order}/payment/paystack/status', 'OrderController@paystackStatus')->name('order.paystackStatus');
    });

    Route::middleware('auth:api')->group(function () {

        Route::get('/user', 'UserController@show')->name('user.show');
        Route::put('/user', 'UserController@update')->name('user.update');

        // user earnings
        Route::get('/earnings', 'EarningController@index')->name('earning.index');
        Route::get('/earnings/{earning}', 'EarningController@show')->name('earning.show');

        /* Store related APIs */
        // get store of current logged in user
        Route::get('/store', 'StoreController@show')->name('store.show');
        // update store
        Route::put('/store/update', 'StoreController@update')->name('store.update');

        Route::get('/menuitem', 'MenuItemController@index')->name('menuitem.index');
        Route::post('/menuitem', 'MenuItemController@store')->name('menuitem.store');
        Route::get('/menuitem/{menuItem}', 'MenuItemController@show')->name('menuitem.show');
        Route::post('/menuitem/{menuItem}', 'MenuItemController@update')->name('menuitem.update');
        Route::post('/menuitem/{menuItem}/update-status', 'MenuItemController@updateStatus')->name('menuitem.updateStatus');
        Route::post('/menuitem/{menuItem}/update-quantity', 'MenuItemController@updateQuantity')->name('menuitem.updateQuantity');
        Route::delete('/menuitem/{menuItem}', 'MenuItemController@destroy')->name('menuitem.destroy');

        Route::get('/bank-detail', 'BankDetailController@show')->name('bankdetail.show');
        Route::post('/bank-detail', 'BankDetailController@store')->name('bankdetail.store');

        Route::get('/category', 'CategoryController@index')->name('category.index');

        /* order related */
        // get a list of orders of a logged in user's store
        Route::get('/order', 'OrderController@index')->name('order.index');
        Route::get('/order/{order}', 'OrderController@show')->name('order.show');
        Route::put('/order/{order}', 'OrderController@update')->name('order.update');

        // get a list of reviews of a logged in user's store
        Route::get('/rating', 'RatingController@index')->name('rating.index');

        // store plan details
        Route::get('/plans', 'PlanController@plans')->name('plans.index');
        Route::post('/plans/{plan}/payment/stripe', 'PlanController@makeStripePayment')->name('plans.makeStripePayment');
        Route::post('/plans/{plan}/payment/inapp', 'PlanController@inAppPayment')->name('plans.inAppPayment');
        Route::get('/plan-details', 'PlanController@planDetails')->name('plans.planDetails');

        /* Customer related APIs */
        Route::namespace('Customer')->prefix('customer')->name('customer.')->group(function () {
            // Get a list of favourite
            Route::get('/favourite', 'FavouriteController@index')->name('favourite.index');

            // mark store as favourite
            Route::post('/favourite/{store}', 'FavouriteController@store')->name('favourite.store');

            // get a rating of a stores rated by current user
            Route::get('/rating/me', 'RatingController@show')->name('rating.show');

            // rate a store
            Route::post('/rating/{store}', 'RatingController@store')->name('rating.store');

            // check coupon validity
            Route::get('/coupons', 'CouponController@index')->name('coupon.index');
            Route::get('/coupon-validity', 'CouponController@couponValidity')->name('coupon.validity');

            /* address related */
            Route::get('/address', 'AddressController@index')->name('address.index');
            Route::post('/address', 'AddressController@store')->name('address.store');
            Route::get('/address/{address}', 'AddressController@show')->name('address.show');
            Route::put('/address/{address}/update', 'AddressController@update')->name('address.update');

            /* orders related */
            // get a list of orders of a current user
            Route::get('/order', 'OrderController@index')->name('order.index');
            Route::post('/order', 'OrderController@store')->name('order.store');
            Route::post('/order/calculate-delivery-fee', 'OrderController@calculateDeliveryFee')->name('order.calculateDeliveryFee');
            Route::post('/order/{order}', 'OrderController@update')->name('order.update');
            Route::post('/order/{order}/payment/stripe', 'OrderController@makeStripePayment')->name('order.makeStripePayment');
            Route::post('/order/{order}/payment/payu', 'OrderController@makePayUPayment')->name('order.makePayUPayment');
            Route::get('/payment-methods', 'PaymentMethodController@index')->name('paymentmethod.index');
        });

        /* Delivery related APIs */
        Route::namespace('Delivery')->prefix('delivery')->name('delivery.')->group(function () {
            Route::get('/profile', 'DeliveryProfileController@show')->name('profile.show');
            // update delivery profile
            Route::put('/profile/update', 'DeliveryProfileController@update')->name('profile.update');

            Route::get('/order', 'OrderController@showAvailableOrder')->name('order.showAvailableOrder');
            Route::put('/update-delivery-status/{order}', 'OrderController@updateDeliveryStatus')->name('order.updateDeliveryStatus');
        });
    });
});