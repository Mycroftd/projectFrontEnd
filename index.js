let teamName = "";
let username = "";
let otherPlayer = "";
let startPos = [];
let enemyStartPos = [];
let startAngle;
let enemyStartAngle;

let currentPosX;
let currentPosY;
let currentAngle;
let currentBullets = [];

let otherPosX;
let otherPosY;
let otherAngle;
let otherBullets = [];
const speed = 10;
//const site = "ws://localhost:8080";
const site = "ws://spacewarserver.eu-4.evennode.com";
//const site = "ws://spacewarsbackend.onrender.com";

async function startGame() {
  let usernameInput = document.getElementById("userName");
  username = usernameInput.value;

  const ws = new WebSocket(site + "/unmatched?username=" + username);

  ws.onopen = function (e) {
    const messageBody = { username };
    ws.send(JSON.stringify(messageBody));
  };

  function removeStarting() {
    document.getElementById("startbutton")?.remove();
    usernameInput.innerHTML = "";
    usernameInput?.remove();
    document.getElementById("spanname")?.remove();
  }

  ws.onmessage = (webSocketMessage) => {
    const messageBody = JSON.parse(webSocketMessage.data);
    
    if (messageBody.message === "username") {
      document.getElementById("waitingMessage").innerText =
      "User name taken";
    }
    else if (messageBody.message === "waiting") {
      document.getElementById("waitingMessage").innerText =
      "Waiting for another player...";
      removeStarting();
      return;
    } else if (messageBody.message === "paired"){
      removeStarting();
      teamName = messageBody.teamName;
      otherPlayer = messageBody.otherPlayer;
      startPos = messageBody.startPos;
      enemyStartPos = messageBody.enemyStartPos;
      startAngle = messageBody.angle;
      enemyStartAngle = messageBody.enemyAngle;

      document.getElementById("players").innerText =
        username + " vs " + otherPlayer;
      document.getElementById("waitingMessage").innerText = "";
      playGame();
    }
  };
}

async function playGame() {
  const ws = new WebSocket(site + "/matched?team=" + teamName);

  window.onbeforeunload = function () {
    const messageBody = {
      lost: true,
      username,
    };
    ws.send(JSON.stringify(messageBody));
  };

  ws.onopen = function (e) {
    currentPosX = startPos[0];
    currentPosY = startPos[1];
    otherPosX = enemyStartPos[0];
    otherPosY = enemyStartPos[1];
    currentAngle = startAngle;
    otherAngle = enemyStartAngle;
    draw();
  };

  ws.onmessage = (webSocketMessage) => {
    const messageBody = JSON.parse(webSocketMessage.data);

    if (messageBody.lost) {
      if (username !== messageBody.username) {
        alert(username + " won the game!");
        return;
      } else {
        alert(username + " lost the game!");
        return;
      }
    }

    if (messageBody.username === username) {
      currentPosX = messageBody.x;
      currentPosY = messageBody.y;
    } else {
      otherPosX = messageBody.x;
      otherPosY = messageBody.y;
    }
    draw();
  };

  document.body.onkeydown = (evt) => {
    if (evt.key === "ArrowUp") {
      currentPosY -= speed;
    } else if (evt.key === "ArrowDown") {
      currentPosY += speed;
    } else if (evt.key === "ArrowLeft") {
      currentPosX -= speed;
    } else if (evt.key === "ArrowRight") {
      currentPosX += speed;
    }
    const messageBody = {
      x: currentPosX,
      y: currentPosY,
      username,
      currentAngle,
      currentBullets,
    };
    ws.send(JSON.stringify(messageBody));
  };

  function draw() {
    const ctx = document.getElementById("canvas").getContext("2d");
    ctx.clearRect(0, 0, 600, 400); // clear canvas
    ctx.fillRect(currentPosX - 10, currentPosY + 10, 20, 20);
    ctx.fillRect(otherPosX - 10, otherPosY + 10, 20, 20);
  }
}
