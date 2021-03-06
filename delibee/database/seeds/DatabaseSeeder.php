<?php

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
         $this->call(UsersSeeder::class);
         $this->call(RolesSeeder::class);
         $this->call(UsersRolesSeeder::class);
         $this->call(PaymentmethodsTableSeeder::class);
         $this->call(SettingsTableSeeder::class);
         $this->call(PlanTableSeeder::class);
    }
}
