var button;
var paths = ['files/wendler-impfung.mp3', 'files/xavier-singt.mp3', 'files/aktivist-mann.mp3',
            'files/attila-antisemitism.mp3', 'files/eva-appell.mp3', 'files/heiko-impfung.mp3',
            'files/miriam-merkel.mp3', 'files/ballweg-an-attila.mp3', 'files/nana-kritik.mp3',
            'files/samuel-drosten.mp3', 'files/bodo-weint.mp3', 'files/markus.mp3',
            'files/ken.mp3', 'files/sebastian.mp3', 'files/milena.mp3',
            'files/wolfgang.mp3', 'files/fuellmich.mp3', 'files/ludwig.mp3',
            'files/friedemann.mp3', 'files/alexander.mp3', 'files/wodarg.mp3',
            'files/herman.mp3', 'files/oliver.mp3', 'files/thorsten.mp3'];

var names = ['t.me/WENDLER', 't.me/Xavier_Naidoo', 't.me/aktivistmann', 't.me/ATTILAHILDMAN', 't.me/evarosen', 
            't.me/Schrang_TV', 't.me/MiriamHope', 't.me/querdenken_711', 't.me/nana_lifestyler',
            't.me/samueleckert', 't.me/AllesAusserMainstream', 't.me/Haintz', 't.me/KenFM',
            't.me/CoronaFakten', 't.me/Punkt.Preradovic', 't.me/Wolfmut_Tiefgang',
            't.me/RAFuellmich', 't.me/RALudwig', 't.me/RA_Däbnitz', 't.me/honkforhope',
            't.me/wordarg', 't.me/Eva_Herman_OFFICIAL', 't.me/JANICHOFFICIAL', 't.me/Silberjunge'];

// var names = ['Michael Wendler', 'Xavier Naidoo', 'Aktivist Mann', 'Attila Hildmann', 'Eva Rosen', 
//             'Heiko Schrang', 'Miriam Hope', 'Michael Ballweg', 'Nana Domena',
//             'Samuel Eckert', 'Bodo Schiffmann', 'Markus Haintz', 'Ken Jebsen',
//             'Sebastian Verboket', 'Milena Preradovic', ' Wolfgang Greulich',
//             'Rainer Fuellmich', 'Ralf Ludwig', 'Friedemann Däbnitz', 'Alexander Ehrlich',
//             'Wolfgang Wodarg', 'Eva Herman', ' Oliver Janich', 'Thorsten Schulte'];

var relative_range = [12.588235294117647,
                    12.588235294117647,
                    6.882352941176471,
                    13.529411764705882,
                    4.588235294117647,
                    9.882352941176471,
                    8.941176470588236,
                    9.882352941176471,
                    5.294117647058823,
                    11.058823529411764,
                    9.882352941176471,
                    9.882352941176471,
                    9.882352941176471,
                    9.470588235294118,
                    5.294117647058823,
                    6.882352941176471,
                    8.0,
                    8.0,
                    5.9411764705882355,
                    5.9411764705882355,
                    6.529411764705882,
                    15.117647058823529,
                    15.764705882352942,
                    8.764705882352942];

var relative_pos = [[30, 33],
                    [30, 54],
                    [69, 77],
                    [41, 45],
                    [52, 75],
                    [42, 67],
                    [46, 81],
                    [60, 37],
                    [63, 54],
                    [77, 56],
                    [87, 59],
                    [71, 40],
                    [56, 58],
                    [61, 82],
                    [63, 69],
                    [82, 69],
                    [61, 15],
                    [66, 27],
                    [70, 17],
                    [86, 39],
                    [46, 13],
                    [17, 45],
                    [20, 70],
                    [48, 30]];

var range = [];
var positions = [];
var files = [];

var socket;

let things = [];
let counter = [];
let state = [];
let status;

let proxima_bold;
let proxima_regular;

let img;
let toggle = false;

function preload() {

    proxima_bold = loadFont('fonts/Mark Simonson - Proxima Nova Bold.otf');
    proxima_regular = loadFont('fonts/Mark Simonson - Proxima Nova Regular.otf');

    img = loadImage('assets/hear-no-evil@2x.png');

    for (let i = 0; i < paths.length; i ++) {
        let file = loadSound(paths[i]);
        files.push(file);
    }
}

