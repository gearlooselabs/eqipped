const Menu = require('../../models/product'); //chai
const Category = require('../../models/categories');
const subCategory = require('../../models/subcategory') //pani
const Brand = require('../../models/brand');
const paginate= require('express-paginate');


function productController() {
    return {
        async productfetch(req, res) {
            var product = req.body.search;
            if (product != '') {
                // const chai = await Menu.find({ 'categoryName': `${product}`, 'isverified': 'Yes' },)
                const chai = await Menu.find( { $or: [{ "categoryName": { "$in": product } }, { "name": { "$in": product } }] , 'isverified': 'Yes' },)
                const pani = await subCategory.find({ 'parentCategory': `${product}` })
                return res.render('menus/product', { chai: chai, pani: pani })
            }else{
                return res.redirect('/home')
            }
        
        },

        async catProduct(req, res) {
            let product_Category = req.params.categoryId;
            res.locals.session.current_Category = product_Category;
            // const chai = await Menu.find({ 'categoryName': ${product_Category}, 'isverified': 'Yes' })
            // const chai = await Menu.find({ '_id': `${product_Category}`});
            const chai = await Category.find({}).populate({ path: 'psubcat', populate: [{ path: 'product', model: 'Product'}], model: 'Sub'}).exec();
            return res.render('menus/product', { chai: chai})
        },


        async brandProduct(req, res) {
            let subCategory = req.params.subCategory;
            // const chai = await Menu.find({ 'brand': `${subCategory}`, 'isverified': 'Yes' })
            const chai = await Menu.find({ 'brand': `${subCategory}`})
            const pani = await Brand.find({ 'subCategory': `${subCategory}` })
            return res.render('menus/product', { chai: chai, pani: pani })
        },


        async productfetchBysubCN(req, res) {
            let subCN = req.params.subCategory
            const chai = await Menu.find({ subCategory: subCN })
            const pani = await subCategory.find({ 'parentCategory': `${req.session.current_Category}` })
            return res.render('menus/product', { chai: chai, pani: pani })
        },

        async productDetails(req, res) {
            let productKiIdDe = req.params._id;
            let categoryName = req.params.categoryName;
            const chai = await Menu.find({ '_id': `${productKiIdDe}` })
            const samose = await Menu.find({ 'categoryName': `${categoryName}` })
            return res.render('menus/productdetails', { chai: chai, samose: samose })
        },
    }
}



module.exports = productController