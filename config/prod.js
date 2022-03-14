module.exports = {
  jwt: {
    secret: process.env.SECRET,
    expiration: '48h'
  },
  db: {
    url: "mongodb://localhost:20612/ati",
    user: 'nTorres#*Enrrique@Cleo:?mama',
    pass: 'nTJacob*$%@Cleo*..bnSystem'
  },
  urlPdf: 'https://atiservicios.com/ati/',
  origins: ['https://www.atiservicios.com', 'www.atiservicios.com', 'atiservicios.com', 'http://atiservicios.com'],
  pathSavePdf: '/var/www/ati/ati-service-backend/uploads/',
  pathServicePhp: 'http://localhost/ati-pdf-server/'
}