require('dotenv').config();
var base64ImageToFile = require('base64image-to-file');

const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios')
const token = '2016635266:AAHUUJfPAAmGDs18-kkS_EZ_LE08LffdwSc';

// Created instance of TelegramBot
const bot = new TelegramBot(token, {
    polling: true
});
var resId ='';
var category ='';
var listOfCategory='';
var listOfRestaurant ='';
var listOfRestaurants =''
var listOfQunatity ='';
var listOfAccount ='';
var listOfFilterFood ='';
var addToCart;
var listOfFood = '';
var quantity = 0;
var price = 0;
var foodName='';
var foodId ='';
var lat ='';
var lon = '';
var languague ='english';
var locationSetting = false
var username ='';
var chatIdNumber;
var statusDriver = [
    {  val: 'picked', isChecked: false },
    { val: 'start moving', isChecked: false },
    {  val: 'delivered', isChecked: false }
  ];
var statusRestaurant = [
     {  val: 'order received', isChecked: true },
     {  val: 'start cooking', isChecked: false },
     {  val: 'cooked', isChecked: false },
     { val: 'ready to service', isChecked: false }
   ];
var status = [
     { val: 'Accept', isChecked: false},
     { val: 'Reject', isChecked: false}
   ];
 var  currentDate = new Date().toISOString();
 console.log(currentDate)  
 getAccount()
// Listener(handler) for callback data from category list based on restuarant Category
bot.on('callback_query', (callbackQuery) => {
    var keyboard = [];
    if(languague == 'english'){
        content ='Choose category of food 👇?'
        error ='no foods'
    }
    else{
        content = 'የምግብ አይነት ይምረጡ👇'
        error ='ምግብ የለም '
    }
    const message = callbackQuery.message;
    chatIdNumber = message.chat.id;
    const restuarantId = callbackQuery.data; 
    //console.log(listOfCategory)
    if(!isNaN(restuarantId)){
    resId = restuarantId
    }
    if(typeof restuarantId === 'string'){
        getCategoryOfRes(restuarantId)
        .then((result=>{
            for (var i = 0; i < result.length; i++) {
                keyboard.push([{'text': result[i], 'callback_data': (result[i])}]);
              }
              bot.sendMessage(message.chat.id,content,
            {
                reply_markup: JSON.stringify({
                    inline_keyboard: keyboard
                  })
            });
          }))
    }
});

// Listener (handler) for callback data from food list based on restaurant Id and categoryId 
bot.on('callback_query', (callbackQuery) => {
    var keyboard = [];
    let content =''
    let error =''
    const message = callbackQuery.message;
    chatIdNumber = message.chat.id;
    const categories = callbackQuery.data;
    if(languague == 'english'){
        content ='Which 🍖'+ categories +' do you want to order?'
        error ='no foods'
    }
    else{
        content = 'የትኛውን 🍹'+categories+ ' ማዘዝ ይፈልጋሉ?'
        error ='ምግብ የለም '
    }
    if(typeof categories === 'string'){
        getFoodByCatIDResId(categories)
        .then((result=>{
            if(result !=undefined){
                for (var i = 0; i < result.length; i++) {
                    //console.log(result[i].name)
                        keyboard.push([{'text': result[i].name, 'callback_data': (result[i].foodId)}]);
                      }
                      bot.sendMessage(message.chat.id,content,
                    {
                        reply_markup: JSON.stringify({
                            inline_keyboard: keyboard
                          })
                    });
            }
            else{
                bot.sendMessage(message.chat.id, error);
            }
        }));
    }
});

