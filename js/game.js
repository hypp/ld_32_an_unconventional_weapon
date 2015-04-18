
var Phaser = Phaser;

var game_width = 800;
var game_height = 600;

var game;

var car;
var player;

var cursors;

var score = 0;
var scoreText;

var speed_text;

var bmd;
var area;

var z_pos = 0;
var z_speed = 0;
var z_speed_inc = 8;
var z_max_speed = 1024;

var x_pos = 0;
var x_speed_inc = 8;
var x_max_pos = 256;
var x_min_pos = -256;

var road_strip_size = 1024*8

function preload() {
    game.load.image('road_light', 'assets/road_light.png');
    game.load.image('road_dark', 'assets/road_dark.png');
    game.load.image('car', 'assets/car.png');
    
}

function create() {
    
	game.stage.backgroundColor = '#2d2d2d';

	bmd = game.make.bitmapData(game_width, game_height);

	bmd.addToWorld();

	area = new Phaser.Rectangle(0, 0, game_width, 1);
    
    cursors = game.input.keyboard.createCursorKeys();

    speed_text = game.add.text(8, 8, 'speed: 0', { fontSize: '16px', fill: '#000' });
    
    car = game.cache.getImage('car');
    player = game.add.sprite((game_width - car.width) / 2, game_height - car.height - 10, 'car');
}

function update() {
    
    if (cursors.up.isDown && z_speed < z_max_speed) {
        z_speed += z_speed_inc;
    }

    if (cursors.down.isDown && z_speed > 0) {
        z_speed -= z_speed_inc;
        if (z_speed < 0) {
            z_speed = 0;
        }
    }

    speed_text.text = 'speed: ' + z_speed;

    // Move road but keep car in the middle
    if (z_speed > 0) {
        if (cursors.right.isDown && x_pos > x_min_pos) {
            x_pos -= x_speed_inc * (z_speed / z_max_speed);
            if (x_pos < x_min_pos) {
                x_pos = x_min_pos
            }
        }

        if (cursors.left.isDown && x_pos < x_max_pos) {
            x_pos += x_speed_inc * (z_speed / z_max_speed);
            if (x_pos > x_max_pos) {
                x_pos = x_max_pos
            }
        }
    }

    // Bounce the car, based on the current speed
    player.y = game_height - car.height - 25 - (5 * (z_speed / z_max_speed) * Math.random());
    
    // Render the road
    z_pos = (z_pos + z_speed) % road_strip_size;
    
    var z = z_pos;
    var z_inc = 1;
    var z_cur = 0;
    
    for (var y = game_height-1; y >= 0; y--) {
        area.y = y;
        z_cur += z_inc;
        z = (z + z_cur) % road_strip_size;

        if (z < (road_strip_size/2)) {
            bmd.copyRect('road_dark', area, x_pos, y);
        } else {
            bmd.copyRect('road_light', area, x_pos, y);
        }
    }
}

var game = new Phaser.Game(game_width, game_height, Phaser.AUTO, '', {
        preload: preload,
        create: create,
        update: update
    });

