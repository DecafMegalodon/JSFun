<?php

/**
 * Initiates connection to mySQL server
 */
function makePDOConnection()
{
	$dbhost = "YourHost";
	$dbuser = "YourUserName";
	$dbpass = "YourPassword";
	$database = "YourDB";
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