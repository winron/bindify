const express = require('express');
const router = express();
const server = require('http').createServer(router);
const config = require('../config');
const io = require('socket.io')(server, { 
  cors: { 
    origin: config.isDev ? 'http://localhost:3000' : '*' 
  } 
});
server.listen(config.SERVER_PORT, config.SERVER_HOST, () => {
  console.log(`Server listening on ${config.SERVER_HOST}:${config.SERVER_PORT}`);
});

io.on('connection', function (socket) {
  router.set('socket', socket);
});

router.get('/authorize', (req, res) => {
  const socket = req.app.get('socket');
  const { code, error } = req?.query;
  const status = error ? 401 : 200;
  console.log('status:  ' + status + ' code:  ' + code  + ' error:  ' + error);
  
  // In production, redirect to custom protocol instead of using server
  // For development, use server socket
  if (config.isDev && socket) {
    socket.emit('authorization-from-spotify', {
      status,
      code,
      error
    });
  } else if (!config.isDev && code) {
    // In production, redirect browser to custom protocol
    // The Electron app will handle bindify://authorize
    res.redirect(`bindify://authorize?code=${code}`);
    return;
  } else if (!config.isDev && error) {
    res.redirect(`bindify://authorize?error=${error}`);
    return;
  }
  
  // Send response to Spotify redirect (development only)
  if (error) {
    res.send(`<html><body><h1>Authorization Failed</h1><p>${error}</p><script>window.close()</script></body></html>`);
  } else {
    res.send('<html><body><h1>Authorization Successful!</h1><p>You can close this window.</p><script>window.close()</script></body></html>');
  }
});
