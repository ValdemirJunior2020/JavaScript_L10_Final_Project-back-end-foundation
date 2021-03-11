'use strict';
module.exports = (sequelize, DataTypes) => {
  var posts = sequelize.define(
    'posts',
     {
    PostId: { 
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    PostTitle: DataTypes.STRING,
    PostBody: DataTypes.STRING,
    UserId: { 
      allowNull: false,
      foreignKey: true,
      type: DataTypes.INTEGER
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
    },
  }, {});
  posts.associate = function(models) {
    posts.belongsTo(models.users, {foreignKey: 'UserId'}) // associations can be defined here
  };
  return posts;
};