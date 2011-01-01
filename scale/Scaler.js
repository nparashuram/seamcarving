self.addEventListener("message", function(e) {
	var data = e.data;
	var s = new Scaler(data.image);
	self.postMessage({
		"image" : s.scale2x(),
		"action" : "done"
	});
}, false);

function log(msg) {
	self.postMessage({
		"action" : "log",
		"msg" : msg
	});
}

function Scaler(image) {
	this.image = image;
}

Scaler.prototype.scale2x = function() {
	this.newImage = [];
	var bigImage = [];
	for ( var x = 1; x < this.image.width - 1; x++) {
		for ( var y = 1; y < this.image.height - 1; y++) {
			var A = this.getPixel(x - 1, y - 1);
			var B = this.getPixel(x, y - 1);
			var C = this.getPixel(x + 1, y - 1);
			var D = this.getPixel(x - 1, y);
			var E = this.getPixel(x, y);
			var F = this.getPixel(x + 1, y);
			var G = this.getPixel(x - 1, y + 1);
			var H = this.getPixel(x, y + 1);
			var I = this.getPixel(x + 1, y + 1);

			E0 = D == B && B != F && D != H ? D : E;
			E1 = B == F && B != D && F != H ? F : E;
			E2 = D == H && D != B && H != F ? D : E;
			E3 = H == F && D != H && B != F ? F : E;

			bigImage[x * 2][y * 2] = E0;
			bigImage[x * 2 + 1][y * 2] = E1;
			bigImage[x * 2][y * 2] = E2;
			bigImage[x * 2][y * 2 + 1] = E3;
		}
	}


	return {
		"data" : this.newImage,
		"width" : this.image.width,
		"height" : this.image.height
	}
}

Scaler.prototype.getPixel = function(x, y) {
	var base = (y * this.image.width + x) * 4;
	return {
		"red" : this.image.data[base + 0],
		"green" : this.image.data[base + 1],
		"blue" : this.image.data[base + 2],
		"alpha" : this.image.data[base + 3]
	};
}

Scaler.prototype.putPixel = function(x, y, color) {
	var rgba = color;
	if (typeof color === "number") {
		rgba = {
			"red" : (color & 0xFF0000) >> 16,
			"green" : (color & 0x00FF00) >> 8,
			"blue" : (color & 0x0000FF),
			"alpha" : 255
		}
	}
	var base = (y * this.image.width + x) * 4;
	this.newImage[base + 0] = rgba["red"];
	this.newImage[base + 1] = rgba["green"];
	this.newImage[base + 2] = rgba["blue"];
	this.newImage[base + 3] = rgba["alpha"];
	return this;
};
