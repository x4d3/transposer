const getMessage = diff => {
    if (diff > 0) {
        return " Interval up " + getArrayElement(DIATONIC_ACCIDENTALS, diff);
    } else if (diff == 0) {
        return "";
    } else {
        return " Interval down " + getArrayElement(DIATONIC_ACCIDENTALS, -diff);
    }
};

class Transposer {
    constructor(originalCanvas, transposedCanvas, originalKeySelector, transposedKeySelector, originalKeyMessage, transposedKeyMessage) {
        this.originalCanvas = originalCanvas;
        this.transposedCanvas = transposedCanvas;
        this.originalKeySelector = originalKeySelector;
        this.transposedKeySelector = transposedKeySelector;
        this.originalKeyMessage = originalKeyMessage;
        this.transposedKeyMessage = transposedKeyMessage;
        this.keyIndex = 0;

        const addCanvaEvent = canvas => {
            canvas.addEventListener('click', event => {
                const y = event.pageY - canvas.offsetTop;
                this.updateKeyIndex(y < canvas.height / 2 ? 1 : -1)
            }, false);
        };
        addCanvaEvent(originalCanvas);
        addCanvaEvent(transposedCanvas);
        const fillSelector = function (selector, elements) {
            elements.forEach((item) => {
                const option = document.createElement("option")
                option.value = item;
                option.text = item;
                selector.add(option);
            });
        };
        fillSelector(this.originalKeySelector, ORIGINAL_KEYS);
        fillSelector(this.transposedKeySelector, TRANSPOSED_KEYS);
        const refreshProxy = () => {
            this.refresh();
        };
        originalKeySelector.onchange = refreshProxy;
        transposedKeySelector.onchange= refreshProxy;
        transposedKeySelector.value = "F";
        this.refresh();
    }

    updateKeyIndex(increment) {
        this.keyIndex += increment;
        this.refresh();
    }

    refresh() {
        const startingKey = getNote(this.keyIndex * 7);
        this.originalKeyMessage.innerHTML = "Scale in " + startingKey;
        const startingNote = ALL_NOTES[this.originalKeySelector.value];
        const transposedNote = ALL_NOTES[this.transposedKeySelector.value];
        const diff = startingNote.int_val - transposedNote.int_val;
        drawScaleOnCanva(this.originalCanvas, startingKey, 0);
        const transposedKey = getNote(this.keyIndex * 7 + diff);
        drawScaleOnCanva(this.transposedCanvas, transposedKey, startingNote.root_index - transposedNote.root_index);
        let message = getMessage(diff);
        this.transposedKeyMessage.innerHTML = `Scale in ${transposedKey}${message}`;
    }
}

const DIATONIC_ACCIDENTALS = ["unison", "m2", "M2", "m3", "M3", "p4", "dim5", "p5", "m6", "M6", "b7", "M7"];

const ALL_NOTES = {
    'C': {root_index: 0, int_val: 0},
    'Db': {root_index: 1, int_val: 1},
    'D': {root_index: 1, int_val: 2},
    'Eb': {root_index: 2, int_val: 3},
    'E': {root_index: 2, int_val: 4},
    'F': {root_index: 3, int_val: 5},
    'F#': {root_index: 3, int_val: 6},
    'G': {root_index: 4, int_val: 7},
    'Ab': {root_index: 5, int_val: 8},
    'A': {root_index: 5, int_val: 9},
    'Bb': {root_index: 6, int_val: 10},
    'B': {root_index: 6, int_val: 11},
};

const ALL_NOTES_ARRAY = Object.keys(ALL_NOTES);
const ORIGINAL_KEYS = ALL_NOTES_ARRAY;
const TRANSPOSED_KEYS = ALL_NOTES_ARRAY;


const mod = (input, n) => ((input % n) + n) % n;
const getArrayElement = (array, index) => array[mod(index, array.length)];

const getNote = index => getArrayElement(ALL_NOTES_ARRAY, index);

const drawScaleOnCanva = (canvas, keySignature, startingNoteIndex) => {
    const renderer = new Vex.Flow.Renderer(canvas, Vex.Flow.Renderer.Backends.CANVAS);
    const ctx = renderer.getContext();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const stave = new Vex.Flow.Stave(10, 0, canvas.width - 20);
    stave.addClef("treble").addKeySignature(keySignature).setContext(ctx).draw();
    const notes = generatesScale(startingNoteIndex);
    Vex.Flow.Formatter.FormatAndDraw(ctx, stave, notes);
};

const generatesScale = startingNoteIndex => {
    const notes = new Array(7);
    startingNoteIndex = mod(startingNoteIndex + 3, 7) - 3;
    for (let i = 0; i < 8; i++) {
        const j = startingNoteIndex + i;
        const key = getArrayElement(Vex.Flow.Music.roots, j);
        const scale = 4 + Math.floor(j / 7);
        notes[i] = new Vex.Flow.StaveNote({keys: [key + "/" + scale], duration: "4d"});
    }
    return notes;
};


