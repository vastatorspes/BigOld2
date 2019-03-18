const path = require('path');
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');

//utils
const {Players} = require('./utils/player');
var players = new Players();
const {Rooms} = require('./utils/room');
var rooms = new Rooms();
const {Logic} = require('./utils/logic');
var logic = new Logic();
const {LogicTaiwan} = require('./utils/logicTaiwan');
var logicTaiwan = new LogicTaiwan();

const publicPath = path.join(__dirname, '../public');
const port = process.env.PORT || 3000;
var app = express();
var server = http.createServer(app);
var io = socketIO(server);

app.use(express.static(publicPath));

io.on('connection', (socket)=>{
    // console.log('New user connected');
    // ----------------------- EVENT 0. LISTEN PLAYER LOGIN -----------------------
    socket.on('playerLogin', (roomname, username, roommode, callback)=>{
        var roomPlayers = players.getPlayerList(roomname);
        if(roomPlayers.length >0){
            var getRoomMode = roomPlayers[0].roommode;
            if(roommode != getRoomMode) return callback("Must be the same mode")
        }

        var roomPlayerCount = roomPlayers.length;
        if(roomPlayerCount >= 4){
            return callback('Room is Full')
        }

        var existName = players.getPlayerName(username);
        if(existName){
            return callback("Username already taken")
        }
        callback()
    });

    // ----------------------- EVENT 1. LISTEN JOIN ROOM -----------------------
    var id;
    socket.on('joinWaitingRoom', (params,callback)=>{
        var username = params.Username;
        var roomname = params.Room;
        var roommode = params.Mode;
        var existName = players.getPlayerName(username);
        id = username;
        if(existName){
            return callback("Username already taken")
        }
        var roomPlayerCount = players.getPlayerList(roomname).length;
        if(roomPlayerCount >= 4){ //validasi room pentuh waktu maksa masukin url
            return callback('Room is Full');
        }
        
        console.log('New Player Join');
        socket.join(roomname); // join room
        
        var pno = roomPlayerCount + 1;
        players.addPlayer(id, username, roomname, roommode, pno); // setiap player yang join ditambahin ke arr player

        var playerList = players.getPlayerNames(roomname);
        io.to(roomname).emit('updatePlayerList', playerList); // update div nya player
        

        //----------------------- EVENT 2. RETURN CALLBACK GAME START -----------------------
        var roomPlayerCount = players.getPlayerList(roomname).length; // ngambil ulang jumlah player
        var roomPlayers = players.getPlayerList(roomname);
        var playersNumb = players.getPlayersNumb(roomPlayers, roomPlayerCount);

        if(roomPlayerCount === 4){
            rooms.addRoom(roomname, roomPlayers);
            io.to(roomname).emit('gameStart', playersNumb);
            rooms.updateGameStatus(roomname, "playing")
            console.log(JSON.stringify(rooms,undefined,2))
            return callback();
        }
        callback(); //gak ngasih apa-apa karna ga error
    });
    // end join room -------------------------------------------------------------------------

    //----------------------- EVENT 3. LISTEN INIT HAND -----------------------
    socket.on('initHand', (params, callback)=>{
        var username = params.Username;
        var roomname = params.Room;
        var playerRoom = rooms.getRoom(roomname);
        var player = playerRoom.players.find((p)=>p.username === username);
        var playerHand = player.hand;

        var myturn = player.pno;

        var p2hand = playerRoom.players.find((x)=>{
            var numb = (myturn + 1) % 4;
            numb === 0 ? numb = 4 : numb;
            if(x.pno === numb){return x;}
        });

        var p3hand = playerRoom.players.find((x)=>{
            var numb = (myturn + 2) % 4;
            numb === 0 ? numb = 4 : numb;
            if(x.pno === numb){return x;}
        });

        var p4hand = playerRoom.players.find((x)=>{
            var numb = (myturn + 3) % 4;
            numb === 0 ? numb = 4 : numb;
            if(x.pno === numb){return x;}
        });

        obj = {
            'myhand' : playerHand,
            'p2hand' : p2hand.hand.length,
            'p3hand' : p3hand.hand.length,
            'p4hand' : p4hand.hand.length,
        }
        callback(obj)
    });
    // end init hand -------------------------------------------------------------------------


    socket.on("passTurn", (params)=>{
        var username = params.Username;
        var roomname = params.Room;
        var playerRoom = rooms.getRoom(roomname);
        var player = playerRoom.players.find((p)=>p.username === username);
        var prevPno = player.pno;
        players.updatePlayStatus(username)
        var passCount = rooms.countPassedPlayers(roomname);
        playerRoom.turn ++;
        
        var roomPlayers = players.getPlayerList(roomname) // ambil list player buar variable change turn
        var currentTurn = rooms.changeTurn(roomname, roomPlayers, player.pno) // ganti turn
        io.to(roomname).emit('afterPass', currentTurn, prevPno, passCount); // emit event afterThrow buat update semua kartu player di layar masing2
    })

    socket.on("throwCard", (params, cardname, callback)=>{
        var username = params.Username;
        var roomname = params.Room;
        var roommode = params.Mode;
        var playerRoom = rooms.getRoom(roomname);
        var player = playerRoom.players.find((p)=>p.username === username);
        var passCount = rooms.countPassedPlayers(roomname);

        // Check roomnya
        if(roommode === "0"){
            if(playerRoom.turn === 1){
                if(!logic.legalFirstMove(cardname)) return callback("Must throw 3 Diamonds")
            }
    
            // check kartu yang di keluarin legal ga
            if(!logic.legalCard(cardname)){
                return callback("Only can play single, pair or 5 cards combo");
            }
    
            if(playerRoom.turn > 1 && passCount != 3){
                var topField = rooms.getTopField(roomname).card;
                if(!logic.legalMove(cardname, topField)) return callback(`${cardname} is less than ${topField}`)
            }
        }

        // check first turn ato bukan
        if(roommode === "1"){
            if(playerRoom.turn === 1){
                if(!logicTaiwan.legalFirstMove(cardname)) return callback("Must throw 3 Diamonds")
            }
    
            // check kartu yang di keluarin legal ga
            if(!logicTaiwan.legalCard(cardname)){
                return callback("Only can play single, pair or 5 cards combo");
            }
    
            if(playerRoom.turn > 1 && passCount != 3){
                var topField = rooms.getTopField(roomname).card;
                if(!logicTaiwan.legalMove(cardname, topField)) return callback(`${cardname} is less than ${topField}`)
            }
        }

        if(passCount === 3){
            rooms.refreshPlayStatus(roomname);
        }

        rooms.throwCard(username, roomname, cardname) //buang kartu dan update kartu di tangan
        var roomPlayers = players.getPlayerList(roomname) // ambil list player buar variable change turn

        if(player.hand.length === 0) {
            playerRoom.turn = 1;
            playerRoom.field = [];
            playerRoom.currentTurn = "";
            rooms.updatePlayerScore(roomname);
            rooms.resetRoom(roomname, roomPlayers);

            var playerScore = rooms.getPlayersScore(roomname);
            io.to(roomname).emit('newGame', playerScore);
            return callback();
        }
        
        var currentTurn = rooms.changeTurn(roomname, roomPlayers, player.pno) // ganti turn
        io.to(roomname).emit('afterThrow', currentTurn, rooms.getTopField(roomname)); // emit event afterThrow buat update semua kartu player di layar masing2
        callback();
    })

    socket.on("cdControlTurn", (params)=>{
        var username = params.Username;
        var roomname = params.Room;
        var playerRoom = rooms.getRoom(roomname);
        var player = playerRoom.players.find((p)=>p.username === username);
        var passCount = rooms.countPassedPlayers(roomname);

        if(passCount === 3){
            rooms.refreshPlayStatus(roomname);
        }

        rooms.throwCard(username, roomname, [player.hand[0]]) //buang kartu dan update kartu di tangan
        var roomPlayers = players.getPlayerList(roomname) // ambil list player buar variable change turn

        if(player.hand.length === 0) {
            playerRoom.turn = 1;
            playerRoom.field = [];
            playerRoom.currentTurn = "";
            rooms.updatePlayerScore(roomname);
            rooms.resetRoom(roomname, roomPlayers);

            var playerScore = rooms.getPlayersScore(roomname);
            io.to(roomname).emit('newGame', playerScore);
            console.log("asdf")
        }
        else{
            var currentTurn = rooms.changeTurn(roomname, roomPlayers, player.pno) // ganti turn
            io.to(roomname).emit('afterThrow', currentTurn, rooms.getTopField(roomname)); // emit event afterThrow buat update semua kartu player di layar masing2
            console.log(roomPlayers);
            console.log(player.pno);
        }
    });

    socket.on('disconnect', ()=>{
        var roomname = players.getPlayerRoom(id);
        var player = players.getPlayer(id);
        if(player){
            console.log(player);
            if(player.gamestatus != "playing");{
                players.removePlayer(id);
                var playerList = players.getPlayerNames(roomname);
                io.to(player.roomname).emit('updatePlayerList', playerList);
            }
        }
        console.log('disconnected')
    });
});

server.listen(port, () => {
    console.log(`Server is up on ${port}`)
}); 