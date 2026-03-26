<?php
$ch = curl_init('http://127.0.0.1:8000/api/auth/register');
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode(['fullName' => 'test_script_user', 'password' => 'secret123']));
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);
$httpcode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
echo "HTTP Status: $httpcode\n";
echo "Response: \n$response\n";
