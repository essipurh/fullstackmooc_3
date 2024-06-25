require('dotenv').config()
const express = require('express')
const app = express()
const morgan = require('morgan')
morgan.token('body', (req) => JSON.stringify(req.body))
const cors = require('cors')
const Person = require('./models/person')
const api = '/api/persons'

app.use(express.static('dist'))
app.use(express.json())
app.use(cors())
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body')) // tiny with token body

app.get('/info', (req, res, next) => {
  Person.find({})
    .then(persons => {
      res.send(`<p>Phonebook has info for ${persons.length} people</p>
                <p>${new Date()}</p>`)
    })
    .catch(error => next(error))
})

app.get(api, (req, res) => {
  Person.find({}).then(persons => res.json(persons))
})

app.get(`${api}/:id`, (req, res, next) => {
  Person.findById(req.params.id)
    .then(person => {
      if (person) {
        res.json(person)
      } else {
        res.status(404).end()
      }
    })
  .catch(error => next(error))
})

app.delete(`${api}/:id`, (req, res, next) => {
  Person.findByIdAndDelete(req.params.id)
    .then(result => res.status(204).end())
    .catch(error => next(error))
})

app.post(`${api}`, (req, res, next) => {
  const body = req.body
  if (!body.name || !body.number) {
    return res.status(400).send({error: 'Must include name and number.'})
  }
  const newPerson = new Person({
    name: body.name,
    number: body.number
  })
  Person.find({name: {$regex : new RegExp(body.name, "i")}})
    .then(result => {
      if (result.length === 0) {
        newPerson.save().then(saved => res.json(saved))
      } else {
        res.status(400).json({error: 'Name must be unique.'})
      }
    })
    .catch(error => {
      console.log('errorissa')
      next(error)
    })
})
app.put(`${api}/:id`, (req, res, next) => {
  const body = req.body
  if (!body.number) {
    return res.status(400).send({error: 'Must include name and number.'})
  }
  const person = {
    name: body.name,
    number: body.number
  }
  Person.findByIdAndUpdate(req.params.id, person, { new: true }) // muuttunut olio mukaan palautuksessa
    .then(updatedPerson => {
      if (!updatedPerson) {
        return res.status(404).end()
      }
      res.json(updatedPerson)
      
    })
    .catch(error => {
      console.log(error)
      next(error)
    })
})

const unknownEndpoint = (req,res) => res.status(404).send({ error: 'unknown endpoint' })
app.use(unknownEndpoint)

const errorHandler = ( error, request,response, next) => {
  console.log(error.message)
  if (error.name === 'CastError') {
    return res.status(400).send({error: 'malformatted id'})
  }

  next(error)
}
app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})