<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateAddressesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('addresses', function (Blueprint $table) {
            $table->increments('id');
            $table->string('title');
            $table->string('area');
            $table->string('address');
            $table->decimal('longitude', 15, 7)->default(0.0);
            $table->decimal('latitude', 15, 7)->default(0.0);
            $table->integer('user_id')->unsigned();
            $table->timestamps();

            $table->foreign('user_id', 'foreign_address_user')
                ->references('id')
                ->on('users')
                ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('addresses');
    }
}
