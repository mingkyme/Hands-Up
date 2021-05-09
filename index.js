const nicknames = ['고양이','강아지','거북이','토끼','뱀','사자','호랑이','표범','치타','하이에나','기린','코끼리','코뿔소','하마','악어','펭귄','부엉이','올빼미','곰','돼지','소','닭','독수리','타조','고릴라','오랑우탄','침팬지','원숭이','코알라','캥거루','고래','상어','칠면조','직박구리','쥐','청설모','메추라기','앵무새','삵','스라소니','판다','오소리','오리','거위','백조','두루미','고슴도치','두더지','우파루파','맹꽁이','너구리','개구리','두꺼비','카멜레온','이구아나','노루','제비','까지','고라니','수달','당나귀','순록','염소','공작','바다표범','들소','박쥐','참새','물개','바다사자','살모사','구렁이','얼룩말','산양','멧돼지','카피바라','바다코끼리','도롱뇽','북극곰','퓨마','미어캣','코요테','라마','딱따구리','기러기','비둘기','스컹크','아르마딜로','돌고래','까마귀','매','낙타','여우','사슴','늑대','재규어','알파카','양','다람쥐','담비'];

var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);

server.listen(5124, function() {
    console.log('Hands Up Server on 5124');
});

var users = [];
var handsUp = []; //["nickname","time"]
io.on('connect',function(socket){
    let nickname = randomNickname();
    users.push([socket,nickname]);
    if(users[0] && users[0][0] == socket){
        socket.emit('teacher');
    }else{
        socket.emit('nickname',nickname); 
    }
    socket.broadcast.emit('user-count',users.length);

    socket.on('disconnect',function(){
        users.splice(users.findIndex(x => x[0] == socket),1);
        if(users[0]){
            users[0][0].emit('teacher');
        }
        socket.broadcast.emit('user-count',users.length);
    });
    socket.on('handsup',function(){
        console.log(users);
        let name = users.find((x)=>x[0].id == socket.id)[1];
        if(handsUp.indexOf(name) == -1){
            handsUp.push(name);
        }
        socket.broadcast.emit('handsup-list',JSON.stringify(handsUp)); 
    });
    socket.on('handsdown',function(index){
        if(users[0][0] == socket){
            handsUp.splice(index,1);
            socket.emit('handsup-list',JSON.stringify(handsUp));
            socket.broadcast.emit('handsup-list',JSON.stringify(handsUp)); 
        }
    });
});

app.get('/',function(req,res){
    res.sendFile(__dirname+'/public/room.html');
});
// app.get('/room',function(req,res){
//     res.sendFile(__dirname+'/public/room.html');
// });

function randomNickname() {
    return nicknames[Math.floor(Math.random() * nicknames.length)];
  }