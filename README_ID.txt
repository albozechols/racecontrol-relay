RACECONTROL HTTP RELAY — TANPA /pm

Isi paket:
- server.js: relay HTTP yang independen dari server GTA SAMP
- package.json: konfigurasi Node.js
- 3 file Lua yang sudah diarahkan ke relay: MASTER PC, CLIENT PC, CLIENT Android

CARA MENYIAPKAN RELAY
1. Host folder RaceControl_Relay_Package sebagai Node.js web service (Node.js 20+).
2. Set environment variable RC_RELAY_KEY ke token rahasia panjang.
3. Jalankan npm start. Tes URL /health; hasilnya harus memuat "ok":true.
4. Buka ketiga file Lua dan ganti dua nilai ini di blok External HTTP relay:
   RC_RELAY_URL = 'https://URL-RELAY-ANDA'  (tanpa slash di akhir)
   RC_RELAY_KEY = 'TOKEN_YANG_SAMA_DENGAN_HOST'
   Room harus sama di semua file: RC_RELAY_ROOM = 'racecontrol-room'.
5. Pasang file MASTER di PC pengendali; CLIENT PC di MoonLoader PC; CLIENT Android di MonetLoader.
6. Restart script/game dan tes dengan dua akun sebelum dipakai event sungguhan.

PENTING / BATASAN KOMPATIBILITAS
- Transport pesan race di tiga file sudah diarahkan ke HTTP relay; tidak lagi mengirim paket race melalui /pm.
- Loader harus menyediakan LuaSocket modules socket.http, ltn12, dan ssl.https untuk URL HTTPS. Jika MonetLoader Android tidak menyediakan modul tersebut, relay HTTP tidak dapat bekerja hanya dengan file Lua itu saja tanpa dukungan jaringan dari loader.
- Saya tidak dapat menerbitkan/hosting server ke akun hosting milik Anda dari sini; URL relay harus diisi setelah Anda deploy server.js.
- Uji integrasi langsung di GTA SAMP/MoonLoader/MonetLoader belum dapat dilakukan di lingkungan ini. Tes /health hanya memeriksa server relay, bukan kompatibilitas semua loader.
- Gunakan room yang sama dan token yang sama di semua file. Jangan membagikan token ke publik.
