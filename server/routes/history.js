const router = require('express').Router()
const History = require('../models/History')
const protect = require('../middleware/auth')

// All routes protected
router.use(protect)

// POST /api/history — save a history entry
router.post('/', async (req, res) => {
  try {
    const { type, title, summary, score, data } = req.body
    if (!type || !title || !data)
      return res.status(400).json({ message: 'type, title and data are required' })

    const entry = await History.create({
      userId: req.user._id,
      type, title, summary: summary || '', score: score ?? null, data,
    })

    // Prune: keep only latest 50 per type per user
    const count = await History.countDocuments({ userId: req.user._id, type })
    if (count > 50) {
      const oldest = await History.find({ userId: req.user._id, type })
        .sort({ createdAt: 1 })
        .limit(count - 50)
        .select('_id')
      await History.deleteMany({ _id: { $in: oldest.map(o => o._id) } })
    }

    res.status(201).json(entry)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// GET /api/history?type=resume — get all history (optionally filtered by type)
router.get('/', async (req, res) => {
  try {
    const filter = { userId: req.user._id }
    if (req.query.type) filter.type = req.query.type
    const entries = await History.find(filter)
      .sort({ createdAt: -1 })
      .limit(100)
      .select('-data') // exclude heavy data from list
    res.json(entries)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// GET /api/history/:id — get single entry with full data
router.get('/:id', async (req, res) => {
  try {
    const entry = await History.findOne({ _id: req.params.id, userId: req.user._id })
    if (!entry) return res.status(404).json({ message: 'Not found' })
    res.json(entry)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// DELETE /api/history/:id
router.delete('/:id', async (req, res) => {
  try {
    await History.findOneAndDelete({ _id: req.params.id, userId: req.user._id })
    res.json({ message: 'Deleted' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// DELETE /api/history?type=resume — clear all of a type
router.delete('/', async (req, res) => {
  try {
    const filter = { userId: req.user._id }
    if (req.query.type) filter.type = req.query.type
    await History.deleteMany(filter)
    res.json({ message: 'Cleared' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router
