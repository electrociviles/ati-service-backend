
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
const createRefreshToken = (user, secret, expiresIn) => {
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

const sendEmailMaintenance = id => {


    return new Promise(async (resolve, reject) => {
        try {


            let maintenance = await schemas.Maintenance.findById(mongoose.Types.ObjectId(id));
            let customer = await schemas.Customer.findById(mongoose.Types.ObjectId(maintenance.customer));

            const HummusRecipe = require('hummus-recipe');
            const pdfDoc = new HummusRecipe(`./pdf/${id}.pdf`, `./pdf/${id}.pdf`);

            pdfDoc.encrypt({
                userPassword: customer.nit,
                ownerPassword: customer.nit,
                userProtectionFlag: 4
            }).endPDF();

            let link = `${config.urlPdf}${id}.pdf`;
            mailer.emailMaintenance(customer, maintenance, link);

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

const validateMaintenance = maintenance => {
    let errors = 0;
    maintenance.boards.forEach(board => {
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
            let result = await schemas.CenterOfAttention.aggregate([{
                $project: {
                    valueSemiAnnual: 1,
                    valueProvisioning: 1,
                    provisioningAlertDate: 1,
                    expirationDateMaintenance: 1,
                    statusExpirationDateMaintenance: 1,
                    statusProvisioningAlertDate: 1,
                    timeSemiAnnual: 1,
                    timeProvisioning: 1,
                    remainingExpiratioDateMaintenanceDays: {
                        $dateDiff: {
                            startDate: "$$NOW",
                            endDate: "$expirationDateMaintenance",
                            unit: "$timeSemiAnnual"
                        }
                    },
                    remainingProvisioningAlertDays: {
                        $dateDiff: {
                            startDate: "$$NOW",
                            endDate: "$provisioningAlertDate",
                            unit: "$timeProvisioning"
                        }
                    }
                }
            },
            ]).exec();


            let status = true
            if (result.length > 0 && status) {

                // valueSemiAnnual: 5,
                // valueProvisioning: 2,
                // timeSemiAnnual: 'minute',
                // timeProvisioning: 'hour',
                // expirationDateMaintenance: 2022-07-29 23:37:19,
                // provisioningAlertDate:     2022-07-29 23:37:19,
                // statusProvisioningAlertDate: 'pending',
                // statusExpirationDateMaintenance: 'pending',
                // remainingExpiratioDateMaintenanceDays: 129,
                // remainingProvisioningAlertDays: 2

                let {
                    _id,
                    valueSemiAnnual,
                    valueProvisioning,
                    statusProvisioningAlertDate,
                    statusExpirationDateMaintenance,
                    remainingExpiratioDateMaintenanceDays,
                    remainingProvisioningAlertDays,
                } = result[0]

                let maintenance = {}
                if (statusProvisioningAlertDate == 'pending' && remainingProvisioningAlertDays < valueProvisioning) {
                    console.log("*************** Uno *************************")
                    maintenance = await
                        schemas.Maintenance
                            .findOne({ centerOfAttention: mongoose.Types.ObjectId(_id) })
                            .populate("customer")
                    console.log(maintenance)

                    let emails = await getEmailNotification(maintenance.customer._id)
                    emails = emails.map(email => email.email)
                    console.log(emails.join(","))
                    console.log(emails)

                    mailer.emailProvisioning(maintenance, emails)
                    changeStatusProvisioning(maintenance, _id,)

                }
                if (statusExpirationDateMaintenance == 'pending' && remainingExpiratioDateMaintenanceDays < valueSemiAnnual) {
                    console.log("*************** Dos *************************")
                    maintenance =
                        await schemas.Maintenance
                            .findOne({ centerOfAttention: mongoose.Types.ObjectId(_id) })
                            .populate("customer")

                    let emails = await getEmailNotification(maintenance.customer._id)
                    emails = emails.map(email => email.email)
                    console.log(emails.join(","))
                    console.log(emails)
                    mailer.emailSemiAnnual(maintenance, emails)
                    // changeStatusExpirationMaintenance(maintenance, _id)

                }
                // Contabilidad usuario de toda tienda
                // 1 un mes antes de vencer el mantenimiento se le envia un correo al oset de cadata tienda 
                // informandole que debe aprovisonar 6.000.000 de pesos
                // Enviar email al oset y jefe de mantenimiento 
                // avisandole que el mantenimiento se va a vencer
                // Mantenimientos correctivos
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

const getEmailNotification = customer => {

    return new Promise(async (resolve, _) => {
        let emails = await schemas.User.aggregate([{
            $match: {
                'customer': mongoose.Types.ObjectId(customer)
            }
        }, {
            $project: {
                name: 1,
                email: 1,
                role: 1,
            }
        }, {
            $lookup: {
                from: "roles",
                localField: "role",
                foreignField: "_id",
                as: "role"
            }
        }, {
            $unwind: { path: "$role" }
        },
        {
            $match:
            {
                "role.tag": {
                    $in: ["construction_manager", "maintenance_manager", "oset"]
                }
            }
        },
        {
            $project: {
                _id: 0,
                email: 1
            }
        }])

        resolve(emails);
    })


}

const changeStatusProvisioning = (maintenance, id) => {
    schemas.CenterOfAttention.updateOne({ "_id": mongoose.Types.ObjectId(id) }, {
        $set: {
            statusProvisioningAlertDate: 'send',
        }
    }, {
        multi: true
    }).exec();
}

const changeStatusExpirationMaintenance = (maintenance, id) => {
    if (maintenance.statusPayment == 'paid') {
        schemas.CenterOfAttention.updateOne({ "_id": mongoose.Types.ObjectId(id) }, {
            $set: {
                statusExpirationDateMaintenance: 'send',
            }
        }, {
            multi: true
        }).exec();

        schemas.Maintenance.updateOne({ "_id": mongoose.Types.ObjectId(id) }, {
            $set: {
                status: 'finished',
            }
        }, {
            multi: true
        }).exec();
    }
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
const getDates = (start, end, split) => {

    let newStart = ''
    let newEnd = ''
    if (start && end) {
        let parts = start.toString().split(split)
        console.log('parts ', parts)
        newStart = `${parts[0]} 00:00:00`
        parts = end.toString().split(split)
        newEnd = `${parts[0]} 23:59:59`
    }
    else if (start) {
        let parts = start.toString().split(split)
        newStart = `${parts[0]} 00:00:00`
        newEnd = `${parts[0]} 23:59:59`
    }
    return {
        start: newStart,
        end: newEnd
    }
}
const formatDate = (date) => {
    let current_datetime = new Date(date)

    let day = current_datetime.getDay() <= 10 ? '0' + current_datetime.getDay() : current_datetime.getDay()
    let formatted_date = current_datetime.getFullYear() + "/" + current_datetime.getMonth() + "/" + day
    return formatted_date
}
module.exports = {
    formatDate,
    getDates,
    createToken,
    createRefreshToken,
    asyncForEach,
    verifyItemBoard,
    makedId,
    fileExtension,
    sendEmailMaintenance,
    sendEmailAttention,
    validateAttention,
    validateBoard,
    getDateReport,
    validateMaintenance,
    getChildrens,
    semiAnnualMaintenance,
    getEmailNotification,
};