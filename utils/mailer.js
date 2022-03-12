exports.emailCloseBoard = (customer, attachments) => {
    var nodemailer = require("nodemailer");
    nodemailer.createTestAccount((err, account) => {

        let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: "nelsonperlaza@gmail.com",
                pass: "NelsonPerlaza.12"
            }
        });

        let html = `<h1>Correo de cierre tablero</h1>
        <h2>Hola ${customer.name}</h2>
        <p>El tablero fue cerrado exitosamente para mas información ver el archivo adjunto</p>
        </div>`
        let mailOptions = {
            from: `"Cierre de tablero" <${customer.email}>`,
            to: customer.email,
            subject: '📎',
            attachments,
            html,
        }

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return console.log(error);
            }
            console.log('Message sent: %s', info.messageId);
            console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
        })

    })
}
exports.emailCloseAttention = (attention, attachments) => {
    var nodemailer = require("nodemailer");
    nodemailer.createTestAccount((err, account) => {

        let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: "nelsonperlaza@gmail.com",
                pass: "NelsonPerlaza.12"
            }
        });


        let html = `<h1>Correo de cierre tablero</h1>
        <h2>Hola ${attention.customer.name}</h2>
        <p>La atención fue cerrada exitosamente para mas información ver el archivo adjunto</p>
        </div>`
        let mailOptions = {
            from: `"Cierre de atención" <${attention.customer.email}>`,
            to: attention.customer.email,
            subject: '📎',
            attachments,
            html,
        }

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return console.log(error);
            }
            console.log('Message sent: %s', info.messageId);
            console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
        })

    })
}