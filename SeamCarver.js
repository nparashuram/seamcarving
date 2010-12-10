self.addEventListener("message", function(e){
    SeamCarver(e.data.image, e.data.adjust, function(d){
        self.postMessage(d);
    });
}, false);

function SeamCarver(imgData, dim, callback){
    importScripts("seamJSON.js");
    var newImage = resizeReduce(imgData, dim, seam.topDownSeam);
    callback(newImage);
}

var resizeReduce = function(image, dim, seams){
    var data = [];
    var getPixel = function(x, y){
        var base = (y * image.width + x) * 4;
        return {
            "red": image.data[base + 0],
            "blue": image.data[base + 1],
            "green": image.data[base + 2],
            "alpha": image.data[base + 3]
        }
    }
    
    var putPixel = function(x, y, rgba){
        var base = (y * image.width + x) * 4;
        data[base + 0] = rgba.red;
        data[base + 1] = rgba.blue;
        data[base + 2] = rgba.green;
        data[base + 3] = rgba.alpha;
    };
    
    var widthDiff = image.width - dim.width;
    for (var y = 0; y < image.height; y++) {
        var x1 = 0; // x counter of the new image
        for (var x = 0; x < image.width; x++) {
            putPixel(x, y, getPixel(x, y));
            var isSkippable = false;
            for (var i = 0; i < widthDiff; i++) {
                if (seams[i][y] == x) {
                    isSkippable = true;
                    break;
                }
            }
            if (isSkippable == false) {
                putPixel(x1, y, getPixel(x, y));
                x1++;
            }
        }
    }
    
    for (var x = dim.width; x < image.width; x++) {
        for (var y = 0; y < image.height; y++) {
            var base = (y * image.width + x) * 4;
            data[base + 0] = 0;
            data[base + 1] = 0;
            data[base + 2] = 0;
            data[base + 3] = 0;
        }
    }
    
    return {
        "width": image.width,
        "height": image.height,
        "data": data
    };
};
