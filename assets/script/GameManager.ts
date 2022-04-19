
import { _decorator, Component, Node, SystemEvent, EventMouse, instantiate, Prefab, UITransformComponent, v3, random, randomRangeInt, UITransform, systemEvent, EventKeyboard, KeyCode, Vec3, tween, Collider2D, IPhysics2DContact, CircleCollider2D, Contact2DType, BoxCollider2D } from 'cc';
const { ccclass, property } = _decorator;

import Colyseus from '../../extensions/colyseus-sdk/runtime/colyseus.js';
import { Enemy } from './Enemy';
import { Player } from './player';


/**
 * Predefined variables
 * Name = GameManager
 * DateTime = Tue Apr 12 2022 15:11:20 GMT+0700 (Indochina Time)
 * Author = wymmndp
 * FileBasename = GameManager.ts
 * FileBasenameNoExtension = GameManager
 * URL = db://assets/script/GameManager.ts
 * ManualUrl = https://docs.cocos.com/creator/3.3/manual/en/
 *
 */
 
@ccclass('GameManager')
export class GameManager extends Component {

    @property hostname = "localhost";
    @property port = 2567;
    @property useSSL = false;

    client!: Colyseus.Client;
    room!: Colyseus.Room;

    isHost = false
    
    @property({type: Node}) spawnPos: Node[] = []
    @property({type: Prefab}) playerPrefab: Prefab[] = []
    @property({type: Prefab}) bulletPrefab: Prefab[] = []
    @property({type: Node}) gameCanvas: Node = undefined
    @property({type: Prefab}) enemyPrefab: Prefab = undefined

    players: Player[] = []
    enemys: Enemy[] = []
    myPlayer: Player 

    start() {
        this.client = new Colyseus.Client(`${this.useSSL ? "wss" : "ws"}://${this.hostname}${([443, 80].includes(this.port) || this.useSSL) ? "" : `:${this.port}`}`);
    
        this.connect()
    }

