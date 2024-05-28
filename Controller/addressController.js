const Address = require('../Model/addressModel');
const User = require("../Model/userModel");
const Order = require("../Model/orderModel");
const Wallet = require("../Model/walletModel");

const userAccount = async (req, res) => {   //address
    try {
        const userId = req.session.user_id;

        const addresses = await Address.find({ user: userId })

        const order = await Order.find({user:userId})

        const users = await User.findById(userId)
        
        let address= addresses.length >0 ?addresses[0].address:null;

        const wallet = await Wallet.findOne({user:userId})
   
  
    res.render('userDetails', { users, address ,order,user:userId,wallet})
        
    } catch (error) {
        console.log(error);
        return res.status(500).json({ Success: false, message: "Internal Server error" })
    }
}

const addpage = async (req, res) => {
    try {
        res.render('addAddress')
    } catch (error) {
        return res.status(500).json({ Success: false, message: "Internal Server error" })
    }
}

const addAddress = async (req, res) => {
    try {
        console.log(req.body);
        const { houseName, street, city, state, pinCode } = req.body
        const user = req.session.user_id;



        let userAddress = await Address.findOne({user:user});


        if (userAddress) {
            const existingAddress = userAddress.address.find(address =>
                address.HouseName === houseName &&
                address.Street === street &&
                address.City === city &&
                address.state === state &&
                address.pinCode === pinCode
            );
            if (existingAddress) {
                return res.status(500).json({ Success: false, message: "Address already exists" })
            }


            userAddress.address.push ({
                HouseName: houseName,
                Street: street,
                City: city,
                state: state,
                pinCode: pinCode
            });

            // userAddress.address.push(newAddress);

            await userAddress.save();

            
            return res.redirect('/account');
        } else {

            const newAddressdoc = new Address({
                user: user,
                address: [{
                    HouseName: houseName,
                    Street: street,
                    City: city,
                    state: state,
                    pinCode: pinCode

                }]
            });

            await newAddressdoc.save();

            console.log('newAddress============:', newAddressdoc);
            res.redirect('/account')
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ Success: false, message: "Internal Server error" })
    }
}


const editPage = async(req,res)=>{
    try {
        console.log(req.params);
        const user= req.session.user_id;
        const addressId = req.params.id;
        const address = await Address.findOne({user,'address._id':addressId});

        console.log('add---------------------;',address);
if(!address){
    return res.status(404).json({success:false,message:'address not found'})
}
const addressData = address.address.find(addr => addr._id.toString()=== addressId)
        res.render('editAddress',{address: addressData })
    } catch (error) {
        console.log(error);
        return res.status(500).json({ Success: false, message: "Internal Server error" }) 
    }
}

const editAddress = async(req,res)=>{
    try {
        const {  houseName, street, city, state, pinCode} = req.body
        const user = req.session.user_id;
        const addressId = req.params.id;

        const updateAddress = await Address.updateOne({user,'address._id':addressId},{$set:{
            "address.$.HouseName": houseName, 
                    "address.$.Street": street,
                    "address.$.City": city,
                    "address.$.state": state,
                    "address.$.pinCode": pinCode}})

        res.redirect('/account');

    } catch (error) {
        return res.status(500).json({ Success: false, message: "Internal Server error" })  
    }
}

const deleteAddress = async(req,res)=>{
    try {
        const user= req.session.user_id;
        const addressId = req.params.id;

        const updateAddress= await Address.findOne({user:user})

        await Address.findByIdAndUpdate(updateAddress._id,{
            $pull:{address:{_id:addressId}}
        })
       
        return res.status(200).json({ success: true, message: "Address deleted successfully" });
    } catch (error) {
        console.log(error);
       return res.status(404).render('404');
      
    }
}

module.exports = {
    userAccount,
    addpage,
    addAddress,
    editPage,
    editAddress,
    deleteAddress
   
}