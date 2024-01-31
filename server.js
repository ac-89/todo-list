// Import express
const express = require('express')
// Assign express to variable
const app = express()
//Import MongoDB MongoClient
const MongoClient = require('mongodb').MongoClient
// Assign PORT number to variable
const PORT = 2121
//Import dotenv
require('dotenv').config()

//Create db variable, 
let db,
// Create dbConnectionStr variable to assign the db URL
    dbConnectionStr = process.env.DB_STRING,
//Database name
    dbName = 'todo'

//Connect to Mongo database. 
MongoClient.connect(dbConnectionStr, { useUnifiedTopology: true })
    .then(client => {
        //Log to console if connection is successful
        console.log(`Connected to ${dbName} Database`)
        //Assign teh databaser to the db variable
        db = client.db(dbName)
    })

// Set the view engine to render the ejs code
app.set('view engine', 'ejs')
//Make the public folder availabe to the server to connect CSS and client-side JS.
app.use(express.static('public'))
//Parses incoming URLs 
app.use(express.urlencoded({ extended: true }))
//Parses JSON
app.use(express.json())

//Method to handle GET requests on the home path
app.get('/',async (request, response)=>{
    //Pulls data from the db and creates an array from it                
    const todoItems = await db.collection('todos').find().toArray()
    //Creates an array of data with the "completed" property of false
    const itemsLeft = await db.collection('todos').countDocuments({completed: false})
    //Renders index.ejs with the two sets of data above
    response.render('index.ejs', { items: todoItems, left: itemsLeft })
    // db.collection('todos').find().toArray()
    // .then(data => {
    //     db.collection('todos').countDocuments({completed: false})
    //     .then(itemsLeft => {
    //         response.render('index.ejs', { items: data, left: itemsLeft })
    //     })
    // })
    // .catch(error => console.error(error))
})
//POST requests add data to a database. 
app.post('/addTodo', (request, response) => {
    //Inserts the submitted data to the database
    db.collection('todos').insertOne({thing: request.body.todoItem, completed: false})
    .then(result => {
        console.log('Todo Added')
        ////Refreshes the page
        response.redirect('/')
    })
    .catch(error => console.error(error))
})
//PUT requests update data in a database
app.put('/markComplete', (request, response) => {
    db.collection('todos').updateOne({thing: request.body.itemFromJS},{
        //Setter to set the completed attribut to true
        $set: {
            completed: true
          }
    },{
        //Sorts the data by the _id propety in reverse order
        sort: {_id: -1},
        //Prevents mongo from creating a new entry.
        upsert: false
    })
    .then(result => {
        console.log('Marked Complete')
        response.json('Marked Complete')
    })
    .catch(error => console.error(error))

})
//PUT request to mark tasks as uncomplete.
app.put('/markUnComplete', (request, response) => {
    db.collection('todos').updateOne({thing: request.body.itemFromJS},{
        $set: {
            completed: false
          }
    },{
        sort: {_id: -1},
        upsert: false
    })
    .then(result => {
        console.log('Marked Complete')
        response.json('Marked Complete')
    })
    .catch(error => console.error(error))
})
//DELETE requests delete items
app.delete('/deleteItem', (request, response) => {
    //deleteOne() finds the data passed and deletes it.
    db.collection('todos').deleteOne({thing: request.body.itemFromJS})
    .then(result => {
        console.log('Todo Deleted')
        response.json('Todo Deleted')
    })
    .catch(error => console.error(error))
})
//app.listen opens the server up to be accessed on a certain port number.
app.listen(process.env.PORT || PORT, ()=>{
    console.log(`Server running on port ${PORT}`)
})
