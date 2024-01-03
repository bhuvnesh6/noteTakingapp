let mongoose = require('mongoose')
mongoose.connect("mongodb://127.0.0.1:27017/notes");

let data = new mongoose.Schema({
    title: String,
    content: String,
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
 } ,
    date : Date
})

module.exports = mongoose.model('data', data)