const nodemailer = require('nodemailer');
module.exports = {
    create_transporter: function () {
        return nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            auth: {
                user: 'llp.newspapers@gmail.com',
                pass: 'LinhLocPhuc123'
            }
        });
    },
    create_auth_email:function(user_email,token){
        return {
            from: 'llp.newspapers@gmail.com',
            to: user_email,
            subject: '[LLP Newspaper] - [Xác Thực Tài Khoản]',
            html: this.authentication_email_creator(token)
        };
    },
    create_reset_password_email:function(user_email,token)
    {
        return {
            from: 'llp.newspapers@gmail.com',
            to: user_email,
            subject: '[LLP Newspaper] - [Đặt lại mật khẩu]',
            html: this.reset_password_email_creator(token)
        };
    },
    reset_password_email_creator: function (otp) {
        return `<div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
    <div style="margin:50px auto;width:70%;padding:20px 0">
      <div style="border-bottom:1px solid #eee">
        <a href="" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600">LLP News</a>
      </div>
      <p style="font-size:1.1em">Kính chào quý khách,</p>
      <p>Cảm ơn quý khách đã sử dụng dịch vụ của LLP News. Quý khách vui lòng sử dụng mã OTP bên dưới để hoàn tất quá trình đặt lại mật khẩu. Quý khách lưu ý : mã OTP chỉ có giá trị sử dụng trong vòng <b>5 phút</b>.</p>
      <h2 style="background: #00466a;margin: 0 auto;width: max-content;padding: 0 10px;color: #fff;border-radius: 4px;">`
            + otp + `</h2>
      <p style="font-size:0.9em;">Trân trọng cảm ơn,<br />LLP News</p>
      <hr style="border:none;border-top:1px solid #eee" />
      <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
        <p>LLP News</p>
        <p>18CNTN - Khoa Công Nghệ Thông Tin</p>
        <p>Đại học Khoa học Tự nhiên - ĐHQG TPHCM</p>
      </div>
    </div>
  </div>`
    }
    ,
    // utilities
    authentication_email_creator: function (otp) {
        return `<div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
    <div style="margin:50px auto;width:70%;padding:20px 0">
      <div style="border-bottom:1px solid #eee">
        <a href="" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600">LLP News</a>
      </div>
      <p style="font-size:1.1em">Kính chào quý khách,</p>
      <p>Cảm ơn quý khách đã sử dụng dịch vụ của LLP News. Quý khách vui lòng sử dụng mã OTP bên dưới để hoàn tất quá trình xác thực tài khoản. Quý khách lưu ý : mã OTP chỉ có giá trị sử dụng trong vòng <b>5 phút</b>.</p>
      <h2 style="background: #00466a;margin: 0 auto;width: max-content;padding: 0 10px;color: #fff;border-radius: 4px;">`
            + otp + `</h2>
      <p style="font-size:0.9em;">Trân trọng cảm ơn,<br />LLP News</p>
      <hr style="border:none;border-top:1px solid #eee" />
      <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
        <p>LLP News</p>
        <p>18CNTN - Khoa Công Nghệ Thông Tin</p>
        <p>Đại học Khoa học Tự nhiên - ĐHQG TPHCM</p>
      </div>
    </div>
  </div>`
    }
};
