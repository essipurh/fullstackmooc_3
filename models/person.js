const mongoose = require('mongoose')
mongoose.set('strictQuery', false)

const url = process.env.MONGODB_URI
console.log('connecting to', url)
mongoose.connect(url)
  .then(result => console.log('connected to MongoDB'))
  .catch(error => console.log('error connecting to MongoDB:', error.message))

const personSchema = new mongoose.Schema({
  name: {
    type: String,
    minlength: [3, 'Name must be at minimum 3 characters long.'],
    required: [true, 'Name is required.'],
    unique: [true, 'Name must be unique.']
  },
  number: {
    type: String,
    validate: {
      message: ({ value }) => `${value} not a valid phone number! Must be like xxx-xxxxx or xx-xxxxxx and minimum 8 digits.`,
      validator: (v) => /^\d{2,3}-\d{6,}/.test(v),
    },
    required: [true, 'Number is required.']
  }
})

personSchema.set('toJSON', {
  transform: (doc, returnedObj) => {
    returnedObj.id = returnedObj._id.toString()
    delete returnedObj._id
    delete returnedObj.__v
  }
})

module.exports = mongoose.model('Person', personSchema)

