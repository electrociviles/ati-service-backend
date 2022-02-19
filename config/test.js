module.exports = {
  jwt: {
    secret: process.env.SECRET,
    expiration: '48h'
  },
  db: {
    url: "mongodb://localhost:27017/electrociviles" 
  },
  origin: 'http://localhost:4004'
}