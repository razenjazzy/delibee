<?php

namespace App\Http\Controllers\Api\Admin;

use App\Events\Ordered;
use App\Http\Requests\Admin\OrderUpdateRequest;
use App\Models\Order;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Validator;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        $orders = Order::whereRaw('1=1');

        $currentStore = admin_get_store();
        if($currentStore) {
            $orders = $orders->where('store_id', $currentStore->id);
        }

        if ($request->store_like) {
            $name = $request->store_like;
            $orders = $orders->whereHas('store', function ($query) use ($name) {
                $query->where('name', 'like', '%' . $name . '%');
            });
        }

        if ($request->user_like) {
            $email = $request->user_like;
            $orders = $orders->whereHas('user', function ($query) use ($email) {
                $query->where('email', 'like', '%' . $email . '%');
            });
        }

        if($request->total_like) {
            $orders = $orders->where('total', 'like', '%' . $request->total_like . '%');
        }

        if($request->status_like) {
            $orders = $orders->where('status', 'like', '%' . $request->status_like . '%');
        }

        if($request->delivery_status_like) {
            $orders = $orders->where('delivery_status', 'like', '%' . $request->delivery_status_like . '%');
        }

        if($request->payment_status_like) {
            $orders = $orders->where('payment_status', 'like', '%' . $request->payment_status_like . '%');
        }

        if($request->created_at_like) {
            $orders = $orders->where('created_at', 'like', '%' . $request->created_at_like . '%');
        }

        return response()->json($orders->orderBy('created_at', 'desc')->paginate(config('constants.paginate_per_page')));
    }


    public function show(Order $order)
    {
        admin_authorize_store($order->store_id);

        return response()->json($order);
    }

    public function update(Request $request, Order $order)
    {
        $request->validate([
            'status' => 'required|in:accepted,rejected,preparing,dispatched,complete'
        ]);

        // if order status does changed
        if($order->status !== $request->status) {

            if ($request->status == 'dispatched' && !$order->delivery_profile_id) {
                // if store is trying to update the status of order to `dispatched`, first check if delivery person is assigned
                // to the order, if yes, simply update the order status, if no, try to allot delivery person to the order
                // if success, return 422 status code implying we have allotted the delivery person but order is not yet dispatched,
                // if we don't find any delivery person yet return status code 404
                if ($order->allotDeliveryPerson($order)) {
                    return response()->json($order->refresh(), 422);
                };
                return response()->json($order, 404);
            }
            $order->fill($request->all());
            $order->save();

            event(new Ordered($order, true));
        }

        return response()->json($order);
    }

    public function destroy(Order $order)
    {
        $order->delete();
        return response()->json([], 204);
    }
}
