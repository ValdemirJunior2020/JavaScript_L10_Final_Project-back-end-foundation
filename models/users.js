'use strict';
module.exports = (sequelize, DataTypes) => {
  var users = sequelize.define(
    'users',
     {
    UserId: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    FirstName: DataTypes.STRING,
    LastName: DataTypes.STRING,
    Username: { 
      type: DataTypes.STRING,
       unique: true
      },
    Password: DataTypes.STRING,
    Email: {
       type: DataTypes.STRING,
       unique: true
    },
    Admin: { 
      allowNull: false,
      default: false,
      type: DataTypes.BOOLEAN
    },
    Deleted: {
      type: DataTypes.BOOLEAN,
      default: false
    },
    createdAt: {
      allowNull: false,
      type: DataTypes.DATE
    },
    updatedAt: {
      allowNull: false,
      type: DataTypes.DATE
    }
  }, 
  {}
  );
  users.associate = function(models) {
     users.hasMany(models.posts, {foreignKey: 'UserId'})// associations can be defined here
  };
  return users;
};