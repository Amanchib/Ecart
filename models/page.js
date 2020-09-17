var mongoose = require('mongoose');

//Page schema

var PageSchema = mongoose.Schema({
title : {
    type: String,
    require:true
},
slug : {
    type: String,
    
},

content : {
    type: String,
    require:true
},
sorting : {
    type: Number,
    
}

});


var page = module.exports = mongoose.model('Page',PageSchema);