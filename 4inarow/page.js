var cachedGameID = false; //While a game is running, this is the game ID. False otherwise
var myTeam;

function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

async function mainGameLoop()
{
	var cachedGameData;
	var thisLoopGameID = cachedGameID;
	while(cachedGameID == thisLoopGameID)
	{
		var xmlhttp = new XMLHttpRequest(); //No support for ancient IE, sorry. Time to upgrade.
		xmlhttp.onreadystatechange = function() {
			if (this.readyState == 4 && this.status == 200) {
				//console.log(this.responseText);
				var response = JSON.parse(this.responseText);
				
				if(cachedGameData != response.GAMEDATA)
				{
					console.log("Cached Game Data Updated. GID=" + cachedGameID);
					cachedGameData = response.GAMEDATA;
					doDrawGame(response);
				}
				else
				{
					//console.log("Game data not updated. GID=" + cachedGameID);
				}
			}
		};
		xmlhttp.open("GET", "/4inarow/getGameState.php?id=" + cachedGameID, true);
		xmlhttp.send();
		await sleep(1000);
	}

	
}

function doDrawGame(data)
{
	var gamedata = data.GAMEDATA;
	var gameTable = "<table>"
	for(var y = 0; y < 6; y++)
	{
		gameTable += "<tr>";
		for(var x = 0; x < 7; x++)
		{
			switch(gamedata[y*7+x])
			{
				case 'B':
					gameTable += '<td onclick="doGameMove(' + x + ')"><img src="/img/chipBlue.png" alt="blue"></td>';
					break;
				case 'R':
					gameTable += '<td onclick="doGameMove(' + x + ')"><img src="/img/chipRed.png" alt="red"></td>';
					break;
				case 'N':
					gameTable += '<td onclick="doGameMove(' + x + ')"><img src="/img/chipNone.png" alt="red"></td>';
					break;
				default:
					console.log("MALFORMED GAMEDATA. The GAMEDATA STRING IS: " + gamedata);
			}
		}
		gameTable += "</tr>";
	}
	gameTable += "</table>";
	//console.log(gameTable);
	document.getElementById("gameBoard").innerHTML = gameTable;
	document.getElementById("gameStatus").innerHTML = "It is " + data.TURN + "'s turn. " + (data.p2joined==false?"Your partner has not yet connected":"");
}

function doGameMove(col)
{
	if(!cachedGameID)
	{
		return; //The game is aborted. We shouldn't send inputs for it. If we still want to play we can rejoin.
	}
	var xmlhttp = new XMLHttpRequest(); //No support for ancient IE, sorry. Time to upgrade.
	xmlhttp.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			console.log(this.responseText);
			var response = JSON.parse(this.responseText);
			if(response.validMove)
			{
				//doDrawGame(response); //This is causing some issues where the screen is updated correctly, then reverted because a mainGameLoop-called update is happening
			}
		}
	}
	xmlhttp.open("GET", "/4inarow/doGameMove.php?id=" + cachedGameID + "&side=" + myTeam + "&col=" + col, true);
	xmlhttp.send();
}

function getNewGameID()
{
	var xmlhttp = new XMLHttpRequest(); //No support for ancient IE, sorry. Time to upgrade.
	xmlhttp.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			document.getElementById("gameID").value = this.responseText;
		}
	};
	xmlhttp.open("GET", "/4inarow/getID.php", true);
	xmlhttp.send();
}

async function startNewGame()
{
	var gameID = document.getElementById("gameID");
	if (cachedGameID)
	{
		document.getElementById("restartButton").innerHTML = "Start new game";
		gameID.value = "Game Aborted";
		gameID.disabled = false;
		cachedGameID = false;
		return;
	}
	
	document.getElementById("gameStatus").innerHTML = "Waiting for partner to connect";
	gameID.value = "Getting game ID...";
	document.getElementById("restartButton").disabled = true;
	gameID.disabled = true;
	getNewGameID();
	
	while(gameID.value == "Getting game ID...") //This should be replaced with a callback, but this is an acceptable intermediate
	{ //This will sit and do nothing until the server responds. If the server doesn't, that will be forever (but the game is useless without it anyway)
		await sleep (250);
	}
	document.getElementById("restartButton").disabled = false;
	document.getElementById("restartButton").innerHTML = "Abort game";
	cachedGameID = gameID.value;
	myTeam = "BLUE";
	document.getElementById("team").value = "BLUE";
	mainGameLoop()
	
}

function tryJoinGame()
{
	document.getElementById("gameStatus").innerHTML = "Attempting to join game...";
	var xmlhttp = new XMLHttpRequest();
	xmlhttp.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			console.log(this.responseText);
			var response = JSON.parse(this.responseText);
			var gameStatus = document.getElementById("gameStatus");
			gameStatus.innerHTML = response;
			if (!response.validGame)
			{
				gameStatus.innerHTML = "Could not find game :(";
				return;
			}
			//Found a valid game
			gameStatus.innerHTML = "Found game! Initializing...";
			cachedGameID = gameID.value;
			document.getElementById("gameID").disabled = true;
			document.getElementById("restartButton").innerHTML = "Abort game";
			if(response.p2joined == false) //Is this the first time p2 has joined? The DB has been already updated to state that p2 has joined. This is a cached value.
			{
				console.log("Joining the existing game as RED");
				myTeam = "RED";
				document.getElementById("team").value = "RED"
			}
			else //Return to the game as the player whose turn it is currently
			{ 
				console.log("Joining the existing game as " + response.TURN);
				myTeam = response.TURN;
				document.getElementById("team").value = response.TURN;
			}
			mainGameLoop();
		}
	};
	xmlhttp.open("GET", "/4inarow/doJoinGame.php?id=" + document.getElementById("gameID").value , true);
	xmlhttp.send();
}