exports.emailProject = (customer, project, link) => {
    var nodemailer = require("nodemailer");
    nodemailer.createTestAccount((err, account) => {

        let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: "informeselectrociviles@gmail.com",
                pass: "Electrociviles2022"
            }
        });

        let html = `
        <h2>Hola ${customer.name}</h2>
        <p>El proyecto <b>${project.name}</b> fue cerrado exitosamente para mas información</p>
        <p>
            Para ver el resumen de los tableros por favor visite el siguiente enlace: <br /><br />
            ${link}
        </p>
        </div>`
        let mailOptions = {
            from: `"Cierre de tablero" <${customer.email}>`,
            to: customer.email,
            subject: '📎',
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
exports.emailAttention = (attention, attachments) => {
    var nodemailer = require("nodemailer");
    nodemailer.createTestAccount((err, account) => {

        let transporter = nodemailer.createTransport({
            // service: 'Godaddy',
            host: "mail.privateemail.com",
            secureConnection: true,
            port: 465,
            auth:
            {
                user: "info@ebanoextensiones.com",
                pass: "nTorres.12"
            }
        });

        // let transporter = nodemailer.createTransport({
        //     host: "smtpout.secureserver.net",
        //     secure: true,
        //     secureConnection: false, // TLS requires secureConnection to be false
        //     tls: {
        //         ciphers: "SSLv3",
        //     },
        //     requireTLS: true,
        //     port: 465,
        //     debug: true,
        //     auth: {
        //         user: "ati@123-tecnicos.com",
        //         pass: "Tecnico2021*"
        //     },
        // });


        let html = `<h1>Atención finalizada</h1>
        <h2>Hola ${attention.customer.name}</h2>
        <p>La atención fue cerrada exitosamente para mas información ver el archivo adjunto</p>
        </div>`
        let mailOptions = {
            from: `info@ebanoextensiones.com`,
            to: attention.customer.email,
            subject: '📎',
            attachments,
            html,
        }
        console.log(attention.customer.email);

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return console.log(error);
            }
            console.log('Message sent: %s', info.messageId);
            console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
        })

    })
}