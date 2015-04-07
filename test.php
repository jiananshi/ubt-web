<?php
if(array_key_exists('HTTP_REFERER', $_SERVER)) {
  header('Content-Type: image/gif');
} else {
  header('Content-Type: text/plain');
}

$data = urldecode($_SERVER['QUERY_STRING']);
$data = json_decode($data, true);

print_r($data);
?>

