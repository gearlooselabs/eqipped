const user = require('../../../models/user')
const bcrypt = require('bcrypt')

function userController() {
    return {
        index(req, res) {
            user.find({ isverified: { $ne: 'Yes' } }, null, { sort: { 'createdAt': -1 } }).exec((err, users) => {
                if (req.xhr) {
                    return res.json(users)
                } else {
                    return res.render('admin/users')
                }
            })
        },
        async viewcustomer(req, res) {
            const userData = await user.find({ role: "customer" })
            console.log(userData)
            return res.render('admin/viewusers', { data: userData })

        },

        async viewvendors(req, res) {
            const userData = await user.find({ role: "vendor" })
            console.log(userData)
            return res.render('admin/viewusers', { data: userData })

        },
        createUser(req, res) {
            res.render('admin/createUser')
        },
        async postcreateUser(req, res) {
            const { name, email, password, role } = req.body
            console.log(name)


            if (!name || !email || !password || !role) {
                req.flash('error', 'All fields are required')
                req.flash('name', name)
                req.flash('email', email)
                return res.redirect('/admin/createUser')
            }

            user.exists({ email: email }, (err, result) => {
                if (result) {
                    req.flash('error', 'Email already taken')
                    req.flash('name', name)
                    req.flash('email', email)
                    return res.redirect('/admin/createUser')
                }
            })

            const hashedPassword = await bcrypt.hash(password, 10)

            const create_user = new user({
                name,
                phone : "9100000000",
                email,
                password: hashedPassword,
                institutionName : "Admin",
                designation : "Employee",
                address: "Admin Office",
                state : "UP",
                city: "Agra",
                role,
                pincode: "282002"
               
            })
            create_user.save().then((create_user) => {
                req.flash('OnRegisterDone', 'User Successfully Registered')
                // return res.redirect('/login')
                return res.redirect('/adminpanel')
            }).catch(err => {
                console.log(err);
                req.flash('error', 'Something went wrong')
                return res.redirect('/admin/createUser')
            })


        },

    }
}

module.exports = userController