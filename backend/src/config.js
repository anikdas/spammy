import Conf from 'conf';

const config = new Conf();
config.set('env', process.env.NODE_ENV || 'development');

export default config.store;
