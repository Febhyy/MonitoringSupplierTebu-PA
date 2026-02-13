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
        $hasil = Hasil::with('klasifikasi')->get();
        
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
            'id_klasifikasi' => 'required|exists:klasifikasi,id_klasifikasi',
            'nilai_pol' => 'required|numeric|min:0|max:100',
            'nilai_rendemen' => 'required|numeric|min:0|max:100',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        $data = $request->all();
        
        // Auto-generate interpretasi kualitas based on nilai pol and rendemen
        $data['interpretasi_kualitas'] = $this->generateInterpretasi(
            $request->nilai_pol, 
            $request->nilai_rendemen
        );

        $hasil = Hasil::create($data);
        $hasil->load('klasifikasi');

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
        $hasil = Hasil::with('klasifikasi')->find($id);

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
            'id_klasifikasi' => 'sometimes|required|exists:klasifikasi,id_klasifikasi',
            'nilai_pol' => 'sometimes|required|numeric|min:0|max:100',
            'nilai_rendemen' => 'sometimes|required|numeric|min:0|max:100',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        $data = $request->all();

        // Auto-generate interpretasi if nilai updated
        if ($request->has('nilai_pol') || $request->has('nilai_rendemen')) {
            $nilaiPol = $request->nilai_pol ?? $hasil->nilai_pol;
            $nilaiRendemen = $request->nilai_rendemen ?? $hasil->nilai_rendemen;
            $data['interpretasi_kualitas'] = $this->generateInterpretasi($nilaiPol, $nilaiRendemen);
        }

        $hasil->update($data);
        $hasil->load('klasifikasi');

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
     * Generate interpretasi kualitas based on nilai pol and rendemen
     */
    private function generateInterpretasi($nilaiPol, $nilaiRendemen)
    {
        $avgNilai = ($nilaiPol + $nilaiRendemen) / 2;

        if ($avgNilai >= 80) {
            return 'Sangat Baik';
        } elseif ($avgNilai >= 60) {
            return 'Baik';
        } elseif ($avgNilai >= 40) {
            return 'Cukup';
        } else {
            return 'Kurang';
        }
    }
}
