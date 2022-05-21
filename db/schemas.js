var mongoose = require("mongoose");
var config = require('./../config')
require('mongoose-double')(mongoose);

mongoose.Promise = global.Promise

console.log(config);
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
    nit: String
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
    token: String,
    status: String,
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

var ProjectSchema = new mongoose.Schema({
    name: String,
    type: String,
    observation: String,
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
    boards: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Board' }],
    aroundItems: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Item_Image' }],
    outletSampling: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Item_Image' }],
});
var Project = mongoose.model('Project', ProjectSchema);


var ItemImageSchema = new mongoose.Schema({
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
    item: { type: mongoose.Schema.Types.ObjectId, ref: 'Item' },
    photos: [],
    status: String,
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
    status: String,
    observations: String,
    title: String,
    value: mongoose.Schema.Types.Double,
});
var ItemBoard = mongoose.model('Item_Board', ItemBoardSchema);

var BoardSchema = new mongoose.Schema({
    name: String,
    type: String,
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
    itemsBoards: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Item_Board' }],
    status: String,
    observation: String,
});
var Board = mongoose.model('Board', BoardSchema);


var AttentionSchema = new mongoose.Schema({
    attentionItems: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Item_Image' }],
    title: String,
    description: String,
    signature: String,
    status: String,
    names: String,
    document: String,
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
    presave: Boolean,
});
var Attention = mongoose.model('Attention', AttentionSchema);

const MenuSchema = new mongoose.Schema({
    title: String,
    pages: [{ type: mongoose.Schema.Types.ObjectId, ref: 'page', autopopulate: true }],
});
const Menu = mongoose.model('menu', MenuSchema);
MenuSchema.plugin(require('mongoose-autopopulate'));

const PageSchema = new mongoose.Schema({
    title: String,
    href: String,
    icon: String,
    roles: [],
    isParent: Boolean,
    children: [{ type: mongoose.Schema.Types.ObjectId, ref: 'page', autopopulate: true }]
});
const Page = mongoose.model('page', PageSchema);
PageSchema.plugin(require('mongoose-autopopulate'));

const RoleSchema = new mongoose.Schema({
    name: String,
    status: String,
    administrative: Boolean
})
const Role = mongoose.model('role', RoleSchema)

const CenterOfAttentionSchema = new mongoose.Schema({
    title: String,
    description: String,
    status: String,
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
    maintenances: [{ type: mongoose.Schema.Types.ObjectId, ref: 'maintenance' }],
})
const CenterOfAttention = mongoose.model('centerOfAttention', CenterOfAttentionSchema)

const MaintenanceSchema = new mongoose.Schema({
    type: String,
    description: String,
    expirationDateMaintenance: Date,
    statusExpirationDateMaintenance: String,
    maintenanceCost: mongoose.Schema.Types.Double,
    provisioningAlertDate: Date,
    statusProvisioningAlertDate: String,
})
const Maintenance = mongoose.model('maintenance', MaintenanceSchema)

const ConfigurationSchema = new mongoose.Schema({
    title: String,
    key: String,
    value: String,
})
const Configuration = mongoose.model('configuration', ConfigurationSchema)


var schemas =
{
    Customer,
    Board,
    Project,
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
    Maintenance,
};
module.exports = schemas;