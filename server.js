require('dotenv').config()
const express = require('express')
const path = require('path')
const app = express()
const ejs = require('ejs')
const expressLayout = require('express-ejs-layouts');
const moment = require('moment');

const mongoose = require('mongoose')
const session = require('express-session')
const flash = require('express-flash')
const MongoDbStore = require('connect-mongo')(session)
const passport = require('passport')
const Emitter = require('events')
var bodyParser = require('body-parser')
const multer  = require('multer')
const axios = require("axios") 

const paymentController = require('./app/http/controllers/paymentController')
const OrderId = require('./app/models/orderID')


// Database connection
const url = 'mongodb+srv://admin:gsk3E1ZwjWwgqAoC@cluster0.9xkoq.mongodb.net/Euipped_dB'
// const url = 'mongodb://localhost/abhitbar'
mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });
const connection = mongoose.connection;
connection.once('open', () => {
    console.log('Database connected...');
});


// Session store
let mongoStore = new MongoDbStore({
    mongooseConnection: connection,
    collection: 'sessions'
})

// Event emitter
const eventEmitter = new Emitter()
app.set('eventEmitter', eventEmitter)

// Session config
app.use(session({
    secret: process.env.COOKIE_SECRET,
    resave: false,
    store: mongoStore,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 48 } // 24 hour
}))

// Passport config
const passportInit = require('./app/config/passport')
passportInit(passport)
app.use(passport.initialize())
app.use(passport.session())

app.use(flash())

// Assets
app.use(express.static('public'))
app.use(express.urlencoded({ extended: false }))
app.use(express.json())

// Global middleware
app.use((req, res, next) => {
    res.locals.session = req.session
    res.locals.user = req.user
    next()
})

// Render html page 
app.get('/pls', (req, res) => {
    res.sendFile(__dirname + '/index.html')
})


// set Template engine
app.use(expressLayout)
app.set('views', path.join(__dirname, '/resources/views'))
app.set('view engine', 'ejs')



// require('./routes/web')(app)
eventEmitter.on('orderUpdated', (data) => {
    io.to(`order_${data.id}`).emit('orderUpdated', data)
})

eventEmitter.on('orderPlaced', (data) => {
    io.to('adminRoom').emit('orderPlaced', data)
})
app.use('/docs', express.static('docs'))
app.use('/documents', express.static('./public/businessDocuments/'))


//Paytm API Body Parser
const Menu = require('./app/models/order');
// const express = require("express")
const http = require("http")
const qs = require("querystring")
const checksum_lib = require("./routes/Paytm/checksum")
const config = require("./routes/Paytm/config")
const user = require('./app/models/user')
const parseUrl = express.urlencoded({ extended: true });
const parseJson = express.json();
const request = require('request')
const { response } = require('express')

app.post('/paynow', [parseUrl, parseJson], async (req, res) => {
    if (req.user.cart.length > 0) {
        const { phone, address, pincode} = req.body
        res.locals.session.phone = phone
        res.locals.session.address = address
        res.locals.session.pincode = pincode


    
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
        var oidd = ""
        let weeks = moment().weeks() - moment().startOf('month').weeks() + 1;
        weeks = (weeks + 52) % 52;
        var random_4 = Math.floor(Math.random() * (100 - 9995)) + 100;
        var oidd = "eqp_22" + mnth + -random_4 + weeks;
        let query = { orderID: oidd }
        let resss = await OrderId.findOne(query);
        if(resss){
            req.flash('error', 'Some Error Ocurred! Please Try Again');
            return res.redirect('back');
        }
        console.log(oidd)

        const https = require('https');
        const PaytmChecksum = require('./routes/Paytm/checksum');

        var paytmParams = {};

        paytmParams.body = {
            "requestType": "Payment",
            // "mid": process.env.MID,
            "mid": config.PaytmConfig.mid,
            // "websiteName": process.env.WEBSITE,
            "websiteName": config.PaytmConfig.website,
            "orderId": oidd,
            "callbackUrl": "http://localhost:3300/callback",
            "txnAmount": {
                // "value": subtotal,
                "value": req.session.sub_total,
                "currency": "INR",
            },
            "userInfo": {
                "custId": req.user._id,
            },
        };

        // PaytmChecksum.generateSignature(JSON.stringify(paytmParams.body), process.env.KEY).then(function (checksum) {
        PaytmChecksum.generateSignature(JSON.stringify(paytmParams.body), config.PaytmConfig.key).then(function (checksum) {

            paytmParams.head = {
                "signature": checksum
            };

            var post_data = JSON.stringify(paytmParams);

            var options = {

                /* for Test Staging */
                hostname: 'securegw-stage.paytm.in',

                /* for Production */
                // hostname: 'securegw.paytm.in',

                port: 443,
                path: `/theia/api/v1/initiateTransaction?mid=${config.PaytmConfig.mid}&orderId=${oidd}`,
                // for production 
                // path: `/theia/api/v1/initiateTransaction?mid=${process.env.MID}&orderId=${oidd}`,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': post_data.length 
                }
            };

            var response = "";
            var post_req = https.request(options, function (post_res) {
                post_res.on('data', function (chunk) {
                    response += chunk;
                });

                var token = post_res.on('end', function () {
                    response = JSON.parse(response);
                    console.log(response)
                    res.render('payment', { txnToken: response.body.txnToken, amount: req.session.total, orderID: oidd })
                });
            });
            post_req.write(post_data);
            post_req.end();
        });
    }
})


