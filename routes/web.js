const homeController = require('../app/http/controllers/homeController')
const authController = require('../app/http/controllers/authController')
const cartController = require('../app/http/controllers/customers/cartController')
const orderController = require('../app/http/controllers/customers/orderController')
const adminOrderController = require('../app/http/controllers/admin/orderController')
const adminProductController = require('../app/http/controllers/admin/productController')
const adminUserController = require('../app/http/controllers/admin/userController')
const statusController = require('../app/http/controllers/admin/statusController')
const categoriesController = require('../app/http/controllers/allCategories/categoriesController')
const productController = require('../app/http/controllers/productController')
const paymentController = require('../app/http/controllers/paymentController')
const vendorController = require('../app/http/controllers/vendor/vendorController')
const admincategoryController = require('../app/http/controllers/admin/categoryController')
const officeController = require('../app/http/controllers/adminoffice/officeController')


// Middlewares 
const guest = require('../app/http/middlewares/guest')
const auth = require('../app/http/middlewares/auth')
const vendor = require('../app/http/middlewares/vendor')
const admin = require('../app/http/middlewares/admin')

function initRoutes(app) {
    
    app.get('/', guest, homeController().index)
    
    app.get('/home', homeController().grandIndex)

    app.post('/sub-categories', auth, homeController().grandIndex)
    app.get('/login', guest, authController().login)
    app.post('/login', authController().postLogin)
    // verification
    app.post('/send-otp-on-phone', authController().forSendingOtp)
    app.get('/register', guest, authController().register)
    app.post('/register', authController().postRegister)
    app.get('/documentupload', auth, authController().uploadDocument)    
    app.post('/logout',auth , authController().logout)
    app.get('/cart', auth, cartController().index)
    app.post('/update-cart', cartController().update)
    app.post('/qty-cart', cartController().qtyUpdate);
    app.post('/remove-cart', cartController().removeUpdate)
    app.post('/delete-cart', cartController().checkout)

    //PaytmGateway Route
    app.get('/payment', paymentController().payment)

    //vendor Route
    app.get('/vendor/listedProduct', vendor, vendorController().index)
    app.get('/addproduct', vendor, vendorController().addproduct)
    app.get('/editproduct/:id', vendor, vendorController().editProduct)
    app.get('/upload-product-page', vendorController().uploadJsonPage);
    app.post('/upload-product', vendorController().uploadJson);
    app.post('/editproducts', vendor, vendorController().posteditProduct);

    // Notify
    app.get('/vendor/notify',vendor ,adminOrderController().goToVendorNotify)

    // Customer routes
    app.post('/callback', auth, orderController().store)
    app.get('/customer/orders', auth, orderController().index)
    app.get('/viewdoc/:fname/:insN/:id', auth, orderController().viewdoc)
    
    //Download PDF in show function
    app.get('/customer/orders/:id', auth, orderController().show)
    app.get('/customer/checkout', auth, orderController().checkout)



 
    // Admin routes
    app.get('/adminpanel', admin, adminOrderController().adminpanel)
    app.get('/admin/orders', admin, adminOrderController().index)  
    app.get('/admin/users', admin, adminUserController().index)
    app.get('/admin/viewcustomer', admin, adminUserController().viewcustomer)
    app.get('/admin/viewvendors', admin, adminUserController().viewvendors)
    app.get('/admin/createUser', admin, adminUserController().createUser)
    app.post('/admin/createUser', admin, adminUserController().postcreateUser)
    app.get('/admin/products', admin, adminProductController().index)
    app.get('/admin/addcategories', admin, admincategoryController().index)
    app.get('/admin/deleteproduct', admin, adminProductController().fetchfordeleteproduct)
    app.get('/admin/delete/products/:_id', admin, adminProductController().deleteproduct)
    app.post('/admin/order/status', admin, statusController().update)
    app.post('/admin/user/status', admin, statusController().userupdate)
    app.post('/admin/product/status', admin, statusController().productupdate)


    // Admin Office
    app.get('/office/editproduct', admin, officeController().index)
    app.get('/office/edit/products/:_id', admin, officeController().productindex)
    app.post('/office/edit/products', admin, officeController().postproductedit) 
    
    //Coupoun code 
    app.post('/applycoupon', orderController().applycoupon)
    app.get('/createCoupon', admin, adminProductController().createCoupon)
    app.post('/createCoupon', admin, adminProductController().postcreateCoupon)


    // Categories route
    app.get('/allcategory', auth, categoriesController().categories)
    app.get('/subcat/', auth, categoriesController().subcat)
    app.post('/create/subcat/', auth, categoriesController().createSubcat);
    app.post('/fetch/subcat/', auth, categoriesController().findSubcat);

    //Product Route
    app.get('/allcategory/products', auth, productController().productfetch)
    app.get('/allcategory/products/:categoryId/:page', productController().catProduct)
    app.get('/productDetails/:vid/:id/:page', productController().productDetails)
    // app.get('/similarproducts', auth, productController().productDetails)
    
    app.get('/brand/:subCategory', auth, productController().brandProduct)
    app.get('/products/:subCategory', auth, productController().productfetchBysubCN)

    //Ajax Auto-Fetch route 
    app.post('/pincodeAjax/', authController().fetchpincode)
    app.get('/autocomplete/', homeController().fetch)
    

    // Forgot/reset password
    app.get('/forgotpassword', authController().forgotpassword)
    app.post('/forgotpassword', authController().postforgotpassword)
    app.get('/resetpassword/:id/:token', authController().resetpassword)
    app.post('/resetpassword/:id/:token', authController().postresetpassword)

    // Edit profile 
    app.get('/edit/:id', auth, authController().edit)
    app.post('/edit', auth, authController().postedit)

    // Footer documents 
    app.get('/privacy-policy', homeController().pripolicy)
    app.get('/term-condition', homeController().termcondition)
    


}

module.exports = initRoutes
