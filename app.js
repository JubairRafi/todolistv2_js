//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");


const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todolistDB",{useNewUrlParser:true, useUnifiedTopology: true});
//item schema
const itemsSchema = new mongoose.Schema({
  name: String
});
 //item model which follows item schema
const Item = new mongoose.model("item",itemsSchema);

// items for db
const item1 = new Item({
  name:"welcome"
});
const item2 = new Item({
  name:"hit + for add"
});
const item3 = new Item({
  name:"Hit this to dlt"
});

const defaultItems = [item1,item2,item3];


app.get("/", function(req, res) {

  Item.find({},(err,foundItems)=>{

    if (foundItems.length==0) {
      //insert into db
      Item.insertMany(defaultItems,(err)=>{
        if (err) {
          console.log(err);
        } else {
          console.log("succesfully inserted");
        }
      });
      res.redirect("/");
    }else{
      res.render("list", {listTitle: "Today", newListItems: foundItems});

    }

  });


});

app.post("/", function(req, res){

  const item = req.body.newItem;

  if (req.body.list === "Work") {
    workItems.push(item);
    res.redirect("/work");
  } else {
    items.push(item);
    res.redirect("/");
  }
});

app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
