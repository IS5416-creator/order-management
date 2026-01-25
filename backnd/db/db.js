const mongoose = require("mongoose")

mongoose.connect('mongodb+srv://israel:israel@cluster0.yyptkvj.mongodb.net/?appName=Cluster0')
.then(()=>console.log("mongodb connected"))
.catch((err)=>console.log(err))