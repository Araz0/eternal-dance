<?php
header('Content-Type: application/json');

// Configuration
$config = [
    'maxFileSize' => 80 * 1024 * 1024, // Maximum allowed file size in bytes (80MB)
    'allowedExtensions' => ['mp4', 'jpg'], // Allowed file extensions
    'uploadDir' => __DIR__ . '/exps/' // Directory to save uploaded files
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
    // Check if a file is uploaded under 'file', 'image', or 'video'
    $fileKey = isset($_FILES['file']) ? 'file' : (isset($_FILES['image']) ? 'image' : (isset($_FILES['video']) ? 'video' : null));

    if (!$fileKey) {
        echo json_encode(['status' => 'error', 'message' => 'No file uploaded.']);
        exit;
    }

    $file = $_FILES[$fileKey];

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

    $originalFileName = basename($file['name']);
    $targetFilePath = $config['uploadDir'] . $originalFileName;

    if (!move_uploaded_file($file['tmp_name'], $targetFilePath)) {
        echo json_encode(['status' => 'error', 'message' => 'Failed to move uploaded file.']);
        exit;
    }

    echo json_encode([
        'status' => 'success',
        'message' => 'File uploaded successfully.',
        'file' => $originalFileName,
    ]);
}
function listUploadedFiles($directory)
{
    $filesList = [];
    $baseDomain = (isset($_SERVER['HTTPS']) ? 'https://' : 'http://') . $_SERVER['HTTP_HOST'];
    $basePath = rtrim($baseDomain . '/exps', '/');

    if (is_dir($directory)) {
        $videoFiles = glob($directory . '/*.mp4');
        $imageFiles = glob($directory . '/*.jpg');

        $fileMap = [];

        // Map video files
        foreach ($videoFiles as $video) {
            $fileName = pathinfo($video, PATHINFO_FILENAME); // e.g., "1744988986691_cropped"
            if (preg_match('/^(\d+)_cropped$/', $fileName, $matches)) {
                $id = $matches[1];
                $relativePath = str_replace($_SERVER['DOCUMENT_ROOT'], '', realpath($video));
                $fileMap[$id]['video'] = $basePath . $relativePath;
            }
        }

        // Map image files
        foreach ($imageFiles as $image) {
            $fileName = pathinfo($image, PATHINFO_FILENAME); // e.g., "1744988986691_croppedThumbnail"
            if (preg_match('/^(\d+)_croppedThumbnail$/', $fileName, $matches)) {
                $id = $matches[1];
                $relativePath = str_replace($_SERVER['DOCUMENT_ROOT'], '', realpath($image));
                $fileMap[$id]['thumbnail'] = $basePath . $relativePath;
            }
        }

        // Combine into list
        foreach ($fileMap as $id => $files) {
            if (isset($files['video']) || isset($files['thumbnail'])) {
                $filesList[] = [
                    'id' => (int) $id,
                    'video' => $files['video'] ?? null,
                    'thumbnail' => $files['thumbnail'] ?? null
                ];
            }
        }
    }

    echo json_encode(['files' => $filesList], JSON_PRETTY_PRINT);
}


?>