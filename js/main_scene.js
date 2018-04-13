class MainScene extends Phaser.Scene {
	constructor() {
		super({
			key: 'MainScene'
		})
	}

	preload () {
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

	create () {
		this.score = 0
		this.gameOver = false

		this.themeSound = this.sound.add('theme')
		this.gameOverSound = this.sound.add('gameover')
		this.jumpSound = this.sound.add('jump')
		this.levelUpSound = this.sound.add('levelup')
		this.starSound = this.sound.add('star')

		this.themeSound.play({loop: true})
		this.add.image(400, 300, 'sky')
		this.platforms = this.physics.add.staticGroup()

		this.platforms.create(400, 568, 'ground').setScale(2).refreshBody()
		this.platforms.create(600, 400, 'ground')
		this.platforms.create(50, 250, 'ground')
		this.platforms.create(750, 220, 'ground')

		this.player = this.physics.add.sprite(100, 450, 'dude')
		this.player.setBounce(0.2)
		this.player.setCollideWorldBounds(true)

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

		this.cursors = this.input.keyboard.createCursorKeys()

		this.stars = this.physics.add.group({
			key: 'star',
			repeat: 11,
			setXY: { x: 12, y: 0, stepX: 70 }
		})

		this.stars.children.iterate(function (child) {
			child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8))
		})

		this.bombs = this.physics.add.group()
		this.scoreText = this.add.text(16, 16, 'Linhas de código: 0', { fontSize: '32px', fill: '#000' })

		this.physics.add.collider(this.player, this.platforms)
		this.physics.add.collider(this.stars, this.platforms)
		this.physics.add.collider(this.bombs, this.platforms)
		this.physics.add.overlap(this.player, this.stars, this.collectStar, null, this)
		this.physics.add.collider(this.player, this.bombs, this.hitBomb, null, this)
	}

	update () {
		if (this.gameOver) {
			return
		}

		if (this.cursors.left.isDown) {
			this.player.setVelocityX(-160)
			this.player.anims.play('left', true)
		}
		else if (this.cursors.right.isDown) {
			this.player.setVelocityX(160)
			this.player.anims.play('right', true)
		}
		else {
			this.player.setVelocityX(0)
			this.player.anims.play('turn')
		}

		if (this.cursors.up.isDown && this.player.body.touching.down) {
			this.jumpSound.play()
			this.player.setVelocityY(-330)
		}
	}

	collectStar (player, star) {
		star.disableBody(true, true)
		this.score += 10
		this.scoreText.setText('Linhas de código: ' + this.score)

		if (this.stars.countActive(true) === 0) {
			this.levelUpSound.play()
			this.stars.children.iterate(function (child) {
				child.enableBody(true, child.x, 0, true, true)
			})
			const x = (this.player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400)
			const bomb = this.bombs.create(x, 16, 'bomb')
			bomb.setBounce(1)
			bomb.setCollideWorldBounds(true)
			bomb.setVelocity(Phaser.Math.Between(-200, 200), 20)
			bomb.allowGravity = false
		}
		else {
			this.starSound.play()
		}
	}

	hitBomb (player, bomb) {
		this.gameOverSound.play()
		this.themeSound.stop()
		this.physics.pause()
		this.player.setTint(0xff0000)
		this.player.anims.play('turn')
		this.gameOver = true
	}
}
