# Petunjuk Pengujian Otomatis Selenium (Blackbox Testing)

Folder ini berisi script pengujian otomatis menggunakan **Python + Selenium WebDriver** untuk melakukan pengujian fungsionalitas (blackbox testing) sesuai dengan tabel pengujian Anda.

---

## 🛠️ Persiapan Lingkungan (Setup)

### 1. Install Python
Pastikan Python sudah terinstal di komputer Anda. 
- Download di: [python.org](https://www.python.org/downloads/)
- Saat menginstal di Windows, pastikan mencentang opsi **"Add Python to PATH"**.

### 2. Install Library Selenium
Buka Command Prompt (cmd) atau terminal di VS Code, lalu jalankan perintah berikut:
```bash
pip install selenium
```
> **Catatan:** Selenium versi terbaru (v4.6.0+) memiliki fitur **Selenium Manager** terintegrasi, sehingga Anda **tidak perlu** mengunduh file `chromedriver.exe` secara manual. Driver Chrome akan otomatis dikelola secara otomatis di latar belakang.

### 3. Jalankan Server Aplikasi Anda
Pastikan aplikasi Laravel dan frontend React Anda sudah berjalan di port default (`http://127.0.0.1:8000`).
1. Jalankan server Laravel:
   ```bash
   php artisan serve
   ```
2. Jalankan server asset Vite (pada terminal terpisah):
   ```bash
   npm run dev
   ```

---

## 🚀 Menjalankan Pengujian

Jalankan perintah berikut di terminal/Command Prompt Anda untuk memulai proses pengujian otomatis:

```bash
python tests/Selenium/test_sugar_monitoring.py
```

Setelah dijalankan, browser Chrome akan terbuka secara otomatis dan mensimulasikan langkah-langkah pengujian berikut:

1. **Akses Dashboard**: Membuka halaman utama dashboard secara langsung.
2. **Skenario 1 (Filter Dashboard)**: Menguji interaksi dropdown untuk memfilter visualisasi supplier.
3. **Skenario 2 (Tambah Supplier)**: Mengisi form modal pendaftaran supplier dan menyimpannya.
4. **Skenario 3 (Ubah Supplier)**: Mengubah nama supplier yang baru saja dibuat.
5. **Skenario 5 (Riwayat Pemasokan)**: Mengklik card supplier untuk melihat halaman riwayat pemasokan.
6. **Skenario 6 (Tambah Pemasokan)**: Mengisi formulir pengiriman baru (berat tebu, nomor kendaraan, status antrian, status lab, dll).
7. **Skenario 7 (Ubah Pemasokan)**: Mengubah data pengiriman yang telah diinput sebelumnya.
8. **Skenario 9 (Lihat Hasil NIR & Klasifikasi)**: Masuk ke halaman detail pengiriman untuk melihat foto klasifikasi serta modul NIR.
9. **Skenario 10 (Input Nilai NIR)**: Memasukkan nilai brix, pol, dan rendemen, lalu melakukan update.
10. **Skenario 8 (Hapus Pemasokan)**: Menghapus data pengiriman uji coba sebagai pembersihan (cleanup) data.
11. **Skenario 4 (Hapus Supplier)**: Menghapus data supplier uji coba sebagai pembersihan (cleanup) data akhir.

---

## 📊 Hasil Pengujian
Jika seluruh skenario berhasil dilewati tanpa error, terminal akan menampilkan:
```text
=== MEMULAI PENGUJIAN BLACKBOX DENGAN SELENIUM ===
Step 0: Membuka dashboard...

Skenario 1: Filter Dashboard...
✓ Berhasil memilih supplier dengan ID: ...

Skenario 2: Menambahkan data supplier...
✓ Berhasil menambahkan data supplier: Pak Febhy Selenium Test

Skenario 3: Mengubah data supplier...
✓ Berhasil mengubah data supplier menjadi: Pak Febhy Selenium Test (Edited)

Skenario 5: Melihat Riwayat pemasokan supplier...
✓ Berhasil menampilkan Riwayat pemasokan supplier

Skenario 6: Menambahkan data pemasokan...
✓ Berhasil menambahkan data pemasokan

Skenario 7: Mengubah data pemasokan...
✓ Berhasil mengubah data pemasokan

Skenario 9: Melihat hasil klasifikasi dan hasil NIR...
✓ Berhasil menampilkan hasil klasifikasi dan hasil NIR

Skenario 10: Menginputkan nilai NIR...
✓ Berhasil menginputkan nilai NIR

Skenario 8: Menghapus data pemasokan...
✓ Berhasil menghapus data pemasokan

Skenario 4: Menghapus data supplier...
✓ Berhasil menghapus data supplier

=== SEMUA SKENARIO PENGUJIAN BERHASIL DIJALANKAN! ===
----------------------------------------------------------------------
Ran 1 test in 18.234s

OK
```
