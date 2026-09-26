/**
 * Browser-Safe Mongoose Shim for Vite Client Environment
 * Allows Mongoose Models and Schemas to be shared and executed safely in the browser.
 */

export class Schema {
  constructor(definition = {}, options = {}) {
    this.definition = definition;
    this.options = options;
    this.methods = {};
    this.statics = {};
    this.virtuals = {};
  }

  pre() { return this; }
  post() { return this; }
  index() { return this; }
  virtual(name) {
    this.virtuals[name] = {};
    return {
      get: (fn) => { this.virtuals[name].get = fn; return this; },
      set: (fn) => { this.virtuals[name].set = fn; return this; }
    };
  }
}

// Mongoose Types
class ObjectId {
  constructor(id) {
    this._id = id || Math.random().toString(16).substring(2, 10) + Math.random().toString(16).substring(2, 18);
  }
  toString() {
    return this._id;
  }
  toHexString() {
    return this._id;
  }
  static isValid(id) {
    return typeof id === 'string' && (id.length === 24 || id.length > 0);
  }
}

Schema.Types = {
  ObjectId,
  String: String,
  Number: Number,
  Boolean: Boolean,
  Date: Date,
  Mixed: Object,
  Array: Array,
  Buffer: Object,
  Decimal128: Number,
  Map: Map
};

const modelsRegistry = {};

export function model(name, schema) {
  if (modelsRegistry[name]) {
    return modelsRegistry[name];
  }

  class ModelInstance {
    constructor(data = {}) {
      Object.assign(this, data);
      if (!this._id && !this.id) {
        this._id = new ObjectId().toString();
      }
      if (!this.createdAt) {
        this.createdAt = new Date().toISOString();
      }
      if (!this.updatedAt) {
        this.updatedAt = new Date().toISOString();
      }
    }

    async save() {
      this.updatedAt = new Date().toISOString();
      return this;
    }

    toObject() {
      return { ...this };
    }

    toJSON() {
      return { ...this };
    }
  }

  // Model static helper methods
  ModelInstance.modelName = name;
  ModelInstance.schema = schema;

  ModelInstance.find = function (filter = {}) {
    const query = {
      lean: () => Promise.resolve([]),
      sort: () => query,
      populate: () => query,
      skip: () => query,
      limit: () => query,
      then: (resolve) => resolve([])
    };
    return query;
  };

  ModelInstance.findOne = function (filter = {}) {
    const query = {
      lean: () => Promise.resolve(null),
      sort: () => query,
      populate: () => query,
      then: (resolve) => resolve(null)
    };
    return query;
  };

  ModelInstance.findById = function (id) {
    return ModelInstance.findOne({ _id: id });
  };

  ModelInstance.create = async function (docs) {
    if (Array.isArray(docs)) {
      return docs.map(d => new ModelInstance(d));
    }
    return new ModelInstance(docs);
  };

  ModelInstance.findByIdAndUpdate = async function (id, update) {
    return new ModelInstance({ _id: id, ...update });
  };

  ModelInstance.findOneAndUpdate = async function (filter, update) {
    return new ModelInstance({ ...filter, ...update });
  };

  ModelInstance.countDocuments = async function () {
    return 0;
  };

  modelsRegistry[name] = ModelInstance;
  return ModelInstance;
}

export const models = modelsRegistry;

export function connect() {
  return Promise.resolve({
    connection: {
      readyState: 1,
      host: 'localhost',
      port: 27017,
      name: 'tripoli_health'
    }
  });
}

export const Types = {
  ObjectId
};

export default {
  Schema,
  model,
  models,
  connect,
  Types
};
