var socket = io();
var roomPlayersNumb, mynumb, p2numb, p3numb,p4numb;
var myusername, p2username, p3username, p4username;
var pass = false;
var params = jQuery.deparam(window.location.search);
var timer;
var timeCount;

// waktu player konek ke server / masuk room
socket.on('connect', function(){
    console.log('Player Connected to the Server');
    // ----------------------- EVENT 1. EMIT JOIN WAITING ROOM -----------------------
    socket.emit('joinWaitingRoom', params, function(message){
        if(message === 'Room is Full'){
            alert(message);
            window.location.href = '/';
        }
        else if(message === 'Username already taken'){
            alert(message);
            window.location.href = '/';
        }
        else if(message === 'reconnect'){
            emitInitHand()
        }
    });
});

// bikin tampilan masing2 player di room
socket.on('updatePlayerList', function(players){
    console.log(players);
    jQuery('#player-room').empty();
    players.forEach(function(name){
        jQuery('#player-room').append(jQuery('<div></div>').addClass('w3-card w3-green')
        .append(jQuery('<h3></h3>').text(name)))
    });
});   

socket.on('gameStart', function(playersNumb, currentTurn, time){
    timeCount = time
    roomPlayersNumb = playersNumb;
    document.querySelector("link[href='/css/waiting.css']").href = "/css/game.css";
    $("div.waiting-div").css("display", "none");

    // var myturn = playersNumb.find(x => x.username === params.Username).numb; [ES6]
    // -----------------p1name------------------
    var myturn = playersNumb.find(function(x){
        if(x.username === params.Username){return x;}
    });
    jQuery(".myname").text(myturn.username);
    mynumb = myturn.numb;
    myusername = myturn.username;

    // -----------------p2name------------------
    var p2turn = playersNumb.find(function(x){
        var numb = (myturn.numb + 1) % 4;
        numb === 0 ? numb = 4 : numb;
        if(x.numb === numb){return x;}
    });
    jQuery(".p2name").text(p2turn.username);
    p2numb = p2turn.numb;
    p2username = p2turn.username;

    // -----------------p3name------------------
    var p3turn = playersNumb.find(function(x){
        var numb = (myturn.numb + 2) % 4;
        numb === 0 ? numb = 4 : numb;
        if(x.numb === numb){return x;}
    });
    jQuery(".p3name").text(p3turn.username);
    p3numb = p3turn.numb;
    p3username = p3turn.username;

    // -----------------p4name------------------
    var p4turn = playersNumb.find(function(x){
        var numb = (myturn.numb + 3) % 4;
        numb === 0 ? numb = 4 : numb;
        if(x.numb === numb){return x;}
    });
    jQuery(".p4name").text(p4turn.username)
    p4numb = p4turn.numb;
    p4username = p4turn.username;

    if(params.Username === currentTurn){
        $(".turn-sign").empty()
        $(".turn-sign").append(`<h1>Your Turn</h1>`)
        setTimeout(()=>{
            $(".btn-div").css("display", "block");
        }, 5000);
        $(".btn-pass").prop("disabled", true);
    }
    else{
        $(".turn-sign").empty()
        $(".turn-sign").append(`<h1>${currentTurn} Turn</h1>`)
    }

    jQuery(".high-score").text(myusername + " : 0" )
    jQuery(".second-score").text(p2username + " : 0" )
    jQuery(".third-score").text(p3username + " : 0" )
    jQuery(".fourth-score").text(p4username + " : 0" )

    
    emitInitHand();
    setTimeout(()=>{
        timerCountdown(currentTurn);
    }, 5000);
});

socket.on("afterThrow", function(currentTurn, topfield){
    clearTimeout(timer)
    jQuery('.player-bot img').remove();
    jQuery('.player-left img').remove();
    jQuery('.player-right img').remove();
    jQuery('.player-top img').remove();
    jQuery('.img-card-field').remove();
    timerCountdown(currentTurn);
    emitInitHand();
    
    $(".btn-div").css("display", "none");
    var prevPno = roomPlayersNumb.find(function(x){
        return x.username === topfield.username;
    }).numb;
    
    
    showField(prevPno, topfield); // tampilin field

    if(params.Username === currentTurn){
        $(".btn-div").css("display", "block");
        $(".btn-pass").prop("disabled", false);
        $(".turn-sign").empty()
        $(".turn-sign").append(`<h1>Your Turn</h1>`)
        timer = setTimeout(()=>{
            passButton();
        }, timeCount)
    }
    else{
        $(".turn-sign").empty()
        $(".turn-sign").append(`<h1>${currentTurn}'s Turn</h1>`)
    }
})

