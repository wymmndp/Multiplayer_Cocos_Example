
import { _decorator, Component, systemEvent, EventKeyboard, SystemEvent, KeyCode, v3, Vec3, Prefab, instantiate, EventMouse, UITransform, tween, Event, Vec2, v2, CircleCollider2D, Collider2D, IPhysics2DContact, Contact2DType } from 'cc';
const { ccclass, property } = _decorator;

/**
 * Predefined variables
 * Name = Player
 * DateTime = Tue Apr 12 2022 13:57:43 GMT+0700 (Indochina Time)
 * Author = wymmndp
 * FileBasename = player.ts
 * FileBasenameNoExtension = player
 * URL = db://assets/script/player.ts
 * ManualUrl = https://docs.cocos.com/creator/3.3/manual/en/
 *
 */
 
@ccclass('Player')
export class Player extends Component {
    
    @property speed: number = 0
    @property(Prefab) bullet: Prefab = undefined
    
    action = null
    indexColor: number = 0
    playerId: string = ""
    isMe: boolean = false

    circleCollider: CircleCollider2D = null

    onLoad() {
      
    }

    update (deltaTime: number) {
        switch(this.action) {
            case KeyCode.ARROW_UP:
                this.node.position = this.node.position.add(Vec3.UP).add3f(0,this.speed,0)
                break
            case KeyCode.ARROW_DOWN:
                this.node.position = this.node.position.subtract(Vec3.UP).subtract3f(0,this.speed,0)
                break
            case KeyCode.ARROW_RIGHT:
                this.node.position = this.node.position.add(Vec3.RIGHT).add3f(this.speed,0,0)
                break
            case KeyCode.ARROW_LEFT:
                this.node.position = this.node.position.subtract(Vec3.RIGHT).subtract3f(this.speed,0,0)
                break
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
