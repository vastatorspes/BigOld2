class Players{
    constructor(){
        this.players = [];
    }
    
    addPlayer(id, username, roomname, roommode, pno, hand,score){
        var gamestatus = "";
        var playstatus = "";
        var hand = [];
        var score = 0;
        var player = {id, username, roomname, roommode, pno, gamestatus, playstatus, hand, score};
        this.players.push(player);
        return player;
    }   
    
    getPlayer(id){
        return this.players.find((player)=> player.id === id); // ambil dari array users yang id nya sama
    }

    getPlayerList(roomname){
        var playerList = this.players.filter((player) => player.roomname === roomname);
        return playerList;
    }

    getPlayerName(username){
        var player = this.players.find((player)=>player.username === username);
        if(player){
            var username= player.username;
            return username;
        }
    }

    getPlayerNames(roomname){
        var players = this.players.filter((player)=>player.roomname === roomname);
        var usernamesArray = players.map((player) => player.username);
        return usernamesArray;
    }

    getPlayerRoom(id){
        var player = this.players.find((player)=>player.id === id);
        if(player){
            var roomname = player.roomname;
            return roomname;
        }
    }
    
    // liat turn semua player
    getPlayersNumb(roomPlayers , roomPlayerCount){
        var playersNumb = [];
        var i;
        for(i=0; i<roomPlayerCount; i++){
            var p = roomPlayers[i].username;
            var no = roomPlayers[i].pno;
            var obj = {};
            obj['username'] = p;
            obj['numb'] = no;
            playersNumb.push(obj);
        }
        return playersNumb;
    }

    removePlayer(id){
        var player = this.getPlayer(id);
        if (player){
            this.players = this.players.filter((player)=> player.id != id);
        }
        return player;
    }
    
    updatePlayStatus(id){
        var player = this.getPlayer(id);
        player.playstatus = "pass"
    }
}
module.exports = {Players};