const socket = io()

//Elements
const $messageInput = document.querySelector("#messageInput")
const $sendButton = document.querySelector("#sendButton")
const $sendLocation = document.querySelector("#send-location")
const $messages = document.querySelector("#messages")

//Templates
const messageTemplate = document.querySelector("#message-template").innerHTML
const locationTemplate = document.querySelector("#location-template").innerHTML

//Options
const {username, room} = Qs.parse(location.search, {ignoreQueryPrefix: true} )

socket.on('message', (msg)=>{
    console.log(msg)
    const html = Mustache.render(messageTemplate, {username:msg.username, message: msg.text, timestamp: moment(msg.createdAt).format('h:mm a')})
    $messages.insertAdjacentHTML('beforeend',html)
})

socket.on('renderLocation', (loc)=>{
    console.log(loc)
    const html = Mustache.render(locationTemplate, {username:loc.username, location: loc.url, timestamp:  moment(loc.createdAt).format('h:mm a')})
    $messages.insertAdjacentHTML('beforeend',html)
})

document.querySelector("button").addEventListener('click', ()=>{
    $sendButton.setAttribute('disabled', 'disabled')
    
    var msg = document.querySelector("input").value;

    socket.emit('sendMessage', msg, (returnMessage) => {
        $sendButton.removeAttribute('disabled')
        $messageInput.value=''
        $messageInput.focus()
        console.log(returnMessage)
    })
})



$sendLocation.addEventListener('click', ()=>{
    $sendLocation.setAttribute('disabled', 'disabled')
    
    if(!navigator.geolocation) {
        return alert('Geolocation is not supported by your browser/')
    }

    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit('sendLocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, (returnMessage)=>{
            $sendLocation.removeAttribute('disabled')
            console.log(returnMessage);
        } )
    })
})


socket.emit('join', { username, room }, (error) => {
    if (error) {
        location.href = '/'
        alert(error)
    }
} )
