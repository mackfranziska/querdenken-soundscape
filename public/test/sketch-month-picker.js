let data;
let months = ["March", "April", "May", "June", "July", "August", "September", "October", "November", "December", "January", "February", "March21", "April21", "May21", "June21", "July21"];
var starter = "March";
var files_index = 0;

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
let status; // hovered (own mouse)
let m_status; // hovered (other mice)
let echos = [];
let echo_state = [];
let pcounter = 0;
let totalfiles = 112;

var socket;
let vector;
let clients = [];
let client_arr = {};
let colors = ['#EC7585', '#B397F6', '#4C3EFF', '#00BEA6'];

function setup() {

    createCanvas(windowWidth, windowHeight);

    // LOAD STUFF
    proxima_bold = loadFont('fonts/Mark Simonson - Proxima Nova Bold.otf');
    proxima_regular = loadFont('fonts/Mark Simonson - Proxima Nova Regular.otf');

    // load cursor img
    img = loadImage('assets/hear-no-evil@2x.png');

    // load data 
    data = loadJSON('json/files.json', loadSounds);

    // NODE: Start a socket connection to the server
    // 'https://querdenken.herokuapp.com' || http://localhost:3000
    socket = io.connect('https://querdenken.herokuapp.com');

    // vector for saving incoming mouse postion
    vector = createVector(-100, -100);

    socket.on('mouse', 
    // when we receive data
        function(data) {

            // we are receiving!
            console.log('data received from: ' + data.id);

            if (clients.includes(data.id) == false) {
                client_arr[data.id] = [data.x, data.y, random(colors)];

            } else { 
                client_arr.forEach(item => {
                    if (item == data.id) {
                        // update coordinates
                        client_arr[item][0] = data.x;
                        client_arr[item][1] = data.y;
                    }
                });
            }
        }
    );

    delay = new p5.Delay();

    // check hover status
    setInterval(checkStatus, 1000);
    // track time for hover in vicinity of object
    setInterval(trackTime, 1000);
    // create echo
    // setInterval(createEcho, 1000);

}

function loadSounds(data) { // load sounds via callback function

    // for each month
    for (let j = 0; j < months.length; j++) {
        let sublist = [];

        // for each protagonist
        for (let i = 0; i < data[months[j]]["length"]; i++) {

            // access path
            let path = data[months[j]][i]["path"];
            // load soundfile at path
            let file = loadSound(path, function counter() { // callback
                
                // count files loaded
                console.log(pcounter);
                pcounter++;

                if (pcounter == totalfiles) { // if last file was loaded
            
                    fillArrays();
                    createSoundObjects();
            
                    // create button to start and stop sound
                    button = createButton('press to start');
                    button.addClass('start');
                    button.mousePressed(startAudio);
                }
            });

            // append to files
            sublist.push(file);
        }
        files.push(sublist);
    };
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
        let thing = new Sound(positions[i][0], positions[i][1], channels[i], files[files_index][i], 
                              range[i], files[files_index][i].duration());
        things.push(thing);
    }
}

