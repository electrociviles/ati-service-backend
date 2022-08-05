var express = require('express');
var router = express.Router();
var multer = require('multer')
var fs = require('fs');
var upload = multer({ dest: './uploads/' })
var fn = require("./../utils/fn");
var schemas = require("./../db/schemas");
const bcrypt = require("bcrypt");
// const authMiddleware = require("../middleware/auth");
var mongoose = require('mongoose');
const config = require('./../config')
const axios = require('axios').default;
const authMiddleware = require("./../middleware/auth");
const notification = require('./../utils/notification');
const moment = require('moment');
moment.locale('es');
const jwt_decode = require("jwt-decode");
const { log } = require('console');
var excel = require('excel4node');

router.post('/', (req, res, next) => {
  res.json({ status: 'respond with a resource' });
});

router.post('/login', async (req, res, next) => {

  let user = await schemas.User.findOne({ 'username': req.body.username })
    .populate({ path: "role" })
  if (user) {
    let result = bcrypt.compareSync(req.body.password, user.password);
    let token = fn.createToken(user, process.env.SECRET, config.tokenLife);
    let refreshToken = fn.createRefreshToken(user, process.env.SECRET, config.refreshTokenLife);

    schemas.User.updateOne({ "_id": mongoose.Types.ObjectId(user._id) }, {
      $set: {
        refreshToken,
      }
    }, {
      upsert: true
    }).exec();

    if (result) {
      res.json({ status: 'success', token, refreshToken });
    } else {
      res.json({ status: 'error', message: 'Contraseña incorrecta' });
    }
  } else {
    res.json({ status: 'error', message: 'Usuario no encontrado' });
  }
})

router.post('/refreshToken', async (req, res) => {
  const { refreshToken } = req.body

  let _user = jwt_decode(refreshToken)

  let user = await schemas.User.findById(_user.id)
    .populate({ path: "role" })


  if (refreshToken && user) {
    let token = fn.createToken(user, process.env.SECRET, config.tokenLife);
    res.status(200).json({ token });
  } else {
    res.status(404).send('Invalid request')
  }
})

router.post('/getMenuByRole', async (req, res) => {

  let { role, type } = req.body;

  console.log(req.body)

  var list = []
  let menus = await schemas.Menu.findOne({ type }).populate({
    path: 'pages',
    populate: [{
      path: "roles",
    }],
    populate: [{
      path: "children",
    }]
  })


  for (let i = 0; i < menus.pages.length; i++) {
    if (menus.pages[i].roles.includes(role)) {
      let children = fn.getChildrens(role, menus.pages[i])
      var obj =
      {
        title: menus.pages[i].title,
        href: menus.pages[i].href,
        icon: menus.pages[i].icon,
        backgroundColor: menus.pages[i].backgroundColor,
        iconColor: menus.pages[i].iconColor,
        textColor: menus.pages[i].textColor,
        children: children
      }
      list.push(obj)
    }
  }
  let m = [
    {
      "pages": list
    }
  ]
  res.json({ status: 'success', menus: m });
});

router.post('/getMenu', async (req, res) => {

  let { type } = req.body
  let menus = await schemas.Menu.findOne({ type }).populate({
    path: 'pages',
    populate: [{
      path: "roles",
    }],
    populate: [{
      path: "children",
    }]
  })

  res.json({ status: 'success', menus });
});

router.post('/listMaintenances', authMiddleware, async (req, res) => {

  let { start, end } = req.body;
  let queryCount = schemas.Maintenance.countDocuments({ status: 'active' });
  var query = schemas.Maintenance.find({ status: 'active' }).populate({
    path: 'boards',
    populate: [{
      path: "itemsBoards",
      populate: [{
        path: "item"
      }]
    }]
  }).populate({
    path: 'customer'
  }).populate({
    path: 'creator'
  }).populate({
    path: 'aroundItems',
    populate: [{
      path: "item"
    }]
  }).populate({
    path: 'outletSampling',
    populate: [{
      path: "item"
    }]
  }).populate({
    path: 'emergencylight',
    populate: [{
      path: "item"
    }]
  }).populate({
    path: 'upsAutonomy',
    populate: [{
      path: "item"
    }]
  }).sort({ '_id': -1 });

  if (req.body.paginate) {
    query.skip(start)
      .limit(end);
  }

  let currentUser = await schemas.User.findById(req.currentUser.id);
  let allowedRole = true;


  console.log("req.currentUser.role.tag    ", req.currentUser.role.tag)
  switch (req.currentUser.role.tag) {
    case "administrator":
    case "technical":
    case "ati":

      break;
    default:
      if (currentUser.customer) {
        query.where('customer').equals(mongoose.Types.ObjectId(currentUser.customer))
        queryCount.where('customer').equals(mongoose.Types.ObjectId(currentUser.customer))
      } else {
        allowedRole = false;
      }
      break;
  }

  if (req.body.search) {
    query.where('name').equals(new RegExp(req.body.search, "i"));
    queryCount.where('name').equals(new RegExp(req.body.search, "i"));
  }
  if (req.body.source == "web") {
    query.where('downloaded').equals(false);
    queryCount.where('downloaded').equals(false);
  }
  if (req.body.downloaded) {
    query.where('downloaded').equals(true);
    queryCount.where('downloaded').equals(true);
  }

  if (allowedRole) {
    let maintenances = await query.exec();
    let count = await queryCount.exec();
    res.json({ status: 'success', maintenances, count });
  } else {
    res.json({ status: 'success', maintenances: [], count: 0 });
  }
});

router.post('/getAttention', authMiddleware, async (req, res) => {

  let query = schemas.Attention.findById(mongoose.Types.ObjectId(req.body.id)).populate({
    path: 'attentionItems',
    populate: [{
      path: "item"
    }]
  }).populate({
    path: 'customer',
  }).populate({
    path: 'attentionType',
  });

  let attention = await query.exec();
  res.json({ status: 'success', attention });
});

router.post('/listAttentions', authMiddleware, async (req, res) => {
  let { start, end } = req.body;
  let currentUser = await schemas.User.findById(req.currentUser.id);
  let allowedRole = true;

  let queryCount = schemas.Attention.countDocuments({ status: 'created' });
  let query = schemas.Attention.find({ status: 'created' }).populate({
    path: 'attentionItems',
    populate: [{
      path: "item"
    }]
  }).populate({
    path: 'customer',
  }).populate({
    path: 'creator',
  }).populate({
    path: 'attentionType',
  }).populate({
    path: 'centerOfAttention',
  }).populate({
    path: 'descriptions',
    populate: [{
      path: "customer"
    }]
  }).sort({ '_id': -1 });



  switch (req.currentUser.role.tag) {
    case "administrator":
    case "ati":

      break;
    case "construction_manager":
    case "maintenance_manager":
      query.where('customer').equals(mongoose.Types.ObjectId(currentUser.customer))
      queryCount.where('customer').equals(mongoose.Types.ObjectId(currentUser.customer))
      break;
    case "oset":
    case "permanent":
    case "technical":
      query.where('creator').equals(mongoose.Types.ObjectId(currentUser._id))
      queryCount.where('creator').equals(mongoose.Types.ObjectId(currentUser._id))
      break;
    default:
      allowedRole = false;
  }

  if (req.body.paginate) {
    query.skip(start)
      .limit(end);
  }


  if (req.body.search) {
    query.where('description').equals(new RegExp(req.body.search, "i"));
  }
  let attentions = await query.exec();
  let count = await schemas.Attention.countDocuments();
  res.json({ status: 'success', attentions, count });
});

router.post('/getAttention', async (req, res) => {

  let attention = await schemas.Attention.findById(mongoose.Types.ObjectId(req.body.attention)).populate({
    path: 'customer',
  }).exec();

  res.json({ status: 'success', attention });
});

router.post('/testNotificationFCM', async (req, res) => {

  let { data, tokenFCM } = req.body;
  let registration_ids = [tokenFCM];
  notification.sendNotification(registration_ids, 'Test', `Esto es una prueba`, data);


  res.json({ status: 'success' });
});

router.post('/requestTypes', async (req, res) => {

  let requestTypes = await schemas.RequestType.find().exec();
  res.json({ status: 'success', requestTypes });
});

router.post('/listMaintenancesType', async (req, res) => {

  let maintenancesType = await schemas.MaintenanceType.find();
  res.json({ status: 'success', maintenancesType });
});

router.post('/createRequest', upload.any("files"), authMiddleware, async (req, res) => {

  let currentUser = await schemas.User.findById(req.currentUser.id);

  let { description, requestType, centerOfAttention, customer } = req.body;

  if (req.body.centerOfAttention) {
    centerOfAttention = mongoose.Types.ObjectId(req.body.centerOfAttention);
  } else {
    centerOfAttention = null;
  }
  if (centerOfAttention != null) {
    let incomeCustomer = null;
    if (customer) {
      incomeCustomer = mongoose.Types.ObjectId(customer);
    } else {
      incomeCustomer = mongoose.Types.ObjectId(currentUser.customer);
    }

    var requestDescription = schemas.RequestDescription({
      description: "Enviado",
      status: "created",
      date: new Date(),
      user: mongoose.Types.ObjectId(req.currentUser.id),
    })
    requestDescription.save();

    let count = await schemas.Request.countDocuments();

    try {
      let request = new schemas.Request({
        number: count + 1,
        description,
        request_type: mongoose.Types.ObjectId(requestType),
        centerOfAttention,
        customer: incomeCustomer,
        date: new Date(),
        status: "created",
        user: mongoose.Types.ObjectId(req.currentUser.id),
        descriptions: [requestDescription._id]
      });
      await request.save();

      request = await schemas.Request.findById(request._id)
        .populate("request_type")
        .populate({
          path: "user",
          populate: [
            { path: 'role' }
          ]
        })
        .populate("centerOfAttention")


      let tokensFCM = await fn.getTokenFCMAdmins()
      if (tokensFCM) {
        notification.sendNotification(tokensFCM, 'Alerta de solicitud', `Se ha creado una solicitud`, {});
      }

      res.json({ status: 'success', request, message: "Solicitud registrada exitosamente" });
    } catch (error) {
      console.log(error)
      res.json({ status: 'error', message: error });

    }
  } else {
    res.json({ status: 'error', message: "Debe seleccionar un centro de atención" });
  }
});

router.post('/getRequest', upload.any("files"), authMiddleware, async (req, res) => {
  try {
    let request = await schemas.Request.findById(req.body.id)
      .populate("request_type")
      .populate("user")
      .populate("centerOfAttention")

    res.json({ status: 'success', request, message: "Success" });
  } catch (error) {
    console.log(error)
    res.json({ status: 'error', message: error });

  }
});

router.post('/updateRequest', upload.any("files"), authMiddleware, async (req, res) => {

  let { id, description, requestType } = req.body;

  let request = await schemas.Request.findById(mongoose.Types.ObjectId(id));

  if (request.status == "created") {
    if (req.body.centerOfAttention) {
      centerOfAttention = mongoose.Types.ObjectId(req.body.centerOfAttention);
    } else {
      centerOfAttention = null;
    }

    schemas.Request.updateOne({ "_id": mongoose.Types.ObjectId(id) }, {
      $set: {
        description: description,
        request_type: mongoose.Types.ObjectId(requestType),
        centerOfAttention,
      }
    }, {
      upsert: true
    }).exec();
    res.json({ status: 'success', message: "Solicitud actualizada exitosamente" })

  } else {
    res.json({ status: 'error', message: "No se puede actualizar la solicitud porque no se encuentra abierta" })
  }
})

router.post('/listRequests', authMiddleware, async (req, res) => {
  console.log(req.body)
  let allowedRole = true;
  let currentUser = await schemas.User.findById(req.currentUser.id);

  var query = schemas.Request.find()
    .select()
    .populate("request_type")
    .populate("user")
    .populate("centerOfAttention")
    .populate("customer")
    .sort({ '_id': -1 })
  let queryCount = schemas.Request.countDocuments();

  switch (req.currentUser.role.tag) {
    case "administrator":
    case "ati":

      break;
    case "construction_manager":
    case "maintenance_manager":
      query.where('customer').equals(mongoose.Types.ObjectId(currentUser.customer))
      queryCount.where('customer').equals(mongoose.Types.ObjectId(currentUser.customer))
      break;
    case "oset":
    case "permanent":
      query.where('user').equals(mongoose.Types.ObjectId(currentUser._id))
      queryCount.where('user').equals(mongoose.Types.ObjectId(currentUser._id))
      break;
    default:
      allowedRole = false;

  }
  if (!allowedRole)
    res.json({ status: 'success', requests: [], message: "Success" });
  else {
    let requests = await query.exec();
    res.json({ status: 'success', requests, message: "Success" });
  }
})

