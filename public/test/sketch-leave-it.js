let data;
let months = ["March", "April", "May", "June", "July", "August", "September", "October", "November", "December", "January", "February", "March21", "April21", "May21", "June21", "July21"];
var starter = "March21";
var dataloaded = false;

var cvs, button, main, about, intro, allimgs, txtsection, overlay, selectors = [], disable, dialogue, box, p, body, how, footer;
let toggle = false, disc_toggle = false, backandforth = 0;

var files = [], range = [], positions = [], channels = [], views = [], things = [], things_r = []; // let copies_things = [];
let layers = [];

let proxima_bold, proxima_regular, neuzeit;

let status; // hovered (own mouse)
let m_status; // hovered (other mice)
// let allpositions = []; 

let delay;
let counter = [], state = [];
let echos = [], echo_state = [];

let pcounter = 0, totalfiles = 209;

var socket, vector;
let clients = [], client_arr = {};
let colors = ['#EC7585', '#B397F6', '#4C3EFF', '#00BEA6'];

function setup() {

    cvs = createCanvas(windowWidth, windowHeight-32);
    cvs.hide();

    // LOAD STUFF
    proxima_bold = loadFont('fonts/Mark Simonson - Proxima Nova Bold.otf');
    proxima_regular = loadFont('fonts/Mark Simonson - Proxima Nova Regular.otf');

    neuzeit = loadFont('https://use.typekit.net/wtv7bap.css');

    // load cursor img
    // img = loadImage('assets/hear-no-evil@2x.png');
    img = loadImage('assets/ear-white@2x.png');
    viewcount_img = loadImage('assets/viewcount@2x.png');   
    cursor_img = loadImage('assets/cursor@2x.png');

    // load data 
    data = loadJSON('json/files.json', loadSounds);

    client_arr['self'] = [0, 0]; // add self as client in mouse array
    clients.push('self');

    // NODE: Start a socket connection to the server
    // 'https://querdenken.herokuapp.com' || http://localhost:3000
    socket = io.connect('http://localhost:3000');

    // vector for saving incoming mouse postion
    vector = createVector(-100, -100);

    socket.on('mouse', 
    // when we receive data
        function(data) {

            // we are receiving!
            console.log('data received from: ' + data.id);
            client_arr[data.id] = [data.x, data.y];

            if (clients.includes(data.id) == false) {
                clients.push(data.id);
            }

            if (clients.length > 1) {

                for (client in clients) {
                    if (client == 'self') {
                        //nothing
                    } else {
                        layers[client] = things;
                        //console.log('TOP');
                    }
                }
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

    let placehldr = createButton('0').addClass('placeholder');

    // nest inside main element
    main = select("main");
    main.child(placehldr);

    body = select('body');

    let footer = createDiv("<p class='footer'><span class='highlight'>(Un)Echo Chamber </span>is part of my thesis project at Parsons School of Design. I claim no rights to any of the assets used on this website. If you are the author of a voice message and would like it to be removed, please <span class='underline'>reach out</span>.</p>");//<br><br>Franziska Mack 2021
    footer.parent(body);

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

                var percent = floor(pcounter / totalfiles * 100);
                placehldr.html(percent + '%');

                if (pcounter == totalfiles) { // if last file was loaded
            
                    fillArrays();
                    createSoundObjects();

                    // remove placeholer
                    placehldr.hide();
            
                    // create button to start and stop sound
                    button = createButton('take me there');
                    button.addClass('start');
                    main.child(button); // nest inside main element

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
        append(positions, [(data[starter][i]["pos"][0] * windowWidth) / 100, (data[starter][i]["pos"][1] * (windowHeight-20)) / 100]);
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
        let thing = new Sound(positions[i][0], positions[i][1], channels[i], files[months.indexOf(starter)][i], 
                              range[i], files[months.indexOf(starter)][i].duration(), views[i]);
        things.push(thing);

        things_r.push(0); // fill radius array with placeholders
    }

    if (clients.length > 1) {

        for (client in clients) {
            if (client == 'self') {
                //nothing
            } else {
                layers[client] = things;
                // console.log('TOP');
            }
        }
    }
}

function startAudio() { //

    // hide all the intro stuff
    button.hide();
    allimgs = select(".allimgs");
    allimgs.hide();
    intro = select(".intro");
    intro.hide();
    txtsection = select(".textsection");
    txtsection.hide();
    footer = select('.footer').hide();

    cvs.show();
    select('.bar').style('display', 'flex');
    how = select('.instructions');

    // create month selector
    createMonthSelector();

    if (backandforth == 0) { // if visualization appears for first time
        // transparent overlay
        disable = createDiv().addClass('disable');

        // disclaimer dialogue window
        // button
        dialogue = createButton('OK').addClass('disclaimer');

        // paragraph
        p = createP("Disclaimer: The voice messages on this website have not been<br>content-reviewed and may contain hate speech and medical misinformation. <br>I do not endorse their authors.");
        p.addClass('disclaimertext');

        box = createDiv().addClass('popup'); // box
        box.parent(main); // organize
        p.parent(box);
        dialogue.parent(box);
    } else {
        disable.show();
        box.style('display', 'flex');
    }

    dialogue.mousePressed(function() { // if ok is pressed, start sound


        for (i = 0; i < things.length; i++) {
            things[i].sound.loop(); // .loop() the original sound objects
        }

        // loop the client sound objects
        if (layers.length > 1) {

            for (j=1; j > layers.length; j++) {

                for (i = 0; i < layers[j].length; i++) {
                    layers[j][i].sound.loop(); // .loop() the copy sound objects
                }
            }
        }

        toggle = true;
        disc_toggle = true;

        if (mouseY > 40) {
            noCursor();
        }

        box.hide(); // hide overlay and dialogue box
        disable.hide();
    });
}

function createMonthSelector() {

    if (backandforth == 0) { // if visualization appears for first time

        overlay = createDiv().addClass('overlay');
        main.child(overlay);

        let container = createDiv().addClass('container');
        overlay.child(container);

        // create calendar div to hold years
        let cal = createDiv().addClass('calendar');
        container.child(cal);

        about = createDiv('About the project').addClass('about');
        about.parent(container);

        // div for each year
        let year2020 = createDiv().addClass('year');
        let year2021 = createDiv().addClass('year');

        let btncontainer20 = createDiv().style('background-color', '#0f1620').addClass('months');
        let btncontainer21 = createDiv().style('background-color', '#0f1620').addClass('months');

        // create unselectable buttons (beginning)
        let l_b = ['JAN', 'FEB'];
        l_b.forEach(mon => {
            let btn_dead = createButton(mon).addClass('dead');
            btncontainer20.child(btn_dead);
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
                btncontainer20.child(btn);
            } else {
                btncontainer21.child(btn);
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
            btncontainer21.child(btn_dead);
        });

        btncontainer20.parent(year2020);
        btncontainer21.parent(year2021);

        let cont1 = createDiv('2020').addClass('legend');
        year2020.child(cont1);

        let cont2 = createDiv('2021').addClass('legend');
        year2021.child(cont2);
        
        cal.child(year2020);
        cal.child(year2021);


    } else {
        overlay.show();
        // change starter month button class
        selectors[months.indexOf(starter)][0].removeClass("selector").addClass("infocus");
    }
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
        }
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight-32);

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

    if ((toggle == true) && (disc_toggle == true)){ // if button has been pressed and disclaimer was okayed

        for (i = 0; i < things.length; i++) { // loop through sound objects

            let coordinates = [mouseX, mouseY];

            things[i].controlVolume(coordinates); // change volume
            things[i].panning(mouseX);
            things[i].hovered(coordinates, client_arr); // determine if hovered over

            if ((status == false) || (m_status == false)) {
                things[i].outline(things_r[i]); // if not, outline
            } if (m_status == true) {
                
                if (layers.length > 1) {
                    if (expanded == false) {
                        layers[1][i].sound.amp(1); // change volume
                    } else if (expanded == true){
                        layers[1][i].sound.amp(0); // change volume
                    }
                }

            }

            let interval = things[i].range / 10;

            if (things_r[i] < things[i].range) {
                things_r[i] = things_r[i] + interval;
            }
        
        };

        for (i = 0; i < things.length; i++) { // loop through sound objects
            let coordinates = [mouseX, mouseY];
            things[i].hovered(coordinates, client_arr); // determine if hovered over

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
            let coordinates = [mouseX, mouseY];
            things[i].hovered(coordinates, client_arr);

            if ((status == true) || (m_status == true)){ // add label on top
                things[i].labelHover();
            } 
        };

        
        if (mouseY > 41) {
            img.resize(16, 23);
            image(img, mouseX - 5, mouseY - 5);
        }

        let ccounter = 1;

        // draw the other mice
        for (let c in client_arr) {

            if (c == 'self') {
                // console.log('nothing');
            } else {
                noStroke();
                fill('#E14B4B'); // fill(client_arr[c][2]);
                // ellipse(client_arr[c][0], client_arr[c][1], 8);
    
                let w = textWidth('visitor ' + ccounter); //c.slice(0, 5)
                let x = client_arr[c][0] + 15;
                let y = client_arr[c][1] + 80;
    
                cursor_img.resize(25, 25);
                image(cursor_img, x-19, y-25);
    
                rectMode(CORNER);
                rect(x, y, w+14, 20, 4);
        
                fill(255);
                //textFont(proxima_regular);
                textFont(neuzeit);
                textSize(13);
                textAlign(LEFT, TOP);
                text('visitor ' + ccounter, x+7, y+4); //c.slice(0, 5)
    
                ccounter ++;
            }

        }

        // allow to navigate back to about section
        about.mousePressed(backtoabout);

    }

    if ((toggle == false) && (expanded == true)) { // if how-it-works is expanded, draw anyway

        for (i = 0; i < things.length; i++) { 
        things[i].outline(things_r[i]); 
        }

    }
}

function backtoabout() {

        toggle = false;
        backandforth++;

        for (i = 0; i < things.length; i++) { // stop all sound
            things[i].sound.stop();
        }

        if (layers.length > 1) {

            for (i = 0; i < copy.length; i++) { // stop all copies sound
                layers[1][i].sound.stop();
            }

        }

        // hide stuff
        cvs.hide();
        overlay.hide();
        select('.bar').hide();

        // show intro stuff
        button.show();
        allimgs.show();
        intro.style('display', 'flex');
        txtsection.show();
        footer.show();
        cursor();
}

function mouseMoved() {

    // Send the mouse coordinates
    sendmouse(mouseX, mouseY, socket.id);

    // // update mouse coordinates in client array with own position
    client_arr['self'][0] = mouseX;
    client_arr['self'][1] = mouseY;

}

function sendmouse(xpos, ypos, ID) {

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

                // change button class
                selectors[months.indexOf(starter)][0].removeClass("selector").addClass("infocus");
                
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
        //textFont(proxima_regular);
        textFont(neuzeit, 16);
        textSize(16);
        textAlign(CENTER)

        text(this.name, this.x, this.y + 5);
    }

    controlVolume(array) {

        let d = dist(this.x, this.y, array[0], array[1]);
        let volume = map(d, 0, this.range / 3 + 30, 4, 0);
        
        // cut off if value is negative
        if (volume > 0) {
            this.sound.amp(volume);
            //console.log(volume + ' ' + this.name);
        } else {
            this.sound.amp(0);
        }
    }

    hovered(array, mice) {

        // for mouse
        let d = dist(array[0], array[1], this.x, this.y);

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
        fill('#232830');
        rect(boxX, boxY, width+32, 20, 4);

        fill(255);
        // textFont(proxima_regular);
        textFont(neuzeit, 16);
        textSize(16);
        textAlign(LEFT, CENTER);
        text(this.views, boxX+28, boxY+11);

        viewcount_img.resize(15, 10);
        image(viewcount_img, boxX+6, boxY+5);
    }

    panning(x) {
        // for your own mouse
        let panning = map(x, this.x+this.range/6, this.x-this.range/6, -0.4, 0.4, true);

        this.sound.pan(panning);
    }
}

