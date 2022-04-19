
import { _decorator, Component, Node, tween, v3, randomRangeInt, Vec3, BoxCollider2D, Contact2DType, Collider2D, IPhysics2DContact } from 'cc';
import { randomInt } from 'crypto';
const { ccclass, property } = _decorator;

/**
 * Predefined variables
 * Name = Enemy
 * DateTime = Mon Apr 18 2022 21:53:01 GMT+0700 (Indochina Time)
 * Author = wymmndp
 * FileBasename = Enemy.ts
 * FileBasenameNoExtension = Enemy
 * URL = db://assets/script/Enemy.ts
 * ManualUrl = https://docs.cocos.com/creator/3.3/manual/en/
 *
 */
 
@ccclass('Enemy')
export class Enemy extends Component {
    // [1]
    // dummy = '';

    // [2]
    // @property
    // serializableDummy = 0;

    damage: number = 0
    speed: number = 0
    id: string = ""

    boxCollider: BoxCollider2D = null

    start () {
        tween(this.node).repeatForever(
            tween(this.node)
                .to(this.speed, {position: v3(0,75,0).add(this.node.position)})
                .to(this.speed, {position: v3(0,-75,0).add(this.node.position)})
        ).start()
    }

    // update (deltaTime: number) {
    //     // [4]
    // }
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
