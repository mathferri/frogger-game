/*
 * GAME PARAMETERS
 */
var gameDuration = 30000,
    colours = {
        finalScore: "#eb3126",
        minusScore: "#b30000",
        plusScore: "#fff"
    },
    typography = {
        finalScore: "bold 50px Helvetica",
        floatingScores: "bold 30px Helvetica"
    },
    floatingScores = {
        enemy: -500,
        water: +100
    },
    url = {
        enemy: 'images/enemy-bug.png',
        player: 'images/char-horn-girl.png',
        playerGirl: 'images/char-horn-girl.png',
        playerBoy: 'images/char-boy.png',
        gameMusic: 'audio/chiptune.ogg',
        collisionSound: 'audio/collision.wav',
        successSound: 'audio/success.ogg',
        gameOverSound: 'audio/jingle.mp3'
    },
    avatar,
    collisionCoordinates = [],
    collisionWithEnemy = false,
    collisionWithWater = false,
    score = 0,
    gameHasStarted = false,
    platformBounds = {
        left: 0,
        right: 404,
        up: -23,
        down: 392
    },
    keyIsDown = {
        37: false,
        38: false,
        39: false,
        40: false
    };

/*
 * FUNCTIONS
 */

// Returns a random number between min (inclusive) and max (exclusive)
function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
}

// Returns a random integer between min (included) and max (included)
// Using Math.round() will give you a non-uniform distribution!
function getRandomIntInclusive(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Basic Sound object without controls
var Sound = function(src) {
    this.sound = document.createElement("audio");
    this.sound.src = src;
    this.sound.setAttribute("preload", "auto");
    this.sound.setAttribute("controls", "none");
    this.sound.style.display = "none";
    document.body.appendChild(this.sound);
    this.play = function(){
        this.sound.play();
    };
    this.stop = function(){
        this.sound.pause();
    };
};

var gameMusic = url.gameMusic;
var collisionSound = new Sound(url.collisionSound);
var successSound = new Sound(url.successSound);
var gameOverSound = new Sound(url.gameOverSound);


/*
 * CLASSES
 */

// Superclass for Enemy and Player
// imgURL parameter accepts a string location of the image sprite
var Unit = function(imgURL, x, y) {
    this.sprite = imgURL;
    this.x = x;
    this.y = y;
};

// Enemies our player must avoid
var Enemy = function() {
    // Randomise the speed of the bug
    this.speed = getRandomArbitrary(0.2, 1) * 300;
    this.hitbox = 70;

    // The bug will randomly start in one of the three lanes
    var y = getRandomIntInclusive(1, 3) * 83 - 23;

    Unit.call(this, url.enemy, -110, y);
};

Enemy.prototype = Object.create(Unit.prototype);
Enemy.prototype.constructor = Enemy;

// Update the enemy's position, required method for game
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function(dt) {
    // You should multiply any movement by the dt parameter
    // which will ensure the game runs at the same speed for
    // all computers.
    this.x += this.speed * dt;

    // Instantiate a new bug every time an existing bug runs out of sight
    if (this.x >= 505) {
        allEnemies.push(new Enemy());

        // Remove the out-of-sight bug from allEnemies array
        var index = allEnemies.indexOf(this);
        allEnemies.splice(index, 1);
    }

    // Handle collisions with player
    if (this.x > player.x - this.hitbox && this.x < player.x + this.hitbox && this.y === player.y) {
        collisionWithEnemy = true;
        collisionCoordinates.push({x: player.x+12, y: player.y+120});
        collisionSound.play();
        player.x = 202;
        player.y = 392;
        if (score >= Math.abs(floatingScores.enemy)) {
            score -= Math.abs(floatingScores.enemy);
        } else {
            score = 0;
        }
    }
};

// Draw the enemy on the screen, required method for game
Enemy.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

// Now write your own player class
// This class requires an update(), render() and
// a handleInput() method.
var Player = function() {
    Unit.call(this, url.player, 202, 392);
};


Player.prototype = Object.create(Unit.prototype);
Player.prototype.constructor = Player;

Player.prototype.update = function(dt) {
    // If the player reaches the water,
    // he wins and goes back to the starting position.
    if (this.y === -23) {
        collisionWithWater = true;
        collisionCoordinates.push({x: this.x+12, y: this.y+120});
        successSound.play();
        this.x = 202;
        this.y = 392;
        score += floatingScores.water;
    }
};

Player.prototype.render = function(avatar) {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

// Player movement.
// down variable is used to detect if a key is currently pressed.
// This prevents the ease-mode where the player could just
// rush through the level by keeping the arrow key up pressed.
Player.prototype.handleInput = function(key) {
    switch (key) {
        case 'left':
            if (this.x > platformBounds.left && keyIsDown['37'] === false && gameHasStarted) {
                this.x -= 101;
                keyIsDown['37'] = true;
            }
            break;
        case 'up':
            if (this.y > platformBounds.up && keyIsDown['38'] === false && gameHasStarted) {
                this.y -= 83;
                keyIsDown['38'] = true;
            }
            break;
        case 'right':
            if (this.x < platformBounds.right && keyIsDown['39'] === false && gameHasStarted) {
                this.x += 101;
                keyIsDown['39'] = true;
            }
            break;
        case 'down':
            if (this.y < platformBounds.down && keyIsDown['40'] === false && gameHasStarted) {
                this.y += 83;
                keyIsDown['40'] = true;
            }
            break;
        default:


    }
};


/*
 * CLASSES INSTANTIATION
 */

// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
// Place the player object in a variable called player
var allEnemies = [];
for (var i = 0; i < 3; i++) {
    allEnemies.push(new Enemy());
}
var player = new Player();


// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
document.addEventListener('keydown', function(e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };

    player.handleInput(allowedKeys[e.keyCode]);
});

document.addEventListener('keyup', function(e) {
    keyIsDown[e.keyCode] = false;
});
