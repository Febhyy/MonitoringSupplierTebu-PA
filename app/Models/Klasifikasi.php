<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Klasifikasi extends Model
{
    use HasFactory;

    protected $table = 'klasifikasi';
    protected $primaryKey = 'id_klasifikasi';
    public $incrementing = true;
    protected $keyType = 'int';

    protected $fillable = [
        'id_transaksi',
        'gambar',
        'label',
        'akurasi',
    ];

    protected $casts = [
        'akurasi' => 'decimal:2',
    ];

    /**
     * Relationship: Klasifikasi belongs to Transaksi
     */
    public function transaksi()
    {
        return $this->belongsTo(Transaksi::class, 'id_transaksi', 'id_transaksi');
    }

    /**
     * Relationship: Klasifikasi has many Hasil
     */
    public function hasil()
    {
        return $this->hasMany(Hasil::class, 'id_klasifikasi', 'id_klasifikasi');
    }
}
