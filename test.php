<?php
header('Content-Type: text/plain');

$data = urldecode($_SERVER['QUERY_STRING']);
$data = json_decode($data, true);

print_r($data);
?>

