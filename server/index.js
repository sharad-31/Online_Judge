require('dotenv').config();
const express= require('express');
const connectDB= require('./config/db');
const cors= require('cors');
const authRoutes = require('./routes/authRoutes');
connectDB();

const app=express();
app.use(cors());
app.use(express.json());

app.use('/api/v1/auth', authRoutes);





const PORT= process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});