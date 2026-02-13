<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Tebu;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class TebuController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $tebu = Tebu::all();
        
        return response()->json([
            'success' => true,
            'message' => 'Data tebu berhasil diambil',
            'data' => $tebu
        ], 200);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'berat_tebu' => 'required|numeric|min:0',
            'no_kendaraan' => 'required|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        $tebu = Tebu::create($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Data tebu berhasil ditambahkan',
            'data' => $tebu
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $tebu = Tebu::find($id);

        if (!$tebu) {
            return response()->json([
                'success' => false,
                'message' => 'Data tebu tidak ditemukan'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Data tebu berhasil diambil',
            'data' => $tebu
        ], 200);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $tebu = Tebu::find($id);

        if (!$tebu) {
            return response()->json([
                'success' => false,
                'message' => 'Data tebu tidak ditemukan'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'berat_tebu' => 'sometimes|required|numeric|min:0',
            'no_kendaraan' => 'sometimes|required|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        $tebu->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Data tebu berhasil diupdate',
            'data' => $tebu
        ], 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $tebu = Tebu::find($id);

        if (!$tebu) {
            return response()->json([
                'success' => false,
                'message' => 'Data tebu tidak ditemukan'
            ], 404);
        }

        $tebu->delete();

        return response()->json([
            'success' => true,
            'message' => 'Data tebu berhasil dihapus'
        ], 200);
    }
}
