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
        db.query(queryString, values, (err, res) => {
            if (err) {
                console.error('query error:', err.stack);
            } else {
                if (res.rows.length > 0) {
                    const queryString2 = 'UPDATE pokemon SET num = $1 WHERE id = $2';
                    let currentId = res.rows[0].id;
                    let currentNum = helpers.generateNum(currentId);
                    let values2 = [currentNum, currentId];
                    db.query(queryString2, values2, (err, result) => {
                        if (err) {
                            console.error('query error:', err.stack);
                        } else {
                            request.flash('success', 'Pokemon added successfully!');
                            response.redirect('/');
                        }
                    })
                } else {
                    response.send('Error in creating pokemon');
                }
            }
        })
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
        jsonfile.readFile(FILE, (err, objRead) => {
            if (err) {
                console.log(err);
            } else {
                objRead.pokemon.forEach( pokemon => {
                    if (String(pokemon.id) == request.params.id) {
                        pokemon.name = request.body.name;
                        pokemon.img = request.body.img;
                        pokemon.height = request.body.height;
                        pokemon.weight = request.body.weight;
                    }
                })
                jsonfile.writeFile(FILE, objRead, function(err) {});
                request.flash('success', 'Pokemon updated successfully!');
                response.redirect('/');
            }
        })
    },

    pokemonDelete: (request, response) => {
        jsonfile.readFile(FILE, (err, objRead) => {
            let pokemonFound = false;
            objRead.pokemon.forEach( (pokemon, index, array) => {
                if (String(pokemon.id) === request.params.id) {
                    array.splice(index, 1);
                    pokemonFound = true;
                }
            })
            if (pokemonFound) {
                jsonfile.writeFile(FILE, objRead, function(err) {});
                request.flash('success', 'Pokemon deleted successfully!');
            } else {
                request.flash('error', 'Pokemon was not found!');
            }
            response.redirect('/');
        })
    }
}