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
            $table->unsignedBigInteger('id_transaksi');
            $table->decimal('nilai_pol', 5, 2)->nullable();
            $table->decimal('nilai_rendemen', 5, 2)->nullable();
            $table->string('hasil_akhir')->nullable();
            $table->string('interpretasi_kualitas')->nullable();
            $table->timestamps();

            $table->foreign('id_transaksi')->references('id_transaksi')->on('transaksi')->onDelete('cascade');
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
