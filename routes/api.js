var express = require('express');
var router = express.Router();
var multer = require('multer')
var fs = require('fs');
var upload = multer({ dest: './uploads/' })
var fn = require("./../utils/fn");
var schemas = require("./../db/schemas");
const bcrypt = require("bcrypt");
const authMiddleware = require("../middleware/auth");
var mongoose = require('mongoose');
const notification = require('../utils/notification');


router.post('/', (req, res, next) => {
  console.log(req.body);
  console.log(req);

  res.json({ status: 'respond with a resource' });
});

router.post('/login', async (req, res, next) => {

  let user = await schemas.User.findOne({ 'username': req.body.username })
  if (user) {
    let result = bcrypt.compareSync(req.body.password, user.password);
    let token = fn.createToken(user, process.env.SECRET, "100hr");
    if (result) {
      res.json({ status: 'success', token, id: user._id });
    } else {
      res.json({ status: 'error', message: 'Contraseña incorrecta' });
    }
  } else {
    res.json({ status: 'error', message: 'Usuario no encontrado' });
  }
});

router.post('/listProjects', authMiddleware, async (req, res) => {

  var query = schemas.Project.find().populate({
    path: 'boards',
    populate: [{
      path: "itemsBoards",
      populate: [{
        path: "item"
      }]
    }]
  }).populate({
    path: 'customer'
  });

  if (req.body.search) {
    query.where('name').equals(new RegExp(req.body.search, "i"));
  }
  let projects = await query.exec();
  let count = await schemas.Project.countDocuments();
  res.json({ status: 'success', projects, count });
});

router.post('/listAttentions', authMiddleware, async (req, res) => {
  console.log(req.body);
  var query = schemas.Attention.find().populate({
    path: 'customer'
  });

  if (req.body.search) {
    query.where('description').equals(new RegExp(req.body.search, "i"));
  }
  let attentions = await query.exec();
  let count = await schemas.Attention.countDocuments();
  res.json({ status: 'success', attentions, count });
});

router.post('/getAttention', async (req, res) => {
  console.log('e ', req.body);

  let attention = await schemas.Attention.findById(mongoose.Types.ObjectId(req.body.attention)).populate({
    path: 'customer',
  }).exec();

  res.json({ status: 'success', attention });
});

router.post('/listCustomers', async (req, res) => {
  console.log("----------------------- Body ----------------------");
  console.log(req.body);
  var query = schemas.Customer.find().select();

  if (req.body.search) {
    query.where('name').equals(new RegExp(req.body.search, "i"));
  }
  let customers = await query.exec();
  res.json({ status: 'success', customers });
});

router.post('/listBoards', authMiddleware, async (req, res) => {

  console.log(req.body)
  var query = schemas.Board.find().sort({ '_id': 1 }).select();
  if (req.body.project) {
    query.where('project').equals(mongoose.Types.ObjectId(req.body.project));
  }
  let boards = await query.exec();
  res.json({ status: 'success', boards });
});

