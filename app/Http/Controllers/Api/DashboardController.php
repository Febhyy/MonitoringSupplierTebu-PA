<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use Illuminate\Support\Facades\DB;
use App\Models\Transaksi;
use App\Models\Klasifikasi;

class DashboardController extends Controller
{
    /**
     * Get annual quality data based on actual classifications
     */
    // Untuk menampilkan data kualitas tahunan berdasarkan klasifikasi yang ada di database. 
    // Data ini akan dikelompokkan berdasarkan tahun atau tanggal masuk, tergantung pada filter yang diberikan. 
    // Selain itu, juga menghitung persentase bersih dan kotor untuk setiap periode 
    // serta ringkasan keseluruhan dari seluruh data.  
    public function getKualitasTahunan(Request $request)
    {
        $supplierId = $request->query('supplier_id');
        $tahun = $request->query('tahun');

        // Base query for transactions
        $query = Transaksi::query();

        if ($supplierId) {
            $query->where('id_supplier', $supplierId);
        }

        if ($tahun) {
            $query->whereYear('tanggal_masuk', $tahun);
        }

        // dapatkan semua transaksi yang sesuai dengan filter, termasuk relasi klasifikasi
        $transaksis = $query->with('klasifikasi')->get();

        // pengelompokan data berdasarkan tahun atau tanggal masuk
        $groupedData = $transaksis->groupBy(function ($transaksi) use ($tahun) {
            if ($tahun) {
                return date('Y-m-d', strtotime($transaksi->tanggal_masuk));
            }
            return date('Y', strtotime($transaksi->tanggal_masuk));
        });

        $result = [];

        // perulangan untuk menghitung persentase bersih dan kotor untuk setiap periode
        foreach ($groupedData as $period => $transaksisOfPeriod) {
            $totalBersihPercentage = 0;
            $totalKotorPercentage = 0;
            $validTransaksiCount = 0;
    
            // perulangan untuk setiap transaksi dalam periode ini
            foreach ($transaksisOfPeriod as $transaksi) {
                $klasifikasis = $transaksi->klasifikasi;
                $totalKlasifikasi = $klasifikasis->count();

                // jika ada klasifikasi untuk transaksi ini, hitung persentase bersih dan kotor
                // jika tidak ada klasifikasi, maka transaksi ini tidak dihitung dalam rata-rata
                if ($totalKlasifikasi > 0) {
                    $bersihCount = $klasifikasis->filter(function ($k) {
                        return stripos($k->label, 'bersih') !== false;
                    })->count();
                    
                    $kotorCount = $klasifikasis->filter(function ($k) {
                        return stripos($k->label, 'kotor') !== false;
                    })->count();

                    // kalkulasi persentase bersih dan kotor untuk transaksi ini
                    $bersihPercentage = ($bersihCount / $totalKlasifikasi) * 100;
                    $kotorPercentage = ($kotorCount / $totalKlasifikasi) * 100;

                    $totalBersihPercentage += $bersihPercentage;
                    $totalKotorPercentage += $kotorPercentage;
                    $validTransaksiCount++;
                }
            }

            // kalkulasi rata-rata persentase bersih dan kotor 
            // untuk periode ini jika ada transaksi yang valid  
            if ($validTransaksiCount > 0) {
                $avgBersih = $totalBersihPercentage / $validTransaksiCount;
                $avgKotor = $totalKotorPercentage / $validTransaksiCount;

                $result[] = [
                    'period' => (string)$period,
                    'bersih' => round($avgBersih, 2),
                    'kotor' => round($avgKotor, 2),
                ];
            } else {
                // period ini tidak memiliki transaksi dengan klasifikasi, 
                // sehingga persentase bersih dan kotor dianggap 0
                $result[] = [
                    'period' => (string)$period,
                    'bersih' => 0,
                    'kotor' => 0,
                ];
            }
        }

        // list data diurutkan berdasarkan periode (tahun atau tanggal masuk)
        usort($result, function($a, $b) {
            return $a['period'] <=> $b['period'];
        });

        // perhitungan ringkasan keseluruhan dari seluruh data, termasuk total supplier, 
        // total berat tebu, dan persentase bersih/kotor keseluruhan
        $totalSuppliersCount = \App\Models\Supplier::count();

        $totalBeratKg = Transaksi::join('tebu', 'transaksi.id_tebu', '=', 'tebu.id')
            ->sum('tebu.berat_tebu');
            
        $totalBeratTodayKg = Transaksi::whereDate('tanggal_masuk', date('Y-m-d'))
            ->join('tebu', 'transaksi.id_tebu', '=', 'tebu.id')
            ->sum('tebu.berat_tebu');

        // perhitungan persentase bersih dan kotor keseluruhan dari seluruh data klasifikasi
        $allKlasifikasis = Klasifikasi::whereHas('transaksi', function($q) use ($supplierId, $tahun) {
            if ($supplierId) $q->where('id_supplier', $supplierId);
            if ($tahun) $q->whereYear('tanggal_masuk', $tahun);
        });
        // untuk menghitung persentase bersih dan kotor keseluruhan, 
        //kita perlu menghitung total klasifikasi bersih dan kotor dari seluruh data yang ada.
        $totalKlasifikasiCount = $allKlasifikasis->count();
        $overallBersih = 0;
        $overallKotor = 0;

        if ($totalKlasifikasiCount > 0) {
            $bersihCount = $allKlasifikasis->clone()->where('label', 'like', '%bersih%')->count();
            $kotorCount = $allKlasifikasis->clone()->where('label', 'like', '%kotor%')->count();
            
            $overallBersih = ($bersihCount / $totalKlasifikasiCount) * 100;
            $overallKotor = ($kotorCount / $totalKlasifikasiCount) * 100;
        }

        // Fetch unique years from database
        $years = DB::table('transaksi')
            ->selectRaw('YEAR(tanggal_masuk) as year')
            ->distinct()
            ->whereNotNull('tanggal_masuk')
            ->orderBy('year', 'desc')
            ->pluck('year')
            ->toArray();

        if (empty($years)) {
            $years = [intval(date('Y'))];
        }

        return response()->json([
            'success' => true,
            'data' => $result,
            'years' => $years,
            'summary' => [
                'total_supplier' => $totalSuppliersCount,
                'total_berat_kg' => round($totalBeratKg, 2),
                'total_berat_today_kg' => round($totalBeratTodayKg, 2),
                'bersih_percentage' => round($overallBersih, 1),
                'kotor_percentage' => round($overallKotor, 1),
            ]
        ]);
    }
}
