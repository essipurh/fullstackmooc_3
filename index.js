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

app.get(api, (req, res, next) => {
  Person.find({})
    .then(persons => res.json(persons))
    .catch(error => next(error))
})

app.get(`${api}/:id`, (req, res, next) => {
  Person.findById(req.params.id)
    .then(person => {
      if (person) {
        res.json(person)
      } else {
        throw ({ name:'error.personNotFound', message:'person not found' })
      }
    })
    .catch(error => next(error))
})

app.delete(`${api}/:id`, (req, res, next) => {
  Person.findByIdAndDelete(req.params.id)
    .then(result => {console.log(result); return (res.status(204).end())})
    .catch(error => next(error))
})

app.post(`${api}`, (req, res, next) => {
  const body = req.body
  const reg = /^.{1}|[ -].{1}/g

  const newPerson = new Person({
    name: body.name.replace(reg, c => c.toUpperCase()),
    number: body.number
  })
  newPerson.save()
    .then(saved => res.json(saved))
    .catch(error => {
      next(error)
    })
})

app.put(`${api}/:id`, (req, res, next) => {
  const body = req.body
  const reg = /^.{1}|[ -].{1}/g
  const person = {
    name: body.name.replace(reg, c => c.toUpperCase()),
    number: body.number
  }
  Person.findByIdAndUpdate(req.params.id, person, { new: true, runValidators: true, context: 'query' }) // new: true muuttunut olio mukaan palautuksessa
    .then(updatedPerson => {
      if (!updatedPerson) {
        throw ({ name:'error.personNotFound', message: 'Person not found.' })
      }
      res.json(updatedPerson)
    })
    .catch(error => {
      next(error)
    })
})

const unknownEndpoint = (req,res) => res.status(404).send({ error: 'Unknown endpoint.' })
app.use(unknownEndpoint)

const errorHandler = ( error, req ,res, next) => {
  if (error.name === 'CastError') {
    return res.status(400).send({ error:'error.malformaddedId', message:'Malformatted id.' }) // might need to change for future, so that the message shows in the ui
  } else if (error.name ==='ValidationError') {
    return res.status(400).json({ error: error.errors })
  } else if (error.name === 'error.personNotFound') {
    return res.status(404).send({ error: { notFound: error } })
  }

  next(error)
}
app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})