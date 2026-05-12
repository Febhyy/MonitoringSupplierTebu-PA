<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Hasil;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class HasilController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $hasil = Hasil::with('transaksi')->get();
        
        return response()->json([
            'success' => true,
            'message' => 'Data hasil berhasil diambil',
            'data' => $hasil
        ], 200);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'id_transaksi'   => 'nullable|exists:transaksi,id_transaksi',
            'nilai_brix'     => 'nullable|numeric|min:0|max:100',
            'nilai_pol'      => 'required|numeric|min:0|max:100',
            'nilai_rendemen' => 'required|numeric|min:0|max:100',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        $data = $request->only(['id_transaksi', 'nilai_brix', 'nilai_pol', 'nilai_rendemen']);

        $data['interpretasi_kualitas'] = $this->generateInterpretasi(
            $request->nilai_rendemen,
            'Bersih'
        );

        $hasil = Hasil::create($data);
        $hasil->load('transaksi');

        return response()->json([
            'success' => true,
            'message' => 'Data hasil berhasil ditambahkan',
            'data' => $hasil
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $hasil = Hasil::with('transaksi')->find($id);

        if (!$hasil) {
            return response()->json([
                'success' => false,
                'message' => 'Data hasil tidak ditemukan'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Data hasil berhasil diambil',
            'data' => $hasil
        ], 200);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $hasil = Hasil::find($id);

        if (!$hasil) {
            return response()->json([
                'success' => false,
                'message' => 'Data hasil tidak ditemukan'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'id_transaksi'   => 'nullable|exists:transaksi,id_transaksi',
            'nilai_brix'     => 'nullable|numeric|min:0|max:100',
            'nilai_pol'      => 'sometimes|required|numeric|min:0|max:100',
            'nilai_rendemen' => 'sometimes|required|numeric|min:0|max:100',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        $data = $request->only(['id_transaksi', 'nilai_brix', 'nilai_pol', 'nilai_rendemen']);

        // Auto-generate interpretasi if nilai updated
        if ($request->has('nilai_pol') || $request->has('nilai_rendemen')) {
            $nilaiRendemen    = $request->nilai_rendemen ?? $hasil->nilai_rendemen;
            $hasilKlasifikasi = $hasil->hasil_akhir ?? 'Bersih';
            $data['interpretasi_kualitas'] = $this->generateInterpretasi($nilaiRendemen, $hasilKlasifikasi);
        }

        $hasil->update($data);
        $hasil->load('transaksi');

        return response()->json([
            'success' => true,
            'message' => 'Data hasil berhasil diupdate',
            'data' => $hasil
        ], 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $hasil = Hasil::find($id);

        if (!$hasil) {
            return response()->json([
                'success' => false,
                'message' => 'Data hasil tidak ditemukan'
            ], 404);
        }

        $hasil->delete();

        return response()->json([
            'success' => true,
            'message' => 'Data hasil berhasil dihapus'
        ], 200);
    }

    /**
     * Generate interpretasi kualitas berdasarkan nilai rendemen + hasil klasifikasi
     *
     * Tabel aturan:
     * Tinggi (>=85%) + Bersih  => Kualitas bagus
     * Tinggi         + Kotor   => Hasil bagus, tapi kotor
     * Sedang (75-84%)+ Bersih  => Cukup bagus
     * Sedang         + Kotor   => Hasil sedang + kotor
     * Rendah (<75%)  + Bersih  => Bersih tapi tidak manis
     * Rendah         + Kotor   => Kualitas buruk
     */
    private function generateInterpretasi($nilaiRendemen, $hasilKlasifikasi = 'Bersih')
    {
        $bersih = str_contains(strtolower($hasilKlasifikasi), 'bersih');

        if ($nilaiRendemen >= 85) {
            return $bersih ? 'Kualitas bagus' : 'Hasil bagus, tapi kotor';
        } elseif ($nilaiRendemen >= 75) {
            return $bersih ? 'Cukup bagus' : 'Hasil sedang + kotor';
        } else {
            return $bersih ? 'Bersih tapi tidak manis' : 'Kualitas buruk';
        }
    }
}
