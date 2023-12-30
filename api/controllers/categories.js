const express = require('express');
const categories = require('../models/Categories');
const { ObjectId } = require("mongodb");

categoriesController = () => { };

categoriesController.getAllCategories = (req, res, next) => {
    categories.find().sort({name:1}).exec((err, category) => {
        if (!err) {
            res.send(category);
        } else {
            res.send({ result: false, error: err })
        }
    })
};

categoriesController.addCategory = (req, res, next) => {
    var ca = new categories(req.body);
    ca.save((err,data)=>{
        if(err) {
            res.send({ result: false, error: err})
        }else {
            res.send(data);
        }
    });
};

categoriesController.removeCategory = (req, res, next) => {
    categories
    .remove({ _id: ObjectId(req.params.id) })
    .exec((err, data) => {
        if(err){
            res.send({ result: false, error: err})
        } else {
            res.send(data);
        }
    });
};

module.exports = categoriesController;