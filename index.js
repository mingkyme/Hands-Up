var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
app.use(express.static('public'));

server.listen(5124, function() {
    console.log('Hands Up Server on 5124');
});

var users = [];
var handsUp = [];
io.on('connect',function(socket){
    socket.on('init',function(name){
        if(name != null && name != ""){
            users.push([socket,name]);
            socket.emit('handsup-list',JSON.stringify(handsUp));
            socket.broadcast.emit('user-count',users.length);
        }
    });

    socket.on('disconnect',function(){
        if(users.findIndex( (x)=> x[0] == socket) != -1){
            users.splice(users.findIndex(x => x[0] == socket),1);
            socket.broadcast.emit('user-count',users.length);
        }
    });
    socket.on('handsup',function(){
        if(users.findIndex( (x)=> x[0] == socket) != -1){
            let name = users.find((x)=>x[0].id == socket.id)[1];
            if(handsUp.indexOf(name) == -1){
                handsUp.push(name);
            }
        }
        socket.broadcast.emit('handsup-list',JSON.stringify(handsUp)); 
    });
    socket.on('handsdown',function(index){
        handsUp.splice(index,1);
        socket.emit('handsup-list',JSON.stringify(handsUp));
        socket.broadcast.emit('handsup-list',JSON.stringify(handsUp)); 
    });
});
app.get('/teacher',function(req,res){
    res.sendFile(__dirname+'/public/teacher.html');
});

// 랜덤 5글자의 방ID를 이용해 멀티룸 구현
// 예상 형식
/*

// user name
let rooms = {
    "abcde" :[
        "MINGKYME",
        "JACKSON"
    ]
}
STRING : [STRING ARRAY]


// socket user
let sockets = {
    "abcde" : []
}
// STRING : [SOCKET ARRAY]

*/
let rooms = new Object();
let sockets = new Object();

app.get('/:room',function(req,res){
    res.send(req.query.rooms);
});