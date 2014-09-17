function handleFileSelect(evt) {
	var f = evt.target.files[0];
	handleFile(f);
}

function handleFileDrop(evt) {
	evt.stopPropagation();
    evt.preventDefault();
	
	var f = evt.dataTransfer.files[0];
	handleFile(f);
}

function handleFile(file) {
	var reader = new FileReader();
	reader.onload = (function(theFile) {
		return function(e) {
			var canvas = document.getElementById('canvas');
			var output = document.getElementById('output');
			var result = document.getElementById('result');
			
			var context = canvas.getContext('2d');
			context.clearRect(0, 0, canvas.width, canvas.height);
			
			output.innerHTML = '';
			result.style.display = 'none';
			
			var filename = getFilenameWithoutExtension(file.name);
			
			var img = new Image();
			img.onload = function() {	
				canvas.width = img.width;
				canvas.height = img.height;
				context.drawImage(img, 0, 0);
				var imgd = context.getImageData(0, 0, img.width, img.height);
				
				output.innerHTML = pixelsToText(imgd.data, filename, img.width);
				
				result.style.display = 'block';
			};
			
			img.src = e.target.result;
		};
	})(file);
	
	reader.readAsDataURL(file);
}

function getFilenameWithoutExtension(name) {
	return name.substring(0, name.lastIndexOf('.'));
}

function handleDragOver(evt) {
	evt.stopPropagation();
	evt.preventDefault();
	evt.dataTransfer.dropEffect = 'copy';
}

function resizeText(multiplier) {
	var output = document.getElementById('output');
	if (output.style.fontSize == "")
		output.style.fontSize = '1.0em';
	
	output.style.fontSize = parseFloat(output.style.fontSize) + (multiplier * 0.2) + 'em'; 
}

function pixelsToText(pixels, name, width) {
	var output = 'static const uint8_t PROGMEM ' + name + ' [] = {';	
	var padding = width % 8 > 0 ? 8 - width % 8 + 1 : 0;
	var color;
	
	for(var i = 0, j = 0; i < pixels.length; i+=4, j++) {			
		if(j == width || i == 0) {
			if (i > 0)
				output += new Array(padding).join('0') + ",";
			output += '\n\t0b';
			j = 0;
		}
		else if(j % 8 == 0)
			output += ', 0b';
		
		color = pixels[i + 0] + pixels[i + 1] + pixels[i + 2];
		output += (color == 0) ? '1' : '0';
	}
	
	output += new Array(padding).join('0') + ',';
	output += '\n};';
	
	return output;
}

document.getElementById('files').addEventListener('change', handleFileSelect, false);

var drop_zone = document.getElementById('drop_zone');
drop_zone.addEventListener('dragover', handleDragOver, false);
drop_zone.addEventListener('drop', handleFileDrop, false);