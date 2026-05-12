<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Hasil extends Model
{
    use HasFactory;

    protected $table = 'hasil';
    protected $primaryKey = 'id_hasil';
    public $incrementing = true;
    protected $keyType = 'int';

    protected $fillable = [
        'id_transaksi',
        'nilai_brix',
        'nilai_pol',
        'nilai_rendemen',
        'hasil_akhir',
        'interpretasi_kualitas',
    ];

    protected $casts = [
        'nilai_brix'     => 'decimal:2',
        'nilai_pol'      => 'decimal:2',
        'nilai_rendemen' => 'decimal:2',
    ];

    /**
     * Relationship: Hasil belongs to Transaksi
     */
    public function transaksi()
    {
        return $this->belongsTo(Transaksi::class, 'id_transaksi', 'id_transaksi');
    }
}
