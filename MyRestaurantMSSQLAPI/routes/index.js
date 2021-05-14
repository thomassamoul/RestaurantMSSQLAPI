var API_KEY = "1234";

var express = require('express')
var router = express.Router();

const { poolPromise, sql } = require('../db')

//test api
router.get('/', function (req, res) {
    res.end("API RUNNING");
})

/*
 * user table
 * GET - POST
 */
router.get('/user', async (req, res, next) => {

    console.log(req.query);
    if (req.query.key != API_KEY) {
        res.send(JSON.stringify({ success: false, message: "Wrong API KEY" }));

    } else {
        var fbid = req.query.fbid;
        if (fbid != null) {

            try {
                const pool = await poolPromise
                const queryResult = await pool.request()
                    .input('fbid', sql.NVarChar, fbid)
                    .query('SELECT userPhone,name,address,fbid FROM [User] where fbid=@fbid')
                if (queryResult.recordset.length > 0) {
                    res.send(JSON.stringify({ success: true, result: queryResult.recordset }));

                } else
                    res.send(JSON.stringify({ success: false, message: "Empty" }));

            }
            catch (err) {
                res.status(500)
                res.send(JSON.stringify({ success: false, message: err.message }));
            }
        }


        else {
            res.end(JSON.stringify({ success: false, message: "missing fbid in query" }));

        }
    }

})
router.post('/user', async (req, res, next) => {
    console.log(req.body)
    if (req.body.key != API_KEY) {
        res.send(JSON.stringify({ success: false, message: "Wrong API Key" }));
    } else {
        var user_phone = req.body.userPhone;
        var user_name = req.body.userName;
        var user_address = req.body.userAddress;
        var fbid = req.body.fbid;

        if (fbid != null) {
            try {
                const pool = await poolPromise
                const queryResult = await pool.request()
                    .input('UserPhone', sql.NVarChar, user_phone)
                    .input('UserName', sql.NVarChar, user_name)
                    .input('UserAddress', sql.NVarChar, user_address)
                    .input('FBID', sql.NVarChar, fbid)
                    .query('IF EXISTS (SELECT *from [User] where FBID =@FBID)'
                        + ' update [User] set Name =@UserName ,Address=@UserAddress where FBID =@FBID '
                        + ' else'
                        + ' insert into [User](FBID,UserPhone,Name,Address) output inserted.FBID,inserted.UserPhone,inserted.Name,inserted.Address'
                        + ' values (@FBID,@UserPhone,@UserName,@UserAddress)'
                    );

                console.log(queryResult)

                if (queryResult.rowsAffected != null) {
                    res.send(JSON.stringify({ success: true, message: "Success" }))
                }
                else
                    res.send(JSON.stringify({ success: false, message: "Empty" }));

            }
            catch (err) {
                res.status(500)
                res.send(JSON.stringify({ success: false, message: err.message }));
            }
        } else {
            res.send(JSON.stringify({ success: false, message: "Missing fbid in body" }));
        }
    }
})

/*
 * RESTAURANT table 
 * GET 
 */