router.post('/listCustomers', authMiddleware, async (req, res) => {


  let { start, end, paginate, search, encargado, user, customer } = req.body;
  let currentUser = await schemas.User.findById(req.currentUser.id);
  var query = schemas.Customer.find();
  let queryCount = schemas.Customer.countDocuments();

  // if (encargado && user) {}}
  //   let usrEncargado = await schemas.User.findById(mongoose.Types.ObjectId(user));
  //   query.where('_id').equals(mongoose.Types.ObjectId(usrEncargado.customer));
  // }
  // if (search) {
  //   query.where('name').equals(new RegExp(search, "i"));
  // }
  // if (customer) {
  //   query.where('_id').equals(mongoose.Types.ObjectId(customer));
  // }


  switch (req.currentUser.role.tag) {
    case "administrator":
    case "ati":

      break;
    case "oset":
    case "permanent":
    case "construction_manager":
    case "maintenance_manager":
      query.where('_id').equals(mongoose.Types.ObjectId(currentUser.customer))
      // queryCount.where('_id').equals(mongoose.Types.ObjectId(currentUser.customer))
      break;

  }

  query.populate({
    path: "users",
    populate: [{ path: "role" }]
  })
  query.populate({
    path: "maintenanceType",
  })
  if (paginate) {
    query.skip(start)
      .limit(end);
  }

  let customers = await query.exec();


  let count = await schemas.Customer.countDocuments();
  res.json({ status: 'success', customers, count });
});

router.post('/listBoards', async (req, res) => {

  var query = schemas.Board.find().sort({ '_id': 1 })
  if (req.body.maintenance) {
    query.where('maintenance').equals(mongoose.Types.ObjectId(req.body.maintenance));
  }
  let boards = await query.exec();
  res.json({ status: 'success', boards });
});

router.post('/updatedBoard', async (req, res) => {
  items = await schemas.Item.find({ mode: { $in: ['finding'] }, })

  await fn.asyncForEach(items, async (item) => {
    let itemBoard = schemas.ItemBoard({
      board: mongoose.Types.ObjectId(req.body.board),
      item: mongoose.Types.ObjectId(item._id),
      status: 'activo',
      photos: [],
      value: 0.0,
      date: new Date()
    });
    await itemBoard.save();

    schemas.Board.updateOne({ _id: mongoose.Types.ObjectId(req.body.board) }, {
      $push: { itemsBoards: itemBoard }
    }, {
      multi: true
    }).exec();
  });

  res.json({ status: 'success' });

})

router.post('/updateAttentionWeb', upload.any("files"), authMiddleware, async (req, res) => {


  let { id, name, description } = req.body

  schemas.Attention.updateOne({ "_id": mongoose.Types.ObjectId(id) }, {
    $set: { title: name, description }
  }, {
    upsert: true
  }).exec();


  res.json({ status: 'success', message: "Atención actualizada exitosamente" })

})

router.post('/updateAdditionalInformationAttention', upload.any("files"), authMiddleware, async (req, res) => {

  try {

    let text = "";
    let status = "";
    if (req.body.action == "create") {
      text = "Enviado al cliente";
      status = "send";
    } else if (req.body.action == "update") {
      text = "Reenviado al cliente";
      status = "resend";
    }

    var attentionDescription = schemas.AttentionDescription({
      description: text,
      statusSend: status,
      date: new Date(),
      user: mongoose.Types.ObjectId(req.currentUser.id),
    });

    attentionDescription.save();
    let fileName = "";

    await fn.asyncForEach(req.files, async (file) => {
      fileName = "attention_" + fn.makedId(10) + "." + fn.fileExtension(file.originalname)
      let src = await fs.createReadStream(file.path);
      let dest = await fs.createWriteStream('./pdf/' + fileName);
      src.pipe(dest);
      src.on('end', async () => {
        fs.unlinkSync(file.path);

      });
      src.on('error', (err) => {
        console.log(err);
        res.json({ status: 'error' });
      });
    });

    schemas.Attention.updateOne({ _id: mongoose.Types.ObjectId(req.body.id) }, {
      $set: {
        subTotal: parseFloat(req.body.subtotal),
        administracion: parseFloat(req.body.administracion),
        imprevistos: parseFloat(req.body.imprevistos),
        utilidad: parseFloat(req.body.utilidad),
        ivaSobreUtilidad: parseFloat(req.body.ivaSobreUtilidad),
        total: parseFloat(req.body.total),
        statusSend: status,
        file: fileName
      },
      $push: { "descriptions": attentionDescription._id },
    }, {
      multi: true
    }).exec(async () => {
      let attention = await schemas.Attention.findById(req.body.id).populate({
        path: 'attentionItems',
        populate: [{
          path: "item"
        }]
      }).populate({
        path: 'customer',
      }).populate({
        path: 'descriptions',
      }).populate({
        path: 'centerOfAttention',
      }).populate({
        path: 'attentionType',
      }).populate({
        path: 'creator',
      }).exec();

      res.json({ status: 'success', message: "Operación realizada exitosamente", attention })
    });

  } catch (error) {
    console.log(error)
    res.json({ status: 'error', message: error });

  }

})

router.post('/confirmRejectAttentionCustomer', authMiddleware, async (req, res) => {

  let { statusSend, description, id } = req.body


  var attentionDescription = schemas.AttentionDescription({
    description,
    statusSend,
    date: new Date(),
    customer: mongoose.Types.ObjectId(req.currentUser.id),
  })
  attentionDescription.save();

  schemas.Attention.updateOne({ _id: mongoose.Types.ObjectId(req.body.id) },
    {
      $set: {
        statusSend,
      },
      $push: { "descriptions": attentionDescription._id },
    }, {
    multi: true
  }).exec();

  res.json({ status: 'success' });

})

router.post('/requestRejectConfirm', authMiddleware, async (req, res) => {
  try {
    let { statusRequest, description, id } = req.body

    let request = await schemas.Request.findById(id)
      .populate("centerOfAttention")
      .populate("request_type");

    var requestDescription = schemas.RequestDescription({
      description: description,
      status: statusRequest,
      date: new Date(),
      user: mongoose.Types.ObjectId(req.currentUser.id),
    });

    requestDescription.save();
    schemas.Request.updateOne({ _id: mongoose.Types.ObjectId(req.body.id) }, {
      $set: {
        status: statusRequest,
      },
      $push: { "descriptions": requestDescription._id },
    }, {
      multi: true
    }).exec()

    let tokensFCMAdmins = await fn.getTokenFCMAdmins()
    let tokensFCMCustomers = await fn.getTokenFCMCustomer(request.customer)

    let tokens = [...tokensFCMAdmins, ...tokensFCMCustomers]

    if (tokens) {
      notification.sendNotification(tokens, `Alerta de solicitud`, `Solicitud ${statusRequest == 'accept' ? 'Aprobada' : 'Rechazada'}`, {});
    }

    if (statusRequest === 'accept') {
      fn.createAttention(request)
    }

    let textMessage = 'aceptada';
    if (statusRequest == 'reject')
      textMessage = "Rechazada";

    let message = `Solicitud ${textMessage} exitsamente`;

    res.json({ status: 'success', message });
  } catch (error) {
    res.json({ status: 'success', message: error });

  }

})

router.post('/updateMenuRole', async (req, res) => {

  let { pages, idrole } = req.body;

  await fn.asyncForEach(pages, async pg => {
    if (pg.status) {
      schemas.Page.updateOne({ "_id": mongoose.Types.ObjectId(pg.page) }, {
        $push: { roles: idrole }
      }, {
        multi: true
      }).exec();
    }
    else {
      schemas.Page.updateOne({ "_id": mongoose.Types.ObjectId(pg.page) }, {
        $pull: { roles: idrole }
      }, {
        multi: true
      }).exec();
    }
  })


  res.json({ status: 'success' });

})

router.post('/updatedmaintenance', async (req, res) => {
  let maintenances = await schemas.Maintenance.find();
  await fn.asyncForEach(maintenances, async maintenance => {

    items = await schemas.Item.find({ mode: { $in: ['emergency_light'] } });

    let emergencylights = [];
    let upsAutonomies = [];
    await fn.asyncForEach(items, async item => {
      let itemImage = schemas.ItemImage({
        maintenance: mongoose.Types.ObjectId(maintenance._id),
        item: mongoose.Types.ObjectId(item._id),
        status: 'activo',
        photos: [],
        value: 0.0,
        percentBatery: 0.0,
        hour: "",
        hasHour: false,
        date: new Date()
      });
      await itemImage.save();
      emergencylights.push(itemImage);
    });


    items = await schemas.Item.find({ mode: { $in: ['ups_autonomy'] } });
    await fn.asyncForEach(items, async item => {
      let itemImage = schemas.ItemImage({
        maintenance: mongoose.Types.ObjectId(maintenance._id),
        item: mongoose.Types.ObjectId(item._id),
        status: 'activo',
        photos: [],
        value: 0.0,
        percentBatery: 0.0,
        hour: "",
        hasHour: true
      });
      await itemImage.save();
      upsAutonomies.push(itemImage);
    });

    schemas.Maintenance.updateOne({ _id: mongoose.Types.ObjectId(maintenance._id) }, {
      $set: { emergencylight: emergencylights, upsAutonomy: upsAutonomies }
    }, {
      multi: true
    }).exec();


  })
  res.json({ status: 'success' });
})

router.post('/createBoard', async (req, res) => {

  let itemsBoards = [];
  try {
    let board = new schemas.Board({
      name: req.body.name,
      type: req.body.type,
      status: 'created',
      maintenance: mongoose.Types.ObjectId(req.body.maintenance),
      observation: ''
    });
    if (req.body.type == 'tri') {
      items = await schemas.Item.find({ mode: { $in: ['tri', 'after', 'before', 'finding'] }, })
    } else {
      items = await schemas.Item.find({ mode: { $in: ['mono', 'after', 'before', 'finding'] }, })
    }

    await fn.asyncForEach(items, async (item, index) => {
      let itemBoard = schemas.ItemBoard({
        board: board._id,
        item: mongoose.Types.ObjectId(item._id),
        status: 'activo',
        photos: [],
        percentBatery: 0.0,
        value: 0.0,

      });
      await itemBoard.save();
      itemsBoards.push(itemBoard);
    });
    board.itemsBoards = itemsBoards;

    await board.save();

    schemas.Maintenance.updateOne({ "_id": mongoose.Types.ObjectId(req.body.maintenance) }, {
      $push: { boards: board._id }
    }, {
      multi: true
    }).exec();

    res.json({ status: 'success', board, message: "Tablero registrado exitosamente" });
  } catch (error) {
    console.log(error)
    res.json({ status: 'error', message: error });

  }
});

router.post('/getItemBoard', async (req, res) => {

  let completed = await fn.verifyItemBoard(req.body.board);
  items = await schemas.Board.findById(mongoose.Types.ObjectId(req.body.board),).populate({
    path: 'itemsBoards',
    match: { status: "activo" },
    populate: [{
      path: "item",

    }]
  }).exec();
  res.json({ status: 'success', completed, items });
});

router.post('/updateObservationMaintenance', async (req, res) => {

  schemas.Maintenance.updateOne({ "_id": mongoose.Types.ObjectId(req.body.id) }, {
    $set: { observation: req.body.observations }
  }, {
    multi: true
  }).exec();

  res.json({ status: 'success', message: 'Mantenimiento actualizado exitosamente' });
});

router.post('/updateObservationItem', async (req, res) => {

  schemas.ItemBoard.updateOne({ "_id": mongoose.Types.ObjectId(req.body.itemBoardId) }, {
    $set: { observations: req.body.observations }
  }, {
    multi: true
  }).exec();

  res.json({ status: 'success', message: "Mantenimiento registrado exitosamente.", });

})

router.post('/updateTitleItem', async (req, res) => {

  schemas.ItemBoard.updateOne({ "_id": mongoose.Types.ObjectId(req.body.itemBoardId) }, {
    $set: { title: req.body.title }
  }, {
    multi: true
  }).exec();

  res.json({ status: 'success', message: "Mantenimiento registrado exitosamente.", });

})

router.post('/payMaintenance', async (req, res) => {

  schemas.Maintenance.updateOne({ "_id": mongoose.Types.ObjectId(req.body.id) }, {
    $set: { statusPayment: 'paid' }
  }, {
    multi: true
  }).exec();

  res.json({ status: 'success', message: "Mantenimiento pagado exitosamente.", });

})

