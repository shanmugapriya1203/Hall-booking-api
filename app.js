import express from "express";
import { MongoClient } from "mongodb";
import { ObjectId } from "mongodb";
import * as dotenv from 'dotenv';
dotenv.config()
const app=express();
const port=4000;
const url=process.env.url
const client=new MongoClient(url)
await client.connect();
console.log("Mongo is connected")
app.use(express.json())

app.get("/",function(req,res){
    res.send("Welcome to hall booking api 😊")
})

const roomBookings = client.db("Halls").collection("bookings");
const roomcollection = client.db("Halls").collection("rooms");
app.post("/create-room",async(req,res)=>{
    
    try{
    const room=req.body;
const mv=roomcollection.insertMany(room)
res.send("Room created successfully")
    }
    catch{
        res.status(500).send({error:"Error Creating a room"})
    }
})
app.post("/book-room",async(req,res)=>{
    try {
        await client.connect();
      
        const roomAvailability = await roomBookings.findOne({
            roomId: req.body.roomId,
            date: req.body.date,
            startTime: { $lte: req.body.endTime },
            endTime: { $gte: req.body.startTime },
        });
        if (roomAvailability) {
            res.status(400).send({ message: "Room is not available for the given time." });
            return;
        }
        await roomBookings.insertOne({
            RoomName :req.body.RoomName, 
            customerName: req.body.customerName,
            date: req.body.date,
            startTime: req.body.startTime,
            endTime: req.body.endTime,
            roomId: req.body.roomId,
        });

         await roomcollection.updateOne(
           
            { _id: ObjectId(req.body.roomId) },
            { $set: { booked: true ,CustomerName : req.body.customerName,date:req.body.date, startTime: req.body.startTime,
                endTime: req.body.endTime, } }
          );
      
        res.status(201).send({ message: "Room booked successfully." });
    } catch (error) {
        console.log(error)
        res.status(500).send({ message: "Failed to book the room." });
    } finally {
        client.close();
    }
})
app.get("/roomdetails",async(req,res)=>{
    try{
        const roomdetails=await roomcollection.find({}).toArray();
        res.json(roomdetails)
    }
    catch{
        res.status(500).json({message:"Can't fetch the room details"})
    }
})
app.get("/bookdetails",async(req,res)=>{
    try{
        const bookingdetails=await roomBookings.find({}).toArray();
        res.json(bookingdetails)
    }
    catch{
res.status(500).json({message:"Can't fetch booking details"})
    }
})


app.listen(port,()=>{
    console.log("Listening on port"+port)
})