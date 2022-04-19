import { Room, Client } from "colyseus";
import { BattleRoomState, Bullet, Enemy, Player } from "./schema/BattleRoomState";

export class BattleRoom extends Room<BattleRoomState> {
  onCreate(options: any) {
    this.setState(new BattleRoomState());

    this.onMessage('CreatePlayer', (client: Client, data) => {
      var player: Player 
      if(data.id === this.state.playerHost.playerID) {
        player = this.state.playerHost
      } else {
        player = new Player(data.id, client, false)
      }
      player.x = data.x
      player.y = data.y
      player.indexColor = data.indexColor
      this.state.players.set(player.playerID, player);
    })

    this.onMessage("PlayerAction", (client, data) => {
      if(client.sessionId == this.state.playerHost.playerID) return;
      this.state.playerHost.client.send("PlayerAction", { id: client.sessionId, actionData: data });
    });

    this.onMessage("Shooting", (client ,data) => {
      this.state.bullets.push(new Bullet(data))
    })

    this.onMessage("NewEnemy", (client, data) => {
      console.log(data)
      const newEnemy = new Enemy(data)
      this.state.enemys.set(newEnemy.id ,newEnemy)
      console.log(this.state.enemys.size)
    })

    this.onMessage("DestroyEnemy", (client, data) => {
      this.state.message = "DESTROY_"+data.id
      this.state.enemys.delete(data.id);
      this.state.playerHost.client.send("DestroyEnemy", { data: data });
    })

    this.onMessage("UpdateState", (client, data) => {
      // console.log("UpdateState");

      if(client.sessionId != this.state.playerHost.playerID) return
      
      data.players.forEach((p: { id: string; x: number; y: number; }) => {
        // this.state.message = "UPDATE_STATE:" + p.id;
        var player = this.state.players.get(p.id);
        if(player == undefined) return;
        player.x = p.x;
        player.y = p.y;

        // console.log(p.id, p.x, p.y);
      });
    });
  }

  onJoin(client: Client) {

    var isHost = false
    if(this.state.players.size <= 0) {
      isHost = true
      this.state.playerHost = new Player(client.sessionId, client, isHost)
    }

    this.state.message = "PLAYER_JOIN:" + client.sessionId;
    this.state.playerHost.client.send("PlayerJoinSuccess", { id: client.sessionId, host: isHost });
  }

  onLeave(client: Client) {
    this.state.message = "PLAYER_LEFT:" + client.sessionId;
    this.state.players.delete(client.sessionId);
  }
}