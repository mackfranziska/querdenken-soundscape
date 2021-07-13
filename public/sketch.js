var button;
var sounds;
var names;
var position;

var socket;

function preload() {
    wendler = loadSound('files/wendler-impfung.mp3');
    xavier =  loadSound('files/xavier-singt.mp3');
    aktivist = loadSound('files/aktivist-mann.mp3');
    attila =  loadSound('files/attila-antisemitism.mp3');
    eva =  loadSound('files/eva-appell.mp3');
    heiko =  loadSound('files/heiko-impfung.mp3');
    miriam =  loadSound('files/miriam-merkel.mp3');
    ballweg = loadSound('files/ballweg-an-attila.mp3');
    nana = loadSound('files/nana-kritik.mp3');

    console.log('loaded');
}

function setup() {
    createCanvas(displayWidth, displayHeight);

    // Start a socket connection to the server
    // Some day we would run this server somewhere else
    // 'https://querdenken.herokuapp.com' || 
    socket = io.connect('https://querdenken.herokuapp.com');
    // We make a named event called 'mouse' and write an
    // anonymous callback function

    sounds = [wendler, xavier, aktivist, attila, eva, heiko, miriam, ballweg, nana];
    names = ['Michael Wendler', 'Xavier Naidoo', 'Aktivist Mann', 'Attila Hildmann', 'Eva Hermann', 'Heiko Schrang', 'Miriam Hope', 'Michael Ballweg', 'Nana Domena'];
    
    // create array of random positional values
    position = [];
    for (i = 0; i < sounds.length; i ++) {
        append(position, [random(100, (displayWidth-100)), random(100, (displayHeight-100))]);
    }
    
    // create button to stop sound
    button = createButton('start');
    button.mousePressed(togglePlaying);

    // loop sounds
    for (i = 0; i < sounds.length; i ++) {
        sounds[i].loop();
    }

}

function togglePlaying() {
    for (i = 0; i < sounds.length; i ++) {
        if (sounds[i].isPlaying()){
            sounds[i].pause();
            button.html('play');
        } else {
            sounds[i].play();
            button.html('silence');
        }
    }
}


function draw() {
    background(30);
    
    // for each sound file:
    for (i = 0; i < sounds.length; i ++) {

        // console.log(i);
        noStroke();
        fill(255);
        // draw a circle centered at each point
	    ellipse(position[i][0], position[i][1], 5);

        //add text label
        textSize(12);
        textAlign(CENTER)
        text(names[i], position[i][0], position[i][1]+20);

        // calculate the distance between mouse and position
	    d = dist(position[i][0], position[i][1], mouseX, mouseY);
        var volume = map(d, 0, 300, 2, 0);

        // cut off if value is negative
        if (volume > 0) {
            sounds[i].amp(volume);
        } else {
            sounds[i].amp(0);
        } 
    }

    stroke(255);
    noFill();
    // draw mouse
    ellipse(mouseX, mouseY, 10);

    // Send the mouse coordinates
    sendmouse(mouseX,mouseY);

    // draw the other mouse
    socket.on('mouse', mouseMirror); //???
}

// trace mouse movement
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

// trace mouse movement:
// receive data
function mouseMirror(data) {
    // we are receiving!
    console.log('data received');

    // draw a red circle
    fill(255, 0, 0);
    ellipse(data.x, data.y, 100);
}