router.get('/restaurant', async (req, res, next) => {

    console.log(req.query);
    if (req.query.key != API_KEY) {
        res.send(JSON.stringify({ success: false, message: "Wrong API KEY" }));

    } else {


        try {
            const pool = await poolPromise
            const queryResult = await pool.request()
                .query('SELECT id,name,address,lat,lng,userOwner,image,paymentUrl from [Restaurant]')
            if (queryResult.recordset.length > 0) {
                res.send(JSON.stringify({ success: true, result: queryResult.recordset }));

            } else
                res.send(JSON.stringify({ success: false, message: "Empty" }));

        }
        catch (err) {
            res.status(500)
            res.send(JSON.stringify({ success: false, message: err.message }));
        }



    }

})
router.get('/restaurantId', async (req, res, next) => {

    console.log(req.query);
    if (req.query.key != API_KEY) {
        res.send(JSON.stringify({ success: false, message: "Wrong API KEY" }));

    } else {
        var restaurant_id = req.query.restaurantId;
        if (restaurant_id != null) {



            try {
                const pool = await poolPromise
                const queryResult = await pool.request()
                    .input('RestaurantId', sql.Int, restaurant_id)
                    .query('SELECT id,name,address,lat,lng,userOwner,image,paymentUrl from [Restaurant] where id=@RestaurantId')
                if (queryResult.recordset.length > 0) {
                    res.send(JSON.stringify({ success: true, result: queryResult.recordset }));

                } else
                    res.send(JSON.stringify({ success: false, message: "Empty" }));

            }
            catch (err) {
                res.status(500)
                res.send(JSON.stringify({ success: false, message: err.message }));
            }
        }
        else {
            res.send(JSON.stringify({ success: false, message: "Missing restaurant id in query " }));

        }

    }

})
router.get('/neerbyrestaurant', async (req, res, next) => {

    console.log(req.query);
    if (req.query.key != API_KEY) {
        res.send(JSON.stringify({ success: false, message: "Wrong API KEY" }));

    } else {
        var user_lat = parseFloat(req.query.lat);
        var user_lng = parseFloat(req.query.lng);
        var distance = parseInt(req.query.distance);

        if (user_lat != Number.NaN && user_lng != Number.NaN) {

            try {
                const pool = await poolPromise
                const queryResult = await pool.request()
                    .input('lat', sql.Float, user_lat)
                    .input('lng', sql.Float, user_lng)
                    .input('distance', sql.Int, distance)

                    .query('SELECT *from (SELECT id,name,address,phone,lat,lng,userOwner,image,paymentUrl, '
                        + 'ROUND(111.045 * DEGREES(ACOS(COS(RADIANS(@lat))*COS(RADIANS(lat))'
                        + '* COS(RADIANS(lng) - RADIANS(@lng)) + SIN(RADIANS(@lat))'
                        + '* SIN(RADIANS(lat)))),2) AS distance_in_km FROM [Restaurant])tempTable '
                        + ' WHERE distance_in_km <@distance')

                if (queryResult.recordset.length > 0) {
                    res.send(JSON.stringify({ success: true, result: queryResult.recordset }));

                } else
                    res.send(JSON.stringify({ success: false, message: "Empty" }));

            }
            catch (err) {
                res.status(500)
                res.send(JSON.stringify({ success: false, message: err.message }));
            }
        }
        else {
            res.send(JSON.stringify({ success: false, message: "Missing lat or lng in query " }));

        }

    }

})

/*
 * MENU table
 * GET
 */
router.get('/menu', async (req, res, next) => {

    console.log(req.query);
    if (req.query.key != API_KEY) {
        res.send(JSON.stringify({ success: false, message: "Wrong API KEY" }));

    } else {
        var restaurant_id = req.query.restaurantId;
        if (restaurant_id != null) {



            try {
                const pool = await poolPromise
                const queryResult = await pool.request()
                    .input('RestaurantId', sql.Int, restaurant_id)
                    .query('SELECT id,name,description,image from [Menu] WHERE id In'
                        + '(SELECT menuId FROM [RESTAURANT_MENU] WHERE restaurantId=@RestaurantId) ')


                if (queryResult.recordset.length > 0) {
                    res.send(JSON.stringify({ success: true, result: queryResult.recordset }));

                } else
                    res.send(JSON.stringify({ success: false, message: "Empty" }));

            }
            catch (err) {
                res.status(500)
                res.send(JSON.stringify({ success: false, message: err.message }));
            }

        } else {
            res.send(JSON.stringify({ success: false, message: "Missing RestaurantId in query" }));

        }

    }

})

/*
 * FOOD table
 * GET
 */
