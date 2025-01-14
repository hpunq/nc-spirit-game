const socket = io('https://localhost:3000')

socket.on('serverToClient', data => {
    alert(data)
})