const socket = require('socket.io')
var io;

exports.init = (server) => {
     io = socket(server)
     io.on("connection", function(socket) {
      if (socket.connected) {
        socket.on("Notifcation", function(data) {
          console.log(data);
          io.sockets.emit("Notifcation", data);
        });
        socket.on("Comment", function(data) {
          io.sockets.emit("Comment", data);
        });
        socket.on("CommentReply", function(data) {
          io.sockets.emit("CommentReply", data);
        });
        socket.on("Message", function(data) {
          console.log(data);
          io.sockets.emit("Message", data);
        });
        socket.on("UserStatus", function(data) {
          console.log(data);
          io.sockets.emit("UserStatus", data);
        });
      }
      else{
         console.log("Reconnecting...");
      }
    });
}

exports.getIoObject = () => {
  return io;
}
