<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Test - Sistem Klasifikasi Kualitas Tebu</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            text-align: center;
        }
        .container {
            background: white;
            color: #333;
            padding: 40px;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        }
        h1 { color: #667eea; }
        .status { margin: 20px 0; }
        .ok { color: green; }
        .error { color: red; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🌾 Test Halaman</h1>
        <div class="status ok">✅ Laravel berfungsi dengan baik!</div>
        <p>Jika Anda melihat halaman ini, artinya:</p>
        <ul style="text-align: left;">
            <li>✅ Laravel server sudah running</li>
            <li>✅ Route web.php sudah benar</li>
            <li>✅ View blade bisa diakses</li>
        </ul>
        <hr>
        <div id="root">Loading React...</div>
        <p style="margin-top: 20px; font-size: 12px; color: #666;">
            Jika masih ada tulisan "Loading React..." di atas, berarti Vite belum compile React
        </p>
    </div>
    
    @vite(['resources/css/app.css', 'resources/js/app.jsx'])
    
    <script>
        setTimeout(() => {
            const root = document.getElementById('root');
            if (root.innerHTML === 'Loading React...') {
                root.innerHTML = '<span class="error">❌ React belum ter-load. Cek npm run dev!</span>';
            }
        }, 3000);
    </script>
</body>
</html>
