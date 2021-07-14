let socket = io();
      let el;

      socket.on('time', (timeString) => {
        el = document.getElementById('server-time');
        el.innerHTML = 'Server time: ' + timeString;
      });