socket.on("afterPass", function(currentTurn, prevPno, passCount){
    clearTimeout(timer)
    $(".btn-div").css("display", "none");
    showPass(prevPno);
    timerCountdown(currentTurn);
    if(passCount === 3){
        pass = false;
        $(".btn-pass").prop("disabled", true);
        $(".pass-sign").empty();
        $(".turn-sign").empty()
        $(".turn-sign").append(`<h1>Your Turn</h1>`)
        if(params.Username === currentTurn){
            $(".btn-div").css("display", "block");
            timer = setTimeout(()=>{
                socket.emit("cdControlTurn", params)
            }, timeCount)
        }
    }

    else{
        if(params.Username === currentTurn){
            $(".btn-div").css("display", "block");
            $(".btn-pass").prop("disabled", false);
            $(".turn-sign").empty()
            $(".turn-sign").append(`<h1>Your Turn</h1>`)
            timer = setTimeout(()=>{
                passButton();
            }, timeCount)
        }
        else{
            $(".turn-sign").empty()
            $(".turn-sign").append(`<h1>${currentTurn}'s Turn</h1>`)
        }
    }
})

socket.on("newGame", function(pScore, currentTurn){
    $(".btn-div").css("display", "none");
    jQuery('.player-bot img').remove();
    jQuery('.player-left img').remove();
    jQuery('.player-right img').remove();
    jQuery('.player-top img').remove();
    jQuery('.img-card-field').remove();

    $(".player-timer").empty();
    $(".p2-timer").empty();
    $(".p3-timer").empty();
    $(".p4-timer").empty();

    var playerScore = pScore.sort(function(a, b) {
        return b[1] - a[1];
    });

    jQuery("#button-score").click()
    jQuery(".high-score").text(playerScore[0][0] + " : " + playerScore[0][1])
    jQuery(".second-score").text(playerScore[1][0] + " : " + playerScore[1][1])
    jQuery(".third-score").text(playerScore[2][0] + " : " + playerScore[2][1])
    jQuery(".fourth-score").text(playerScore[3][0] + " : " + playerScore[3][1])
    setTimeout(()=>{
        jQuery("#close-score").click()
    }, 5000);

    emitInitHand()

    setTimeout(()=>{
        timerCountdown(currentTurn);
    }, 5000);
})

// ------------------ Tampilin Tangan ------------------------
function emitInitHand(){
    socket.emit('initHand',params, function(hand){
        // ------------------------------------------------------ player1 table ------------------------------------------------------
        for(i=0; i<hand.myhand.length; i++){
            if(i === 0){
                jQuery('.player-bot').append(jQuery(`<img id="F${hand.myhand[i]}NON" onClick="getId(this, this.id)" 
                                                        src="/cards_img/${hand.myhand[i]}.png" height="140" >`));
            }
            if(i>0){
                jQuery('.player-bot').append(jQuery(`<img id="L${hand.myhand[i]}NON" onClick="getId(this, this.id)" class ="hor-margin" 
                                                        src="/cards_img/${hand.myhand[i]}.png" height="140">`));
            }
        }
        // munculin tombol kalo jalan pertama

        if(hand.myhand[0] === hand.lowestCard){
            setTimeout(()=>{
                $(".btn-div").css("display", "block");
            }, 5000);
            $(".btn-pass").prop("disabled", true);
            timer = setTimeout(()=>{
                socket.emit("throwCard", params, [hand.lowestCard], function(err){
                    if(err){
                        alert(err);
                        return false;
                    }
                    return true;
                })
            }, timeCount + 5000)
        }
        
        // ------------------------------------------------------ player2 table ------------------------------------------------------
        for(i=0; i<hand.p2hand; i++){
            if(i === hand.p2hand){
                jQuery('.player-left').append(jQuery(`<img class="rotate90" src="cards_img/card-back.jpg" height="140">`))
            }
            if(i<hand.p2hand){
                jQuery('.player-left').append(jQuery(`<img class="rotate90 ver-margin" src="cards_img/card-back.jpg" height="140">`))
            }
        }

        // ------------------------------------------------------ player3 table ------------------------------------------------------
        for(i=0; i<hand.p3hand; i++){
            if(i === 0){
                jQuery('.player-top').append(jQuery(`<img src="cards_img/card-back.jpg" height="140">`));
                
            }
            if(i>0){
                jQuery('.player-top').append(jQuery(`<img class ="hor-margin" src="cards_img/card-back.jpg" height="140">`));
            }
        }

        // ------------------------------------------------------ player4 table ------------------------------------------------------
        for(i=0; i<hand.p4hand; i++){
            if(i === hand.p4hand){
                jQuery('.player-right').append(jQuery(`<img class="rotate90" src="cards_img/card-back.jpg" height="140">`))
            }
            if(i<hand.p4hand){
                jQuery('.player-right').append(jQuery(`<img class="rotate90 ver-margin" src="cards_img/card-back.jpg" height="140">`))
            }
        }
    });
}

