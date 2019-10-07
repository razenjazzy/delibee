<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Requests\Admin\StoreUpdateRequest;
use App\Models\Auth\Role\Role;
use App\Models\Auth\User\User;
use App\Models\Store;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Rennokki\Plans\Models\PlanModel;
use Symfony\Component\Finder\Exception\AccessDeniedException;
use Validator;

class StoreController extends Controller
{
    public function index(Request $request)
    {
        $stores = Store::whereRaw('1=1');

        $currentStore = admin_get_store();
        if($currentStore) {
            $stores = $stores->where('id', $currentStore->id);
        }

        if ($request->user_like) {
            $email = $request->email_like;
            $stores = $stores->whereHas('roles', function ($query) use ($email) {
                $query->where('name', 'like', '%' . $email . '%');
            });
        }

        if ($request->name_like) {
            $stores = $stores->where('name', 'like', "%" . $request->name_like . "%");
        }

        if ($request->address_like) {
            $stores = $stores->where('address', 'like', "%" . $request->address_like . "%");
        }

        return response()->json($stores->with('user')->orderBy('created_at', 'desc')->paginate(config('constants.paginate_per_page')));
    }

    public function show(Store $store)
    {
        admin_authorize_store($store->id);

        $earnings = [
            'total_earnings' => (clone $store->user->earnings)->sum('amount'),
            'unpaid_earnings' => (clone $store->user->earnings)->where('paid', 0)->sum('amount')
        ];
        return response()->json($store);
    }

    public function update(Request $request, Store $store)
    {
        admin_authorize_store($store->id);

        $request->validate([
            'name' => 'string|nullable',
            'tagline' => 'string|nullable',
            'image' => 'sometimes|image|nullable',
            'delivery_time' => 'string|nullable',
            'minimum_order' => 'integer|nullable',
            'delivery_fee' => 'numeric|nullable',
            'details' => 'string|nullable',
            'delivery_limit' => 'integer|nullable',
            'area' => 'string|nullable',
            'address' => 'string|nullable',
            'longitude' => 'numeric|nullable',
            'latitude' => 'numeric|nullable',
            'serves_non_veg' => 'in:1,0',
            'preorder' => 'in:1,0',
            'cost_for_two' => 'numeric',
            'status' => 'in:open,closed',
            'delivery_preference' => 'in:any,favourite,owner',
            'opens_at' => 'string',
            'closes_at' => 'string',
            'plan_id' => 'nullable'
        ]);

        $store->fill($request->all());

        if ($request->image) {
            $path = $request->file('image')->store('uploads');
            $store->image_url = Storage::url($path);
        }

        $store->save();

        $user = $store->user;

        // cancel the subscription of a user
        if(!$request->plan_id && $user->hasActiveSubscription()) {
            $user->cancelCurrentSubscription();
        }

        // subscribe a user to the plan
        if($request->plan_id && (!$user->hasActiveSubscription() || $user->activeSubscription()->plan_id != $request->plan_id)) {
            // cancel any existing subscription
            if($user->hasActiveSubscription()) {
                $user->cancelCurrentSubscription();
            }


            // make sure plan exists
            if(PlanModel::where('id', $request->plan_id)->exists()) {
                $plan = PlanModel::find($request->plan_id);
                $user->subscribeTo($plan, $plan->duration);
            }
        }

        return response()->json($store, 200);
    }

    public function destroy(Store $store)
    {
        $store->user->forceDelete();
        return response()->json([], 204);
    }
}
