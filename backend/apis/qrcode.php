<?php
// using this lib from https://github.com/lasalesi/phpqrcode
require_once("./lib/qrlib.php");


// 1. Grab the 'url' parameter, or use a default
$payload = isset($_GET['url']) && trim($_GET['url']) !== ''
   ? trim($_GET['url'])
   : 'https://eternal-dance.art/gallery';

// 2. Optional: validate/sanitize URL (basic)
//    If you want stricter checks, use filter_var with FILTER_VALIDATE_URL
if (!filter_var($payload, FILTER_VALIDATE_URL)) {
   header('HTTP/1.1 400 Bad Request');
   echo 'Invalid URL';
   exit;
}

// 3. Control these via query parameters if you like
$ecLevel = isset($_GET['ec']) && in_array($_GET['ec'], ['L', 'M', 'Q', 'H'])
   ? $_GET['ec']
   : 'H';
$size = isset($_GET['size']) ? max(1, (int) $_GET['size']) : 8;
$margin = isset($_GET['margin']) ? max(0, (int) $_GET['margin']) : 2;

// 4. Output as PNG image
header('Content-Type: image/png');
// creates code image and outputs it directly into browser
// ECC options are L (smallest), M, Q, H (best)
// Pixel sizes are 1..10
// Frame sizes are e.g. 4, 6, 12
QRcode::png($payload, false, $ecLevel, $size, $margin);