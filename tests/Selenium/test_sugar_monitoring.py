import unittest
import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import Select

class TestSugarMonitoring(unittest.TestCase):
    BASE_URL = "http://127.0.0.1:8000"

    def setUp(self):
        # Menggunakan Chrome Driver. Selenium 4 ke atas otomatis mendownload driver yang cocok.
        options = webdriver.ChromeOptions()
        # Aktifkan mode headless jika tidak ingin membuka jendela browser secara fisik:
        # options.add_argument("--headless")
        options.add_argument("--start-maximized")
        self.driver = webdriver.Chrome(options=options)
        self.wait = WebDriverWait(self.driver, 10)

    def tearDown(self):
        self.driver.quit()

    def _accept_alert_if_present(self, driver, timeout=2):
        try:
            alert = WebDriverWait(driver, timeout).until(EC.alert_is_present())
            alert.accept()
            return True
        except Exception:
            return False

    def _set_input_value(self, element, value):
        self.driver.execute_script(
            """
            arguments[0].focus();
            arguments[0].value = arguments[1];
            arguments[0].dispatchEvent(new Event('input', { bubbles: true }));
            arguments[0].dispatchEvent(new Event('change', { bubbles: true }));
            """,
            element,
            str(value),
        )
        self.wait.until(lambda _: element.get_attribute("value") == str(value))

    def test_complete_blackbox_scenarios(self):
        driver = self.driver
        print("\n=== MEMULAI PENGUJIAN BLACKBOX DENGAN SELENIUM ===")

        # =====================================================================
        # MASUK KE HALAMAN DASHBOARD
        # =====================================================================
        print("\nStep 0: Membuka dashboard...")
        driver.get(f"{self.BASE_URL}/dashboard")

        # =====================================================================
        # SKENARIO 1: FILTER DASHBOARD
        # =====================================================================
        print("\nSkenario 1: Filter Dashboard...")
        # Klik ikon dropdown list untuk melihat performa supplier
        dropdown_element = self.wait.until(
            EC.presence_of_element_located((By.XPATH, "//select"))
        )
        select_supplier = Select(dropdown_element)
        
        # Pilih opsi pertama selain default (jika ada supplier lain)
        options = select_supplier.options
        if len(options) > 1:
            select_supplier.select_by_index(1)
            selected_val = dropdown_element.get_attribute("value")
            print(f"✓ Berhasil memilih supplier dengan ID: {selected_val}")
        else:
            print("- Belum ada data supplier untuk difilter, lanjut ke penambahan supplier")
        
        # Kembalikan ke Semua Supplier
        select_supplier.select_by_value("")
        time.sleep(1)

        # =====================================================================
        # SKENARIO 2: MENAMBAHKAN DATA SUPPLIER
        # =====================================================================
        print("\nSkenario 2: Menambahkan data supplier...")
        # Klik tombol Add Supplier
        add_supplier_btn = self.wait.until(
            EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Add Supplier')]"))
        )
        add_supplier_btn.click()

        # Mengisi nama pemilik
        nama_pemilik_input = self.wait.until(
            EC.presence_of_element_located((By.XPATH, "//input[@placeholder='Masukkan nama lengkap pemilik']"))
        )
        test_supplier_name = "Pak Febhy Selenium Test"
        nama_pemilik_input.send_keys(test_supplier_name)

        # Mengisi asal kebun
        asal_kebun_input = driver.find_element(By.XPATH, "//input[@placeholder='Contoh : Kebun Sukamaju, Lampung Tengah']")
        asal_kebun_input.send_keys("Kebun Percobaan Selenium, Riau")

        # Klik save
        save_btn = driver.find_element(By.XPATH, "//button[text()='Save']")
        save_btn.click()

        # Tunggu modal tertutup dan data ter-update
        self.wait.until(
            EC.presence_of_element_located((By.XPATH, f"//h4[contains(text(), '{test_supplier_name}')]"))
        )
        print(f"✓ Berhasil menambahkan data supplier: {test_supplier_name}")

        # =====================================================================
        # SKENARIO 3: MENGUBAH DATA SUPPLIER
        # =====================================================================
        print("\nSkenario 3: Mengubah data supplier...")
        # Tunggu sampai nama supplier muncul
        supplier_card = self.wait.until(
            EC.presence_of_element_located(
                (By.XPATH, f"//*[contains(text(), '{test_supplier_name}')]")
            )
        )

        # Cari tombol Edit terdekat dari card supplier
        edit_button = self.wait.until(
            EC.element_to_be_clickable(
                (
                    By.XPATH,
                    f"//div[contains(@class,'rounded-xl') and .//h4[contains(text(), '{test_supplier_name}')]]//button[@title='Edit Supplier']"
                )
            )
        )

        edit_button.click()

        # Lakukan perubahan nama
        nama_pemilik_input = self.wait.until(
            EC.presence_of_element_located((By.XPATH, "//input[@placeholder='Masukkan nama lengkap pemilik']"))
        )
        nama_pemilik_input.clear()
        edited_supplier_name = "Pak Febhy Selenium Test (Edited)"
        nama_pemilik_input.send_keys(edited_supplier_name)

        # Klik Save
        save_btn = driver.find_element(By.XPATH, "//button[text()='Save']")
        save_btn.click()

        # Verifikasi nama berubah di UI
        self.wait.until(
            EC.presence_of_element_located((By.XPATH, f"//h4[contains(text(), '{edited_supplier_name}')]"))
        )
        print(f"✓ Berhasil mengubah data supplier menjadi: {edited_supplier_name}")

        # =====================================================================
        # SKENARIO 5: MELIHAT RIWAYAT PEMASOKAN SUPPLIER
        # =====================================================================
        print("\nSkenario 5: Melihat Riwayat pemasokan supplier...")
        # Klik nama supplier pada card supplier
        supplier_name_link = self.wait.until(
            EC.element_to_be_clickable((By.XPATH, f"//h4[contains(text(), '{edited_supplier_name}')]"))
        )
        supplier_name_link.click()

        # Verifikasi navigasi ke halaman pemasokan
        self.wait.until(EC.url_contains("/pemasokan/"))
        pemasokan_action_btn = self.wait.until(
            EC.presence_of_element_located((By.XPATH, "//button[contains(., 'Add Pengiriman')]"))
        )
        self.assertTrue(pemasokan_action_btn.is_displayed())
        print("✓ Berhasil menampilkan Riwayat pengiriman supplier")

        # =====================================================================
        # SKENARIO 6: MENAMBAHKAN DATA PENGIRIMAN
        # =====================================================================
        print("\nSkenario 6: Menambahkan data pengiriman...")
        # Klik add pengiriman
        add_pengiriman_btn = self.wait.until(
            EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Add Pengiriman')]"))
        )
        add_pengiriman_btn.click()

        # Mengisi berat tebu
        berat_input = self.wait.until(
            EC.presence_of_element_located((By.XPATH, "//input[@placeholder='2.500']"))
        )
        berat_input.send_keys("3200")

        # Mengisi no.kendaraan
        no_kendaraan_input = driver.find_element(By.XPATH, "//input[@placeholder='Contoh : BM 6789 PA']")
        no_kendaraan_input.send_keys("BM 1234 XY")

        # Catatan tambahan
        catatan_input = driver.find_element(By.XPATH, "//textarea[contains(@placeholder, 'Catatan khusus')]")
        catatan_input.send_keys("Sampel pengujian otomatis Selenium")

        # Memilih status antrian
        status_antrian_select = driver.find_element(By.XPATH, "//label[contains(text(), 'Status Antrian')]/following-sibling::select")
        Select(status_antrian_select).select_by_value("menunggu")

        # Memilih status lab
        status_lab_select = driver.find_element(By.XPATH, "//label[contains(text(), 'Status Lab')]/following-sibling::select")
        Select(status_lab_select).select_by_value("pending")

        # Klik save
        save_pengiriman_btn = driver.find_element(By.XPATH, "//button[text()='Save']")
        save_pengiriman_btn.click()

        # Tunggu sampai baris pengiriman baru muncul di tabel
        self.wait.until(
            EC.presence_of_element_located((By.XPATH, "//td[contains(., 'BM 1234 XY')]"))
        )
        print("✓ Berhasil menambahkan data pengiriman")

        # =====================================================================
        # SKENARIO 7: MENGUBAH DATA PENGIRIMAN
        # =====================================================================
        print("\nSkenario 7: Mengubah data pengiriman...")
        # Klik tombol edit pada baris pengiriman yang ingin diubah (BM 1234 XY)
        row_xpath = "//tr[contains(., 'BM 1234 XY')]"
        edit_shipment_btn = self.wait.until(
            EC.element_to_be_clickable((By.XPATH, f"{row_xpath}//button[@title='Edit']"))
        )
        edit_shipment_btn.click()

        # Melakukan perubahan pada berat tebu
        berat_input = self.wait.until(
            EC.presence_of_element_located((By.XPATH, "//input[@placeholder='2.500']"))
        )
        berat_input.clear()
        berat_input.send_keys("3800")  # Diubah dari 3200 ke 3800

        # Ubah nomor kendaraan
        no_kendaraan_input = driver.find_element(By.XPATH, "//input[@placeholder='Contoh : BM 6789 PA']")
        no_kendaraan_input.clear()
        no_kendaraan_input.send_keys("BM 5555 XY")

        # Klik Save
        save_pengiriman_btn = driver.find_element(By.XPATH, "//button[text()='Save']")
        save_pengiriman_btn.click()

        # Tunggu data terupdate di tabel
        self.wait.until(
            EC.presence_of_element_located((By.XPATH, "//td[contains(., 'BM 5555 XY')]"))
        )
        print("✓ Berhasil mengubah data pengiriman")

        # =====================================================================
        # SKENARIO 9 (4 di tabel): MELIHAT HASIL KLASIFIKASI DAN HASIL NIR
        # =====================================================================
        print("\nSkenario 9: Melihat hasil klasifikasi dan hasil NIR...")
        # Klik pada salah satu informasi pengiriman (BM 5555 XY) melalui tombol 'Lihat Detail'
        row_xpath_new = "//tr[contains(., 'BM 5555 XY')]"
        detail_btn = self.wait.until(
            EC.element_to_be_clickable((By.XPATH, f"{row_xpath_new}//button[@title='Lihat Detail']"))
        )
        detail_btn.click()

        # Verifikasi navigasi ke detail pengiriman
        self.wait.until(EC.url_contains("/pengiriman/"))
        
        # Verifikasi bagian Klasifikasi dan NIR tampil
        klasifikasi_section = self.wait.until(
            EC.presence_of_element_located((By.XPATH, "//h3[contains(text(), 'Hasil Klasifikasi')]"))
        )
        nir_section = driver.find_element(By.XPATH, "//h3[contains(text(), 'Input Data NIR')]")
        
        self.assertTrue(klasifikasi_section.is_displayed())
        self.assertTrue(nir_section.is_displayed())
        print("✓ Berhasil menampilkan hasil klasifikasi dan hasil NIR")

        # =====================================================================
        # SKENARIO 10 (5 di tabel): MENGINPUTKAN NILAI NIR
        # =====================================================================
        print("\nSkenario 10: Menginputkan nilai NIR...")
        # Isi Nilai NIR (Brix, Pol, Rendemen)
        briks_input = self.wait.until(
            EC.presence_of_element_located((By.XPATH, "//label[contains(text(), '% Briks')]/following-sibling::input"))
        )
        self._set_input_value(briks_input, "19.5")

        pol_input = driver.find_element(By.XPATH, "//label[contains(text(), '% Pol')]/following-sibling::input")
        self._set_input_value(pol_input, "17.1")

        rendemen_input = driver.find_element(By.XPATH, "//label[contains(text(), '% Rendemen')]/following-sibling::input")
        self._set_input_value(rendemen_input, "9.2")

        # Klik Update / Save
        save_nir_btn = driver.find_element(By.XPATH, "//button[contains(text(), 'Save') or contains(text(), 'Update')]")
        save_nir_btn.click()
        self._accept_alert_if_present(driver)

        # Tunggu sejenak agar status tersimpan tampil
        time.sleep(2)
        print("✓ Berhasil menginputkan nilai NIR")

        # =====================================================================
        # SKENARIO 8: MENGHAPUS DATA PENGIRIMAN (Dijalankan di akhir untuk cleanup)
        # =====================================================================
        print("\nSkenario 8: Menghapus data pengiriman...")
        driver.back()
        self.wait.until(EC.url_contains("/pemasokan/"))

        # Klik tombol hapus (ikon tempat sampah)
        row_xpath_cleanup = "//tr[contains(., 'BM 5555 XY')]"
        delete_shipment_btn = self.wait.until(
            EC.element_to_be_clickable((By.XPATH, f"{row_xpath_cleanup}//button[@title='Hapus']"))
        )
        delete_shipment_btn.click()

        # Ketika muncul konfirmasi penghapusan, klik hapus
        confirm_delete_btn = self.wait.until(
            EC.element_to_be_clickable((By.XPATH, "//button[text()='Hapus']"))
        )
        confirm_delete_btn.click()

        # Tunggu baris hilang
        self.wait.until(
            EC.invisibility_of_element_located((By.XPATH, "//td[contains(., 'BM 5555 XY')]"))
        )
        print("✓ Berhasil menghapus data pengiriman")

        # =====================================================================
        # SKENARIO 4: MENGHAPUS DATA SUPPLIER (Dijalankan di akhir untuk cleanup)
        # =====================================================================
        print("\nSkenario 4: Menghapus data supplier...")
        # Kembali ke Dashboard
        back_to_dashboard = self.wait.until(
            EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Dashboard')]"))
        )
        back_to_dashboard.click()

        self.wait.until(EC.url_contains("/dashboard"))

        # Klik tombol hapus pada card supplier kita
        supplier_card_xpath_cleanup = f"//*[contains(., '{edited_supplier_name}') and .//button[@title='Hapus Supplier']]"
        delete_supplier_btn = self.wait.until(
            EC.element_to_be_clickable((By.XPATH, f"{supplier_card_xpath_cleanup}//button[@title='Hapus Supplier']"))
        )
        delete_supplier_btn.click()

        # Ketika muncul konfirmasi penghapusan, klik hapus
        confirm_delete_supplier_btn = self.wait.until(
            EC.element_to_be_clickable((By.XPATH, "//button[text()='Hapus']"))
        )
        confirm_delete_supplier_btn.click()

        # Tunggu card supplier hilang
        self.wait.until(
            EC.invisibility_of_element_located((By.XPATH, f"//h4[contains(text(), '{edited_supplier_name}')]"))
        )
        print("✓ Berhasil menghapus data supplier")

        print("\n=== SEMUA SKENARIO PENGUJIAN BERHASIL DIJALANKAN! ===")

if __name__ == "__main__":
    unittest.main()
