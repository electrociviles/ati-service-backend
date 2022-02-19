module.exports = {
  jwt: {
    secret: process.env.SECRET,
    expiration: '48h'
  },
  db: {
    url: "mongodb://localhost:27017/ati",
  },
  origins: ['http://localhost:4012']
}