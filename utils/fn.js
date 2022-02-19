
const jwt = require("jsonwebtoken");
const mongoose = require('mongoose');
const schemas = require('./../db/schemas');

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

module.exports = {
    createToken,
    asyncForEach,
    verifyItemBoard,
    makedId,
    fileExtension,
};