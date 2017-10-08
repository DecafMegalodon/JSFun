<?php
	require $_SERVER['DOCUMENT_ROOT'] . '/includes/connect.php';
	$conn = makePDOConnection();
	$id = $_GET["id"];
	$side = $_GET["side"]; //RED or BLUE?
	$col = $_GET["col"];
	
	$dbh= makePDOConnection();
	$sth = $dbh->prepare("SELECT * FROM `con4data` WHERE id = ? limit 1");
	$sth->bindParam(1, $id);
	$sth->execute();
	$sth->setFetchMode(PDO::FETCH_ASSOC);
	$row = $sth->fetch();
	
	if($side != $row["TURN"]) //Trying to move when it's not your turn? Tsk.
	{
		$row["validMove"] = false;
		$row["Error"] = "It is not your turn";
		echo json_encode($row);
		return;
	}
	
	//Okay, it's the submitting player's turn. Let's check if their move is valid
	//The board data from the sql server is left-to-right, top-to-bottom as follows
	//0 1 2 3 4 5 6
	//7 8 9 etc
	
	//Is the col invalid? This *should* be impossible without URL hacking
	if($col < 0 || $col > 6)
	{
		$row["validMove"] = false;
		$row["Error"] = "An invalid column was click. THIS IS A SERIOUS ERROR AND SHOULD NEVER BE SEEN IN-GAME. Please report it on github with as much information as possible";
		echo json_encode($row);
		return;
	}
	
	
	for($index = 35 + $col; $index >= 0; $index -= 7)
	{
		if($row["GAMEDATA"][$index] == "N")//Is there no piece here?
		{
			$row["validMove"] = true;
			$row["Error"] = "";
			$row["GAMEDATA"][$index] = $side[0]; //update the game board with the player's piece
			$sth = $dbh->prepare("UPDATE `con4data` SET `TURN`= ?,`GAMEDATA`= ? WHERE id = ?");
			$sth->bindParam(3, $id);
			$sth->bindParam(1, $newturn);
			$sth->bindParam(2, $row["GAMEDATA"]);
			$newturn = ($side == "BLUE"?"RED":"BLUE");
			$sth->execute();
			$dbh = null;
			$sth = null;
			echo json_encode($row);
			return;
		}
		
	}
	
	$row["validMove"] = false;
	$row["Error"] = "No space in this column";
	echo json_encode($row);

?>