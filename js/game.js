
"use strict";

// Salamina nr 33

var Phaser = Phaser;

var game_width = 800;
var game_height = 600;

var game;

var sky;
var clouds;
var hills;
var trees;

var car;
var car_height = 154;
var car_width = 232;

var l_bird;
var r_bird;

var bird_width = 40;
var bird_height = 23;
var bird_max_life = 256;

var coughs = [];

var player;
var shadow;
var engine_roar;

var cursors;

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

var road_strip_size = 1024 * 4;

var smoke_emitter;

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
    var i, j, curve;

    for (j = 0; j < 2; j += 1) {
        add_segment(0, 0, 'road_light');
    }
    
    // Just add a start line
    for (j = 0; j < 2; j += 1) {
        add_segment(0, 0, 'road_start');
    }
    
    // Enter the curve
    for (i = 0; i < 40; i += 1) {
        curve = ease_in(0, 10, i / 40);
        if (track.length % 4 < 2) {
            add_segment(curve, 0, 'road_light');
        } else {
            add_segment(curve, 0, 'road_dark');
        }
    }

    for (i = 0; i < 50; i += 1) {
        if (track.length % 4 < 2) {
            add_segment(1, 0, 'road_light');
        } else {
            add_segment(1, 0, 'road_dark');
        }
    }
    
    // Leave the curve
    for (i = 0; i < 40; i += 1) {
        curve = ease_out(10, 0, i / 40);
        if (track.length % 4 < 2) {
            add_segment(curve, 0, 'road_light');
        } else {
            add_segment(curve, 0, 'road_dark');
        }
    }

    for (i = 0; i < 50; i += 1) {
        if (track.length % 4 < 2) {
            add_segment(0, 0, 'road_light');
        } else {
            add_segment(0, 0, 'road_dark');
        }
    }

    // Enter the curve
    for (i = 0; i < 30; i += 1) {
        curve = ease_in(0, -10, i / 30);
        if (track.length % 4 < 2) {
            add_segment(curve, 0, 'road_light');
        } else {
            add_segment(curve, 0, 'road_dark');
        }
    }

    for (i = 0; i < 50; i += 1) {
        if (track.length % 4 < 2) {
            add_segment(0, 0, 'road_light');
        } else {
            add_segment(0, 0, 'road_dark');
        }
    }
    
    // Leave the curve
    for (i = 0; i < 40; i += 1) {
        curve = ease_out(-5, 0, i / 40);
        if (track.length % 2 < 1) {
            add_segment(curve, 0, 'road_light');
        } else {
            add_segment(curve, 0, 'road_dark');
        }
    }
    
    for (i = 0; i < 50; i += 1) {
        for (j = 0; j < 2; j += 1) {
            add_segment(0, 0, 'road_light');
        }
        for (j = 0; j < 2; j += 1) {
            add_segment(0, 0, 'road_dark');
        }
    }
    

}

function load_audio(name, filename) {
    game.load.audio(name, ['assets/' + filename + '.ogg', 'assets/' + filename + '.mp3', 'assets/' + filename + '.wav'], true);
}

function preload() {
    game.load.image('sky', 'assets/sky2.png');
    game.load.image('hills', 'assets/hills.png');
    game.load.image('trees', 'assets/trees.png');
    game.load.image('clouds', 'assets/clouds.png');
    game.load.image('road_light', 'assets/road_light.png');
    game.load.image('road_dark', 'assets/road_dark.png');
    game.load.image('road_start', 'assets/road_start.png');
    game.load.spritesheet('car', 'assets/car.png', car_width, car_height);
    game.load.image('car_shadow', 'assets/car_shadow.png');
    game.load.image('smoke', 'assets/smoke.png');
    game.load.spritesheet('bird', 'assets/bird.png', bird_width, bird_height);
    game.load.image('blood', 'assets/blood.png');

    load_audio('music', 'ld32');
    
    var i, name;
    for (i = 1; i < 13; i += 1) {
        name = 'cough_' + i;
        load_audio(name, name);
    }
    
    load_audio('explosion', 'explosion');
    load_audio('engine_roar', 'engine_roar');
}