// Listener (handler) for callback data from food list based on restaurant Id 
bot.on('callback_query', (callbackQuery) => {
    const message = callbackQuery.message;
    chatIdNumber = message.chat.id;
    const categories = callbackQuery.data;
    category = callbackQuery.data;
    let content =''
    let error =''
    let found = listOfFilterFood.find(c=>c.foodId == category)
    if(languague == 'english'){
        content ='Choose from keyboards or type the amount!'
        error ='no foods'
    }
    else{
        content = 'ምን ያህል ማዘዝ ይፈልጋሉ? ከስር ከተለጠፉት ቁልፎች ውስጥ ይምረጡ ወይም የሚፈልጉትን ብዛት ይፃፉ።!'
        error ='ምግብ የለም '
    }
    if(found !=undefined)
    {
       // console.log(found.categoryId)
        getFood(found.categoryId)
        .then((result=>{
            if(result !=undefined){
                price = result.price;
                var base64Image = result.picture;
            // create an image with the a given name ie 'image'
            base64ImageToFile(base64Image, '/tmp', 'image', function(err, imgPath) {
              if(err) {
                return console.error(err);
              }
              results = `Foods of  ${result.name}
              Price :  ${result.price}
              endworking time:  ${result.cookingTime}
              delivery time:  ${result.deliveryTime}`
              bot.sendPhoto(message.chat.id, imgPath ,{caption:results});
              if(imgPath.length > 0){
                bot.sendMessage(message.chat.id,content,
                 {
                     reply_markup: {
                         resize_keyboard: true,
                         one_time_keyboard: true,
                         keyboard:[
                             [ { text:'1'},{text:'2'},{text:'3'}],
                             [ { text:'4'},{text:'5'},{text:'6'}],
                             [ { text:'7'},{text:'8'},{text:'9'}]
                       ]
                       }
                  })
                
              }
            });
            }
            else{
                bot.sendMessage(message.chat.id, error);
            }
        }));
    }
});
// Listener (handler) for callback data from food list based on restaurant Id 
bot.on('callback_query', (callbackQuery) => {
    const message = callbackQuery.message;
    chatIdNumber = message.chat.id;
    const categories = callbackQuery.data;
   
    if(categories =='Cancel order'|| categories =='ትዕዛዝን ሰርዝ')
    {
        restuarantDisplay()
    }
});
// Listener (handler) for callback data from food list based on restaurant Id 
bot.on('callback_query', (callbackQuery) => {
    const message = callbackQuery.message;
    chatIdNumber = message.chat.id;
    const categories = callbackQuery.data;
    if(categories =='Confirm and Order'|| categories =='ያረጋግጡ እና ያዝዙ')
    {
        var contentOfConfirm =''
        var cancelOrder ='' 
      if(languague=='english'){
        contentOfConfirm ='Your order is successfully sent, please wait for our phone call to get more details. To cancel your order, press Cancel button'
          cancelOrder ='Cancel order'
        }  
      else{
        contentOfConfirm ='ትዕዛዝዎ በተሳካ ሁኔታ ተልኳል ፣ እባክዎን ተጨማሪ ዝርዝሮችን ለማግኘት የእኛን የስልክ ጥሪ ይጠብቁ። ትዕዛዝዎን ለመሰረዝ ፣ ሰርዝ የሚለውን ቁልፍ ይጫኑ'
          cancelOrder = 'ትዕዛዝን ሰርዝ'
        }
        bot.sendMessage(chatIdNumber, contentOfConfirm,{
            reply_markup: {
                inline_keyboard: 
                 [[{'text': cancelOrder, 'callback_data': cancelOrder}]]
            }
        })
    }
});
//method for requesting user's phone number
bot.on('message', (msg) => {
    if(!isNaN(msg.text)){
        quantity = +(msg.text)
        let content = '';
        let orderSetting ='';
        let backPrev = ''
        if(languague =='english'){
            content =' x  added to basket! Do you want additional order ? If not press the 🛵 Order button!'
            orderSetting ='Orders'
            backPrev ='Back'
        }
        else{
            content = 'x  ወደ ትዕዛዝ ማስቀመጫ ተጨምሯል! ተጨማሪ ትዕዛዝ ከ  ይፈልጋሉ?  ካልፈለጉ 🛵 ይታዘዝ የሚለውን ቁልፍ ይጫኑ!'
            orderSetting ='ይታዘዝ'
            backPrev ='ወደ ኃላ ለመመለስ'
        }
        bot.sendMessage(msg.chat.id,msg.text+content,
        {
             reply_markup: {
                    resize_keyboard: true,
                    one_time_keyboard: true,
                    keyboard:[
                           [{ text:backPrev}, { text:orderSetting}]
                       ]
                  }
        })
    }
    else if(msg.text=='Orders' || msg.text =='ይታዘዝ'){
        const opts = {
            reply_markup: JSON.stringify({
              keyboard: [
                [{text: 'Location', request_location: true}]
              ],
              resize_keyboard: true,
              one_time_keyboard: true,
            }),
          };
        bot.sendMessage(msg.chat.id,'Please turn on your device location and press the 📍share my location button below',opts);
        locationSetting = true;
        console.log(locationSetting)
        // bot.sendMessage(msg.chat.id,'order success add!!')
    }
    else if(msg.text =='Back' || msg.text=='ወደ ኃላ ለመመለስ'){
     menu(msg.chat.id);
    }
    //// Listener (handler) for callback data from restaurant list
    else if(msg.text =='Choose Restaurant' || msg.text =='ሬስቶራንት ይምረጡ'){
        restuarantDisplay();
    }
    else if(msg.text == 'Setting' || msg.text == 'ማስተካከያ'){
        bot.sendMessage(msg.chat.id, 'setting ', {
            reply_markup: {
                keyboard: 
                  [[{text : 'English'},{text: '🇪🇹 አማርኛ'},],
                   [{text: 'Back',}]
                   ]
            }
        })
    }
    else if(msg.text == 'English'){
     bot.sendMessage(msg.chat.id,'Language is changed to English')
     languague = 'english'
    // console.log(languague)
    }
    else if(msg.text == '🇪🇹 አማርኛ'){
     bot.sendMessage(msg.chat.id,'ቋንቋው ወደ አማርኛ ተለውጧል')
     languague = 'amharic'
    // console.log(languague)
    }
    else if(msg.text =='🛵 Order'|| msg.text =='🛵 ትዕዛዝ'){
        var context =''
        var confirm ='' 
      if(languague=='english'){
          context ='Dear '+msg.from.first_name+ ' ' +msg.from.last_name +'  you will be able to cancel the order until it gets accepted by the restaurant, after the restaurant accepts the order you will not be able to cancel the order and you will have to pay for that order. Do you agree on our terms of use?'
          confirm ='Confirm and Order'
        }  
      else{
          context ='ውድ '+msg.from.first_name+ ' ' +msg.from.last_name +' ምግብ ቤቱ ተቀባይነት እስኪያገኝ ድረስ ትዕዛዙን መሰረዝ ይችላሉ ፣ ምግብ ቤቱ ትዕዛዙን ከተቀበለ በኋላ ትዕዛዙን መሰረዝ አይችሉም እና ለዚያ ትዕዛዝ መክፈል ይኖርብዎታል። በእኛ የአጠቃቀም ውሎች ይስማማሉ?'
          confirm = 'ያረጋግጡ እና ያዝዙ'
        }
      bot.sendMessage(msg.chat.id,context,{
        reply_markup: {
            resize_keyboard: true,
            one_time_keyboard: true,
            inline_keyboard: 
              [[{'text': confirm, 'callback_data': confirm}]]
        }
      })
    }
    else if(msg.text =='🔁 Restart the bot'|| msg.text =='🔁 ቦቱን እንደገና ለማስጀመር'){
        menu(msg.chat.id);
    }
    else if(msg.text == undefined){
        const chatId = msg.chat.id;
        //console.log(locationSetting)
         if(locationSetting == true){
            lat = msg.location.latitude;
            console.log(lat)
            lon = msg.location.longitude
            console.log(lon)
            AddOrder();
            addOrderDetail()
            .then((result=>{
                if(result !=undefined){
                    bot.sendMessage(msg.chat.id,addToCart);
                }
            }))
         }
    let data ={
        email: msg.from.username,
        phonenumber: msg.contact.phone_number,
        password: "null",
        fullName: msg.from.first_name +' '+msg.from.last_name,
        active: "true",
        type: "customer",
        locationId: {
            latitude: 9.0132133,
            longtude: 38.7373079
        }  
    }
    //console.log(data);
    addAccount(data);
      menu(chatId);
    }
});
function restuarantDisplay(){
    getdata()
    .then((result)=>{
    this.listOfName = result
    listOfRestaurant = result
        var keyboard = [];
        let settment =''
        if(languague =='english'){
            settment ='Which restaurant do you want to order from?'
        }
        else{
            settment ='ከየትኛው ምግብ ቤት ማዘዝ ይፈልጋሉ?'
        }
        for (var i = 0; i < result.length; i++) {
        // console.log(result[i].id)
        keyboard.push([{'text': result[i].name,'callback_data': (result[i].id)}]);
        }
        bot.sendMessage(chatIdNumber, settment,
        {
            reply_markup: JSON.stringify({
                inline_keyboard: keyboard
        })
     })
   })
  }
