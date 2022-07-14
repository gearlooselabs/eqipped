const Menu = require('../../models/product');
const Category = require('../../models/categories')
const subCategory = require('../../models/subcategory');
const Product = require('../../models/product');
const Sub = require('../../models/subcategories');


function homeController() {
    return {
        index(req, res) {
            res.render('home')
        },

        pripolicy(req, res) {
            res.render('footerDocu/privacy & policy')
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
            const chemicals = await Menu.find({categoryName: chemicalCat}).limit(10).exec();
            const instruments = await Menu.find({categoryName: instrumentCat}).limit(10).exec();
            const products = await Product.find().limit(4);
            const latest = await Menu.find().limit(4).sort('-created');
            const subcats = await Sub.find({}).limit(12);
            return res.render('grandHome', { nashta: nashta, subcats: subcats, chemicals: chemicals, products: products, latest: latest, instruments: instruments});
        },

        fetch(req, res, next) {
            var regex = new RegExp(req.query["term"], 'i');

            var productFilter = Menu.find({ $or: [{ "name": { "$in": [regex] } }] }).sort({ "updated_at": -1 }).sort({ "created_at": -1 }).limit(10);
            var categoryFilter = Category.find({ $or: [{ "pCategory": { "$in": [regex] } }] }).sort({ "updated_at": -1 }).sort({ "created_at": -1 }).limit(10);
            var subcatFilter = subCategory.find({ $or: [{ "name": { "$in": [regex] } }] }).sort({ "updated_at": -1 }).sort({ "created_at": -1 }).limit(10);
            productFilter.exec(function (err, data) {
                var result = [];
                if (data) {
                    if (data && data.length && data.length > 0) {
                        data.forEach(product => {

                            var label = product.name
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