var express = require('express');
var router = express.Router();
var mkdir = require('mkdirp');
var multer = require('multer');
var fs = require('fs-extra');
var resizeImg = require('resize-img');

// Get Product model

var Product = require('../models/product') ;

// Get category model

var Category = require('../models/category') ;

/*
*Get Product index
*/
router.get('/' ,function(req , res){

   var count;
   Product.count(function(err,c){
       count=c;
   });

   Product.find(function(err , products){
       res.render('products',{
       products:products,
       count:count
   });
});
    });

/*
*Get Add product
*/
router.get('/addproduct' ,function(req , res){

    var title ="";
    var desc="";
    var price= "";
Category.find(function(err , categories){

    res.render('addproduct',{
        title : title,
        desc : desc,
        categories:categories,
        price : price
        });
});


    });


/*
* Post Add product 
*/




router.post('/addproduct', function (req, res) {
 var imageFile;
     if(!req.files){imageFile=" ";}
     if(req.files)
     imageFile = typeof req.files.image !== "undefined" ? req.files.image.name : " ";
    
    
//var imageFile = multer();


    req.checkBody('title', 'Title must have a value.').notEmpty();
    req.checkBody('desc', 'Description must have a value.').notEmpty();
    req.checkBody('price', 'Price must have a value.').isDecimal();
    req.checkBody('image', 'You must upload an image').isImage(imageFile);

    var title = req.body.title;
    var slug = title.replace(/\s+/g, '-').toLowerCase();
    var desc = req.body.desc;
    var price = req.body.price;
    var category = req.body.category;

    var errors = req.validationErrors();

    if (errors) {
        Category.find(function (err, categories) {
            res.render('addproduct', {
                errors: errors,
                title: title,
                desc: desc,
                categories: categories,
                price: price
            });
        });
    } else {
        Product.findOne({slug: slug}, function (err, product) {
            if (product) {
                req.flash('danger', 'Product title exists, choose another.');
                Category.find(function (err, categories) {
                    res.render('addproduct', {
                        title: title,
                        desc: desc,
                        categories: categories,
                        price: price
                    });
                });
            } else {

                var price2 = parseFloat(price).toFixed(2);

                var product = new Product({
                    title: title,
                    slug: slug,
                    desc: desc,
                    price: price2,
                    category: category,
                    image: imageFile
                });

                product.save(function (err) {
                    if (err)
                        return console.log(err);

                    mkdir('public/product_images/' + product._id, function (err) {
                        return console.log(err);
                    });

                    mkdir('public/product_images/' + product._id + '/gallery', function (err) {
                        return console.log(err);
                    });

                    mkdir('public/product_images/' + product._id + '/gallery/thumbs', function (err) {
                        return console.log(err);
                    });

                    if (imageFile != "") {
                        var productImage = req.files.image;
                        var path = 'public/product_images/' + product._id + '/' + imageFile;

                        productImage.mv(path, function (err) {
                            return console.log(err);
                        });
                    }

                    req.flash('success', 'Product added!');
                    res.redirect('/admin/products');
                });
            }
        });
    }

});


router.post('/reorderedpages' ,function(req , res){
    var ids = req.body['id[]'];
        var count = 0;
    
        for(var i=0;i<ids.length;i++){
            var id=ids[i];
            count++;
            (function(count){
    
            
            Page.findById(id,function(err,page){
                page.sorting=count;
                page.save(function(err){
                    if(err)
                    return console.log(err);
                });
            });
        })(count);
        }
        });
/*
*Get Edit page 
*/
router.get('/editpage/:id' ,function(req , res){

   Page.findById( req.params.id,function(err,page){
if(err)
return console.log(err);
   
res.render('editpage',{
title : page.title,
slug : page.slug,
content : page.content,
id:page._id
});
   });
    });






/*
 * Post Edit page 
 */
router.post('/editpage/:id' ,function(req , res){

    req.checkBody('title', 'title must have a value').notEmpty();
    req.checkBody('content', 'Content must have a value').notEmpty();

    var title = req.body.title;
    var slug = req.body.slug.replace(/\s+/g, '-').toLowerCase();
    if(slug == "")
     slug = title.replace(/\s+/g,'-').toLowerCase();
    var content = req.body.content;
    var id = req.params.id;
   
    var errors = req.validationErrors();
    if (errors) {
 
        res.render('editpage',{
            errors : errors,
            title : title,
            slug : slug,
            content : content,
            id:id
            });

    } else {
        Page.findOne({ slug: slug, _id: { '$ne': id } }, function(err, page) {
            if (page) {
                req.flash("danger", "Page slug exists, choose another.");
                res.render("editpage", {
                    title: title,
                    slug: slug,
                    content: content,
                    id: id
                });

          }
          else {


                 Page.findById(id, function(err, page){
                     if(err)
                      return console.log(err);



                     page.title=title;
                     page.slug=slug;
                     page.content = content;



                     page.save(function (err) {
                        if(err) return console.log(err);
                        req.flash('success','Page added');
                        res.redirect('/admin/pages/editpage/'+id);
                        
                    });
                 });




  
            
          }
      });
    }


    });


/*
*Get delete pages 
*/
router.get('/deletepage/:id' ,function(req , res){

    Page.findByIdAndRemove(req.params.id , function(err){
if(err) return console.log(err);
 req.flash('success','Page deleted');
 res.redirect('/admin/pages/');
    });
    });
    








    //Exports
module.exports = router;