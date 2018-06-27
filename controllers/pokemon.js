const helpers = require("../helpers");
const db = require("../db");
const jsonfile = require('jsonfile');
const FILE = 'pokedex.json';

module.exports = {
    showNewPokemonForm: (request, response) => {
        response.render('newpokeform');
    },

    showEditPokemonForm: (request, response) => {
        let context;
        const queryString = 'SELECT * FROM pokemon WHERE id = $1';
        const value = [request.params.id];
        db.query(queryString, value, (err, result) => {
            if (err) {
                console.error('query error:', err.stack);
            } else {
                if (result.rows.length > 0) {
                    context = result.rows[0];
                    response.render('editpokeform', context);
                } else {
                    response.send('No matching pokemon!');
                }
            }
        });
    },

    pokemonCreate: (request, response) => {
        const queryString = 'INSERT INTO pokemon (name, img, weight, height) VALUES ($1, $2, $3, $4) RETURNING *';
        let values = [request.body.name,request.body.img,request.body.weight,request.body.height];
        db.query(queryString, values)
            .then( dbResponse => {
                if (dbResponse.length > 0) {
                    const queryString2 = 'UPDATE pokemon SET num = $1 WHERE id = $2';
                    let currentId = dbResponse.id;
                    let currentNum = helpers.generateNum(currentId);
                    let values2 = [currentNum, currentId];
                    return db.query(queryString2, values2)
                } else {
                    response.send('Error in creating pokemon');
                }
            })
            .then( dbResponse => {
                request.flash('success', 'Pokemon added successfully!');
                response.redirect('/');
            })
            .catch( err => console.error(err) )
    },

    pokemonRead: (request, response) => {
        const queryString = 'SELECT * FROM pokemon WHERE id = $1';
        let value = [request.params.id];
        db.query(queryString, value, (err, result) => {
            if (err) {
                console.error('query error:', err.stack);
            } else {
                if (result.rows.length > 0) {
                    let context = result.rows[0];
                    response.send(context);
                } else {
                    response.status(404);
                    response.send("not found");
                }
            }
        });
    },

    pokemonUpdate: (request, response) => {
        const queryString = 'UPDATE pokemon SET name = $1, img = $2, height = $3, weight = $4 WHERE id = $5';
        const values = [request.body.name, request.body.img, request.body.height, request.body.weight, request.params.id];
        db.query(queryString, values, (err, result) => {
            if (err) {
                console.error('query error:', err.stack);
            } else {
                request.flash('success', 'Pokemon updated successfully!');
                response.redirect('/');
            }
        });
    },

    pokemonDelete: (request, response) => {
        const queryString = 'DELETE FROM pokemon WHERE id = $1';
        const value = [request.params.id];

        db.query(queryString, value, (err, result) => {
            if (err) {
                console.error('query error:', err.stack);
                request.flash('error', 'Pokemon was not found!');
            } else {
                request.flash('success', 'Pokemon deleted successfully!');
            }
            response.redirect('/');
        });
    }
}