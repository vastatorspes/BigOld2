var socket = io();

// validasi waktu mau masuk room.
function inputCheck() {
    var username = document.getElementById("inputUsername").value;
    var roomname = document.getElementById("inputRoom").value;
    var roommode = document.getElementById("inputMode").value;
    if (typeof username === "string" && typeof roomname === "string" && username.trim().length > 0 && roomname.trim().length >0 ) {
        // event 1. emit Join - waktu player masuk room
        socket.emit('playerLogin', roomname, username, roommode, function(err){
            if(err){
                alert(err);
                window.location.href = '/';
                return false;
            }
            return true;
        });
        return true;
    }
    alert('username and password must be filled');
    return false;
}

