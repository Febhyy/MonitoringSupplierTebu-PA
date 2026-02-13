<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Tebu extends Model
{
    use HasFactory;

    protected $table = 'tebu';
    protected $primaryKey = 'id';
    public $incrementing = true;
    protected $keyType = 'int';

    protected $fillable = [
        'berat_tebu',
        'no_kendaraan',
    ];

    /**
     * Relationship: Tebu has many Transaksi
     */
    public function transaksi()
    {
        return $this->hasMany(Transaksi::class, 'id_tebu', 'id');
    }
}