function startAudio() {

    for (i = 0; i < things.length; i++) {
        things[i].sound.loop(); // .loop()
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

    if (pcounter == totalfiles) { // only allow recalculation if all files are loaded
        positions = [];
        range = [];
        things = [];
        echo_state = [];

        fillArrays();
        createSoundObjects();
    }
}

function draw() {
    background(15, 22, 32);

    if (pcounter < totalfiles) { // loading animation

        noStroke();
        fill(255);
        textFont(proxima_bold);
        textSize(30);
        textAlign(CENTER)

        var percent = floor(pcounter / 112 * 100);
        text(percent + '%', windowWidth/2, windowHeight/2 );

        textFont(proxima_regular);
        textSize(13);
        text('loaded', windowWidth/2, windowHeight/2 + 20 );
    }

    if (toggle == true) { // if button has been pressed

        for (i = 0; i < things.length; i++) { // loop through sound objects
            var timestamp = things[i].sound.bufferSourceNode.context.currentTime;

            things[i].controlVolume(mouseX, mouseY, client_arr); // change volume
            things[i].hovered(mouseX, mouseY, client_arr); // determine if hovered over

            if ((status == false) || (m_status == false)) {
                things[i].outline(); // if not, outline
            } 
        };

        for (i = 0; i < things.length; i++) { // loop through sound objects
            things[i].hovered(mouseX, mouseY, client_arr); // determine if hovered over

            if ((status == true) || (m_status == true)){ // if yes...
                things[i].fillArea(); // highlight area
                things[i].fillCircle(timestamp);
                things[i].addViewcount();
            } 
        };

        for (i = 0; i < things.length; i++) { // loop through sound objects
            things[i].hovered(mouseX, mouseY, client_arr);

            if ((status == true) || (m_status == true)){ // add label on top
                things[i].labelHover();
            } 
        };

        img.resize(24, 24);
        image(img, mouseX - 12, mouseY - 12);

        // draw the other mice
        for (let c in client_arr) {

            fill('#EC7585'); // fill(client_arr[c][2]);
            ellipse(client_arr[c][0], client_arr[c][1], 8);
        }
    }
}

function mouseMoved() {

    // Send the mouse coordinates
    sendmouse(mouseX, mouseY, socket.id);

}

function sendmouse(xpos, ypos, ID) {

    // send mouse x and y position
    // We are sending!
    // console.log('sendmouse: ' + xpos + '' + ypos);

    // Make a little object with  and y
    var data = {
        x: xpos,
        y: ypos,
        id: ID
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
    constructor(x, y, name, sound, range, duration) {
        this.x = x;
        this.y = y;
        this.name = name;
        this.sound = sound;
        this.range = range;
        this.duration = duration;
    }

    show() {
        noStroke();
        fill(100);

        // draw a circle centered at each point
        ellipse(this.x, this.y, 5);
    }

    fillArea() {

        noStroke();
        fill(47,52,59,100);

        drawingContext.setLineDash([0.5, 3]);
        // outline area
        ellipse(this.x, this.y, this.range/1.5+2.5);
    }

    outline() {

        // strokeWeight(1);
        stroke(47,52,59,100);
        noFill();
        // drawingContext.setLineDash([2, 2]);

        // outline area
        ellipse(this.x, this.y, this.range/1.5);

    }

    labelHover() {
        noStroke();
        fill('#4BE1C3');
        textFont(proxima_regular);
        textSize(13);
        textAlign(CENTER)

        text(this.name, this.x, this.y + 5);
    }

    controlVolume(x, y, mice) {
        // for your own mouse
        let d = dist(this.x, this.y, x, y);
        let volume = map(d, 0, this.range / 3 + 30, 4, 0);

        // cut off if value is negative
        if (volume > 0) {
            this.sound.amp(volume);
        } else {
            this.sound.amp(0);
        }

        // for other visitors
        for (let c in mice) {

            let md = dist(this.x, this.y, mice[c][0], mice[c][1]);
            let mvolume = map(md, 0, this.range / 3 + 30, 4, 0);

            if (mvolume > 0) {
                this.sound.amp(mvolume);
            } else {
                this.sound.amp(0);
            }
            
        }
    }

    hovered(x, y, mice) {
        // for mouse
        let d = dist(x, y, this.x, this.y);

        if (d < this.range / 3) {
            status = true;
        } else {
            status = false;
        }

        // for other mice
        for (let c in mice) {

            let md = dist(this.x, this.y, mice[c][0], mice[c][1]);

            if (md < this.range / 3) {
                m_status = true;
            } else {
                m_status = false;
            }
        }
    }

    fillCircle(timestamp) {

        var percentage = (timestamp / this.duration) * 100;
        var stop = map(percentage, 0, 100, -90, 270);

        drawingContext.setLineDash([0, 0]);
        strokeWeight(4);
        noFill();

        angleMode(DEGREES);

        stroke('#E5E5E5');
        arc(this.x, this.y, this.range/1.5, this.range/1.5, -90, stop);
    }

    addViewcount() {

        //add viewcount label
        let boxX = this.x + this.range/3-this.range/6;
        let boxY = this.y + this.range/3;

        rectMode(CENTER);
        noStroke();
        fill('#2F343B');

        rect(boxX+3 , boxY+2, 50, 20, 4);

        fill(255);
        textFont(proxima_regular);
        textSize(13);
        textAlign(LEFT, CENTER);

        text('12K', boxX , boxY);
    }
}