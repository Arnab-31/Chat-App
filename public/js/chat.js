const socket = io()

//Elements
const $messageInput = document.querySelector("#messageInput")
const $sendButton = document.querySelector("#sendButton")
const $sendLocation = document.querySelector("#send-location")
const $messages = document.querySelector("#messages")

//Templates
const messageTemplate = document.querySelector("#message-template").innerHTML
const locationTemplate = document.querySelector("#location-template").innerHTML
const sidebarTemplate = document.querySelector("#sidebar-template").innerHTML

//Options
const {username, room} = Qs.parse(location.search, {ignoreQueryPrefix: true} )

// const autoscroll = () => {
//     $messages.scrollTop = $messages.scrollHeight
// }

const autoscroll = () => {
    // New message element
    const $newMessage = $messages.lastElementChild

    // Height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    // Visible height
    const visibleHeight = $messages.offsetHeight

    // Height of messages container
    const containerHeight = $messages.scrollHeight

    // How far have I scrolled?
    const scrollOffset = $messages.scrollTop + visibleHeight

    if (containerHeight - newMessageHeight <= scrollOffset+1) {
        $messages.scrollTop = $messages.scrollHeight
    }
}

socket.on('message', (msg)=>{
    console.log(msg)
    const html = Mustache.render(messageTemplate, {username:msg.username, message: msg.text, timestamp: moment(msg.createdAt).format('h:mm a')})
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

socket.on('renderLocation', (loc)=>{
    console.log(loc)
    const html = Mustache.render(locationTemplate, {username:loc.username, location: loc.url, timestamp:  moment(loc.createdAt).format('h:mm a')})
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

document.querySelector("button").addEventListener('click', ()=>{
    
    var msg = document.querySelector("input").value;
    if(msg!=''){
        $sendButton.setAttribute('disabled', 'disabled')
        socket.emit('sendMessage', msg, (returnMessage) => {
            $sendButton.removeAttribute('disabled')
            $messageInput.value=''
            $messageInput.focus()
            console.log(returnMessage)
        })
    }
})

socket.on('roomData', ({room, users}) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })

    document.querySelector("#chat-sidebar").innerHTML = html
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
