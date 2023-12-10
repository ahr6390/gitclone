const express = require("express");
const app = express();
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const mysql = require("mysql");
const { constants } = require("buffer");
app.use(cors());

const server = http.createServer(app);

const port = 80;

const conn = mysql.createPool({
  host : "database-1.cnff0sg0k2br.us-east-1.rds.amazonaws.com",
  user : "chat",
  password : "chat1234",
  port : "3306",
  database : "chat"
})

const io = new Server(server, {
  cors: {
    // origin: "http://localhost:3000",
    origin: '*',
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  

  socket.on("join_room", (data) => {
    conn.getConnection(function(err) {
      if (err) throw err;
      console.log("Connected!");     
    })
    let list = [];
    // app.get('/api/ChatContent', (req,res) => {
    var sql = "SELECT * FROM CHAT WHERE room = '" + data.room + "'";
      conn.query(sql, (err, data) => {
        if(err) {
          console.log('err');
          res.send(err);
        } else {
          console.log('success');
          // console.log(JSON.stringify(data));
          
          //console.log(data);      
          
          for (var datas of data) {
            list.push(datas.author);
            list.push(datas.message);
            list.push(datas.time);
          } 
          //console.log(list);
          //console.log(list.length);

          for(let i = 0; i < list.length; i++){
            if(i%3==0){
              let lists = {
               author: `${list[i]}`,
               message: `${list[i+1]}`,
                time: `${list[i+2]}`
              }
          
             //console.log(lists);
             socket.emit('list_message', lists);
            }
          }
        }
      })
      
    // });
    
    socket.join(data.room);
    console.log(`${data.username}유저가 ${data.room}번 방에 입장했습니다`);
    let noti = {
      message:`${data.username} 유저가 방에 입장했습니다`,
      author:'알림'
    }
    //console.log(noti);
    socket.to(data.room).emit('receive_message', noti);
    
  });

  socket.on("send_message", (data) => {
    console.log(data)
    socket.to(data.room).emit("receive_message", data);
  
    var sql = "INSERT INTO CHAT (room, author, message, time) VALUES ('"
      + data.room + "', '" + data.author + "', '" + data.message
      + "', '" + data.time + "')";
    // conn.connect(function(err) {
      // if (err) throw err;
      // console.log("Connected!");      
    conn.query(sql, function (err, result) {
       if (err) throw err;
       console.log("1 record inserted");
    })
      
  })

    // })        
    
    
  

  socket.on("disconnect", () => {
    console.log(`${socket.id}가 접속을 끊었습니다`);
  });
});

server.listen(port, () => console.log(`server running on port ${port}`));
