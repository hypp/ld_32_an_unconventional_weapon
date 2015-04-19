var intro = function(game){
    msg = [
        30, 'An Unconventional Weapon',
        10, 'For Ludum Dare 32, by Mathias Olsson',
        16, '',
        18, 'Background',
        16, 'FACT: The worlds reserve of fossil fuels is depleting.',
        16, 'FACT: As you most likely have heard, fossil fuels consists of dead dinosaurs',
        16, 'FACT: The only living relative to the dinosaurs are the birds.',
        16, 'CONCLUSION: Logically, to refill the reserve, you must kill as many birds as possible.',
        16, '',
        18, 'Instructions',
        16, 'The exhausts from your car will make the birds sick so they fly lower.',
        16, 'When they fly low enough you can run over them with your car.',
        16, 'But if you go to fast you use up more of the worlds fuel reserve.',
        16, '',
        16, 'Use arrow keys to control the car.',
        16, '',
        24, 'Press SPACE to begin'
    ];
}

intro.prototype = {
  	create: function(){
        
        var x = 8;
        var y = 8;
        
        var i;
        for (i = 0; i < msg.length; i += 2) {
            this.game.add.text(x, y, msg[i + 1], { fontSize: msg[i] + 'px', fill: '#76eaf0' });
            y += msg[i] * 1.5;
        }
        
        fireButton = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        fireButton.onDown.add(this.playTheGame, this);
	},
	playTheGame: function(){
		this.game.state.start("TheGame");
	}
}