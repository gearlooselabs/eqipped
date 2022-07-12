const order = require("../../../models/order")

function orderController() {
    return {
        index(req, res) {
           order.find({ status: { $ne: 'completed' } }, null, { sort: { 'createdAt': -1 }}).populate('customerId', '-password').exec((err, orders) => { 
                 
            if(req.xhr) {
                   return res.json(orders)
               } else {
                return res.render('admin/orders')
               }
           })
        },

        adminpanel(req, res){
            return res.render('admin/adminPanel', { layout: 'admin/adminPanel' });
        
        }
    }
}

module.exports = orderController  