    async connect() {
        try {
            this.room = await this.client.joinOrCreate("battleroom");

            this.room.onStateChange((state) => {

                if(state.message.substring(0, 12) == "PLAYER_LEFT:") {
                    var playerID = state.message.substring(12)
                    if(this.players[playerID]) {
                        this.gameCanvas.removeChild(this.players[playerID].node)
                        delete this.players[playerID]
                    }
                }

                if(state.message.split("_")[0] == "DESTROY") {
                    if(this.enemys[state.message.split("_")[1]]) {
                        this.gameCanvas.removeChild(this.enemys[state.message.split("_")[1]].node)
                        delete this.enemys[state.message.split("_")[1]]
                    }
                }
                
                if(state.bullets.length > 0) {
                    state.bullets.forEach((bullet: any) => {
                        const bl = instantiate(this.bulletPrefab[bullet.indexColor])
                        bl.name = "Bullet"
                        state.bullets.splice(0, 1)
                        bl.setPosition(v3(bullet.fromX, bullet.fromY, 0))
                        this.gameCanvas.addChild(bl)
                        const mousePosition = this.gameCanvas.getComponent(UITransform).convertToNodeSpaceAR(v3(bullet.toX, bullet.toY,0))
                        tween(bl)
                            .to(0.3, {position: mousePosition})
                            .call(() => {
                                setTimeout(() => {
                                    bl.destroy()
                                }, 1000)
                            })
                            .start()
                    });
                }

                state.enemys.forEach((enemy: any) => {
                    var e: Enemy
                    if(this.enemys[enemy.id] != undefined) {
                        e = this.enemys[enemy.id]
                    } else {
                        const newEnemy = instantiate(this.enemyPrefab)
                        newEnemy.setPosition(v3(enemy.x, enemy.y, 0))
                        this.gameCanvas.addChild(newEnemy)
                        newEnemy.getComponent(Enemy).speed = 1
                        newEnemy.getComponent(Enemy).damage = 5
                        newEnemy.getComponent(Enemy).id = enemy.id
                        e = newEnemy.getComponent(Enemy)
                        this.enemys[enemy.id] = e
                        // state.enemys.splice(0, 1)
                        newEnemy.getComponent(BoxCollider2D).on(Contact2DType.BEGIN_CONTACT, this.onBeginContactBullet, this)
                    }
                });


                if(this.isHost) return
                
                
                state.players.forEach((player: any) => {
                    var p: Player
                    if(this.players[player.playerID] != undefined) {
                        p = this.players[player.playerID]
                    } else {
                        const otherPlayer = instantiate(this.playerPrefab[player.indexColor])
                        otherPlayer.position = v3(player.x,player.y,0)
                        p = otherPlayer.getComponent(Player)
                        this.players[player.playerID] = p 
                        this.gameCanvas.addChild(otherPlayer)
                        if(this.room.sessionId == player.playerID) {
                            p.playerId = player.playerID
                            p.indexColor = player.indexColor
                            p.isMe = true
                            this.myPlayer = p

                            this.myPlayer.circleCollider = this.myPlayer.node.getComponent(CircleCollider2D)
                            this.myPlayer.circleCollider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this)

                            systemEvent.on(SystemEvent.EventType.KEY_DOWN, this.onKeyboardDown, this)
                            systemEvent.on(SystemEvent.EventType.KEY_UP, this.onKeyboardUp, this)
                            systemEvent.on(SystemEvent.EventType.MOUSE_DOWN, this.onMouseDown, this)
                        }
                    }

                    p.node.position = new Vec3(player.x, player.y, 0);
                    // p.serverPosition = new Vec3(player.x, player.y, 0);
                    // p.syncTime = 0;
                })

            });

            this.room.onMessage("PlayerAction", (data) => {
                console.log("PlayerAction: ", data);

                if(this.isHost && this.players[data.id]) {
                    if(data.actionData.action == "INPUT_START") {
                        this.players[data.id].action = data.actionData.key;
                    } else if(data.actionData.action == "INPUT_END") {
                        this.players[data.id].action = null;
                        // Sync by server or client, because delay form client & 0.1 sec host update
                        this.players[data.id].node.position = new Vec3(data.actionData.x, data.actionData.y, 0);
                    }
                }
            });

            this.room.onMessage("Shooting", (data) => {
                console.log(data)
            })

            this.room.onMessage("DestroyEnemy", (data) => {
                if(this.enemys[data.id]) {
                    this.gameCanvas.removeChild(this.enemys[data.id].node)
                    delete this.enemys[data.id]
                }
            })


            this.room.onMessage('PlayerJoinSuccess', (data) => {
                // console.log(data) // isHost and sessionId

                this.isHost = !this.isHost ? data.host : true
                
                if(this.isHost) {
                    const player = this.CreatePlayer(data)

                    this.room.send("CreatePlayer", {
                        id: data.id,
                        x: player.position.x,
                        y: player.position.y,
                        indexColor: player.getComponent(Player).indexColor
                    })
                }


            })

            this.room.onLeave((code) => {
                // console.log("onLeave:", code);
            });

        } catch (e) {
            console.error(e);
        }
    }

    update (deltaTime: number) {
        var me = this;
        var syncPlayers = [];
        Object.keys(this.players).forEach(function(key) {
            var p = me.players[key];
            syncPlayers.push({ id: p.playerId, x: p.node.position.x, y: p.node.position.y, hp: 1 })
        })
        
        this.room.send("UpdateState", {
            players: syncPlayers,
        })
    }

    CreatePlayer(data: any): Node {
        if(this.players[data.id] != undefined) {
            return;
        }

        const randomCharacter = this.getRandomCharacter()
        const randomPos = randomRangeInt(0, this.spawnPos.length)

        const player = instantiate(this.playerPrefab[randomCharacter])
        var playerClass = player.getComponent(Player)
        playerClass.indexColor = randomCharacter
        playerClass.playerId = data.id
        this.players[data.id] = playerClass
        player.setPosition(this.spawnPos[randomPos].position)
        this.gameCanvas.addChild(player)

        if(this.room.sessionId == data.id) {
            playerClass.isMe = true
            this.myPlayer = playerClass

            this.myPlayer.circleCollider = this.myPlayer.node.getComponent(CircleCollider2D)
            this.myPlayer.circleCollider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this)

            systemEvent.on(SystemEvent.EventType.KEY_DOWN, this.onKeyboardDown, this)
            systemEvent.on(SystemEvent.EventType.KEY_UP, this.onKeyboardUp, this)
            systemEvent.on(SystemEvent.EventType.MOUSE_DOWN, this.onMouseDown, this)
        }

        this.playerPrefab[randomCharacter] = undefined
        this.spawnPos.splice(randomPos, 1)

        return player
    }
    

    onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) { 
        if(otherCollider.name == "spawnEnemy<BoxCollider2D>") {
            this.room.send("NewEnemy", {
                id: Date.now().toString(36),
                speed: 5,
                damage: 5,
                x: otherCollider.node.position.x,
                y: otherCollider.node.position.y
            })
        }
    }

    onBeginContactBullet(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {  
        if(otherCollider.name == "Bullet<CircleCollider2D>") {
            setTimeout(() => {
                otherCollider.node.destroy()
            }, 1)
            this.room.send('DestroyEnemy', {
                id: selfCollider.node.getComponent(Enemy).id
            })
        }
    }

    onMouseDown(event: EventMouse) {
        if(this.myPlayer == undefined) return;

        const location = event.getLocation()
        console.log(this.myPlayer.node.name, this.myPlayer.circleCollider)

        this.room.send("Shooting", {
            playerId: this.myPlayer.playerId,
            indexColor: this.myPlayer.indexColor,
            fromX: this.myPlayer.node.position.x,
            fromY: this.myPlayer.node.position.y,
            toX: location.x,
            toY: location.y,
            damage: 3
        });
        

    }

    getRandomCharacter(): number {
        const allEqual = (arr: any[]) => arr.every( (v: any) => v === arr[0] )
        if(allEqual(this.playerPrefab)) return
        const randomNum = randomRangeInt(0, this.playerPrefab.length)
        if(this.playerPrefab[randomNum] === undefined) {
            return this.getRandomCharacter()
        } else {
            return randomNum
        }
    }

    onKeyboardDown(event: EventKeyboard) {
        if(this.myPlayer == undefined) return;
        this.myPlayer.action = event.keyCode

        if(!this.isHost) {
            this.room.send("PlayerAction", {
                action: "INPUT_START",
                key: event.keyCode,
            });
        }
    }
    onKeyboardUp(event: EventKeyboard) {
        if(this.myPlayer == undefined) return;
        this.myPlayer.action = null

        if(!this.isHost) {
            this.room.send("PlayerAction", {
                action: "INPUT_END",
                x: this.myPlayer.node.position.x,
                y: this.myPlayer.node.position.y
            });
        }
    }

}

/**
 * [1] Class member could be defined like this.
 * [2] Use `property` decorator if your want the member to be serializable.
 * [3] Your initialization goes here.
 * [4] Your update function goes here.
 *
 * Learn more about scripting: https://docs.cocos.com/creator/3.3/manual/en/scripting/
 * Learn more about CCClass: https://docs.cocos.com/creator/3.3/manual/en/scripting/ccclass.html
 * Learn more about life-cycle callbacks: https://docs.cocos.com/creator/3.3/manual/en/scripting/life-cycle-callbacks.html
 */