router.get('/food', async (req, res, next) => {

    console.log(req.query);
    if (req.query.key != API_KEY) {
        res.send(JSON.stringify({ success: false, message: "Wrong API KEY" }));

    } else {
        var menu_id = req.query.menuId;
        if (menu_id != null) {

            try {
                const pool = await poolPromise
                const queryResult = await pool.request()
                    .input('MenuId', sql.Int, menu_id)
                    .query('SELECT id,name,description,image,price,isSize,isAddon,discount from [Food] WHERE id In'
                        + '(SELECT foodId FROM [Menu_Food] WHERE menuId=@MenuId) ')


                if (queryResult.recordset.length > 0) {
                    res.send(JSON.stringify({ success: true, result: queryResult.recordset }));

                } else
                    res.send(JSON.stringify({ success: false, message: "Empty" }));

            }
            catch (err) {
                res.status(500)
                res.send(JSON.stringify({ success: false, message: err.message }));
            }

        } else {
            res.send(JSON.stringify({ success: false, message: "Missing menuId in query" }));

        }

    }

})
router.get('/foodById', async (req, res, next) => {

    console.log(req.query);
    if (req.query.key != API_KEY) {
        res.send(JSON.stringify({ success: false, message: "Wrong API KEY" }));

    } else {
        var food_id = req.query.foodId;
        if (food_id != null) {

            try {
                const pool = await poolPromise
                const queryResult = await pool.request()
                    .input('FoodId', sql.Int, food_id)
                    .query('SELECT id,name,description,image,price,isSize,isAddon,discount from [Food] WHERE id =@FoodId ')


                if (queryResult.recordset.length > 0) {
                    res.send(JSON.stringify({ success: true, result: queryResult.recordset }));

                } else
                    res.send(JSON.stringify({ success: false, message: "Empty" }));

            }
            catch (err) {
                res.status(500)
                res.send(JSON.stringify({ success: false, message: err.message }));
            }

        } else {
            res.send(JSON.stringify({ success: false, message: "Missing menuId in query" }));

        }

    }

})
router.get('/searchFood', async (req, res, next) => {

    console.log(req.query);
    if (req.query.key != API_KEY) {
        res.send(JSON.stringify({ success: false, message: "Wrong API KEY" }));

    } else {
        var search_query = req.query.foodName;
        if (search_query != null) {

            try {
                const pool = await poolPromise
                const queryResult = await pool.request()
                    .input('SearchQuery', sql.NVarChar, '%' + search_query + '%')
                    .query('SELECT id,name,description,image,price,isSize,isAddon,discount from [Food] WHERE name LIKE @SearchQuery ')


                if (queryResult.recordset.length > 0) {
                    res.send(JSON.stringify({ success: true, result: queryResult.recordset }));

                } else
                    res.send(JSON.stringify({ success: false, message: "Empty" }));

            }
            catch (err) {
                res.status(500)
                res.send(JSON.stringify({ success: false, message: err.message }));
            }

        } else {
            res.send(JSON.stringify({ success: false, message: "Missing foodName in query" }));

        }

    }

})

/*
 * SIZE table
 * GET
 */
router.get('/size', async (req, res, next) => {

    console.log(req.query);
    if (req.query.key != API_KEY) {
        res.send(JSON.stringify({ success: false, message: "Wrong API KEY" }));

    } else {
        var food_id = req.query.foodId;
        if (food_id != null) {

            try {
                const pool = await poolPromise
                const queryResult = await pool.request()
                    .input('FoodId', sql.Int, food_id)
                    .query('SELECT id,description,extraPrice FROM [Size] WHERE id IN'
                        + '(SELECT sizeId FROM [Food_Size] WHERE foodId=@FoodId) ')

                if (queryResult.recordset.length > 0) {
                    res.send(JSON.stringify({ success: true, result: queryResult.recordset }));

                } else
                    res.send(JSON.stringify({ success: false, message: "Empty" }));

            }
            catch (err) {
                res.status(500)
                res.send(JSON.stringify({ success: false, message: err.message }));
            }

        } else {
            res.send(JSON.stringify({ success: false, message: "Missing foodId in query" }));

        }

    }

})

/*
 * ADDON table
 * GET
 */
router.get('/addon', async (req, res, next) => {

    console.log(req.query);
    if (req.query.key != API_KEY) {
        res.send(JSON.stringify({ success: false, message: "Wrong API KEY" }));

    } else {
        var food_id = req.query.foodId;
        if (food_id != null) {

            try {
                const pool = await poolPromise
                const queryResult = await pool.request()
                    .input('FoodId', sql.Int, food_id)
                    .query('SELECT id,description,name,extraPrice FROM [Addon] WHERE id IN'
                        + '(SELECT AddonId FROM [Food_Addon] WHERE foodId=@FoodId) ')

                if (queryResult.recordset.length > 0) {
                    res.send(JSON.stringify({ success: true, result: queryResult.recordset }));

                } else
                    res.send(JSON.stringify({ success: false, message: "Empty" }));

            }
            catch (err) {
                res.status(500)
                res.send(JSON.stringify({ success: false, message: err.message }));
            }

        } else {
            res.send(JSON.stringify({ success: false, message: "Missing foodId in query" }));

        }

    }

})

