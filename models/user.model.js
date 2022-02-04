"use strict";
const bcrypt = require("bcrypt");
const bcrypt_p = require("bcrypt-promise");
const jwt = require("jsonwebtoken");
const { TE, to } = require("../services/util.service");
const CONFIG = require("../config/config");

const sequelizePaginate = require("sequelize-paginate");

module.exports = (sequelize, DataTypes) => {
  var Model = sequelize.define(
    "User",
    {
      id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
      },
      full_name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      description: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: { isEmail: { msg: "Email Address is invalid." } }
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false
      },
      avatar: {
        type: DataTypes.STRING,
        allowNull: true
      },
    },
    {
      tableName: "users",
      underscored: true,
      // getterMethods: {
      //   fullName() {
      //     return this.full_name;
      //   }
      // }
    }
  );

  sequelizePaginate.paginate(Model);

  // Model.associate = models => {
  //   this.School = this.hasOne(models.School, {
  //     as: "School",
  //     foreignKey: "school_id"
  //   });
  // };

  Model.beforeSave(async (user, options) => {
    let err;
    if (user.changed("password")) {
      let salt, hash;
      [err, salt] = await to(bcrypt.genSalt(10));
      if (err) TE(err.message, true);

      [err, hash] = await to(bcrypt.hash(user.password, salt));
      if (err) TE(err.message, true);

      user.password = hash;
    }
  });

  Model.prototype.comparePassword = async function(pw) {
    let err, pass;
    if (!this.password) TE("Password not set");

    [err, pass] = await to(bcrypt_p.compare(pw, this.password));
    if (err) TE(err);

    if (!pass) TE("invalid password");

    return this;
  };

  Model.prototype.getJWT = function() {
    let expiration_time = parseInt(CONFIG.jwt_expiration);
    // console.log(CONFIG.jwt_encryption, this.id);
    return (
      // "Bearer " +
      jwt.sign(
        {
          user_id: this.id,
          full_name: this.full_name,
          email: this.email,
          avatar: this.avatar,
          description: this.description
        },
        CONFIG.jwt_encryption,
        {
          expiresIn: expiration_time
        }
      )
    );
  };

  Model.prototype.toWeb = function() {
    let json = this.toJSON();
    return json;
  };

  return Model;
};
