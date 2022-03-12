
require('dotenv').config()
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors')

var indexRouter = require('./routes/index');
var apiRouter = require('./routes/api');
var init = require('./config/init');
const fn = require('./utils/fn');
var config = require('./config')

var app = express();

app.use(cors({
  origin: config.origins,
}));
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'uploads')));

app.use('/', indexRouter);
app.use('/api', apiRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});



// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

app.listen(config.port, function () {
  console.log(`Escuchando el puerto ${config.port}!`);
  const pdf = require('html-pdf');

  var html_to_pdf = require('html-pdf-node');
  let options = { format: 'A4' };
  // Example of options with args //
  // let options = { format: 'A4', args: ['--no-sandbox', '--disable-setuid-sandbox'] };

  // let file = { content: "<h1>Welcome to html-pdf-node</h1>" };
  // or //
  let file = { url: "https://example.com" };
  // html_to_pdf.generatePdf(file, options).then(pdfBuffer => {
  //   console.log("PDF Buffer:-", pdfBuffer);
  // });

  const content = `
<!doctype html>
    <html>
       <head>
            <meta charset="utf-8">
            <title>PDF Result Template</title>
            <style>
            @font-face {
              font-family: 'MyriadPro-Light';
              src: url({#asset /assets/MyriadPro-Light.otf @encoding=dataURI});
              format('woff');
            }
            body {
                font-family: 'MyriadPro-Light';
                background-repeat: no-repeat;
                background-position: 10% 50%;
                background-image: url({#asset /assets/ati.png @encoding=dataURI});
            }
            .logo {
                width: 20%;
                margin-top: 15px;
                float: left;
            }
            .title {
                font-size: 28px;
                width: 80%;
                float: right;
                text-transform: uppercase;
                text-align: right;
            }
            
            .data {
                width: 100%;
                float: left;
            }
            .total {
                font-weight: bold;
                font-size: 24px;
            }
            /* Invoice Style */
            
            div.header {
               float: left;
               width: 100%;
            } 
            div.headerLeft {
               float: left;
               width: 20%; 
            } 
            div.headerRight {
               float: right;
            } 
            .fontElectrociviles {
               width: 100%;
               font-weight: bold;
               font-size: 12px;
               text-align: right !important;
            }
            .font {
               width: 100%;
               font-size: 12px;
               text-align: right !important;
            }
            .line {
               background-color: #d35e35;
               border-bottom: 4px solid #d35e35;
               width: 100%;
               height: 2px;
               float: left;
               margin-top: 5px;
               margin-bottom: 5px;
            }
            .titleFactura {
               width: 100%;
               font-weight: bold;
               font-size: 14px;
               text-align: right !important;
               padding-top: 5px;
               padding-bottom: 5px;
            }
            .customerData {
               float: left;
               width: 68%;
               background-color:#d3d3d3;
               font-family: "Arial";
               font-size: 10px;
            
            }
            .dateData {
               float: right;
               width: 30%;
               background-color: #d3d3d3;
               font-family: "Arial";
               font-size: 10px !important;
            }
            .invoiceData {
               width: 100%;
               margin-top: 10px !important;
               float: left;
            }
            .table {
                border-collapse: separate; 
                width: 100%;
            }
            .table thead tr th {
               text-align: left;
               text-transform: uppercase;
               font-size: 12px;
               background-color: silver;
            }
            .table-total {
                border-collapse: collapse; 
                border: 2px solid black;
                width: 100%;
            }
            
            .table-total tr td {
                border: 2px solid black;
                
            }
            .infoData {
               float: left;
            }
            .dateTimeReport {
               font-size: 10px;
               float: left;
               width: 100%;
               font-style: italic;
               text-transform: none;
               color: gray;
            }
            .data {
                float: left;
            }
            .project__wrapper {
                width: 100%;
                border: 1px solid black;
                float: left;
            }
            .project__info {
                background-color: transparent;
            }
            .project_name {
                font-size: 24px;
                font-weight: bold;
            }
            .project_type {
                font-weight: bold;
            }
            
            .project__board__wrapper {
                margin-top: 10px;
            } 
            .board__item__wrapper {
                margin-top: 50px;
                float: left;
                width: 100%;
                border: 1px solid black;
            }
            .title_info {
                width: 100%;
                float: left;
            }
            .item_body {
                  padding: 10px;
                  display: flex;
                  flex-wrap: wrap;
                  background-color: rgba(255, 255, 255, .9);
              }
              .item_image {
                  width: 400px;
                  margin: 5px;
                  display: flex;
                  flex-direction: row;
                  flex-wrap: wrap;
              }
              .item_image img {
                  width: 100%;
                  height: 300px;
                  object-fit: contain;
              }
            .item {
                width: 40%;
                margin-top: 10px;
                margin: 10px;
                float: left;
                border: 1px solid black;
            }
            </style>
        </head>
        <body> 
        <div class="logo">
            <img src="{#asset /assets/ati.svg @encoding=dataURI}" style="width:100px; max-width:100px;"/>
        </div>
        
       <div class="title">
           <span>Reporte tablero: {{boardName}}</span>
           <span class='dateTimeReport'>Fecha y hora de generación del reporte: {{getDateReport}}</span>
       </div>
       
       <div class="line"></div>
       <div class="data">
           <table class="table">
               <thead>
                   <tr>
                    <th>TABLERO</th>
                    <th>TIPO</th>
                   </tr>
               </thead>
               <tbody>
                   <tr>
                       <td>{{name}}</td>
                       <td>{{type}}</td>
                   </tr>
               </tbody>
           </table>
       </div>

       <div class='project__wrapper'>
           <div class='project__info'>
               <div class='project_name'>{{projectName}}</div>
               <div class='project_type'>{{boardType}}</div>
               <div class='board_name'>{{boardName}}</div>
           </div>
           <div class='board__item__wrapper'>

                <div class='title_info'>Corrientes</div>
                
                   {{#each cellsCorriente}}
                       {{#if (mod @index)}}
                           <div style='page-break-before: always;'></div>
                       {{/if}}
                       <div class="item">
                           <div class='item_title'>
                               {{item.title}} 
                           </div>
                           <div class='card_colors'>
                               <div class='card_color' style="background-color: {{item.colorOne}}; color: {{item.textColorOne}};">{{item.title}}</div>
                           </div>
                           <div class='item_body'>
                               {{#each photos}}
                                   <div class='item_image'>
                                       <img src={{getUrl url}} />
                                   </div>
                               {{/each}}
                           </div>
                       </div>
                   {{/each}}
                
                <div style='page-break-before: always;'></div>

                   {{#each cellsCorriente}}
                       {{#if (mod @index)}}
                           <div style='page-break-before: always;'></div>
                       {{/if}}
                       <div class="item">
                           {{!-- <div class='item_title'>
                               {{item.title}} 
                           </div>
                           <div class='card_colors'>
                               <div class='card_color' style="background-color: {{item.colorOne}}; color: {{item.textColorOne}};">{{item.title}}</div>
                           </div>
                           <div class='item_body'>
                               {{#each photos}}
                                   <div class='item_image'>
                                       <img src={{getUrl url}} />
                                   </div>
                               {{/each}}
                           </div> --}}
                       </div>
                   {{/each}}

                   {{#each cellsCorriente}}
                       {{#if (mod @index)}}
                           <div style='page-break-before: always;'></div>
                       {{/if}}
                       <div class="item">
                           {{!-- <div class='item_title'>
                               {{item.title}} 
                           </div>
                           <div class='card_colors'>
                               <div class='card_color' style="background-color: {{item.colorOne}}; color: {{item.textColorOne}};">{{item.title}}</div>
                           </div>
                           <div class='item_body'>
                               {{#each photos}}
                                   <div class='item_image'>
                                       <img src={{getUrl url}} />
                                   </div>
                               {{/each}}
                           </div> --}}
                       </div>
                   {{/each}}

                   {{#each cellsCorriente}}
                       {{#if (mod @index)}}
                           <div style='page-break-before: always;'></div>
                       {{/if}}
                       <div class="item">
                           {{!-- <div class='item_title'>
                               {{item.title}} 
                           </div>
                           <div class='card_colors'>
                               <div class='card_color' style="background-color: {{item.colorOne}}; color: {{item.textColorOne}};">{{item.title}}</div>
                           </div>
                           <div class='item_body'>
                               {{#each photos}}
                                   <div class='item_image'>
                                       <img src={{getUrl url}} />
                                   </div>
                               {{/each}}
                           </div> --}}
                       </div>
                   {{/each}}


                   {{#each cellsCorriente}}
                       {{#if (mod @index)}}
                           <div style='page-break-before: always;'></div>
                       {{/if}}
                       <div class="item">
                           {{!-- <div class='item_title'>
                               {{item.title}} 
                           </div>
                           <div class='card_colors'>
                               <div class='card_color' style="background-color: {{item.colorOne}}; color: {{item.textColorOne}};">{{item.title}}</div>
                           </div>
                           <div class='item_body'>
                               {{#each photos}}
                                   <div class='item_image'>
                                       <img src={{getUrl url}} />
                                   </div>
                               {{/each}}
                           </div> --}}
                       </div>
                   {{/each}}
           </div>

       </div>
   </body>
    </html>
`;

  pdf.create(content).toFile('./html-pdf.pdf', function (err, res) {
    if (err) {
      console.log(err);
    } else {
      console.log(res);
    }
  });
  // init.Start();
  // init.createUser();
  // init.createCustomer();
  // init.createProject();
});

module.exports = app;
