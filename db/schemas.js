var mongoose = require("mongoose");
var config = require('./../config')
require('mongoose-double')(mongoose);

mongoose.Promise = global.Promise
mongoose.set('debug', false);

if (process.env.NODE_ENV == 'production') {
    mongoose.connect(config.db.url, {
        'auth': { 'authSource': 'admin' },
        'user': config.db.user,
        'pass': config.db.pass,
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
}
else {
    mongoose.connect(config.db.url, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
}

const bcrypt = require("bcrypt");

var CustomerSchema = new mongoose.Schema({
    name: String,
    address: String,
    email: String,
    phone: String,
    nit: String,
    users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    centersOfAttention: [{ type: mongoose.Schema.Types.ObjectId, ref: 'center_of_attention' }],

});
var Customer = mongoose.model('Customer', CustomerSchema);

var UserSchema = new mongoose.Schema({
    name: String,
    document_number: String,
    photo: String,
    email: String,
    username: String,
    password: String,
    role: { type: mongoose.Schema.Types.ObjectId, ref: 'role' },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
    centerOfAttention: { type: mongoose.Schema.Types.ObjectId, ref: 'center_of_attention' },
    token: String,
    refreshToken: String,
    tokenFCM: String,
    status: String,
    phone: String,
});
UserSchema.pre('save', async function (next) {

    var user = this;
    if (!this.isModified('password')) {
        return next();
    }

    try {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
        return next();
    } catch (e) {
        return next(e);
    }
});

var User = mongoose.model('User', UserSchema);

var MaintenanceSchema = new mongoose.Schema({
    name: String,
    type: String,
    observation: String,
    date: Date,
    downloaded: Boolean,
    price: Number,
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
    boards: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Board' }],
    aroundItems: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Item_Image' }],
    outletSampling: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Item_Image' }],
    emergencylight: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Item_Image' }],
    upsAutonomy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Item_Image' }],
    centerOfAttention: { type: mongoose.Schema.Types.ObjectId, ref: 'center_of_attention' },
    status: String,
    statusPayment: String

});
var Maintenance = mongoose.model('Maintenance', MaintenanceSchema);


var ItemImageSchema = new mongoose.Schema({
    maintenance: { type: mongoose.Schema.Types.ObjectId, ref: 'Maintenance' },
    item: { type: mongoose.Schema.Types.ObjectId, ref: 'Item' },
    photos: [],
    hasHour: Boolean,
    hour: String,
    percentBatery: mongoose.Schema.Types.Double,
    status: String,
    date: String,
    value: mongoose.Schema.Types.Double,
});
var ItemImage = mongoose.model('Item_Image', ItemImageSchema);

var ItemSchema = new mongoose.Schema({
    mode: String,
    title: String,
    description: String,
    group: String,
    type: String,
    gallery: Boolean,
    hasValue: Boolean,
    placeHolder: String,
    letterOne: String,
    position: Number,
    letterTwo: String,
    colorOne: String,
    colorTwo: String,
    textColor: String,
    textColorOne: String,
    textColorTwo: String,
});
var Item = mongoose.model('Item', ItemSchema);

var ItemBoardSchema = new mongoose.Schema({
    board: { type: mongoose.Schema.Types.ObjectId, ref: 'Board' },
    item: { type: mongoose.Schema.Types.ObjectId, ref: 'Item' },
    photos: [],
    date: String,
    status: String,
    observations: String,
    title: String,
    value: mongoose.Schema.Types.Double,
    percentBatery: mongoose.Schema.Types.Double,
    status: String,
});
var ItemBoard = mongoose.model('Item_Board', ItemBoardSchema);

var BoardSchema = new mongoose.Schema({
    name: String,
    type: String,
    maintenance: { type: mongoose.Schema.Types.ObjectId, ref: 'Maintenance' },
    itemsBoards: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Item_Board' }],
    status: String,
    observation: String,
});
var Board = mongoose.model('Board', BoardSchema);

const AttentionTypeSchema = new mongoose.Schema({
    type: String,
    tag: String,
    status: String,
})
const AttentionType = mongoose.model('attention_type', AttentionTypeSchema)

const AttentionDescriptionSchema = new mongoose.Schema({
    description: String,
    statusSend: String,
    date: Date,
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
})
const AttentionDescription = mongoose.model('attention_description', AttentionDescriptionSchema)

var AttentionSchema = new mongoose.Schema({
    number: Number,
    attentionItems: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Item_Image' }],
    title: String,
    description: String,
    signature: String,
    status: String,
    names: String,
    document: String,
    statusSend: String,
    file: String,
    date: Date,
    subTotal: mongoose.Schema.Types.Double,
    administracion: mongoose.Schema.Types.Double,
    imprevistos: mongoose.Schema.Types.Double,
    utilidad: mongoose.Schema.Types.Double,
    ivaSobreUtilidad: mongoose.Schema.Types.Double,
    total: mongoose.Schema.Types.Double,
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
    creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    attentionType: { type: mongoose.Schema.Types.ObjectId, ref: 'attention_type' },
    centerOfAttention: { type: mongoose.Schema.Types.ObjectId, ref: 'center_of_attention' },
    descriptions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'attention_description' }],

    presave: Boolean,
});
var Attention = mongoose.model('Attention', AttentionSchema);

const MenuSchema = new mongoose.Schema({
    title: String,
    type: String,
    pages: [{ type: mongoose.Schema.Types.ObjectId, ref: 'page', autopopulate: true }],
});
const Menu = mongoose.model('menu', MenuSchema);
MenuSchema.plugin(require('mongoose-autopopulate'));

const PageSchema = new mongoose.Schema({
    title: String,
    href: String,
    icon: String,
    backgroundColor: String,
    iconColor: String,
    textColor: String,
    roles: [],
    isParent: Boolean,
    children: [{ type: mongoose.Schema.Types.ObjectId, ref: 'page', autopopulate: true }]
});
const Page = mongoose.model('page', PageSchema);
PageSchema.plugin(require('mongoose-autopopulate'));

const RoleSchema = new mongoose.Schema({
    name: String,
    status: String,
    tag: String,
    administrative: Boolean,
})
const Role = mongoose.model('role', RoleSchema)

const RequestTypeSchema = new mongoose.Schema({
    type: String,
    tag: String,
    status: String,
})
const RequestType = mongoose.model('request_type', RequestTypeSchema)

const RequestDescriptionSchema = new mongoose.Schema({
    description: String,
    status: String,
    date: Date,
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
})
const RequestDescription = mongoose.model('request_description', RequestDescriptionSchema)

const RequestSchema = new mongoose.Schema({
    number: Number,
    description: String,
    request_type: { type: mongoose.Schema.Types.ObjectId, ref: 'request_type' },
    centerOfAttention: { type: mongoose.Schema.Types.ObjectId, ref: 'center_of_attention' },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
    descriptions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'request_description' }],
    date: Date,
    status: String
})
const Request = mongoose.model('request', RequestSchema)


const CenterOfAttentionSchema = new mongoose.Schema({
    title: String,
    description: String,
    status: String,
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
    users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    maintenanceCost: mongoose.Schema.Types.Double,
    valueSemiAnnual: Number,
    timeSemiAnnual: String,
    valueProvisioning: Number,
    timeProvisioning: String,
    expirationDateMaintenance: Date,
    statusExpirationDateMaintenance: String,
    provisioningAlertDate: Date,
    statusProvisioningAlertDate: String,
})
const CenterOfAttention = mongoose.model('center_of_attention', CenterOfAttentionSchema)


const ConfigurationSchema = new mongoose.Schema({
    title: String,
    key: String,
    value: String,
})
const Configuration = mongoose.model('configuration', ConfigurationSchema)


var schemas = {
    Customer,
    Board,
    Maintenance,
    Item,
    ItemBoard,
    User,
    Attention,
    ItemImage,
    Menu,
    Page,
    Role,
    CenterOfAttention,
    Configuration,
    AttentionType,
    AttentionDescription,
    RequestType,
    Request,
    RequestDescription
};
module.exports = schemas;