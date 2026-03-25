<?php
$context = stream_context_create([
    'http' => [
        'method' => 'POST',
        'header' => "Content-Type: application/json\r\n",
        'content' => json_encode(['email' => 'test@test.com', 'fullName' => 'Test User', 'provider' => 'google']),
        'ignore_errors' => true
    ]
]);
$result = file_get_contents('http://127.0.0.1:8000/api/auth/login', false, $context);
echo "HTTP STATUS: " . $http_response_header[0] . "\n\n";
echo $result;
