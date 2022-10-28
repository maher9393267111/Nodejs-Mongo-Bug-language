const { body, validationResult } = require("express-validator");
const validator = require("express-validator");
const async = require("async");
const Brand = require("../models/brand");
const Product = require("../models/product");


exports.brand_list = (req,res) => {
    Brand.find()
        // filter find function
        .sort([['name', 'ascending']])
        // execute action
        .exec((function(err, list_brand){
            if(err){
                return next(err);
            }
            res.render("brands_list", {
                title: "Brand list",
                brand_list: list_brand
            })
        }))
}

exports.brand_add_get = (req,res) =>{
    res.render("brands_form", { title: "Create a new brand" });
}

exports.brand_add_post = [
        // data field input
        body("name", "Brand name is required")
            .trim()
            .isLength({min: 3})
            .escape(),
        (req, res, next) => {
            const errors = validationResult(req);
            const brand = new Brand({ name : req.body.name });
            // in case of error
            if (!errors.isEmpty()) {                                   
                res.render("brands_form", {
                    title: "Create a new brand ERROR",
                    brand, 
                    errors: errors.array()
                });
                return;

            } else {
                // search for matching brand
                Brand.findOne({ name : req.body.name }).exec((err, found_brand) => {
                    // if error
                    if (err) {
                        return next(err);
                    }
                    // if found matching brand name
                    if (found_brand) {
                        res.redirect(found_brand.url)
                    } else {
                        // if no matching not found, save
                        brand.save((err) => {
                            // if can't save, error
                            if (err) {
                                return next(err);
                            }
                            res.redirect(brand.url)
                        })
                    }
                })
            }
        }
    
    ]


exports.brand_delete_post = (req,res) =>{
    async.parallel(
        {
          brand(callback) {
            Brand.findById(req.params.id)
                .exec(callback);
          },
          brand_products(callback) {
            Product.find({ brand: req.params.id })
                .exec(callback);
          },
        },
        function (err, results) {
          if (err) {
            return next(err);
          }
          if (results.brand == null) {
            res.redirect("/inventory/brands");
          }
          res.render("brands_delete", {
            title: "Delete Brand",
            brand: results.brand,
            brand_products: results.brand_products,
          });
        }
      );
}

exports.brand_delete_get = (req,res) =>{
    async.parallel(
        {
          brand(callback) {
            Brand.findById(req.params.id)
                .exec(callback);
          },
          brand_products(callback) {
            Product.find({ brand: req.params.id })
                .exec(callback);
          },
        },
        (err, results) => {
          if (err) {
            return next(err);
          }
          if (results.brand_products.length > 0) {
            console.log(results)
            res.render("brands_delete", {
              title: "Delete Brand",
              brand: results.brand,
              brand_products: results.brand_products,
            });
            return;
          } else {
            console.log(results)

            Brand.findByIdAndRemove(req.params.id, function deleteBrand(err) {
              if (err) {
                return next(err);
              }
              res.redirect("/inventory/brands");
            });
          }
        }
      );
}

exports.brand_detail = (req,res) =>{
    async.parallel(
        {
            brand(callback){
                // Search brand with specific ID
                Brand.findById(req.params.id)
                    .exec(callback);
            },
            brand_product(callback){
                // Search products with specific brand ID
                Product.find({ brand: req.params.id })
                    .exec(callback);
            }
        },
        (err, results) => {
            if(err){
                return next(err);
            }
            if (results.brand == null) {
                const err = new Error("Brand not found");
                err.status = 404;
                return next(err);
            }
            res.render("brands_detail", {
                title: "Brand details",
                brand: results.brand,
                brand_product: results.brand_product,
            },
            )
        }
    )
}