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
exports.NewItem = function () {
    var Item = schemas.Item;
    var list = new Array();
    let position = 1;


    var item = {
        _id: mongoose.Types.ObjectId('62aca8eca778c877280ab7f9'),
        mode: 'emergency_light',
        title: "Iluminación de emergencia",
        description: "",
        group: 'emergency_light',
        type: "emergency_light",
        gallery: false,
        hasValue: false,
        position,
        placeHolder: "",
        letterOne: "",
        letterTwo: "",
        colorOne: colors.transparent,
        colorTwo: colors.transparent,
        textColorOne: colors.transparent,
        textColorTwo: colors.transparent,
    };


    list.push(item);
    position++;

    var item = {
        _id: mongoose.Types.ObjectId('62aca8eca778c877280ab7fa'),
        mode: 'ups_autonomy',
        title: "Autonomía de UPS",
        description: "",
        group: 'ups_autonomy',
        type: "ups_autonomy",
        gallery: false,
        hasValue: false,
        position,
        placeHolder: "",
        letterOne: "",
        letterTwo: "",
        colorOne: colors.transparent,
        colorTwo: colors.transparent,
        textColorOne: colors.transparent,
        textColorTwo: colors.transparent,
    };
    list.push(item);
    position++;


    Item.insertMany(list).then(function () {
        console.log("Data inserted")
    }).catch(function (error) {
        console.log(error)
    });
}
exports.UpdateProjectSetNewItems = async function () {
    let projects = await schemas.Project.find();
    await fn.asyncForEach(projects, async project => {


        items = await schemas.Item.find({ mode: { $in: ['emergency_light'] } });
        await fn.asyncForEach(items, async item => {
            let itemImage = schemas.ItemImage({
                project: project._id,
                item: mongoose.Types.ObjectId(item._id),
                status: 'activo',
                photos: [],
                value: 0.0,
            });
            await itemImage.save();
            emergencylight.push(itemImage);
        });
        project.emergencylight = emergencylight;

        items = await schemas.Item.find({ mode: { $in: ['ups_autonomy'] } });
        await fn.asyncForEach(items, async item => {
            let itemImage = schemas.ItemImage({
                project: project._id,
                item: mongoose.Types.ObjectId(item._id),
                status: 'activo',
                photos: [],
                value: 0.0,
                percentBatery: 0.0,
                hour: ""
            });
            await itemImage.save();
            upsAutonomy.push(itemImage);
        });
        project.upsAutonomy = upsAutonomy;


    });
}
exports.Start = function () {
    var Item = schemas.Item;
    var list = new Array();
    let position = 1;

    /** Voltaje Item trifasico */
    var item = {
        _id: mongoose.Types.ObjectId('621bbe991d33b069860f664c'),
        mode: 'tri',
        title: "Voltaje R-S",
        group: 'board',
        description: "",
        type: "voltaje",
        gallery: false,
        hasValue: true,
        position,
        placeHolder: "Voltaje",
        letterOne: "R",
        letterTwo: "S",
        colorOne: colors.yellow,
        colorTwo: colors.blue,
        textColorOne: colors.black,
        textColorTwo: colors.white,
    };
    list.push(item);
    position++;

    var item = {
        _id: mongoose.Types.ObjectId('621bbe991d33b069860f664d'),
        mode: 'tri',
        title: "Voltaje R-T",
        group: 'board',
        description: "",
        type: "voltaje",
        gallery: false,
        hasValue: true,
        position: 1,
        placeHolder: "Voltaje",
        letterOne: "R",
        letterTwo: "T",
        colorOne: colors.yellow,
        colorTwo: colors.red,
        textColorOne: colors.black,
        textColorTwo: colors.white,

    };
    list.push(item);
    position++;


    var item = {
        _id: mongoose.Types.ObjectId('621bbe991d33b069860f664e'),
        mode: 'tri',
        title: "Voltaje S-T",
        group: 'board',
        description: "",
        type: "voltaje",
        gallery: false,
        hasValue: true,
        position,
        placeHolder: "Voltaje",
        letterOne: "S",
        letterTwo: "T",
        colorOne: colors.blue,
        colorTwo: colors.red,
        textColorOne: colors.white,
        textColorTwo: colors.white,
    };
    list.push(item);
    position++;


    var item = {
        _id: mongoose.Types.ObjectId('621bbe991d33b069860f664f'),
        mode: 'tri',
        title: "Voltaje R-N",
        description: "",
        group: 'board',
        type: "voltaje",
        gallery: false,
        hasValue: true,
        position,
        placeHolder: "Voltaje",
        letterOne: "R",
        letterTwo: "N",
        colorOne: colors.yellow,
        colorTwo: colors.white,
        textColorOne: colors.black,
        textColorTwo: colors.black,
    };
    list.push(item);
    position++;


    var item = {
        _id: mongoose.Types.ObjectId('621bbe991d33b069860f6650'),
        mode: 'tri',
        title: "Voltaje S-N",
        description: "",
        group: 'board',
        type: "voltaje",
        gallery: false,
        hasValue: true,
        position,
        placeHolder: "Voltaje",
        letterOne: "S",
        letterTwo: "N",
        colorOne: colors.blue,
        colorTwo: colors.white,
        textColorOne: colors.white,
        textColorTwo: colors.black,
    };
    list.push(item);
    position++;


    var item = {
        _id: mongoose.Types.ObjectId('621bbe991d33b069860f6651'),
        mode: 'tri',
        title: "Voltaje T-N",
        description: "",
        group: 'board',
        type: "voltaje",
        gallery: false,
        hasValue: true,
        position,
        placeHolder: "Voltaje",
        letterOne: "T",
        letterTwo: "N",
        colorOne: colors.red,
        colorTwo: colors.white,
        textColorOne: colors.white,
        textColorTwo: colors.black,
    };
    list.push(item);
    position++;


    var item = {
        _id: mongoose.Types.ObjectId('621bbe991d33b069860f6652'),
        mode: 'tri',
        title: "Voltaje N-t",
        description: "",
        group: 'board',
        type: "voltaje",
        gallery: false,
        hasValue: true,
        position,
        placeHolder: "Voltaje",
        letterOne: "N",
        letterTwo: "t",
        colorOne: colors.white,
        colorTwo: colors.green,
        textColorOne: colors.black,
        textColorTwo: colors.black,
    };
    list.push(item);
    position++;


    /** Voltaje Item monofasico */
    var item = {
        _id: mongoose.Types.ObjectId('621bbe991d33b069860f6653'),
        mode: 'mono',
        title: "Voltaje Fase 1 - Fase 2",
        description: "",
        group: 'board',
        type: "voltaje",
        gallery: false,
        hasValue: true,
        position,
        placeHolder: "Voltaje",
        letterOne: "Fase 1",
        letterTwo: "Fase 2",
        colorOne: colors.black,
        colorTwo: colors.red,
        textColorOne: colors.white,
        textColorTwo: colors.white,
    };
    list.push(item);
    position++;


    var item = {
        _id: mongoose.Types.ObjectId('621bbe991d33b069860f6654'),
        mode: 'mono',
        title: "Voltaje Fase 1 - N",
        description: "",
        group: 'board',
        type: "voltaje",
        gallery: false,
        hasValue: true,
        position,
        placeHolder: "Voltaje",
        letterOne: "Fase 1",
        letterTwo: "N",
        colorOne: colors.black,
        colorTwo: colors.white,
        textColorOne: colors.white,
        textColorTwo: colors.black,
    };
    list.push(item);
    position++;


    var item = {
        _id: mongoose.Types.ObjectId('621bbe991d33b069860f6655'),
        mode: 'mono',
        title: "Voltaje Fase 2 - N",
        description: "",
        group: 'board',
        type: "voltaje",
        gallery: false,
        hasValue: true,
        position,
        placeHolder: "Voltaje",
        letterOne: "Fase 2",
        letterTwo: "N",
        colorOne: colors.red,
        colorTwo: colors.white,
        textColorOne: colors.white,
        textColorTwo: colors.black,
    };
    list.push(item);
    position++;


    var item = {
        _id: mongoose.Types.ObjectId('621bbe991d33b069860f6656'),
        mode: 'mono',
        title: "Voltaje N - t",
        description: "",
        group: 'board',
        type: "voltaje",
        gallery: false,
        hasValue: true,
        position,
        placeHolder: "Voltaje",
        letterOne: "N",
        letterTwo: "t",
        colorOne: colors.white,
        colorTwo: colors.green,
        textColorOne: colors.black,
        textColorTwo: colors.black,
    };
    list.push(item);
    position++;


    /** Corriente trifasico */
    var item = {
        _id: mongoose.Types.ObjectId('621bbe991d33b069860f6657'),
        mode: 'tri',
        title: "R",
        description: "",
        group: 'board',
        type: "corriente",
        gallery: false,
        hasValue: true,
        position,
        placeHolder: "Corriente",
        letterOne: "",
        letterTwo: "",
        colorOne: colors.yellow,
        colorTwo: colors.transparent,
        textColorOne: colors.black,
        textColorTwo: colors.transparent,
    };
    list.push(item);
    position++;


    var item = {
        _id: mongoose.Types.ObjectId('621bbe991d33b069860f6658'),
        mode: 'tri',
        title: "S",
        description: "",
        group: 'board',
        type: "corriente",
        gallery: false,
        hasValue: true,
        position,
        placeHolder: "Corriente",
        letterOne: "",
        letterTwo: "",
        colorOne: colors.blue,
        colorTwo: colors.transparent,
        textColorOne: colors.white,
        textColorTwo: colors.transparent,
    };
    list.push(item);
    position++;


    var item = {
        _id: mongoose.Types.ObjectId('621bbe991d33b069860f6659'),
        mode: 'tri',
        title: "T",
        description: "",
        group: 'board',
        type: "corriente",
        gallery: false,
        hasValue: true,
        position,
        placeHolder: "Corriente",
        letterOne: "",
        letterTwo: "",
        colorOne: colors.red,
        colorTwo: colors.transparent,
        textColorOne: colors.white,
        textColorTwo: colors.transparent,
    };
    list.push(item);
    position++;


    var item = {
        _id: mongoose.Types.ObjectId('621bbe991d33b069860f665a'),
        mode: 'tri',
        title: "N",
        description: "",
        group: 'board',
        type: "corriente",
        gallery: false,
        hasValue: true,
        position,
        placeHolder: "Corriente",
        letterOne: "",
        letterTwo: "",
        colorOne: colors.white,
        colorTwo: colors.transparent,
        textColorOne: colors.black,
        textColorTwo: colors.transparent,
    };
    list.push(item);
    position++;


    var item = {
        _id: mongoose.Types.ObjectId('621bbe991d33b069860f665b'),
        mode: 'tri',
        title: "t",
        description: "",
        group: 'board',
        type: "corriente",
        gallery: false,
        hasValue: true,
        position,
        placeHolder: "Corriente",
        letterOne: "",
        letterTwo: "",
        colorOne: colors.green,
        colorTwo: colors.transparent,
        textColorOne: colors.black,
        textColorTwo: colors.transparent,
    };
    list.push(item);
    position++;


    /** Corriente monofisico */
    var item = {
        _id: mongoose.Types.ObjectId('621bbe991d33b069860f665c'),
        mode: 'mono',
        title: "Fase 1",
        description: "",
        group: 'board',
        type: "corriente",
        gallery: false,
        hasValue: true,
        position,
        placeHolder: "Corriente",
        letterOne: "",
        letterTwo: "",
        colorOne: colors.black,
        colorTwo: colors.transparent,
        textColorOne: colors.white,
        textColorTwo: colors.transparent,
    };
    list.push(item);
    position++;

    var item = {
        _id: mongoose.Types.ObjectId('621bbe991d33b069860f665d'),
        mode: 'mono',
        title: "Fase 2",
        description: "",
        group: 'board',
        type: "corriente",
        gallery: false,
        hasValue: true,
        position,
        placeHolder: "Corriente",
        letterOne: "",
        letterTwo: "",
        colorOne: colors.red,
        colorTwo: colors.transparent,
        textColorOne: colors.white,
        textColorTwo: colors.transparent,
    };
    list.push(item);
    position++;

    var item = {
        _id: mongoose.Types.ObjectId('621bbe991d33b069860f665e'),
        mode: 'mono',
        title: "N",
        description: "",
        group: 'board',
        type: "corriente",
        gallery: false,
        hasValue: true,
        position,
        placeHolder: "Corriente",
        letterOne: "",
        letterTwo: "",
        colorOne: colors.white,
        colorTwo: colors.transparent,
        textColorOne: colors.black,
        textColorTwo: colors.transparent,
    };
    list.push(item);
    position++;


    var item = {
        _id: mongoose.Types.ObjectId('621bbe991d33b069860f665f'),
        mode: 'mono',
        title: "t",
        description: "",
        group: 'board',
        type: "corriente",
        gallery: false,
        hasValue: true,
        position,
        placeHolder: "Corriente",
        letterOne: "",
        letterTwo: "",
        colorOne: colors.green,
        colorTwo: colors.transparent,
        textColorOne: colors.black,
        textColorTwo: colors.transparent,
    };
    list.push(item);
    position++;



    /** General antes */
    var item = {
        _id: mongoose.Types.ObjectId('621bbe991d33b069860f6660'),
        mode: 'before',
        title: "Foto marcación tablero",
        description: "",
        group: 'board',
        type: "board_marking",
        gallery: false,
        hasValue: false,
        position,
        placeHolder: "",
        letterOne: "",
        letterTwo: "",
        colorOne: colors.transparent,
        colorTwo: colors.transparent,
        textColorOne: colors.transparent,
        textColorTwo: colors.transparent,
    };
    list.push(item);
    position++;


    var item = {
        _id: mongoose.Types.ObjectId('621bbe991d33b069860f6661'),
        mode: 'before',
        title: "Galeria antes mantenimiento",
        description: "",
        group: 'board',
        type: "gallery_before_maintenance",
        gallery: true,
        hasValue: false,
        position,
        placeHolder: "",
        letterOne: "",
        letterTwo: "",
        colorOne: colors.transparent,
        colorTwo: colors.transparent,
        textColorOne: colors.transparent,
        textColorTwo: colors.transparent,
    };
    list.push(item);
    position++;


    var item = {
        _id: mongoose.Types.ObjectId('621bbe991d33b069860f6662'),
        mode: 'before',
        title: "Termografía antes mantenimiento",
        description: "",
        group: 'board',
        type: "thermography_before",
        placeHolder: "Grados",
        hasValue: true,
        gallery: false,
        position,
        letterOne: "",
        letterTwo: "",
        colorOne: colors.transparent,
        colorTwo: colors.transparent,
        textColorOne: colors.transparent,
        textColorTwo: colors.transparent,
    };
    list.push(item);
    position++;


    /** General después */
    var item = {
        _id: mongoose.Types.ObjectId('621bbe991d33b069860f6663'),
        mode: 'general',
        title: "Galeria después mantenimiento",
        description: "",
        group: 'board',
        type: "gallery_after_maintenance",
        gallery: true,
        hasValue: false,
        position,
        placeHolder: "",
        letterOne: "",
        letterTwo: "",
        colorOne: colors.transparent,
        colorTwo: colors.transparent,
        textColorOne: colors.transparent,
        textColorTwo: colors.transparent,
    };
    list.push(item);
    position++;


    var item = {
        _id: mongoose.Types.ObjectId('621bbe991d33b069860f6664'),
        mode: 'after',
        title: "Termografía después",
        description: "",
        group: 'board',
        type: "degress_termography",
        gallery: false,
        hasValue: true,
        position,
        placeHolder: "",
        letterOne: "",
        letterTwo: "",
        colorOne: colors.transparent,
        colorTwo: colors.transparent,
        textColorOne: colors.transparent,
        textColorTwo: colors.transparent,
    };
    list.push(item);
    position++;


    var item = {
        _id: mongoose.Types.ObjectId('621bbe991d33b069860f6665'),
        mode: 'after',
        title: "Galeria marcación circuito",
        description: "",
        group: 'board',
        type: "circuit_marking",
        gallery: true,
        hasValue: false,
        position,
        placeHolder: "",
        letterOne: "",
        letterTwo: "",
        colorOne: colors.transparent,
        colorTwo: colors.transparent,
        textColorOne: colors.transparent,
        textColorTwo: colors.transparent,
    };
    list.push(item);
    position++;


    var item = {
        _id: mongoose.Types.ObjectId('623eb9bce56a988dae00a035'),
        mode: 'after',
        title: "Galeria después de manteniento",
        description: "",
        group: 'board',
        type: "circuit_marking",
        gallery: true,
        hasValue: false,
        position,
        placeHolder: "",
        letterOne: "",
        letterTwo: "",
        colorOne: colors.transparent,
        colorTwo: colors.transparent,
        textColorOne: colors.transparent,
        textColorTwo: colors.transparent,
    };
    list.push(item);
    position++;


    var item = {
        _id: mongoose.Types.ObjectId('621bbe991d33b069860f6666'),
        mode: 'after',
        title: "Foto protección principal",
        description: "",
        group: 'board',
        type: "principal_protection",
        gallery: false,
        hasValue: false,
        position,
        placeHolder: "",
        letterOne: "",
        letterTwo: "",
        colorOne: colors.transparent,
        colorTwo: colors.transparent,
        textColorOne: colors.transparent,
        textColorTwo: colors.transparent,
    };
    list.push(item);
    position++;


    var item = {
        _id: mongoose.Types.ObjectId('621bbe991d33b069860f6667'),
        mode: 'after',
        title: "Foto de Diagrama Unifilar",
        description: "",
        group: 'board',
        type: "single_line_diagram",
        gallery: false,
        hasValue: false,
        position,
        placeHolder: "",
        letterOne: "",
        letterTwo: "",
        colorOne: colors.transparent,
        colorTwo: colors.transparent,
        textColorOne: colors.transparent,
        textColorTwo: colors.transparent,
    };
    list.push(item);
    position++;


    /** Items attention */
    var item = {
        _id: mongoose.Types.ObjectId('621bbe991d33b069860f6668'),
        mode: 'attention',
        title: "Fotos antes de la atención",
        description: "",
        group: 'attention',
        type: "before",
        gallery: false,
        hasValue: false,
        position,
        placeHolder: "",
        letterOne: "",
        letterTwo: "",
        colorOne: colors.transparent,
        colorTwo: colors.transparent,
        textColorOne: colors.transparent,
        textColorTwo: colors.transparent,
    };
    list.push(item);
    position++;


    var item = {
        _id: mongoose.Types.ObjectId('621bbe991d33b069860f6669'),
        mode: 'attention',
        title: "Fotos después de la atención",
        description: "",
        group: 'attention',
        type: "after",
        gallery: false,
        hasValue: false,
        position,
        placeHolder: "",
        letterOne: "",
        letterTwo: "",
        colorOne: colors.transparent,
        colorTwo: colors.transparent,
        textColorOne: colors.transparent,
        textColorTwo: colors.transparent,
    };
    list.push(item);
    position++;


    var item = {
        _id: mongoose.Types.ObjectId('623eb9bce56a988dae00a03a'),
        mode: 'around',
        title: "Fotos antes",
        description: "",
        group: 'around',
        type: "before",
        gallery: false,
        hasValue: false,
        position,
        placeHolder: "",
        letterOne: "",
        letterTwo: "",
        colorOne: colors.transparent,
        colorTwo: colors.transparent,
        textColorOne: colors.transparent,
        textColorTwo: colors.transparent,
    };
    list.push(item);
    position++;



    var item = {
        _id: mongoose.Types.ObjectId('623eb9bce56a988dae00a03b'),
        mode: 'around',
        title: "Fotos después",
        description: "",
        group: 'around',
        type: "after",
        gallery: false,
        hasValue: false,
        position,
        placeHolder: "",
        letterOne: "",
        letterTwo: "",
        colorOne: colors.transparent,
        colorTwo: colors.transparent,
        textColorOne: colors.transparent,
        textColorTwo: colors.transparent,
    };
    list.push(item);
    position++;


    /** Outlet sampling  */
    var item = {
        _id: mongoose.Types.ObjectId('623eb9bce56a988dae00a03c'),
        mode: 'outletSampling',
        title: "Muestreo toma 1",
        description: "",
        group: 'outletSampling',
        type: "before",
        gallery: true,
        hasValue: false,
        position,
        placeHolder: "",
        letterOne: "",
        letterTwo: "",
        colorOne: colors.transparent,
        colorTwo: colors.transparent,
        textColorOne: colors.transparent,
        textColorTwo: colors.transparent,
    };
    list.push(item);
    position++;


    var item = {
        _id: mongoose.Types.ObjectId('623eb9bce56a988dae00a03d'),
        mode: 'outletSampling',
        title: "Muestreo toma 2",
        description: "",
        group: 'outletSampling',
        type: "before",
        gallery: true,
        hasValue: false,
        position,
        placeHolder: "",
        letterOne: "",
        letterTwo: "",
        colorOne: colors.transparent,
        colorTwo: colors.transparent,
        textColorOne: colors.transparent,
        textColorTwo: colors.transparent,
    };
    list.push(item);
    position++;


    var item = {
        _id: mongoose.Types.ObjectId('623eb9bce56a988dae00a03e'),
        mode: 'outletSampling',
        title: "Muestreo toma 3",
        description: "",
        group: 'outletSampling',
        type: "before",
        gallery: true,
        hasValue: false,
        position,
        placeHolder: "",
        letterOne: "",
        letterTwo: "",
        colorOne: colors.transparent,
        colorTwo: colors.transparent,
        textColorOne: colors.transparent,
        textColorTwo: colors.transparent,
    };
    list.push(item);
    position++;


    var item = {
        _id: mongoose.Types.ObjectId('623eb9bce56a988dae00a03f'),
        mode: 'outletSampling',
        title: "Muestreo toma 4",
        description: "",
        group: 'outletSampling',
        type: "before",
        gallery: true,
        hasValue: false,
        position,
        placeHolder: "",
        letterOne: "",
        letterTwo: "",
        colorOne: colors.transparent,
        colorTwo: colors.transparent,
        textColorOne: colors.transparent,
        textColorTwo: colors.transparent,
    };
    list.push(item);
    position++;

    var item = {
        _id: mongoose.Types.ObjectId('623eb9bce56a988dae00a040'),
        mode: 'outletSampling',
        title: "Muestreo toma 5",
        description: "",
        group: 'outletSampling',
        type: "before",
        gallery: true,
        hasValue: false,
        position,
        placeHolder: "",
        letterOne: "",
        letterTwo: "",
        colorOne: colors.transparent,
        colorTwo: colors.transparent,
        textColorOne: colors.transparent,
        textColorTwo: colors.transparent,
    };
    list.push(item);
    position++;


    var item = {
        _id: mongoose.Types.ObjectId('623eb9bce56a988dae00a041'),
        mode: 'finding',
        title: "Hallazgos",
        description: "",
        group: 'finding',
        type: "finding",
        gallery: true,
        hasValue: false,
        position,
        placeHolder: "",
        letterOne: "",
        letterTwo: "",
        colorOne: colors.transparent,
        colorTwo: colors.transparent,
        textColorOne: colors.transparent,
        textColorTwo: colors.transparent,
    };
    list.push(item);
    position++;


    Item.insertMany(list).then(function () {
        console.log("Data inserted")
    }).catch(function (error) {
        console.log(error)
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
exports.createRole = function () {
    var list = new Array()
    var role = new schemas.Role({
        _id: mongoose.Types.ObjectId('5a046fe9627e3526802b3847'),
        name: "Administrador",
        administrative: true,
        status: 'active'
    })
    list.push(role)

    var role = new schemas.Role({
        _id: mongoose.Types.ObjectId('5a046fe9627e3526802b3848'),
        name: "Cliente",
        administrative: false,
        status: 'active'
    })
    list.push(role)


    var role = new schemas.Role({
        _id: mongoose.Types.ObjectId('5a046fe9627e3526802b3849'),
        name: "Proveedor",
        administrative: false,
        status: 'active'
    })
    list.push(role)
    schemas.Role.insertMany(list, function () { });

}
exports.createConfiguration = function () {

    var list = new Array()

    var Configuration = schemas.Configuration;
    var configuration = new Configuration({
        title: 'Vencimiento mantenimiento semestral',
        key: 'expirationDateMaintenance',
        value: '30'
    });
    list.push(configuration)

    var configuration = new Configuration({
        title: 'Alerta de aprovisionamiento',
        key: 'provisioningAlert',
        value: '15'
    });
    list.push(configuration)

    schemas.Configuration.insertMany(list, function () { });
}
exports.createMenu = () => {

    var menu = new schemas.Menu({
        title: '',
        pages: []
    })

    var listPage = new Array()

    /** Inicio */
    var home = new schemas.Page({
        title: 'Inicio',
        href: '/home',
        icon: 'GoHome',
        isParent: true,
        roles: ['5a046fe9627e3526802b3847']
    })
    listPage.push(home)
    menu.pages.push(home)

    /** Servicies */
    var attention = new schemas.Page({
        title: 'Atenciones',
        href: '/attentions',
        icon: 'RiCustomerService2Fill',
        isParent: false,
        children: [],
        roles: ['5a046fe9627e3526802b3847']
    })
    listPage.push(attention)
    menu.pages.push(attention)

    /** Servicies */
    var projects = new schemas.Page({
        title: 'Mantenimientos',
        href: '/maintenances',
        icon: 'VscProject',
        isParent: false,
        children: [],
        roles: ['5a046fe9627e3526802b3847']
    })
    listPage.push(projects)
    menu.pages.push(projects)


    // var maintenance = new schemas.Page({
    //     title: 'Mantenimientos',
    //     href: '/maintenance',
    //     icon: 'GiAutoRepair',
    //     isParent: true,
    //     children: [],
    //     roles: ['5a046fe9627e3526802b3847']
    // })
    // listPage.push(maintenance)


    var attentionCenter = new schemas.Page({
        title: 'Centros de atención',
        href: '/attention-center',
        icon: 'FaLaptopHouse',
        isParent: true,
        children: [],
        roles: ['5a046fe9627e3526802b3847']
    })
    listPage.push(attentionCenter)
    menu.pages.push(attentionCenter)



    /** Reports */
    var reports = new schemas.Page({
        title: 'Reportes',
        href: '/reports',
        icon: 'GoGraph',
        isParent: true,
        children: [],
        roles: ['5a046fe9627e3526802b3847']
    })
    listPage.push(reports)

    var reports01 = new schemas.Page({
        title: 'Atenciones',
        href: '/reports/attentions',
        icon: 'RiFileList3Line',
        isParent: false,
        roles: ['5a046fe9627e3526802b3847']
    })
    listPage.push(reports01)
    menu.pages.push(reports)

    reports.children.push(reports01._id)

    /** Ajustes */
    var pageAjustes = new schemas.Page({
        title: 'Configuración',
        href: '/setting',
        icon: 'AiOutlineSetting',
        isParent: true,
        children: [],
        roles: ['5a046fe9627e3526802b3847']
    })
    listPage.push(pageAjustes)
    menu.pages.push(pageAjustes)

    var usuarios = new schemas.Page({
        title: 'Usuarios',
        href: '/users',
        icon: 'RiUserSettingsLine',
        isParent: false,
        roles: ['5a046fe9627e3526802b3847']
    })
    listPage.push(usuarios)

    //Roles
    var roles = new schemas.Page({
        title: 'Roles',
        href: '/roles',
        icon: 'BsShieldLock',
        isParent: false,
        children: [],
        roles: ['5a046fe9627e3526802b3847']
    })
    listPage.push(roles)

    var asignarRoles = new schemas.Page({
        title: 'Asignar permisos',
        href: '/roles/to-assign',
        icon: 'FiKey',
        isParent: false,
        roles: ['5a046fe9627e3526802b3847']
    })
    listPage.push(asignarRoles)

    var values = new schemas.Page({
        title: 'Valores',
        href: '/values',
        icon: 'ImSortNumbericDesc',
        isParent: false,
        roles: ['5a046fe9627e3526802b3847']
    })
    listPage.push(values)

    pageAjustes.children.push(usuarios._id)
    pageAjustes.children.push(roles._id)
    pageAjustes.children.push(asignarRoles._id)
    pageAjustes.children.push(values._id)

    menu.save()

    schemas.Page.insertMany(listPage).then(function () {
        console.log("Data inserted")
    }).catch(function (error) {
        console.log(error)
    });

}
exports.createAttentionType = function () {

    var list = new Array()

    var AttentionType = schemas.AttentionType;
    var attentionType = new AttentionType({
        type: 'Emergencia',
        status: 'active',
    });
    list.push(attentionType)

    var attentionType = new AttentionType({
        type: 'Programada',
        status: 'active',
    });
    list.push(attentionType)

    schemas.AttentionType.insertMany(list, function () { });
}
exports.updateCustomerToUsers = async function () {
    var User = schemas.User;

    var listUsers = []
    var customers = await schemas.Customer.find();
    customers.map(customer => {
        console.log("customer ", customer);
        var user = new User({
            name: customer.name,
            document_number: customer.nit,
            photo: "default.png",
            email: customer.email,
            username: customer.nit,
            password: customer.nit,
            role: mongoose.Types.ObjectId("5a046fe9627e3526802b3848"),
            token: "",
            status: "active",
        });
        listUsers.push(user)

    })

    schemas.User.insertMany(listUsers, function () { });
}