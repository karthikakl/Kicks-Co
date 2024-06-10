const Category = require('../Model/categoryModel')

const categories = async(req,res)=>{
  try{
    const categories= await Category.find();
    res.render('Category',{categories})
  }catch(error){
    return res.status(500).json({Success:false,message:"Internal Server error"})
  }
}

const addCategorypage = async(req,res)=>{
    try{
      res.render('addCategory')
    }catch(error){
        return res.status(500).json({Success:false,message:"Internal Server error"})
    }
}

const addCategory = async(req,res)=>{
    try{
     const{ name,description } = req.body;

      const existingcategory = await Category.findOne({ name:{$regex:new RegExp('^' +name+'$','i')}});
      if (existingcategory) {
          const errorMessage = 'category already registered';
         return res.render('addCategory',{message:errorMessage})
      }

     

      const category = new Category ({
         name:name,
         description:description
      })
      const categoryData = await category.save();
      console.log('data saved');
      res.redirect('/admin/categories');
    }catch(error){
        res.status(500).json({success: false,message:"Internal server error"});
    }
}

const unListCategory = async(req,res)=>{
    const categoryId = req.params.id 
    try{
       await  Category.findByIdAndUpdate(categoryId,{isList:false})
       res.status(200).json({success:true,message:"Category UnListed"}); 

    }catch(error){
        return res.status(500).json({Success:false,message:"Internal Server error"})
    }
}

const isListCategory = async(req,res)=>{
    const categoryId = req.params.id 
    try{
       await  Category.findByIdAndUpdate(categoryId,{isList:true})
       res.status(200).json({success:true,message:"Category isListed"});

    }catch(error){
        return res.status(500).json({Success:false,message:"Internal Server error"})
    }
}

const editCategoryPage = async(req,res)=>{
  try{
    const categoryId = req.query.id;
  
  const categoryData = await Category.findOne({_id: categoryId })
  
     if(categoryData){
      console.log('2')
      res.render('editCategory',{category:categoryData})
     }else{
      res.redirect('/admin/categories')
     }
  }catch(error){
    return res.status(500).json({Success:false,message:"Internal Server error"})
  }
}


const updateCategory = async(req,res)=>{
  try{
    const {id, name , description } = req.body;

    await Category.findByIdAndUpdate({_id:id},{
        $set :{
          name:name,
          description:description
        },
      }
    )
    res.redirect('/admin/categories')
  }catch(error){
    return res.status(500).json({success:false,message:"Internal server error"}) 
  }
}


const deleteCategory = async(req,res)=>{
  try{

    const id = req.params.id;
    await Category.findByIdAndDelete({ _id:id });
    res.redirect('/admin/categories');
  }catch(error){
      console.log(error.message)
  }
}
module.exports={
    categories,
    addCategorypage,
    addCategory,
    unListCategory,
    isListCategory,
    editCategoryPage,
    // editCategory,
    updateCategory,
    deleteCategory

}