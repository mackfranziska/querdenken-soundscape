var button;
var sounds;
var names;
var position;

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
    sounds = [wendler, xavier, aktivist, attila, eva, heiko, miriam, ballweg, nana];
    names = ['Michael Wendler', 'Xavier Naidoo', 'Aktivist Mann', 'Attila Hildmann', 'Eva Hermann', 'Heiko Schrang', 'Miriam Hope', 'Michael Ballweg', 'Nana Domena'];
    position = [];

    // create array of random positional values
    for (i = 0; i < sounds.length; i ++) {
        append(position, [random(100, (displayWidth-100)), random(100, (displayHeight-100))]);
    }
    
    // create button to stop sound
    button = createButton('silence');
    button.mousePressed(togglePlaying);
  
    // loop audio files
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
    background(0);

    for (i = 0; i < sounds.length; i ++) {

        // console.log(i);
        // draw a line connecting 2 points
	    // line(position[i][0], position[i][1], mouseX, mouseY);
        stroke(255);
        fill(255);
        // draw a circle centered at each point
	    ellipse(position[i][0], position[i][1], 5);
	    ellipse(mouseX, mouseY, 10);

        noFill();
        stroke(10, 30);
        // draw radius
        ellipse(position[i][0], position[i][1], 300);

        //add text label
        textSize(10);
        textAlign(CENTER)
        fill(255);
        text(names[i], position[i][0], position[i][1]+20);

        // calculate the distance between 2 points
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
