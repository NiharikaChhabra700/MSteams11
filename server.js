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

app.use("/peerjs", peerServer);
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.render("ended");
});


app.get("/meeting", (req, res) => {
  res.redirect(`/meeting/${uuidv4()}`); 
});

app.get("/meeting/:room", (req, res) => {
  res.render("room", { roomId: req.params.room });
});


// this runs any time someone connects to our webpage
io.on("connection", (socket) => {
  // this runs when someone connects to a room
  socket.on("join-room", (roomId, userId, userName) => {
    // allowing current socket to join the room
    socket.join(roomId);
     // sending message to the other users in the room, current user is connected to
    socket.to(roomId).broadcast.emit("user-connected", userId);
    
    socket.on("message", (message) => {
      io.to(roomId).emit("createMessage", message, userName);
    });
  });
});

server.listen(process.env.PORT || 3030);

