const sql = require('mssql');

const config = {
    user: 'usuario',
    password: 'senha',
    server: 'seu host', // Pode ser localhost ou um endereço IP
    database: 'seu db',
    options: {
        encrypt: true, // Use SSL
        enableArithAbort: true,
        trustServerCertificate: true
    }
};

const poolPromise = new sql.ConnectionPool(config)
    .connect()
    .then(pool => {
        console.log('Conectado ao SQL Server');
        return pool;
    })
    .catch(err => {
        console.log('Falha ao conectar ao SQL Server', err);
    });

module.exports = {
    sql, poolPromise
};