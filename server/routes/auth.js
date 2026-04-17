const router = require('express').Router()
const jwt = require('jsonwebtoken')
const User = require('../models/User')
const protect = require('../middleware/auth')

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' })

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body
    if (!name || !email || !password)
      return res.status(400).json({ message: 'All fields are required' })
    if (password.length < 6)
      return res.status(400).json({ message: 'Password must be at least 6 characters' })

    const exists = await User.findOne({ email })
    if (exists) return res.status(400).json({ message: 'Email already registered' })

    const user = await User.create({ name, email, password })
    res.status(201).json({
      token: signToken(user._id),
      user: { id: user._id, name: user.name, email: user.email, role: user.role, skills: user.skills },
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password)
      return res.status(400).json({ message: 'Email and password required' })

    const user = await User.findOne({ email })
    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ message: 'Invalid email or password' })

    res.json({
      token: signToken(user._id),
      user: { id: user._id, name: user.name, email: user.email, role: user.role, skills: user.skills },
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// GET /api/auth/me  (protected)
router.get('/me', protect, (req, res) => {
  const u = req.user
  res.json({ id: u._id, name: u.name, email: u.email, role: u.role, skills: u.skills })
})

// PUT /api/auth/profile  (protected)
router.put('/profile', protect, async (req, res) => {
  try {
    const { name, role, skills } = req.body
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, role, skills },
      { new: true, runValidators: true }
    ).select('-password')
    res.json({ id: user._id, name: user.name, email: user.email, role: user.role, skills: user.skills })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router
