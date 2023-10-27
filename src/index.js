import express from 'express';
import helmet from 'helmet';
import dotenv from 'dotenv';
import cors from 'cors';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import corsOptions from './config/corsOptions.js';
import credentials from './config/credentials.js';
import compression from 'compression';
import db from './config/database.js';

import { requestLogger, errorLogger } from './utils/eventLogger.js';

//Import Routes
import userRoute from './routes/user.route.js';
import visitorRoute from './routes/visitor.route.js';
import employeeRoute from './routes/employee.route.js';
import optionRoute from './routes/option.route.js';
import authRoute from './routes/auth.route.js';
import recognizeRoute from './routes/recognize.route.js';

// Get ENV data from .env
dotenv.config();

// Define app Express and module usage
const app = express();
app.use(credentials);
app.use(cors(corsOptions));
app.use(helmet());
app.use(compression());
app.use(requestLogger);
app.use(express.json());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser());

// Sync database and check connection
(async () => {
    // await db.sync({ alter: true });
    try {
        await db.authenticate();
        console.log('Database connection has been established successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
})();

// Using route from file routes
app.use('/user', userRoute);
app.use('/visitor', visitorRoute);
app.use('/employee', employeeRoute);
app.use('/option', optionRoute);
app.use('/auth', authRoute);
app.use('/recognize', recognizeRoute);

// Default get endpoint route
app.get('/', async (req, res) => {
    res.json({
        status: 'Server ASA is running!'
    });
});

// Get data APP_PORT from .env
const PORT = process.env.APP_PORT || 8080;

//Log internal error
app.use(errorLogger);

// Listening to PORT
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
