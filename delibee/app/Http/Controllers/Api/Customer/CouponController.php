<?php

namespace App\Http\Controllers\Api\Customer;

use App\Exceptions\CouponException;
use App\Http\Controllers\Controller;
use App\Http\Requests\Customer\ApiCouponRequest;
use App\Models\Coupon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class CouponController extends Controller
{

    /**
     * @param ApiCouponRequest $request
     * @return \Illuminate\Http\JsonResponse
     * @throws ValidationException
     */
    public function couponValidity(ApiCouponRequest $request)
    {
        $user = Auth::user();

        $coupon= Coupon::where('code', $request->code)->first();

        try {
            Coupon::checkValidity($coupon, $user);
            return response()->json($coupon);
        } catch (CouponException $e) {
            throw ValidationException::withMessages([
                'code' => $e->getMessage()
            ]);
        }
    }
}
