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

	if(!$row) //Did we fail to find a game?
	{
		echo '{"validGame":false}';//Let the requestor know we couldn't find the game
		return;
	}
	
	if($row["p2joined"] == false) //Update the game state so p1 knows the game has started
	{
		$sth = $dbh->prepare("UPDATE `con4data` SET `p2joined`= TRUE WHERE ID = ?");
		$sth->bindParam(1, $id);
		$sth->execute();
	}
	$dbh = null;
	$sth = null;
	$row["validGame"] = true;
	echo json_encode($row);
	
	//Note: The sent value shows p2 not having joined yet. This is intentional and is a signal that they are to be red
	//If (re)joining after the game has started, they will join as the color whose turn it is.
?>