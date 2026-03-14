const app = require('./app');
const sequelize = require('./config/connection');

const PORT = process.env.PORT || 3000;

// Test DB Connection before starting server
sequelize.authenticate()
    .then(() => {
        console.log('Connected to MySQL database');
        return sequelize.sync({ alter: true });
    })
    .then(() => {
        console.log('Database synced');
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch(err => {
        console.error('Unable to connect to the database:', err);
        process.exit(1);
    });

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception thrown:', err);
    process.exit(1);
});
