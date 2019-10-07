<?php

namespace App\Http\Controllers\Api\Auth;

use App\Events\Auth\Registered;
use App\Http\Controllers\Controller;
use App\Http\Requests\ApiRegisterRequest;
use App\Models\Auth\User\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\Validator;

class RegisterController extends  Controller
{
    /*
    |--------------------------------------------------------------------------
    | Register Controller
    |--------------------------------------------------------------------------
    |
    | This controller handles user registration via REST API
    |
    */

    /**
     * Handle a registration request for the application.
     *
     * @param  ApiRegisterRequest  $request
     * @return \Illuminate\Http\Response
     */
    public function register(ApiRegisterRequest $request)
    {
        $user = $this->create($request->all());

        // attach role
        $role = \App\Models\Auth\Role\Role::where('name', $request->role)->first();
        $user->roles()->attach($role);

        event(new Registered($user, $request->role));

        $token = $user->createToken('Default')->accessToken;

        return response()->json(["token" => $token, "user" => User::find($user->id)]);
    }

    /**
     * Verifies user's mobile
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function verifyMobile(Request $request)
    {
        Validator::make($request->all(), [
            'mobile_number' => 'required|string|exists:users,mobile_number'
        ])->validate();

        $user = User::where('mobile_number', $request->mobile_number)->first();
        $user->mobile_verified = 1;
        $user->save();

        $token = $user->createToken('Default')->accessToken;

        return response()->json(["token" => $token, "user" => $user]);
    }

    /**
     * Send a reset link to the given user.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\RedirectResponse|\Illuminate\Http\JsonResponse
     */
    public function sendResetLinkEmail(Request $request)
    {
        Validator::make($request->all(), [
            'email' => 'required|email'
        ])->validate();

        // We will send the password reset link to this user. Once we have attempted
        // to send the link, we will examine the response then see the message we
        // need to show to the user. Finally, we'll send out a proper response.
        $response = Password::broker()->sendResetLink(
            $request->only('email')
        );

        return $response == Password::RESET_LINK_SENT
            ? response()->json(["message" => "Email Sent"])
            : response()->json(["message" => "Email Not Sent"], 400);
    }

    /**
     * Create a new user instance after a valid registration.
     *
     * @param  array  $data
     * @return \App\Models\Auth\User\User
     */
    protected function create(array $data)
    {
        return User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => bcrypt($data['password']),
            'mobile_number' => $data['mobile_number'],
        ]);
    }

    private function generateOtpCode($user) {
        while(1) {
            $otpCode = rand(1001,9999);
            if(!User::where('otp_code', $otpCode)->exists()) {
                break;
            }
        }
        return $otpCode;
    }
}
