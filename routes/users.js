let mongoose = require('mongoose')
let plm = require('passport-local-mongoose')
mongoose.connect("mongodb://127.0.0.1:27017/notes");

let user = new mongoose.Schema({
    name: String,
    username: String,
    secret: String,
    password: String,
    note:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'data',
 }] ,
    date : Date
})
user.plugin(plm);
module.exports = mongoose.model('user', user)