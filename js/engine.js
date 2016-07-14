/* Engine.js
 * This file provides the game loop functionality (update entities and render),
 * draws the initial game board on the screen, and then calls the update and
 * render methods on your player and enemy objects (defined in your app.js).
 *
 * A game engine works by drawing the entire game screen over and over, kind of
 * like a flipbook you may have created as a kid. When your player moves across
 * the screen, it may look like just that image/character is moving or being
 * drawn but that is not the case. What's really happening is the entire "scene"
 * is being drawn over and over, presenting the illusion of animation.
 *
 * This engine is available globally via the Engine variable and it also makes
 * the canvas' context (ctx) object globally available to make writing app.js
 * a little simpler to work with.
 */

var Engine = (function(global) {
    /* Predefine the variables we'll be using within this scope,
     * create the canvas element, grab the 2D context for that canvas
     * set the canvas elements height/width and add it to the DOM.
     */
    var doc = global.document,
        win = global.window,
        canvas = doc.createElement('canvas'),
        ctx = canvas.getContext('2d'),
        lastTime;

    /* This Stopwatch object counts down the time from this.time
     * down to 0 seconds. It also formats the time so that it
     * displays in whole seconds rather than milliseconds.
     * Code learned from Saad's video on YouTube:
     * "Creating a Stopwatch in JavaScript with OOP"
     * https://youtu.be/jRhB1IG7uAw
     */
    var Stopwatch = function() {
        this.time = gameDuration;
        var interval;
        var offset;

        this.isRunning = false;

        // This function is called every 10 milliseconds to update the time passed
        function update() {
            if (this.isRunning) {
                this.time -= delta();
                this.formattedTime = timeFormatter(this.time);
            }
        }

        // Delta time used to make time consistent
        function delta() {
            var now = Date.now();
            var timePassed = now - offset;
            offset = now;
            return timePassed;
        }

        // Format the time to whole seconds
        function timeFormatter(timeInMilliseconds) {
            var time = new Date(timeInMilliseconds);
            this.seconds = time.getSeconds();
            return this.seconds;
        }

        // Start the stopwatch and update it every 10 milliseconds
        this.start = function() {
            if (!this.isRunning) {
                var interval = setInterval(update.bind(this), 10);
                offset = Date.now();
                this.isRunning = true;
            }
        };

        // This stops the watch onces it reaches 0 seconds
        this.reset = function() {
            clearInterval(interval);
            interval = null;
            this.time = gameDuration;
            this.isRunning = false;
        };
    };

    var watch = new Stopwatch();

    /* Basic Sound object without controls
     */
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

    var music;

    canvas.width = 505;
    canvas.height = 606;
    doc.body.appendChild(canvas);

    /* This function serves as the kickoff point for the game loop itself
     * and handles properly calling the update and render methods.
     */
    function main() {
        /* Get our time delta information which is required if your game
         * requires smooth animation. Because everyone's computer processes
         * instructions at different speeds we need a constant value that
         * would be the same for everyone (regardless of how fast their
         * computer is) - hurray time!
         */
        var now = Date.now(),
            dt = (now - lastTime) / 1000.0;

        // Clear the canvas before updating it
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        /* Call our update/render functions, pass along the time delta to
         * our update function since it may be used for smooth animation.
         */
        update(dt);
        render();
        updateScore();
        updateStopwatch();

        /* Set our lastTime variable which is used to determine the time delta
         * for the next time this function is called.
         */
        lastTime = now;

        // Stop the game when the countdown finishes
        if (watch.time <= 50) {
            startGame = false;
        }

        /* Use the browser's requestAnimationFrame function to call this
         * function again as soon as the browser is able to draw another frame.
         */
        if (startGame) {
            win.requestAnimationFrame(main);
        } else {
            stopGame();
        }
    }

    /* This function does some initial setup that should only occur once,
     * particularly setting the lastTime variable that is required for the
     * game loop.
     */
    function init() {
        reset();
        launchGame();
    }

    /* This function is called by main (our game loop) and itself calls all
     * of the functions which may need to update entity's data. Based on how
     * you implement your collision detection (when two entities occupy the
     * same space, for instance when your character should die), you may find
     * the need to add an additional function call here. For now, we've left
     * it commented out - you may or may not want to implement this
     * functionality this way (you could just implement collision detection
     * on the entities themselves within your app.js file).
     */
    function update(dt) {
        updateEntities(dt);
        // checkCollisions();
    }

    /* This is called by the update function and loops through all of the
     * objects within your allEnemies array as defined in app.js and calls
     * their update() methods. It will then call the update function for your
     * player object. These update methods should focus purely on updating
     * the data/properties related to the object. Do your drawing in your
     * render methods.
     */
    function updateEntities(dt) {
        allEnemies.forEach(function(enemy) {
            enemy.update(dt);
        });
        player.update();
    }

    /* This function initially draws the "game level", it will then call
     * the renderEntities function. Remember, this function is called every
     * game tick (or loop of the game engine) because that's how games work -
     * they are flipbooks creating the illusion of animation but in reality
     * they are just drawing the entire screen over and over.
     */
    function render() {
        /* This array holds the relative URL to the image used
         * for that particular row of the game level.
         */
        var rowImages = [
                'images/water-block.png',   // Top row is water
                'images/stone-block.png',   // Row 1 of 3 of stone
                'images/stone-block.png',   // Row 2 of 3 of stone
                'images/stone-block.png',   // Row 3 of 3 of stone
                'images/grass-block.png',   // Row 1 of 2 of grass
                'images/grass-block.png'    // Row 2 of 2 of grass
            ],
            numRows = 6,
            numCols = 5,
            row, col;

        /* Loop through the number of rows and columns we've defined above
         * and, using the rowImages array, draw the correct image for that
         * portion of the "grid"
         */
        for (row = 0; row < numRows; row++) {
            for (col = 0; col < numCols; col++) {
                /* The drawImage function of the canvas' context element
                 * requires 3 parameters: the image to draw, the x coordinate
                 * to start drawing and the y coordinate to start drawing.
                 * We're using our Resources helpers to refer to our images
                 * so that we get the benefits of caching these images, since
                 * we're using them over and over.
                 */
                ctx.drawImage(Resources.get(rowImages[row]), col * 101, row * 83);
            }
        }

        renderEntities();
    }

    /* This function is called by the render function and is called on each game
     * tick. Its purpose is to then call the render functions you have defined
     * on your enemy and player entities within app.js
     */
    function renderEntities() {
        /* Loop through all of the objects within the allEnemies array and call
         * the render function you have defined.
         */
        allEnemies.forEach(function(enemy) {
            enemy.render();
        });

        player.render(avatar);
    }

    function updateScore() {
        ctx.font = "30px Helvetica";
        ctx.textAlign = "left";
        ctx.fillStyle = "#fff";
        ctx.fillText("Score: " + score, 15, 100);
    }

    /* This function presents the player with a new game menu
     * where she can choose which avatar she wants to play as.
     */
    function reset() {
        // Reset music
        music = new Sound('sounds/chiptune.ogg');
        music.currentTime = 0;

        // Heading text
        ctx.font = "50px Helvetica";
        ctx.fillStyle = "#000";
        ctx.textAlign = "center";
        ctx.fillText("Classic Frogger", canvas.width / 2, 160);

        // Avatar selection
        ctx.font = "30px Helvetica";
        ctx.fillText("Select your avatar:", canvas.width / 2, 250);
        ctx.textAlign = "left";

        // Girl?
        ctx.drawImage(Resources.get('images/char-horn-girl.png'), 101, 280);
        ctx.font = "22px Helvetica";
        ctx.fillText("Press G", 106, 470);

        // Boy?
        ctx.drawImage(Resources.get('images/char-boy.png'), 303, 280);
        ctx.fillText("Press B", 311, 470);

        // Press G for girl and B for boy
        document.addEventListener('keyup', function(e) {
            if (e.keyCode === 71) {
                avatar = 'girl';
                startGame = true;
                launchGame();
            }
            if (e.keyCode === 66) {
                avatar = 'boy';
                startGame = true;
                launchGame();
            }
        });
    }

    /* Start the game when the avatar selection has been made.
     * That's when the music starts playing!
     */
    function launchGame() {
        // Reset game variables
        score = 0;
        player.x = startX;
        player.y = startY;
        allEnemies = [];
        for (i = 0; i < 3; i++) {
            allEnemies.push(new Enemy());
        }

        if (startGame) {
            lastTime = Date.now();
            music.play();
            watch.start();
            main();
        }
    }

    /* This function stops the game, resets the stopwatch,
     * clears the canvas, stops the music and shows the scoreboard.
     */
    function stopGame() {
        startGame = false;
        watch.reset();
        music.stop();
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        showScore(score);
    }

    function showScore(score) {
        // Wall of text!
        ctx.font = "45px Helvetica";
        ctx.fillStyle = "#000";
        ctx.textAlign = "center";
        ctx.fillText("Congratulations!", canvas.width / 2, 150);
        ctx.font = "35px Helvetica";
        ctx.fillText("Your score is:", canvas.width / 2, 250);
        ctx.fillStyle = "#008bc7";
        ctx.font = "50px Helvetica";
        ctx.fillText(score, canvas.width / 2, 350);
        ctx.fillStyle = "#000";
        ctx.font = "30px Helvetica";
        ctx.fillText("Press SPACE to play again", canvas.width / 2, 450);

        // Listen for spacebar input and start a new game
        document.addEventListener('keyup', function(e) {
            if (e.keyCode === 32) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                reset();
            }
        });
    }

    /* This function does not update the stopwatch object,
     * it just updates the graphical representation on-screen.
     */
    function updateStopwatch() {
        ctx.fillText("Time left: " + watch.formattedTime, 320, 100);
    }

    /* Go ahead and load all of the images we know we're going to need to
     * draw our game level. Then set init as the callback method, so that when
     * all of these images are properly loaded our game will start.
     */
    Resources.load([
        'images/stone-block.png',
        'images/water-block.png',
        'images/grass-block.png',
        'images/enemy-bug.png',
        'images/char-boy.png',
        'images/char-horn-girl.png'
    ]);
    Resources.onReady(init);

    /* Assign the canvas' context object to the global variable (the window
     * object when run in a browser) so that developers can use it more easily
     * from within their app.js files.
     */
    global.ctx = ctx;
})(this);
