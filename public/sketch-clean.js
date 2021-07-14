var button;
var paths = ['files/wendler-impfung.mp3', 'files/xavier-singt.mp3', 'files/aktivist-mann.mp3',
            'files/attila-antisemitism.mp3', 'files/eva-appell.mp3', 'files/heiko-impfung.mp3',
            'files/miriam-merkel.mp3', 'files/ballweg-an-attila.mp3', 'files/nana-kritik.mp3'];
var names = ['Michael Wendler', 'Xavier Naidoo', 'Aktivist Mann', 'Attila Hildmann', 'Eva Hermann', 
            'Heiko Schrang', 'Miriam Hope', 'Michael Ballweg', 'Nana Domena'];
var positions = [];
var files = [];

var socket;

let things = [];
let counter = [];
let state = [];
let status;
let echo_distance = 100;

function preload() {

    for (let i = 0; i < paths.length; i ++) {
        let file = loadSound(paths[i]);
        files.push(file);
    }
}

function setup() {
    createCanvas(displayWidth, displayHeight);

    // Start a socket connection to the server
    // Some day we would run this server somewhere else
    // 'https://querdenken.herokuapp.com' || 
    socket = io.connect('http://localhost:3000');

    // fill the position array
    for (i = 0; i < paths.length; i ++) {
        append(positions, [random(100, (displayWidth-100)), random(100, (displayHeight-100))]);
    }
    
    // create button to start and stop sound
    button = createButton('start');
    // button.mousePressed(togglePlaying);

    // create sound objects
    for (let i = 0; i < files.length; i ++) {
        let thing = new Sound(positions[i][0], positions[i][1], names[i], files[i]);
        things.push(thing);
    }

    // loop sound objects
    for (let i = 0; i < things.length; i ++) {
        things[i].sound.loop();
    }

    // check hover status
    setInterval(checkStatus, 1000);
    // track time for hover in vicinity of object
    setInterval(trackTime, 1000);
    // create echo
    setInterval(createEcho, 1000);

}

function togglePlaying() {

    for (i = 0; i < files.length; i ++) {
        if (files[i].isPlaying()){
            files[i].pause();
            button.html('play');
        } else {
            files[i].play();
            button.html('silence');
        }
    }
}

function checkStatus() {

    for (i = 0; i < files.length; i ++) {
        things[i].hovered(mouseX, mouseY);
        state[i] = status;
    }
}

function trackTime() {

    for (i = 0; i < files.length; i ++) {
        if (state[i] == true) {
            counter[i] ++;
            // console.log(counter[i]);
        } if (state[i] == false) {
            counter[i] = 0;
            // console.log(counter[i]);
        }
    }
}

function createEcho() {

    for (i = 0; i < files.length; i ++) {
        // if hovered longer than 5 seconds
        if (counter[i] == 5) {
            // play sound again
            things[i].sound.play();
            // set counter to 0
            counter[i] = 0;
        }
    }
}

function draw() {
    background(30);
    
    for (i = 0; i < files.length; i ++) {
        things[i].show();
        things[i].label();
        things[i].controlVolume(mouseX, mouseY);
    }

    ellipse(mouseX, mouseY, 10);

    // Send the mouse coordinates
    sendmouse(mouseX,mouseY);

    // draw the other mouse
    socket.on('mouse', mouseMirror); 
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

    // draw a red circle
    fill(255, 0, 0);
    ellipse(data.x, data.y, 100);
}

class Sound {
    constructor(x, y, name, sound) {
        this.x = x;
        this.y = y;
        this.name = name;
        this.sound = sound;
    }

    show() {
        noStroke();
        fill(255);
        // draw a circle centered at each point
        ellipse(this.x, this.y, 5);
    }

    label() {
        //add text label
        textSize(12);
        textAlign(CENTER)
        text(this.name, this.x, this.y + 20);
    }

    controlVolume(x, y) {
        let d = dist(this.x, this.y, x, y);
        let volume = map(d, 0, 300, 2, 0);

        // cut off if value is negative
        if (volume > 0) {
            this.sound.amp(volume);
        } else {
            this.sound.amp(0);
        } 
    }

    hovered(x, y) {
        let d = dist(x, y, this.x, this.y);
        if (d < echo_distance) {
            status = true;
        } else {
            status = false;
        }
    }
}
