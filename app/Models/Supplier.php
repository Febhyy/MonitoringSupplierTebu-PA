<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Supplier extends Model
{
    use HasFactory;

    public $timestamps = true;
    public $incrementing = true;
    protected $table = 'supplier';
    // protected $keyType = 'int';

    protected $primaryKey = 'id_supplier';


    protected $fillable = [
        'nama_supplier',
        'asal_kebun',
    ];

    /**
     * Relationship: Supplier has many Transaksi
     */
    public function transaksi()
    {
        return $this->hasMany(Transaksi::class, 'id_supplier', 'id_supplier');
    }
}