function menu(chatId){
        let settment =''
        let restaurant =''
        let setting =''
        if(languague == 'english'){
            settment = 'You have completed registration, now lets order food!'
            restaurant = 'Choose Restaurant'
            setting ='Setting'
        }
        else{
            settment ='ምዝገባውን አጠናቀዋል ፣ አሁን ምግብ ለማዘዝ ይፍቀዱ!'
            restaurant ='ሬስቶራንት ይምረጡ'
            setting ='ማስተካከያ'
        }
        bot.sendMessage(chatId, settment, {
            reply_markup: {
                resize_keyboard: true,
                one_time_keyboard: true,
                keyboard: 
                  [[
                    {
                        text: restaurant
                    },
                    {
                        text: setting
                    }
                  ]]
            }
        })
}
async function addAccount(data){
    url = 'http://localhost:49347/api/account'
     await axios.post(url,data)
    .then(function(response){
        console.log(response.data)
    });
}
async function AddOrder(){
    url ='http://localhost:49347/api/order'
     let locations={
        latitude:lat,
        longtude:lon
     }
    let user =  listOfAccount.find(c=>c.email == username).id
    console.log(user)
    let order ={
        restaurantId:resId,
        dateTime: currentDate,
        customer: user.toString(),
        location: locations, // to insert loging user (customer) of location
        orderStatuses: statusDriver,
        total: quantity*price,
        driver: 'null',
        vehicle: 'null',
        orderLocation: 'null', // or droupLocation
        restaurantStatuses: statusRestaurant,
        customerStatus: 'true',
        statuses: status
      }
      //console.log(order)
     await axios.post(url,order)
     .then(function (response) {
         console.log(response.data)
       // addOrderDetail()
      });
}
async function addOrderDetail(){
    let order =''
    let restartBot =''
    if(languague == 'english'){
        restartBot = '🔁 Restart the bot'
        order ='🛵 Order'
    }
    else{
        order ='🛵 ትዕዛዝ'
        restartBot ='🔁 ቦቱን እንደገና ለማስጀመር'
    }
    url ='http://localhost:49347/api/order'
    urlOrderDetail = 'http://localhost:49347/api/orderDetail'
    let res = await axios.get(url)
    console.log(res.data[0].restaurantId)
    //console.log(listOfRestaurants)
    const orderDetails = {
     orderId: res.data[0].id+1,
     foodId: foodId,
     qty: quantity,
     price: price
    }
        addToCart = `Order :
        ID: ${res.data[0].id+1}
        Restaurant:  ${listOfRestaurants.find(c=>c.id == +(res.data[0].restaurantId)).name}
       Foods :  ${listOfFilterFood.find(c=>c.id==foodId).name}
      Foods total sum:  ${quantity*price}
      Total sum:  ${quantity*price}
      Press 🛎 Order button to place your order👇`
      bot.sendMessage(chatIdNumber,addToCart,{
        reply_markup: {
            resize_keyboard: true,
            one_time_keyboard: true,
            keyboard: 
              [[
                {
                    text: order
                },
                {
                    text: restartBot
                }
              ]]
        }
    })
     axios.post(urlOrderDetail,orderDetails)
    .then(function(response){
    console.log(response.data)
    return addToCart
    });
}
async function getAccount(){
    url = 'http://localhost:49347/api/account'
    let res = await axios.get(url);
    listOfAccount = res.data;
    return res.data;
}
async function getorder(){
    url ='http://localhost:49347/api/order'
    let res=await axios.get(url)
  //  console.log(res.data)
}
async function getRestaurant(){
    url ='http://localhost:49347/api/restaurant'
    let res = await axios.get(url)
    listOfRestaurants = res.data;
}
async function getdata(){
    url ='http://localhost:49347/api/restaurant'
    let res = await axios.get(url)
    listOfRestaurant = res.data;
    stateDataArr = res.data
    let listOfResName =[]
    stateDataArr.forEach(element => {
        restaurantName = element.name
        let data ={
            id:element.id,
            name:element.name,
        }
        listOfResName.push(data);
     });
    return listOfResName
}
 
