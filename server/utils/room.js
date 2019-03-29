const {Card} = require('./card');
var card = new Card();

const {CardTaiwan} = require('./cardTaiwan');
var cardTaiwan = new CardTaiwan();

class Rooms{
    constructor(){
        this.rooms = [];
    }

    generateRoom(roomname, players){
        var deckString = [
        'AD', '2D', '3D','4D', '5D', '6D','7D', '8D', '9D', '10D', 'JD', 'QD', 'KD',
        'AC', '2C', '3C','4C', '5C', '6C','7C', '8C', '9C', '10C', 'JC', 'QC', 'KC',
        'AH', '2H', '3H','4H', '5H', '6H','7H', '8H', '9H', '10H', 'JH', 'QH', 'KH',
        'AS', '2S', '3S','4S', '5S', '6S','7S', '8S', '9S', '10S', 'JS', 'QS', 'KS']
        
        var deck = card.shuffle(deckString);

        players.forEach((player)=>{
            var draw = deck.slice(0,13);
            if(player.roommode === "0") {
                player.hand = card.sortingCards(draw);
            }

            if(player.roommode === "1") {
                player.hand = cardTaiwan.sortingCards(draw);
            }
            deck = deck.slice(13, deck.length);
        });

        var turn = 1;
        var field = []
        var currentTurn;
        var room = {roomname, players, turn, field, currentTurn};
        return room;        
    }

    addRoom(roomname, players){
        var room = this.generateRoom(roomname,players);
        this.rooms.push(room);
        return room;
    }

    resetRoom(roomname, players){
        var room = this.getRoom(roomname);
        var reset = this.generateRoom(roomname,players);
        room = reset;
        return room;
    }

    getRoom(roomname){
        var room = this.rooms.find((r) => r.roomname === roomname);
        return room;
    }

    getFirstTurnInter(roomname){
        var player = this.getRoom(roomname).players;
        return player.find(p => p.hand[0] === "3D").username;
    }

    getFirstTurnTaiwan(roomname){
        var player = this.getRoom(roomname).players;
        return player.find(p => p.hand[0] === "3C").username;
    }

    throwCard(username, roomname, card){
        var room = this.getRoom(roomname);
        var getplayer = room.players;
        var playerHand = getplayer.find(x => x.username === username).hand;
        for(var i = 0; i<card.length; i++){
            var returnedCard = playerHand.find( c => c === card[i]);
            playerHand.splice(playerHand.indexOf(returnedCard),1);
        }
        this.updateRoomField(room.roomname, {username, card})
        return playerHand;
    }
    
    updateRoomField(roomname, field){
        var room = this.getRoom(roomname).field;
        return room.unshift(field);
    }

    updatePlayerScore(roomname){
        var room = this.getRoom(roomname);
        var players = room.players;
        var score = 0;
        for(var i=0; i<players.length; i++){
            if (players[i].hand.length === 0) var j = i;
            players[i].score -= players[i].hand.length;
            score += players[i].hand.length;
        }
        if (typeof j !== "undefined") players[j].score += score;

        var currentScore = [];
        players.forEach(p => {
            currentScore.push({"name":p.username, "score":p.score})
        });
        return currentScore;
    }

    updateGameStatus(roomname, status){
        var room = this.getRoom(roomname);
        var players = room.players;
        players.forEach(p => {
            p.gamestatus = status;
        });
    }

    changeTurn(roomname, roomPlayers, curnumb){
        for(var i=1; i < roomPlayers.length; i++){
            var numb = (curnumb + i) % 4;
            numb === 0 ? numb = 4 : numb;
            var currentTurn = roomPlayers.find(p => p.pno === numb);
            if(currentTurn.playstatus === ""){
                this.getRoom(roomname).currentTurn = currentTurn.username;
                this.getRoom(roomname).turn ++;
                return currentTurn.username;
            }
        }
    }

    getTopField(roomname){
        return this.getRoom(roomname).field[0];
    }

    refreshPlayStatus(roomname){
        var roomPlayers = this.getRoom(roomname).players;
        var player = roomPlayers.filter(x => x.playstatus === "pass");
        player.forEach(p => {
            p.playstatus = "";
        });
    }

    countPassedPlayers(roomname){
        var roomPlayers = this.getRoom(roomname).players;
        return roomPlayers.filter(x => x.playstatus === "pass").length;
    }

    getPlayersScore(roomname){
        var playerList = this.getRoom(roomname).players;
        var playersScore = [];
        playerList.forEach(p => {
            var username = p.username;
            var score = p.score;
            playersScore.push([username, score]);
        });
        return playersScore;
    }

    isRoomEmpty(roomname){
        var playerList = this.getRoom(roomname).players;
        var disconnected = playerList.filter(x => x.gamestatus === "disconnected").length;
        return (disconnected === 4);
    }

    removeRoom(roomname){
        var room = this.getRoom(roomname);
        if (room){
            this.rooms = this.rooms.filter((room)=> room.roomname != roomname);
        }
        return room;
    }
}

module.exports = {Rooms};