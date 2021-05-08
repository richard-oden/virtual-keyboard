var context = new AudioContext(),
    oscillators = {},
    gainNodes = {};
 
if (navigator.requestMIDIAccess) {
    navigator.requestMIDIAccess()
        .then(success, failure);
}
 
function success (midi) {
    var inputs = midi.inputs.values();
    // inputs is an Iterator
 
    for (var input = inputs.next(); input && !input.done; input = inputs.next()) {
        // each time there is a midi message call the onMIDIMessage function
        input.value.onmidimessage = onMIDIMessage;
    }
}
 
function failure () {
    console.error('No access to your midi devices.')
}
 
function onMIDIMessage (message) {
    var frequency = midiNoteToFrequency(message.data[1]);
    var volume = 10 * (message.data[2] / 127);
    var wave = 'square';
    console.log(volume);

    if (message.data[0] === 144 && message.data[2] > 0) {
        playNote(frequency, volume, wave);
    }
 
    if (message.data[0] === 128 || message.data[2] === 0) {
        stopNote(frequency);
    }
}

function getWave() {
    // organ
    return context.createPeriodicWave(Float32Array.from(imag), Float32Array.from(real))
}
 
function midiNoteToFrequency (note) {
    return Math.pow(2, ((note - 69) / 12)) * 440;
}
 
function playNote (frequency, volume, wave) {
    oscillators[frequency] = context.createOscillator();
    oscillators[frequency].frequency.value = frequency;
    oscillators[frequency].type = wave;

    gainNodes[frequency] = context.createGain();
    gainNodes[frequency].gain.value = volume;
    
    oscillators[frequency].connect(gainNodes[frequency]).connect(context.destination);
    oscillators[frequency].start(context.currentTime);
}
 
function stopNote (frequency) {
    oscillators[frequency].stop(context.currentTime);
    oscillators[frequency].disconnect();
}

