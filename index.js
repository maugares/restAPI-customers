///////////////////////////////
///        API SETUP        ///
///////////////////////////////

//-- Require Express --//
const express = require('express')
const app = express()

//-- Create server on port 4003 --//
const port = 4003
app.listen(port, () => `Listening on port ${port}`)


//-- Connect Sequelize with the Postgres server --//
const Sequelize = require('sequelize')
const connectionString = process.env.DATABASE_URL || 'postgres://postgres:secret@localhost:5432/postgres'
const sequelize = new Sequelize(connectionString,
  {
    define:
    {
      timestamps: false,  // Prevent timestamps
      logging: false      // Prevent SQL logging
    }
  }
)

//-- Add a body parser for dealing with POST requests --//
const bodyParser = require('body-parser')
app.use(bodyParser.json())


//////////////////////////////
///        API BODY        ///
//////////////////////////////

//-- Create a table by using Sequelize --//
const Customers = sequelize.define('customers', {
  id: { 
    type: Sequelize.INTEGER, 
    // set the unique id as automatic primary key
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  first_name: {
    type: Sequelize.TEXT,
    validate: {
      // the minimum length should be 3 characters
      len: [3,]
    }
  },
  last_name: {
    type: Sequelize.TEXT,    
    validate: {
      // the minimum length should be 2 characters
      len: [2,]
    }
  },
  city: {
    type: Sequelize.TEXT,
    validate: {
      // the city should be one of these
      isIn: [['Amsterdam', 'Rotterdam', 'The Hague', 'Eindhoven']]
    }
  }
}, {
    tableName: 'customers'
  })

//-- Sync the table with the database when the app starts --//
Customers.sync()

/////////////
///  GET  ///
/////////////

//-- Get all customers --//
app.get('/customers', function (req, res, next) {
  Customers
    .findAll()
    .then(customers => {
      res.json({ customers: customers })
    })
    .catch(err => {
      res.status(500).json({
        message: 'Something went wrong',
        error: err
      })
    })
})

//-- Get a particular customer based on its id --//
app.get('/customer/:id', function (req, res, next) {
  const id = req.params.id
  Customer
    .findByPk(id)
    .then(customer => {
      res.json({ customer: customer.dataValues })
    })
    .catch(err => {
      res.status(500).json({
        message: 'Something went wrong',
        error: err
      })
    })
})


///////////////
///  POST   ///
///////////////

// To run it add POST in front of the request:
// e.g.: http POST :4003/customers

//--  Create a new customer  --//
app.post('/customers', function (req, res) {
  Customers
    .create({
      first_name: 'Paris',
      last_name: 'Hilton',
      city: 'Eindhoven'
    })
    .then(customer => res.status(201).json(customer))
  .catch(err => {
    console.log('log:', err.errors[0].message)
    res.status(500).json({
      message: 'Something went wrong',
      error: err
    })
  })
})


//////////////
///  PUT   ///
//////////////

//--  Update a specific customer  --//
app.put('/customers/:id', function (req, res) {
  const id = req.params.id
  Customers

    // select the customer to update
    .findByPk(id)

    // update the customer
    .then(customer => customer.update({
      first_name: 'Billy',
      last_name: 'Elliot'
    }))

    // inform the client about the actions taken
    .then(customer => {
      console.log(`The customer with ID ${customer.dataValues.id} is now updated`, customer.dataValues)
      res.status(200).json({
        message: `The customer with ID ${customer.dataValues.id} is now updated`, 
        customer
      })
    })

    // inform the client in case of errors
    .catch(err => {
      res.status(500).json({
        message: 'Something went wrong in the PUT method',
        error: err
      })
    })
})

/////////////////
///  DELETE   ///
/////////////////

//--  Deleting a specific customer  --//
app.delete('/customers/:id', function (req, res) {
  const id = req.params.id
  Customers
    .findByPk(id)

    .then(customer => {
      customer.destroy(customer)
      res.status(200).json(`The customer with ID ${id} has been deleted`)
    })
    .catch(err => {
      res.status(500).json({
        message: 'Something went wrong in the PUT method',
        error: err
      })
    })
})
