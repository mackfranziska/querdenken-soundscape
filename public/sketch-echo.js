var button;
var sounds;
var names;
var position;

var tracker = [false, false];
var prev_tracker;
var start_time = [];
var current_time;

function preload() {
    wendler = loadSound('files/wendler-impfung.mp3');
    xavier =  loadSound('files/xavier-singt.mp3');
    console.log('loaded');
}

function setup() {
    createCanvas(displayWidth, displayHeight);
 
    sounds = [wendler, xavier];
    names = ['Michael Wendler', 'Xavier Naidoo'];
    position = [[500, 100], [200, 500]];
    
    // create button to stop sound
    button = createButton('start');
    button.mousePressed(togglePlaying);

    // loop sounds
    for (i = 0; i < sounds.length; i ++) {
        sounds[i].loop();
    }

    prev_tracker = tracker;
    setInterval(keepTrack, 2000);
    //setInterval(trackTime, 2000);

}

function keepTrack() {

    for (i = 0; i < sounds.length; i ++) {

        // calculate the distance between mouse and position
	    d = dist(position[i][0], position[i][1], mouseX, mouseY);

        // update tracker array
        if (d < 50) {
            tracker[i] = true;
        } else {
            tracker[i] = false;
        }
    }

    console.log('tracker: ' + tracker);
    console.log('previous: ' + prev_tracker);
}

function trackTime() {

    for (i = 0; i < sounds.length; i ++) {
        
        if ((tracker[i] == true) && (prev_tracker[i] == false)) {
            // start_time[i] = frameCount;
            console.log('CHANGE');
        } else {
            // start_time[i] = 0;
        }

    }

    //console.log(start_time);

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
    
    // draw stuff
    drawStuff();
    ellipse(mouseX, mouseY, 10);

    // control volume
    volumeControl();

}

function drawStuff() {

    noStroke();
    fill(255);

    for (i = 0; i < sounds.length; i ++) {
        // draw a circle centered at each point
	    ellipse(position[i][0], position[i][1], 5);
    }
}

function volumeControl() {
    // for each sound file
    for (i = 0; i < sounds.length; i ++) {

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
}
