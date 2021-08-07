let data;
let months = ["March", "April", "May", "June", "July", "August", "September", "October", "November", "December", "January", "February", "March21", "April21", "May21", "June21", "July21"];
var starter = "March";
var files_index = 0;

var button;
var main;
var selectors = [];
let toggle = false;

var files = [];
var range = [];
var positions = [];
var channels = [];
var views = [];
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
let totalfiles = 209;
let things_r = [];

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
    viewcount_img = loadImage('assets/viewcount@2x.png');    

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
                    
                    // nest inside main element
                    main = select("main");
                    main.child(button);

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
        // fill viewcount array
        append(views, [data[starter][i]["views"]]);
        // fill the echo_state array
        let echoed = false;
        echo_state.push(echoed);
    }
}

function createSoundObjects() {

    things_r.length = 0; // this array is for storing the bubble radius

    // create sound objects for starter month
    for (let i = 0; i < data[starter]["length"]; i++) {
        let thing = new Sound(positions[i][0], positions[i][1], channels[i], files[files_index][i], 
                              range[i], files[files_index][i].duration(), views[i]);
        things.push(thing);

        things_r.push(0); // fill radius array with placeholders
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

    let overlay = createDiv().addClass('overlay');
    main.child(overlay);

    // create calendar div to hold years
    let cal = createDiv().addClass('calendar');
    overlay.child(cal);

    // div for each year
    let year2020 = createDiv().addClass('year');
    let year2021 = createDiv().addClass('year');

    // create unselectable buttons (beginning)
    let l_b = ['JAN', 'FEB'];
    l_b.forEach(mon => {
        let btn_dead = createButton(mon).addClass('dead');
        year2020.child(btn_dead);
    });

    for (i = 0; i < months.length; i++) {
        // for each month create a button, assign class
        let btn_txt = ["MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC", "JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL"];
        // let btn_txt = ["March", "April", "May", "June", "July", "August", "September", "October", "November", "December", "January", "February", "March", "April", "May", "June", "July"];
        
        var btn = createButton(btn_txt[i]);

        if (i == months.indexOf(starter)) {
            btn.addClass('infocus'); // set focus on starter button
        } else {
            btn.addClass('selector'); // all others get selector class
        }

        if (i < 10) {
            year2020.child(btn);
        } else {
            year2021.child(btn);
        }

        // create array of button and month
        var sub = [btn ,months[i]];
        // add to selectors array
        selectors.push(sub);
    }

    // create more unselectable buttons (end of 2021)
    let l_e = ['AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    l_e.forEach(mon => {
        let btn_dead = createButton(mon).addClass('dead');
        year2021.child(btn_dead);
    });

    let cont1 = createDiv('2020').addClass('legend');
    year2020.child(cont1);

    let cont2 = createDiv('2021').addClass('legend');
    year2021.child(cont2);
    
    cal.child(year2020);
    cal.child(year2021);

    // instruction
    let info = createDiv('choose month');
    info.addClass('info');
    overlay.child(info);
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

        var percent = floor(pcounter / totalfiles * 100);
        text(percent + '%', windowWidth/2, windowHeight/2 );

        textFont(proxima_regular);
        textSize(13);
        text('loaded', windowWidth/2, windowHeight/2 + 20 );
    }

    if (toggle == true) { // if button has been pressed

        for (i = 0; i < things.length; i++) { // loop through sound objects

            things[i].controlVolume(mouseX, mouseY, client_arr); // change volume
            things[i].hovered(mouseX, mouseY, client_arr); // determine if hovered over

            if ((status == false) || (m_status == false)) {
                things[i].outline(things_r[i]); // if not, outline
            } 

            let interval = things[i].range / 10;

            if (things_r[i] < things[i].range) {
                things_r[i] = things_r[i] + interval;
            }
        
        };

        for (i = 0; i < things.length; i++) { // loop through sound objects
            things[i].hovered(mouseX, mouseY, client_arr); // determine if hovered over

            var timestamp = things[i].sound.bufferSourceNode.context.currentTime;

            if ((status == true) || (m_status == true)){ // if yes...
                things[i].fillArea(things_r[i]); // highlight area
                things[i].fillCircle(timestamp, things_r[i]);

                if (things_r[i] >= things[i].range){
                    things[i].addViewcount(things_r[i]);
                }
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
    selectors.forEach(pair => { // if pressed

        pair[0].mousePressed(doit);

        function doit() {

            // change starter month button class
            selectors[months.indexOf(starter)][0].removeClass("infocus").addClass("selector");

            // is starter month the same as button?
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
    constructor(x, y, name, sound, range, duration, views) {
        this.x = x;
        this.y = y;
        this.name = name;
        this.sound = sound;
        this.range = range;
        this.duration = duration;
        this.views = views;
    }

    fillArea(r) {

        noStroke();
        fill(47,52,59,100);

        ellipse(this.x, this.y, r/1.5+2.5);
    }

    outline(r) {

        strokeWeight(4);
        stroke(47,52,59,100);
        noFill();

        // outline area
        ellipse(this.x, this.y, r/1.5); // this.range

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

    fillCircle(timestamp, r) {

        var percentage = (timestamp / this.duration) * 100;
        var stop = map(percentage, 0, 100, -90, 270);

        // drawingContext.setLineDash([0, 0]);
        strokeWeight(4);
        noFill();

        angleMode(DEGREES);

        stroke('#E5E5E5');
        arc(this.x, this.y, r/1.5, r/1.5, -90, stop);
    }

    addViewcount(r) {

        //add viewcount label
        let boxX = this.x + r/6.5;
        let boxY = this.y + r/3.5;

        let width = textWidth(this.views);

        rectMode(CORNER);
        noStroke();
        fill('#2F343B');
        rect(boxX, boxY, width+32, 20, 4);

        fill(255);
        textFont(proxima_regular);
        textSize(13);
        textAlign(LEFT, CENTER);
        text(this.views, boxX+25, boxY+9);

        viewcount_img.resize(15, 10);
        image(viewcount_img, boxX+5, boxY+5);
    }
}