function create() {
    
    game.physics.startSystem(Phaser.Physics.ARCADE);
	game.stage.backgroundColor = '#000000';

    create_track();
    
    sky = game.add.sprite(0, 0, 'sky');
    var tmp_clouds = game.cache.getImage('clouds');
    clouds = game.add.tileSprite(0, 0, tmp_clouds.width, tmp_clouds.height, 'clouds', 0);
    var tmp_hills = game.cache.getImage('hills');
    hills = game.add.tileSprite(0, 0, tmp_hills.width, tmp_hills.height, 'hills', 0);
    var tmp_trees = game.cache.getImage('trees');
    trees = game.add.tileSprite(0, 0, tmp_trees.width, tmp_trees.height, 'trees', 0);

	bmd = game.make.bitmapData(game_width, game_height);
	bmd.addToWorld();

	area = new Phaser.Rectangle(0, 0, game_width, 1);
    
    cursors = game.input.keyboard.createCursorKeys();

    speed_text = game.add.text(8, 8, 'speed: 0', { fontSize: '16px', fill: '#000' });
    
    var car_shadow = game.cache.getImage('car_shadow');
    shadow = game.add.sprite((game_width - car_shadow.width) / 2, game_height - car_shadow.height - 5, 'car_shadow');
    player = game.add.sprite((game_width - car_width) / 2, game_height - car_height - 10, 'car', 1);
    
    player.animations.add('driving', [0, 1], 10, true);

    l_bird = game.add.sprite(50, 100, 'bird', 1);
    l_bird.animations.add('flap', [0, 1, 2, 1], 4, true);
    l_bird.animations.play('flap');
    l_bird.anchor.setTo(0.5);
    l_bird.mol = {};
    l_bird.mol.life = 0;
    game.physics.enable(l_bird, Phaser.Physics.ARCADE);
    restart_l_bird(l_bird);

    r_bird = game.add.sprite(50, 100, 'bird', 1);
    r_bird.animations.add('flap', [0, 1, 2, 1], 4, true);
    r_bird.animations.play('flap');
    r_bird.anchor.setTo(0.5);
    r_bird.mol = {};
    r_bird.mol.life = 0;
    game.physics.enable(r_bird, Phaser.Physics.ARCADE);
    restart_r_bird(r_bird);
    
    game.camera.follow(player, Phaser.Camera.FOLLOW_TOPDOWN);
    
    smoke_emitter = game.add.emitter(0, 0, 100);
    
    smoke_emitter.makeParticles('smoke');

    // Emitter should not move
    smoke_emitter.setXSpeed(-50, 50);
    smoke_emitter.setYSpeed(0, 0);

    smoke_emitter.setRotation(-50, 50);
    // Go from transparent to solid in 3000 ms
    smoke_emitter.setAlpha(0.1, 0.8, 3000);
    // Go from small to large in 2000 ms
    smoke_emitter.setScale(0.4, 2, 0.4, 2, 6000, Phaser.Easing.Quintic.Out);
    // 
    smoke_emitter.gravity = -100;

    smoke_emitter.x = player.x + car_width - 32;
    smoke_emitter.y = player.y + car_height - 32;

    game.sound.play('music', 0.8, true);

    var i, name, cough;
    for (i = 1; i < 13; i += 1) {
        name = 'cough_' + i;
        cough = game.sound.add(name, 0.3);
        coughs.push(cough);
    }
    
    engine_roar = game.sound.add('engine_roar', 0.1);
}

function l_bird_move_right(bird) {
    var tm = Math.random() * 2500 + 2500;
    bird.mol.tween = game.add.tween(bird).to({ x: (game_width - car_width) / 2 }, tm, Phaser.Easing.Linear.Elastic, true);
    bird.scale.x = 1;
    bird.mol.tween.onComplete.addOnce(l_bird_move_left, bird);
}

function l_bird_move_left(bird) {
    var tm = Math.random() * 2500 + 2500;
    bird.mol.tween = game.add.tween(bird).to({ x: 0 }, tm, Phaser.Easing.Linear.Elastic, true);
    bird.scale.x = -1;
    bird.mol.tween.onComplete.addOnce(l_bird_move_right, bird);
}

function restart_l_bird(bird) {
    if (bird.mol.tween != null) {
        bird.mol.tween.stop();
    }
    bird.x = -bird_width;
    bird.y = 100;
    bird.mol.life = 0;
    l_bird_move_right(bird);
}

