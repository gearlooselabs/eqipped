const order = require("../../../models/order");
const Product = require("../../../models/product");

function orderController() {
    return {
        async index(req, res) {
            const orders = await order.find({ status: { $ne: 'completed' } }, null, { sort: { 'createdAt': -1 } }).populate({ path: 'items.product', model: 'Product' }).exec()
            if (req.xhr) {
                return res.json(orders)
            } else {
                return res.render('admin/orders')
            }
        },

        adminpanel(req, res) {
            return res.render('admin/adminPanel', { layout: 'admin/adminPanel' });

        }
    }
}

module.exports = orderController  