const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const {generateMessage} = require('../utils/createMessage')
const {generateLocation} = require('../utils/generateLocation')
var Filter = require('bad-words')

const app = express()
const server = http.createServer(app)
const io = socketio(server)


const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname, '../public')

app.use(express.static(publicDirectoryPath))

io.on('connection', (socket)=>{
    console.log('New Web Socket connection')

    socket.emit('message',generateMessage("Welcome"))
    socket.broadcast.emit('message', generateMessage("A new User has joined!"))

    socket.on('sendMessage', (msg, callback)=>{
        var filter = new Filter(); 

        if(filter.isProfane(msg)){
            return callback('Profanity not allowed')
        }

        io.emit('message', generateMessage(msg))
        callback("Message Delivered!")
    })

    socket.on('sendLocation', (coords, callback)=>{
          io.emit('renderLocation', generateLocation(`https://google.com/maps?q=${coords.latitude},${coords.longitude}`))
          callback("Location shared!")
    })

    socket.on('disconnect', ()=>{
        io.emit('message', generateMessage('A User has left!'))
    })
})

server.listen(port, () => {
    console.log(`Server is up on port ${port}`)
})


