"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.renameColumn("Users", "email", "nickname");
  },

  async down(queryInterface, Sequelize) {},
};
