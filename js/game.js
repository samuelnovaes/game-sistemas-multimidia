const config = {
	type: Phaser.AUTO,
	width: 800,
	height: 600,
	parent: 'game',
	physics: {
		default: 'arcade',
		arcade: {
			gravity: { y: 300 },
			debug: false
		}
	},
	scene: [
		MainScene
	]
}

const game = new Phaser.Game(config)
