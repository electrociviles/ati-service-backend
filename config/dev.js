module.exports = {
  jwt: {
    secret: process.env.SECRET,
    expiration: '48h'
  },
  db: {
    url: "mongodb://localhost:27017/ati",
  },
  namespace: '/',
  origins: ['http://localhost:4012'],
  urlPdf: 'http://localhost:3984/',
  // pathSavePdf: '/Users/nelsontorres/Developer/Electrociviles/ati-service-backend/pdf/',
  pathSavePdf: "C://Users//nelson.torres//Desktop//Estudio Nelson//Ati//ati-service-backend//pdf//",
  pathServicePhp: 'http://localhost:8080/ati-pdf-server/',
  jsReportClient: 'http://127.0.0.1:4014/',
  tokenLife: '1hr',
  refreshTokenLife: '50hr'
}