function setup() {
    createCanvas(windowWidth, windowHeight);

    // Start a socket connection to the server
    // Some day we would run this server somewhere else
    // 'https://querdenken.herokuapp.com' || http://localhost:3000
    socket = io.connect('https://querdenken.herokuapp.com');

    // fill the position array 
    for (i = 0; i < relative_pos.length; i ++) {
        append(positions, [(relative_pos[i][0] * windowWidth)/100, (relative_pos[i][1] * windowHeight)/100]);
    }
    
    // fill the range array
    for (i = 0; i < relative_range.length; i ++) {
        append(range, [relative_range[i] * windowWidth/50]);
    }
    
    // create button to start and stop sound
    button = createButton('press to start');
    button.mousePressed(togglePlaying);

    // create sound objects
    for (let i = 0; i < files.length; i ++) {
        let thing = new Sound(positions[i][0], positions[i][1], names[i], files[i], range[i]);
        things.push(thing);
    }

    // loop sound objects
    for (let i = 0; i < things.length; i ++) {
        things[i].sound.loop();
    }

    // check hover status
    // setInterval(checkStatus, 1000);
    // track time for hover in vicinity of object
    // setInterval(trackTime, 1000);
    // create echo
    // setInterval(createEcho, 1000);

}

function togglePlaying() {

    for (i = 0; i < files.length; i ++) {
        if (files[i].isPlaying()){
            files[i].pause();
            button.html('one more time!');
        } else {
            files[i].play();
            // button.html('silence');
            button.hide();
            noCursor();
            toggle = true;
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
    background(15, 22, 32);
    
    // for (i = 0; i < files.length; i ++) {
    //     //things[i].show();
    //     things[i].outline();
    //     things[i].outlineArea(mouseX, mouseY);
    //     things[i].labelHover(mouseX, mouseY);
    //     things[i].controlVolume(mouseX, mouseY);
    // }

    // stroke(255);
    // noFill();
    // drawingContext.setLineDash([]);
    // ellipse(mouseX, mouseY, 10);

    if (toggle == true) {

        for (i = 0; i < files.length; i ++) {
            //things[i].show();
            things[i].outline();
            things[i].outlineArea(mouseX, mouseY);
            things[i].labelHover(mouseX, mouseY);
            things[i].controlVolume(mouseX, mouseY);
        }

        img.resize(24,24);
        image(img, mouseX-12, mouseY-12);
    }

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
    constructor(x, y, name, sound, range) {
        this.x = x;
        this.y = y;
        this.name = name;
        this.sound = sound;
        this.range = range;
    }

    show() {
        noStroke();
        fill(100);

        // draw a circle centered at each point
        ellipse(this.x, this.y, 5);
    }

    outlineArea(x, y) {

        noStroke();
        fill(255, 20);

        let d = dist(x, y, this.x, this.y);

        if (d < this.range/2) {
            drawingContext.setLineDash([0.5, 3]);
            // outline area
            ellipse(this.x, this.y, this.range);
        }
    }

    outline() {

        stroke(100);
        noFill();
        drawingContext.setLineDash([5, 7]);
        
        // outline area
        ellipse(this.x, this.y, this.range);
    }

    labelHover(x, y) {
        noStroke();
        fill(255);
        textFont(proxima_regular);
        textSize(13);
        textAlign(CENTER)

        //add text label
        let d = dist(x, y, this.x, this.y);

        if (d < (this.range/5)) {
            text(this.name, this.x, this.y+5);
        }
    }

    controlVolume(x, y) {
        let d = dist(this.x, this.y, x, y);
        let volume = map(d, 0, this.range/2+10, 2, 0);

        // cut off if value is negative
        if (volume > 0) {
            this.sound.amp(volume);
        } else {
            this.sound.amp(0);
        } 
    }

    hovered(x, y) {
        let d = dist(x, y, this.x, this.y);

        if (d < this.range) {
            status = true;
        } else {
            status = false;
        }
    }
}
