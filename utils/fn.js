
const jwt = require("jsonwebtoken");
const mongoose = require('mongoose');
const mailer = require('../utils/mailer');
const schemas = require('./../db/schemas');
var fs = require('fs');
var config = require('./../config')
var qpdf = require('node-qpdf');

const createToken = (user, secret, expiresIn) => {
    const { id, role, name, document_number, photo, username } = user

    return jwt.sign({
        id,
        name,
        document_number,
        photo,
        username,
        role,
    }, secret, { expiresIn })
}

const asyncForEach = async (array, callback) => {
    for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array)
    }
}

const verifyItemBoard = async (boardId) => {
    let itemsBoards = await schemas.ItemBoard.find({ board: mongoose.Types.ObjectId(boardId) }).populate({ path: "item" }).exec();

    let completed = false;
    let remaining = 0;
    itemsBoards.forEach(itemBoard => {
        if (itemBoard.item.hasValue && itemBoard.value < 0) {
            remaining++;
        }
        if (itemBoard.photos.length == 0) {
            remaining++;
        }

    });
    if (remaining == 0) {
        completed = true;
    }

    return completed;

}

const makedId = (length) => {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() *
            charactersLength));
    }
    return result;
}

const fileExtension = fileName => {
    return fileName.slice((fileName.lastIndexOf(".") - 1 >>> 0) + 2);
}

const sendEmailProject = id => {


    return new Promise(async (resolve, reject) => {
        try {


            let project = await schemas.Project.findById(mongoose.Types.ObjectId(id));
            let customer = await schemas.Customer.findById(mongoose.Types.ObjectId(project.customer));

            const HummusRecipe = require('hummus-recipe');
            const pdfDoc = new HummusRecipe(`./pdf/${id}.pdf`, `./pdf/${id}.pdf`);

            pdfDoc.encrypt({
                userPassword: customer.nit,
                ownerPassword: customer.nit,
                userProtectionFlag: 4
            }).endPDF();

            let link = `${config.urlPdf}${id}.pdf`;
            mailer.emailProject(customer, project, link);

            resolve(true);

        } catch (error) {
            console.log(error);
            reject({
                status: 'error',
                message: 'Ocurrió un error al abrir la marcación'
            });
        }
    });
}

const sendEmailAttention = (id, action) => {

    return new Promise(async (resolve, reject) => {
        try {

            let attention = await schemas.Attention.findById(mongoose.Types.ObjectId(id),).populate({
                path: 'customer'
            }).exec();

            console.log('xxxx => ', attention);

            let path = `${config.pathSavePdf}${id}.pdf`;
            const pdfBase64 = fs.readFileSync(path, { encoding: 'base64' });

            let attachments = [{
                filename: 'Cierre atención ' + attention._id + '.pdf',
                content: pdfBase64,
                encoding: 'base64'
            }];
            if (action == "email")
                mailer.emailAttention(attention, attachments);

            resolve(true);

        } catch (error) {
            console.log(error);
            reject({
                status: 'error',
                message: 'Ocurrió un error al enviar el correo'
            });
        }
    });
}

const validateAttention = attention => {
    let errors = 0;
    if (attention.signature.length == 0) {
        errors++;
        console.log("Falta Signature");
    }
    if (attention.attentionItems.length != 2) {
        errors++;
        console.log("Faltan Items");

    }

    return errors > 0;
}

const validateBoard = board => {
    let errors = 0;
    board.itemsBoards.forEach(itemBoard => {
        if (itemBoard.photos.length == 0) {
            errors++;
        }
        if (itemBoard.item.hasValue && itemBoard.value <= 0) {
            errors++;
        }
    });
    return errors > 0;
}

const validateProject = project => {
    let errors = 0;
    project.boards.forEach(board => {
        board.itemsBoards.forEach(itemBoard => {
            if (itemBoard.photos.length == 0) {
                errors++;
            }
            if (itemBoard.item.hasValue && itemBoard.value <= 0) {
                errors++;
            }
        });
    });
    return errors > 0;
}

