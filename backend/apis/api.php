<?php
header('Content-Type: application/json');

// Configuration
$config = [
    'maxFileSize' => 80 * 1024 * 1024, // Maximum allowed file size in bytes (80MB)
    'allowedExtensions' => ['mp4'], // Allowed video file extensions
    'uploadDir' => __DIR__ . '/uploads/' // Directory to save uploaded files
];

// Ensure the upload directory exists
if (!is_dir($config['uploadDir'])) {
    mkdir($config['uploadDir'], 0755, true);
}

// Handle the request
$requestMethod = $_SERVER['REQUEST_METHOD'];
if ($requestMethod === 'POST') {
    handleFileUpload($config);
} elseif ($requestMethod === 'GET') {
    listUploadedFiles($config['uploadDir']);
} else {
    echo json_encode(['status' => 'error', 'message' => 'Invalid request method.']);
    exit;
}

function handleFileUpload($config)
{
    if (!isset($_FILES['video'])) {
        echo json_encode(['status' => 'error', 'message' => 'No file uploaded.']);
        exit;
    }

    $file = $_FILES['video'];

    if ($file['error'] !== UPLOAD_ERR_OK) {
        echo json_encode(['status' => 'error', 'message' => 'File upload error.']);
        exit;
    }

    $fileExtension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    if (!in_array($fileExtension, $config['allowedExtensions'])) {
        echo json_encode(['status' => 'error', 'message' => 'Invalid file type. Allowed types: ' . implode(', ', $config['allowedExtensions'])]);
        exit;
    }

    if ($file['size'] > $config['maxFileSize']) {
        echo json_encode(['status' => 'error', 'message' => 'File size exceeds the allowed limit.']);
        exit;
    }

    $targetFileName = uniqid('video_', true) . '.' . $fileExtension;
    $targetFilePath = $config['uploadDir'] . $targetFileName;

    if (!move_uploaded_file($file['tmp_name'], $targetFilePath)) {
        echo json_encode(['status' => 'error', 'message' => 'Failed to move uploaded file.']);
        exit;
    }

    echo json_encode([
        'status' => 'success',
        'message' => 'File uploaded successfully.',
        'file' => $targetFileName,
    ]);
}

function listUploadedFiles($directory)
{
    $videoFiles = [];
    $baseDomain = (isset($_SERVER['HTTPS']) ? 'https://' : 'http://') . $_SERVER['HTTP_HOST'];
    if (is_dir($directory)) {
        $files = glob($directory . '*.mp4');
        foreach ($files as $file) {
            $videoFiles[] = str_replace(__DIR__, '', $file); // Relative path
        }
    }
    echo json_encode([
        'baseDomain' => $baseDomain . '/exps',
        'files' => $videoFiles
    ], JSON_PRETTY_PRINT);
}
?>