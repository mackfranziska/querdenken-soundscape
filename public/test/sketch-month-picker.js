let data;
let months = ["March", "April", "May", "June", "July", "August"];
var starter;
var current;
var files_index;

var button;
var selectors = [];
let toggle = false;

var files = [];
var range = [];
var positions = [];
var channels = [];
let things = [];

let proxima_bold;
let proxima_regular;

let delay;
let counter = [];
let state = [];
let status;
let echos = [];
let echo_state = [];

var socket;
let vector;

function preload() {

    // load fonts
    proxima_bold = loadFont('fonts/Mark Simonson - Proxima Nova Bold.otf');
    proxima_regular = loadFont('fonts/Mark Simonson - Proxima Nova Regular.otf');

    // load cursor img
    img = loadImage('assets/hear-no-evil@2x.png');

    // load data 
    data = loadJSON('json/combined.json', loadSounds);
}

// create loadSound via callback function
function loadSounds(data) {
    // for each month
    for (let j = 0; j < months.length; j++) {
        let sublist = [];

        // for each protagonist
        for (let i = 0; i < data[months[j]]["length"]; i++) {
            // access path
            let path = data[months[j]][i]["path"];
            // load soundfile at path
            let file = loadSound(path);
            // append to files
            sublist.push(file);
            console.log('sound loaded at: ' + path);
        }

        files.push(sublist);
    };
}

function setup() {
    createCanvas(windowWidth, windowHeight);
    // vector for saving incoming mouse postion
    vector = createVector(-100, -100);

    delay = new p5.Delay();

    // NODE: Start a socket connection to the server
    // 'https://querdenken.herokuapp.com' || http://localhost:3000
    socket = io.connect('http://localhost:3000');

    socket.on('mouse', 
    // when we receive data
        function(data) {

            // we are receiving!
            console.log('data received');
            
            // update coordinates
            vector.x = data.x;
            vector.y = data.y;
        }
    );

    // set starter month
    starter = "March";
    files_index = 0;

    fillArrays();
    createSoundObjects();

    // create button to start and stop sound
    button = createButton('press to start');
    button.addClass('start');
    button.mousePressed(startAudio);

    // check hover status
    setInterval(checkStatus, 1000);
    // track time for hover in vicinity of object
    setInterval(trackTime, 1000);
    // create echo
    // setInterval(createEcho, 1000);

}

function fillArrays() {

    for (i = 0; i < data[starter]["length"]; i++) {
        // fill the position array 
        append(positions, [(data[starter][i]["pos"][0] * windowWidth) / 100, (data[starter][i]["pos"][1] * windowHeight) / 100]);
        // fill the range array 
        append(range, [data[starter][i]["range"] * windowWidth / 40]);
        // fill channel array
        append(channels, [data[starter][i]["channel"]]);
        // fill the echo_state array
        let echoed = false;
        echo_state.push(echoed);
    }
}

function createSoundObjects() {

    // create sound objects for starter month
    for (let i = 0; i < data[starter]["length"]; i++) {
        let thing = new Sound(positions[i][0], positions[i][1], channels[i], files[files_index][i], range[i]);
        things.push(thing);
    }
}

function startAudio() {

    for (i = 0; i < things.length; i++) {
        things[i].sound.loop();
        button.hide();
        noCursor();
        toggle = true;
    }

    // create month selector
    createMonthSelector();
}

function createMonthSelector() {

    let div1 = createDiv();
    div1.addClass('overlay');

    // create div to hold buttons
    let div2 = createDiv();

    for (i = 0; i < months.length; i++) {
        // for each month create a button, assign class
        var btn = createButton(months[i]);
        btn.addClass('selector');

        // make child of div
        div2.child(btn);

        // create array of button and month
        var sub = [btn ,months[i]];
        // add to selectors array
        selectors.push(sub);
    }

    let div3 = createDiv('choose month');
    div3.addClass('info');
    div1.child(div2);
    div1.child(div3);
}

function checkStatus() {

    for (i = 0; i < things.length; i++) {
        // if hover on element
        things[i].hovered(mouseX, mouseY);
        // note change in status
        state[i] = status;
    }
}

function trackTime() {

    // if start button has been pressed, track time
    if (toggle == true){
        // start counter for each element that has been hovered over
        for (i = 0; i < things.length; i++) {
            if (state[i] == true) {
                counter[i]++;
                // console.log('counter: ' + counter[i]);
            } if (state[i] == false) {
                counter[i] = 0;
            }
        }
    }
}

function createEcho() {

    for (i = 0; i < things.length; i++) {

        // if hovered longer than 3 seconds and no echo added yet
        if ((counter[i] == 3) & (echo_state[i] == false)) {
            // copy sound
            let new_echo = things[i].sound;
            // apply effect and play
            delay.process(new_echo, 0.12, .5, 1300);
            new_echo.play();
            // log that echo has been added
            echo_state[i] = true;
            // console.log('echo added: ' + echo_state[i]);
        }
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);

    positions = [];
    range = [];
    things = [];
    echo_state = [];

    fillArrays();
    createSoundObjects();
}

function draw() {
    background(15, 22, 32);

    if (toggle == true) {

        for (i = 0; i < things.length; i++) {
            //things[i].show();
            things[i].outline();
            things[i].outlineArea(mouseX, mouseY);
            things[i].labelHover(mouseX, mouseY);
            things[i].controlVolume(mouseX, mouseY);
        };

        img.resize(24, 24);
        image(img, mouseX - 12, mouseY - 12);

        // draw the other mouse
        fill(255, 0, 0);
        ellipse(vector.x, vector.y, 10);
    }
}

function mouseMoved() {

    // Send the mouse coordinates
    sendmouse(mouseX,mouseY);

}

function sendmouse(xpos, ypos) {

    // send mouse x and y position
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

function mousePressed() {

    // for each month selector button
    selectors.forEach(pair => {
        // if pressed
        pair[0].mousePressed(doit);

        function doit() {

            // is starter month the same as button text?
            if (starter != pair[1]) {
                
                // if not, set equal
                starter = pair[1];
                // update index variable to be used in createSoundObjects function
                files_index = months.indexOf(pair[1]);
                
                // stop all sound
                for (i = 0; i < things.length; i++) {
                    things[i].sound.stop();
                }
            
                // update arrays
                positions = [];
                range = [];
                channels = [];
                things = [];
                echo_state = [];
            
                //fill arrays and create new Sound Objects
                fillArrays();
                createSoundObjects();
            
                // play new sounds
                for (i = 0; i < things.length; i++) {
                    things[i].sound.loop();
                }
            } 
        }
    });
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

        if (d < this.range / 2) {
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

        if (d < (this.range / 5)) {
            text(this.name, this.x, this.y + 5);
        }
    }

    controlVolume(x, y) {
        let d = dist(this.x, this.y, x, y);
        let volume = map(d, 0, this.range / 2 + 10, 4, 0);

        // cut off if value is negative
        if (volume > 0) {
            this.sound.amp(volume);
        } else {
            this.sound.amp(0);
        }
    }

    hovered(x, y) {
        let d = dist(x, y, this.x, this.y);

        if (d < this.range / 2) {
            status = true;
        } else {
            status = false;
        }
    }
}