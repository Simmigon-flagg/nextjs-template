const { MongoMemoryServer } = require('mongodb-memory-server');

module.exports = async () => {
  const mongoServer = await MongoMemoryServer.create();
  global.__MONGO_URI__ = mongoServer.getUri();
  global.__MONGOD__ = mongoServer;
};
