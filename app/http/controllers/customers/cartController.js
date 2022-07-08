const { json } = require("express");
const Product = require('../../../models/product');
const User = require('../../../models/user');


function cartController() {
    return{

        async index(req, res) {
            const products = await User.findOne({_id: req.user._id}).populate({ path: 'cart.product', model: 'Product'});
            res.render('customers/cart', {products: products});
        },

        async update(req, res) {
            User.updateOne({
                _id: req.user._id
            }, {
                $push: {
                    cart: {
                        product: req.body.pid,
                        quantity: req.body.qty
                    }
                }
            }, (err) => {
                if(err) console.log(err);
            });

            const user = await User.findOne({
                _id: req.user._id
            });

            console.log(user.cart.length)
            res.send({"status": "success", items: user.cart.length});
        },

        deupdate(req, res) {

            let cart = req.session.cart

                // Check if item does not exist in cart
                if(!cart.items[req.body._id]){
                    cart.items[req.body._id] = {
                        item: req.body,
                        qty: 0
                    }
                    // cart.totalQty = cart.totalQty - 1;
                    // cart.totalPrice = cart.totalPrice - req.body.price;                    
                } else if(cart.items[req.body._id].qty > 1){
                    cart.items[req.body._id].qty = cart.items[req.body._id].qty - 1
                    cart.totalQty = cart.totalQty - 1
                    cart.totalPrice = cart.totalPrice - req.body.price  
                // }  else if(cart.items[req.body._id].qty = 1){
                //     cart.totalQty = cart.totalQty - 1
                //     cart.totalPrice = cart.totalPrice - req.body.price  
                //     delete cart.items[req.body._id]
                }
                
                
            return res.json({ totalQty: req.session.cart.totalQty, specificQty: req.session.cart.items[req.body._id].qty})
        },


        removeUpdate(req, res) {
            let cart = req.session.cart


                // Check if item does not exist in cart
                if(cart.items[req.body._id]){
                    cart.totalQty = cart.totalQty - cart.items[req.body._id].qty
                    cart.totalPrice = cart.totalPrice - req.body.price * cart.items[req.body._id].qty
                    delete cart.items[req.body._id]
                    }      
                
                    
                    if(cart.totalQty == 0 || cart.totalPrice == 0){
                        delete req.session.cart
                    }

                    try {
                        return res.json({ totalQty: req.session.cart.totalQty })
                    }
                    catch(err) {
                        return res.redirect('/cart')                                                
                      }


                }
    }
}

module.exports = cartController