function showField(prevPno, topfield){
    if (prevPno === p2numb){
        for(var i=0; i<topfield.card.length; i++){
            if(i === 0){
                jQuery('.field-left').append(
                    jQuery(`<img src="./cards_img/${topfield.card[i]}.png" class="img-card-field" height="140">`)
                )
            }
            if(i>0){
                jQuery('.field-left').append(
                    jQuery(`<img src="./cards_img/${topfield.card[i]}.png" class="hor-margin img-card-field" height="140">`)
                )
            }
        }
    }

    if (prevPno === p3numb){
        for(var i=0; i<topfield.card.length; i++){
            if(i === 0){
                jQuery('.field-top').append(
                    jQuery(`<img src="./cards_img/${topfield.card[i]}.png" class="img-card-field" height="140">`)
                )
            }
            if(i>0){
                jQuery('.field-top').append(
                    jQuery(`<img src="./cards_img/${topfield.card[i]}.png" class="hor-margin img-card-field" height="140">`)
                )
            }
        }
    }

    if (prevPno === p4numb){
        for(var i=0; i<topfield.card.length; i++){
            if(i === 0){
                jQuery('.field-right').append(
                    jQuery(`<img src="./cards_img/${topfield.card[i]}.png" class="img-card-field" height="140">`)
                )
            }
            if(i>0){
                jQuery('.field-right').append(
                    jQuery(`<img src="./cards_img/${topfield.card[i]}.png" class="hor-margin img-card-field" height="140">`)
                )
            }
        }
    }

    if (prevPno === mynumb){
        for(var i=0; i<topfield.card.length; i++){
            if(i === 0){
                jQuery('.field-bot').append(
                    jQuery(`<img src="./cards_img/${topfield.card[i]}.png" class="img-card-field" height="140">`)
                )
            }
            if(i>0){
                jQuery('.field-bot').append(
                    jQuery(`<img src="./cards_img/${topfield.card[i]}.png" class="hor-margin img-card-field" height="140">`)
                )
            }
        }
    }
}

function showPass(prevPno){
    if (prevPno === p2numb){
        jQuery('.player-left .pass-sign').append(
            jQuery("<center><h3> PASS </h3></center>")
        )
    }

    if (prevPno === p3numb){
        jQuery('.player-top .pass-sign').append(
            jQuery("<center><h3> PASS </h3></center>")
        )
    }

    if (prevPno === p4numb){
        jQuery('.player-right .pass-sign').append(
            jQuery("<center><h3> PASS </h3></center>")
        )
    }

    if (prevPno === mynumb){
        jQuery('.player-bot .pass-sign').append(
            jQuery("<center><h3> PASS </h3></center>")
        )
    }

}

function timerCountdown(currentTurn){
    $(".player-timer").empty();
    $(".p2-timer").empty();
    $(".p3-timer").empty();
    $(".p4-timer").empty();

    var startTime = 20 - (timeCount/1000);
    if(myusername === currentTurn) $(".player-timer").append(`<video autoplay> <source src="./img/timer.mp4#t=${startTime},20" type="video/mp4"> </video>`)
    if(p2username === currentTurn) $(".p2-timer").append(`<video autoplay> <source src="./img/timer.mp4#t=${startTime},20" type="video/mp4"> </video>`)
    if(p3username === currentTurn) $(".p3-timer").append(`<video autoplay> <source src="./img/timer.mp4#t=${startTime},20" type="video/mp4"> </video>`)
    if(p4username === currentTurn) $(".p4-timer").append(`<video autoplay> <source src="./img/timer.mp4#t=${startTime},20" type="video/mp4"> </video>`)
}
socket.on('disconnect', function(){
    console.log('disconnect from server');
});
