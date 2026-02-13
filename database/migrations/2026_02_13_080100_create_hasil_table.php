<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('hasil', function (Blueprint $table) {
            $table->id('id_hasil');
            $table->unsignedBigInteger('id_klasifikasi');
            $table->decimal('nilai_pol', 5, 2);
            $table->decimal('nilai_rendemen', 5, 2);
            $table->string('interpretasi_kualitas');
            $table->timestamps();

            $table->foreign('id_klasifikasi')->references('id_klasifikasi')->on('klasifikasi')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('hasil');
    }
};
