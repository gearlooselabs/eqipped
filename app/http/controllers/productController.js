const Menu = require('../../models/product'); //chai
const Category = require('../../models/categories');
const subCategory = require('../../models/subcategory') //pani
const Brand = require('../../models/brand');
const Variation = require('../../models/variation');
// const paginate= require('express-paginate');


function productController() {
    return {
        async productfetch(req, res) {
            console.log(req.query.search)
            const squeries = req.query.search.split(' ');
            console.log(squeries);
            if (req.query.search != '') {
                
                // const chai = await Menu.find({ 'categoryName': `${product}`, 'isverified': 'Yes' },)
                // const chai = await Menu.find( { $or: [{ "categoryName": { "$in": product } }, { "name": { "$in": product } }] , 'isverified': 'Yes' },)
                // const pani = await subCategory.find({ 'parentCategory': `${product}` })
                const rproducts = [];
                const rvariations = [];
                const rcategories = [];
                const rbrands = [];

                for(var i=0; i<=squeries.length; i++){
                    const item = squeries[i];
                    const brands = await Variation.find({ "brand": { "$regex": `${item}`, "$options": "i" } }).populate('product');
                    if(brands.length > 0){
                        brands.forEach((brand) => {
                            rbrands.push(brand);
                        })
                    }
                    const variations = await Variation.find({ $or: [{"name": { "$regex": `${item}`, "$options": "i" }}, { "pname": { "$regex": `${item}`, "$options": "i" }}] }).populate('product');
                    if(variations.length > 0){
                        variations.forEach((product) => { 
                            rvariations.push(product);
                        })
                    }
                    const categories = await Category.find({ "pCategory": { "$regex": `${item}`, "$options": "i" } });
                    if(categories.length > 0){
                        categories.forEach((product) => {
                            rcategories.push(product);
                        })
                    }
                }

                console.log(rvariations);

                return res.render('menus/search', { products: rvariations, categories: rcategories, brands: rbrands});
            }else{
                return res.redirect('/')
            }
        
        },
        

        async catProduct(req, res) {
            let product_Category = req.params.categoryId;
            res.locals.session.current_Category = product_Category;
            // const chai = await Menu.find({ 'categoryName': ${product_Category}, 'isverified': 'Yes' })
            // const chai = await Menu.find({ '_id': `${product_Category}`});
            const category = await Category.findOne({_id: req.params.categoryId}).populate({ path: 'psubcat', populate: [{ path: 'product', model: 'Product'}], model: 'Sub'}).exec();
            var perPage = 20
            var page = req.params.page || 1;
            const productsShow = await Variation.find({ category: product_Category}).exec();
            Variation.find({ category: product_Category}).populate('product').skip((perPage * page) - perPage).limit(perPage).exec(function(err, products) {
                Variation.count().exec(function(err, count) {
                    if (err) return next(err)
                    res.render('menus/product', {
                        products: products,
                        category: category,
                        current: page,
                        pages: Math.ceil(productsShow.length / perPage)
                    })
                })
            });
        },


        async brandProduct(req, res) {
            let subCategory = req.params.subCategory;
            // const chai = await Menu.find({ 'brand': `${subCategory}`, 'isverified': 'Yes' })
            const chai = await Menu.find({ 'brand': `${subCategory}`})
            const pani = await Brand.find({ 'subCategory': `${subCategory}` })
            return res.render('menus/product', { chai: chai, pani: pani})
        },


        async productfetchBysubCN(req, res) {
            let subCN = req.params.subCategory
            const chai = await Menu.find({ subCategory: subCN })
            const pani = await subCategory.find({ 'parentCategory': `${req.session.current_Category}` })
            return res.render('menus/product', { chai: chai, pani: pani})
        },

        async productDetails(req, res) {
            let productId = req.params.id;
            var perPage = 20;
            var page = req.params.page || 1;
            const variant = await Variation.findOne({ '_id': req.params.vid }).populate('product');
            const variants = await Variation.find({ 'product': productId}).populate('product');
            const alsoSoldBy = await Variation.find({_id: { $ne: variant._id} , $and: [{ vcode: variant.vcode }, { brand: variant.brand }] }).populate('product').populate('vendor');
            const products = await Variation.find({ category: variant.category});
            Variation.find({ category: variant.category, _id: {$ne: variant._id}}).populate('product').skip((perPage * page) - perPage).limit(perPage).exec(function(err, suggested) {
                Variation.count().exec((err, count) => {
                    res.render('menus/productdetails', {
                        variants: variants,
                        product: variant,
                        suggested: suggested,
                        alsoSoldBy: alsoSoldBy,
                        current: page,
                        pagesList: Math.ceil(products.length/perPage),
                    })
                })
            });
        },
    }
}
 


module.exports = productController