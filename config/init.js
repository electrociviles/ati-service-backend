var mongoose = require("mongoose");
var schemas = require('../db/schemas');

var colors = {
    yellow: "FCF338",
    blue: "124DFC",
    red: "F21711",
    green: "2DE658",
    white: "FFFFFF",
    black: "000000",
    transparent: "FFFFFF",
};

/** Creacion parametros **/
exports.Start = function () {
    var Item = schemas.Item;
    var list = new Array();

    /** Voltaje Item trifasico */
    var item = {
        mode: 'tri',
        title: "Voltaje R-S",
        description: "",
        type: "voltaje",
        gallery: false,
        hasValue: true,
        placeHolder: "Voltaje",
        letterOne: "R",
        letterTwo: "S",
        colorOne: colors.yellow,
        colorTwo: colors.blue,
        textColorOne: colors.black,
        textColorTwo: colors.white,
    };
    list.push(item);

    var item = {
        mode: 'tri',
        title: "Voltaje R-T",
        description: "",
        type: "voltaje",
        gallery: false,
        hasValue: true,
        placeHolder: "Voltaje",
        letterOne: "R",
        letterTwo: "T",
        colorOne: colors.yellow,
        colorTwo: colors.red,
        textColorOne: colors.black,
        textColorTwo: colors.black,

    };
    list.push(item);

    var item = {
        mode: 'tri',
        title: "Voltaje S-T",
        description: "",
        type: "voltaje",
        gallery: false,
        hasValue: true,
        placeHolder: "Voltaje",
        letterOne: "S",
        letterTwo: "T",
        colorOne: colors.blue,
        colorTwo: colors.red,
        textColorOne: colors.black,
        textColorTwo: colors.black,
    };
    list.push(item);

    var item = {
        mode: 'tri',
        title: "Voltaje R-N",
        description: "",
        type: "voltaje",
        gallery: false,
        hasValue: true,
        placeHolder: "Voltaje",
        letterOne: "R",
        letterTwo: "N",
        colorOne: colors.yellow,
        colorTwo: colors.white,
        textColorOne: colors.black,
        textColorTwo: colors.black,
    };
    list.push(item);

    var item = {
        mode: 'tri',
        title: "Voltaje S-N",
        description: "",
        type: "voltaje",
        gallery: false,
        hasValue: true,
        placeHolder: "Voltaje",
        letterOne: "S",
        letterTwo: "N",
        colorOne: colors.blue,
        colorTwo: colors.white,
        textColorOne: colors.white,
        textColorTwo: colors.black,
    };
    list.push(item);

    var item = {
        mode: 'tri',
        title: "Voltaje T-N",
        description: "",
        type: "voltaje",
        gallery: false,
        hasValue: true,
        placeHolder: "Voltaje",
        letterOne: "T",
        letterTwo: "N",
        colorOne: colors.red,
        colorTwo: colors.white,
    };
    list.push(item);

    var item = {
        mode: 'tri',
        title: "Voltaje N-t",
        description: "",
        type: "voltaje",
        gallery: false,
        hasValue: true,
        placeHolder: "Voltaje",
        letterOne: "N",
        letterTwo: "t",
        colorOne: colors.white,
        colorTwo: colors.green,
        textColorOne: colors.black,
        textColorTwo: colors.black,
    };
    list.push(item);


    /** Voltaje Item monofasico */
    var item = {
        mode: 'mono',
        title: "Voltaje Fase 1 - Fase 2",
        description: "",
        type: "voltaje",
        gallery: false,
        hasValue: true,
        placeHolder: "Voltaje",
        letterOne: "Fase 1",
        letterTwo: "Fase 2",
        colorOne: colors.black,
        colorTwo: colors.red,
        textColorOne: colors.white,
        textColorTwo: colors.white,
    };
    list.push(item);

    var item = {
        mode: 'mono',
        title: "Voltaje Fase 1 - N",
        description: "",
        type: "voltaje",
        gallery: false,
        hasValue: true,
        placeHolder: "Voltaje",
        letterOne: "Fase 1",
        letterTwo: "N",
        colorOne: colors.black,
        colorTwo: colors.white,
        textColorOne: colors.white,
        textColorTwo: colors.black,
    };
    list.push(item);

    var item = {
        mode: 'mono',
        title: "Voltaje Fase 2 - N",
        description: "",
        type: "voltaje",
        gallery: false,
        hasValue: true,
        placeHolder: "Voltaje",
        letterOne: "Fase 2",
        letterTwo: "N",
        colorOne: colors.red,
        colorTwo: colors.white,
    };
    list.push(item);

    var item = {
        mode: 'mono',
        title: "Voltaje N - t",
        description: "",
        type: "voltaje",
        gallery: false,
        hasValue: true,
        placeHolder: "Voltaje",
        letterOne: "N",
        letterTwo: "t",
        colorOne: colors.white,
        colorTwo: colors.green,
        textColorOne: colors.black,
        textColorTwo: colors.black,
    };
    list.push(item);

    /** Corriente trifasico */
    var item = {
        mode: 'tri',
        title: "R",
        description: "",
        type: "corriente",
        gallery: false,
        hasValue: true,
        placeHolder: "Corriente",
        letterOne: "",
        letterTwo: "",
        colorOne: colors.yellow,
        colorTwo: colors.transparent,
        textColorOne: colors.black,
        textColorTwo: colors.transparent,
    };
    list.push(item);

    var item = {
        mode: 'tri',
        title: "S",
        description: "",
        type: "corriente",
        gallery: false,
        hasValue: true,
        placeHolder: "Corriente",
        letterOne: "",
        letterTwo: "",
        colorOne: colors.blue,
        colorTwo: colors.transparent,
        textColorOne: colors.white,
        textColorTwo: colors.transparent,
    };
    list.push(item);

    var item = {
        mode: 'tri',
        title: "T",
        description: "",
        type: "corriente",
        gallery: false,
        hasValue: true,
        placeHolder: "Corriente",
        letterOne: "",
        letterTwo: "",
        colorOne: colors.red,
        colorTwo: colors.transparent,
        textColorOne: colors.white,
        textColorTwo: colors.transparent,
    };
    list.push(item);

    var item = {
        mode: 'tri',
        title: "N",
        description: "",
        type: "corriente",
        gallery: false,
        hasValue: true,
        placeHolder: "Corriente",
        letterOne: "",
        letterTwo: "",
        colorOne: colors.white,
        colorTwo: colors.transparent,
        textColorOne: colors.black,
        textColorTwo: colors.transparent,
    };
    list.push(item);

    var item = {
        mode: 'tri',
        title: "t",
        description: "",
        type: "corriente",
        gallery: false,
        hasValue: true,
        placeHolder: "Corriente",
        letterOne: "",
        letterTwo: "",
        colorOne: colors.green,
        colorTwo: colors.transparent,
        textColorOne: colors.black,
        textColorTwo: colors.transparent,
    };
    list.push(item);


    /** Corriente monofisico */
    var item = {
        mode: 'mono',
        title: "Fase 1",
        description: "",
        type: "corriente",
        gallery: false,
        hasValue: true,
        placeHolder: "Corriente",
        letterOne: "",
        letterTwo: "",
        colorOne: colors.black,
        colorTwo: colors.transparent,
        textColorOne: colors.white,
        textColorTwo: colors.transparent,
    };
    list.push(item);

    var item = {
        mode: 'mono',
        title: "Fase 2",
        description: "",
        type: "corriente",
        gallery: false,
        hasValue: true,
        placeHolder: "Corriente",
        letterOne: "",
        letterTwo: "",
        colorOne: colors.red,
        colorTwo: colors.transparent,
        textColorOne: colors.white,
        textColorTwo: colors.transparent,
    };
    list.push(item);

    var item = {
        mode: 'mono',
        title: "N",
        description: "",
        type: "corriente",
        gallery: false,
        hasValue: true,
        placeHolder: "Corriente",
        letterOne: "",
        letterTwo: "",
        colorOne: colors.white,
        colorTwo: colors.transparent,
        textColorOne: colors.black,
        textColorTwo: colors.transparent,
    };
    list.push(item);

    var item = {
        mode: 'mono',
        title: "t",
        description: "",
        type: "corriente",
        gallery: false,
        hasValue: true,
        placeHolder: "Corriente",
        letterOne: "",
        letterTwo: "",
        colorOne: colors.green,
        colorTwo: colors.transparent,
        textColorOne: colors.black,
        textColorTwo: colors.transparent,
    };
    list.push(item);


    /** General antes */
    var item = {
        mode: 'before',
        title: "Foto marcación tablero",
        description: "",
        type: "board_marking",
        gallery: false,
        hasValue: false,
        placeHolder: "",
        letterOne: "",
        letterTwo: "",
        colorOne: colors.transparent,
        colorTwo: colors.transparent,
        textColorOne: colors.transparent,
        textColorTwo: colors.transparent,
    };
    list.push(item);

    var item = {
        mode: 'before',
        title: "Galeria antes mantenimiento",
        description: "",
        type: "gallery_before_maintenance",
        gallery: true,
        hasValue: false,
        placeHolder: "",
        letterOne: "",
        letterTwo: "",
        colorOne: colors.transparent,
        colorTwo: colors.transparent,
        textColorOne: colors.transparent,
        textColorTwo: colors.transparent,
    };
    list.push(item);

    var item = {
        mode: 'before',
        title: "Termografía antes mantenimiento",
        description: "",
        type: "thermography_before",
        placeHolder: "Grados",
        hasValue: true,
        gallery: false,
        letterOne: "",
        letterTwo: "",
        colorOne: colors.transparent,
        colorTwo: colors.transparent,
        textColorOne: colors.transparent,
        textColorTwo: colors.transparent,
    };
    list.push(item);

    /** General despues */
    var item = {
        mode: 'general',
        title: "Galeria despues mantenimiento",
        description: "",
        type: "gallery_after_maintenance",
        gallery: true,
        hasValue: false,
        placeHolder: "",
        letterOne: "",
        letterTwo: "",
        colorOne: colors.transparent,
        colorTwo: colors.transparent,
        textColorOne: colors.transparent,
        textColorTwo: colors.transparent,
    };
    list.push(item);

    var item = {
        mode: 'after',
        title: "Grados + termografía",
        description: "",
        type: "degress_termographi",
        gallery: false,
        hasValue: false,
        placeHolder: "",
        letterOne: "",
        letterTwo: "",
        colorOne: colors.transparent,
        colorTwo: colors.transparent,
        textColorOne: colors.transparent,
        textColorTwo: colors.transparent,
    };
    list.push(item);

    var item = {
        mode: 'after',
        title: "Galeria marcación circuito",
        description: "",
        type: "circuit_marking",
        gallery: true,
        hasValue: false,
        placeHolder: "",
        letterOne: "",
        letterTwo: "",
        colorOne: colors.transparent,
        colorTwo: colors.transparent,
        textColorOne: colors.transparent,
        textColorTwo: colors.transparent,
    };
    list.push(item);

    var item = {
        mode: 'after',
        title: "Foto protección principal",
        description: "",
        type: "principal_protection",
        gallery: false,
        hasValue: false,
        placeHolder: "",
        letterOne: "",
        letterTwo: "",
        colorOne: colors.transparent,
        colorTwo: colors.transparent,
        textColorOne: colors.transparent,
        textColorTwo: colors.transparent,
    };
    list.push(item);

    var item = {
        mode: 'after',
        title: "Foto de Diagrama unifilar",
        description: "",
        type: "single_line_diagram",
        gallery: false,
        hasValue: false,
        placeHolder: "",
        letterOne: "",
        letterTwo: "",
        colorOne: colors.transparent,
        colorTwo: colors.transparent,
        textColorOne: colors.transparent,
        textColorTwo: colors.transparent,
    };
    list.push(item);

    /** Items attention */
    var item = {
        mode: 'attention',
        title: "Fotos antes mantenimiento",
        description: "",
        type: "attention_before",
        gallery: false,
        hasValue: false,
        placeHolder: "",
        letterOne: "",
        letterTwo: "",
        colorOne: colors.transparent,
        colorTwo: colors.transparent,
        textColorOne: colors.transparent,
        textColorTwo: colors.transparent,
    };
    list.push(item);

    var item = {
        mode: 'attention',
        title: "Fotos despuest mantenimiento",
        description: "",
        type: "attention_after",
        gallery: false,
        hasValue: false,
        placeHolder: "",
        letterOne: "",
        letterTwo: "",
        colorOne: colors.transparent,
        colorTwo: colors.transparent,
        textColorOne: colors.transparent,
        textColorTwo: colors.transparent,
    };
    list.push(item);


    // Items.collection.insert(list, function () { });
    Item.insertMany(list).then(function () {
        console.log("Data inserted")  // Success
    }).catch(function (error) {
        console.log(error)      // Failure
    });
}


/**  Creacion de usuario principal **/
exports.createUser = function () {

    var User = schemas.User;
    var administrador = new User({
        name: "Administrador",
        document_number: "111111111",
        photo: "default.png",
        username: "admin",
        password: "admin",
        role: "administrator",
    });

    administrador.save();
};
exports.createCustomer = function () {

    var User = schemas.Customer;
    var customer = new User({
        name: 'Decathlon Colina',
        address: 'Cl. 147 # 58C-95, Bogotá',
        email: 'decathoncolina@mail.com',
        phone: '5555555555'
    });
    customer.save();
};
exports.createProject = function () {

    var Project = schemas.Project;
    var project = new Project({
        name: 'Mantenimineto Eléctrico Exito',
        type: 'tri',
        customer: mongoose.Types.ObjectId("6205505db6cd35211920a7a8"),
    });
    project.save();
};