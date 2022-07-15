const order = require("../../../models/order");
const Product = require("../../../models/product");

function orderController() {
    return {
        index(req, res) {
           order.find({ status: { $ne: 'completed' } }, null, { sort: { 'createdAt': -1 }}).populate('customerId', '-password').populate({ path: 'items.product', model: 'Product'}).exec((err, orders) => { 
                 
            if(req.xhr) { 
                   return res.json(orders)
               } else {
                return res.render('admin/orders', { orders: orders})
               }
           })
        },

        adminpanel(req, res){
            return res.render('admin/adminPanel', { layout: 'admin/adminPanel' });
        
        }
    }
}

module.exports = orderController  