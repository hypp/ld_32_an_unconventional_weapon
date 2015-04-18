
var Phaser = Phaser;

var game_width = 800;
var game_height = 600;

var game;
var player;
var cursors;

var score = 0;
var scoreText;
var bmd;
var area;
var dropTime = 0;

function preload() {
    game.load.image('road_light', 'assets/road_light.png');
    game.load.image('road_dark', 'assets/road_dark.png');
}

function create() {
    
	game.stage.backgroundColor = '#2d2d2d';

	bmd = game.make.bitmapData(game_width, game_height);

	bmd.addToWorld();

	area = new Phaser.Rectangle(0, 0, game_width, 1);

}

var z_pos = 0;
var z_speed = 256;
    
function update() {

    z_pos = (z_pos + z_speed) % (1024*4);
    
    var z = z_pos;
    var z_inc = 1;
    var z_cur = 0;
    
    for (var y = game_height-1; y >= 0; y--) {
        area.y = y;
        z_cur += z_inc;
        z = (z + z_cur) % (1024*4);

        if (z < (512*4)) {
            bmd.copyRect('road_dark', area, 0, y);
        } else {
            bmd.copyRect('road_light', area, 0, y);
        }
    }
}

var game = new Phaser.Game(game_width, game_height, Phaser.AUTO, '', {
        preload: preload,
        create: create,
        update: update
    });

