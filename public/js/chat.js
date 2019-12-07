const socket = io()

// $ is used for ref only that these consts contains dom
// Elements
const $formElement = document.querySelector('#form')
const $locationButtonElement = document.querySelector('#share-location')
const $messageInputElement = document.querySelector('#msg')
const $messageButtonElement = document.querySelector('#message-button')
const $messageElement = document.querySelector('#messages')


// Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const sideBarTemplate = document.querySelector('#sidebar-template').innerHTML


// Options (Using object destructuring)
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true})


const autoscroll = () => {
    // New message element
    const $newMessage = $messageElement.lastElementChild
    // Height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    // Visible height
    const visibleHeight = $messageElement.offsetHeight
    // Height of messages container
    const containerHeight = $messageElement.scrollHeight

    // How far have I scrolled?
    const scrollOffset = $messageElement.scrollTop + visibleHeight
   
    $messageElement.scrollTop = $messageElement.scrollHeight
}

socket.on('message',(message) => {
    const html = Mustache.render(messageTemplate,{
        'message': message.message,
        'createdAt': moment(message.createdAt).format('h:mm a'),
        'username': message.username
    })
    $messageElement.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

$formElement.addEventListener('submit',(e) => {
    e.preventDefault()
    // Disable send button
    $messageButtonElement.setAttribute('disabled','disabled')
    const msg = $messageInputElement.value
    socket.emit('sendMessage', msg,(err) => {
        $messageButtonElement.removeAttribute('disabled')
        $messageInputElement.value = ''
        $messageInputElement.focus()
        if(err) {
            console.log(err)
        } 
    })
})

// Sending location to server
$locationButtonElement.addEventListener('click',() => {
    if (!navigator.geolocation) {
        return alert('Geolocation isnt supported')
    }
    $locationButtonElement.setAttribute('disabled','disabled')
    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit('sendLocation',{latitude: position.coords.latitude, longitude: position.coords.longitude, createdAt: new Date().getTime()},() => {
            $locationButtonElement.removeAttribute('disabled')
            console.log('Location shared')
        })
    })
})

socket.on('locationMessage',(response) => {
    const html = Mustache.render(locationTemplate, {
        'username': response.username,
        'location': response.url,
        'createdAt' : moment(response.createdAt).format('h:mm a')
    })
    $messageElement.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

// Send join event to server

socket.emit('join', {username, room}, (err) => {
    if (err) {
        alert(err)
        location.href = '/'
    }
})

socket.on('roomData',({room, users}) => {
    const html = Mustache.render(sideBarTemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})