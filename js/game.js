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
	scene: {
		preload: preload,
		create: create,
		update: update
	}
}

let player
let stars
let bombs
let platforms
let cursors
let score = 0
let gameOver = false
let scoreText
let themeSound
let gameOverSound
let jumpSound
let levelUpSound
let starSound

const game = new Phaser.Game(config)

function preload ()
{
	this.load.image('sky', 'assets/img/sky.png')
	this.load.image('ground', 'assets/img/platform.png')
	this.load.image('star', 'assets/img/star.png')
	this.load.image('bomb', 'assets/img/bomb.png')
	this.load.spritesheet('dude', 'assets/img/dude.png', { frameWidth: 32, frameHeight: 45 })
	this.load.audio('theme', 'assets/sounds/theme.mp3')
	this.load.audio('gameover', 'assets/sounds/gameover.mp3')
	this.load.audio('jump', 'assets/sounds/jump.mp3')
	this.load.audio('levelup', 'assets/sounds/levelup.mp3')
	this.load.audio('star', 'assets/sounds/star.mp3')
}

function create ()
{
	themeSound = this.sound.add('theme')
	gameOverSound = this.sound.add('gameover')
	jumpSound = this.sound.add('jump')
	levelUpSound = this.sound.add('levelup')
	starSound = this.sound.add('star')

	themeSound.play({loop: true})
	this.add.image(400, 300, 'sky')
	platforms = this.physics.add.staticGroup()

	platforms.create(400, 568, 'ground').setScale(2).refreshBody()
	platforms.create(600, 400, 'ground')
	platforms.create(50, 250, 'ground')
	platforms.create(750, 220, 'ground')

	player = this.physics.add.sprite(100, 450, 'dude')
	player.setBounce(0.2)
	player.setCollideWorldBounds(true)

	this.anims.create({
		key: 'left',
		frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
		frameRate: 10,
		repeat: -1
	})

	this.anims.create({
		key: 'turn',
		frames: [ { key: 'dude', frame: 4 } ],
		frameRate: 20
	})

	this.anims.create({
		key: 'right',
		frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
		frameRate: 10,
		repeat: -1
	})

	cursors = this.input.keyboard.createCursorKeys()

	stars = this.physics.add.group({
		key: 'star',
		repeat: 11,
		setXY: { x: 12, y: 0, stepX: 70 }
	})

	stars.children.iterate(function (child) {
		child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8))
	})

	bombs = this.physics.add.group()
	scoreText = this.add.text(16, 16, 'Linhas de código: 0', { fontSize: '32px', fill: '#000' })

	this.physics.add.collider(player, platforms)
	this.physics.add.collider(stars, platforms)
	this.physics.add.collider(bombs, platforms)
	this.physics.add.overlap(player, stars, collectStar, null, this)
	this.physics.add.collider(player, bombs, hitBomb, null, this)
}

function update () {
	if (gameOver) {
		return
	}

	if (cursors.left.isDown) {
		player.setVelocityX(-160)
		player.anims.play('left', true)
	}
	else if (cursors.right.isDown) {
		player.setVelocityX(160)
		player.anims.play('right', true)
	}
	else {
		player.setVelocityX(0)
		player.anims.play('turn')
	}

	if (cursors.up.isDown && player.body.touching.down) {
		jumpSound.play()
		player.setVelocityY(-330)
	}
}

function collectStar (player, star) {
	star.disableBody(true, true)
	score += 10
	scoreText.setText('Linhas de código: ' + score)

	if (stars.countActive(true) === 0) {
		levelUpSound.play()
		stars.children.iterate(function (child) {
			child.enableBody(true, child.x, 0, true, true)
		})
		const x = (player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400)
		const bomb = bombs.create(x, 16, 'bomb')
		bomb.setBounce(1)
		bomb.setCollideWorldBounds(true)
		bomb.setVelocity(Phaser.Math.Between(-200, 200), 20)
		bomb.allowGravity = false
	}
	else {
		starSound.play()
	}
}

function hitBomb (player, bomb) {
	gameOverSound.play()
	themeSound.stop()
	this.physics.pause()
	player.setTint(0xff0000)
	player.anims.play('turn')
	gameOver = true
}
