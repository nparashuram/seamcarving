self.addEventListener("message", function(e){
    var seamCarver = (new SeamCarver(e.data.image));
    var result = seamCarver.resize(e.data.adjust);
    result.action = "done";
    self.postMessage(result);
}, false);

var log = (log ||
function(msg){
    self.postMessage(msg);
});

function SeamCarver(image){
    this.image = image;
    this.newImage = [];
    log("Starting Seam Carving");
    this.getSeams();
}

SeamCarver.prototype.getPixel = function(x, y){
    var base = (y * this.image.width + x) * 4;
    return {
        "red": this.image.data[base + 0],
        "blue": this.image.data[base + 1],
        "green": this.image.data[base + 2],
        "alpha": this.image.data[base + 3]
    }
}

SeamCarver.prototype.putPixel = function(x, y, rgba){
    var base = (y * this.image.width + x) * 4;
    this.newImage[base + 0] = rgba["red"];
    this.newImage[base + 1] = rgba["blue"];
    this.newImage[base + 2] = rgba["green"];
    this.newImage[base + 3] = rgba["alpha"];
    return this;
};

SeamCarver.prototype.getSeams = function(){
    importScripts("seamJSON.js");
    this.seams = self.seam.topDownSeam;
    return this;
}

SeamCarver.prototype.resize = function(dim){
    var image = this.image;
    log("Starting resize Reduce");
    this.newImage = [];
    var widthDiff = image.width - dim.width;
    for (var y = 0; y < image.height; y++) {
        var x1 = 0; // x counter of the new image
        for (var x = 0; x < image.width; x++) {
            this.putPixel(x, y, this.getPixel(x, y));
            var isSkippable = false;
            for (var i = 0; i < widthDiff; i++) {
                if (this.seams[i][y] == x) {
                    isSkippable = true;
                    break;
                }
            }
            if (isSkippable == false) {
                this.putPixel(x1, y, this.getPixel(x, y));
                x1++;
            }
        }
    }
    
    for (var x = dim.width; x < image.width; x++) {
        for (var y = 0; y < image.height; y++) {
            this.putPixel(x, y, {
                "red": 0,
                "blue": 0,
                "alpha": 0,
                "green": 0
            });
        }
    }
    
    return {
        "width": image.width,
        "height": image.height,
        "data": this.newImage
    };
}

