const Menu = require('../../models/product');
const Category = require('../../models/categories')
const subCategory = require('../../models/subcategory');
const Product = require('../../models/product');
const Sub = require('../../models/subcategories');
const Variation = require('../../models/variation');


function homeController() {
    return {
        index(req, res) {
            res.render('home')
        },

        pripolicy(req, res) {
            res.render('footerDocu/policies')
        },

        termcondition(req, res) {
            res.render('footerDocu/T & C')
        },

        async grandIndex(req, res) {
            if (req.body.pcategory == undefined) {
                // console.log('Home Controller line no. 17');   
            } else {
                // console.log(req.body.pcategory);
            }
            var chemicalCat = "624e86f68964e0a947f59e03"; // Chemicals Id
            var instrumentCat = "624e86f68964e0a947f59e00"; // Chemicals Id
            const nashta = await Category.find();
            const chemicals = await Variation.find({category: chemicalCat}).populate('product').limit(10).exec();
            const instruments = await Variation.find({category: instrumentCat}).populate('product').limit(10).exec();
            const products = await Variation.find().populate('product').limit(10);
            const latest = await Variation.find().limit(10).populate('product').sort('-createdAt');
            const subcats = await Sub.find({}).limit(12);
            return res.render('grandHome', { nashta: nashta, subcats: subcats, chemicals: chemicals, products: products, latest: latest, instruments: instruments});
        },

        fetch(req, res, next) {
            var regex = new RegExp(req.query["term"], 'i');

            var productFilter = Variation.find({ $or: [{ "name": { "$in": [regex] } }] }).sort({ "updated_at": -1 }).sort({ "created_at": -1 }).populate('product').limit(10);
            var categoryFilter = Category.find({ $or: [{ "pCategory": { "$in": [regex] } }] }).sort({ "updated_at": -1 }).sort({ "created_at": -1 }).limit(10);
            var subcatFilter = subCategory.find({ $or: [{ "name": { "$in": [regex] } }] }).sort({ "updated_at": -1 }).sort({ "created_at": -1 }).limit(10);
            productFilter.exec(function (err, data) {
                var result = [];
                if (data) {
                    if (data && data.length && data.length > 0) {
                        data.forEach(product => {

                            var label = product.product.name + " - " + product.name
                            result.push(label)
                        });

                    }
                    var uniqueString = [...new Set(result)]
                    res.jsonp(uniqueString);
                }else{
                    res.jsonp(result)
                }

            });
        }
    }
}

module.exports = homeController