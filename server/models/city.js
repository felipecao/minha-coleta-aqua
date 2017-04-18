'use strict';

const Joi = require('joi');
const MongoModels = require('mongo-models');
const Slug = require('slug');

class City extends MongoModels {
    static create(name, callback) {

        const document = {
            name
        };

        this.insertOne(document, (err, docs) => {

            if (err) {
                return callback(err);
            }

            callback(null, docs[0]);
        });
    }
}

City.collection = 'cities';

City.schema = Joi.object().keys({
    name: Joi.string().required()
});

City.indexes = [
    { key: { name: 1 } }
];

module.exports = City;
