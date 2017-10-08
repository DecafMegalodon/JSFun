<?php
	require $_SERVER['DOCUMENT_ROOT'] . '/includes/connect.php';
	$conn = makePDOConnection();
	$id = $_GET["id"];

	$dbh= makePDOConnection();
	$sth = $dbh->prepare("SELECT * FROM `con4data` WHERE id = ? limit 1");
	$sth->bindParam(1, $id);
	$sth->execute();
	$sth->setFetchMode(PDO::FETCH_ASSOC);
	$row = $sth->fetch();
	echo json_encode($row);
	//BBBRRRRBBBNNNNBBBRRRRNNNNNNNRRRRRRRNNNNNNN 'Merica
?>