//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _=require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-pial:test123@cluster0.zxplm.mongodb.net/todolistDB",{useNewUrlParser:true, useUnifiedTopology: true, useFindAndModify: false});
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
  name:"<--Hit this to dlt"
});
const defaultItems = [item1,item2,item3];

const listSchema = {
  name:String,
  items: [itemsSchema]
};
const List = mongoose.model("List",listSchema);


app.get("/", function(req, res) {

  Item.find({},(err,foundItems)=>{

    if (foundItems.length===0) {
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
      res.render("list", {listTitle: "Today", newListItems: foundItems}); //here foundItems has all the items from database

    }

  });


});

app.get("/about", function(req, res){
  res.render("about");
});

app.get("/:customListName",(req,res)=>{
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name: customListName},(err, foundCustomList)=>{
    // if (!err) {
    //   if(!foundList){
    //     console.log("Doesn't exist");
    //   //  create new list
    //     const list = new List({
    //       name: customListName,
    //       items: defaultItems
    //     });
    //
    //     list.save();
    //     res.redirect("/"+customListName);
    //   }else{
    //     //showing an existing list
    //     console.log("Exists!");
    //     res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
    //   }
    // }
    if(err){
      console.log(err);
    }else{
      if (foundCustomList) {
        console.log("Exists!");
        res.render("list", {listTitle: foundCustomList.name, newListItems: foundCustomList.items});
      }else{
          console.log("Doesn't exist");
          //  create new list
          const list = new List({
              name: customListName,
              items: defaultItems
            });
            list.save();

            res.redirect("/"+ customListName);

      }
    }

  });
});

app.post("/custom",(req,res)=>{
  const newList = _.capitalize(req.body.newList);
  if(newList === "Today" || newList === ""){
    res.redirect("/");
  }else{
    res.redirect("/"+ newList);
  }
});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;
  const newitem = new Item({
    name: itemName
  });
  // Item.inserOne(newitem,(err)=>{
  //   if (err) {
  //     console.log(err);
  //   } else {
  //     console.log("new item inserted");
  //   }
  // });


  if (listName ==="Today") {
    newitem.save(); //do same as above insert code
    res.redirect("/");
  } else {
    List.findOne({name:listName},(err,foundList)=>{
      foundList.items.push(newitem);
      foundList.save();
      res.redirect("/"+listName);
    });
  }

});

app.post("/delete",(req,res)=>{
  const itemId = req.body.checkbox;
  const listName = req.body.listName;
  console.log(req.body.checkbox);


  if (listName==="Today") {
    Item.findByIdAndRemove(itemId,(err)=>{  //same code as above
      if (err) {
        console.log(err);
      }else{
        console.log("deleting succesful");
        res.redirect("/");
      }
    });

  } else {
    List.findOneAndUpdate({name:listName},{$pull:{items: {_id: itemId}}},(err,foundList)=>{ //find a list and update the list with $pull. we can do all of this with loops
      if(!err){
        res.redirect("/"+listName);
      }
    });
  }
  // Item.deleteOne({_id:itemId},(err)=>{
  //   if (err) {
  //     console.log(err);
  //   }else{
  //     console.log("deleting succesful");
  //   }
  // });


});

// app.get("/work", function(req,res){
//   res.render("list", {listTitle: "Work List", newListItems: workItems});
// });

let port = process.env.PORT;
if(port == null || port ==""){
  port = 3000;
}


app.listen(port, function() {
  console.log("Server has started succesfully");
});
