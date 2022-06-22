require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bodyParser = require('body-parser')
const dns = require('dns')
const app = express();
app.use(bodyParser.urlencoded({extended:false}))
app.use(cors())
// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

const urlSchema =  mongoose.Schema({
  urlId:{
    type:Number,
    required:true
  },
  webIp:String,
  createdAt:{
    type:Date,
    default:Date.now()
  }
})
let Url = mongoose.model("Url", urlSchema);

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

app.post('/api/shorturl', function(req, res) {
  const url = req.body.url.split('/');
  dns.resolve4(url[2],(err,add)=>{
    if(err) {
      return res.json({"error":"Invalid Hostname"})
    }else{
      Url.findOne({webIp:req.body.url}).exec((err,data)=>{
        if(data !== null){
          return res.json({"original_url":req.body.url,"short_url":data.urlId})
        }else if(err){
          return res.send('Error occured')
        }
      Url.findOne().sort({createdAt:-1}).exec((err,lastItem)=>{
        if(err){
          console.log(err);
        }
        let id;
        if(lastItem === null){
           id = 1;
        }
        else{
          id = lastItem.urlId+1;
        }
        let newEntry = new Url({
          urlId:id,
          webIp:req.body.url
        })
        newEntry.save((err,data)=>{
          if(err){
            console.log(err)
          }
          return res.json({"original_url":req.body.url,"short_url":id})
        })
      });
      })
    }   
  })
});

app.get('/api/shorturl/:id',(req,res)=>{
  Url.findOne({urlId:req.params.id}).exec((err,data)=>{
    if(err){
      return console.log(err)
    }
    console.log(data.webIp)
    res.redirect(data.webIp);
  })
})
// mongodb connection
mongoose.connect(process.env.MONGO_URI,(err,data)=>{
  if(err){
    console.log(err)
  }
  console.log('success')
})
// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});


app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
