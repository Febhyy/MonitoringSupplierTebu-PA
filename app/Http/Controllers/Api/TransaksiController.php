<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Transaksi;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class TransaksiController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $transaksi = Transaksi::with(['supplier', 'tebu', 'klasifikasi'])->get();
        
        return response()->json([
            'success' => true,
            'message' => 'Data transaksi berhasil diambil',
            'data' => $transaksi
        ], 200);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'id_supplier' => 'required|exists:supplier,id_supplier',
            'id_tebu' => 'required|exists:tebu,id',
            'tanggal_masuk' => 'required|date',
            'jam_masuk' => 'required',
            'catatan' => 'nullable|string',
            'status' => 'required|in:menunggu,diproses,selesai',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        $transaksi = Transaksi::create($request->all());
        $transaksi->load(['supplier', 'tebu']);

        return response()->json([
            'success' => true,
            'message' => 'Transaksi berhasil ditambahkan',
            'data' => $transaksi
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $transaksi = Transaksi::with(['supplier', 'tebu', 'klasifikasi'])->find($id);

        if (!$transaksi) {
            return response()->json([
                'success' => false,
                'message' => 'Transaksi tidak ditemukan'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Data transaksi berhasil diambil',
            'data' => $transaksi
        ], 200);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $transaksi = Transaksi::find($id);

        if (!$transaksi) {
            return response()->json([
                'success' => false,
                'message' => 'Transaksi tidak ditemukan'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'id_supplier' => 'sometimes|required|exists:supplier,id_supplier',
            'id_tebu' => 'sometimes|required|exists:tebu,id',
            'tanggal_masuk' => 'sometimes|required|date',
            'jam_masuk' => 'sometimes|required',
            'catatan' => 'nullable|string',
            'status' => 'sometimes|required|in:menunggu,diproses,selesai',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        $transaksi->update($request->all());
        $transaksi->load(['supplier', 'tebu']);

        return response()->json([
            'success' => true,
            'message' => 'Transaksi berhasil diupdate',
            'data' => $transaksi
        ], 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $transaksi = Transaksi::find($id);

        if (!$transaksi) {
            return response()->json([
                'success' => false,
                'message' => 'Transaksi tidak ditemukan'
            ], 404);
        }

        $transaksi->delete();

        return response()->json([
            'success' => true,
            'message' => 'Transaksi berhasil dihapus'
        ], 200);
    }
}
