const sql = require('mssql')

var config = {
    user: 'sa',
    password: 'Tomas1234',
    server: 'DESKTOP-SN7N88F',
    database: 'MyRestaurant',
    "options": {
        "encrypt": true,
        "enableArithAbort": true
    },

};
const poolPromise = new sql.ConnectionPool(config)
    .connect()
    .then(pool => {
        console.log('connected to MSSQL')
        return pool
    }).catch(err => console.log('database connection failed', err))


module.exports = { sql, poolPromise }