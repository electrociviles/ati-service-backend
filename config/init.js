var mongoose = require("mongoose");
var schemas = require('../db/schemas');
const fn = require('../utils/fn');

var colors = {
    yellow: "FCF338",
    blue: "124DFC",
    red: "F21711",
    green: "2DE658",
    white: "FFFFFF",
    black: "000000",
    transparent: "FFFFFF",
};


exports.DefaultCenterOfAttention = function () {
    var CenterOfAttention = schemas.CenterOfAttention;
    var list = new Array();

    var item = {
        title: req.body.name,
        valueSemiAnnual,
        valueProvisioning,
        timeSemiAnnual,
        timeProvisioning,
        description: req.body.description,
        maintenanceCost: req.body.maintenanceCost,
        expirationDateMaintenance: date,
        provisioningAlertDate: date,
        statusProvisioningAlertDate: 'pending',
        statusAlertDateMaintenance: 'pending',
        customer: mongoose.Types.ObjectId(req.body.customer),
        status: 'inactive',
    };

    list.push(item);

    CenterOfAttention.insertMany(list).then(function () {
        console.log("Data inserted")
    }).catch(function (error) {
        console.log(error)
    });
}

/** Creacion parametros **/
exports.NewItem = function () {
    var Item = schemas.Item;
    var list = new Array();
    let position = 1;


    var item = {
        // _id: mongoose.Types.ObjectId('62aca8eca778c877280ab7f9'),
        mode: 'protection_coordination',
        title: "Coordinacion de proteccion",
        description: "",
        group: 'protection_coordination',
        type: "protection_coordination",
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
        caliber: null
    };


    list.push(item);
    position++;

    Item.insertMany(list).then(function () {
        console.log("Data inserted")
    }).catch(function (error) {
        console.log(error)
    });
}
exports.NewItemFinding = function () {
    var Item = schemas.Item;
    var list = new Array();
    let position = 1;


    var item = {
        // _id: mongoose.Types.ObjectId('62aca8eca778c877280ab7f9'),
        mode: 'finding',
        title: "Verficación de corriente",
        description: "",
        group: 'verfication_corriente',
        type: "verfication_corriente",
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
        caliber: null
    };


    list.push(item);
    position++;

    Item.insertMany(list).then(function () {
        console.log("Data inserted")
    }).catch(function (error) {
        console.log(error)
    });
}
/** Creacion parametros **/
exports.CopperAluminumTable = function () {
    var CaliberTable = schemas.CaliberTable;
    var list = new Array();

    var item = {
        // _id: mongoose.Types.ObjectId('62aca8eca778c877280ab7f9'),
        caliber: '14',
        amps: 15,
        protection: 15,
        type: 'cooper'
    };
    list.push(item);

    var item = {
        // _id: mongoose.Types.ObjectId('62aca8eca778c877280ab7f9'),
        caliber: '12',
        amps: 25,
        protection: 20,
        type: 'cooper'
    };
    list.push(item);

    var item = {
        // _id: mongoose.Types.ObjectId('62aca8eca778c877280ab7f9'),
        caliber: '10',
        amps: 30,
        protection: 30,
        type: 'cooper'
    };
    list.push(item);

    var item = {
        // _id: mongoose.Types.ObjectId('62aca8eca778c877280ab7f9'),
        caliber: '8',
        amps: 50,
        protection: 40,
        type: 'cooper'
    };
    list.push(item);

    var item = {
        // _id: mongoose.Types.ObjectId('62aca8eca778c877280ab7f9'),
        caliber: '6',
        amps: 65,
        protection: 60,
        type: 'cooper'
    };
    list.push(item);

    var item = {
        // _id: mongoose.Types.ObjectId('62aca8eca778c877280ab7f9'),
        caliber: '4',
        amps: 85,
        protection: 70,
        type: 'cooper'
    };
    list.push(item);

    var item = {
        // _id: mongoose.Types.ObjectId('62aca8eca778c877280ab7f9'),
        caliber: '2',
        amps: 115,
        protection: 100,
        type: 'cooper'
    };
    list.push(item);

    var item = {
        // _id: mongoose.Types.ObjectId('62aca8eca778c877280ab7f9'),
        caliber: '1/0',
        amps: 150,
        protection: 125,
        type: 'cooper'
    };
    list.push(item);

    var item = {
        // _id: mongoose.Types.ObjectId('62aca8eca778c877280ab7f9'),
        caliber: '2/0',
        amps: 175,
        protection: 150,
        type: 'cooper'
    };
    list.push(item);

    var item = {
        // _id: mongoose.Types.ObjectId('62aca8eca778c877280ab7f9'),
        caliber: '4/0',
        amps: 230,
        protection: 230,
        type: 'cooper'
    };
    list.push(item);

    var item = {
        // _id: mongoose.Types.ObjectId('62aca8eca778c877280ab7f9'),
        caliber: '250',
        amps: 255,
        protection: 255,
        type: 'cooper'
    };
    list.push(item);

    var item = {
        // _id: mongoose.Types.ObjectId('62aca8eca778c877280ab7f9'),
        caliber: '300',
        amps: 285,
        protection: 285,
        type: 'cooper'
    };
    list.push(item);

    var item = {
        // _id: mongoose.Types.ObjectId('62aca8eca778c877280ab7f9'),
        caliber: '350',
        amps: 310,
        protection: 310,
        type: 'cooper'
    };
    list.push(item);

    var item = {
        // _id: mongoose.Types.ObjectId('62aca8eca778c877280ab7f9'),
        caliber: '400',
        amps: 335,
        protection: 335,
        type: 'cooper'
    };
    list.push(item);

    //----------------------------------------//

    var item = {
        // _id: mongoose.Types.ObjectId('62aca8eca778c877280ab7f9'),
        caliber: '14',
        amps: 14,
        protection: 14,
        type: 'aluminum'
    };
    list.push(item);

    var item = {
        // _id: mongoose.Types.ObjectId('62aca8eca778c877280ab7f9'),
        caliber: '12',
        amps: 20,
        protection: 20,
        type: 'aluminum'
    };
    list.push(item);

    var item = {
        // _id: mongoose.Types.ObjectId('62aca8eca778c877280ab7f9'),
        caliber: '10',
        amps: 30,
        protection: 30,
        type: 'aluminum'
    };
    list.push(item);

    var item = {
        // _id: mongoose.Types.ObjectId('62aca8eca778c877280ab7f9'),
        caliber: '8',
        amps: 40,
        protection: 40,
        type: 'aluminum'
    };
    list.push(item);

    var item = {
        // _id: mongoose.Types.ObjectId('62aca8eca778c877280ab7f9'),
        caliber: '6',
        amps: 40,
        protection: 40,
        type: 'aluminum'
    };
    list.push(item);

    var item = {
        // _id: mongoose.Types.ObjectId('62aca8eca778c877280ab7f9'),
        caliber: '4',
        amps: 65,
        protection: 65,
        type: 'aluminum'
    };
    list.push(item);

    var item = {
        // _id: mongoose.Types.ObjectId('62aca8eca778c877280ab7f9'),
        caliber: '2',
        amps: 90,
        protection: 90,
        type: 'aluminum'
    };
    list.push(item);

    var item = {
        // _id: mongoose.Types.ObjectId('62aca8eca778c877280ab7f9'),
        caliber: '1/0',
        amps: 120,
        protection: 120,
        type: 'aluminum'
    };
    list.push(item);

    var item = {
        // _id: mongoose.Types.ObjectId('62aca8eca778c877280ab7f9'),
        caliber: '2/0',
        amps: 135,
        protection: 135,
        type: 'aluminum'
    };
    list.push(item);

    var item = {
        // _id: mongoose.Types.ObjectId('62aca8eca778c877280ab7f9'),
        caliber: '4/0',
        amps: 180,
        protection: 180,
        type: 'aluminum'
    };
    list.push(item);

    var item = {
        // _id: mongoose.Types.ObjectId('62aca8eca778c877280ab7f9'),
        caliber: '250',
        amps: 205,
        protection: 205,
        type: 'aluminum'
    };
    list.push(item);

    var item = {
        // _id: mongoose.Types.ObjectId('62aca8eca778c877280ab7f9'),
        caliber: '300',
        amps: 230,
        protection: 230,
        type: 'aluminum'
    };
    list.push(item);

    var item = {
        // _id: mongoose.Types.ObjectId('62aca8eca778c877280ab7f9'),
        caliber: '350',
        amps: 250,
        protection: 250,
        type: 'aluminum'
    };
    list.push(item);

    var item = {
        // _id: mongoose.Types.ObjectId('62aca8eca778c877280ab7f9'),
        caliber: '400',
        amps: 270,
        protection: 270,
        type: 'aluminum'
    };
    list.push(item);


    CaliberTable.insertMany(list).then(function () {
        console.log("Data inserted")
    }).catch(function (error) {
        console.log(error)
    });
}
exports.MaintenanceType = function () {
    var MaintenanceType = schemas.MaintenanceType;
    var list = new Array();
    let position = 1;


    var item = {
        // _id: mongoose.Types.ObjectId('62aca8eca778c877280ab7f9'),
        name: 'Anual',
        value: 12,
    };
    list.push(item);

    var item = {
        // _id: mongoose.Types.ObjectId('62aca8eca778c877280ab7f9'),
        name: 'Semestral',
        value: 6,
    };
    list.push(item);

    var item = {
        // _id: mongoose.Types.ObjectId('62aca8eca778c877280ab7f9'),
        name: 'Trimestral',
        value: 3,
    };
    list.push(item);

    var item = {
        // _id: mongoose.Types.ObjectId('62aca8eca778c877280ab7f9'),
        name: 'Bimestral',
        value: 2,
    };
    list.push(item);

    position++;


    MaintenanceType.insertMany(list).then(function () {
        console.log("Data inserted")
    }).catch(function (error) {
        console.log(error)
    });
}
exports.UpdateMaintenanceSetNewItems = async function () {
    let maintenances = await schemas.Maintenance.find();
    await fn.asyncForEach(maintenances, async maintenance => {


        items = await schemas.Item.find({ mode: { $in: ['emergency_light'] } });
        await fn.asyncForEach(items, async item => {
            let itemImage = schemas.ItemImage({
                maintenance: maintenance._id,
                item: mongoose.Types.ObjectId(item._id),
                status: 'activo',
                photos: [],
                value: 0.0,
            });
            await itemImage.save();
            // emergencylight.push(itemImage);
        });
        maintenance.emergencylight = emergencylight;

        items = await schemas.Item.find({ mode: { $in: ['ups_autonomy'] } });
        await fn.asyncForEach(items, async item => {
            let itemImage = schemas.ItemImage({
                maintenance: maintenance._id,
                item: mongoose.Types.ObjectId(item._id),
                status: 'activo',
                photos: [],
                value: 0.0,
                percentBatery: 0.0,
                hour: ""
            });
            await itemImage.save();
            // upsAutonomy.push(itemImage);
        });
        maintenance.upsAutonomy = upsAutonomy;


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
exports.createMaintenance = function () {

    var maintenance = new schemas.Maintenance.Maintenance({
        name: 'Mantenimineto Eléctrico Exito',
        type: 'tri',
        customer: mongoose.Types.ObjectId("6205505db6cd35211920a7a8"),
    });
    maintenance.save();
};
exports.createRole = function () {
    var list = new Array()
    var role = new schemas.Role({
        _id: mongoose.Types.ObjectId('5a046fe9627e3526802b3847'),
        tag: "administrator",
        name: "Administrador",
        administrative: true,
        status: 'active',
    })
    list.push(role)

    var role = new schemas.Role({
        _id: mongoose.Types.ObjectId('62c82ad211bb482f497b3f11'),
        tag: "ati",
        name: "Técnico",
        administrative: true,
        status: 'active',
    })
    list.push(role)

    var role = new schemas.Role({
        _id: mongoose.Types.ObjectId('62b790f10f44460f0c2922e2'),
        name: "Responsable de obra",
        tag: "construction_manager",
        administrative: true,
        status: 'active',
    })
    list.push(role)

    var role = new schemas.Role({
        _id: mongoose.Types.ObjectId('62b790f10f44460f0c2922e3'),
        name: "Responble de mantenimiento",
        tag: "maintenance_manager",
        administrative: true,
        status: 'active',
    })
    list.push(role)


    var role = new schemas.Role({
        _id: mongoose.Types.ObjectId('62b790f10f44460f0c2922e5'),
        name: "Permanentes",
        tag: "permanent",
        administrative: true,
        status: 'active',
    })
    list.push(role)

    var role = new schemas.Role({
        _id: mongoose.Types.ObjectId('62b790f10f44460f0c2922e6'),
        name: "Oset",
        tag: "oset",
        administrative: true,
        status: 'active',
    })
    list.push(role)


    schemas.Role.insertMany(list, function () { });

}
exports.setItemImagesToDefault = async function () {
    let itemImages = await schemas.ItemImage.find()
    console.log(itemImages)
    itemImages.forEach(itemImage => {
        let newPhotos = itemImage.photos.map(photo => {
            photo.url = "default.png"
            return photo
        });
        schemas.ItemImage.updateOne({ "_id": mongoose.Types.ObjectId(itemImage._id) }, {
            $set: {
                photos: newPhotos
            }
        }, {
            multi: true
        }).exec();
    });
}
exports.setItemBoardToDefault = async function () {
    let itemsBoards = await schemas.ItemBoard.find()
    itemsBoards.forEach(itemsBoard => {
        let newPhotos = itemsBoard.photos.map(photo => {
            photo.url = "default.png"
            return photo
        });
        schemas.ItemBoard.updateOne({ "_id": mongoose.Types.ObjectId(itemsBoard._id) }, {
            $set: {
                photos: newPhotos
            }
        }, {
            multi: true
        }).exec();
    });
}
exports.addItemBoard1 = async function () {
    let boards = await schemas.Board.find()
    await fn.asyncForEach(boards, async board => {
        let itemBoard = schemas.ItemBoard({
            board: board._id,
            item: mongoose.Types.ObjectId('63133cafcb13afaeafb18a29'),
            status: 'activo',
            photos: [],
            percentBatery: 0.0,
            value: 0.0,
            caliber: null,
            line_per_phase: 0,

        });
        await itemBoard.save();
        await schemas.Board.updateOne({ "_id": mongoose.Types.ObjectId(board._id) }, {
            $push: {
                itemsBoards: itemBoard._id
            }
        }, {
            multi: true
        }).exec();
    });
}
exports.addItemBoard2 = async function () {
    let boards = await schemas.Board.find()
    await fn.asyncForEach(boards, async board => {
        let itemBoard = schemas.ItemBoard({
            board: board._id,
            item: mongoose.Types.ObjectId('63133cafcb13afaeafb18a28'),
            status: 'activo',
            photos: [],
            percentBatery: 0.0,
            value: 0.0,
            caliber: null,
            line_per_phase: 0,

        });
        await itemBoard.save();
        await schemas.Board.updateOne({ "_id": mongoose.Types.ObjectId(board._id) }, {
            $push: {
                itemsBoards: itemBoard._id
            }
        }, {
            multi: true
        }).exec();
    });
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
exports.createMenuWeb = () => {

    var menu = new schemas.Menu({
        type: 'web',
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
    var maintenances = new schemas.Page({
        title: 'Mantenimientos',
        href: '/maintenances',
        icon: 'VscProject',
        isParent: false,
        children: [],
        roles: ['5a046fe9627e3526802b3847']
    })
    listPage.push(maintenances)
    menu.pages.push(maintenances)


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
    menu.pages.push(reports)


    var reports01 = new schemas.Page({
        title: 'Atenciones',
        href: '/reports/attentions',
        icon: 'RiFileList3Line',
        isParent: false,
        roles: ['5a046fe9627e3526802b3847']
    })
    listPage.push(reports01)

    var reports02 = new schemas.Page({
        title: 'Solicitudes',
        href: '/reports/requests',
        icon: 'TbReportSearch',
        isParent: false,
        roles: ['5a046fe9627e3526802b3847']
    })
    listPage.push(reports02)

    var reports03 = new schemas.Page({
        title: 'Mantenimientos',
        href: '/reports/maintenances',
        icon: 'HiDocumentReport',
        isParent: false,
        roles: ['5a046fe9627e3526802b3847']
    })
    listPage.push(reports03)

    reports.children.push(reports01._id)
    reports.children.push(reports02._id)
    reports.children.push(reports03._id)


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

    var clientes = new schemas.Page({
        title: 'Clientes',
        href: '/customers',
        icon: 'RiUserSettingsLine',
        isParent: false,
        roles: ['5a046fe9627e3526802b3847']
    })
    listPage.push(clientes)

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

    var calibers = new schemas.Page({
        title: 'Calibres',
        href: '/setting/calibers',
        icon: 'FcCableRelease',
        isParent: false,
        roles: ['5a046fe9627e3526802b3847']
    })
    listPage.push(calibers)


    pageAjustes.children.push(usuarios._id)
    pageAjustes.children.push(clientes._id)
    pageAjustes.children.push(roles._id)
    pageAjustes.children.push(asignarRoles._id)
    pageAjustes.children.push(calibers._id)

    menu.save()

    schemas.Page.insertMany(listPage).then(function () {
        console.log("Data inserted")
    }).catch(function (error) {
        console.log(error)
    });

}
exports.createMenuMobile = () => {

    var menu = new schemas.Menu({
        type: 'mobile',
        title: '',
        pages: []
    })

    var listPage = new Array()

    /** Solicitudes */
    var requests = new schemas.Page({
        title: 'Solicitudes',
        href: 'requests',
        icon: 'RiCustomerService2Fill',
        isParent: false,
        backgroundColor: 'e4254e',
        iconColor: "FFFFFF",
        textColor: "FFFFFF",
        children: [],
        roles: ['5a046fe9627e3526802b3847']
    })
    listPage.push(requests)
    menu.pages.push(requests)

    /** Manteniminentos */
    var maintenances = new schemas.Page({
        title: 'Mantenimientos',
        href: 'maintenances',
        icon: 'RiCustomerService2Fill',
        isParent: false,
        backgroundColor: 'b663a4',
        iconColor: "FFFFFF",
        textColor: "FFFFFF",
        children: [],
        roles: ['5a046fe9627e3526802b3847']
    })
    listPage.push(maintenances)
    menu.pages.push(maintenances)

    /** Manteniminentos */
    var attention = new schemas.Page({
        title: 'Atenciones',
        href: 'attentions',
        icon: 'RiCustomerService2Fill',
        isParent: false,
        backgroundColor: '676d74',
        iconColor: "FFFFFF",
        textColor: "FFFFFF",
        children: [],
        roles: ['5a046fe9627e3526802b3847']
    })
    listPage.push(attention)
    menu.pages.push(attention)

    /** Reportes de mantenimientos */
    var maintenancesReport = new schemas.Page({
        title: 'Reporte de mantenimientos',
        href: 'maintenances-reports',
        icon: 'VscProject',
        isParent: false,
        backgroundColor: 'edb933',
        iconColor: "FFFFFF",
        textColor: "FFFFFF",
        children: [],
        roles: ['5a046fe9627e3526802b3847']
    })
    listPage.push(maintenancesReport)
    menu.pages.push(maintenancesReport)


    /** Reportes de solicitudes */
    var requestsReport = new schemas.Page({
        title: 'Reporte de solicitudes',
        href: 'requests-reports',
        icon: 'VscProject',
        isParent: false,
        backgroundColor: '7fa6ff',
        iconColor: "FFFFFF",
        textColor: "FFFFFF",
        children: [],
        roles: ['5a046fe9627e3526802b3847']
    })
    listPage.push(requestsReport)
    menu.pages.push(requestsReport)

    /** Reportes de solicitudes */
    var attentionsReports = new schemas.Page({
        title: 'Reporte de atenciones',
        href: 'attentions-reports',
        icon: 'VscProject',
        isParent: false,
        backgroundColor: 'ffb135',
        iconColor: "FFFFFF",
        textColor: "FFFFFF",
        children: [],
        roles: ['5a046fe9627e3526802b3847']
    })
    listPage.push(attentionsReports)
    menu.pages.push(attentionsReports)


    /** Reportes de solicitudes */
    var attentionsReports = new schemas.Page({
        title: 'Mi cuenta',
        href: 'account',
        icon: 'VscProject',
        isParent: false,
        backgroundColor: '86dccc',
        iconColor: "FFFFFF",
        textColor: "FFFFFF",
        children: [],
        roles: ['5a046fe9627e3526802b3847']
    })
    listPage.push(attentionsReports)
    menu.pages.push(attentionsReports)
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
        tag: "emergency",
    });
    list.push(attentionType)

    var attentionType = new AttentionType({
        type: 'Programada',
        status: 'active',
        tag: "scheduled",
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
exports.createRequestType = function () {

    var list = new Array()

    var RequestType = schemas.RequestType;
    var requestType = new RequestType({
        type: 'Emergencia',
        status: 'active',
        tag: "emergency",
    });
    list.push(requestType)

    var requestType = new RequestType({
        type: 'Programada',
        status: 'active',
        tag: "scheduled",
    });
    list.push(requestType)

    schemas.RequestType.insertMany(list, function () { });
}