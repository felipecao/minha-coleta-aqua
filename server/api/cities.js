'use strict';
const AuthPlugin = require('../auth');
const Boom = require('boom');
const EscapeRegExp = require('escape-string-regexp');
const Joi = require('joi');
const internals = {};

internals.applyRoutes = function (server, next) {

    const City = server.plugins['hapi-mongo-models'].City;

    server.route({
        method: 'GET',
        path: '/cities',
        config: {
            auth: {
                strategy: 'session',
                scope: 'admin'
            },
            validate: {
                query: {
                    name: Joi.string().allow(''),
                    fields: Joi.string(),
                    sort: Joi.string().default('_id'),
                    limit: Joi.number().default(20),
                    page: Joi.number().default(1)
                }
            }
        },
        handler: function (request, reply) {

            const query = {};
            if (request.query.name) {
                query.name = new RegExp('^.*?' + EscapeRegExp(request.query.name) + '.*$', 'i');
            }
            const fields = request.query.fields;
            const sort = request.query.sort;
            const limit = request.query.limit;
            const page = request.query.page;

            City.pagedFind(query, fields, sort, limit, page, (err, results) => {

                if (err) {
                    return reply(err);
                }

                reply(results);
            });
        }
    });

    server.route({
        method: 'GET',
        path: '/cities/{id}',
        config: {
            auth: {
                strategy: 'session',
                scope: 'admin'
            },
            pre: [
                AuthPlugin.preware.ensureAdminGroup('root')
            ]
        },
        handler: function (request, reply) {

            City.findById(request.params.id, (err, city) => {

                if (err) {
                    return reply(err);
                }

                if (!city) {
                    console.log(`>>>>>>>>>>>>>>>> request: ${JSON.stringify(request.params)}, city = ${city}`);
                    return reply(Boom.notFound('Document not found.'));
                }

                reply(city);
            });
        }
    });

    server.route({
        method: 'POST',
        path: '/cities',
        config: {
            auth: {
                strategy: 'session',
                scope: 'admin'
            },
            validate: {
                payload: {
                    name: Joi.string().required()
                }
            },
            pre: [
                AuthPlugin.preware.ensureAdminGroup('root')
            ]
        },
        handler: function (request, reply) {

            const name = request.payload.name;

            City.create(name, (err, status) => {

                if (err) {
                    return reply(err);
                }

                reply(status);
            });
        }
    });

    server.route({
        method: 'PUT',
        path: '/cities/{id}',
        config: {
            auth: {
                strategy: 'session',
                scope: 'admin'
            },
            validate: {
                payload: {
                    name: Joi.string().required()
                }
            },
            pre: [
                AuthPlugin.preware.ensureAdminGroup('root')
            ]
        },
        handler: function (request, reply) {

            const id = request.params.id;
            const update = {
                $set: {
                    name: request.payload.name
                }
            };

            City.findByIdAndUpdate(id, update, (err, status) => {

                if (err) {
                    return reply(err);
                }

                if (!status) {
                    return reply(Boom.notFound('Document not found.'));
                }

                reply(status);
            });
        }
    });

    server.route({
        method: 'DELETE',
        path: '/cities/{id}',
        config: {
            auth: {
                strategy: 'session',
                scope: 'admin'
            },
            pre: [
                AuthPlugin.preware.ensureAdminGroup('root')
            ]
        },
        handler: function (request, reply) {

            City.findByIdAndDelete(request.params.id, (err, status) => {

                if (err) {
                    return reply(err);
                }

                if (!status) {
                    return reply(Boom.notFound('Document not found.'));
                }

                reply({ message: 'Success.' });
            });
        }
    });


    next();
};


exports.register = function (server, options, next) {
    server.dependency(['auth', 'hapi-mongo-models'], internals.applyRoutes);
    next();
};

exports.register.attributes = {
    name: 'cities'
};
