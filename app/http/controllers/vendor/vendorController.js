const Product = require('../../../models/product')
const Category = require('../../../models/categories')
const User = require('../../../models/user')

const moment = require('moment')
const { session } = require('passport')

function vendorController() {
    return {

        async index(req, res) {
            const product = await Product.find({ customerId: req.user._id },
                null,
                { sort: { 'createdAt': -1 } })
            res.header('Cache-Control', 'no-store')
            res.render('vendor/listedProduct', { listedProd: product, moment: moment })
        },


        async addproduct(req, res) {
            const categories = await Category.find({}).exec();
            return res.render('vendor/addproduct', { categories: categories});
        },

        async editProduct(req, res) {
            const { id} = req.params
            const data = await Product.findOne({'_id': `${ id }`})
            return res.render('vendor/editproducts', { data: data })
        },
        async posteditProduct(req, res) {
            const { id, name, categoryName, brand, price, size, containedLiquid, volume, piecePerPack, netQuantity, HSN, GST, itemWeight, description } = req.body
            Product.findByIdAndUpdate({ _id: id }, { name, categoryName, brand, price, size, GST, HSN, containedLiquid, volume, piecePerPack, netQuantity, description, itemWeight }, (err, data) => {
                if (!err) {
                    req.flash('error', 'Update Successfully')
                    return res.redirect('/vendor/listedProduct')
                } else {                    
                    req.flash('error', 'Something went wrong')
                    return res.redirect('/vendor/listedProduct')
                }
            })
        },

        uploadJsonPage(req, res){
            res.render('upload-product-page');
        },

        async uploadJson(req, res){
                      const product = new Product({
                          customerId: req.user._id,
                          sellerRole: req.user.role,
                          name,
                          image: req.file.filename,
                          price,
                          size,
                          brand,
                          description,
                          piecePerPack,
                          categoryName,
                          itemWeight,
                          HSN,
                          GST,
                          volume,
                          netQuantity,
                          containedLiquid,
                      });
        
                      product.save().then(result => {
                        // Sub.updateOne({
                        //     _id: subCategory
                        //   }, {
                        //     $push: {
                        //         product: product._id
                        //     }
                        //   }, (err) => {
                        //     if(err){
                        //         req.flash('error', 'Something went wrong')
                        //         console.log(err);
                        //         return res.redirect('/addproduct')
                        //     }
                        //   })
                        Product.populate(result, { path: 'customerId' }, (err) => {
                            if (!err) { req.flash('error', 'Product Added Successfully'); 
                            }
                        })
                      }).catch(err => {
                          req.flash('error', 'Something went wrong')
                          console.log(err);
                          return res.redirect('/addproduct')
                      });
        
                      async function something(item, price, code){
                            let variation = new Variation({
                                product: product._id,
                                pname: name,
                                variation: vname,
                                vcode: code,
                                category: categoryName,
                                brand: brand,
                                name: item,
                                price: price,
                                vendor: req.user._id
                            })
        
                            await variation.save((err) => {
                                if(err) console.log(err)
                                console.log("Variation Saved Successfully")
                            });
                        }
        
                        variant.forEach((variant, index) =>{
                            var price = prices[index];
                            var code = vcodes[index];
                            something(variant, price, code);
                        })
        }

    }
}


module.exports = vendorController