
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
            if (action == "email") {

                let emailsCustomer = await getEmailCustomer(attention.customer._id)
                emailsCustomer = emailsCustomer.map(email => email.email)

                let emailsAdmins = await getEmailAdmins()
                emailsAdmins = emailsAdmins.map(email => email.email != email.email)


                let emails = [...emailsCustomer, ...emailsAdmins]
                mailer.emailAttention(attention, attachments, emails);
            }

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

const sendEmailBoard = board => {

    return new Promise(async (resolve, reject) => {
        try {

            let emailsCustomer = await getEmailCustomer(board.maintenance.customer._id)
            emailsCustomer = emailsCustomer.map(email => email.email)

            let emailsAdmins = await getEmailAdmins()
            emailsAdmins = emailsAdmins.map(email => email.email != email.email)

            let emails = [...emailsCustomer, ...emailsAdmins]
            console.log('................')
            console.log(emails)
            mailer.emailBoard(board, emails);

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
            let result = await schemas.Maintenance.aggregate([{
                $match: {
                    "expiration": {
                        $exists: true,
                        $ne: null
                    }
                }
            },
            {
                $project: {
                    value: 1,
                    time: 1,
                    expiration: 1,
                    statusAlertOne: 1,
                    statusAlertTwo: 1,
                    remaining: {
                        $dateDiff: {
                            startDate: "$$NOW",
                            endDate: "$expiration",
                            unit: "$time"
                        }
                    }
                }
            }]).exec();

            if (result.length > 0) {

                let { _id, value, time, expiration, statusAlertOne, statusAlertTwo, remaining } = result[0]

                console.log(result)

                let maintenance = {}
                if (statusAlertOne == 'pending' && remaining == 1) {
                    maintenance = await schemas.Maintenance.findById(_id).populate("customer")

                    let emails = await getEmailCustomer(maintenance.customer._id)
                    emails = emails.map(email => email.email)
                    console.log(emails.join(","))
                    console.log(emails)

                    mailer.emailProvisioning(maintenance, emails)
                    changeStatusAlertOne(_id)

                }
                if (statusAlertTwo == 'pending' && remaining == 0) {
                    console.log("*************** Dos *************************")
                    maintenance = await schemas.Maintenance.findById(_id).populate("customer")
                    console.log(maintenance)

                    let emails = await getEmailCustomer(maintenance.customer._id)
                    emails = emails.map(email => email.email)
                    console.log(emails)
                    mailer.emailSemiAnnual(maintenance, emails)
                    changeStatusAlertTwo(maintenance, _id)
                }
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

const getEmailCustomer = customer => {

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

const getEmailAdmins = () => {

    return new Promise(async (resolve, _) => {
        let emails = await schemas.User.aggregate([{
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
                    $in: ["administrator"]
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

const getTokenFCMAdmins = () => {

    return new Promise(async (resolve, _) => {
        let tokensFCM = await schemas.User.aggregate([{
            $match: {
                "tokenFCM": {
                    $exists: true,
                    $ne: null
                }
            }
        },
        {
            $project: {
                name: 1,
                tokenFCM: 1,
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
                    $in: ["administrator"]
                }
            }
        },
        {
            $project: {
                _id: 0,
                tokenFCM: 1
            }
        }, {
            $unwind: { path: "$tokenFCM" }
        }])
        if (tokensFCM) {
            tokensFCM = tokensFCM.map(tokenFCM => tokenFCM.tokenFCM)
        }

        resolve(tokensFCM);
    })


}

const getTokenFCMCustomer = customer => {

    return new Promise(async (resolve, _) => {

        let emails = await schemas.User.aggregate([{
            $match: {
                'customer': mongoose.Types.ObjectId(customer),
                "tokenFCM": {
                    $exists: true,
                    $ne: null
                }
            }
        }, {
            $project: {
                name: 1,
                tokenFCM: 1,
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
            $match: {
                "role.tag": {
                    $in: ["construction_manager", "maintenance_manager", "oset", "permanent"]
                }
            }
        },
        {
            $project: {
                _id: 1,
                tokenFCM: 1
            }
        }, {
            $unwind: { path: "$tokenFCM" }
        }])

        resolve(emails);
    })
}

const changeStatusAlertOne = id => {
    schemas.Maintenance.updateOne({ "_id": mongoose.Types.ObjectId(id) }, {
        $set: {
            statusAlertOne: 'send',
        }
    }, {
        multi: true
    }).exec();
}

const changeStatusAlertTwo = (maintenance, id) => {

    schemas.Maintenance.updateOne({ "_id": mongoose.Types.ObjectId(id) }, {
        $set: {
            statusAlertTwo: 'send',
            statusPayment: 'pendingPay'
        }
    }, {
        multi: true
    }).exec();

    createMaintenance(maintenance);

}

const createMaintenance = async oldMaintenance => {
    let aroundItems = [];
    let outletSampling = [];
    let emergencylight = [];
    let upsAutonomy = [];

    let customer = await schemas.Customer.findById(oldMaintenance.customer._id).populate('maintenanceType')

    var expiration = new Date();
    expiration.setMonth(expiration.getMonth() + customer.maintenanceType.value);

    let maintenance = new schemas.Maintenance({
        name: oldMaintenance.name,
        type: oldMaintenance.type,
        observation: oldMaintenance.observation,
        downloaded: false,
        price: oldMaintenance.price,
        customer: mongoose.Types.ObjectId(oldMaintenance.customer._id),
        status: "active",
        statusPayment: '',
        centerOfAttention: mongoose.Types.ObjectId(oldMaintenance.centerOfAttention),
        value: customer.maintenanceType.value,
        time: 'month',
        expiration,
        statusAlertOne: 'pending',
        statusAlertTwo: 'pending',
    });

    items = await schemas.Item.find({ mode: { $in: ['around'] } });
    await asyncForEach(items, async item => {
        let itemImage = schemas.ItemImage({
            maintenance: maintenance._id,
            item: mongoose.Types.ObjectId(item._id),
            status: 'activo',
            photos: [],
            value: 0.0,
            percentBatery: 0.0,
            hour: "",
            hasHour: false
        });
        await itemImage.save();
        aroundItems.push(itemImage);
    });
    maintenance.aroundItems = aroundItems;

    items = await schemas.Item.find({ mode: { $in: ['outletSampling'] } });
    await asyncForEach(items, async item => {
        let itemImage = schemas.ItemImage({
            maintenance: maintenance._id,
            item: mongoose.Types.ObjectId(item._id),
            status: 'activo',
            photos: [],
            value: 0.0,
            percentBatery: 0.0,
            hour: "",
            hasHour: false
        });
        await itemImage.save();
        outletSampling.push(itemImage);
    });
    maintenance.outletSampling = outletSampling;

    items = await schemas.Item.find({ mode: { $in: ['emergency_light'] } });
    await asyncForEach(items, async item => {
        let itemImage = schemas.ItemImage({
            maintenance: maintenance._id,
            item: mongoose.Types.ObjectId(item._id),
            status: 'activo',
            photos: [],
            value: 0.0,
            percentBatery: 0.0,
            hour: "",
            hasHour: false
        });
        await itemImage.save();
        emergencylight.push(itemImage);
    });
    maintenance.emergencylight = emergencylight;

    items = await schemas.Item.find({ mode: { $in: ['ups_autonomy'] } });
    await asyncForEach(items, async item => {
        let itemImage = schemas.ItemImage({
            maintenance: maintenance._id,
            item: mongoose.Types.ObjectId(item._id),
            status: 'activo',
            photos: [],
            value: 0.0,
            percentBatery: 0.0,
            hour: "",
            hasHour: true
        });
        await itemImage.save();
        upsAutonomy.push(itemImage);
    });
    maintenance.upsAutonomy = upsAutonomy;

    maintenance.save();
}

const createAttention = async request => {
    items = await schemas.Item.find({ mode: { $in: ['attention'] } });

    let listAttentionImage = []
    await asyncForEach(items, async item => {
        let attentionImage = new schemas.ItemImage({
            item: item._id,
            photos: [],
            status: 'activo',
            value: 0.0,
            percentBatery: 0.0,
            hour: "",
            hasHour: false,
            date: new Date()
        })
        await attentionImage.save();
        listAttentionImage.push(attentionImage);

    });

    let centerOfAttention = null;
    if (request.centerOfAttention) {
        centerOfAttention = mongoose.Types.ObjectId(request.centerOfAttention._id);
    }

    let count = await schemas.Attention.countDocuments();
    let attentionType = null;

    let attentionTypes = await schemas.AttentionType.find();
    attentionTypes.forEach(currentAttentionType => {
        if (request.request_type.tag == currentAttentionType.tag) {
            attentionType = currentAttentionType._id
        }
    })


    let attention = new schemas.Attention({
        number: count + 1,
        attentionItems: listAttentionImage,
        description: request.description,
        title: request.description,
        names: "",
        document: "",
        signature: "",
        status: "created",
        statusSend: "pending",
        price: parseFloat(0),
        customer: mongoose.Types.ObjectId(request.customer),
        creator: mongoose.Types.ObjectId(request.user),
        attentionType: mongoose.Types.ObjectId(attentionType),
        centerOfAttention: centerOfAttention,
        presave: true
    });
    await attention.save();
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
    getEmailCustomer,
    createAttention,
    getTokenFCMAdmins,
    getTokenFCMCustomer,
    sendEmailBoard
};