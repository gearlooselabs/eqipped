const { json } = require("express");
const Product = require('../../../models/product');
const User = require('../../../models/user');


function cartController() {
    return{

        async index(req, res) {
            const products = await User.findOne({_id: req.user._id}).populate({ path: 'cart.product', model: 'Product'});
            res.render('customers/cart', {products: products, user: req.user});
        },

        async update(req, res) {
            User.updateOne({
                _id: req.user._id,
                'cart.product': { $ne: req.body.pid}
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

        qtyUpdate(req, res) {
            if(req.body.type === 'plus'){
                User.updateOne({ 
                    _id: req.user._id,
                    'cart._id': req.body.pid,
                    'cart.quantity': { $gt: 0}
                }, {
                   $inc: {
                    'cart.$.quantity': 1
                   }
                }, () => {
                    res.send({ "status": "success"});
                })
            }else{
                User.updateOne({ 
                    _id: req.user._id,
                    'cart._id': req.body.pid,
                    'cart.quantity': { $gt: 1}
                }, {
                   $inc: {
                    'cart.$.quantity': -1
                   }
                }, () => {
                    res.send({ "status": "success"});
                })
            }
        },


        removeUpdate(req, res) {
            console.log(req.body.pid)
            User.updateOne({
                _id: req.user._id
            }, {
                $pull: {
                    cart: {
                        product: req.body.pid
                    }
                }
            }, (err) => {
                if(err) res.send({ "status": "error"});
                res.send({"status": "success"});
            })
        }
    }
}

module.exports = cartController