const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')
const { generateMessage , generateLocationMessage } = require('./utils/messages') 
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users')
const app = express()
const server = http.createServer(app)
const io = socketio(server) 

const port = process.env.PORT || 3000
const publicPath = path.join(__dirname, '../public');
app.use(express.static(publicPath))

io.on('connection',(socket) => {
    socket.on('join',({username, room}, callback) => {
        const { error, user } = addUser({
            id: socket.id,
            username,
            room
        });
        if (error) {
            return callback(error)
        }
        // Fires join funtion
        socket.join(room)
        socket.emit('message',generateMessage('Admin','Welcome to chat app'))
        // Sends event to all clients expect newly joined client
        socket.broadcast.to(room).emit('message', generateMessage(`${username} has joined`))
        // Sending list of users to client
        io.to(room).emit('roomData',{
            room,
            users: getUsersInRoom(room)
        })
    })

    // Recieving message from client
    socket.on('sendMessage',(msg, callback) => {
        const filter = new Filter
        if (filter.isProfane(msg)) {
            callback('No bad words allowed to send')
        }
        const user = getUser(socket.id)
        if (user) {
            io.to(user.room).emit('message',generateMessage(user.username,msg))
        }
        // Sending message to all clients
        callback()
    })
    // recieving location from client
    socket.on('sendLocation',(data, callback) => {
        const user = getUser(socket.id)
        if (user) {
            io.to(user.room).emit('locationMessage', generateLocationMessage(user.username,`https://www.google.com/maps?q=${data.latitude},${data.longitude}`))
        }
        callback()
    })
    
    // Disconnect client
    socket.on('disconnect',() => {
        const user = removeUser(socket.id)
        if (user) {
            io.to(user.room).emit('message', generateMessage(`${user.username} left`))
            // Sending list of users to client after exiting some user
            io.to(user.room).emit('roomData',{
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
    })
})

server.listen(port,() => {
    console.log(`Server is up on ${port}`)
})