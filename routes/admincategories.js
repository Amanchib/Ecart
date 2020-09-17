var express = require('express');
var router = express.Router();

// Get Category model

var Category = require('../models/category') ;
/*
*Get Category index
*/
router.get('/' ,function(req , res){
        Category.find(function(err, categories){
         if(err) return console.log(err);
             res.render('categories',{
                 categories:categories
             });
         });
         });

/*
*Get Add category
*/
router.get('/addcategory' ,function(req , res){

    var title ="";
   

res.render('addcategory',{
title : title,

});

    });


/*
* Post Add category
*/
router.post('/addcategory' ,function(req , res){

    req.checkBody('title', 'Title must have a value').notEmpty();
  

    var title = req.body.title;
    var slug = title.replace(/\s+/g, '-').toLowerCase();
    
   
    var errors = req.validationErrors();
    if (errors) {
 
        res.render('addcategory',{
            errors : errors,
            title : title
            });

    } else {
      Category.findOne({slug : slug}, function (err , category) {
          if (category){
              req.flash('danger', 'Category title exist, choose another.');

              res.render('addcategory',{
                
                title : title
                
                });

          }
          else {
              var  category  = new Category ({
                  title : title,
                  slug : slug
                  
              });
              category.save(function (err) {
                  if(err) return console.log(err);
                  req.flash('success','Category added');
                  res.redirect('/admin/categories');
                  
              });
          }
      });
    }


    });

/*
*Get Edit category 
*/
router.get('/editcategory/:id' ,function(req , res){

   Category.findById(req.params.id,function(err,category){
if(err)
return console.log(err);
   
res.render('editcategory',{
title : category.title,
id:category._id
});
   });
    });






/*
 * Post Edit category
 */
router.post('/editcategory/:id' ,function(req , res){

    req.checkBody('title', 'Title must have a value').notEmpty();
    

    var title = req.body.title;
    var slug = title.replace(/\s+/g, '-').toLowerCase();
    
    var id = req.params.id;
   
    var errors = req.validationErrors();
    if (errors) {
 
        res.render('editcategory',{
            errors : errors,
            title : title,
          
            id:id
            });

    } else {
    Category.findOne({ slug: slug, _id: { '$ne': id } }, function(err, category) {
            if (category) {
                req.flash("danger", "Category title exists, choose another.");
                res.render("editcategory", {
                    title: title,
                    
                    id: id
                });

          }
          else {


                 Category.findById(id, function(err, category){
                     if(err)
                      return console.log(err);



                     category.title=title;
                     category.slug=slug;
                     



                     category.save(function (err) {
                        if(err) return console.log(err);
                        req.flash('success','Category edited');
                        res.redirect('/admin/categories/editcategory/'+id);
                        
                    });
                 });




  
            
          }
      });
    }


    });


/*
*Get delete category
*/
router.get('/deletecategory/:id' ,function(req , res){

    Category.findByIdAndRemove(req.params.id , function(err){
if(err) return console.log(err);
 req.flash('success','Category deleted');
 res.redirect('/admin/categories/');
    });
    });
    








    //Exports
module.exports = router;