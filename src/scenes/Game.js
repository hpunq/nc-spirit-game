import { Scene } from 'phaser';
import io from 'socket.io-client';

export class Game extends Scene {
  constructor() {
    super('Game');
    this.socket = null;
    this.player = null;
    this.otherPlayers = {};
    this.stars = null;
    this.bombs = null;
    this.platforms = null;
    this.cursors = null;
    this.score = 0;
    this.scoreText = null;
  }

  preload() {
    this.load.image('sky', './assets/sky.png');
    this.load.image('ground', './assets/platform.png');
    this.load.image('star', './assets/star.png');
    this.load.image('bomb', './assets/bomb.png');
    this.load.spritesheet('dude', './assets/dude.png', { frameWidth: 32, frameHeight: 48 });
  }

  create() {
    this.add.image(400, 300, 'sky');
    this.platforms = this.physics.add.staticGroup();
    this.platforms.create(400, 568, 'ground').setScale(2).refreshBody();
    this.platforms.create(600, 400, 'ground');
    this.platforms.create(50, 250, 'ground');
    this.platforms.create(750, 220, 'ground');

    this.cursors = this.input.keyboard.createCursorKeys();

    this.stars = this.physics.add.group({
      key: 'star',
      repeat: 11,
      setXY: { x: 12, y: 0, stepX: 70 },
    });

    this.stars.children.iterate((child) => {
      child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
    });

    this.bombs = this.physics.add.group();

    this.scoreText = this.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#000' });

    this.physics.add.collider(this.platforms, this.stars);
    this.physics.add.collider(this.platforms, this.bombs);

    this.connectToServer();
  }

  connectToServer() {
    this.socket = io();

    this.socket.on('currentPlayers', (players) => {
      Object.keys(players).forEach((id) => {
        if (id === this.socket.id) {
          this.addNewPlayer(players[id]);
        } else {
          this.addOtherPlayer(id, players[id]);
        }
      });
    });

    this.socket.on('newPlayer', (newPlayer) => {
      this.addOtherPlayer(newPlayer.id, newPlayer);
    });

    this.socket.on('playerUpdated', (playerData) => {
      this.updateOtherPlayer(playerData.id, playerData);
    });

    this.socket.on('playerDisconnected', (id) => {
      if (this.otherPlayers[id]) {
        this.otherPlayers[id].destroy();
        delete this.otherPlayers[id];
      }
    });
  }

  addNewPlayer(playerInfo) {
    this.player = this.physics.add.sprite(playerInfo.x, playerInfo.y, 'dude');
    this.player.setBounce(0.2);
    this.player.setCollideWorldBounds(true);
    this.physics.add.collider(this.player, this.platforms);
    this.physics.add.overlap(this.player, this.stars, this.collectStar, null, this);
    this.physics.add.collider(this.player, this.bombs, this.hitBomb, null, this);
  }

  addOtherPlayer(id, playerInfo) {
    const otherPlayer = this.add.sprite(playerInfo.x, playerInfo.y, 'dude');
    this.otherPlayers[id] = otherPlayer;
  }

  updateOtherPlayer(id, playerInfo) {
    if (this.otherPlayers[id]) {
      this.otherPlayers[id].x = playerInfo.x;
      this.otherPlayers[id].y = playerInfo.y;
    }
  }

  update() {
    if (!this.player) return;

    let moved = false;

    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-160);
      this.player.anims.play('left', true);
      moved = true;
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(160);
      this.player.anims.play('right', true);
      moved = true;
    } else {
      this.player.setVelocityX(0);
      this.player.anims.play('turn');
    }

    if (this.cursors.up.isDown && this.player.body.touching.down) {
      this.player.setVelocityY(-330);
      moved = true;
    }

    if (moved) {
      this.socket.emit('playerMoved', { x: this.player.x, y: this.player.y });
    }
  }
}