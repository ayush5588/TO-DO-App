let express = require("express")
let mongodb = require("mongodb")
let sanitizehtml=require('sanitize-html');  // This prevents a mallicious user from entering any evil JS file even that user has the password and username for our app

let server=express() // start the server

let db  // Database variable is declared globaly

server.use(express.static('public'))  // In this way we can access the files of the 'public' folder from the 
                                      // root of the server. 

let connectionString='mongodb+srv://ayush5588:ayush5588@cluster0-ktpcz.mongodb.net/ToDoApp?retryWrites=true&w=majority'

mongodb.connect(connectionString,{useNewUrlParser: true},function(err,client){
    db=client.db()        // here our database is created
    server.listen(3000)   // added here instead of last because we only want to start listening when the connection
                          // to database is established
})

server.use(express.json())  // Add for post request handeled at line 82
server.use(express.urlencoded({extended: false}))

function signin(req,res,next){
  res.set('WWW-Authenticate','Basic realm="Simple To-Do App')  // This is a fixed line of code where in 'WWW-Authenticate' it tells the browser to authenticate itself and in 'Basic Realm' we give the name of our app
  console.log(req.headers.authorization)
  // username = 'myname'  password='firstapp'
  if(req.headers.authorization=='Basic bXluYW1lOmZpcnN0YXBw'){
    next()   // when the server will see the next() it will know that now it has to perform function present next to wherever 'signin' function is called
  }else{
    res.status(401).send('Authentication Required')
  }
}

server.use(signin);  // This tells our express server to run the signin function for all the routes. 

// When server will receive the get request it will first call the signin function and then function present after that
server.get('/',function(req,res){  
    // it will go to the databse and from our collection 'items'  it will find(i.e read) the document and convert
    // it to array which is easily readable by us.  
    db.collection("items").find().toArray(function(err,item){
      res.send(`<!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Simple To-Do App</title>
      <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.2.1/css/bootstrap.min.css" integrity="sha384-GJzZqFGwb1QTTN6wy59ffF1BuGJpLSa9DkKMp0DgiMDm4iYMj70gZWKYbI706tWS" crossorigin="anonymous">
    </head>
    <body>
      <div class="container">
        <h1 class="display-4 text-center py-1">To-Do App</h1>
        
        <div class="jumbotron p-3 shadow-sm">
          <form id="create-form" action="/create-item" method="POST">
            <div class="d-flex align-items-center">
              <input id="create-field" name="item" autofocus autocomplete="off" class="form-control mr-3" type="text" style="flex: 1;">
              <button class="btn btn-primary">Add New Item</button>
            </div>
          </form>
        </div>
        
        <ul id="item-list" class="list-group pb-5">
          
        </ul>
        
      </div>
      <script>
      let data=${JSON.stringify(item)}  //stringify converts the json data to the string of text
      </script>
      <script src="https://unpkg.com/axios/dist/axios.min.js"></script>
     <script src='/browser.js'></script> 
    </body>
    </html>
    `)
  })
    
})

// Here when we recieve a post request for the 'create-item' url then we will execute the anonymous function 
// which will insert document(i.e rows) which has one property 'name' whose value is equal to the task enetered 
// by the user. This will be inserted inside the 'items' collection(i.e table). And 'insertOne' method expect 
// 2 arguments- one that we defined above and the other is a function. Since we don't know how much time it will
// take the sent data to be inserted inside the database, so when the data is successfully entered then only 
// we will send the response message. 



server.post('/create-item',function(req,res){
    if(req.body.task==''){
      res.status(500).send('show_alert')  // if the user enters nothing and then press the submit button , in that case we are sending 
                                          // an error status to the client side i.e  back to axios which will display the error message using the pop-up 
    }
    else
    {
      let safetext=sanitizehtml(req.body.task,{allowedTags:[],allowedAttributes:{}})
      db.collection('items').insertOne({task: safetext},function(err,info){
        res.json(info.ops[0])
      })
    }
    
    
})

server.post('/update-item',function(req,res){
  let safetext=sanitizehtml(req.body.task,{allowedTags:[],allowedAttributes:{}})
  db.collection('items').findOneAndUpdate({_id: new mongodb.ObjectId(req.body.id)},{$set: {task: safetext}},function(){
    res.send("Success")
  })
})


// Axios send the post request to 'delete-task' url and when the server recieves that request it first deletes that from the database 
// and then with the help of the axios we delete it from the user-side i.e frontend page
server.post('/delete-task',function(req,res){
  db.collection('items').deleteOne({_id: new mongodb.ObjectId(req.body.id)},function(){
    res.send("Success")
  })
})