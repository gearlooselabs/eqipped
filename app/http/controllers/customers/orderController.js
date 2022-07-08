const Order = require('../../../models/order')
const Coupon = require('../../../models/coupon')
const OrderId = require('../../../models/orderID')
const moment = require('moment')
const fs = require('fs')
const pdf = require('pdf-creator-node')
const path = require('path')
const utils = require('util')
const options = require('../../../../helpers/options')
function orderController() {
    return {

        viewdoc(req,res){
            const {fname, insN} = req.params
            const filename = fname + ' from ' + insN + '.pdf';
            const filepath = 'http://localhost:3000/businessDocuments/' + filename
            // return res.render('auth/documentwatch', { path: filepath })
            return res.render('auth/documentupload', { path: filepath })
          },

        async index(req, res) {
            const orders = await Order.find({ customerId: req.user._id },
                null,
                { sort: { 'createdAt': -1 } })
            res.header('Cache-Control', 'no-store')
            res.render('customers/orders', { orders: orders, moment: moment })
        },

        store(req, res) {

            var mnth = ""
            switch (new Date().getMonth() + 1) {
                case 1:
                    mnth = "ja";
                    break;
                case 2:
                    mnth = "fe";
                    break;
                case 3:
                    mnth = "ma";
                    break;
                case 4:
                    mnth = "ap";
                    break;
                case 5:
                    mnth = "my";
                    break;
                case 6:
                    mnth = "ju";
                    break;
                case 7:
                    mnth = "jl";
                    break;
                case 8:
                    mnth = "au";
                    break;
                case 9:
                    mnth = "se";
                    break;
                case 10:
                    mnth = "oc";
                    break;
                case 11:
                    mnth = "no";
                    break;
                case 12:
                    mnth = "de";
                default:
                    mnth = "NA"
            }

            var oId = "eqp_22" + mnth + "0100"
            if (req.body.ORDERID == oId) {

                const orderid = new OrderId({
                    orderID: req.body.ORDERID

                })
                orderid.save().then((user) => {
                }).catch(err => {
                    req.flash('error', 'Something went wrong')
                })
            }
            if (req.body.RESPCODE == '01' && req.body.STATUS == 'TXN_SUCCESS' && req.body.RESPMSG == 'Txn Success') {

                const order = new Order({
                    customerId: req.user._id,
                    customerName: req.user.name,
                    orderId: req.body.ORDERID,
                    txnDate: req.body.TXNDATE,
                    txnAmount: req.body.TXNAMOUNT,
                    items: req.session.cart.items,
                    phone: req.session.phone,
                    address: req.session.address,
                    pincode: req.session.pincode,
                    bankName: req.body.BANKNAME,
                    bankTxnId: req.body.BANKTXNID,
                    gateWayName: req.body.GATEWAYNAME,
                    paymentMode: req.body.PAYMENTMODE,
                    respcode: req.body.RESPCODE,
                    txnStatus: req.body.STATUS,
                    respmsg: req.body.RESPMSG,
                    txnID: req.body.TXNID,
                })

                order.save().then(result => {
                    Order.populate(result, { path: 'customerId' }, (err, placedOrder) => {
                        req.flash('success', 'Order placed successfully')
                        delete req.session.cart
                        const eventEmitter = req.app.get('eventEmitter')
                        eventEmitter.emit('orderPlaced', placedOrder)
                        return res.redirect('/customer/orders')
                    })
                }).catch(err => {
                    req.flash('error', 'Something went wrong')
                    return res.redirect('/cart')
                })
            } else {
                req.flash('error', 'Your payment has been declined by your bank. Please try again or use a different method to complete the payment.');
                return res.redirect('/customer/checkout')
            }
        },

        async show(req, res) {
            const html = fs.readFileSync(path.join(__dirname, '../../../../resources/views/invoice.html'), 'utf-8');
            const filename = req.params.id + '.pdf';
            const order = await Order.findById(req.params.id)

            let array = [];
            it = order.items
            Object.values(it).forEach(d => {
                const prod = {
                    name: d.item.name,
                    description: d.item.description,
                    quantity: d.qty,
                    price: d.item.price,
                    total: d.item.price * d.qty,
                    imgurl: d.item.image

                }
                array.push(prod);
            });
            array.forEach(i => {
            })
            let subtotal = 0;
            array.forEach(i => {
                subtotal += i.total
            });
            const tax = (subtotal * 20) / 100;
            const grandtotal = subtotal + tax;
            const obj = {
                CustomerName: order.customerName,
                address: order.address,
                phone: order.phone,
                email: order.email,
                institutionName: req.user.institutionName,
                pincode: order.pincode,
                status: order.status,
                orderId: order.orderId,
                createdAt: moment(order.createdAt).format('DD:MM:YYYY'),
                prodlist: array,
                subtotal,
                tax,
                gtotal: grandtotal
            }


            const document = {
                html: html,
                data: {
                    products: obj,
                },
                path: './docs/' + filename
            }
            pdf.create(document, options)
                .then(res => {
                    console.log(res);
                }).catch(error => {
                    console.log(error);
                });

            const filepath = 'http://localhost:3300/docs/' + filename



            // Authorize user
            if (req.user._id.toString() === order.customerId.toString()) {
                return res.render('customers/singleOrder', { order, path: filepath })
            }
            return res.redirect('/')
        },

        checkout(req, res) {
            const delivery = 250
            var gst = 0

            for (let items of Object.values(req.session.cart.items)) {
                var item_tp = items.item.price * items.qty
                gst+= (item_tp * items.item.GST)/100
            }
            var cart_total = req.session.cart.totalPrice
            var charges = (cart_total * 10) / 100
            var sub_total = cart_total + charges
            sub_total += delivery + gst
            sub_total = parseFloat(sub_total).toFixed(2)
            res.locals.session.gst = gst
            res.locals.session.delivery = delivery
            res.locals.session.charges = charges
            res.locals.session.sub_total = sub_total

            res.render('customers/checkout', { sTotal: sub_total, p_fee: charges, delivery: delivery , taxes : gst })
        },

        async applycoupon(req, res) {
            const c_coupon = req.body.coupon
            var delivery = req.session.delivery
            var charg = req.session.charges
            var sub_total = req.session.sub_total
            var gst = req.session.gst



            if (c_coupon != '') {
                Coupon.find({ couponName: c_coupon }, (err, data) => {
                    // console.log(data)
                    if (data != '') {
                        sub_total -= delivery
                        sub_total = parseFloat(sub_total).toFixed(2)
                        res.locals.session.delivery = 0
                        res.locals.session.sub_total = sub_total
                        res.render('customers/checkout', { sTotal: sub_total, p_fee: charg, taxes : gst })
                    } else {
                        return  res.render('customers/checkout', { sTotal: sub_total, p_fee: charg, taxes : gst })
                    }
                })
            }
            else {

                return res.redirect('customer/checkout')
                // res.render('customers/checkout', { sTotal: sub_total, p_fee: charg, delivery: delivery })
            }


        }
    }
}

module.exports = orderController