
var car_height = 154;
var car_width = 232;

var bird_width = 42;
var bird_height = 23;

var game_width = 800;
var game_height = 600;

var preload = function(game){}

preload.prototype = {
    
    load_audio: function(name, filename) {
        this.game.load.audio(name, ['assets/' + filename + '.ogg', 'assets/' + filename + '.mp3', 'assets/' + filename + '.wav'], true);
    },    
    
	preload: function(){ 
        var loadingBar = this.add.sprite(game_width / 2, game_height / 2,"loading");
        loadingBar.anchor.setTo(0.5,0.5);
        this.load.setPreloadSprite(loadingBar);
        this.game.load.image('sky', 'assets/sky2.png');
        this.game.load.image('hills', 'assets/hills.png');
        this.game.load.image('trees', 'assets/trees.png');
        this.game.load.image('clouds', 'assets/clouds.png');
        this.game.load.image('road_light', 'assets/road_light.png');
        this.game.load.image('road_dark', 'assets/road_dark.png');
        this.game.load.image('road_start', 'assets/road_start.png');
        this.game.load.spritesheet('car', 'assets/car.png', car_width, car_height);
        this.game.load.image('car_shadow', 'assets/car_shadow.png');
        this.game.load.image('smoke', 'assets/smoke.png');
        this.game.load.spritesheet('bird', 'assets/bird.png', bird_width, bird_height);
        this.game.load.image('blood', 'assets/blood.png');

        this.load_audio('music', 'ld32');

        var i, name;
        for (i = 1; i < 13; i += 1) {
            name = 'cough_' + i;
            this.load_audio(name, name);
        }

        this.load_audio('explosion', 'explosion');
        this.load_audio('engine_roar', 'engine_roar');
	},
  	create: function(){
		this.game.state.start("Intro");
	}
}