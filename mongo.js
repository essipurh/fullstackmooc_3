const mongoose = require('mongoose')

if (process.argv.length<3) {
  console.log('give password as argument')
  process.exit(1)
}

const password = process.argv[2]
const url =  `mongodb+srv://pessiapps:${password}@puhelinluettelo.slrhxjt.mongodb.net/puhelinluettelo?retryWrites=true&w=majority&appName=puhelinluettelo`
mongoose.set('strictQuery', false)
mongoose.connect(url)

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
})

const Person = mongoose.model('Person', personSchema)

const printPeople = (results) => {
  console.log('Phonebook:')
  results.forEach(person => {
    console.log(`${person.name} ${person.number}`)
  })
}

if (process.argv.length === 5) {
  const person = new Person({
    name: process.argv[3],
    number: process.argv[4],
  })

  person.save().then(result => {
  console.log(`added ${person.name} number ${person.number} to phonebook`)
  mongoose.connection.close()})
} else {
  Person.find({}).then(result => {
    printPeople(result)
    mongoose.connection.close()
  })
}
if (mongoose.connect.readyState === 1) {
  try {
    console.log('täällä')
    mongoose.connection.close()
    
  } catch (error) {
    console.log(eroor)

  }
} 

