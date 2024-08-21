const express = require('express')
const cookieParser = require('cookie-parser')
const app = express()
const cors = require('cors')
const jwt = require('jsonwebtoken')

const JWT_SECRET = 'secret'

app.use(express.json())

app.use(cors({
	origin: true,
	credentials: true
}))
app.use(express.urlencoded({extended: true}))
app.use(cookieParser())

app.get('/', (req, res) => {
	res.send('I am working')
})

app.post('/login', (req, res) => {
	const token = jwt.sign({user: 'ajay'}, JWT_SECRET)
	res.cookie('token', token, {
		maxAge: 900000,
		httpOnly: true,
		sameSite: 'none',
		secure: true,
		domain: 'vercel.app'
	})
	return res.json({success: true, message: 'Login successful'})
})

app.get('/profile', (req, res) => {
	try {
		const token = req.cookies.token
		console.log('cookies -> ',req.cookies.token)
		if (!token) {
			return res.json({success: false, error: 'No token'})
			
		}
		jwt.verify(token, JWT_SECRET, (err, decoded) => {
			if (err) {
				return res.json({success: false, error: 'Invalid token'}) 
				
			}
			return res.json({success: true, user: decoded.user})
		})
		// return res.json({success: true, user: decoded.user})
	} catch (error) {
		return res.json({success: false, error: 'Internal server error'})
	}

})


app.listen(8000)
