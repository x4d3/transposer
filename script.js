(function(){
	Transposer = function(originalCanva, transposedCanva, originalKeySelector, transposedKeySelector, originalKeyMessage, transposedKeyMessage) {
		this.init(originalCanva, transposedCanva, originalKeySelector, transposedKeySelector, originalKeyMessage, transposedKeyMessage);
	};
	var DIATONIC_ACCIDENTALS = [
		"unison", 
		"m2",     
		"M2",     
		"m3",     
		"M3",     
		"p4",     
		"dim5",   
		"p5",     
		"m6",     
		"M6",     
		"b7",     
		"M7"
	];
	
	var ALL_NOTES = {
		'C':   { root_index: 0, int_val: 0 },
		'Db':  { root_index: 1, int_val: 1 },
		'D':   { root_index: 1, int_val: 2 },
		'Eb':  { root_index: 2, int_val: 3 },
		'E':   { root_index: 2, int_val: 4 },
		'F':   { root_index: 3, int_val: 5 },
		'F#':  { root_index: 3, int_val: 6 },
		'G':   { root_index: 4, int_val: 7 },
		'Ab':  { root_index: 5, int_val: 8 },
		'A':   { root_index: 5, int_val: 9 },
		'Bb':  { root_index: 6, int_val: 10 },
		'B':   { root_index: 6, int_val: 11 },
	};
	
	var ALL_NOTES_ARRAY = $.map(ALL_NOTES, function(i, index){
		return index;
	});
	var ORIGINAL_KEYS = ALL_NOTES_ARRAY;
	var TRANSPOSED_KEYS = ALL_NOTES_ARRAY;

	Transposer.prototype = {
		init : function(originalCanva, transposedCanva, originalKeySelector, transposedKeySelector, originalKeyMessage, transposedKeyMessage){
			var that = this;
			this.originalCanva = originalCanva;
			this.transposedCanva = transposedCanva;
			this.originalKeySelector = originalKeySelector;
			this.transposedKeySelector = transposedKeySelector;
			this.originalKeyMessage = originalKeyMessage;
			this.transposedKeyMessage = transposedKeyMessage;
			this.keyIndex = 0;
			var addCanvaEvent = function (canva){
				canva.addEventListener('click', function(event) {
					var y = event.pageY - canva.offsetTop;
					that.updateKeyIndex(y < canva.height/2 ? 1 : -1)
				}, false);
			};
			addCanvaEvent(originalCanva);
			addCanvaEvent(transposedCanva);
			var fillSelector = function(selector, elements){
				$.each(elements, function(i, item){
					selector.append($('<option>', {value:item, text: item}));
				});
			};
			fillSelector(this.originalKeySelector, ORIGINAL_KEYS);
			fillSelector(this.transposedKeySelector, TRANSPOSED_KEYS);
			var refreshProxy = function(){
				that.refresh();
			};
			originalKeySelector.change(refreshProxy);
			transposedKeySelector.change(refreshProxy);
			transposedKeySelector.val("F");
			this.refresh();
		},
		updateKeyIndex : function(increment){
			this.keyIndex += increment;
			this.refresh();
		},		
		refresh : function(){
			var startingKey = getNote(this.keyIndex * 7);
			this.originalKeyMessage.text("Scale in " + startingKey);
			var startingNote = ALL_NOTES[this.originalKeySelector.val()];
			var transposedNote = ALL_NOTES[this.transposedKeySelector.val()];
			var diff = startingNote.int_val  -  transposedNote.int_val;
			drawScaleOnCanva(this.originalCanva, startingKey, 0);
			var transposedKey = getNote(this.keyIndex * 7 + diff);
			drawScaleOnCanva(this.transposedCanva, transposedKey, startingNote.root_index - transposedNote.root_index);
			var message;
			if (diff > 0){
				message =  " Interval up " + getArrayElement(DIATONIC_ACCIDENTALS, diff);
			}else if (diff == 0){
				message = "";
			}else{
				message = " Interval down " + getArrayElement(DIATONIC_ACCIDENTALS, -diff);
			}
			this.transposedKeyMessage.text("Scale in " + transposedKey + message)
		}
	};

	var mod = function(input, n){
		return ((input % n) +n)% n;
	};
	var getArrayElement = function(array, index){
		return array[mod(index, array.length)];
	};
	
	var getNote = function(index){
		return getArrayElement(ALL_NOTES_ARRAY, index);
	};
	
	var drawScaleOnCanva = function(canvas, keySignature, startingNoteIndex){
		var renderer = new Vex.Flow.Renderer(canvas,Vex.Flow.Renderer.Backends.CANVAS);
		var ctx = renderer.getContext();
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		var stave = new Vex.Flow.Stave(10, 0, canvas.width - 20);
		stave.addClef("treble").addKeySignature(keySignature).setContext(ctx).draw();
		var notes = generatesScale(startingNoteIndex);
		Vex.Flow.Formatter.FormatAndDraw(ctx, stave, notes);
	};

	var generatesScale = function(startingNoteIndex){
		var notes = new Array(7);
		startingNoteIndex = mod(startingNoteIndex  + 3,  7) - 3 ;
		for (var i = 0; i < 7; i++){
			var j = startingNoteIndex + i;
			var key = getArrayElement(Vex.Flow.Music.roots, j);
			var scale = 4  + Math.floor(j / 7);
			notes[i] = new Vex.Flow.StaveNote({ keys: [key + "/" + scale], duration: "4d" });
		}
		return notes;		
	};
}());