const getDateReport = () => {
    var date = new Date();
    var dateStr =
        ("00" + (date.getMonth() + 1)).slice(-2) + "/" +
        ("00" + date.getDate()).slice(-2) + "/" +
        date.getFullYear() + " " +
        ("00" + date.getHours()).slice(-2) + ":" +
        ("00" + date.getMinutes()).slice(-2) + ":" +
        ("00" + date.getSeconds()).slice(-2);
    return dateStr
}

const getChildrens = (role, page) => {
    let children = []
    if (page.children.length > 0) {
        for (let i = 0; i < page.children.length; i++) {
            if (page.children[i].roles.includes(role)) {
                let childrenLevelOne =
                {
                    title: page.children[i].title,
                    href: page.children[i].href,
                    icon: page.children[i].icon,
                    children: []
                }
                if (page.children[i].children.length > 0) {
                    for (let j = 0; j < page.children[i].children.length; j++) {
                        if (page.children[i].children[j].roles.includes(role)) {
                            let childrenLevelTwo =
                            {
                                title: page.children[i].children[j].title,
                                href: page.children[i].children[j].href,
                                icon: page.children[i].children[j].icon
                            }
                            childrenLevelOne.children.push(childrenLevelTwo)
                        }
                    }
                }
                children.push(childrenLevelOne)
            }
        }
    }
    return children
}

const semiAnnualMaintenance = () => {

    return new Promise(async (resolve, reject) => {
        try {
            let configurations = await schemas.Configuration.find();
            let result = await schemas.CenterOfAttention.aggregate([{
                $project: {
                    statusProvisioningAlertDate: 1,
                    provisioningAlertDate: 1,
                    expirationDateMaintenance: 1,
                    statusExpirationDateMaintenance: 1,
                    statusExpirationDateMaintenance: 1,
                    remainingExpirationDateMaintenanceDays: {
                        $trunc: {
                            $divide: [{ $subtract: ['$expirationDateMaintenance', new Date()] }, 1000 * 60 * 60 * 24]
                        }
                    },
                    remainingProvisioningAlertDays: {
                        $trunc: {
                            $divide: [{ $subtract: ['$provisioningAlertDate', new Date()] }, 1000 * 60 * 60 * 24]
                        }
                    }
                }
            },
            ]).exec();

            console.log('result', result);
            console.log('\n\n\n\n\n\n');

            let status = true
            if (result.length > 0 && status) {
                // let remainingDays = result[0].remainingDays;
                // let provisioningAlertDate = result[0].provisioningAlertDate;
                // let statusProvisioningAlertDate = result[0].statusProvisioningAlertDate;

                let {
                    provisioningAlertDate,
                    expirationDateMaintenance,
                    statusProvisioningAlertDate,
                    statusExpirationDateMaintenance,
                    remainingExpirationDateMaintenanceDays,
                    remainingProvisioningAlertDays
                } = result[0]
                // provisioningAlertDate: 2023-01-30T05:00:00.000Z,
                // statusProvisioningAlertDate: 'pending',
                // statusExpirationDateMaintenance: 'pending',
                // remainingExpirationDateMaintenanceDays: 40,
                // remainingprovisioningAlertDays: 254

                // Contabilidad usuario de toda tienda
                // 1 un mes antes de vencer el mantenimiento se le envia un correo al oset de cadata tienda 
                // informandole que debe aprovisonar 6.000.000 de pesos
                asyncForEach(configurations, async (configuration) => {

                    console.log('__________________________________________________');
                    console.log('configuration.value ', configuration.value);
                    console.log('configuration.key ', configuration.key);
                    console.log('__________________________________________________');

                    switch (configuration.key) {
                        case 'provisioningAlert':
                            if (configuration.value == remainingProvisioningAlertDays) {
                                if (statusProvisioningAlertDate === 'pending') {
                                    sendMailProvisioningAlert(provisioningAlertDate, result[0]._id);
                                }
                            }
                            break;

                        case 'expirationDateMaintenance':
                            if (configuration.value == remainingExpirationDateMaintenanceDays) {
                                if (statusExpirationDateMaintenance === 'pending') {
                                    sendMailExpirationDateMaintenance(expirationDateMaintenance, result[0]._id);
                                }
                            }
                            break;
                    }
                    console.log('\n');
                    // Enviar email al oset y jefe de mantenimiento 
                    // avisandole que el mantenimiento se va a vencer

                });

                // Mantenimientos correctivos


                // mailer.emailProject(customer, project, link);
            }

            resolve(true);

        } catch (error) {
            console.log(error);
            reject({
                status: 'error',
                message: 'Ocurrió un error al abrir la marcación'
            });
        }
    });
}

