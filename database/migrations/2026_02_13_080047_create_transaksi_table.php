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
        Schema::create('transaksi', function (Blueprint $table) {
            $table->id('id_transaksi');
            $table->unsignedBigInteger('id_supplier');
            $table->unsignedBigInteger('id_tebu');
            $table->date('tanggal_masuk');
            $table->time('jam_masuk');
            $table->text('catatan')->nullable();
            $table->string('status')->default('pending');
            $table->timestamps();

            $table->foreign('id_supplier')->references('id_supplier')->on('supplier')->onDelete('cascade');
            $table->foreign('id_tebu')->references('id')->on('tebu')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transaksi');
    }
};
