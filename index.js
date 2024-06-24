const express = require('express')
const morgan = require('morgan')
const app = express()
const api = '/api/persons'
let persons =  [
  {
    name: "Arto Hellas",
    number: "040-123456",
    id: 1
  },
  {
    name: "Ada Lovelace",
    number: "139-44-532532",
    id: 2
  },
  {
    name: "Dan Abramov",
    number: "12-43-234345",
    id: 3
  },
  {
    name: "Mary Poppendieck",
    number: "39-23-6423122",
    id: 4
  }
]
morgan.token('body', (req) => JSON.stringify(req.body))

app.use(express.json())
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body')) // tiny with token body

app.get('/info', (req, res) => {
  res.send(`<p>Phonebook has info for ${persons.length} people</p>
            <p>${new Date()}</p>`)
})

app.get(api, (req, res) => {
  res.json(persons)
})

app.get(`${api}/:id`, (req, res) => {
  const id = req.params.id
  const person = persons.find(person => person.id === Number(id))
  if (person) {
    res.json(person)
  } else {
    res.status(404).end()
  }
})

app.delete(`${api}/:id`, (req,res) => {
  const id = Number(req.params.id)
  persons = persons.filter(person => person.id !== id)
  res.status(204).end()
})

app.post(`${api}`, (req, res) => {
  const body = req.body
  if (!body.name || !body.number) {
    return res.status(400).json({error: 'Must include name and number.'})
  }
  if (persons.filter(person => person.name.toLowerCase() === body.name.toLowerCase()).length !== 0) {
    return res.status(400).json({error: 'Name must be unique.'})
  }
    const newPerson = {
      id: Math.floor(Math.random()*100000),
      ...req.body
    }
    console.log(newPerson)
    persons = persons.concat(newPerson)
    res.json(newPerson)
})

const PORT = 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})