import { Client } from "colyseus";
import { Schema, Context, MapSchema, type } from "@colyseus/schema";

export class Player extends Schema {
  @type("string") playerID: string;
  @type("boolean") host: boolean = false;
  @type("number") x: number = -10;
  @type("number") y: number = -10;
  @type("number") speed: number = -10;
  @type("number") hp: number = 100;
  @type("number") indexColor: number = 1; 
  
  public client:Client;

  constructor(ID:string, playerClient:Client, isHost:boolean) {
    super();

    this.playerID = ID;
    this.client = playerClient;
    this.host = isHost;
  }
}

export class Bullet extends Schema {
  @type("number") indexColor: number = 1
  @type("number") fromX: number = -10
  @type("number") fromY: number = -10
  @type("number") toX: number = -10
  @type("number") toY: number = -10
  @type("number") damage: number = -10

  constructor(data: any) {
    super()

    this.indexColor = data.indexColor
    this.fromX = data.fromX
    this.fromY = data.fromY
    this.toX = data.toX
    this.toY = data.toY
    this.damage = data.damage
  }
}

export class Enemy extends Schema {
  @type("string") id: string = "" 
  @type("number") x: number = -10
  @type("number") y: number = -10
  @type("number") damage: number = -10
  @type("number") speed: number = -10

  constructor(data: any) {
    super()
    
    this.id = data.id
    this.x = data.x
    this.y = data.y
    this.speed = data.speed
    this.damage = data.damage
  }
}

export class BattleRoomState extends Schema {
    @type({ map: Player }) players = new MapSchema<Player>()
    @type([Bullet]) bullets: Bullet[] = []
    @type({ map: Enemy }) enemys = new MapSchema<Enemy>()
    
    @type("string") message: string = "";
  
    public playerHost!: Player;
  }