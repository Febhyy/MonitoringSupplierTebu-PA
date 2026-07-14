<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Transaksi;
use App\Models\Tebu;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

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
     * Ambil semua transaksi milik supplier tertentu (beserta data tebu)
     */
    public function bySupplier($id)
    {
        $transaksi = Transaksi::with(['tebu'])
            ->where('id_supplier', $id)
            ->orderBy('tanggal_masuk', 'desc')
            ->orderBy('jam_masuk', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Data transaksi supplier berhasil diambil',
            'data' => $transaksi
        ], 200);
    }

    /**
     * Tambah pengiriman baru tanpa auth:
     * 1. Buat record tebu (berat_tebu, no_kendaraan)
     * 2. Buat record transaksi (id_supplier, id_tebu, tanggal_masuk, jam_masuk, catatan, status)
     */
    public function storePublic(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'id_supplier'   => 'required|exists:supplier,id_supplier',
            'berat_tebu'    => 'required|numeric|min:0',
            'no_kendaraan'  => 'required|string|max:255',
            'tanggal_masuk' => 'required|date',
            'jam_masuk'     => 'required',
            'catatan'       => 'nullable|string',
            'status'        => 'required|in:pending,selesai',
            'status_antrian'=> 'sometimes|in:menunggu,diproses,selesai',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors'  => $validator->errors()
            ], 422);
        }

        DB::beginTransaction();
        try {
            // 1. Simpan ke tabel tebu
            $tebu = Tebu::create([
                'berat_tebu'   => $request->berat_tebu,
                'no_kendaraan' => $request->no_kendaraan,
            ]);

            // 2. Simpan ke tabel transaksi
            $transaksi = Transaksi::create([
                'id_supplier'   => $request->id_supplier,
                'id_tebu'       => $tebu->id,
                'tanggal_masuk' => $request->tanggal_masuk,
                'jam_masuk'     => $request->jam_masuk,
                'catatan'       => $request->catatan,
                'status'        => $request->status,
                'status_antrian'=> $request->status_antrian ?? 'menunggu',
            ]);

            // 3. Buat record hasil kosong
            \App\Models\Hasil::create([
                'id_transaksi' => $transaksi->id_transaksi,
            ]);

            $transaksi->load('tebu');
            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Pengiriman berhasil ditambahkan',
                'data'    => $transaksi
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Gagal menyimpan data: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update status transaksi (pending / selesai)
     */
    public function updateStatus(Request $request, $id)
    {
        $transaksi = Transaksi::find($id);

        if (!$transaksi) {
            return response()->json([
                'success' => false,
                'message' => 'Transaksi tidak ditemukan'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'status' => 'required|in:pending,selesai',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors'  => $validator->errors()
            ], 422);
        }

        $transaksi->update(['status' => $request->status]);

        return response()->json([
            'success' => true,
            'message' => 'Status berhasil diupdate',
            'data'    => $transaksi
        ], 200);
    }

    /**
     * Update status antrian transaksi (menunggu / diproses / selesai)
     */
    public function updateStatusAntrian(Request $request, $id)
    {
        $transaksi = Transaksi::find($id);

        if (!$transaksi) {
            return response()->json([
                'success' => false,
                'message' => 'Transaksi tidak ditemukan'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'status_antrian' => 'required|in:menunggu,diproses,selesai',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors'  => $validator->errors()
            ], 422);
        }

        if ($request->status_antrian === 'menunggu') {
            $hasClassification = DB::table('klasifikasi')
                ->where('id_transaksi', $id)
                ->exists();
            if ($hasClassification) {
                return response()->json([
                    'success' => false,
                    'message' => 'Status antrian tidak dapat diubah kembali menjadi menunggu karena transaksi ini sudah memiliki hasil klasifikasi.'
                ], 400);
            }
        }

        if ($request->status_antrian === 'diproses') {
            $exists = Transaksi::where('status_antrian', 'diproses')
                               ->where('id_transaksi', '!=', $id)
                               ->exists();
            if ($exists) {
                return response()->json([
                    'success' => false,
                    'message' => 'Hanya boleh ada 1 antrian yang diproses. Silahkan selesaikan transaksi aktif lainnya terlebih dahulu.'
                ], 400);
            }
        }

        $transaksi->update(['status_antrian' => $request->status_antrian]);

        return response()->json([
            'success' => true,
            'message' => 'Status antrian berhasil diupdate',
            'data'    => $transaksi
        ], 200);
    }

    /**
     * Mengambil satu transaksi aktif yang status_antrian = 'diproses'
     */
    public function getDiproses()
    {
        $transaksi = Transaksi::where('status_antrian', 'diproses')->latest('updated_at')->first();

        if (!$transaksi) {
            return response()->json([
                'success' => false,
                'message' => 'Tidak ada transaksi yang sedang diproses'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Transaksi diproses berhasil diambil',
            'data'    => $transaksi
        ], 200);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'id_supplier'   => 'required|exists:supplier,id_supplier',
            'id_tebu'       => 'required|exists:tebu,id',
            'tanggal_masuk' => 'required|date',
            'jam_masuk'     => 'required',
            'catatan'       => 'nullable|string',
            'status'        => 'required|in:pending,selesai',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors'  => $validator->errors()
            ], 422);
        }

        $data = $request->all();
        if (!isset($data['status_antrian'])) {
            $data['status_antrian'] = 'menunggu';
        }
        $transaksi = Transaksi::create($data);

        // Buat record hasil kosong
        \App\Models\Hasil::create([
            'id_transaksi' => $transaksi->id_transaksi,
        ]);

        $transaksi->load(['supplier', 'tebu', 'hasil']);

        return response()->json([
            'success' => true,
            'message' => 'Transaksi berhasil ditambahkan',
            'data'    => $transaksi
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $transaksi = Transaksi::with(['supplier', 'tebu', 'klasifikasi', 'hasil'])->find($id);

        if (!$transaksi) {
            return response()->json([
                'success' => false,
                'message' => 'Transaksi tidak ditemukan'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Data transaksi berhasil diambil',
            'data'    => $transaksi
        ], 200);
    }

    /**
     * Update the specified resource in storage.
     * Juga update data tebu (berat_tebu, no_kendaraan) jika dikirim.
     */
    public function update(Request $request, $id)
    {
        $transaksi = Transaksi::with('tebu')->find($id);

        if (!$transaksi) {
            return response()->json([
                'success' => false,
                'message' => 'Transaksi tidak ditemukan'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'id_supplier'   => 'sometimes|required|exists:supplier,id_supplier',
            'id_tebu'       => 'sometimes|required|exists:tebu,id',
            'tanggal_masuk' => 'sometimes|required|date',
            'jam_masuk'     => 'sometimes|required',
            'catatan'       => 'nullable|string',
            'status'        => 'sometimes|required|in:pending,selesai',
            'status_antrian'=> 'sometimes|in:menunggu,diproses,selesai',
            'berat_tebu'    => 'sometimes|numeric|min:0',
            'no_kendaraan'  => 'sometimes|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors'  => $validator->errors()
            ], 422);
        }

        if ($request->has('status_antrian')) {
            if ($request->status_antrian === 'menunggu') {
                $hasClassification = DB::table('klasifikasi')
                    ->where('id_transaksi', $id)
                    ->exists();
                if ($hasClassification) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Status antrian tidak dapat diubah kembali menjadi menunggu karena transaksi ini sudah memiliki hasil klasifikasi.'
                    ], 400);
                }
            }

            if ($request->status_antrian === 'diproses') {
                $exists = Transaksi::where('status_antrian', 'diproses')
                                   ->where('id_transaksi', '!=', $id)
                                   ->exists();
                if ($exists) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Hanya boleh ada 1 antrian yang diproses. Silahkan selesaikan transaksi aktif lainnya terlebih dahulu.'
                    ], 400);
                }
            }
        }

        // Update data tebu jika ada
        if ($transaksi->tebu && ($request->has('berat_tebu') || $request->has('no_kendaraan'))) {
            $transaksi->tebu->update(array_filter([
                'berat_tebu'   => $request->berat_tebu,
                'no_kendaraan' => $request->no_kendaraan,
            ], fn($v) => !is_null($v)));
        }

        $transaksi->update($request->only([
            'id_supplier', 'id_tebu', 'tanggal_masuk', 'jam_masuk', 'catatan', 'status', 'status_antrian'
        ]));
        $transaksi->load(['supplier', 'tebu']);

        return response()->json([
            'success' => true,
            'message' => 'Transaksi berhasil diupdate',
            'data'    => $transaksi
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

        try {
            \DB::beginTransaction();

            $idTebu = $transaksi->id_tebu;

            // Hapus transaksi (klasifikasi ikut cascade dari DB)
            $transaksi->delete();

            // Hapus data tebu yang terkait (sudah tidak dipakai)
            if ($idTebu) {
                \App\Models\Tebu::where('id', $idTebu)->delete();
            }

            \DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Transaksi berhasil dihapus'
            ], 200);

        } catch (\Exception $e) {
            \DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Gagal menghapus: ' . $e->getMessage()
            ], 500);
        }
    }
}
