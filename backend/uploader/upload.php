<?php
// Configuration
$maxFileSize = 80 * 1024 * 1024; // Maximum allowed file size in bytes (50MB)
$allowedExtensions = ['mp4']; // Allowed video file extensions
$uploadDir = __DIR__ . '/uploads/'; // Directory to save uploaded files

// Ensure the upload directory exists
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0755, true);
}

// Set response header to JSON
header('Content-Type: application/json');

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['status' => 'error', 'message' => 'Invalid request method. Use POST.']);
    exit;
}

// Check if a file was uploaded with the form field 'video'
if (!isset($_FILES['video'])) {
    echo json_encode(['status' => 'error', 'message' => 'No file uploaded.']);
    exit;
}

$file = $_FILES['video'];

// Check for upload errors
if ($file['error'] !== UPLOAD_ERR_OK) {
    echo json_encode(['status' => 'error', 'message' => 'File upload error.']);
    exit;
}

// Validate file extension
$fileExtension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
if (!in_array($fileExtension, $allowedExtensions)) {
    echo json_encode(['status' => 'error', 'message' => 'Invalid file type. Allowed types: ' . implode(', ', $allowedExtensions)]);
    exit;
}

// Validate file size
if ($file['size'] > $maxFileSize) {
    echo json_encode(['status' => 'error', 'message' => 'File size exceeds the allowed limit.']);
    exit;
}

// Generate a unique file name to avoid collisions
$targetFileName = uniqid('video_', true) . '.' . $fileExtension;
$targetFilePath = $uploadDir . $targetFileName;

// Move the uploaded file to the upload directory
if (!move_uploaded_file($file['tmp_name'], $targetFilePath)) {
    echo json_encode(['status' => 'error', 'message' => 'Failed to move uploaded file.']);
    exit;
}

echo json_encode([
    'status' => 'success',
    'message' => 'File uploaded successfully.',
    'file' => $targetFileName,
]);
?>