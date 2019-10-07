<?php

namespace App\Http\Controllers\Api\Admin\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class LoginController extends Controller
{
    /**
     * Login admin user
     *
     * @param Request $request
     * @return \Illuminate\Http\Response
     */
    public function authenticate(Request $request)
    {
        $request->validate([
            'email' => 'required|string',
            'password' => 'required|string',
        ]);

        if (Auth::attempt(['email' => $request->email, 'password' => $request->password])) {
            // only admin or store can login
            if(!Auth::user()->hasRole('administrator') && !Auth::user()->hasRole('owner')) {
                return response()->json(["message" => "Permission denied. No suitable role found"], 400);
            }
            $user = Auth::user();
            $scope = $user->hasRole('administrator') ? ['manage-as-admin'] : [];
            $storeId = $user->hasRole('owner') ? $user->store->id: null;
            $token = $user->createToken('Default', $scope)->accessToken;
            return response()->json([
                "token" => $token, "user" => $user,
                "store_id" => $storeId]);
        }
        return response()->json(["message" => "Invalid Login"], 400);
    }
}
