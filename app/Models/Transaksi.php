<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Transaksi extends Model
{
    use HasFactory;

    protected $table = 'transaksi';
    protected $primaryKey = 'id_transaksi';
    public $incrementing = true;
    protected $keyType = 'int';

    protected $fillable = [
        'id_supplier',
        'id_tebu',
        'tanggal_masuk',
        'jam_masuk',
        'catatan',
        'status',
    ];

    protected $casts = [
        'tanggal_masuk' => 'date',
    ];

    /**
     * Relationship: Transaksi belongs to Supplier
     */
    public function supplier()
    {
        return $this->belongsTo(Supplier::class, 'id_supplier', 'id_supplier');
    }

    /**
     * Relationship: Transaksi belongs to Tebu
     */
    public function tebu()
    {
        return $this->belongsTo(Tebu::class, 'id_tebu', 'id');
    }

    /**
     * Relationship: Transaksi has many Klasifikasi
     */
    public function klasifikasi()
    {
        return $this->hasMany(Klasifikasi::class, 'id_transaksi', 'id_transaksi');
    }
}
