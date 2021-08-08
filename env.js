require('dotenv').config();
module.exports = {
    email_username: process.env.EMAIL_USERNAME,
    email_password: process.env.EMAIL_PASSWORD,
    DB_HOST: process.env.DB_HOST,
    DB_USER: process.env.DB_USER,
    DB_PASSWORD: process.env.DB_PASSWORD,
    DB_NAME: process.env.DB_NAME,
    WEB_URI:process.env.WEB_URI,
    DELTA_TIME_ZONE:parseInt(process.env.DELTA_TIME_ZONE)
}