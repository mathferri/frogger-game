/*
 * HELPER FUNCTIONS
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

// Player's starting location
var startX = 202,
    startY = 392;

// This variable is used to detect if a certain key
// is currently being pressed down or not.
var down = {
    37: false,
    38: false,
    39: false,
    40: false
};


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

    // The bug will randomly start in one of the three lanes
    var y = getRandomIntInclusive(1, 3) * 83 - 23;

    Unit.call(this, 'images/enemy-bug.png', -110, y);
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
    if (this.x > player.x - 65 && this.x < player.x + 65 && this.y === player.y) {
        player.x = startX;
        player.y = startY;
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
    Unit.call(this, 'images/char-boy.png', startX, startY);
};


Player.prototype = Object.create(Unit.prototype);
Player.prototype.constructor = Player;

Player.prototype.update = function(dt) {
    // If the player reaches the water,
    // he wins and goes back to the starting position.
    if (player.y === -23) {
        player.x = startX;
        player.y = startY;
    }
};

Player.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

// Player movement.
// down variable is used to detect if a key is currently pressed.
// This prevents the ease-mode where the player could just
// rush through the level by keeping the arrow key up pressed.
Player.prototype.handleInput = function(key) {
    switch (key) {
        case 'left':
            if (this.x > 0 && down['37'] === false) {
                this.x -= 101;
                down['37'] = true;
            }
            break;
        case 'up':
            if (this.y > -23 && down['38'] === false) {
                this.y -= 83;
                down['38'] = true;
            }
            break;
        case 'right':
            if (this.x < 404 && down['39'] === false) {
                this.x += 101;
                down['39'] = true;
            }
            break;
        case 'down':
            if (this.y < 392 && down['40'] === false) {
                this.y += 83;
                down['40'] = true;
            }
            break;
        default:
            console.log('Key not allowed, please press arrow keys');

    }
};


/*
 * CLASSES INSTANTIATION
 */

// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
// Place the player object in a variable called player
var allEnemies = [];
for (i = 0; i < 3; i++) {
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
    down[e.keyCode] = false;
});
