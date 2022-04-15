const Joi = require('joi');

export const createProductSchma = Joi.object().keys({
    name: Joi.string().required(),

    password: Joi.string()
        .pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')),

    repeat_password: Joi.ref('password'),

    access_token: [
        Joi.string(),
        Joi.number()
    ],

    birth_year: Joi.number()
        .integer()
        .min(1900)
        .max(2013),

    email: Joi.string()
        .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } })
});


export const createCatSchema = Joi.object().keys({
    name: Joi.string().required(),
    age: Joi.number()
      .integer()
      .min(0)
      .max(100)
      .required(),
    breed: Joi.string().required(),
  });

