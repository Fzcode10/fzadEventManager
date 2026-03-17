const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./databaseConnection');
const VisitorRoute = require('./routes/visitorRoute');
const HostRoute = require('./routes/hostRoute');
const Security = require('./routes/securityRoute');
const Admin = require('./routes/adminRoute');

dotenv.config();

connectDB();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.status(200).json({
        msg: "Default page of the project for Event manager"
    })
});

app.use("/uploads", express.static("uploads"));
app.use('/api/security', Security);
app.use('/api/visitor', VisitorRoute);
app.use('/api/host', HostRoute);
app.use('/api/admin', Admin);



const PORT = process.env.PORT;
app.listen( PORT, () => {
    console.log(`App listing on http://localhost:${PORT}`)
;})