/*
 * ORDER and ORDER DETAIL table
 * GET - POST
 */
router.get('/order', async (req, res, next) => {

    console.log(req.query);
    if (req.query.key != API_KEY) {
        res.send(JSON.stringify({ success: false, message: "Wrong API KEY" }));

    } else {
        var order_fbid = req.query.orderFBID;
        if (order_fbid != null) {

            try {
                const pool = await poolPromise
                const queryResult = await pool.request()
                    .input('OrderFBID', sql.NVarChar, order_fbid)
                    .query('SELECT orderID,orderFBID,orderPhone,orderName,orderAddress,orderStatus,'
                        + 'orderDate,restaurantId,transactionId,cod,totalPrice,numOfItem'
                        + ' From [Order] WHERE orderFBID=@OrderFBID')

                if (queryResult.recordset.length > 0) {
                    res.send(JSON.stringify({ success: true, result: queryResult.recordset }));

                } else
                    res.send(JSON.stringify({ success: false, message: "Empty" }));
            }
            catch (err) {
                res.status(500)
                res.send(JSON.stringify({ success: false, message: err.message }));
            }

        } else {
            res.send(JSON.stringify({ success: false, message: "Missing orderFBID in query" }));

        }

    }

})

router.get('/orderDetail', async (req, res, next) => {

    console.log(req.query);
    if (req.query.key != API_KEY) {
        res.send(JSON.stringify({ success: false, message: "Wrong API KEY" }));

    } else {
        var order_id = req.query.orderId;
        if (order_id != null) {

            try {
                const pool = await poolPromise
                const queryResult = await pool.request()
                    .input('OrderId', sql.Int, order_id)
                    .query('SELECT orderId,itemId,quantity,discount,extraPrice,size,addOn FROM [OrderDetail] WHERE orderId =@OrderId')

                if (queryResult.recordset.length > 0) {
                    res.send(JSON.stringify({ success: true, result: queryResult.recordset }));

                } else
                    res.send(JSON.stringify({ success: false, message: "Empty" }));
            }
            catch (err) {
                res.status(500)
                res.send(JSON.stringify({ success: false, message: err.message }));
            }

        } else {
            res.send(JSON.stringify({ success: false, message: "Missing orderId in query" }));

        }

    }

})

router.post('/createOrder', async (req, res, next) => {
    console.log(req.body)
    if (req.body.key != API_KEY) {
        res.send(JSON.stringify({ success: false, message: "Wrong API Key" }));
    } else {
        var order_phone = req.body.orderPhone;
        var order_name = req.body.orderName;
        var order_address = req.body.orderAddress;
        var order_date = req.body.orderDate;
        var restaurant_id = req.body.restaurantId;
        var transaction_id = req.body.transactionId;
        var cod = req.body.cod;
        var total_price = req.body.totalPrice;
        var num_of_item = req.body.numOfItem;

        var order_fbid = req.body.orderFBID;

        if (order_fbid != null) {
            try {
                const pool = await poolPromise
                const queryResult = await pool.request()
                    .input('OrderFBID', sql.NVarChar, order_fbid)
                    .input('OrderName', sql.NVarChar, order_name)
                    .input('OrderPhone', sql.NVarChar, order_phone)
                    .input('OrderAddress', sql.NVarChar, order_address)
                    .input('OrderDate', sql.Date, order_date)
                    .input('RestaurantId', sql.Int, restaurant_id)
                    .input('TransactionId', sql.NVarChar, transaction_id)
                    .input('COD', sql.Bit, cod == true ? 1 : 0)
                    .input('TotalPrice', sql.Float, total_price)
                    .input('NumOfItem', sql.Int, num_of_item)
                    .query('INSERT INTO [Order]'
                        + '(OrderFBID, OrderPhone, OrderName, OrderAddress, OrderStatus, OrderDate, RestaurantId, TransactionId, COD, TotalPrice, NumOfItem)'
                        + ' VALUES'
                        + ' (@OrderFBID,@OrderPhone,@OrderName,@OrderAddress,0,@OrderDate,@RestaurantId,@TransactionId,@COD,@TotalPrice,@NumOfItem)'
                        + ' SELECT TOP 1 OrderId as orderNumber FROM [Order] WHERE OrderFBID=@OrderFBID ORDER BY orderNumber DESC');


                if (queryResult.recordset.length > 0) {
                    res.send(JSON.stringify({ success: true, result: queryResult.recordset }))
                }
                else
                    res.send(JSON.stringify({ success: false, message: "Empty" }));

            }
            catch (err) {
                res.status(500)
                res.send(JSON.stringify({ success: false, message: err.message }));
            }
        } else {
            res.send(JSON.stringify({ success: false, message: "Missing orderFBID in body" }));
        }
    }
})