// _____________ JQUERY _____________ // 

var expanded = false;

$(document).scroll(function() {
    var y = $(this).scrollTop();
    if (y > (windowHeight*1.7)) {
      $('.zwei').fadeIn();
    } else {
      $('.zwei').fadeOut();
    }

    if (y > (windowHeight*1.9)) {
        $('.drei').fadeIn();
      } else {
        $('.drei').fadeOut();
      }
});

function simpleParallax(intensity, element) {
    $(window).scroll(function() {
        var scrollTop = $(window).scrollTop();
        var imgPos = scrollTop / intensity + 'px';
        $(element).css('transform', 'translateY(' + imgPos + ')');
    });
}

$(window).on('scroll', function () {
    var pixels = $(document).scrollTop();
    pixels = pixels / 200;
    $('.a').css({"-webkit-filter": "blur(" + pixels + "px)","filter": "blur(" + pixels + "px)"}); 
    $('.b').css({"-webkit-filter": "blur(" + pixels + "px)","filter": "blur(" + pixels + "px)"});   
    $('.c').css({"-webkit-filter": "blur(" + pixels + "px)","filter": "blur(" + pixels + "px)"});       
});

simpleParallax(-10, '.e');
simpleParallax(-10, '.d');
simpleParallax(-3, '.a');
simpleParallax(-3, '.b');
simpleParallax(-3, '.c');

function revealOnScroll(val, element) {
    $(document).scroll(function() {
        var y = $(this).scrollTop();
        if (y > (windowHeight*val)) {
        $(element).fadeIn();
        } else {
        $(element).fadeOut();
        }
    });
}

revealOnScroll(2.8, '.w');
revealOnScroll(3.05, '.x');
revealOnScroll(3.1, '.y');
revealOnScroll(3.15, '.z');

// take care of how it works section
$(document).ready(function() {
    $('.howitworks').click(function(){
        if (expanded == false) {
            $('.bar').animate({height:'500px'}, 500);
            expanded = true;
            toggle = false;
            $('.disable').show();
            $('.lilx').show();
            $('.lilv').hide();
            $('.overlaycontainer').css('display', 'flex');
            $('.bar').css('z-index', '3');
        } else {
            $('.bar').animate({height:'32px'}, 500);
            expanded = false;
            $('.disable').hide();
            $('.lilv').show();
            $('.lilx').hide();
            $('.overlaycontainer').hide();
            $('.bar').css('z-index', '0');
            toggle = true;
        }
    });
});