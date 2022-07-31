module.exports = {
  jwt: {
    secret: process.env.SECRET,
    expiration: '48h'
  },
  db: {
    url: "mongodb://localhost:20612/ati?authSource=admin",
    user: 'nTorres#*Enrrique@Cleo:?mama',
    pass: 'nTJacob*$%@Cleo*..bnSystem'
  },
  namespace: '/messenger',
  urlPdf: 'https://atiservicios.com/ati/',
  origins: ['https://www.atiservicios.com', 'www.atiservicios.com', 'atiservicios.com', 'http://atiservicios.com'],
  pathSavePdf: '/var/www/ati/ati-service-backend/pdf/',
  pathServicePhp: 'http://localhost:8080/ati-pdf-server/',
  jsReportClient: 'http://127.0.0.1:4014/',
  tokenLife: '24hr',
  refreshTokenLife: '50hr'

}