router.post('/updateOrder', async (req, res, next) => {
    console.log(req.body)
    if (req.body.key != API_KEY) {
        res.send(JSON.stringify({ success: false, message: "Wrong API Key" }));
    } else {
        var order_id = req.body.orderId;
        var order_detail;
        try {
            order_detail = JSON.parse(req.body.orderDetail);
        } catch (err) {
            console.log(err);
            res.status(500)
            res.send(JSON.stringify({ success: false, message: err.message }));
        }

        if (order_id != null && order_detail != null) {
            try {
                const pool = await poolPromise
                const table = new sql.Table('OrderDetail')
                table.create = true

                table.columns.add('OrderId', sql.Int, { nullable: false, primary: true })
                table.columns.add('ItemId', sql.Int, { nullable: false, primary: true })
                table.columns.add('Quantity', sql.Int, { nullable: true })
                table.columns.add('Price', sql.Float, { nullable: true })
                table.columns.add('Discount', sql.Int, { nullable: true })
                table.columns.add('Size', sql.NVarChar(50), { nullable: true })
                table.columns.add('Addon', sql.NVarChar(4000), { nullable: true })
                table.columns.add('ExtraPrice', sql.Float, { nullable: true })

                for (i = 0; i < order_detail.length; i++) {
                    table.rows.add(order_id,
                        order_detail[i]["foodId"],
                        order_detail[i]["foodQuantity"],
                        order_detail[i]["foodPrice"],
                        order_detail[i]["foodDiscount"],
                        order_detail[i]["foodSize"],
                        order_detail[i]["foodAddon"],
                        parseFloat(order_detail[i]["foodExtraPrice"])
                    )
                }
                const request = pool.request()
                request.bulk(table, (err, resultBulk) => {
                    if (err) {
                        console.log(err)
                        res.send(JSON.stringify({ success: false, message: err }));
                    } else {
                        res.send(JSON.stringify({ success: true, message: "update success" }));

                    }
                })
            }
            catch (err) {
                res.status(500)
                res.send(JSON.stringify({ success: false, message: err.message }));
            }
        } else {
            res.send(JSON.stringify({ success: false, message: "Missing orderId or orderDetail in body" }));
        }
    }
})

/*
 * FAVORITE table
 * GET - POST - DELETE
 */
router.get('/favorite', async (req, res, next) => {

    console.log(req.query);
    if (req.query.key != API_KEY) {
        res.send(JSON.stringify({ success: false, message: "Wrong API KEY" }));

    } else {
        var fbid = req.query.fbid;
        if (fbid != null) {

            try {
                const pool = await poolPromise
                const queryResult = await pool.request()
                    .input('FBID', sql.NVarChar, fbid)
                    .query('SELECT fbid,foodId,restaurantId,restaurantName,foodName,foodImage,price'
                    +' FROM [Favorite] WHERE fbid=@fbid')

                if (queryResult.recordset.length > 0) {
                    res.send(JSON.stringify({ success: true, result: queryResult.recordset }));

                } else
                    res.send(JSON.stringify({ success: false, message: "Empty" }));
            }
            catch (err) {
                res.status(500)
                res.send(JSON.stringify({ success: false, message: err.message }));
            }

        } else {
            res.send(JSON.stringify({ success: false, message: "Missing fbid in query" }));
        }
    }
})

