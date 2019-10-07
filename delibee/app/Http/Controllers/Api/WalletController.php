<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StripePaymentRequest;
use App\Models\Setting;
use App\Models\Transaction;
use Cartalyst\Stripe\Laravel\Facades\Stripe;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class WalletController extends Controller
{
    public function withdraw(Request $request)
    {
        $request->validate([
            'amount' => 'required|numeric|max:' . Auth::user()->balance
        ]);

        Auth::user()->withdraw($request->amount);

        Transaction::create([
            'title' => 'Withdraw from wallet',
            'description' => 'Amount withdrawn from wallet',
            'status' => 'debit',
            'amount' => $request->amount,
            'user_id' => Auth::user()->id,
            'source' => 'wallet_withdraw'
        ]);

        return response()->json(["balance" => Auth::user()->balance]);
    }

    public function checkBalance(Request $request)
    {
        return response()->json(["balance" => Auth::user()->balance]);
    }

    public function transactions(Request $request)
    {
        return response()->json(Transaction::where('user_id', Auth::user()->id)->orderBy('created_at', 'desc')->paginate(config('constants.paginate_per_page')));
    }
}
