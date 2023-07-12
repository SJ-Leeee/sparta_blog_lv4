"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn("Users", "likePosts");
  },

  down: (queryInterface, Sequelize) => {},
};