router.get('/favoriteByRestaurant', async (req, res, next) => {

    console.log(req.query);
    if (req.query.key != API_KEY) {
        res.send(JSON.stringify({ success: false, message: "Wrong API KEY" }));

    } else {
        var fbid = req.query.fbid;
        var restaurant_id = req.query.restaurantId;
        if (fbid != null) {

            try {
                const pool = await poolPromise
                const queryResult = await pool.request()
                    .input('FBID', sql.NVarChar, fbid)
                    .input('RestaurantId', sql.Int, restaurant_id)
                    .query('SELECT fbid,foodId,restaurantId,restaurantName,foodName,foodImage,price'
                        + ' FROM [Favorite] WHERE fbid=@fbid AND restaurantId=@RestaurantId')

                if (queryResult.recordset.length > 0) {
                    res.send(JSON.stringify({ success: true, result: queryResult.recordset }));

                } else
                    res.send(JSON.stringify({ success: false, message: "Empty" }));
            }
            catch (err) {
                res.status(500)
                res.send(JSON.stringify({ success: false, message: err.message }));
            }

        } else {
            res.send(JSON.stringify({ success: false, message: "Missing fbid in query" }));
        }
    }
})

router.post('/favorite', async (req, res, next) => {
    console.log(req.body)
    if (req.body.key != API_KEY) {
        res.send(JSON.stringify({ success: false, message: "Wrong API Key" }));
    } else {

        var fbid = req.body.fbid;
        var food_id = req.body.foodId;
        var restaurant_id = req.body.restaurantId;
        var restaurant_name = req.body.restaurantName;
        var food_name = req.body.foodName;
        var food_image = req.body.foodImage;
        var food_price = req.body.foodPrice;
        
        
        if (fbid != null) {
            try {
                const pool = await poolPromise
                const queryResult = await pool.request()
                    .input('FBID', sql.NVarChar, fbid)
                    .input('FoodId', sql.Int, food_id)
                    .input('RestaurantId', sql.Int, restaurant_id)
                    .input('RestaurantName', sql.NVarChar, restaurant_name)
                    .input('FoodName', sql.NVarChar, food_name)
                    .input('FoodImage', sql.NVarChar, food_image)
                    .input('FoodPrice', sql.Float, food_price)
                    .query('INSERT INTO [Favorite]'
                        + '(FBID,FoodId,RestaurantId,RestaurantName,FoodName,FoodImage,Price)'
                        + 'VALUES'
                    +'(@FBID,@FoodId,@RestaurantId,@RestaurantName,@FoodName,@FoodImage,@FoodPrice)')

                res.send(JSON.stringify({ success: true, message: "Success" }));

            }
            catch (err) {
                res.status(500)
                res.send(JSON.stringify({ success: false, message: err.message }));
            }
        } else {
            res.send(JSON.stringify({ success: false, message: "Missing fbid in body" }));
        }
    }
})

router.delete('/favorite', async (req, res, next) => {
    console.log(req.query)
    if (req.query.key != API_KEY) {
        res.send(JSON.stringify({ success: false, message: "Wrong API Key" }));
    } else {

        var fbid = req.query.fbid;
        var food_id = req.query.foodId;
        var restaurant_id = req.query.restaurantId;



        if (fbid != null) {
            try {
                const pool = await poolPromise
                const queryResult = await pool.request()
                    .input('FBID', sql.NVarChar, fbid)
                    .input('FoodId', sql.Int, food_id)
                    .input('RestaurantId', sql.Int, restaurant_id)
                    .query('DELETE FROM [Favorite] WHERE FBID=@FBID AND FoodId=@FoodId AND RestaurantId=@RestaurantId')

                res.send(JSON.stringify({ success: true, message: "Success" }));

            }
            catch (err) {
                res.status(500)
                res.send(JSON.stringify({ success: false, message: err.message }));
            }
        } else {
            res.send(JSON.stringify({ success: false, message: "Missing fbid in query" }));
        }
    }
})


module.exports = router;