const changeStatusProvisioningAlert = (id) => {
    schemas.CenterOfAttention.updateOne({ "_id": mongoose.Types.ObjectId(id) }, {
        $set: {
            statusProvisioningAlertDate: 'send',
        }
    }, {
        multi: true
    }).exec();
}

const changeStatusExpirationMaintenance = (id) => {
    schemas.CenterOfAttention.updateOne({ "_id": mongoose.Types.ObjectId(id) }, {
        $set: {
            statusExpirationDateMaintenance: 'send',
        }
    }, {
        multi: true
    }).exec();
}

const sendMailProvisioningAlert = (provisioningAlertDate, id) => {
    console.log('Enviar correo de aprovisionamiento... ');
    schemas.CenterOfAttention.updateOne({ "_id": mongoose.Types.ObjectId(id) }, {
        $set: {
            statusProvisioningAlertDate: 'send',
        }
    }, {
        multi: true
    }).exec();

    addDateToProvisioningAlert(provisioningAlertDate, id);
}
const sendMailExpirationDateMaintenance = (expirationDateMaintenance, id) => {
    console.log('Enviar correo de mantenimiento... ');
    schemas.CenterOfAttention.updateOne({ "_id": mongoose.Types.ObjectId(id) }, {
        $set: {
            statusExpirationDateMaintenance: 'send',
        }
    }, {
        multi: true
    }).exec();


    addDateToExpirationDateMaintenance(expirationDateMaintenance, id);
}
const addDateToProvisioningAlert = (provisioningAlertDate, id) => {
    let date = new Date(provisioningAlertDate.toString());

    var month = date.getUTCMonth() + 1;
    var day = date.getUTCDate();
    var year = date.getUTCFullYear();

    console.log('day ' + day);
    console.log('month ' + month);
    console.log('year ' + year);

    var newDate = new Date(year, month, day);
    newDate.setMonth(newDate.getMonth() + 6);

    console.log('Add 6 month to provisioningAlertDate ');
    console.log('newDate ', newDate);
    schemas.CenterOfAttention.updateOne({ "_id": mongoose.Types.ObjectId(id) }, {
        $set: {
            statusProvisioningAlertDate: 'pending',
            provisioningAlertDate: newDate,
        }
    }, {
        multi: true
    }).exec();
}
const addDateToExpirationDateMaintenance = (expirationDateMaintenance, id) => {
    let date = new Date(expirationDateMaintenance.toString());

    var month = date.getUTCMonth() + 1;
    var day = date.getUTCDate();
    var year = date.getUTCFullYear();

    console.log('day ' + day);
    console.log('month ' + month);
    console.log('year ' + year);

    var newDate = new Date(year, month, day);
    newDate.setMonth(newDate.getMonth() + 6);

    console.log('Add 6 month to expirationDateMaintenance ');
    console.log('newDate ', newDate);
    schemas.CenterOfAttention.updateOne({ "_id": mongoose.Types.ObjectId(id) }, {
        $set: {
            statusExpirationDateMaintenance: 'pending',
            expirationDateMaintenance: newDate,
        }
    }, {
        multi: true
    }).exec();
}
module.exports = {
    createToken,
    asyncForEach,
    verifyItemBoard,
    makedId,
    fileExtension,
    sendEmailProject,
    sendEmailAttention,
    validateAttention,
    validateBoard,
    getDateReport,
    validateProject,
    getChildrens,
    semiAnnualMaintenance
};