const PORT = 2000;
const fileName = "db.json"
const app = require('express')();
const server = require('http').createServer(app);
const options = { /* ... */ };
const io = require('socket.io')(server, options);

const fs = require("fs");

connections = [];
messages = [];


function NewConnectionCount() {
    io.emit("NewConnectionState", {count: connections.length});        
}

server.listen(PORT);

if (fs.existsSync(fileName)) {
    let fileContent = fs.readFileSync(fileName, "utf8");
    var messages = JSON.parse(fileContent);
}

app.get("/", function (req, res) {


res.sendFile(__dirname + "/index.html");
});

io.on('connection', function (socket) {
    
console.log("New connection: " + socket.id);
connections.push(socket);
NewConnectionCount();


    messages.forEach(message => {
        socket.emit("AddMessage", {msg: message.msg, name: message.name}); 
    });


socket.on("disconnect", function (data) {
    console.log("Disconnect: ID: " + socket.id)
connections.splice(connections.indexOf(socket), 1);
NewConnectionCount();
if (connections.length == 0) {
   var jsonOut = JSON.stringify(messages);
fs.writeFile(fileName, jsonOut, (err) => {

    if (err) throw err;

    console.log('DB messages refreshed!');
});
}

});

socket.on("NewMessage", function(data) {
    if (data.msg.trim()  && data.name.trim()) {
        messages.push(data);
    console.log("New message on ID " + socket.id + " Message: " + data.msg);
io.emit("AddMessage", {msg: data.msg, name: data.name});        
    }

});

socket.on("ClearMessages", function(data) {
   messages = [];
   if (fs.existsSync(fileName)) {
    fs.unlinkSync(fileName);
   }
   io.emit("ClearMessages");       

});
});