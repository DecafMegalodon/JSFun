<?php

/**
 * Initiates connection to mySQL server
 */
function makePDOConnection()
{
	$dbhost = "host";
	$dbuser = "user";
	$dbpass = "pass";
	$database = "db";
	try
	{
		$dbh = new PDO("mysql:host=$dbhost;dbname=$database", $dbuser, $dbpass);
		$dbh->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
	}
	catch(PDOException $e)
	{
		echo $e->getMessage();
	}
	return $dbh;
}
 

?>