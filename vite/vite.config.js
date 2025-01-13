import vitePluginSocketIO from 'vite-plugin-socket-io'
import { defineConfig } from 'vite';

const socketEvents = (io, socket) => {
  console.log('socket.io - connection');
  socket.on('disconnect', () => {
    console.log(`socket.io - socket.id \`${socket.id}\` disconnected`)
  })
  socket.on('signin', () => {
    console.log('socket.io - signin')
  })
}

export default defineConfig({
  plugins: [vitePluginSocketIO({socketEvents})]
})