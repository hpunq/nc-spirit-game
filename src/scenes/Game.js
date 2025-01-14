import { Scene } from 'phaser';
import { Joint, SpineBox } from '../drawUtils'
import { CharBody } from '../charBody'
const rand = Math.random

export class Game extends Scene
{
    constructor ()
    {
        super('Game');
        this.player = null;
        this.stars = null;
        this.bombs = null;
        this.platforms = null;
        this.cursors = null;
        this.score = 0;
        this.gameOver = false;
        this.scoreText = null;
    }

    preload ()
    {
        this.load.image('sky', './assets/sky.png');
        this.load.image('ground', './assets/platform.png');
        this.load.image('star', './assets/star.png');
        this.load.image('bomb', './assets/bomb.png');
        this.load.spritesheet('dude', './assets/dude.png', { frameWidth: 32, frameHeight: 48 });
        
        this.load.image('head1','./assets/head1.png')
    }
    
    create ()
    {
        this.add.image(400, 300, 'sky');
    
        this.platforms = this.physics.add.staticGroup();
    
        this.platforms.create(400, 568, 'ground').setScale(2).refreshBody();
        this.platforms.create(600, 400, 'ground');
        this.platforms.create(50, 250, 'ground');
        this.platforms.create(750, 220, 'ground');
        
        
        this.player = this.physics.add.sprite(100, 450, 'dude');
    
        this.player.setBounce(0.2);
        this.player.setCollideWorldBounds(true);

        
        // arda's test character bodies for procedural drawing
        this.testCharBody = []
        for (let i = 0; i < 5; i++)
            this.testCharBody.push(new CharBody(this, {x:100 + i * 150, y:580}, {
                height: 150 + rand()*120, // HP, SPD
                bodyWidth: 30 + rand()*30, // HP, DEF
                neckBaseRatio: 0.28 + rand()*0.37, // DEF
                leanForward: rand()**2*20, // ATK
                neckType: 1, // DEF
                
                armLengthRatio: 0.5+rand()*0.2, // SPD
                armWidthRatio: 0.3 + rand()*0.4, // ATK, DEF
                weaponGrip: 1, // ATK, SPD

                animSpeed: 0.8 + rand()*0.4,

                weaponType: 1,
                headType: 1
            }))
        
        // check drawUtils for more info 
    
        this.anims.create({
            key: 'left',
            frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1
        });
    
        this.anims.create({
            key: 'turn',
            frames: [ { key: 'dude', frame: 4 } ],
            frameRate: 20
        });
    
        this.anims.create({
            key: 'right',
            frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
            frameRate: 10,
            repeat: -1
        });
    
        this.cursors = this.input.keyboard.createCursorKeys();

        this.stars = this.physics.add.group({
            key: 'star',
            repeat: 11,
            setXY: { x: 12, y: 0, stepX: 70 }
        });
    
        this.stars.children.iterate(function (child) {
            child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
        });
    
       
        this.bombs = this.physics.add.group();

        this.scoreText = this.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#000' });
        this.physics.add.collider(this.player, this.platforms);
        this.physics.add.collider(this.stars, this.platforms);
        this.physics.add.collider(this.bombs, this.platforms);
        this.physics.add.overlap(this.player, this.stars, this.collectStar, null, this);
        this.physics.add.collider(this.player, this.bombs, this.hitBomb, null, this);

    }
    
    update ()
    {

        for (let i in this.testCharBody) {
            this.testCharBody[i].frameAdvance()
        }

        if (this.gameOver)
        {
            return;
        }
    
        if (this.cursors.left.isDown)
        {
            this.player.setVelocityX(-160);
            this.player.anims.play('left', true);
            for (let i in this.testCharBody) {
                this.testCharBody[i].torso.joints[1].posX -= 3
                this.testCharBody[i].torso.update()
                this.testCharBody[i].torso.draw()
            }
        }
        else if (this.cursors.right.isDown)
        {
            this.player.setVelocityX(160);
            this.player.anims.play('right', true);

            for (let i in this.testCharBody) {
                this.testCharBody[i].torso.joints[1].posX += 3
                this.testCharBody[i].torso.update()
                this.testCharBody[i].torso.draw()
            }
        }
        else
        {
            this.player.setVelocityX(0);
            this.player.anims.play('turn');
        }
    
        if (this.cursors.up.isDown) {
            for (let i in this.testCharBody) {
                this.testCharBody[i].torso.joints[1].posY -= 3
                this.testCharBody[i].torso.update()
                this.testCharBody[i].torso.draw()
            }
        }

        if (this.cursors.down.isDown) {
            for (let i in this.testCharBody) {
                this.testCharBody[i].torso.joints[1].posY += 3
                this.testCharBody[i].torso.update()
                this.testCharBody[i].torso.draw()
            }
        }

        if (this.cursors.up.isDown && this.player.body.touching.down)
        {
            this.player.setVelocityY(-330);
        }
    }
    
    collectStar (player, star)
    {
        star.disableBody(true, true);
    
        this.score += 10;
        this.scoreText.setText('Score: ' + this.score);
    
        if (this.stars.countActive(true) === 0)
        {
            this.stars.children.iterate(function (child) {
                child.enableBody(true, child.x, 0, true, true);
            });
    
            var x = (player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);
            var bomb = this.bombs.create(x, 16, 'bomb');
            bomb.setBounce(1);
            bomb.setCollideWorldBounds(true);
            bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
            bomb.allowGravity = false;
        }
    }
    
    hitBomb (player, bomb)
    {
        this.physics.pause();
        this.player.setTint(0xff0000);
        this.player.anims.play('turn');
        this.gameOver = true;
    }
}