async function getCategoryOfRes(id){
    url ='http://localhost:49347/api/restaurant'
    let res = await axios.get(url)
   // console.log(res.data.find(c=>c.id==id).categoryId)
    return res.data.find(c=>c.id==id).categoryId
}
async function getCategory(){
    urlC ='http://localhost:49347/api/categorie'
      let resCategory = await axios.get(urlC)
      listOfCategory = resCategory.data;
      return resCategory.data
}
// to fetch food by filter categoryId and restaurantId
async function getFoodByCatIDResId(categoryName){
    url = 'http://localhost:49347/api/food'
    urlC ='http://localhost:49347/api/categorie'
    let resCate = await axios.get(urlC)
    let resFood = await axios.get(url)
    let categoryId = resCate.data.find(c=>c.categoryName==categoryName)
    let element = resFood.data.filter(c=> c.categoryId == categoryId.id && c.restaurantId == resId);
   // console.log(element[0].foodId);
    listOfFilterFood = element;
    return element;
}
 async function getFood(categoryId){
    urlC ='http://localhost:49347/api/categorie'
      let resCategory = await axios.get(urlC)
    url ='http://localhost:49347/api/food'
    let res = await axios.get(url)
    listOfFood = res.data;
    console.log(categoryId)
      let element = res.data.find(c=> c.categoryId == categoryId && c.restaurantId == resId);
      if(element !=undefined){
        foodName = element.name;
        foodId = element.id
      }
     // console.log(element)
       return element
 }
// Provide the list of available commands
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    chatIdNumber =chatId
    username = msg.from.username
    getCategory();
    getRestaurant();
    getorder();
    getAccount();
    bot.sendMessage(
        chatId,
        `
            Welcome at <b>HadimDeliveryBot</b>, thank you for using my service
    
            Available commands:
        
            /Start <b>URL</b> - save interesting article URL
        `, {
            parse_mode: 'HTML',
        }
    ); 
    let find = listOfAccount.find(c=>c.email ==msg.from.username && c.fullName == msg.from.first_name +' '+msg.from.last_name)
    if(find != undefined){
        //console.log('yes are you interesting with javascript developer ')
     menu(chatId)
    }
    else{
        bot.sendMessage(msg.chat.id,'Now press 📞Share my phone number key below👇 to finish registration.',
        {
            reply_markup: {
                resize_keyboard: true,
                one_time_keyboard: true,
                keyboard:[[{ text:'📞Share my phone number',request_contact: true}]]
              }
        })
    }
});