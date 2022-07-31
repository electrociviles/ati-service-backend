const emailSender = "informes@atiservicios.com";

exports.emailMaintenance = (maintenance, link) => {
    var nodemailer = require("nodemailer");
    nodemailer.createTestAccount((err, account) => {

        let transporter = nodemailer.createTransport({
            host: 'mail.privateemail.com',
            port: 465,
            secureConnection: true,
            auth: {
                user: "informes@atiservicios.com",
                pass: "Ati2022#*"
            }
        });

        let html = `
        <h2>Hola ${maintenance.customer.name}</h2>
        <p>El proyecto <b>${maintenance.name}</b> fue cerrado exitosamente para mas información</p>
        <p>
            Para ver el resumen de los tableros por favor visite el siguiente enlace: <br /><br />
            ${link}
        </p>
        </div>`
        let mailOptions = {
            from: `"Cierre de tablero" <${maintenance.customer.email}>`,
            to: maintenance.customer.email,
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

        // let transporter = nodemailer.createTransport({
        //     // service: 'Godaddy',
        //     host: "mail.privateemail.com",
        //     secureConnection: true,
        //     port: 465,
        //     auth:
        //     {
        //         user: "info@ebanoextensiones.com",
        //         pass: "nTorres.12"
        //     }
        // });

        // let transporter = nodemailer.createTransport({
        //     // service: 'Godaddy',
        //     host: "smtp.hostinger.com",
        //     secureConnection: false,
        //     port: 465,
        //     auth: {
        //         user: "informes@123-tecnicos.com",
        //         pass: "Empresa2021*"
        //     }
        // });

        let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: "informeselectrociviles@gmail.com",
                pass: "Electrociviles2022"
            }
        });

        let html = `<h1>Atención finalizada</h1>
        <h2>Hola ${attention.customer.name}</h2>
        <p>La atención fue cerrada exitosamente para mas información ver el archivo adjunto</p>
        </div>`
        let mailOptions = {
            from: 'informeselectrociviles@gmail.com',
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
exports.emailSemiAnnual = (maintenance, emails) => {
    var nodemailer = require("nodemailer");
    nodemailer.createTestAccount((err, account) => {

        let transporter = nodemailer.createTransport({
            host: 'mail.privateemail.com',
            port: 465,
            secureConnection: true,
            auth: {
                user: "informes@atiservicios.com",
                pass: "Ati2022#*"
            }
        });

        let html = `
        <h2>Hola ${maintenance.customer.name}</h2>
        <p>El mantenimiento ${maintenance.name} semestral ha finalizado</p>
         
        </div>`
        let mailOptions = {
            from: `"Finalizacion de mantenimiento" <${emailSender}>`,
            to: emails,
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
exports.emailProvisioning = (maintenance, emails) => {
    var nodemailer = require("nodemailer");
    nodemailer.createTestAccount((err, account) => {

        let transporter = nodemailer.createTransport({
            host: 'mail.privateemail.com',
            port: 465,
            secureConnection: true,
            auth: {
                user: emailSender,
                pass: "Ati2022#*"
            }
        });

        let html = `
        <h2>Hola ${maintenance.customer.name}</h2>
        <p>No te olvides de hacer el aprovisionamiento del mantenimiento ${maintenance.name} </p> 
        </div>`
        let mailOptions = {
            from: `"Alerta de aprovisionamiento" <${emailSender}>`,
            to: emails,
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