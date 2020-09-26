const socket = io()

const $messageInput = document.querySelector("#messageInput")
const $sendButton = document.querySelector("#sendButton")
const $sendLocation = document.querySelector("#send-location")

socket.on('message', (msg)=>{
    console.log(msg)
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

