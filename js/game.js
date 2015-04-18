
"use strict";

// Salamina nr 33

var Phaser = Phaser;

var game_width = 800;
var game_height = 600;

var game;

var sky;
var hills;

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
var x_max_pos = 256 * 2;
var x_min_pos = -256 * 2;

var road_strip_size = 1024 * 4;


// A track is a sequence of road strips, with 
// x, y and z positions and which texture to use
var track = [];
var current_segment = 0;

function ease_in(a, b, percent) {
    return a + (b - a) * Math.pow(percent, 2);
}

function ease_out(a, b, percent) {
    return a + (b - a) * (1 - Math.pow(1 - percent, 2));
}

function ease_in_out(a, b, percent) {
    return a + (b - a) * ((-Math.cos(percent * Math.PI) / 2) + 0.5);
}

function add_segment(curve, y, texture) {
    track.push({
        curve: curve,
        y: y,
        z: 0,// Not really used or?
        texture: texture
    });
}

function create_track() {
    var i, j;

    for (j = 0; j < 2; j++) {
        add_segment(0, 0, 'road_light');
    }
    
    // Just add a start line
    for (j = 0; j < 2; j++) {
        add_segment(0, 0, 'road_start');
    }
    
//    for (i = 0; i < 50; i++) {
//        for (j = 0; j < 2; j++) {
//            add_segment(0, 0, 'road_light');
//        }
//        for (j = 0; j < 2; j++) {
//            add_segment(0, 0, 'road_dark');
//        }
//    }
    
    // Enter the curve
    for (i = 0; i < 40; i++) {
        var curve = ease_in(0, 10, i / 40);
        if (track.length % 4 < 2) {
            add_segment(curve, 0, 'road_light');
        } else {
            add_segment(curve, 0, 'road_dark');
        }
    }

    for (i = 0; i < 50; i++) {
        if (track.length % 4 < 2) {
            add_segment(0, 0, 'road_light');
        } else {
            add_segment(0, 0, 'road_dark');
        }
    }
    
    // Leave the curve
    for (i = 0; i < 40; i++) {
        var curve = ease_out(10, 0, i / 40);
        if (track.length % 4 < 2) {
            add_segment(curve, 0, 'road_light');
        } else {
            add_segment(curve, 0, 'road_dark');
        }
    }

    for (i = 0; i < 50; i++) {
        if (track.length % 4 < 2) {
            add_segment(0, 0, 'road_light');
        } else {
            add_segment(0, 0, 'road_dark');
        }
    }

    // Enter the curve
    for (i = 0; i < 20; i++) {
        var curve = ease_in(0, -10, i / 20);
        if (track.length % 4 < 2) {
            add_segment(curve, 0, 'road_light');
        } else {
            add_segment(curve, 0, 'road_dark');
        }
    }

    for (i = 0; i < 50; i++) {
        if (track.length % 4 < 2) {
            add_segment(0, 0, 'road_light');
        } else {
            add_segment(0, 0, 'road_dark');
        }
    }
    
    // Leave the curve
    for (i = 0; i < 20; i++) {
        var curve = ease_out(-50, 0, i / 20);
        if (track.length % 2 < 1) {
            add_segment(curve, 0, 'road_light');
        } else {
            add_segment(curve, 0, 'road_dark');
        }
    }
    
    
}

function preload() {
    game.load.image('sky', 'assets/sky2.png');
    game.load.image('hills', 'assets/hills.png');
    game.load.image('road_light', 'assets/road_light.png');
    game.load.image('road_dark', 'assets/road_dark.png');
    game.load.image('road_start', 'assets/road_start.png');
    game.load.image('car', 'assets/car.png');
    game.load.image('car_shadow', 'assets/car_shadow.png');
    
}

function create() {
    
    create_track();
    
	game.stage.backgroundColor = '#000000';

    sky = game.add.sprite(0, 0, 'sky');
    var tmp_hills = game.cache.getImage('hills');
    hills = game.add.tileSprite(0, 0, tmp_hills.width, tmp_hills.height, 'hills', 0);

	bmd = game.make.bitmapData(game_width, game_height);
	bmd.addToWorld();

	area = new Phaser.Rectangle(0, 0, game_width, 1);
    
    cursors = game.input.keyboard.createCursorKeys();

    speed_text = game.add.text(8, 8, 'speed: 0', { fontSize: '16px', fill: '#000' });
    
    var car_shadow = game.cache.getImage('car_shadow');
    player = game.add.sprite((game_width - car_shadow.width) / 2, game_height - car_shadow.height - 5, 'car_shadow');
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
                x_pos = x_min_pos;
            }
        }

        if (cursors.left.isDown && x_pos < x_max_pos) {
            x_pos += x_speed_inc * (z_speed / z_max_speed);
            if (x_pos > x_max_pos) {
                x_pos = x_max_pos;
            }
        }
    }
    
    // Bounce the car, based on the current speed
    player.y = game_height - car.height - 25 - (5 * (z_speed / z_max_speed) * Math.random());
    
    // Render the road
    z_pos = (z_pos + z_speed);
    if (z_pos > road_strip_size) {
        // Next segment
        current_segment += 1;
        if (current_segment >= track.length) {
            current_segment = 0;
        }
        z_pos = z_pos % road_strip_size;
    }
    
    var z = z_pos, z_inc = 1, z_cur = 0, segment = current_segment;
    
    area.y = game_height - 1;
    var cur_x = 0, cur_x_inc = 0;
    cur_x_inc = -track[segment].curve * (z / road_strip_size);

    for (var y = game_height - 1; y >= 0 && area.y > 215; y--) {
        area.y = y;
        z_cur += z_inc;
        z = (z + z_cur);
        
        if (z > road_strip_size) {
            cur_x += cur_x_inc;
            cur_x_inc += track[segment].curve;
            // Next segment
            segment += 1;
            if (segment >= track.length) {
                segment = 0;
            }
            
            z = z % road_strip_size;
        }

        var proportion = z / road_strip_size;
        var cur_x_add = cur_x_inc * proportion;
            
        bmd.copyRect(track[segment].texture, area, cur_x + cur_x_add + x_pos, y);
    }

    hills.tilePosition.x = 0 + x_pos;        
}

var game = new Phaser.Game(game_width, game_height, Phaser.AUTO, '', {
        preload: preload,
        create: create,
        update: update
    });

