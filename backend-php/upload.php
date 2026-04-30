<?php
// Enable CORS for frontend requests
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$target_dir = "../uploads/";

// Create directory if not exists
if (!file_exists($target_dir)) {
    mkdir($target_dir, 0777, true);
}

$response = array("success" => false, "message" => "", "file_path" => "");

if(isset($_FILES["property_image"])) {
    $file = $_FILES["property_image"];
    $filename = time() . '_' . basename($file["name"]);
    $target_file = $target_dir . $filename;
    
    // Check if image file is an actual image
    $check = getimagesize($file["tmp_name"]);
    if($check !== false) {
        if (move_uploaded_file($file["tmp_name"], $target_file)) {
            $response["success"] = true;
            $response["message"] = "File uploaded successfully.";
            // Return relative path for DB
            $response["file_path"] = "uploads/" . $filename;
        } else {
            $response["message"] = "Sorry, there was an error uploading your file.";
        }
    } else {
        $response["message"] = "File is not an image.";
    }
} else {
    $response["message"] = "No file received.";
}

echo json_encode($response);
?>
