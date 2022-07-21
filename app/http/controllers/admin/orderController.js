const { json } = require("body-parser");
const moment = require("moment");
const order = require("../../../models/order");
const User = require("../../../models/user");
const Product = require("../../../models/product");
const Variation = require('../../../models/variation');

function orderController() {
    return {
        async index(req, res) {
            const orders = await order.find({ status: { $ne: 'completed' } }, null, { sort: { 'createdAt': -1 } }).populate({ path: 'items.product', populate: [{ path: 'product', model: 'Product'}], model: 'Variation'}).exec()
            // console.log(orders)
            if (req.xhr) {
                return res.json(orders)
            } else {
                return res.render('admin/orders') 
            }
        },

        adminpanel(req, res) {
            return res.render('admin/adminPanel', { layout: 'admin/adminPanel' });
        },

        async goToVendorNotify(req, res){

            // const variations = await Variation.find({ vendor: req.user._id}).exec()
            // variations.forEach((vari) => {
            //     var variationId = JSON.stringify(vari._id)
            //     console.log(variationId)
            // }) 

                
            const orders = await order.find({ status: { $ne: 'completed' } }, null, { sort: { 'createdAt': -1 } }).populate({ path: 'items.product', populate: [{ path: 'product', model: 'Product'}, { path: 'vendor', model: 'User'}] , model: 'Variation'}).exec()
            const orderIds = [];
            const itemss = [];
            orders.forEach((order) => {
               
                order.items.forEach((items) => {

                    if(JSON.stringify(req.user._id) == JSON.stringify(items.product.vendor._id)){
                        var element = {}
                        element.name = items.product.product.name + ' ' + items.product.name;
                        element.quantity = items.quantity;
                        itemss.push(element);
                        orderIds.push(order);
                        
                        // console.log(items.product.product.name +' '+ items.product.name + ' ' + items.quantity)
                        // console.log(items.product.vendor.fname + ' vendorId ' + items.product.vendor._id)
                    }

                    return

                })
            })

                return res.render('vendor/vendornotify', { orders: itemss, time: orderIds, moment: moment })
        },

    }
}

module.exports = orderController  