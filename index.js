const express = require('express')
const http = require('http')
const { Server } = require('socket.io')
const cookieParser = require('cookie-parser')
const cors = require('cors')
const jwt = require('jsonwebtoken')

const JWT_SECRET = 'secret'

const app = express()
const server = http.createServer(app)

app.use(express.json())
app.use(cors({
  origin: 'http://abc.com',
  credentials: true
}))
app.use(express.urlencoded({extended: true}))
app.use(cookieParser())

const io = new Server(server, {
	cors: {
	  origin: ['http://localhost:5173', 'https://abc.com'],
	}
  })

// Socket connection handling
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  // Disconnect handling
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.user);
    socket.broadcast.emit('userDisconnected', {
      user: socket.user,
      message: `${socket.user} has left the chat`
    });
  });
});

app.get('/', (req, res) => {
  res.send('I am working')
})

app.post('/login', (req, res) => {
  const token = jwt.sign({user: 'ajay'}, JWT_SECRET)
  return res.json({success: true, message: 'Login successful', data: token})
})

app.get('/profile', (req, res) => {
  try {
    const bearerToken = req.headers.authorization
    const token = bearerToken.split(' ')[1]
    console.log('token -> ', token)
    if (!token) {
      return res.json({success: false, error: 'No token'})
    }
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.json({success: false, error: 'Invalid token'}) 
      }
      return res.json({success: true, user: decoded.user})
    })
  } catch (error) {
    return res.json({success: false, error: 'Internal server error'})
  }
})

const PORT = process.env.PORT || 8000
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})