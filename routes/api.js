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
const config = require('./../config')
const axios = require('axios').default;



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

  let count = await schemas.Customer.countDocuments();
  res.json({ status: 'success', customers, count });
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

  let itemsBoards = [];
  try {
    let board = new schemas.Board({
      name: req.body.name,
      type: req.body.type,
      status: 'created',
      project: mongoose.Types.ObjectId(req.body.project),
      observation: ''
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

router.post('/createProject', async (req, res) => {

  try {
    let project = new schemas.Project({
      name: req.body.name,
      type: req.body.type,
      observation: req.body.observation,
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
      let outStream = await fs.createWriteStream('./uploads/' + fileName);
      src.pipe(outStream);

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

  try {

    let attention = new schemas.Attention({
      photos_before: [],
      photos_after: [],
      description: req.body.observations,
      title: req.body.title,
      names: req.body.name,
      document: req.body.document,
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
    let board = await schemas.Board.findById(mongoose.Types.ObjectId(req.body.id),).populate({
      path: 'itemsBoards',
      match: { status: "activo" },
      populate: [{
        path: "item",

      }]
    }).exec();

    if (fn.validateBoard(board)) {
      schemas.Board.updateOne({ "_id": mongoose.Types.ObjectId(req.body.id) }, {
        $set: {
          status: 'finished'
        }
      }, {
        multi: true
      }).exec();

      let users = await schemas.User.find({ role: 'administrator' });


      let registration_ids = [];
      users.forEach(user => {
        if (user.token) {
          registration_ids.push(user.token);
        }
        notification.sendNotification('', registration_ids, 'Tablero finalizado', `El tablero ${board.name} ha finalizado`, data);
      });

      // await fn.sendEmailBoard(req.body.id);

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

router.post('/finishProject', async (req, res) => {
  try {
    let project = await schemas.Project.findById(mongoose.Types.ObjectId(req.body.id),).populate({
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

    let newBoards = project.boards.map(board => {

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
    let newProject = {
      date: fn.getDateReport(),
      name: project.name,
      type: project.type === 'tri' ? 'Trifásico' : 'Monofásico',
      customer: project.customer,
      boards: newBoards,
    }
    console.log(JSON.stringify(newProject, null, 6))



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
        title: req.body.title,
        customer: mongoose.Types.ObjectId(req.body.customer),
        signature: fileNameSign,
        names: req.body.name,
        document: req.body.document,
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
          schemas.User.updateOne({ "_id": mongoose.Types.ObjectId(req.body.id) }, {
            $set: {
              photo: fileName
            }
          }, {
            multi: true
          }).exec();
        });
      }

      // const salt = await bcrypt.genSalt(10);
      // let password = await bcrypt.hash(req.body.password, salt);

      let user = schemas.User({
        name: req.body.name,
        username: req.body.username,
        document_number: req.body.documentNumber,
        role: req.body.role,
        photo: fileName,
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

  await fn.sendEmailBoard(req.body.id);
  res.json({
    status: 'success',
    message: 'Correo enviado'
  });
});

router.post('/sendEmailAttention', async (req, res) => {

  await fn.sendEmailAttention(req.body.id);
  res.json({
    status: 'success',
    message: 'Correo enviado'
  });
});

router.post('/createCustomer', async (req, res) => {

  console.log('asdkaldadldlfjaldfjlasdjlsjfldajflkasdjklalfkajlk')
  console.log(req.body)
  let cus = await schemas.Customer.findOne({ 'nit': req.body.nit })
  if (!cus) {

    try {

      let customer = schemas.Customer({
        name: req.body.name,
        nit: req.body.nit,
        address: req.body.address,
        phone: req.body.phone,
        email: req.body.email,
        status: 'activo'
      });
      await customer.save()

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
  console.log(req.body)
  try {

    schemas.Customer.updateOne({ "_id": mongoose.Types.ObjectId(req.body.id) }, {
      $set: {
        name: req.body.name,
        nit: req.body.nit,
        address: req.body.username,
        phone: req.body.phone,
        email: req.body.email,
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
  console.log(req.body)
  try {

    schemas.Project.updateOne({ "_id": mongoose.Types.ObjectId(req.body.id) }, {
      $set: {
        observation: req.body.observations,
      }
    }, {
      multi: true
    }).exec();
    res.json({ status: 'success', message: 'Proyecto actualizado exitosamente' });
  } catch (error) {
    console.log(error);
    res.json({ status: 'error', message: 'Ocurrio un error al actualizar' });
  }
});

router.post('/sendReportProject', async (req, res) => {
  try {
    let project = await schemas.Project.findById(mongoose.Types.ObjectId(req.body.id),).populate({
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

    let newBoards = project.boards.map(board => {

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
      return newBoard;

    })
    let data = {
      id: project._id,
      date: fn.getDateReport(),
      name: project.name,
      type: project.type === 'tri' ? 'Trifásico' : 'Monofásico',
      customer: project.customer,
      boards: newBoards,
      pathServicePhp: config.pathSavePdf
    }

    axios.post(config.pathServicePhp + 'project.php', data)
      .then(async (response) => {

        console.log(response.data)
        await fn.sendEmailProject(response.data.data.id);

        res.json({
          status: 'success',
          data: data,
          message: 'Reporte enviado exitosamente'
        });
      })
      .catch(function (error) {
        console.log(error);
      });

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


      let attention = await schemas.Attention.findById(mongoose.Types.ObjectId(req.body.id)).populate({
        path: 'customer'
      }).exec();

      let newPhotosBefore = attention.photos_before.map(element => {
        if (element.length == 0) {
          element = [{
            url: 'default.png',
            type: 'remote'
          }]
        }
        return element;
      });
      attention.photos_before = newPhotosBefore;

      let newPhotosAfter = attention.photos_after.map(element => {
        if (element.length == 0) {
          element = [{
            url: 'default.png',
            type: 'remote'
          }]
        }
        return element;
      });
      attention.photos_after = newPhotosAfter;



      let data = {
        date: fn.getDateReport(),
        attention: attention,
        pathServicePhp: config.pathSavePdf
      }

      axios.post(config.pathServicePhp + 'attention.php', data)
        .then(async (response) => {

          console.log(response.data)
          await fn.sendEmailAttention(attention._id);

          res.json({
            status: 'success',
            message: 'Reporte enviado exitosamente'
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

router.post('/updateObservationBoard', async (req, res) => {
  console.log(req.body);

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
  console.log(req.body);

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

router.post('/removeImageFromBoardItem', async (req, res) => {

  try {

    let itemBoard = await schemas.ItemBoard.findOne({ _id: mongoose.Types.ObjectId(req.body.id) })
    let photos = itemBoard.photos.filter(item => item.url != req.body.url)
    schemas.ItemBoard.updateOne({ "_id": mongoose.Types.ObjectId(req.body.id) }, {
      $set: {
        photos,
      }
    }, {
      upsert: true
    }).exec();

    res.json({ status: 'success', message: 'Imagen eliminada exitosamente' });

  } catch (error) {
    console.log(error)
    res.json({ status: 'error', message: 'Ocurrió un error al actualizar' });
  }
});

module.exports = router;
