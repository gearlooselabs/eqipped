function vendor (req, res, next) {
    if(req.isAuthenticated() && req.user.role!= 'customer') {  // Admin kahi kahi vendor routes use kr rha hai islye ise vendor or admin dono ke lie chalne de rha hu kuki double layer security hai admin vese bhi vendor me na ghus paega if vendor ki info me admin ghusta bhi hai to koi dikka nahi admin is the father of vendors. Ane vale time me or reliable bana dunga ise.
       return next()
    }
    return res.redirect('/home')
}

module.exports = vendor