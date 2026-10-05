# Laporan Hasil Pengujian Aplikasi PAGAR

**Pengujian alur turnamen, operator gelanggang, dan penilaian juri**

| Informasi | Nilai |
|---|---|
| Tanggal pengujian | 4–5 Oktober 2026 |
| Aplikasi | Digital Silat Scoring System ([digital-silat.vercel.app](https://digital-silat.vercel.app)) |
| Akun uji | Operator Gelanggang 1; kredensial tidak dicantumkan dalam laporan |

## Ringkasan

Pengujian berhasil membuat turnamen uji, menyiapkan partai TEST-01, mengakses panel operator dan mode juri, serta mengirim penilaian serentak dari empat juri uji. Operator mengesahkan satu hasil penilaian; skor TEST MERAH berubah menjadi 1–0 dan antrean putusan kosong. Temuan utama adalah perbedaan antara keterangan protokol validasi otomatis dan perilaku yang diamati: empat suara serupa tetap menunggu pengesahan operator.

| Area | Hasil | Status |
|---|---|---|
| Pembuatan turnamen dan partai uji | Turnamen TOUR-2026-002 dan MATCH #TEST-01 tersimpan | Berhasil |
| Akses operator dan juri | Panel operator dan empat sesi juri dapat dibuka | Berhasil |
| Penilaian serentak | Empat usulan masuk; satu hasil disahkan dan skor menjadi 1–0 | Berhasil dengan catatan |
| Validasi otomatis quorum | Empat suara tidak langsung mengubah skor; operator perlu mengesahkan | Perlu verifikasi |

**Kesimpulan:** alur dasar lintas peran dapat dijalankan pada data uji. Perilaku quorum perlu dikonfirmasi terhadap kebutuhan produk sebelum sistem digunakan untuk pertandingan resmi.

## Ruang Lingkup dan Skenario Uji

Pengujian dilakukan pada aplikasi web yang diberikan, memakai akun operator yang disediakan dan data berlabel TEST. Partai uji menggunakan atlet fiktif TEST MERAH dan TEST BIRU pada Gelanggang 1. Pertandingan KEJURDA KTG yang telah ada tidak diberi skor atau diubah.

### Skenario dan hasil

| No. | Skenario | Hasil aktual | Status |
|---:|---|---|---|
| 1 | Login sebagai operator | Dashboard operator terbuka dan menampilkan turnamen aktif. | Lulus |
| 2 | Membuat turnamen uji | TEST OPERATOR - DIGITAL SILAT 4 OKT 2026 tersimpan sebagai TOUR-2026-002. | Lulus |
| 3 | Menyiapkan atlet dan partai | Dua atlet uji dibuat; MATCH #TEST-01 dijadwalkan pada Gelanggang 1 pukul 23.00 WIB, 4 Oktober 2026. | Lulus |
| 4 | Membuka panel operator | Panel TEST-01 menampilkan timer, kontrol ronde, skor, meja putusan, serta manajemen kode juri. | Lulus |
| 5 | Mendaftarkan juri dan kode akses | Pembuatan kode awal gagal karena belum ada juri pada gelanggang. Setelah empat profil TEST JURI 1–4 didaftarkan, kode untuk keempatnya berhasil dibuat. | Lulus setelah prasyarat |
| 6 | Memastikan partai di mode juri | Pada percobaan awal portal juri menampilkan MATCH #012. Setelah konteks pertandingan diperbarui, portal menampilkan TEST-01. | Lulus setelah koreksi konteks |
| 7 | Mengirim nilai serentak | Empat sesi juri mengirim Merah – Pukulan +1. Empat usulan terlihat di panel operator dan dicatat pada log. | Lulus dengan catatan |
| 8 | Mengesahkan nilai operator | Setelah satu hasil disahkan, skor resmi menjadi 1–0 dan antrean putusan menjadi kosong. | Lulus |

## Temuan Pengujian

### 1. Validasi quorum memerlukan tindakan operator

Halaman monitoring juri menerangkan bahwa penilaian yang didukung minimal 3 dari 5 juri dalam rentang 1 detik akan divalidasi otomatis. Pada TEST-01, empat juri mengirim usulan serupa. Panel operator tetap menampilkan antrean putusan dan tombol **Sahkan/Tolak**. Skor baru berubah menjadi 1–0 setelah operator mengesahkan satu hasil; empat suara tercatat pada log sebagai satu hasil yang disahkan.

**Dampak:** operator masih harus mengambil keputusan manual walaupun ambang quorum tercapai. Hal ini dapat menjadi perilaku yang memang disengaja, tetapi tidak selaras dengan keterangan validasi otomatis yang terlihat pada aplikasi.

### 2. Prasyarat pembuatan kode juri belum terpenuhi secara awal

Pembuatan kode akses gagal dengan pesan bahwa belum ada juri terdaftar pada gelanggang. Setelah empat profil uji didaftarkan pada Gelanggang 1, kode dapat dibuat. Alur prasyarat berfungsi, tetapi pesan dan langkah pemulihannya dapat dibuat lebih jelas bagi operator.

### 3. Portal juri sempat menampilkan pertandingan berbeda

Saat membuka alur juri pada awal pengujian, portal menampilkan MATCH #012, padahal panel operator yang diuji adalah TEST-01. Konteks kemudian diperbarui dan portal menampilkan TEST-01. Pastikan portal juri selalu mengikuti partai aktif yang dipilih operator sebelum juri mengirim nilai.

### 4. Ronde uji mencapai batas waktu

Timer ronde sempat mencapai 00:00 saat pengiriman usulan. Sistem tetap menerima usulan dan mengizinkan operator menyelesaikan putusan setelah timer direset. Pengujian ini membuktikan penerimaan usulan pada kondisi batas waktu, tetapi belum memastikan apakah perilaku tersebut sesuai aturan pertandingan.

## Rekomendasi dan Status Akhir

### Tindak lanjut yang disarankan

- Konfirmasi aturan produk: apakah quorum 3 dari 5 harus langsung menambah skor, atau tetap menunggu pengesahan operator. Selaraskan perilaku aplikasi, teks protokol, dan petunjuk pada meja putusan.
- Tambahkan pengujian otomatis untuk 2 dari 5, 3 dari 5 dalam 1 detik, 3 suara di luar rentang waktu, suara berbeda sisi, dan suara duplikat. Pastikan satu quorum hanya menghasilkan satu perubahan skor.
- Pastikan portal juri menampilkan nomor pertandingan dan arena yang sama dengan panel operator. Tampilkan pesan yang jelas jika partai aktif belum tersedia atau konteksnya berubah.
- Tetapkan aturan ketika timer mencapai 00:00: apakah usulan baru ditolak, tetap masuk antrean, atau dapat disahkan setelah ronde berakhir.

### Status data uji pada akhir pengujian

| Item | Status akhir |
|---|---|
| Turnamen uji | TOUR-2026-002 tersimpan. |
| Atlet uji | TEST MERAH dan TEST BIRU tersimpan. |
| Juri uji | Empat profil TEST JURI 1–4 terdaftar pada Gelanggang 1; kode akses dibuat untuk pengujian. |
| Partai TEST-01 | Skor TEST MERAH 1 – TEST BIRU 0; ronde pertama dijeda setelah timer direset ke 02:00. |
| Partai KEJURDA #012 | Tidak ada skor atau perubahan yang dilakukan selama pengujian. |

Secara keseluruhan, alur pembuatan turnamen, persiapan juri, penilaian dari empat sesi juri, dan pengesahan skor oleh operator berhasil diuji pada data sintetis. Pengujian dinyatakan berhasil sebagian karena validasi quorum otomatis dan penerimaan nilai setelah timer habis masih memerlukan konfirmasi aturan.
