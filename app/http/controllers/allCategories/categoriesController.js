const Category = require('../../../models/categories')
const Sub = require('../../../models/subcategories')
const Brand = require('../../../models/brand')



function categoriesController() {
    return{
        async categories(req, res) {
            const nashta = await Category.find()
            const brand = await Brand.find()
            return res.render('allCategories/allCategoriesPage', {nashta: nashta, brand: brand, user: req.user})
        },

        async subcat(req, res){
            const categories = await Category.find({}).populate({path: 'psubcat'}).exec();
            return res.render('random', { categories: categories});
        },

        async createSubcat(req, res){
            const newSub = new Sub({
                category: req.body.category,
                name: req.body.name
            });

            newSub.save(() => {
                console.log("Awesome");
            });

            Category.updateOne({
                _id: req.body.category
            }, {
                $push: {
                    psubcat: newSub._id
                }
            }, () => {
                console.log("Ukkay")
            })

            const sub = await Sub.find({}).exec();
            console.log(sub);

            res.redirect('/');
        },

        async findSubcat(req, res){
            const subcats = await Sub.find({ category: req.body.category_id}).exec();
            res.json({
                msg: 'success',
                subcats: subcats
            })
        }
    }
}


module.exports = categoriesController