function r_bird_move_right(bird) {
    var tm = Math.random() * 2500 + 2500;
    bird.mol.tween = game.add.tween(bird).to({ x: game_width }, tm, Phaser.Easing.Linear.Elastic, true);
    bird.scale.x = 1;
    bird.mol.tween.onComplete.addOnce(r_bird_move_left, bird);
}

function r_bird_move_left(bird) {
    var tm = Math.random() * 2500 + 2500;
    bird.mol.tween = game.add.tween(bird).to({ x: (game_width + car_width) / 2 }, tm, Phaser.Easing.Linear.Elastic, true);
    bird.scale.x = -1;
    bird.mol.tween.onComplete.addOnce(r_bird_move_right, bird);
}

function restart_r_bird(bird) {
    if (bird.mol.tween != null) {
        bird.mol.tween.stop();
    }
    bird.x = game_width + bird_width;
    bird.y = 100;
    bird.mol.life = 0;
    r_bird_move_left(bird);
}

function restart_bird(bird) {
    if (Math.floor(Math.random() * 2) == 0) {
        restart_l_bird(bird);
    } else {
        restart_r_bird(bird);
    }
}

function bird_and_smoke(a, b) {
    var i;
    
    a.mol.life += 1;
    a.y += 0.4;
    
    if (a.mol.life > bird_max_life) {
        // make the bird explode
        var emitter = game.add.emitter(a.x, a.y, 100);
        emitter.makeParticles('blood');
        emitter.minParticleSpeed.setTo(-200, -200);
        emitter.maxParticleSpeed.setTo(200, 200);
        emitter.gravity = 100;
        emitter.setRotation(-150, 150);
        emitter.setAlpha(1.0, 0.0, 1500);
        emitter.start(true, 3000, null, 100);

        for (i = 0; i < coughs.length; i += 1) {
            coughs[i].stop();
        }

        game.sound.play('explosion', 1.0, false);
        
        // kill and respawn
        restart_bird(a);
    } else {
        var playing = false;
        for (i = 0; i < coughs.length; i += 1) {
            if (coughs[i].isPlaying) {
                playing = true;
                break;
            }
        }
        
        if (!playing) {
            var num = Math.floor(Math.random() * (coughs.length - 1));
            coughs[num].play();
        }
    }
}

function update() {
    
    game.physics.arcade.overlap(l_bird, smoke_emitter, bird_and_smoke, null, this);
    game.physics.arcade.overlap(r_bird, smoke_emitter, bird_and_smoke, null, this);

    if (cursors.up.isDown) {
        if (!engine_roar.isPlaying) {
            engine_roar.play();
        }

        if (z_speed < z_max_speed) {
            z_speed += z_speed_inc;
        }
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
        // Spew smoke
        if (!smoke_emitter.on) {
            smoke_emitter.start(false, 4000, 500);
        }
        
        smoke_emitter.frequency =  50 + 1000 * (1 - (z_speed / z_max_speed));
        
        // Animate car
        player.animations.play('driving');
        player.animations.getAnimation('driving').speed = 15 * (z_speed / z_max_speed);
        
        // Check for movement in x and y
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
    } else {
        smoke_emitter.on = false;
        
        player.animations.stop();
    }
    
    // Bounce the car, based on the current speed
    player.y = game_height - car_height - 25 - (5 * (z_speed / z_max_speed) * Math.random());
    
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
    var y, cur_x = 0, cur_x_inc = 0;
    cur_x_inc = -track[segment].curve * (z / road_strip_size);

    for (y = game_height - 1; y >= 0 && area.y > 215; y -= 1) {
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
            
        bmd.copyRect(track[segment].texture, area, cur_x + cur_x_add, y);
    }

    player.x = (game_width - car_width) / 2 - x_pos;
    shadow.x = (game_width - shadow.width) / 2 - x_pos;
    
    clouds.tilePosition.x += 0 - 0.5 * (z_speed / z_max_speed) * track[current_segment].curve;
    hills.tilePosition.x += 0 - 1.0 * (z_speed / z_max_speed) * track[current_segment].curve;
    trees.tilePosition.x += 0 - 2.0 * (z_speed / z_max_speed) * track[current_segment].curve;

    smoke_emitter.x = player.x + car_width - 32;
    smoke_emitter.y = player.y + car_height - 32;
    
}

var game = new Phaser.Game(game_width, game_height, Phaser.AUTO, '', {
        preload: preload,
        create: create,
        update: update
    });

