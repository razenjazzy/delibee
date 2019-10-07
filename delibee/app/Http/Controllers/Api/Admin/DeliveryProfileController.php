<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\DeliveryProfile;
use App\Models\FavouriteDriver;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Validator;

class DeliveryProfileController extends Controller
{
    public function index(Request $request)
    {

        $deliveryProfiles = DeliveryProfile::whereRaw('1=1');

        $storeId = -1;
        $currentStore = admin_get_store();
        if ($currentStore) {
            $storeId = $currentStore->id;
        }


        if ($request->user_like) {
            $user_email = $request->user_like;
            $deliveryProfiles = $deliveryProfiles->whereHas('user', function ($query) use ($user_email) {
                $query->where('email', 'like', "%$user_email%");
            });
        }

        if ($request->is_online_like) {
            if ($request->is_online_like == 'Yes') {
                $deliveryProfiles = $deliveryProfiles->where('is_online', 1);
            }
            if ($request->is_online_like == 'No') {
                $deliveryProfiles = $deliveryProfiles->where('is_online', 0);
            }
        }

        if ($request->assigned_like) {
            if ($request->assigned_like == 'Yes') {
                $deliveryProfiles = $deliveryProfiles->where('assigned', 1);
            }
            if ($request->assigned_like == 'No') {
                $deliveryProfiles = $deliveryProfiles->where('assigned', 0);
            }
        }

        if ($request->favourite_like) {
            if ($request->favourite_like == 'Yes') {
                $deliveryProfiles = $deliveryProfiles->whereRaw('(SELECT COUNT(store_id) FROM favourite_drivers WHERE store_id=' . $storeId . ' and delivery_profile_id=delivery_profiles.id) > 0');
            }
            if ($request->favourite_like == 'No') {
                $deliveryProfiles = $deliveryProfiles->whereRaw('(SELECT COUNT(store_id) FROM favourite_drivers WHERE store_id=' . $storeId . ' and delivery_profile_id=delivery_profiles.id) = 0');
            }
        }

        $deliveryProfiles = $deliveryProfiles->select('*',
            DB::raw('(SELECT COUNT(store_id) FROM favourite_drivers WHERE store_id=' . $storeId . ' and delivery_profile_id=delivery_profiles.id) as favourite'));


        return response()->json($deliveryProfiles->orderBy('created_at', 'desc')->paginate(config('constants.paginate_per_page')));
    }

    public function show(DeliveryProfile $deliveryprofile)
    {
        $storeId = -1;
        $currentStore = admin_get_store();
        if ($currentStore) {
            $storeId = $currentStore->id;
        }

        $deliveryprofile = DeliveryProfile::select('*',
            DB::raw('(SELECT COUNT(store_id) FROM favourite_drivers WHERE store_id=' . $storeId . ' and delivery_profile_id=delivery_profiles.id) as favourite'))
            ->where('id', $deliveryprofile->id)->first();
        return response()->json($deliveryprofile);
    }

    public function update(Request $request, DeliveryProfile $deliveryprofile)
    {
        $request->validate([
            'favourite' => 'in:1,0'
        ]);

        // handle favourite
        // 1. Only store can mark favourite
        $currentStore = admin_get_store();
        if ($currentStore) {
            $fav = FavouriteDriver::where('store_id', $currentStore->id)->where('delivery_profile_id', $deliveryprofile->id)->first();
            if ($fav === null && $request->favourite == 1) {
                // mark favourite
                $fav = new FavouriteDriver();
                $fav->delivery_profile_id = $deliveryprofile->id;
                $fav->store_id = $currentStore->id;
                $fav->save();
            } else {
                if ($request->favourite != 1) {
                    $fav->delete();
                }
            }
        }

        return response()->json($deliveryprofile, 200);
    }

    public function destroy(DeliveryProfile $deliveryprofile)
    {
        $deliveryprofile->user->forceDelete();
        return response()->json([], 204);
    }
}
