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
        'id_klasifikasi',
        'nilai_pol',
        'nilai_rendemen',
        'interpretasi_kualitas',
    ];

    protected $casts = [
        'nilai_pol' => 'decimal:2',
        'nilai_rendemen' => 'decimal:2',
    ];

    /**
     * Relationship: Hasil belongs to Klasifikasi
     */
    public function klasifikasi()
    {
        return $this->belongsTo(Klasifikasi::class, 'id_klasifikasi', 'id_klasifikasi');
    }
}
