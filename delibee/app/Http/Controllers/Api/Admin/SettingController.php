<?php

namespace App\Http\Controllers\Api\Admin;

use App\Models\Setting;
use Brotzka\DotenvEditor\Exceptions\DotEnvException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Brotzka\DotenvEditor\DotenvEditor as Env;

class SettingController extends Controller
{
    public function index(Request $request)
    {
        return response()->json(Setting::all());
    }

    public function update(Request $request)
    {
        $inputs = $request->all();

        foreach ($inputs as $key => $value) {
            try {
                $setting = Setting::where('key', $key)->firstOrFail();
                $setting->value = $value;
                $setting->save();
            } catch (ModelNotFoundException $ex) {
                //
            }
        }

        return response()->json([]);
    }

    public function envList(Request $request)
    {
        $env = new Env();
        return response()->json($env->getContent());
    }

    /**
     * Update env variables.
     *
     * @param Request $request
     * @return mixed
     */
    public function updateEnv(Request $request)
    {
        $env = new Env();
        try {
            $env->changeEnv([
                'MAIL_DRIVER'   => $request->mail_driver,
                'MAIL_HOST'   => $request->mail_host,
                'MAIL_PORT'   => $request->mail_port,
                'MAIL_USERNAME'   => $request->mail_username,
                'MAIL_PASSWORD'   => $request->mail_password,
                'MAIL_FROM_ADDRESS'   => $request->mail_from_address,
                'MAIL_FROM_NAME'   => $request->mail_from_name,
                'MAILGUN_DOMAIN'   => $request->mailgun_domain,
                'MAILGUN_SECRET'   => $request->mailgun_secret,
                'FCM_SERVER_KEY'   => $request->fcm_server_key,
                'FCM_SENDER_ID'   => $request->fcm_sender_id,
                'ONESIGNAL_APP_ID'   => $request->onesignal_app_id,
                'ONESIGNAL_REST_API'   => $request->onesignal_rest_api,
            ]);
        } catch (DotEnvException $e) {
        }

        return response()->json([]);
    }

}
