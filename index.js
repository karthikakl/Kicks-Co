require('dotenv').config()
const express = require('express')
const app = express()
const session = require('express-session')
const path = require('path')
const userRouter =require('./Router/userRoute');
const adminRouter = require('./Router/adminRoute');
const CategoryRouter = require('./Router/categoryRoute');
const productRouter  = require('./Router/productRouter');
const cartRouter = require('./Router/cartRouter');
const addressRouter=require('./Router/addressRoute');
const orderRouter = require('./Router/orderRoute');


const nocache  = require('nocache')
const mongoose = require('mongoose')
mongoose.connect (process.env.MONGODB);
 
app.use(express.static(path.join(__dirname,'public')));  ///route

app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.set('view engine','ejs')
// app.set('views',path.join(__dirname,'views'))

app.use(nocache())
app.use('/',userRouter);
app.use('/admin',adminRouter);
app.use('/admin',CategoryRouter);
app.use('/admin',productRouter);
app.use('/',cartRouter);
app.use('/',addressRouter);
app.use('/',orderRouter);


// 404 page

app.get('/404', (req, res) => {
    res.render('user/404');
});


app.use((req,res,next)=>{
    res.status(404).render('user/404')
})

//for error handling

app.use((req,res,next)=>{
    console.error(err.stack);
    res.status(500).send('Internal Server Error');
})

app.listen(5000);
console.log('server running on http://localhost:5000')
""
