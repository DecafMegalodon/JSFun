<?php
	//Creates a new game and returns the id
	require $_SERVER['DOCUMENT_ROOT'] . '/includes/connect.php';
	$dbh= makePDOConnection();
	$sth = $dbh->prepare("INSERT INTO con4data () VALUES ()");
	$sth->execute();
	$id = $dbh->lastInsertId();
	echo $id;


?>