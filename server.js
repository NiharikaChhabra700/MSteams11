const express = require("express");
const app = express();
const server = require("http").Server(app);
const { v4: uuidv4 } = require("uuid");
app.set("view engine", "ejs");
const io = require("socket.io")(server, {
  cors: {
    origin: '*'
  }
});

const { ExpressPeerServer } = require("peer");
const peerServer = ExpressPeerServer(server, {
  debug: true,
});
// app.get("/ended",(req,res)=>{
//   console.log("ended clicked");
  
//   res.render("ended");
// })
app.use("/peerjs", peerServer);
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.render("ended");
});
//res.redirect(`/${uuidv4()}`)

app.get("/meeting", (req, res) => {
  res.redirect(`/meeting/${uuidv4()}`); //res.render("landing")
});

app.get("/meeting/:room", (req, res) => {
  res.render("room", { roomId: req.params.room });
});

//app.post("/action", function (req, res) {
  //   console.log(res.query);
 // return res.redirect("/ended");
//});

io.on("connection", (socket) => {
  socket.on("join-room", (roomId, userId, userName) => {
    socket.join(roomId);
    socket.to(roomId).broadcast.emit("user-connected", userId);
    socket.on("message", (message) => {
      io.to(roomId).emit("createMessage", message, userName);
    });

    // socket.on('disconnect', () => {
    //   res.render("ended");
    //   console.log("hello")
    //   socket.to(roomId).broadcast.emit('user-disconnect', userId)
    // })
  });
});

server.listen(process.env.PORT || 3030);

