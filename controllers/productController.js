const { nextTick } = require("async");
const { body, validationResult } = require("express-validator");
const validator = require("express-validator");
const async = require("async");
const Product = require("../models/product")
const Category = require("../models/category")
const Brand = require("../models/brand");
const { param } = require("../routes");


exports.product_list = (req,res) =>{
    async.parallel(
        {
            product(callback){
                Product.find()
                    // filter find function
                    .sort([['name', 'ascending']])
                    // execute action
                    .exec(callback);
            },
            item_count(callback){
                Product.countDocuments({}, callback);
            }
        },
        (err, results) => {
            if(err){
                return next(err);
            }
            res.render("products_list", {
                title: "Products list",
                list_product: results.product,
                item_count: results.item_count,
            })
        }
    )
};

exports.product_add_get = (req,res) =>{
    async.parallel(
        {
            // Get all Brands and Categories
            brands(callback){
                Brand.find(callback);
            },
            categories(callback){
                Category.find(callback);
            }
        },
        (err, results) => {
            if (err) {
              return next(err);
            }
            res.render("products_form", { 
                title: "Create a new product",
                brands: results.brands,
                categories: results.categories,
             });
        }
    )
}

exports.product_add_post = [

    
    // Convert the category to an array.
    (req, res, next) => {
        if (!Array.isArray(req.body.category)) {
        req.body.category =
            typeof req.body.category === "undefined" ? [] : [req.body.category];
        }
        next();
    },

    
    body("name", "Name must not be empty.")
        .trim()
        .isLength({ min: 3 })
        .escape(),
    body("price", "Price must not be empty.")
        .trim()
        .isLength({ min: 1 })
        .isInt()
        .escape(),
    body("stock", "Stock must not be empty.")
        .trim()
        .isLength({ min: 1 })
        .isInt()
        .escape(),
    body("categories.*", "Categories must not be empty.")
        .escape(),
    body("brand", "Brand must not be empty.")
        .trim()
        .escape(),

    (req, res, next) => {
        const errors= validationResult(req);
        console.log('reqbody ----->>>' , req.body)
        const product = new Product({
            name: req.body.name,
            price: req.body.price,
            stock: req.body.price,
            categories: [req.body.category],
            brand: req.body.brand,
        });

        // If Errors
        if(!errors.isEmpty()){
            async.parallel(
                {
                    // Get all Brands and Categories
                    brands(callback){
                        Brand.find(callback);
                    },
                    categories(callback){
                        Category.find(callback);
                    }
                },
                (err, results) => {
                    if (err) {
                      return next(err);
                    }
                    for (const category of results.categories) {
                        if (product.category.includes(category._id)) {
                            category.checked = "true";
                        }
                    }
                    res.render("products_form", {
                        title: "Create a new product ERROR",
                        name: req.body.name,
                        brands: results.brands,
                        category: results.categories,
                        errors: errors.array(),
                        product,
                    });
                }
            );
            return;
        }
        product.save((err) => {
            if (err) {
            return next(err);
            }
            res.redirect(product.url);
        });
    }
]

exports.product_delete_post = (req,res) =>{
    Product.findByIdAndRemove(req.params.id, function deleteProduct(err) {
        if (err) {
          return next(err);
        }
        res.redirect("/inventory/products");
      });
}

exports.product_delete_get = (req,res) =>{
        Product.findById(req.params.id)
            .populate('name')
            .exec(function (err, product) {
                if (err) {
                    return next(err);
                }
                if (product == null) {
                    res.redirect("/inventory/products");
                }
                res.render("products_delete", {
                    title: "Delete Product",
                    product: product,
                });
            }
      );
}

exports.product_detail = (req,res ,next) =>{
    async.parallel(
        {
            product(callback){
                // populate('categories','brand')
                // Search product with specific ID
                Product.findById(req.params.id).populate("brand")
                .populate("categories")
                    .exec(callback);
                   
            },
            product_brand(callback){
                // Search brand with specific product ID
                Brand.find({ product: req.params.id})
                    .exec(callback);
            },
            product_category(callback){
                // Search categories with specific product ID
                Category.find({ })
                    .exec(callback);
            }
        },
        (err, results) => {
            if (err) {
                return next(err);
            }
        
            if (results.product == null) {
                const err = new Error("Products not found");
                err.status = 404;
                return next(err);
            }
console.log('product data ----->>>' ,results.product.brand)
            
            res.render("products_detail", {
                title: "Product details",
                product: results.product,
                product_brand:results.product.brand.name,
                product_category:results.product.categories[0].name
             //   product_brand: results.product_brand,  // well show all brands
              //  product_categories: results.product_category,  // wll show all categories 
            },
            )



        //    console.log('PRoduct BRands---<<<<' ,results.product)


        }
    )
}

