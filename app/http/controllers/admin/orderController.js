const order = require("../../../models/order");
const Product = require("../../../models/product");
const Variation = require('../../../models/variation');

function orderController() {
    return {
        async index(req, res) {
            const orders = await order.find({ status: { $ne: 'completed' } }, null, { sort: { 'createdAt': -1 } }).populate({ path: 'items.product', model: 'Variation' }).exec()
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
            const orders = await order.find({ status: { $ne: 'completed' } }, null, { sort: { 'createdAt': -1 } }).populate({ path: 'items.product', model: 'Variation' }).exec()
            
            if (req.xhr) {
                return res.json(orders)
            } else {
                return res.render('customers/vendornotify')
            }
        }
    }
}

module.exports = orderController  