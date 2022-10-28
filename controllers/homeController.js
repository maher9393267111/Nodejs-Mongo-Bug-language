const async = require("async");
const Brand = require("../models/brand");
const Product = require("../models/product");
const Category = require("../models/category");

exports.index = (req,res) =>{
    async.parallel(
        {
            product_count(callback){
                Product.countDocuments({}, callback);
            },
            brand_count(callback){
                Brand.countDocuments({}, callback);
            },
            category_count(callback){
                Category.countDocuments({}, callback);
            },
        },
        (err, results) => {
            res.render("index", {
                title: "Your inventory app",
                error: err,
                prodCount: results.product_count,
                brandCount: results.brand_count,
                catCount: results.category_count,
            })
        }
    )
}
