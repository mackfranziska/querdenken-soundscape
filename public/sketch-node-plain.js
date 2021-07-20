var socket;
let vector;

function setup() {
    createCanvas(windowWidth, windowHeight);
    vector = createVector(-100, -100);

    socket = io.connect('http://localhost:3000');
}

function draw() {
    background(15, 22, 32);

    //// ___________ NODE JS STUFF _____________

    // Send the mouse coordinates
    sendmouse(mouseX,mouseY);

    // draw the other mouse
    socket.on('mouse', mouseMirror); 

    // draw a red circle
    fill(255, 0, 0);
    ellipse(vector.x, vector.y, 100);

    //// ___________ NODE JS STUFF _____________
}

// send mouse x and y position
function sendmouse(xpos, ypos) {
    // We are sending!
    console.log('sendmouse: ' + xpos + '' + ypos);
    
    // Make a little object with  and y
    var data = {
      x: xpos,
      y: ypos
    };
  
    // Send that object to the socket
    socket.emit('mouse', data);
  }

// receive data
function mouseMirror(data) {
    // we are receiving!
    console.log('data received');

    vector.x = data.x;
    vector.y = data.y;
    
}