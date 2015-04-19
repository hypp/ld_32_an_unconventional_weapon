var theGame = function(game){
    // Track data
    track = [];
    road_strip_size = 1024 * 4;
    current_segment = 0;
    
    // Player
    z_pos = 0;
    z_speed = 0;
    z_speed_inc = 8;
    z_max_speed = 1024;
    
    x_pos = 0;
    x_speed_inc = 2;
    x_max_pos = 256;
    x_min_pos = -256;
    
    // HUD
    fuel = 100;
    fuel_consumtion = 1.5;
    bird_energy_contents = 0.9;
    bird_kills = 0;

    // Birds
    birds = [];
    coughs = [];
}

theGame.prototype = {
    
    ease_in: function(a, b, percent) {
        return a + (b - a) * Math.pow(percent, 2);
    },

    ease_out: function(a, b, percent) {
        return a + (b - a) * (1 - Math.pow(1 - percent, 2));
    },

    ease_in_out: function(a, b, percent) {
        return a + (b - a) * ((-Math.cos(percent * Math.PI) / 2) + 0.5);
    },

    add_segment: function(curve, y, texture) {
        track.push({
            curve: curve,
            y: y,
            z: 0,// Not really used or?
            texture: texture
        });
    },

    create_track: function() {
        var i, j, curve;

        for (j = 0; j < 2; j += 1) {
            this.add_segment(0, 0, 'road_light');
        }

        // Just add a start line
        for (j = 0; j < 2; j += 1) {
            this.add_segment(0, 0, 'road_start');
        }

        // Enter the curve
        for (i = 0; i < 40; i += 1) {
            curve = this.ease_in(0, 10, i / 40);
            if (track.length % 4 < 2) {
                this.add_segment(curve, 0, 'road_light');
            } else {
                this.add_segment(curve, 0, 'road_dark');
            }
        }

        for (i = 0; i < 50; i += 1) {
            if (track.length % 4 < 2) {
                this.add_segment(1, 0, 'road_light');
            } else {
                this.add_segment(1, 0, 'road_dark');
            }
        }

        // Leave the curve
        for (i = 0; i < 40; i += 1) {
            curve = this.ease_out(10, 0, i / 40);
            if (track.length % 4 < 2) {
                this.add_segment(curve, 0, 'road_light');
            } else {
                this.add_segment(curve, 0, 'road_dark');
            }
        }

        for (i = 0; i < 50; i += 1) {
            if (track.length % 4 < 2) {
                this.add_segment(0, 0, 'road_light');
            } else {
                this.add_segment(0, 0, 'road_dark');
            }
        }

        // Enter the curve
        for (i = 0; i < 30; i += 1) {
            curve = this.ease_in(0, -10, i / 30);
            if (track.length % 4 < 2) {
                this.add_segment(curve, 0, 'road_light');
            } else {
                this.add_segment(curve, 0, 'road_dark');
            }
        }

        for (i = 0; i < 50; i += 1) {
            if (track.length % 4 < 2) {
                this.add_segment(0, 0, 'road_light');
            } else {
                this.add_segment(0, 0, 'road_dark');
            }
        }

        // Leave the curve
        for (i = 0; i < 40; i += 1) {
            curve = this.ease_out(-5, 0, i / 40);
            if (track.length % 2 < 1) {
                this.add_segment(curve, 0, 'road_light');
            } else {
                this.add_segment(curve, 0, 'road_dark');
            }
        }

        for (i = 0; i < 50; i += 1) {
            for (j = 0; j < 2; j += 1) {
                this.add_segment(0, 0, 'road_light');
            }
            for (j = 0; j < 2; j += 1) {
                this.add_segment(0, 0, 'road_dark');
            }
        }


    },
    
    l_bird_move_right: function(bird) {
        var tm = Math.random() * 3500 + 1500;
        bird.mol.tween = this.game.add.tween(bird).to({ x: (game_width - car_width) / 2 }, tm, Phaser.Easing.Linear.Elastic, true);
        bird.scale.x = 1;
        bird.mol.tween.onComplete.addOnce(this.l_bird_move_left, this);
    },

    l_bird_move_left: function(bird) {
        var tm = Math.random() * 3500 + 1500;
        bird.mol.tween = this.game.add.tween(bird).to({ x: 0 }, tm, Phaser.Easing.Linear.Elastic, true);
        bird.scale.x = -1;
        bird.mol.tween.onComplete.addOnce(this.l_bird_move_right, this);
    },

    r_bird_move_right: function(bird) {
        var tm = Math.random() * 3500 + 1500;
        bird.mol.tween = this.game.add.tween(bird).to({ x: game_width }, tm, Phaser.Easing.Linear.Elastic, true);
        bird.scale.x = 1;
        bird.mol.tween.onComplete.addOnce(this.r_bird_move_left, this);
    },

    r_bird_move_left: function(bird) {
        var tm = Math.random() * 3500 + 1500;
        bird.mol.tween = this.game.add.tween(bird).to({ x: (game_width + car_width) / 2 }, tm, Phaser.Easing.Linear.Elastic, true);
        bird.scale.x = -1;
        bird.mol.tween.onComplete.addOnce(this.r_bird_move_right, this);
    },

    restart_bird: function(bird) {
        if (bird.mol.tween != null) {
            bird.mol.tween.stop();
        }
        bird.y = 100 + Math.random() * (game_height / 2);
        bird.mol.life = 0;

        if (Math.floor(Math.random() * 2) === 0) {
            bird.x = -bird_width;
            this.l_bird_move_right(bird);
        } else {
            bird.x = game_width + bird_width;
            this.r_bird_move_left(bird);
        }
    },

    every_second: function() {
        fuel -= fuel_consumtion * (z_speed / z_max_speed);
        if (fuel < 0) {
            fuel = 0;
        }
    },
    
  	create: function(){
        this.game.physics.startSystem(Phaser.Physics.ARCADE);
        this.game.stage.backgroundColor = '#000000';

        this.create_track();

        sky = this.game.add.sprite(0, 0, 'sky');
        var tmp_clouds = this.game.cache.getImage('clouds');
        clouds = this.game.add.tileSprite(0, 0, tmp_clouds.width, tmp_clouds.height, 'clouds', 0);
        var tmp_hills = this.game.cache.getImage('hills');
        hills = this.game.add.tileSprite(0, 0, tmp_hills.width, tmp_hills.height, 'hills', 0);
        var tmp_trees = this.game.cache.getImage('trees');
        trees = this.game.add.tileSprite(0, 0, tmp_trees.width, tmp_trees.height, 'trees', 0);

        bmd = this.game.make.bitmapData(game_width, game_height);
        bmd.addToWorld();

        area = new Phaser.Rectangle(0, 0, game_width, 1);

        cursors = this.game.input.keyboard.createCursorKeys();

        speed_text = this.game.add.text(8, 8, 'speed: ' + z_speed, { fontSize: '16px', fill: '#000' });
        fuel_text = this.game.add.text(8, 8 + 16, 'fuel reserve: ' + fuel, { fontSize: '16px', fill: '#000' });
        kill_text = this.game.add.text(8, 8 + 16 + 16, 'kills: ' + bird_kills, { fontSize: '16px', fill: '#000' });

        var i;
        for (i = 0; i < 10; i += 1) {
            var bird = this.game.add.sprite(50, 100, 'bird', 1);
            bird.animations.add('flap', [0, 1, 2, 1], 4, true);
            bird.animations.play('flap');
            bird.anchor.setTo(0.5);
            bird.mol = {};
            this.game.physics.enable(bird, Phaser.Physics.ARCADE);
            this.restart_bird(bird);
            birds.push(bird);
        }


        blood_group = this.game.add.group();

        var car_shadow = this.game.cache.getImage('car_shadow');
        shadow = this.game.add.sprite((game_width - car_shadow.width) / 2, game_height - car_shadow.height - 5, 'car_shadow');
        player = this.game.add.sprite((game_width - car_width) / 2, game_height - car_height - 10, 'car', 1);

        player.animations.add('driving', [0, 1], 10, true);
        this.game.physics.enable(player, Phaser.Physics.ARCADE);

        this.game.camera.follow(player, Phaser.Camera.FOLLOW_TOPDOWN);

        smoke_emitter = this.game.add.emitter(0, 0, 100);

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

        this.game.sound.play('music', 0.8, true);

        var name, cough;
        for (i = 1; i < 13; i += 1) {
            name = 'cough_' + i;
            cough = this.game.sound.add(name, 0.3);
            coughs.push(cough);
        }

        engine_roar = this.game.sound.add('engine_roar', 0.1);

        var tm = this.game.time.create();
        tm.loop(1000, this.every_second);
        tm.start(2000);
	},
    
    bird_and_smoke: function(bird, smoke) {
        var i;

        bird.y += 0.4;

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
    },

    bird_and_player: function(bird, player) {
        // Add score
        fuel += bird_energy_contents;
        bird_kills += 1;

        // make the bird explode
        var emitter = this.game.add.emitter(bird.x, bird.y, 100);
        emitter.makeParticles('blood');
        emitter.minParticleSpeed.setTo(-200, -200);
        emitter.maxParticleSpeed.setTo(200, 200);
        emitter.gravity = 100;
        emitter.setRotation(-150, 150);
        emitter.setAlpha(1.0, 0.0, 1500);
        emitter.start(true, 3000, null, 100);

        blood_group.add(emitter);

        var i;
        for (i = 0; i < coughs.length; i += 1) {
            coughs[i].stop();
        }

        this.game.sound.play('explosion', 1.0, false);

        // kill and respawn
        this.restart_bird(bird);
    },    
    
    
    update: function() {
        var i;
        for (i = 0; i < birds.length; i += 1) {
            this.game.physics.arcade.overlap(birds[i], smoke_emitter, this.bird_and_smoke, null, this);
            // Only check collisions if we are moving
            if (z_speed > 0) {
                this.game.physics.arcade.overlap(birds[i], player, this.bird_and_player, null, this);
            }
        }

        if (cursors.up.isDown) {
            if (!engine_roar.isPlaying) {
                engine_roar.play();
            }

            z_speed += z_speed_inc;
            if (z_speed > z_max_speed) {
                z_speed = z_max_speed;
            }
        } else {
            z_speed -= 1;
            if (z_speed < 0) {
                z_speed = 0;
            }
        }

        if (cursors.down.isDown && z_speed > 0) {
            z_speed -= z_speed_inc;
            if (z_speed < 0) {
                z_speed = 0;
            }
        }

        // Can't drive if out of fuel
        if (fuel === 0) {
            z_speed = 0;
        }

        speed_text.text = 'speed: ' + Math.floor(250 * (z_speed / z_max_speed));
        fuel_text.text = 'fuel reserve: ' + Math.floor(fuel);
        kill_text.text = 'kills: ' + bird_kills;

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

        x_pos += (track[segment].curve * 0.6) * (z_speed / z_max_speed);
        if (x_pos > x_max_pos) {
            x_pos = x_max_pos;
        }
        if (x_pos < x_min_pos) {
            x_pos = x_min_pos;
        }

        player.x = (game_width - car_width) / 2 - x_pos;
        shadow.x = (game_width - shadow.width) / 2 - x_pos;

        clouds.tilePosition.x += 0 - 0.5 * (z_speed / z_max_speed) * track[current_segment].curve;
        hills.tilePosition.x += 0 - 1.0 * (z_speed / z_max_speed) * track[current_segment].curve;
        trees.tilePosition.x += 0 - 2.0 * (z_speed / z_max_speed) * track[current_segment].curve;

        smoke_emitter.x = player.x + car_width - 32;
        smoke_emitter.y = player.y + car_height - 32;
        
    }
}
