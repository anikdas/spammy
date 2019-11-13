import express from 'express';
import debugLib from 'debug';

import config from './config';
import emailRouter from './routes/emailAddress';
import userRouter from './routes/user';
import emailContentRouter from './routes/emailContent';

const debug = debugLib('spammy:server');
const app = express();


app.use(express.json());
app.set('x-powered-by', false);

// for heartbeat status
app.get('/status', (req, res) => res.send('OK'));


app.use('/emailAddress', emailRouter);
app.use('/user', userRouter);
app.use('/emailContent', emailContentRouter);

// 404 error
app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = config.isDev ? err : {};

  res.status(err.status || 500);

  // TODO: fancy 404

  if (err.status === 500) {
    debug(err);
    debug(err.stack || 'Error without stack trace');
  }
  res.send('error');
});


app.listen(config.port, () => {
  debug(`app listening on port ${config.port}`);
});


export default app;
