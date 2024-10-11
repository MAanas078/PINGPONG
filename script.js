const gameBoard = document.querySelector("#gameBoard");
const ctx = gameBoard.getContext("2d");
const scoreText = document.querySelector("#scoreText");
const resetBtn = document.querySelector("#resetBtn");
const hitSound = document.querySelector("#hitSound"); // Sound for paddle hit
const scoreSound = document.querySelector("#scoreSound"); // Sound for scoring
const gameOverDiv = document.querySelector("#gameOver");
const playAgainBtn = document.querySelector("#playAgainBtn"); // Button to restart after game over
const gameWidth = gameBoard.width;
const gameHeight = gameBoard.height;
const boardBackground = "snow";
const paddle1Color = "lightblue"; // AI paddle color (left)
const paddle2Color = "red"; // Player paddle color (right)
const paddleBorder = "black";
const ballColor = "yellow";
const ballBorderColor = "black";
const ballRadius = 12.5;
const paddleSpeed = 6; // Base speed for both paddles
const winningScore = 5;  // Set a winning score to trigger game over

let intervalID;
let ballSpeed;
let ballX = gameWidth / 2;
let ballY = gameHeight / 2;
let ballXDirection = 0;
let ballYDirection = 0;
let player1Score = 0; // AI score
let player2Score = 0; // Player score
let gameActive = true;

let paddle1 = {
    width: 25,
    height: 100,
    x: 0,
    y: (gameHeight - 100) / 2 // Centered vertically
};

let paddle2 = {
    width: 25,
    height: 100,
    x: gameWidth - 25,
    y: (gameHeight - 100) / 2 // Centered vertically
};

window.addEventListener("keydown", changeDirection);
resetBtn.addEventListener("click", resetGame);
playAgainBtn?.addEventListener("click", resetGame); // Restart the game on Play Again

gameStart();

function gameStart() {
    createBall();
    nextTick();
}

function nextTick() {
    if (gameActive) {
        intervalID = setTimeout(() => {
            clearBoard();
            drawPaddles();
            moveBall();
            drawBall(ballX, ballY);
            checkCollision();
            moveAIPaddle(); // Move AI paddle
            nextTick();
        }, 10);
    }
}

function clearBoard() {
    ctx.fillStyle = boardBackground;
    ctx.fillRect(0, 0, gameWidth, gameHeight);
}

function drawPaddles() {
    ctx.strokeStyle = paddleBorder;

    ctx.fillStyle = paddle1Color; // AI paddle (left)
    ctx.fillRect(paddle1.x, paddle1.y, paddle1.width, paddle1.height);
    ctx.strokeRect(paddle1.x, paddle1.y, paddle1.width, paddle1.height);

    ctx.fillStyle = paddle2Color; // Player paddle (right)
    ctx.fillRect(paddle2.x, paddle2.y, paddle2.width, paddle2.height);
    ctx.strokeRect(paddle2.x, paddle2.y, paddle2.width, paddle2.height);
}

function createBall() {
    ballSpeed = 1;
    ballXDirection = Math.round(Math.random()) == 1 ? 1 : -1;
    ballYDirection = Math.random() * (Math.round(Math.random()) == 1 ? 1 : -1);
    ballX = gameWidth / 2;
    ballY = gameHeight / 2;
    drawBall(ballX, ballY);
}

function moveBall() {
    ballX += (ballSpeed * ballXDirection);
    ballY += (ballSpeed * ballYDirection);
}

function drawBall(ballX, ballY) {
    ctx.fillStyle = ballColor;
    ctx.strokeStyle = ballBorderColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(ballX, ballY, ballRadius, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.fill();
}

function checkCollision() {
    // Ball collision with top/bottom
    if (ballY <= 0 + ballRadius || ballY >= gameHeight - ballRadius) {
        ballYDirection *= -1;
    }

    // Ball collision with paddles
    if (ballX <= (paddle1.x + paddle1.width + ballRadius) && ballY > paddle1.y && ballY < paddle1.y + paddle1.height) {
        ballX = (paddle1.x + paddle1.width) + ballRadius;
        ballXDirection *= -1;
        ballSpeed += 1;
        hitSound.play(); // Play hit sound
    }

    if (ballX >= (paddle2.x - ballRadius) && ballY > paddle2.y && ballY < paddle2.y + paddle2.height) {
        ballX = paddle2.x - ballRadius;
        ballXDirection *= -1;
        ballSpeed += 1;
        hitSound.play(); // Play hit sound
    }

    // Ball collision with left or right walls (scoring)
    if (ballX <= 0) {
        player2Score += 1; // Player scores
        updateScore();
        scoreSound.play(); // Play score sound
        checkGameOver();
        createBall();
    }

    if (ballX >= gameWidth) {
        player1Score += 1; // AI scores
        updateScore();
        scoreSound.play(); // Play score sound
        checkGameOver();
        createBall();
    }
}

function changeDirection(event) {
    const keyPressed = event.keyCode;
    const paddle2Up = 38; // Up Arrow key for Player (right paddle)
    const paddle2Down = 40; // Down Arrow key for Player (right paddle)

    switch (keyPressed) {
        case (paddle2Up):
            if (paddle2.y > 0) paddle2.y -= paddleSpeed; // Move Player paddle up
            break;
        case (paddle2Down):
            if (paddle2.y < gameHeight - paddle2.height) paddle2.y += paddleSpeed; // Move Player paddle down
            break;
    }
}

// Function to move the AI paddle with randomness
function moveAIPaddle() {
    const paddle1Center = paddle1.y + paddle1.height / 2;
    const ballCenter = ballY;

    // Introduce some randomness to the AI's movement
    const aiSpeed = paddleSpeed + Math.random() * 2; // Vary AI speed slightly
    const aiReactionTime = 5; // Adjust how responsive the AI is to the ball's position

    // Simple AI to follow the ball with a delay
    if (paddle1Center < ballCenter - aiReactionTime) {
        if (paddle1.y < gameHeight - paddle1.height) {
            paddle1.y += aiSpeed; // Move down
        }
    } else if (paddle1Center > ballCenter + aiReactionTime) {
        if (paddle1.y > 0) {
            paddle1.y -= aiSpeed; // Move up
        }
    }

    // Add a slight randomness to the AI's position to make it less predictable
    if (Math.random() < 0.1) {
        paddle1.y += (Math.random() < 0.5 ? -1 : 1) * aiSpeed; // Randomly move the AI paddle
    }

    // Ensure the AI paddle stays within bounds
    if (paddle1.y < 0) {
        paddle1.y = 0;
    } else if (paddle1.y > gameHeight - paddle1.height) {
        paddle1.y = gameHeight - paddle1.height;
    }
}

function updateScore() {
    scoreText.textContent = `${player1Score} : ${player2Score}`;
}

function checkGameOver() {
    if (player1Score >= winningScore || player2Score >= winningScore) {
        gameActive = false;
        gameOverDiv.style.display = 'block'; // Show Game Over screen
    }
}

function resetGame() {
    gameActive = true;
    player1Score = 0;
    player2Score = 0;
    updateScore();
    paddle1 = { width: 25, height: 100, x: 0, y: (gameHeight - 100) / 2 }; // Reset AI paddle position
    paddle2 = { width: 25, height: 100, x: gameWidth - 25, y: (gameHeight - 100) / 2 }; // Reset Player paddle position
    ballSpeed = 1;
    gameOverDiv.style.display = 'none'; // Hide Game Over screen
    clearInterval(intervalID);
    gameStart();
}
