<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Klasifikasi;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;

class KlasifikasiController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $klasifikasi = Klasifikasi::with(['transaksi', 'hasil'])->get();
        
        return response()->json([
            'success' => true,
            'message' => 'Data klasifikasi berhasil diambil',
            'data' => $klasifikasi
        ], 200);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'id_transaksi' => 'required|exists:transaksi,id_transaksi',
            'gambar' => 'required|image|mimes:jpeg,png,jpg|max:2048',
            'label' => 'required|string|max:255',
            'akurasi' => 'required|numeric|min:0|max:100',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        $data = $request->all();

        // Handle image upload
        if ($request->hasFile('gambar')) {
            $image = $request->file('gambar');
            $imageName = time() . '_' . $image->getClientOriginalName();
            $imagePath = $image->storeAs('klasifikasi', $imageName, 'public');
            $data['gambar'] = $imagePath;
        }

        $klasifikasi = Klasifikasi::create($data);
        $klasifikasi->load(['transaksi', 'hasil']);

        return response()->json([
            'success' => true,
            'message' => 'Klasifikasi berhasil ditambahkan',
            'data' => $klasifikasi
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $klasifikasi = Klasifikasi::with(['transaksi', 'hasil'])->find($id);

        if (!$klasifikasi) {
            return response()->json([
                'success' => false,
                'message' => 'Klasifikasi tidak ditemukan'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Data klasifikasi berhasil diambil',
            'data' => $klasifikasi
        ], 200);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $klasifikasi = Klasifikasi::find($id);

        if (!$klasifikasi) {
            return response()->json([
                'success' => false,
                'message' => 'Klasifikasi tidak ditemukan'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'id_transaksi' => 'sometimes|required|exists:transaksi,id_transaksi',
            'gambar' => 'sometimes|image|mimes:jpeg,png,jpg|max:2048',
            'label' => 'sometimes|required|string|max:255',
            'akurasi' => 'sometimes|required|numeric|min:0|max:100',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        $data = $request->all();

        // Handle image upload
        if ($request->hasFile('gambar')) {
            // Delete old image
            if ($klasifikasi->gambar && Storage::disk('public')->exists($klasifikasi->gambar)) {
                Storage::disk('public')->delete($klasifikasi->gambar);
            }

            $image = $request->file('gambar');
            $imageName = time() . '_' . $image->getClientOriginalName();
            $imagePath = $image->storeAs('klasifikasi', $imageName, 'public');
            $data['gambar'] = $imagePath;
        }

        $klasifikasi->update($data);
        $klasifikasi->load(['transaksi', 'hasil']);

        return response()->json([
            'success' => true,
            'message' => 'Klasifikasi berhasil diupdate',
            'data' => $klasifikasi
        ], 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $klasifikasi = Klasifikasi::find($id);

        if (!$klasifikasi) {
            return response()->json([
                'success' => false,
                'message' => 'Klasifikasi tidak ditemukan'
            ], 404);
        }

        // Delete image file
        if ($klasifikasi->gambar && Storage::disk('public')->exists($klasifikasi->gambar)) {
            Storage::disk('public')->delete($klasifikasi->gambar);
        }

        $klasifikasi->delete();

        return response()->json([
            'success' => true,
            'message' => 'Klasifikasi berhasil dihapus'
        ], 200);
    }
}