router.post('/createMaintenance', authMiddleware, async (req, res) => {

  if (req.body.centerOfAttention) {
    try {
      let aroundItems = [];
      let outletSampling = [];
      let emergencylight = [];
      let upsAutonomy = [];

      let customer = await schemas.Customer.findById(req.body.customer).populate('maintenanceType')

      var expiration = new Date();
      expiration.setMonth(expiration.getMonth() + customer.maintenanceType.value);

      let maintenance = new schemas.Maintenance({
        name: req.body.name,
        type: req.body.type,
        observation: req.body.observation,
        downloaded: false,
        price: req.body.price,
        customer: mongoose.Types.ObjectId(req.body.customer),
        creator: mongoose.Types.ObjectId(req.currentUser.id),
        status: "active",
        centerOfAttention: mongoose.Types.ObjectId(req.body.centerOfAttention),
        statusPayment: 'pending',
        value: customer.maintenanceType.value,
        time: 'month',
        expiration,
        statusAlertOne: 'pending',
        statusAlertTwo: 'pending',
      });

      items = await schemas.Item.find({ mode: { $in: ['around'] } });
      await fn.asyncForEach(items, async item => {
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
      await fn.asyncForEach(items, async item => {
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
      await fn.asyncForEach(items, async item => {
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
      await fn.asyncForEach(items, async item => {
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

      res.json({ status: 'success', message: "Mantenimiento registrado exitosamente.", maintenance, });
    } catch (error) {
      console.log(error)
      res.json({ status: 'error', message: error });
    }
  } else {
    res.json({ status: 'error', message: "Debe seleccionar un centro de atención" });

  }
});

router.post('/removeMeasurement', async (req, res) => {

  try {
    schemas.ItemBoard.updateOne({ "_id": mongoose.Types.ObjectId(req.body.id) }, {
      $set: { status: 'inactivo' }
    }, {
      multi: true
    }).exec();

    res.json({ status: 'success', message: "Medición eliminada exitosamente." });
  } catch (error) {
    console.log(error)
    res.json({ status: 'error', message: error });
  }
});

router.post('/saveBoard', upload.any("pictures"), async (req, res) => {

  // console.log(JSON.stringify(req.body, null, 6))

  try {
    if (req.files) {
      await fn.asyncForEach(req.files, async (file, index) => {
        let src = fs.createReadStream(file.path);
        let fileName = fn.makedId(10) + "." + fn.fileExtension(file.originalname)
        let outStream = await fs.createWriteStream('./uploads/' + fileName);
        src.pipe(outStream);

        src.on('end', async () => {
          fs.unlinkSync(file.path);

          const Jimp = require('jimp');
          const image = await Jimp.read('./uploads/' + fileName);
          await image.resize(400, Jimp.AUTO);
          await image.quality(50);
          await image.writeAsync('./uploads/' + fileName);

        });
        src.on('error', (err) => {
          console.log(err)
        });
        schemas.ItemBoard.updateOne({ "_id": mongoose.Types.ObjectId(file.fieldname) }, {
          $push: { photos: { url: fileName, type: 'remote' } }
        }, {
          multi: true
        }).exec();
      });
    }
    for (var key in req.body) {
      if (key.length == 24 && parseFloat(req.body[key]) > 0) {

        schemas.ItemBoard.updateOne({ "_id": mongoose.Types.ObjectId(key) }, {
          $set: { value: parseFloat(req.body[key]) }
        }, {
          upsert: true
        }).exec();
      }
    }
    if (req.body.observation.toString().trim().length > 0) {
      schemas.Board.updateOne({ "_id": mongoose.Types.ObjectId(req.body.board) }, {
        $set: { observation: req.body.observation }
      }, {
        multi: true
      }).exec();
    }

    res.json({ status: 'success' });


  } catch (error) {
    console.log(error);
    res.json({ status: 'error' });
  }


});

router.post('/createAttention', upload.any("pictures"), authMiddleware, async (req, res) => {

  try {
    items = await schemas.Item.find({ mode: { $in: ['attention'] } });

    let listAttentionImage = []
    await fn.asyncForEach(items, async item => {
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
    if (req.body.centerOfAttention) {
      centerOfAttention = mongoose.Types.ObjectId(req.body.centerOfAttention);
    }

    let count = await schemas.Attention.countDocuments();

    let attention = new schemas.Attention({
      number: count + 1,
      attentionItems: listAttentionImage,
      description: req.body.observations,
      title: req.body.title,
      names: req.body.name,
      document: req.body.document,
      signature: "",
      status: "created",
      statusSend: "pending",
      price: parseFloat(req.body.price),
      customer: mongoose.Types.ObjectId(req.body.customer),
      creator: mongoose.Types.ObjectId(req.currentUser.id),
      attentionType: mongoose.Types.ObjectId(req.body.attentionType),
      centerOfAttention: centerOfAttention,
      presave: true
    });
    await attention.save();

    attention = await schemas.Attention.findById(attention._id).populate({
      path: 'attentionItems',
      populate: [{
        path: "item"
      }]
    }).populate({
      path: 'customer',
    }).exec();

    let tokensFCM = fn.getTokenFCMAdmins()
    let registration_ids = [tokensFCM];
    notification.sendNotification(registration_ids, 'Test', `Esto es una prueba`, data);


    res.json({ status: 'success', attention });

  } catch (error) {
    console.log(error)
    res.json({ status: 'error', "message": "Ocurrió un error al registrar la atención" });
  }

});

router.post('/finishBoard', async (req, res) => {
  try {
    let board = await schemas.Board.findById(mongoose.Types.ObjectId(req.body.id),)
      .populate({
        path: 'itemsBoards',
        match: { status: "activo" },
        populate: [{
          path: "item",

        }]
      }).populate({
        path: "maintenance",
        populate: [{ path: 'customer' }]
      })
      .exec();

    if (fn.validateBoard(board)) {


      schemas.Board.updateOne({ "_id": mongoose.Types.ObjectId(req.body.id) }, {
        $set: {
          status: 'finished'
        }
      }, {
        multi: true
      }).exec();


      let tokensFCMAdmins = await fn.getTokenFCMAdmins()
      let tokensFCMCustomers = await fn.getTokenFCMCustomer(board.maintenance.customer._id)

      let tokens = [...tokensFCMAdmins, ...tokensFCMCustomers]

      if (tokens.length > 0) {
        // notification.sendNotification(tokens, 'Tablero finalizado', `[${board.type == 'tri' ? "Trifásico" : "Monofásico"}] ${board.name}`, {});
      }

      await fn.sendEmailBoard(board);

      res.json({
        status: 'success',
        message: 'Tablero finalizado exitosamente'
      });
    } else {
      res.json({
        status: 'error',
        message: 'No se puede finalizar, porque el tablero se encuentra incompleto'
      });
    }
  } catch (error) {
    console.log(error);
    res.json({
      status: 'error',
      message: 'Ocurrió un error al finalizar el tablero'
    });
  }
});

router.post('/finishMaintenance', async (req, res) => {
  try {
    let maintenance = await schemas.Maintenance.findById(mongoose.Types.ObjectId(req.body.id),).populate({
      path: 'boards',
      populate: [{
        path: 'itemsBoards',
        match: { status: "activo" },
        populate: [{
          path: "item",
        }]
      }]
    }).populate({
      path: 'customer',
      select: { _id: 0, name: 1 }
    }).exec();

    let newBoards = maintenance.boards.map(board => {

      let tmpCellsBefore = board.itemsBoards.filter(itemBoard => itemBoard.item.mode == 'before')
      let tmpCellsVoltaje = board.itemsBoards.filter(itemBoard => itemBoard.item.type == 'voltaje')
      let tmpCellsCorriente = board.itemsBoards.filter(itemBoard => itemBoard.item.type == 'corriente')
      let tmpCellsAfter = board.itemsBoards.filter(itemBoard => itemBoard.item.mode == 'after')

      let cellsBefore = tmpCellsBefore.map(cellBefore => {
        if (cellBefore.photos.length == 0) {
          cellBefore.photos = [{
            url: 'default.png',
            type: 'remote'
          }]
        }
        return cellBefore
      });
      let cellsVoltaje = tmpCellsVoltaje.map(cellVoltaje => {
        if (cellVoltaje.photos.length == 0) {
          cellVoltaje.photos = [{
            url: 'default.png',
            type: 'remote'
          }]
        }
        return cellVoltaje
      });
      let cellsCorriente = tmpCellsCorriente.map(cellCorriente => {
        if (cellCorriente.photos.length == 0) {
          cellCorriente.photos = [{
            url: 'default.png',
            type: 'remote'
          }]
        }
        return cellCorriente
      });
      let cellsAfter = tmpCellsAfter.map(cellAfter => {
        if (cellAfter.photos.length == 0) {
          cellAfter.photos = [{
            url: 'default.png',
            type: 'remote'
          }]
        }
        return cellAfter
      });

      let newBoard = {
        cellsBefore,
        cellsVoltaje,
        cellsCorriente,
        cellsAfter,
        boardName: board.name,
        observation: board.observation,

      }
      // data.push(newBoard)
      return newBoard;

    })

    res.json({
      status: 'success',
      message: 'Tablero finalizado exitosamente'
    });

  } catch (error) {
    console.log(error);
    res.json({
      status: 'error',
      message: 'Ocurrió un error al finalizar el tablero'
    });
  }
});

router.post('/openAttention', async (req, res) => {
  try {
    schemas.Attention.updateOne({ "_id": mongoose.Types.ObjectId(req.body.id) }, {
      $set: {
        status: 'created'
      }
    }, {
      multi: true
    }).exec();

    res.json({
      status: 'success',
      message: 'Atención abierta exitosamente'
    });

  } catch (error) {
    console.log(error);
    res.json({
      status: 'error',
      message: 'Ocurrió un error al abrir la atención'
    });
  }
});

router.post('/closeAttention', async (req, res) => {
  try {

    schemas.Attention.updateOne({ "_id": mongoose.Types.ObjectId(req.body.id) }, {
      $set: {
        status: 'finished'
      }
    }, {
      multi: true
    }).exec();

    res.json({
      status: 'success',
      message: 'Atención abierta exitosamente'
    });

  } catch (error) {
    console.log(error);
    res.json({
      status: 'error',
      message: 'Ocurrió un error al abrir la atención'
    });
  }
});

router.post('/updateImageItemBoard', upload.any("pictures"), async (req, res) => {

  try {
    await fn.asyncForEach(req.files, async (file) => {
      let fileName = fn.makedId(10) + "." + fn.fileExtension(file.originalname)
      let src = await fs.createReadStream(file.path);
      let dest = await fs.createWriteStream('./uploads/' + fileName);
      src.pipe(dest);
      src.on('end', async () => {
        fs.unlinkSync(file.path);

        const Jimp = require('jimp');
        const image = await Jimp.read('./uploads/' + fileName);
        await image.resize(400, Jimp.AUTO);
        await image.quality(50);
        await image.writeAsync('./uploads/' + fileName);

        let date = new Date()
        schemas.ItemBoard.updateOne({ "_id": mongoose.Types.ObjectId(req.body.itemImageID) }, {
          $push: { photos: { url: fileName, type: 'remote', date } },
        }, {
          upsert: true
        }).exec();

        res.json({ status: 'success', url: fileName, date });

      });
      src.on('error', (err) => {
        console.log(err);
        res.json({ status: 'error' });
      });
    });

  } catch (error) {
    console.log(error);
    res.json({ status: 'error' });
  }
});

router.post('/updateAttention', upload.any("pictures"), async (req, res) => {

  try {

    let fileNameSign = '';


    if (req.files) {
      await fn.asyncForEach(req.files, async (file) => {
        let fileName = fn.makedId(10) + "." + fn.fileExtension(file.originalname)
        let src = await fs.createReadStream(file.path);
        let dest = await fs.createWriteStream('./uploads/' + fileName);
        src.pipe(dest);
        src.on('end', async () => {
          fs.unlinkSync(file.path);

          const Jimp = require('jimp');
          const image = await Jimp.read('./uploads/' + fileName);
          await image.resize(400, Jimp.AUTO);
          await image.quality(50);
          await image.writeAsync('./uploads/' + fileName);
        });
        src.on('error', (err) => {
          console.log(err)
        });
        fileNameSign = fileName;
      });
    }

    let centerOfAttention = null;
    if (req.body.centerOfAttention) {
      centerOfAttention = mongoose.Types.ObjectId(req.body.centerOfAttention);
    }


    schemas.Attention.updateOne({ "_id": mongoose.Types.ObjectId(req.body.id) }, {
      $set: {
        description: req.body.observations,
        title: req.body.title,
        customer: mongoose.Types.ObjectId(req.body.customer),
        signature: fileNameSign,
        names: req.body.name,
        document: req.body.document,
        price: parseFloat(req.body.price),
        attentionType: mongoose.Types.ObjectId(req.body.attentionType),
        centerOfAttention: centerOfAttention,
      }
    }, {
      upsert: true
    }).exec();

    res.json({ status: 'success' });

  } catch (error) {
    console.log(error)
    res.json({ status: 'error' });
  }
});

router.post('/updateAutomyValue', async (req, res) => {

  if (req.body.id && req.body.value) {
    let hour = moment(new Date()).format('D-MMMM-YYYY, h:mm:ss a');
    let { id, value } = req.body;
    schemas.ItemImage.updateOne({ "_id": mongoose.Types.ObjectId(id) }, {
      $set: {
        percentBatery: parseFloat(value),
        hour: hour.toString()
      }
    }, {
      upsert: true
    }).exec();
  }
  res.json({ status: 'success' });

})

router.post('/updateValue', async (req, res) => {

  if (req.body.id && req.body.value) {
    let { id, value } = req.body;
    schemas.ItemBoard.updateOne({ "_id": mongoose.Types.ObjectId(id) }, {
      $set: {
        value: parseFloat(value),
      }
    }, {
      upsert: true
    }).exec();
  }
  res.json({ status: 'success' });

})

router.post('/updateImageItem', upload.any("pictures"), async (req, res) => {
  try {
    console.log(req.body);

    await fn.asyncForEach(req.files, async (file) => {
      let fileName = fn.makedId(10) + "." + fn.fileExtension(file.originalname)
      let src = await fs.createReadStream(file.path);
      let dest = await fs.createWriteStream('./uploads/' + fileName);
      src.pipe(dest);
      src.on('end', async () => {
        fs.unlinkSync(file.path);

        const Jimp = require('jimp');
        const image = await Jimp.read('./uploads/' + fileName);
        await image.resize(400, Jimp.AUTO);
        await image.quality(50);
        await image.writeAsync('./uploads/' + fileName);

        let date = new Date()

        schemas.ItemImage.updateOne({ "_id": mongoose.Types.ObjectId(req.body.itemImageID) }, {
          $push: { photos: { url: fileName, type: 'remote', date } }
        }, {
          upsert: true
        }).exec();

        res.json({ status: 'success', url: fileName, date });

      });
      src.on('error', (err) => {
        console.log(err);
        res.json({ status: 'error' });
      });
    });

  } catch (error) {
    console.log(error);
    res.json({ status: 'error' });
  }
});

router.post('/updateImageAttention', upload.any("pictures"), async (req, res) => {
  try {
    await fn.asyncForEach(req.files, async (file) => {
      let fileName = fn.makedId(10) + "." + fn.fileExtension(file.originalname)
      let src = await fs.createReadStream(file.path);
      let dest = await fs.createWriteStream('./uploads/' + fileName);
      src.pipe(dest);
      src.on('end', async () => {
        fs.unlinkSync(file.path);

        const Jimp = require('jimp');
        const image = await Jimp.read('./uploads/' + fileName);
        await image.resize(400, Jimp.AUTO);
        await image.quality(50);
        await image.writeAsync('./uploads/' + fileName);

        let date = new Date()

        schemas.ItemImage.updateOne({ "_id": mongoose.Types.ObjectId(req.body.itemImageID) }, {
          $push: { photos: { url: fileName, type: 'remote', date } }
        }, {
          upsert: true
        }).exec();

        res.json({ status: 'success', url: fileName, date });

      });
      src.on('error', (err) => {
        console.log(err);
        res.json({ status: 'error' });
      });
    });

  } catch (error) {
    console.log(error);
    res.json({ status: 'error' });
  }
});

router.post('/getItemAttention', async (req, res) => {

  items = await schemas.Item.findById(mongoose.Types.ObjectId(req.body.board),).populate({
    path: 'itemsBoards',
    populate: [{
      path: "item"
    }]
  }).exec();
  res.json({ status: 'success', completed, items });
});

router.post('/getInfoUser', authMiddleware, async (req, res) => {

  let user = await schemas.User.findById(mongoose.Types.ObjectId(req.currentUser.id),).exec();
  res.json({ status: 'success', user });
});

router.post('/updateAccount', authMiddleware, upload.any("pictures"), async (req, res) => {
  try {

    console.log(req.currentUser)
    console.log(req.body)
    console.log(req.files)

    let fileName = 'default.png';
    await fn.asyncForEach(req.files, async (file) => {
      let src = fs.createReadStream(file.path);
      fileName = fn.makedId(10) + "." + fn.fileExtension(file.originalname)
      let dest = await fs.createWriteStream('./uploads/' + fileName);
      src.pipe(dest);
      src.on('end', async () => {
        console.log('end');
        fs.unlinkSync(file.path);

        const Jimp = require('jimp');
        const image = await Jimp.read('./uploads/' + fileName);
        await image.resize(400, Jimp.AUTO);
        await image.quality(50);
        await image.writeAsync('./uploads/' + fileName);
      });
      src.on('error', (err) => {
        console.log(err)
      });
      schemas.User.updateOne({ "_id": mongoose.Types.ObjectId(req.currentUser.id) }, {
        $set: {
          photo: fileName
        }
      }, {
        multi: true
      }).exec();
    });

    schemas.User.updateOne({ "_id": mongoose.Types.ObjectId(req.currentUser.id) }, {
      $set: {
        name: req.body.name,
        document_number: req.body.document_number,
        username: req.body.username,
      }
    }, {
      multi: true
    }).exec();

    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      let password = await bcrypt.hash(req.body.password, salt);

      schemas.User.updateOne({ "_id": mongoose.Types.ObjectId(req.currentUser.id) }, {
        $set: { password: password }
      }, {
        multi: true
      }).exec();

    }

    res.json({ status: 'success' });
  } catch (error) {
    console.log(error);
    res.json({ status: 'error' });
  }
});

router.post('/updateToken', authMiddleware, async (req, res) => {
  try {

    schemas.User.updateOne({ "_id": mongoose.Types.ObjectId(req.currentUser.id) }, {
      $set: {
        tokenFCM: req.body.token
      }
    }, {
      multi: true
    }).exec();

    res.json({ status: 'success' });
  } catch (error) {
    console.log(error);
    res.json({ status: 'error' });
  }
});

/** Users */
router.post('/listUsers', async (req, res) => {

  let { start, end, paginate, withOutCenterOfAttention } = req.body;

  let query = schemas.User.find()
    .sort({ '_id': -1 })
    .populate('role')

  if (paginate) {
    query
      .skip(start)
      .limit(end)
  }
  if (withOutCenterOfAttention) {
    query.where("centerOfAttention").in(null)
  }

  let count = await schemas.User.countDocuments();

  return new Promise((resolve, reject) => {
    query.exec(function (_, users) {
      res.json({ status: 'success', users, count })
    })
  })
});

/** Users */
router.post('/listAttentionTypes', async (req, res) => {

  let attentionTypes = await schemas.AttentionType
    .find()
    .sort({ '_id': 1 })
    .exec()
  res.json({ status: 'success', attentionTypes })

});

router.post('/listConfigurations', async (req, res) => {

  let { start, end, paginate } = req.body;

  let query = schemas.Configuration.find()

  if (paginate) {
    query
      .skip(start)
      .limit(end)
  }

  let count = await schemas.Configuration.countDocuments();

  return new Promise((resolve, reject) => {
    query.exec(function (_, users) {
      res.json({ status: 'success', configuration, count })
    })
  })
});

router.post('/updateUser', upload.any("photo"), async (req, res) => {
  try {
    await fn.asyncForEach(req.files, async (file) => {
      let src = fs.createReadStream(file.path);
      let fileName = fn.makedId(10) + "." + fn.fileExtension(file.originalname)
      let dest = await fs.createWriteStream('./uploads/' + fileName);
      src.pipe(dest);
      src.on('end', () => {
        fs.unlinkSync(file.path);
      });
      src.on('error', (err) => {
        console.log(err)
      });
      schemas.User.updateOne({ "_id": mongoose.Types.ObjectId(req.body.id) }, {
        $set: {
          photo: fileName
        }
      }, {
        multi: true
      }).exec();
    });

    schemas.User.updateOne({ "_id": mongoose.Types.ObjectId(req.body.id) }, {
      $set: {
        name: req.body.name,
        username: req.body.username,
        document_number: req.body.documentNumber,
        role: req.body.role,
        phone: req.body.phone,
        email: req.body.email,
      }
    }, {
      multi: true
    }).exec();

    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      let password = await bcrypt.hash(req.body.password, salt);

      schemas.User.updateOne({ "_id": mongoose.Types.ObjectId(req.body.id) }, {
        $set: { password: password }
      }, {
        multi: true
      }).exec();
    }
    res.json({ status: 'success' });
  } catch (error) {
    console.log(error);
    res.json({ status: 'error' });
  }
});

router.post('/createUser', upload.any("photo"), async (req, res) => {

  let usr = await schemas.User.findOne({ 'document_number': req.body.documentNumber })
  if (!usr) {

    let fileName = 'default.png';
    try {
      if (req.files) {
        await fn.asyncForEach(req.files, async (file) => {
          let src = fs.createReadStream(file.path);
          fileName = fn.makedId(10) + "." + fn.fileExtension(file.originalname)
          let dest = await fs.createWriteStream('./uploads/' + fileName);
          src.pipe(dest);
          src.on('end', async () => {
            fs.unlinkSync(file.path);

            const Jimp = require('jimp');
            const image = await Jimp.read('./uploads/' + fileName);
            await image.resize(400, Jimp.AUTO);
            await image.quality(50);
            await image.writeAsync('./uploads/' + fileName);
          });
          src.on('error', (err) => {
            console.log(err)
          });
          schemas.User.updateOne({ "_id": mongoose.Types.ObjectId(req.body.id) }, {
            $set: {
              photo: fileName
            }
          }, {
            multi: true
          }).exec();
        });
      }

      let customer = null
      if (req.body.customer) {
        customer = mongoose.Types.ObjectId(req.body.customer);
      }
      let centerOfAttention = null
      if (req.body.centerOfAttention) {
        centerOfAttention = mongoose.Types.ObjectId(req.body.centerOfAttention);
      }
      let user = schemas.User({
        name: req.body.name,
        username: req.body.username,
        document_number: req.body.documentNumber,
        role: req.body.role,
        photo: fileName,
        password: req.body.password,
        phone: req.body.phone,
        email: req.body.email,
        customer,
        centerOfAttention,
        status: 'activo'
      });
      await user.save()

      if (customer) {
        schemas.Customer.updateOne({ "_id": mongoose.Types.ObjectId(req.body.customer) }, {
          $push: { users: user },
        }, {
          multi: true
        }).exec();
      }
      if (centerOfAttention) {
        schemas.CenterOfAttention.updateOne({ "_id": centerOfAttention }, {
          $push: { users: user },
        }, {
          multi: true
        }).exec();
      }

      res.json({ status: 'success' });

    } catch (error) {
      console.log(error);
      res.json({ status: 'error' });
    }
  } else {
    res.json({ status: 'error', message: "El usuario ya existe" });
  }
});

router.post('/deleteUser', async (req, res) => {
  try {

    schemas.User.updateOne({ "_id": mongoose.Types.ObjectId(req.body.id) }, {
      $set: {
        status: 'inactivo',
      }
    }, {
      multi: true
    }).exec();
    res.json({ status: 'success', message: 'Funcionario desabilitado exitosamente' });

  } catch (error) {
    console.log(error);
    res.json({ status: 'error', message: 'Ocurrió un error al desabilitar el funcionario' });
  }
});

router.post('/addPersonToCustomer', async (req, res) => {
  try {

    let { customer, person } = req.body;

    schemas.Customer.updateOne({ "_id": mongoose.Types.ObjectId(customer) }, {
      $push: { users: person },
    }, {
      multi: true
    }).exec();

    schemas.User.updateOne({ "_id": mongoose.Types.ObjectId(person) }, {
      $set: { customer: customer },
    }, {
      multi: true
    }).exec();


    res.json({ status: 'success', message: 'Usuario agregado exitosamente' });

  } catch (error) {
    console.log(error);
    res.json({ status: 'error', message: 'Ocurrió un error al agregar el funcionario' });
  }
});

router.post('/addUserToCenterOfAttention', async (req, res) => {
  try {

    let { user, centerOfAttention } = req.body;

    console.log(req.body)

    schemas.CenterOfAttention.updateOne({ "_id": mongoose.Types.ObjectId(centerOfAttention) }, {
      $push: { users: mongoose.Types.ObjectId(user) },
    }, {
      multi: true
    }).exec();

    schemas.User.updateOne({ "_id": mongoose.Types.ObjectId(user) }, {
      $set: { centerOfAttention: centerOfAttention },
    }, {
      multi: true
    }).exec();


    res.json({ status: 'success', message: 'Usuario agregado exitosamente' });

  } catch (error) {
    console.log(error);
    res.json({ status: 'error', message: 'Ocurrió un error al agregar el funcionario' });
  }
});

router.post('/removePersonToCustomer', async (req, res) => {
  try {

    let { customer, person } = req.body;

    schemas.Customer.updateOne({ "_id": mongoose.Types.ObjectId(customer) }, {
      $pull: { users: person },
    }, {
      multi: true
    }).exec();

    schemas.User.updateOne({ "_id": mongoose.Types.ObjectId(person) }, {
      $set: { customer: null },
    }, {
      multi: true
    }).exec();


    res.json({ status: 'success', message: 'Usuario agregado exitosamente' });

  } catch (error) {
    console.log(error);
    res.json({ status: 'error', message: 'Ocurrió un error al agregar el funcionario' });
  }
});

router.post('/restoreUser', async (req, res) => {
  try {

    schemas.User.updateOne({ "_id": mongoose.Types.ObjectId(req.body.id) }, {
      $set: {
        status: 'activo',
      }
    }, {
      multi: true
    }).exec();
    res.json({ status: 'success', message: 'Funcionario activado exitosamente' });

  } catch (error) {
    console.log(error);
    res.json({ status: 'error', message: 'Ocurrió un error al activar el funcionario' });
  }
});

/** Center of Attentions */
router.post('/listCenterOfAttention', authMiddleware, async (req, res) => {

  let { start, end, paginate, customer } = req.body;

  let currentUser = await schemas.User.findById(req.currentUser.id);
  let queryCount = schemas.CenterOfAttention.countDocuments();
  let query = schemas.CenterOfAttention.find()
    .sort({ '_id': 1 })
    .populate({ path: 'customer' })

  allowedRole = true;

  console.log(req.currentUser.role.tag)
  switch (req.currentUser.role.tag) {
    case "administrator":

      break;
    case "construction_manager":
    case "maintenance_manager":
      query.where('customer').equals(mongoose.Types.ObjectId(currentUser.customer))
      queryCount.where('customer').equals(mongoose.Types.ObjectId(currentUser.customer))
      break;
    case "oset":
    case "permanent":
      query.where('users').in([mongoose.Types.ObjectId(currentUser._id)])
      queryCount.where('users').in([mongoose.Types.ObjectId(currentUser._id)])
      break;
    default:
      allowedRole = false;

  }
  console.log(customer)
  if (customer) {
    query.where('customer').equals(mongoose.Types.ObjectId(customer))
    queryCount.where('customer').equals(mongoose.Types.ObjectId(customer))
  }
  query.populate({
    path: "users",
    populate: [{ path: "role" }]
  })
  if (allowedRole) {
    if (paginate) {
      query.skip(start)
        .limit(end);
    }
    let count = await queryCount.exec();

    return new Promise((resolve, reject) => {
      query.exec(function (_, centersOfAttention) {
        res.json({ status: 'success', centersOfAttention, count })
      })
    })
  } else {
    res.json({ status: 'success', centersOfAttention: [], count: 0 })
  }
});

router.post('/updateCenterOfAttention', upload.any("photo"), async (req, res) => {
  try {

    await schemas.CenterOfAttention.updateOne({ "_id": mongoose.Types.ObjectId(req.body.id) }, {
      $set: {
        title: req.body.name,
        description: req.body.description,
      }
    }, {
      multi: true
    }).exec();
    if (req.body.customer) {
      await schemas.CenterOfAttention.updateOne({ "_id": mongoose.Types.ObjectId(req.body.id) }, {
        $set: {
          customer: mongoose.Types.ObjectId(req.body.customer),
        }
      }, {
        multi: true
      }).exec();
    }

    let centerOfAttention = await schemas.CenterOfAttention.findById(mongoose.Types.ObjectId(req.body.id))

    res.json({ status: 'success', centerOfAttention });
  } catch (error) {
    console.log(error);
    res.json({ status: 'error' });
  }
});

router.post('/updateTimeExpiration', async (req, res) => {
  try {

    console.log(req.body);
    /*
      valueSemiAnnual: '1',
      valueProvisioning: '2',
      timeSemiAnnual: 'month',
      timeProvisioning: 'week',
      customerProvisioning: '62365cf134d34c5edc87a4b6',
      customerSemiAnnual: '622cc6452958c3c61299998a',
      centerOfAttentionSemiAnnual: '62cf580b86300a2d38157231',
      centerOfAttentionProvisioning: '62e187095384ce18ccf3ab18'
    */
    let {
      value,
      time,
      type,
      centerOfAttention
    } = req.body

    let data = {
      valueSemiAnnual: value,
      timeSemiAnnual: time,
    }
    if (type == 'provisioning') {
      data = {
        valueProvisioning: value,
        timeProvisioning: time,
      }
    }

    await schemas.CenterOfAttention.updateOne({ "_id": mongoose.Types.ObjectId(centerOfAttention) }, {
      $set: {
        valueSemiAnnual: value,
        timeSemiAnnual: time,
      }
    }, {
      multi: true
    }).exec();


    res.json({ status: 'success' });
  } catch (error) {
    console.log(error);
    res.json({ status: 'error' });
  }
});

router.post('/createCenterOfAttention', async (req, res) => {

  let { name, description, customer } = req.body;
  let centerOfAttention = await schemas.CenterOfAttention.findOne({ 'title': req.body.title })
  if (!centerOfAttention) {

    try {
      let date = new Date();

      let centerOfAttention = schemas.CenterOfAttention({
        title: req.body.name,
        valueSemiAnnual,
        valueProvisioning,
        timeSemiAnnual,
        timeProvisioning,
        description: description,
        expirationDateMaintenance: date,
        provisioningAlertDate: date,
        statusProvisioningAlertDate: 'pending',
        statusAlertDateMaintenance: 'pending',
        customer: mongoose.Types.ObjectId(customer),
        status: 'active',
      });
      await centerOfAttention.save();

      schemas.Customer.updateOne({ "_id": mongoose.Types.ObjectId(customer) }, {
        $push: { centersOfAttention: centerOfAttention },
      }, {
        multi: true
      }).exec();

      let id = centerOfAttention._id;

      centerOfAttention = await schemas.CenterOfAttention.findById(mongoose.Types.ObjectId(id))
        .sort({ '_id': 1 })
        .populate({ path: 'customer' })


      res.json({ status: 'success', centerOfAttention });

    } catch (error) {
      console.log(error);
      res.json({ status: 'error' });
    }
  } else {
    res.json({ status: 'error', message: "El centro de atención ya existe" });
  }
});

router.post('/deleteCenterOfAttention', async (req, res) => {
  try {
    schemas.CenterOfAttention.updateOne({ "_id": mongoose.Types.ObjectId(req.body.id) }, {
      $set: {
        status: 'inactive',
      }
    }, {
      multi: true
    }).exec();
    res.json({ status: 'success', message: 'Centro de atención desabilitado exitosamente' });

  } catch (error) {
    console.log(error);
    res.json({ status: 'error', message: 'Ocurrió un error al desabilitar el centro de atención' });
  }
});

router.post('/restoreCenterOfAttention', async (req, res) => {
  try {

    schemas.CenterOfAttention.updateOne({ "_id": mongoose.Types.ObjectId(req.body.id) }, {
      $set: {
        status: 'active',
      }
    }, {
      multi: true
    }).exec();
    res.json({ status: 'success', message: 'Centro de atención activado exitosamente' });

  } catch (error) {
    console.log(error);
    res.json({ status: 'error', message: 'Ocurrió un error al activar el centro de atención' });
  }
});

router.post('/openItemBoard', async (req, res) => {
  try {
    schemas.ItemBoard.updateOne({ "_id": mongoose.Types.ObjectId(req.body.id) }, {
      $set: {
        status: 'activo'
      }
    }, {
      multi: true
    }).exec();

    res.json({
      status: 'success',
      message: 'Marcación abierta exitosamente'
    });

  } catch (error) {
    console.log(error);
    res.json({
      status: 'error',
      message: 'Ocurrió un error al abrir la marcación'
    });
  }
});

router.post('/sendEmailBoard', async (req, res) => {

  await fn.sendEmailBoard(req.body.id);
  res.json({
    status: 'success',
    message: 'Correo enviado'
  });
});

router.post('/sendEmailAttention', async (req, res) => {

  await fn.sendEmailAttention(req.body.id, "email");
  res.json({
    status: 'success',
    message: 'Correo enviado'
  });
});

router.post('/downloadAttention', async (req, res) => {

  try {

    let attention = await schemas.Attention.findById(mongoose.Types.ObjectId(req.body.id));

    if (!fn.validateAttention(attention)) {

      let attention = await schemas.Attention.findById(mongoose.Types.ObjectId(req.body.id))
        .populate({
          path: 'customer'
        }).populate({
          path: 'attentionItems'
        }).exec();


      let data = {
        date: fn.getDateReport(),
        attention: attention,
        pathServicePhp: config.pathSavePdf
      }

      axios.post(config.pathServicePhp + 'attention.php', data)
        .then(async (response) => {

          console.log(response.data)
          res.json({
            status: 'success',
            message: 'Documento generado exitosamente'
          });
        })
        .catch(function (error) {
          console.log(error);
        });

    } else {
      res.json({
        status: 'error',
        message: 'No se puede finalizar, porque la atencion se encuentra incompleta'
      });
    }

  } catch (error) {
    console.log(error);
    res.json({
      status: 'error',
      message: 'Ocurrió un error al finalizar la atención'
    });
  }
});

router.post('/createCustomer', async (req, res) => {

  let cus = await schemas.Customer.findOne({ 'nit': req.body.nit })
  if (!cus) {

    try {
      let maintenanceType = null
      if (req.body.maintenanceType)
        maintenanceType = mongoose.Types.ObjectId(req.body.maintenanceType)

      let customer = schemas.Customer({
        name: req.body.name,
        nit: req.body.nit,
        address: req.body.address,
        phone: req.body.phone,
        email: req.body.email,
        maintenanceType,
        status: 'activo'
      });
      await customer.save()

      let user = schemas.User({
        name: req.body.name,
        username: req.body.username,
        document_number: '',
        role: mongoose.Types.ObjectId('5a046fe9627e3526802b3848'),
        photo: 'default.png',
        password: req.body.password,
        status: 'activo'
      });
      await user.save()

      res.json({ status: 'success' });

    } catch (error) {
      console.log(error);
      res.json({ status: 'error' });
    }
  } else {
    res.json({ status: 'error', message: "El cliente ya existe" });
  }
});

router.post('/updateCustomer', async (req, res) => {
  try {

    console.log(req.body)
    let maintenanceType = null
    if (req.body.maintenanceType)
      maintenanceType = mongoose.Types.ObjectId(req.body.maintenanceType)


    schemas.Customer.updateOne({ "_id": mongoose.Types.ObjectId(req.body.id) }, {
      $set: {
        name: req.body.name,
        nit: req.body.nit,
        address: req.body.username,
        phone: req.body.phone,
        email: req.body.email,
        maintenanceType: maintenanceType,
      }
    }, {
      multi: true
    }).exec();
    res.json({ status: 'success' });
  } catch (error) {
    console.log(error);
    res.json({ status: 'error' });
  }
});

router.post('/saveObservations', async (req, res) => {
  try {

    schemas.Maintenance.updateOne({ "_id": mongoose.Types.ObjectId(req.body.id) }, {
      $set: {
        observation: req.body.observations,
      }
    }, {
      multi: true
    }).exec();
    res.json({ status: 'success', message: 'Mantenimiento actualizado exitosamente' });
  } catch (error) {
    console.log(error);
    res.json({ status: 'error', message: 'Ocurrio un error al actualizar' });
  }
});

router.post('/printMaintenance', async (req, res) => {

  let { type } = req.body
  try {
    let maintenance = await schemas.Maintenance.findById(mongoose.Types.ObjectId(req.body.id),).populate({
      path: 'boards',
      populate: [{
        path: 'itemsBoards',
        match: { status: "activo" },
        populate: [{
          path: "item",
        }]
      }]
    }).populate({
      path: 'customer',
    }).populate({
      path: 'aroundItems',
      populate: [{
        path: "item"
      }]
    }).populate({
      path: 'outletSampling',
      populate: [{
        path: "item"
      }]
    }).exec();

    if (maintenance.customer.email) {
      let newBoards = maintenance.boards.map(board => {

        let tmpCellsBefore = board.itemsBoards.filter(itemBoard => itemBoard.item.mode == 'before')
        let tmpCellsVoltaje = board.itemsBoards.filter(itemBoard => itemBoard.item.type == 'voltaje')
        let tmpCellsCorriente = board.itemsBoards.filter(itemBoard => itemBoard.item.type == 'corriente')
        let tmpCellsAfter = board.itemsBoards.filter(itemBoard => itemBoard.item.mode == 'after')
        let tmpCellsFinding = board.itemsBoards.filter(itemBoard => itemBoard.item.mode == 'finding')

        let cellsBefore = tmpCellsBefore.map(cellBefore => {
          if (cellBefore.photos.length == 0) {
            cellBefore.photos = [{
              url: 'default.png',
              type: 'remote'
            }]
          }
          return cellBefore
        });
        let cellsVoltaje = tmpCellsVoltaje.map(cellVoltaje => {
          if (cellVoltaje.photos.length == 0) {
            cellVoltaje.photos = [{
              url: 'default.png',
              type: 'remote'
            }]
          }
          return cellVoltaje
        });
        let cellsCorriente = tmpCellsCorriente.map(cellCorriente => {
          if (cellCorriente.photos.length == 0) {
            cellCorriente.photos = [{
              url: 'default.png',
              type: 'remote'
            }]
          }
          return cellCorriente
        });
        let cellsAfter = tmpCellsAfter.map(cellAfter => {
          if (cellAfter.photos.length == 0) {
            cellAfter.photos = [{
              url: 'default.png',
              type: 'remote'
            }]
          }
          return cellAfter
        });
        let cellsFinding = tmpCellsFinding.map(cellFinding => {
          if (cellFinding.photos.length == 0) {
            cellFinding.photos = [{
              url: 'default.png',
              type: 'remote'
            }]
          }
          return cellFinding
        });

        let newBoard = {
          cellsBefore,
          cellsVoltaje,
          cellsCorriente,
          cellsAfter,
          cellsFinding,
          boardName: board.name,
          observation: board.observation,
        }
        return newBoard;

      })

      let data = {
        id: maintenance._id,
        date: fn.getDateReport(),
        name: maintenance.name,
        type: maintenance.type === 'tri' ? 'Trifásico' : 'Monofásico',
        customer: maintenance.customer,
        boards: newBoards,
        aroundItems: maintenance.aroundItems,
        outletSampling: maintenance.outletSampling,
        pathServicePhp: config.pathSavePdf
      }

      if (fs.existsSync(`./pdf/${maintenance._id}.pdf`)) {
        fs.unlinkSync(`./pdf/${maintenance._id}.pdf`);
      }

      axios.post(config.pathServicePhp + 'maintenance.php', data)
        .then(async (response) => {
          if (response.data.status == 'success') {

            let base64 = '';
            if (type == "email")
              await fn.sendEmailMaintenance(maintenance);
            else if (type == "base64") {
              const fs = require('fs');
              base64 = fs.readFileSync(`./pdf/${maintenance._id}.pdf`, { encoding: 'base64' });

            }
            if (type == 'download') {
              schemas.Maintenance.updateOne({ "_id": mongoose.Types.ObjectId(maintenance._id) }, {
                $set: {
                  downloaded: true
                }
              }, {
                multi: true
              }).exec();
            }

            res.json({
              status: 'success',
              data: data,
              base64,
              message: 'Reporte enviado exitosamente'
            });
          } else {
            console.log(response.data)
            res.json({
              status: 'error',
              message: 'Error'
            });
          }
        })
        .catch(function (error) {
          console.log(error)
          res.json({
            status: 'error',
            message: error
          });
        });
    } else {
      res.json({
        status: 'error',
        message: 'El cliente ' + maintenance.customer.name + " no tiene correo"
      });
    }

  } catch (error) {
    console.log(error);
    res.json({
      status: 'error',
      message: 'Ocurrió un error al enviar el reporte'
    });
  }
});

router.post('/finishAttention', async (req, res) => {
  try {

    let attention = await schemas.Attention.findById(mongoose.Types.ObjectId(req.body.id));

    if (!fn.validateAttention(attention)) {
      schemas.Attention.updateOne({ "_id": mongoose.Types.ObjectId(req.body.id) }, {
        $set: {
          status: 'finished'
        }
      }, {
        multi: true
      }).exec();

      // let users = await schemas.User.find({ role: 'administrator' });

      // let info = {
      //   "type": "attention",
      //   attention
      // }

      // let registration_ids = [];
      // users.forEach(user => {
      //   if (user.token) {
      //     registration_ids.push(user.token);
      //   }
      //   notification.sendNotification('', registration_ids, 'Tablero finalizado', `La atención ${attention.description} ha finalizado`, info);
      // });


      let attention = await schemas.Attention.findById(mongoose.Types.ObjectId(req.body.id))
        .populate({
          path: 'customer'
        }).populate({
          path: 'attentionItems'
        }).exec();
      let data = {
        date: fn.getDateReport(),
        attention: attention,
        pathServicePhp: config.pathSavePdf
      }

      axios.post(config.pathServicePhp + 'attention.php', data)
        .then(async (response) => {

          await fn.sendEmailAttention(attention._id, 'email');

          res.json({
            status: 'success',
            message: 'Reporte enviado exitosamente'
          });
        })
        .catch(function (error) {
          console.log(error);
        });
      // res.json({
      //   attention,
      //   status: 'success',
      //   message: 'Reporte enviado exitosamente'
      // });

    } else {
      res.json({
        status: 'error',
        message: 'No se puede finalizar, porque la atencion se encuentra incompleta'
      });
    }

  } catch (error) {
    console.log(error);
    res.json({
      status: 'error',
      message: 'Ocurrió un error al finalizar la atención'
    });
  }
});

router.post('/updateObservationBoard', async (req, res) => {

  try {

    schemas.Board.updateOne({ "_id": mongoose.Types.ObjectId(req.body.id) }, {
      $set: {
        observation: req.body.observations,
      }
    }, {
      upsert: true
    }).exec();

    res.json({ status: 'success', message: 'Observación actualizada exitosamente' });

  } catch (error) {
    console.log(error)
    res.json({ status: 'error', message: 'Ocurrió un error al actualizar' });
  }
});

router.post('/removeImageFromAttentionItem', async (req, res) => {

  try {

    let attention = await schemas.Attention.findOne({ _id: mongoose.Types.ObjectId(req.body.id) })
    if (req.body.type == 'before') {
      let photos = attention.photos_before.filter(item => item != req.body.url)
      schemas.Attention.updateOne({ "_id": mongoose.Types.ObjectId(req.body.id) }, {
        $set: {
          photos_before: photos,
        }
      }, {
        upsert: true
      }).exec();
    } else {
      let photos = attention.photos_after.filter(item => item != req.body.url)
      schemas.Attention.updateOne({ "_id": mongoose.Types.ObjectId(req.body.id) }, {
        $set: {
          photos_after: photos,
        }
      }, {
        upsert: true
      }).exec();
    }

    res.json({ status: 'success', message: 'Imagen eliminada exitosamente' });

  } catch (error) {
    console.log(error)
    res.json({ status: 'error', message: 'Ocurrió un error al actualizar' });
  }

});

router.post('/removeImage', async (req, res) => {

  let photos;
  let itemImage;
  console.log(req.body)
  try {

    switch (req.body.group) {
      case 'board':
      case 'finding':
        let itemBoard = await schemas.ItemBoard.findOne({ _id: mongoose.Types.ObjectId(req.body.id) })
        photos = itemBoard.photos.filter(item => item.url != req.body.url)
        schemas.ItemBoard.updateOne({ "_id": mongoose.Types.ObjectId(req.body.id) }, {
          $set: { photos }
        }, { upsert: true }).exec();
        break;

      case 'board':
      case 'attention':
      case 'around':
        itemImage = await schemas.ItemImage.findOne({ _id: mongoose.Types.ObjectId(req.body.id) })
        photos = itemImage.photos.filter(item => item.url != req.body.url)
        schemas.ItemImage.updateOne({ "_id": mongoose.Types.ObjectId(req.body.id) }, {
          $set: { photos }
        }, { upsert: true }).exec();
        break;

      case 'outletSampling':
        itemImage = await schemas.ItemImage.findOne({ _id: mongoose.Types.ObjectId(req.body.id) })
        photos = itemImage.photos.filter(item => item.url != req.body.url)
        schemas.ItemImage.updateOne({ "_id": mongoose.Types.ObjectId(req.body.id) }, {
          $set: { photos }
        }, { upsert: true }).exec();
        break;



      default:
        break;
    }


    if (fs.existsSync('./uploads/' + req.body.url)) {
      if (req.body.url != 'default.png')
        fs.unlinkSync('./uploads/' + req.body.url)
    }




    res.json({ status: 'success', message: 'Imagen eliminada exitosamente' });

  } catch (error) {
    console.log(error)
    res.json({ status: 'error', message: 'Ocurrió un error al actualizar' });
  }

});

router.post('/removeImageFromBoardItem', async (req, res) => {

  try {

    // let itemBoard = await schemas.ItemBoard.findOne({ _id: mongoose.Types.ObjectId(req.body.id) })
    // let photos = itemBoard.photos.filter(item => item.url != req.body.url)
    // schemas.ItemBoard.updateOne({ "_id": mongoose.Types.ObjectId(req.body.id) }, {
    //   $set: {
    //     photos,
    //   }
    // }, {
    //   upsert: true
    // }).exec();

    res.json({ status: 'success', message: 'Imagen eliminada exitosamente' });

  } catch (error) {
    console.log(error)
    res.json({ status: 'error', message: 'Ocurrió un error al actualizar' });
  }
});

router.post('/getRoles', async (req, res) => {

  let { filters, start, end } = req.body;

  let query = schemas.Role.find()
    .select()
  if (start && end) {
    query.skip(start)
      .limit(end)
  }
  if (filters) {
    if (filters.name)
      query.where('name').equals(new RegExp(filters.name, "i"))
    if (filters.status)
      query.where('status').equals(filters.status)
    if (filters.role)
      query.where('_id').equals(filters.role)
  }

  let count = await schemas.Role.countDocuments();

  return new Promise((resolve, reject) => {
    query.exec(function (err, roles) {
      res.json({ status: 'success', roles, count })
    })
  })
});

router.post('/getAttentionsTypes', async (req, res) => {

  let attentionsTypes = await schemas.AttentionType.find()
  res.json({ status: 'success', attentionsTypes })

});

router.post('/createRole', async (req, res) => {

  try {
    let role = new schemas.Role({
      name: req.body.name,
      administrative: false,
      status: 'active',
    });
    await role.save();

    res.json({ status: 'success', role, message: "Tablero registrado exitosamente" });
  } catch (error) {
    console.log(error)
    res.json({ status: 'error', message: error });
  }
});

router.post('/deleteRole', async (req, res) => {
  try {

    schemas.Role.updateOne({ "_id": mongoose.Types.ObjectId(req.body.id) }, {
      $set: {
        status: 'inactive',
      }
    }, {
      multi: true
    }).exec();
    res.json({ status: 'success', message: 'Role desabilitado exitosamente' });

  } catch (error) {
    console.log(error);
    res.json({ status: 'error', message: 'Ocurrió un error al desabilitar el rol' });
  }
});

router.post('/restoreRole', async (req, res) => {
  try {

    schemas.Role.updateOne({ "_id": mongoose.Types.ObjectId(req.body.id) }, {
      $set: {
        status: 'active',
      }
    }, {
      multi: true
    }).exec();
    res.json({ status: 'success', message: 'Role desabilitado exitosamente' });

  } catch (error) {
    console.log(error);
    res.json({ status: 'error', message: 'Ocurrió un error al desabilitar el rol' });
  }
});

router.post('/updateRole', async (req, res) => {
  try {
    schemas.Role.updateOne({ "_id": mongoose.Types.ObjectId(req.body.id) }, {
      $set: {
        name: req.body.name,
      }
    }, {
      multi: true
    }).exec();
    let role = await schemas.Role.findById(mongoose.Types.ObjectId(req.body.id))
    res.json({ status: 'success', role, message: 'Role actualizado exitosamente' });

  } catch (error) {
    console.log(error);
    res.json({ status: 'error', message: 'Ocurrió un error al desabilitar el rol' });
  }
});

router.post('/listNotifications', authMiddleware, async (req, res) => {


  let notifications = [];

  switch (req.currentUser.role.tag) {
    case "administrator":
    case "technical":
    case "ati":
      attentionPending = await schemas.Attention.find({ statusSend: { $in: ['send', 'resend'] }, customer: req.currentUser.id })
      attentionPending.map(attention => {
        let status = '';
        switch (attention.statusSend) {
          case "send":
            status = "Enviada";
            break;
          case "resend":
            status = "Reenviada";
            break;

        }
        let notification = {
          id: attention._id,
          _id: attention._id,
          created_at: Date(),
          type: 'feature',
          status,
          title: `Atención ${attention.description} Pendiente por Aprobar`
        }
        notifications.push(notification)
      })

      requests = await schemas.Request.find({ status: { $in: ['created', 'reject'] } })
      requests.map(request => {

        let notification = {
          id: request._id,
          _id: request._id,
          created_at: Date(),
          type: 'requests',
          status: "Creado",
          title: `Solicitud ${request.description} Pendiente por Aprobar`
        }
        notifications.push(notification)
      })
      break;

    default:
      break
  }

  res.json({ status: 'success', notifications });
});

// router.post('/reportAttention', async (req, res) => {

//   let { start, end, paginate, startDate, endDate, customer, centerOfAttention, serviceType, serviceStatus } = req.body;

//   let queryCount = schemas.Attention.countDocuments();

//   let query = schemas.Attention.find().populate({
//     path: 'attentionItems',
//     populate: [{
//       path: "item"
//     }]
//   }).populate({
//     path: 'customer',
//   }).populate({
//     path: 'attentionType',
//   }).populate({
//     path: 'centerOfAttention',
//   }).populate({
//     path: 'descriptions',
//     populate: [{
//       path: "customer"
//     }]
//   });

//   if (customer) {
//     query.where('customer').equals(mongoose.Types.ObjectId(customer))
//     queryCount.where('customer').equals(mongoose.Types.ObjectId(customer))
//   }
//   if (centerOfAttention)
//     query.where('centerOfAttention').equals(mongoose.Types.ObjectId(centerOfAttention))

//   if (serviceType && serviceType != "1")
//     query.where('attentionType').equals(serviceType)

//   if (serviceStatus)
//     query.where('statusSend').equals(mongoose.Types.ObjectId(serviceStatus))


//   if (startDate && endDate) {
//     let partsStartDate = startDate.split('T')
//     let partsEndDate = endDate.split('T')
//     query.where('date').gte((partsStartDate[0] + " 00:00:00")).lte(partsEndDate[0] + " 23:59:59")
//     queryCount.where('date').gte((partsStartDate[0] + " 00:00:00")).lte(partsEndDate[0] + " 23:59:59")
//   } else if (startDate) {
//     let partsStartDate = startDate.split('T')
//     query.where('date').gte(partsStartDate[0] + " 00:00:00").lte(partsStartDate[0] + " 23:59:59")
//     queryCount.where('date').gte(partsStartDate[0] + " 00:00:00").lte(partsStartDate[0] + " 23:59:59")
//   }
//   if (paginate) {
//     query.skip(start)
//       .limit(end);
//   }
//   let attentions = await query.exec();
//   let count = await queryCount.exec();



//   res.json({ status: 'success', attentions, count });
// });

router.post('/printReportAttention', async (req, res) => {

  let { startDate, endDate, customer, centerOfAttention, serviceType, serviceStatus, source } = req.body;

  let query = schemas.Attention.find().populate({
    path: 'attentionItems',
    populate: [{
      path: "item"
    }]
  }).populate({
    path: 'customer',
  }).populate({
    path: 'attentionType',
  }).populate({
    path: 'centerOfAttention',
  }).populate({
    path: 'descriptions',
    populate: [{
      path: "customer"
    }]
  });

  if (customer) {
    query.where('customer').equals(mongoose.Types.ObjectId(customer))
  }
  if (centerOfAttention)
    query.where('centerOfAttention').equals(mongoose.Types.ObjectId(centerOfAttention))

  if (serviceType && serviceType != "1")
    query.where('attentionType').equals(serviceType)

  if (serviceStatus && serviceStatus != '1')
    query.where('statusSend').equals(mongoose.Types.ObjectId(serviceStatus))

  let dates = fn.getDates(startDate, endDate, source == 'web' ? 'T' : ' ')

  if (dates.start && dates.end) {
    query.where('date').gte(dates.start).lte(dates.end)
  } else if (startDate) {
    query.where('date').gte(dates.start).lte(dates.start)
  }

  let attentions = await query.exec();
  let data = {
    attentions: attentions,
    total: 1000,
  }

  axios.post(`${config.jsReportClient}reports`, {
    shortid: 'HklnmnRtb9',
    data
  }).then(function (response) {
    res.json({
      status: 'success',
      data: response.data,
      message: 'Documento generado exitosamente'
    });

  }).catch(function (error) {
    console.log("error", error);
  })
})

router.post('/requestsReport', authMiddleware, async (req, res) => {

  let { order, status, start, end, paginate, startDate, endDate, requestType, customer, centerOfAttention, source } = req.body
  let dates = fn.getDates(startDate, endDate, source == 'web' ? 'T' : ' ')
  var query = schemas.Request.find()
    .select()
    .populate("request_type")
    .populate("user")
    .populate("centerOfAttention")
    .populate("customer")
    .populate("descriptions")
  let queryCount = schemas.Request.countDocuments();

  query.where('date').gte(dates.start).lte(dates.end);
  if (requestType && requestType != 1) {
    query.where('request_type').equals(mongoose.Types.ObjectId(requestType));
    queryCount.where('request_type').equals(mongoose.Types.ObjectId(requestType));
  }
  if (customer) {
    query.where('customer').equals(mongoose.Types.ObjectId(customer));
    queryCount.where('customer').equals(mongoose.Types.ObjectId(customer));
  }
  if (centerOfAttention) {
    query.where('centerOfAttention').equals(mongoose.Types.ObjectId(centerOfAttention));
    queryCount.where('centerOfAttention').equals(mongoose.Types.ObjectId(centerOfAttention));
  }
  if (order) {
    if (order.key == 'mas') {
      query.sort({ "_id": -1 });
    } else {
      query.sort({ "_id": 1 });
    }
  }
  if (status && status.key != '-1') {
    query.where({ "status": status.key });
    queryCount.where({ "status": status.key });
  }
  if (paginate) {
    query.skip(start)
      .limit(end);
  }

  let requests = await query.exec();
  let count = await queryCount.exec();
  res.json({ status: 'success', requests, count, message: "Success" });

})

router.post('/requestReportExcel', authMiddleware, async (req, res) => {

  let { order, status, start, end, startDate, endDate, requestType, customer, centerOfAttention, source } = req.body

  var workbook = new excel.Workbook();

  var worksheet = workbook.addWorksheet('Reporte de solicitudes');
  var style = workbook.createStyle({
    font: {
      color: '#000000',
      size: 12
    },
    bold: true,
  });
  worksheet.cell(1, 1).string('FECHA').style(style);
  worksheet.cell(1, 2).string('#').style(style);
  worksheet.cell(1, 3).string('CREADOR').style(style);
  worksheet.cell(1, 4).string('CLIENTE').style(style);
  worksheet.cell(1, 5).string('DESCRIPCIÓN').style(style);
  worksheet.cell(1, 6).string('TIPO').style(style);
  worksheet.cell(1, 7).string('CENTRO DE ATENCIÓN').style(style);
  worksheet.cell(1, 8).string('ESTADO').style(style);

  let dates = fn.getDates(startDate, endDate, source == 'web' ? 'T' : ' ')
  console.log(dates)
  console.log(req.body)

  var query = schemas.Request.find()
    .select()
    .populate("request_type")
    .populate("user")
    .populate("centerOfAttention")
    .populate("customer")
    .populate({
      path: "descriptions",
      populate: [{ path: 'user' }]
    })
  query.where('date').gte(dates.start).lte(dates.end);
  if (requestType) {
    query.where('request_type').equals(mongoose.Types.ObjectId(requestType));
  }
  if (customer) {
    query.where('customer').equals(mongoose.Types.ObjectId(customer));
  }
  if (centerOfAttention) {
    query.where('centerOfAttention').equals(mongoose.Types.ObjectId(centerOfAttention));
  }
  if (order) {
    if (order.key == 'mas') {
      query.sort({ "_id": -1 });
    } else {
      query.sort({ "_id": 1 });
    }
  }
  if (status && status.key != '-1') {
    query.where({ "status": status.key });
  }
  let requests = await query.exec();

  style = workbook.createStyle({
    font: {
      color: '#000000',
      size: 12
    },
  });
  let row = 2;
  requests.map(request => {
    worksheet.cell(row, 1).date(request.date.toString()).style(style);
    worksheet.cell(row, 2).string(request.number.toString()).style(style);
    worksheet.cell(row, 3).string(request.user.name).style(style);
    worksheet.cell(row, 4).string(request.customer.name).style(style);
    worksheet.cell(row, 5).string(request.description).style(style);
    worksheet.cell(row, 6).string(request.request_type.type).style(style);
    worksheet.cell(row, 7).string(request.centerOfAttention.title).style(style);
    worksheet.cell(row, 8).string(request.status).style(style);

    row++;
  })
  await workbook.write('./excel/report.xlsx', "");
  var interval = setInterval(() => {
    if (fs.existsSync('./excel/report.xlsx')) {
      const fs = require('fs');
      const contents = fs.readFileSync('./excel/report.xlsx', { encoding: 'base64' });
      res.json({ status: "success", "base64": contents });
      clearInterval(interval);
    }
  }, 1000);


})

router.post('/printRequest', async (req, res) => {

  let { id } = req.body;
  request = await schemas.Request.findById(id)
    .populate("request_type")
    .populate("user")
    .populate("centerOfAttention")
    .populate({
      path: "descriptions",
      populate: [{ path: 'user' }]
    })
  let data = {
    request: request,
    total: 1000,
  }

  axios.post(`${config.jsReportClient}reports`, {
    shortid: 'Hyl9fp6c25',
    data
  }).then(function (response) {
    // console.log(response.data)
    res.json({
      status: 'success',
      base64: response.data,
      message: 'Documento generado exitosamente'
    });

  }).catch(function (error) {
    console.log("error", error);
  })
});

router.post('/printRequests', async (req, res) => {

  let { order, status, start, startDate, endDate, end, requestType, customer, centerOfAttention, source } = req.body
  let dates = fn.getDates(startDate, endDate, source == 'web' ? 'T' : ' ')

  var query = schemas.Request.find()
    .select()
    .populate("request_type")
    .populate("user")
    .populate("centerOfAttention")
    .populate("customer")
    .populate({
      path: "descriptions",
      populate: [{ path: 'user' }]
    })

  query.where('date').gte(dates.start).lte(dates.end);
  if (requestType) {
    query.where('request_type').equals(mongoose.Types.ObjectId(requestType));
  }
  if (customer) {
    query.where('customer').equals(mongoose.Types.ObjectId(customer));
  }
  if (centerOfAttention) {
    query.where('centerOfAttention').equals(mongoose.Types.ObjectId(centerOfAttention));
  }
  if (order) {
    if (order.key == 'mas') {
      query.sort({ "_id": -1 });
    } else {
      query.sort({ "_id": 1 });
    }
  }
  if (status && status.key != '-1') {
    query.where({ "status": status.key });
  }

  let requests = await query.exec();
  let data = {
    requests: requests,
    total: 1000,
  }

  axios.post(`${config.jsReportClient}reports`, {
    shortid: 'WaIAVAU',
    data
  }).then(function (response) {
    res.json({
      status: 'success',
      base64: response.data,
      message: 'Documento generado exitosamente'
    });

  }).catch(function (error) {
    console.log("error", error);
  })
});

router.post('/attentionsReport', authMiddleware, async (req, res) => {

  let { order, status, start, end, paginate, startDate, endDate, attentionType, customer, centerOfAttention, source } = req.body

  console.log("---------------------------------------------")
  console.log(req.body)
  let dates = fn.getDates(startDate, endDate, source == 'web' ? 'T' : ' ')
  console.log(dates)
  let query = schemas.Attention.find()
    .populate({
      path: 'attentionItems',
      populate: [{
        path: "item"
      }]
    }).populate({
      path: 'customer',
    }).populate({
      path: 'creator',
    }).populate({
      path: 'attentionType',
    }).populate({
      path: 'centerOfAttention',
    }).populate({
      path: 'descriptions',
      populate: [{
        path: "customer"
      }]
    });
  let queryCount = schemas.Attention.countDocuments();

  query.where('date').gte(dates.start).lte(dates.end);
  if (attentionType) {
    query.where('attentionType').equals(mongoose.Types.ObjectId(attentionType));
    queryCount.where('attentionType').equals(mongoose.Types.ObjectId(attentionType));
  }
  if (customer) {
    query.where('customer').equals(mongoose.Types.ObjectId(customer));
    queryCount.where('customer').equals(mongoose.Types.ObjectId(customer));
  }
  if (centerOfAttention) {
    query.where('centerOfAttention').equals(mongoose.Types.ObjectId(centerOfAttention));
    queryCount.where('centerOfAttention').equals(mongoose.Types.ObjectId(centerOfAttention));
  }
  if (order) {
    if (order.key == 'mas') {
      query.sort({ "_id": -1 });
    } else {
      query.sort({ "_id": 1 });
    }
  }
  if (paginate) {
    query.skip(start)
      .limit(end);
  }
  if (status && status.key != '-1') {
    query.where({ "status": status.key });
    queryCount.where({ "status": status.key });
  }
  let attentions = await query.exec();
  let count = await queryCount.exec();
  res.json({ status: 'success', attentions, count, message: "Success" });

});

router.post('/attentionReportExcel', authMiddleware, async (req, res) => {
  let { order, status, startDate, endDate, attentionType, customer, centerOfAttention, source } = req.body

  let dates = fn.getDates(startDate, endDate, source == 'web' ? 'T' : ' ')
  let query = schemas.Attention.find()
    .populate({
      path: 'attentionItems',
      populate: [{
        path: "item"
      }]
    }).populate({
      path: 'customer',
    }).populate({
      path: 'creator',
    }).populate({
      path: 'attentionType',
    }).populate({
      path: 'centerOfAttention',
    })

  query.where('date').gte(dates.start).lte(dates.end);
  if (attentionType) {
    query.where('attentionType').equals(mongoose.Types.ObjectId(attentionType));
  }
  if (customer) {
    query.where('customer').equals(mongoose.Types.ObjectId(customer));
  }
  if (centerOfAttention) {
    query.where('centerOfAttention').equals(mongoose.Types.ObjectId(centerOfAttention));
  }
  if (order) {
    if (order.key == 'mas') {
      query.sort({ "_id": -1 });
    } else {
      query.sort({ "_id": 1 });
    }
  }
  if (status && status.key != '-1') {
    query.where({ "status": status.key });
  }

  let attentions = await query.exec();



  var workbook = new excel.Workbook();

  var worksheet = workbook.addWorksheet('Reporte de solicitudes');
  var style = workbook.createStyle({
    font: {
      color: '#000000',
      size: 12
    },
    bold: true,
  });
  worksheet.cell(1, 1).string('FECHA').style(style);
  worksheet.cell(1, 2).string('#').style(style);
  worksheet.cell(1, 3).string('CREADOR').style(style);
  worksheet.cell(1, 4).string('CLIENTE').style(style);
  worksheet.cell(1, 5).string('DESCRIPCIÓN').style(style);
  worksheet.cell(1, 6).string('TIPO').style(style);
  worksheet.cell(1, 7).string('CENTRO DE ATENCIÓN').style(style);
  worksheet.cell(1, 8).string('ESTADO').style(style);
  worksheet.cell(1, 9).string('PRECIO').style(style);

  style = workbook.createStyle({
    font: {
      color: '#000000',
      size: 12
    },
  });
  let row = 2;
  attentions.map(attention => {
    worksheet.cell(row, 1).date(attention.date.toString()).style(style);
    worksheet.cell(row, 2).string(attention.number.toString()).style(style);
    worksheet.cell(row, 3).string(attention.creator ? attention.creator.name : '').style(style);
    worksheet.cell(row, 4).string(attention.customer.name).style(style);
    worksheet.cell(row, 5).string(attention.description).style(style);
    worksheet.cell(row, 6).string(attention.attentionType.type).style(style);
    worksheet.cell(row, 7).string(attention.centerOfAttention ? attention.centerOfAttention.title : '').style(style);
    worksheet.cell(row, 8).string(attention.status).style(style);
    worksheet.cell(row, 9).number(Number(attention.price)).style(style);
    row++;
  })
  await workbook.write('./excel/report.xlsx', "");
  var interval = setInterval(() => {
    if (fs.existsSync('./excel/report.xlsx')) {
      const fs = require('fs');
      const contents = fs.readFileSync('./excel/report.xlsx', { encoding: 'base64' });
      res.json({ status: "success", "base64": contents });
      clearInterval(interval);
    }
  }, 1000);


});

router.post('/attentionsReportPdf', async (req, res) => {

  console.log(req.body)
  let { order, status, start, end, startDate, endDate, attentionType, customer, centerOfAttention, source } = req.body

  let dates = fn.getDates(startDate, endDate, source == 'web' ? 'T' : ' ')
  let query = schemas.Attention.find()
    .populate({
      path: 'attentionItems',
      populate: [{
        path: "item"
      }]
    }).populate({
      path: 'customer',
    }).populate({
      path: 'creator',
    }).populate({
      path: 'attentionType',
    }).populate({
      path: 'centerOfAttention',
    })
  // .populate({
  //   path: 'descriptions',
  //   populate: [{
  //     path: "customer"
  //   }]
  // });
  let queryCount = schemas.Attention.countDocuments();

  query.where('date').gte(dates.start).lte(dates.end);
  if (attentionType) {
    query.where('attentionType').equals(mongoose.Types.ObjectId(attentionType));
  }
  if (customer) {
    query.where('customer').equals(mongoose.Types.ObjectId(customer));
  }
  if (centerOfAttention) {
    query.where('centerOfAttention').equals(mongoose.Types.ObjectId(centerOfAttention));
  }
  if (order) {
    if (order.key == 'mas') {
      query.sort({ "_id": -1 });
    } else {
      query.sort({ "_id": 1 });
    }
  }
  if (status && status.key != '-1') {
    query.where({ "status": status.key });
  }

  let attentions = await query.exec();

  let data = {
    attentions,
    total: 1000,
  }

  axios.post(`${config.jsReportClient}reports`, {
    shortid: 'HklnmnRtb9',
    data
  }).then(function (response) {
    res.json({
      status: 'success',
      base64: response.data,
      message: 'Documento generado exitosamente'
    });

  }).catch(function (error) {
    console.log("error", error);
  })
})

router.post('/maintenancesReport', authMiddleware, async (req, res) => {

  let { order, start, end, paginate, startDate, endDate, maintenanceType, customer, centerOfAttention, source } = req.body


  let dates = fn.getDates(startDate, endDate, source == 'web' ? 'T' : ' ')
  let queryCount = schemas.Maintenance.countDocuments();
  var query = schemas.Maintenance.find().populate({
    path: 'boards',
    populate: [{
      path: "itemsBoards",
      populate: [{
        path: "item"
      }]
    }]
  }).populate({
    path: 'customer'
  }).populate({
    path: 'aroundItems',
    populate: [{
      path: "item"
    }]
  }).populate({
    path: 'outletSampling',
    populate: [{
      path: "item"
    }]
  }).populate({
    path: 'emergencylight',
    populate: [{
      path: "item"
    }]
  }).populate({
    path: 'upsAutonomy',
    populate: [{
      path: "item"
    }]
  })
    .populate('maintenanceType')
    .populate('creator')
    .populate('centerOfAttention')
    .sort({ '_id': -1 });
  query.where('date').gte(dates.start).lte(dates.end);

  if (req.body.paginate) {
    query.skip(start)
      .limit(end);
  }


  if (maintenanceType && maintenanceType != '-1') {
    query.where('type').equals(maintenanceType);
    queryCount.where('type').equals(maintenanceType);
  }
  if (customer) {
    query.where('customer').equals(mongoose.Types.ObjectId(customer));
    queryCount.where('customer').equals(mongoose.Types.ObjectId(customer));
  }
  if (centerOfAttention) {
    query.where('centerOfAttention').equals(mongoose.Types.ObjectId(centerOfAttention));
    queryCount.where('centerOfAttention').equals(mongoose.Types.ObjectId(centerOfAttention));
  }
  if (order) {
    if (order.key == 'mas') {
      query.sort({ "_id": -1 });
    } else {
      query.sort({ "_id": 1 });
    }
  }
  if (paginate) {
    query.skip(start)
      .limit(end);
  }

  let maintenances = await query.exec();
  let count = await queryCount.exec();
  res.json({ status: 'success', message: "Success", maintenances, count });

});
router.post('/maintenancesReportPdf', authMiddleware, async (req, res) => {

  let { order, startDate, endDate, maintenanceType, customer, centerOfAttention, source } = req.body


  let dates = fn.getDates(startDate, endDate, source == 'web' ? 'T' : ' ')
  let queryCount = schemas.Maintenance.countDocuments();
  var query = schemas.Maintenance.find().populate({
    path: 'customer'
  })
    .populate('maintenanceType')
    .populate('creator')
    .populate('centerOfAttention')
    .sort({ '_id': -1 });
  query.where('date').gte(dates.start).lte(dates.end);

  if (maintenanceType && maintenanceType != '-1') {
    query.where('type').equals(maintenanceType);
    queryCount.where('type').equals(maintenanceType);
  }
  if (customer) {
    query.where('customer').equals(mongoose.Types.ObjectId(customer));
    queryCount.where('customer').equals(mongoose.Types.ObjectId(customer));
  }
  if (centerOfAttention) {
    query.where('centerOfAttention').equals(mongoose.Types.ObjectId(centerOfAttention));
    queryCount.where('centerOfAttention').equals(mongoose.Types.ObjectId(centerOfAttention));
  }
  if (order) {
    if (order.key == 'mas') {
      query.sort({ "_id": -1 });
    } else {
      query.sort({ "_id": 1 });
    }
  }
  let maintenances = await query.exec();

  let total = 0;
  maintenances.map(maintenance => {
    total += maintenance.price
  })
  let data = {
    maintenances,
    total,
  }

  axios.post(`${config.jsReportClient}reports`, {
    shortid: 'HklMFZJPac',
    data
  }).then(function (response) {
    res.json({
      status: 'success',
      base64: response.data,
      message: 'Documento generado exitosamente'
    });

  }).catch(function (error) {
    console.log("error", error);
  })


});
router.post('/maintenancesReportExcel', authMiddleware, async (req, res) => {
  let { order, startDate, endDate, maintenanceType, customer, centerOfAttention, source } = req.body
  let dates = fn.getDates(startDate, endDate, source == 'web' ? 'T' : ' ')
  let queryCount = schemas.Maintenance.countDocuments();
  var query = schemas.Maintenance.find().populate({
    path: 'customer'
  })
    .populate('maintenanceType')
    .populate('creator')
    .populate('centerOfAttention')
    .sort({ '_id': -1 });
  query.where('date').gte(dates.start).lte(dates.end);

  if (maintenanceType && maintenanceType != '-1') {
    query.where('type').equals(maintenanceType);
    queryCount.where('type').equals(maintenanceType);
  }
  if (customer) {
    query.where('customer').equals(mongoose.Types.ObjectId(customer));
    queryCount.where('customer').equals(mongoose.Types.ObjectId(customer));
  }
  if (centerOfAttention) {
    query.where('centerOfAttention').equals(mongoose.Types.ObjectId(centerOfAttention));
    queryCount.where('centerOfAttention').equals(mongoose.Types.ObjectId(centerOfAttention));
  }
  if (order) {
    if (order.key == 'mas') {
      query.sort({ "_id": -1 });
    } else {
      query.sort({ "_id": 1 });
    }
  }
  let maintenances = await query.exec();

  let total = 0;
  maintenances.map(maintenance => {
    total += maintenance.price
  })
  let data = {
    maintenances,
    total,
  }

  var workbook = new excel.Workbook();

  var worksheet = workbook.addWorksheet('Reporte de solicitudes');
  var style = workbook.createStyle({
    font: {
      color: '#000000',
      size: 12
    },
    bold: true,
  });
  worksheet.cell(1, 1).string('FECHA').style(style);
  worksheet.cell(1, 2).string('TIPO').style(style);
  worksheet.cell(1, 3).string('CLIENTE').style(style);
  worksheet.cell(1, 4).string('CREADOR').style(style);
  worksheet.cell(1, 5).string('NOMBRE').style(style);
  worksheet.cell(1, 6).string('DESCRIPCIÓN').style(style);
  worksheet.cell(1, 7).string('CENTRO DE ATENCIÓN').style(style);
  worksheet.cell(1, 9).string('PRECIO').style(style);

  style = workbook.createStyle({
    font: {
      color: '#000000',
      size: 12
    },
  });
  let row = 2;
  maintenances.map(maintenance => {

    worksheet.cell(row, 1).date(maintenance.date.toString()).style(style);
    worksheet.cell(row, 2).string(maintenance.type == 'tri' ? "Trifásico" : "Monofásico").style(style);
    worksheet.cell(row, 3).string(maintenance.customer ? maintenance.customer.name : '').style(style);
    worksheet.cell(row, 4).string(maintenance.creator ? maintenance.creator.name : '').style(style);
    worksheet.cell(row, 5).string(maintenance.name).style(style);
    worksheet.cell(row, 6).string(maintenance.description).style(style);
    worksheet.cell(row, 7).string(maintenance.centerOfmaintenance ? maintenance.centerOfmaintenance.title : '').style(style);
    worksheet.cell(row, 8).number(Number(maintenance.price)).style(style);
    row++;
  })
  await workbook.write('./excel/report.xlsx', "");
  var interval = setInterval(() => {
    if (fs.existsSync('./excel/report.xlsx')) {
      const fs = require('fs');
      const contents = fs.readFileSync('./excel/report.xlsx', { encoding: 'base64' });
      res.json({ status: "success", "base64": contents });
      clearInterval(interval);
    }
  }, 1000);



});


module.exports = router;
