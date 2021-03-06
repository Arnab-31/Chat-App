const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const {generateMessage} = require('./utils/createMessage')
const {generateLocation} = require('./utils/generateLocation')
var Filter = require('bad-words')
const {addUser, removeUser, getUser, getUsersInRoom} = require('./utils/user')

const app = express()
const server = http.createServer(app)
const io = socketio(server)


const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname, '../public')

app.use(express.static(publicDirectoryPath))

io.on('connection', (socket)=>{
    console.log('New Web Socket connection')

    
    socket.on('join', (options, callback) => {
        const {error, user } = addUser({id: socket.id, ...options})

        if(error){
            return callback(error)
        }
        
        socket.join(user.room)

        socket.emit('message',generateMessage('Admin', `Welcome  ${user.username}`))
        socket.broadcast.to(user.room).emit('message', generateMessage('Admin', `${user.username} has joined!`))
        
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })
        callback()
    })

    socket.on('sendMessage', (msg, callback)=>{
        var user = getUser(socket.id)
        var filter = new Filter(); 

        if(filter.isProfane(msg)){
            return callback('Profanity not allowed')
        }
        
        if(!user){
            return callback("User does not exist!")
        }

        io.to(user.room).emit('message', generateMessage(user.username, msg))
        callback()
        
    })

    socket.on('sendLocation', (coords, callback)=>{
          var user = getUser(socket.id)
          if(!user){
            return callback("User does not exist!")
          }
          io.to(user.room).emit('renderLocation', generateLocation(user.username, `https://google.com/maps?q=${coords.latitude},${coords.longitude}`))
          callback("Location shared!")
    })

    socket.on('disconnect', ()=>{
        const user = removeUser(socket.id)

        if(user) {
            io.to(user.room).emit('message', generateMessage('Admin',`${user.username} has left the chat!`))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }

       
        
    })
})

server.listen(port, () => {
    console.log(`Server is up on port ${port}`)
})


