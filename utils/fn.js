
const jwt = require("jsonwebtoken");
const mongoose = require('mongoose');
const mailer = require('../utils/mailer');
const schemas = require('./../db/schemas');
var fs = require('fs');
var config = require('./../config')
var qpdf = require('node-qpdf');

const createToken = (user, secret, expiresIn) => {
    const { id, name, document_number, photo, username } = user

    return jwt.sign({
        id,
        name,
        document_number,
        photo,
        username,
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

            fs.unlink(`./pdf/${id}.pdf`, (err) => {
                if (err) {
                    console.error(err)
                }
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

            })



        } catch (error) {
            console.log(error);
            reject({
                status: 'error',
                message: 'Ocurrió un error al abrir la marcación'
            });
        }
    });
}

const sendEmailAttention = id => {

    return new Promise(async (resolve, reject) => {
        try {

            let attention = await schemas.Attention.findById(mongoose.Types.ObjectId(id),).populate({
                path: 'customer'
            }).exec();

            const HummusRecipe = require('hummus-recipe');

            let path = `${config.pathSavePdf}${id}.pdf`;
            const pdfBase64 = fs.readFileSync(path, { encoding: 'base64' });

            let attachments = [
                {
                    filename: 'Cierre atención ' + attention._id + '.pdf',
                    content: pdfBase64,
                    encoding: 'base64'
                },
            ];
            mailer.emailAttention(attention, attachments);

            resolve(true);

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
    }
    if (attention.photos_before.length == 0) {
        errors++;
    }
    if (attention.photos_after.length == 0) {
        errors++;
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
};