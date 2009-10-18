/**
 * This is the class responsible for Seam curving- Context Aware Image Resizing
 */
function ImageResizer(imgUrl, canvasDiv) {
	this.SEAM_URL = "seamJSON.js"
	this.imgUrl = imgUrl;
	this.canvasDiv = canvasDiv;
	this.canvasContext = this.canvasDiv.getContext("2d");
	this.drawImage(this.imgUrl);
	this.originalWidth = this.canvasDiv.width;
	this.originalHeight = this.canvasDiv.height;
	this.ready = false;
}

/**
 * Draws the actual image onto the canvas
 * 
 * @param {String}
 *            imageUrl
 */
ImageResizer.prototype.drawImage = function(imageUrl) {
	var img = new Image();
	img.src = imageUrl;
	var imgResizer = this;
	img.onload = function() {
		imgResizer.canvasContext.drawImage(img, 0, 0);
		imgResizer.imageData = imgResizer.canvasContext.getImageData(0, 0,
				img.width, img.height);
		imgResizer.originalImageData = imgResizer.canvasContext.getImageData(0,
				0, img.width, img.height);
		imgResizer.getSeams(imageUrl);
	};
};

/**
 * Gets the seams of the current image by analysing the image on the server.
 * This uses AJAX for doing this
 */
ImageResizer.prototype.getSeams = function(imageUrl) {
	// console.log("Getting Seam data from Server");
	var xmlHttp = null;
	try {
		// Firefox, Opera 8.0+, Safari
		xmlHttp = new XMLHttpRequest();
	} catch (e) {
		// Internet Explorer
		try {
			xmlHttp = new ActiveXObject("Msxml2.XMLHTTP");
		} catch (e) {
			try {
				xmlHttp = new ActiveXObject("Microsoft.XMLHTTP");
			} catch (e) {
			}
		}
	}

	if (xmlHttp == null) {
		return null;
	}

	var imgResizer = this;
	xmlHttp.onreadystatechange = function() {
		imgResizer.onGetSeamHandler.call(imgResizer, xmlHttp);
	}
	xmlHttp.open("GET", this.SEAM_URL + "?imageUrl=" + imageUrl);
	xmlHttp.send(null);
}

ImageResizer.prototype.onGetSeamHandler = function(o) {
	// console.log("");
	this.seamData = eval("(" + o.responseText + ")");
	this.ready = true;
}

/**
 * Resizes the image by removing or adding the appropriate seams
 * 
 * @param {int}
 *            width
 * @param {int}
 *            height
 */
ImageResizer.prototype.resizeReduce = function(widthDiff, heightDiff) {
	if (this.ready == false) {
		return;
	}
	// console.log("Resizing image ...");

	var newImage = {};
	newImage.width = this.imageData.width;
	newImage.height = this.imageData.height;

	for (y = 0; y < this.originalHeight; y++) {
		var x1 = 0; // x counter of the new image
		for ( var x = 0; x < this.originalWidth; x++) {
			var isXskippable = false;
			for ( var i = 0; i < widthDiff; i++) {
				if (this.seamData.topDownSeam[i][y] == x) {
					isXskippable = true;
					break;
				}
			}
			if (isXskippable == false) {
				// this has not been skipped, so place this pixel
				this.putPixel(x1, y, this.getPixel(x, y));
				x1++;
			}
		}
	}

	this.canvasContext.putImageData(this.imageData, 0, 0);
	this.canvasContext.clearRect(this.originalWidth - widthDiff, 0,
			this.originalWidth, this.originalHeight);
	this.originalWidth = this.originalWidth - widthDiff;
	// console.log("Resize complete from (" + this.canvasDiv.width + ", " +
	// this.canvasDiv.height + ") to (" + x1 + ", " + y + ")");
};

/**
 * Shows the nth seam in the current image
 * 
 * @param {Object}
 *            number
 */
ImageResizer.prototype.showSeam = function(n) {
	// console.log("Showing seam " + n);
	for (y = 0; y < this.originalWidth; y++) {
		var color = {
			'red' : 0,
			'blue' : 100,
			'green' : 100,
			'alpha' : 1
		};
		this.putPixel(this.seamData.topDownSeam[n][y], y, color);

	}
	this.canvasContext.putImageData(this.imageData, 0, 0);
	// console.log("Seam shown");
}

/**
 * Gets the pixel at the current location
 * 
 * @param {Object}
 *            x
 * @param {Object}
 *            y
 */
ImageResizer.prototype.getPixel = function(x, y) {
	var base = (y * this.imageData.width + x) * 4;
	var rgba = {};

	rgba.red = this.imageData.data[base + 0]
	rgba.blue = this.imageData.data[base + 1]
	rgba.green = this.imageData.data[base + 2]
	rgba.alpha = this.imageData.data[base + 3]
	return rgba;
}

/**
 * Puts a specific value in the
 * 
 * @param {int}
 *            x
 * @param {int}
 *            y
 * @param {rgba
 *            {'red' : 'int', 'blue':'int'; 'green' : 'int', 'alpha': ''}} rgba
 */

ImageResizer.prototype.putPixel = function(x, y, rgba, imageData) {
	if (typeof (imageData) == "undefined") {
		imageData = this.imageData;
	}

	var base = (y * imageData.width + x) * 4;
	imageData.data[base + 0] = rgba.red;
	imageData.data[base + 1] = rgba.blue;
	imageData.data[base + 2] = rgba.green;
	imageData.data[base + 3] = rgba.alpha;
};
