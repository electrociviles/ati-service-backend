module.exports = {
  jwt: {
    secret: process.env.SECRET,
    expiration: '48h'
  },
  db: {
    url: "mongodb://localhost:27017/ati",
  },
  origins: ['http://localhost:4012'],
  urlPdf: 'http://localhost:3984/',
  // pathSavePdf: '/Users/nelsontorres/Developer/Electrociviles/ati-service-backend/pdf/',
  pathSavePdf: "C://Users//HP//Desktop//Me//Electrociviles//ati-v2//ati-service-backend//pdf/",
  pathServicePhp: 'http://localhost/ati-pdf-server/'
}