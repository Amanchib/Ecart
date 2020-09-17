var express = require('express');
var router = express.Router();

// Get Page model

var Page = require('../models/page') ;
/*
*Get pages index
*/
router.get('/' ,function(req , res){

    Page.find({}).sort({sorting: 1}).exec(function (err , pages){
        res.render('pages',{
            pages:pages
        });
    });
    });

/*
*Get Add page 
*/
router.get('/addpage' ,function(req , res){

    var title ="";
    var slug="";
    var content= "";

res.render('addpage',{
title : title,
slug : slug,
content : content
});

    });


/*
* Post Add page 
*/
router.post('/addpage' ,function(req , res){

    req.checkBody('title', 'Title must have a value').notEmpty();
    req.checkBody('content', 'Content must have a value').notEmpty();

    var title = req.body.title;
    var slug = req.body.slug.replace(/\s+/g, '-').toLowerCase();
    if(slug == "") slug = title.replace(/\s+/g,'-').toLowerCase();
    var content = req.body.content;
   
    var errors = req.validationErrors();
    if (errors) {
 
        res.render('addpage',{
            errors : errors,
            title : title,
            slug : slug,
            content : content
            });

    } else {
      Page.findOne({slug : slug}, function (err , page) {
          if (page){
              req.flash('danger', 'Page slug exist, choose another.');

              res.render('addpage',{
                
                title : title,
                slug : slug,
                content : content
                });

          }
          else {
              var page = new Page ({
                  title : title,
                  slug : slug,
                  content: content,
                  sorting:100
              });
              page.save(function (err) {
                  if(err) return console.log(err);
                  req.flash('success','Page added');
                  res.redirect('/admin/pages');
                  
              });
          }
      });
    }


    });

/*
*Post render pages 
*/
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