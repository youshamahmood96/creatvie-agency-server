const express = require('express')
const app = express()
const port = 5000
const cors = require('cors')
const fs = require('fs-extra')
const fileUpload = require('express-fileupload')
const bodyParser = require('body-parser')
const ObjectId = require('mongodb').ObjectId
app.use(cors())
app.use(express.static('Icons'))
app.use(fileUpload())
app.use(bodyParser.json())
//initialize dotenv
require('dotenv').config()


const MongoClient = require('mongodb').MongoClient;
const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.jhvkz.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true,useUnifiedTopology: true });
client.connect(err => {
  const services = client.db(`${process.env.DB_NAME}`).collection(`${process.env.DB_COLLECTION_ONE}`);
  const customerServices = client.db(`${process.env.DB_NAME}`).collection(`${process.env.DB_COLLECTION_TWO}`);
  const reviews = client.db(`${process.env.DB_NAME}`).collection(`${process.env.DB_COLLECTION_THREE}`);
  const admin = client.db(`${process.env.DB_NAME}`).collection(`${process.env.DB_COLLECTION_FOUR}`);
  app.post('/services',(req, res) => {
      const title = req.body.title
      const file = req.files.file
      const description = req.body.description
      const filePath = `${__dirname}/Icons/${file.name}`
      file.mv(filePath,err => {
          if(err) {
              console.log(err);
              res.status(500).send({msg:'Failed to upload image'});
          }
          const newImage = fs.readFileSync(filePath);
          const encodedImage = newImage.toString('base64')
          var image = {
              contentType: req.files.file.mimetype,
              size:req.files.file.size,
              img:Buffer(encodedImage,'base64')
          };
          services.insertOne({title,description,image})
          .then(result=>{
              fs.remove(filePath,error => {
                  if(error){
                      console.log(error);
                      res.status(500).send({msg:'Failed to upload image'});
                  }
                  res.send(result.insertedCount>0)
              })
          })
      })
  })
  app.post('/addServices',(req, res)=>{
      const addedService = req.body
      customerServices.insertOne(addedService)
      
  })
  app.get('/allServices',(req, res)=>{
      services.find({})
      .toArray((err,documents)=>{
          res.send(documents)
      })
  })
  app.get('/totalServices',(req,res) => {
    customerServices.find({email:req.query.email})
    .toArray((err,documents)=>{
        res.send(documents)
    })
})
 app.post('/reviews',(req, res)=>{
     const review = req.body
     reviews.insertOne(review)
 })
 app.get('/allReviews',(req, res)=>{
     reviews.find({})
     .toArray((err,documents)=>{
         res.send(documents)
     })
 })
 app.get('/adminServices',(req,res) => {
    customerServices.find({})
    .toArray((err,documents)=>{
        res.send(documents)
    })
})
app.patch('/update/:id',(req, res)=>{
    customerServices.updateOne({_id:ObjectId(req.params.id)},
    {
        $set:{status:req.body.status}
    }
    )
    .then(result=>{
        
    })
})
app.post('/isAdmin',(req, res)=>{
  const email = req.body.email
  admin.find({email:email})
  .toArray((err,documents)=>{
      res.send(documents.length>0)
  })
})
app.post('/adminList',(req, res)=>{
    const adminEmail = req.body
    admin.insertOne(adminEmail)
})
});



app.listen(process.env.PORT || port)