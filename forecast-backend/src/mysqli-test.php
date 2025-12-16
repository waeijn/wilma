<?php
$mysqli = new mysqli("db", "root", "rootpassword", "testdb");

if ($mysqli->connect_error) {
    die("Connection failed: " . $mysqli->connect_error);
}
echo "✅ MySQLi connection successful!";
?>
