const mongoose =
require("mongoose");

const questionSchema =
new mongoose.Schema({

interviewId:{
type:mongoose
.Schema.Types.ObjectId,
ref:"Interview"
},

question:String,

answer:String,

feedback:String,

score:Number

});

module.exports=
mongoose.model(
"Question",
questionSchema
);