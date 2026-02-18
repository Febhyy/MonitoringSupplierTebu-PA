<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class AuthController extends Controller
{
    // Kredensial hardcoded untuk satu akun
    private const USERNAME = 'admin';
    private const PASSWORD = 'admin123';

    public function login(Request $request)
    {
        $request->validate([
            'username' => 'required',
            'password' => 'required',
        ]);

        $username = $request->input('username');
        $password = $request->input('password');

        // Cek kredensial
        if ($username === self::USERNAME && $password === self::PASSWORD) {
            return response()->json([
                'success' => true,
                'message' => 'Login berhasil!',
                'username' => $username,
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'Username atau password salah!',
        ], 401);
    }
}