router.post('/createBoard', async (req, res) => {

  console.log(req.body)
  let itemsBoards = [];
  try {
    let board = new schemas.Board({
      name: req.body.name,
      type: req.body.type,
      status: 'created',
      project: mongoose.Types.ObjectId(req.body.project),
    });
    if (req.body.type == 'tri') {
      items = await schemas.Item.find({ mode: { $in: ['tri', 'after', 'before'] }, })
    } else {
      items = await schemas.Item.find({ mode: { $in: ['mono', 'after', 'before'] }, })
    }

    await fn.asyncForEach(items, async (item, index) => {
      let itemBoard = schemas.ItemBoard({
        board: board._id,
        item: mongoose.Types.ObjectId(item._id),
        status: 'activo',
        photos: [],
        value: 0.0,
      });
      await itemBoard.save();
      itemsBoards.push(itemBoard);
    });
    board.itemsBoards = itemsBoards;
    await board.save();

    schemas.Project.updateOne({ "_id": mongoose.Types.ObjectId(req.body.project) }, {
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

router.post('/createCustomer', async (req, res) => {

  try {
    let customer = new schemas.Customer({
      name: req.body.name,
      address: req.body.address,
      email: req.body.email,
      phone: req.body.phone
    });
    customer.save();

    res.json({ status: 'success', message: "Cliente registrado exitosamente.", customer, });
  } catch (error) {
    console.log(error)
    let customer = {
      id: "",
    }
    res.json({ status: 'error', message: error, customer });

  }
});

router.post('/getItemBoard', async (req, res) => {

  console.log(req.body)
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

router.post('/createProject', async (req, res) => {

  try {
    let project = new schemas.Project({
      name: req.body.name,
      type: req.body.type,
      customer: mongoose.Types.ObjectId(req.body.customer)
    });
    project.save();

    res.json({ status: 'success', message: "Proyecto registrado exitosamente.", project, });
  } catch (error) {
    console.log(error)
    res.json({ status: 'error', message: error });
  }
});

router.post('/removeMeasurement', async (req, res) => {

  console.log(req.body);
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
  console.log(req.body);

  console.log("---------------- board ----------------");
  console.log(req.body.board);
  console.log("---------------- board ----------------");

  console.log(req.files);
  console.log("---------------- file ----------------");


  try {
    await fn.asyncForEach(req.files, async (file, index) => {
      let src = fs.createReadStream(file.path);
      let fileName = fn.makedId(10) + "." + fn.fileExtension(file.originalname)
      let dest = await fs.createWriteStream('./uploads/' + fileName);
      src.pipe(dest);
      src.on('end', () => {
        console.log('end');
        fs.unlinkSync(file.path);
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
    for (var key in req.body) {
      if (key.length == 24 && parseFloat(req.body[key]) > 0) {
        console.log('key ', key);
        console.log('value ', req.body[key]);

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

router.post('/createAttention', upload.any("pictures"), async (req, res) => {
  console.log(req.body);
  console.log("---------------- files ----------------");
  console.log(req.files);
  console.log("---------------- file ----------------");

  // let attention = new schemas.Attention({

  // });
  // await attention.save();
  try {

    let attention = new schemas.Attention({
      photos_before: [],
      photos_after: [],
      description: req.body.observations,
      signature: "",
      status: "created",
      customer: mongoose.Types.ObjectId(req.body.customer),
      presave: true
    });

    if (req.files) {
      await fn.asyncForEach(req.files, async (file) => {
        let fileName = fn.makedId(10) + "." + fn.fileExtension(file.originalname)
        let src = await fs.createReadStream(file.path);
        let dest = await fs.createWriteStream('./uploads/' + fileName);
        src.pipe(dest);
        src.on('end', () => {
          console.log('end');
          fs.unlinkSync(file.path);
        });
        src.on('error', (err) => {
          console.log(err)
        });

        attention.photos_before.push(fileName);
      });
      console.log(`Saving all`);
    }

    await attention.save();

    res.json({ status: 'success' });

  } catch (error) {
    res.json({ status: 'success' });
  }

});

router.post('/finishBoard', async (req, res) => {
  try {
    schemas.Board.updateOne({ "_id": mongoose.Types.ObjectId(req.body.id) }, {
      $set: {
        status: 'finished'
      }
    }, {
      multi: true
    }).exec();


    let board = await schemas.Board.findById(mongoose.Types.ObjectId(req.body.id));
    let users = await schemas.User.find({ role: 'administrator' });

    let data = {
      "type": "board",
      board
    }


    let registration_ids = [];
    users.forEach(user => {
      if (user.token) {
        registration_ids.push(user.token);
      }
      notification.sendNotification('', registration_ids, 'Tablero finalizado', `El tablero ${board.name} ha finalizado`, data);
    });

    await fn.sendEmailBoard(req.body.id);

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

router.post('/finishAttention', async (req, res) => {
  try {

    schemas.Attention.updateOne({ "_id": mongoose.Types.ObjectId(req.body.id) }, {
      $set: {
        status: 'finished'
      }
    }, {
      multi: true
    }).exec();

    let attention = await schemas.Attention.findById(mongoose.Types.ObjectId(req.body.id));
    let users = await schemas.User.find({ role: 'administrator' });

    let data = {
      "type": "attention",
      attention
    }

    let registration_ids = [];
    users.forEach(user => {
      if (user.token) {
        registration_ids.push(user.token);
      }
      notification.sendNotification('', registration_ids, 'Tablero finalizado', `La atención ${attention.description} ha finalizado`, data);
    });

    await fn.sendEmailAttention(req.body.id);

    res.json({
      status: 'success',
      message: 'Atención finalizada exitosamente'
    });

  } catch (error) {
    console.log(error);
    res.json({
      status: 'error',
      message: 'Ocurrió un error al finalizar la atención'
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

router.post('/updateAttention', upload.any("pictures"), async (req, res) => {
  console.log(req.body);
  console.log("---------------- files ----------------");
  console.log(req.files);
  console.log("---------------- file ----------------");

  try {

    let fileNameSign = '';

    if (req.files) {
      await fn.asyncForEach(req.files, async (file) => {
        let fileName = fn.makedId(10) + "." + fn.fileExtension(file.originalname)
        let src = await fs.createReadStream(file.path);
        let dest = await fs.createWriteStream('./uploads/' + fileName);
        src.pipe(dest);
        src.on('end', () => {
          console.log('end');
          fs.unlinkSync(file.path);
        });
        src.on('error', (err) => {
          console.log(err)
        });
        if (file.fieldname == '1') {
          schemas.Attention.updateOne({ "_id": mongoose.Types.ObjectId(req.body.id) }, {
            $push: {
              photos_before: fileName,
            }
          }, {
            upsert: true
          }).exec();
        } else if (file.fieldname == '2') {
          schemas.Attention.updateOne({ "_id": mongoose.Types.ObjectId(req.body.id) }, {
            $push: {
              photos_after: fileName,
            }
          }, {
            upsert: true
          }).exec();
        } else {
          fileNameSign = fileName;
        }
      });
    }

    schemas.Attention.updateOne({ "_id": mongoose.Types.ObjectId(req.body.id) }, {
      $set: {
        description: req.body.observations,
        customer: mongoose.Types.ObjectId(req.body.customer),
        signature: fileNameSign,
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

router.post('/getItemAttention', async (req, res) => {

  items = await schemas.Item.findById(mongoose.Types.ObjectId(req.body.board),).populate({
    path: 'itemsBoards',
    populate: [{
      path: "item"
    }]
  }).exec();
  res.json({ status: 'success', completed, items });
});

router.post('/getInfoUser', async (req, res) => {

  let user = await schemas.User.findById(mongoose.Types.ObjectId(req.body.id),).exec();
  res.json({ status: 'success', user });
});

router.post('/updateAccount', upload.any("pictures"), async (req, res) => {
  try {
    console.log(req.body);
    console.log("---------------- files ----------------");
    console.log(req.files);
    console.log("---------------- file ----------------");

    let fileName = 'default.png';
    await fn.asyncForEach(req.files, async (file) => {
      let src = fs.createReadStream(file.path);
      fileName = fn.makedId(10) + "." + fn.fileExtension(file.originalname)
      let dest = await fs.createWriteStream('./uploads/' + fileName);
      src.pipe(dest);
      src.on('end', () => {
        console.log('end');
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
        document_number: req.body.document_number,
        username: req.body.username,
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

router.post('/updateToken', async (req, res) => {
  try {
    console.log(req.body);
    console.log("---------------- files ----------------");

    schemas.User.updateOne({ "_id": mongoose.Types.ObjectId(req.body.id) }, {
      $set: {
        token: req.body.token
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

router.post('/listUsers', async (req, res) => {

  console.log(req.body)
  var query = schemas.User.find().sort({ '_id': 1 }).select();
  // if (req.body.project) {
  //   query.where('project').equals(mongoose.Types.ObjectId(req.body.project));
  // }
  let users = await query.exec();
  let count = await schemas.User.countDocuments();

  res.json({ status: 'success', users, count });
});

router.post('/updateUser', upload.any("photo"), async (req, res) => {
  try {
    await fn.asyncForEach(req.files, async (file) => {
      let src = fs.createReadStream(file.path);
      let fileName = fn.makedId(10) + "." + fn.fileExtension(file.originalname)
      let dest = await fs.createWriteStream('./uploads/' + fileName);
      src.pipe(dest);
      src.on('end', () => {
        console.log('end');
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
    console.log(req.body);
    console.log(req.files);
    try {
      if (req.files) {
        await fn.asyncForEach(req.files, async (file) => {
          let src = fs.createReadStream(file.path);
          fileName = fn.makedId(10) + "." + fn.fileExtension(file.originalname)
          let dest = await fs.createWriteStream('./uploads/' + fileName);
          src.pipe(dest);
          src.on('end', () => {
            console.log('end');
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
      }

      const salt = await bcrypt.genSalt(10);
      let password = await bcrypt.hash(req.body.password, salt);

      let user = schemas.User({
        name: req.body.name,
        username: req.body.username,
        document_number: req.body.documentNumber,
        role: req.body.role,
        photo: fileName,
        password: password,
        status: 'activo'
      });
      await user.save()

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

router.post('/openItemBoard', async (req, res) => {
  console.log(req.body)
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

  let response = await fn.sendEmailBoard(req.body.id);
  res.json({
    status: 'success',
    message: 'Correo enviado'
  });
});

module.exports = router;
