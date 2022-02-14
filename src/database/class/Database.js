const { readdirSync } = require("fs");
const mongoose = require("mongoose"),
  Cache = require("./Cache"),
  util = require("util");

class Database {
  constructor(uri) {
    const schemas = readdirSync("./src/database/models");
    schemas.forEach((schema) => {
      require(`../models/${schema}`);
    });
    mongoose
      .connect(uri, {
        useUnifiedTopology: true,
        useNewUrlParser: true,
        useFindAndModify: false,
      })
      .then(async (data) => {
        console.log("Connected to the database...");
        this.cache = new Cache(data, this);
        this.timestamp = new Date().getTime();
        this.connection = data.connection;
        this.models = data.models;
      });
  }
  get(path) {
    const { schema, name, key } = path.chunks();
    let data = this.cache.get(path);
    return key
      ? data
        ? data[key]
        : mongoose.models[schema].schema.obj[name][key].default
      : data;
  }
  set(path, value) {
    const { id, schema, name, key } = path.chunks();
    let current = this.get(`${schema}.${id}.${name}`);
    if (key) {
      current = Object.filter(
        current,
        (key) => !Object.keys(current.schema.obj[name]).includes(key)
      );
      Object.assign(current, { [key]: value });
    }
    const final = key ? current : value;
    this.cache.set(path, final);
    return key ? final[key] : final;
  }
  add(path, amount) {
    const current = this.get(path);
    const result = this.set(path, current == null ? amount : current + amount);
    return result;
  }
  subtract(path, amount) {
    const current = this.get(path);
    const result = this.set(path, current == null ? amount : current - amount);
    return result;
  }
  push(path, value) {
    const current = this.get(path);
    current.push(value);
    const result = this.set(path, _.uniq(current));
    return result;
  }
  remove(path, value) {
    let current = this.get(path);
    current = current.filter((x) => x != value);
    const result = this.set(path, current);
    return result;
  }
  addToInv(user, item = { id: String, amount: Number }) {
    const { id, amount } = item;
    let oldInv = this.get(`users.${user}.inv`);

    const newInv = oldInv ? [...oldInv] : [];
    if (newInv.length <= 0) newInv.push({ id, amount });
    else {
      newInv.forEach((item, i) => {
        if (item.id == id) newInv[i] = { id, amount: item.amount + amount };
      });
    }
    if (_.isEqual(newInv, oldInv)) newInv.push({ id, amount });
    const result = this.set(`users.${user}.inv`, newInv);
    return result;
  }
  removeFromInv(user, item = { id: String, amount: Number }) {
    const { id, amount } = item;
    let inventory = this.get(`users.${user}.inv`);
    let newInv = inventory ? [...inventory] : [];
    inventory?.forEach((item, i) => {
      if (item.id == id) {
        if (item.amount - amount <= 0)
          newInv = newInv.filter((x) => x.id != id);
        else if (item?.amount) newInv[i].amount -= amount;
      }
      i++;
    });

    const result = this.set(`users.${user}.inv`, newInv);
    return result;
  }
  owns(id, item, amount) {
    amount = amount ?? 1;
    let inv = this.get(`users.${id}.inv`);
    return inv?.find((x) => x.id == item)?.amount >= amount ? true : false;
  }
  create(schema, id) {
    const object = {};
    Object.keys(mongoose.models[schema].schema.obj).forEach((entry) => {
      if (entry === "_id") return Object.assign(object, { _id: id });
      Object.assign(object, {
        [entry]: mongoose.models[schema].schema.obj[entry].default,
      });
    });
    this.cache[schema].push(object);
    this.emit("cacheUpdate", `${schema}.${id}`, object);
  }
}

util.inherits(Database, require("events").EventEmitter);

module.exports = Database;
