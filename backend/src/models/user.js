import * as Sequelize from 'sequelize';
import bcrypt from 'bcrypt';

import debugLib from 'debug';

import db from '../database';

const debug = debugLib('spammy: userModel');

const SALT_ROUNDS = 10;

class User extends Sequelize.Model {}
User.init({
  key: Sequelize.STRING,
}, {
  sequelize: db,
  modelName: 'user',
  timestamps: true,
  freezeTableName: true,
});

/**
 * creates a user
 * @returns {Promise<null|User>}
 */
export async function createUser() {
  const randomString = `${new Date().getTime().toString()}${Math.random()}`;
  const hash = await bcrypt.hash(randomString, SALT_ROUNDS);

  let user = null;
  try {
    user = await User.create({
      key: hash,
    });
  } catch (dbError) {
    debug('Error while creating User entry');
    debug(`randomString: email :${randomString}, hash: ${hash}`);
    debug(dbError.message || 'No error message');
    debug(dbError.message || 'No error message');
    debug(dbError.stack || 'No error stack');
  }
  return user;
}

/**
 *
 * @param{String} key
 * @returns {Promise<null|User>}
 */
export async function getUserByKey({ key = '' }) {
  let user = null;
  try {
    user = await User.findOne({
      where: {
        key,
      },
    });
  } catch (dbError) {
    debug('Error while getting User entry');
    debug(`params: key :${key}`);
    debug(dbError.message || 'No error message');
    debug(dbError.message || 'No error message');
    debug(dbError.stack || 'No error stack');
  }

  return user;
}

export default User;
