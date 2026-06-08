db = db.getSiblingDB(process.env.MONGO_INITDB_DATABASE);

db.createUser({
  user: "pilates_app",
  pwd: process.env.MONGO_INITDB_ROOT_PASSWORD,
  roles: [{ role: "readWrite", db: process.env.MONGO_INITDB_DATABASE }],
});

db.createCollection("_init");