// Upload image from vendor or admin add product 
const admin = require('./app/http/middlewares/admin')
const Product = require('./app/models/product')
const User = require('./app/models/user')
const Sub = require('./app/models/subcategories');
const Document = require('./app/models/document');


var maxiSize = 1000000

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './public/img/')
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname);   
    } 
  })
  
  const upload = multer({ storage: storage, limits: { fileSize: maxiSize }}).single('image')
  


app.post('/addproduct', function (req, res) {
    upload(req, res, function (err) {
      if (err instanceof multer.MulterError) {
        // A Multer error occurred when uploading.
        req.flash('error', 'Image Size Too Large (Max-size: 1mb)')
        return res.redirect('/addproduct')
      } else if (err) {
        // An unknown error occurred when uploading.
        console.log(err)
        req.flash('error', 'Something went wrong, Please try again')
        return res.redirect('/addproduct')
      }

  
      const { name, price, categoryName, size, itemWeight, volume, brand, piecePerPack, netQuantity, HSN , GST ,containedLiquid, description, subCategory, vname, variant} = req.body
  
              if (!name || !price || !categoryName || !size || !itemWeight || !brand || !piecePerPack || !netQuantity || !HSN || !GST || !containedLiquid || !description || !vname) {
                  req.flash('error', 'All fields are required')
                  return res.redirect('/addproduct')
              }

              const variants = Object.assign({}, variant);
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
                  variations: { name: vname, variants: variants}
              })
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
                    if (!err) { req.flash('error', 'Product Added Successfully'); return res.redirect('/addproduct') }
                })
              }).catch(err => {
                  req.flash('error', 'Something went wrong')
                  console.log(err);
                  return res.redirect('/addproduct')
              });
    })
  })






// Upload business document
 var maxSize = 2000000

 const storage2 = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './public/businessDocuments/')
    },
    filename: function (req, file, cb) {
          const uniqueSuffix = req.user.fname + ' from ' + req.user.institutionName
          cb(null, uniqueSuffix + path.extname(file.originalname)); 
    //   cb(null, file.originalname);   
    }
  })

  

const upload2 = multer({ storage: storage2, limits: { fileSize: maxSize }}).single('avatar')
  

  app.post('/complete-your-profile', function (req, res) {


    upload2(req, res, function (err) {
      if (err instanceof multer.MulterError) {
        // A Multer error occurred when uploading.
        console.log(err)
        req.flash('error', 'File Too Large (Max-size: 2mb)')
        return res.redirect('/documentupload')
      } else if (err) {
        // An unknown error occurred when uploading.
        console.log(err)
        req.flash('error', 'Something went wrong, Please try again')
        return res.redirect('/documentupload')
      }
     

    const {registerAs, gst, cin, pan, udise, man} = req.body
    const document = new Document({registerAs, gst, cin, pan, udise, man})
    // const {gst} = req.body
    // const document = new Document({gst})
     
    document.save().then(result => {
          // Everything went fine.
       User.findOneAndUpdate({ _id: req.user.id }, { isuploded: "Yes" }, (err, data) => {
        if (err) {
           console.log(err)
        } else {
            console.log("Done")
        }
    })
    
        req.flash('error', 'Documents Added Successfully')
        return res.redirect('/documentupload')

    }).catch(err => {
        req.flash('error', 'Something went wrong')
        return res.redirect('/documentupload')
    });


    })
  })




//   Add category from admin panel

const Category = require('./app/models/categories')


  const storage3 = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/img/')
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
})
const upload3 = multer({ storage: storage3 }).single('image')

app.post('/addcategory', upload3, admin, function (req, res) {
    const file = req.file
    if (!file) {
        req.flash('error', 'File not found')
        return res.redirect('/admin/addcategories')
    }
    const { category } = req.body
    const create_category = new Category({
        pcategory: category,
        pimage: req.file.filename
    })
    create_category.save().then((create_category) => {
        req.flash('error', 'Category Added Successfully')
        return res.redirect('/admin/addcategories')
    }).catch(err => {
        req.flash('error', 'Something went wrong')
        return res.redirect('/admin/addcategories')
    })

})







require('./routes/web')(app)
app.use((req, res) => {
    res.status(404).render('errors/404')
})
const PORT = process.env.PORT || 3300;
// const server=
// app.listen(process.env.PORT || 3300, function(){
//     console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
//   });
const server = app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`)
})

// Socket

const io = require('socket.io')(server)
io.on('connection', (socket) => {
    // Join
    socket.on('join', (orderId) => {
        socket.join(orderId)
    })
})
