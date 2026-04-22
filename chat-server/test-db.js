const mysql = require('mysql2/promise');

async function test() {
    try {
        console.log('Attempting to connect to 127.0.0.1...');
        const connection = await mysql.createConnection({
            host: '127.0.0.1',
            port: 3306,
            user: 'root',
            password: 'admin',
            database: 'mysql',
        });
        console.log('Successfully connected to 127.0.0.1!');
        await connection.end();
    } catch (err) {
        console.error('Connection to 127.0.0.1 failed:');
        console.error(err.message);
    }

    try {
        console.log('Attempting to connect to localhost...');
        const connection = await mysql.createConnection({
            host: 'localhost',
            port: 3306,
            user: 'root',
            password: 'admin',
            database: 'mysql',
        });
        console.log('Successfully connected to localhost!');
        await connection.end();
    } catch (err) {
        console.error('Connection to localhost failed:');
        console.error(err.message);
    }
}

test();
