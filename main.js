$(document).ready(function() {
    $("#images img").each(function() {
        $(this).attr("src", $(this).attr("src_defer"));
    }).click(function() {
        $("#source").attr("src", $(this).attr("src"));
        initCanvas();
    });

    function initCanvas() {
        var canvas = document.getElementById("canvas");
        try {
            var ctx = canvas.getContext("2d");
        } catch (e) {
            alert("Your browser does not support the canvas element");
            return;
        }

        var img = new Image();
        var imageData = null;
        img.src = $("#source").attr("src");
        var worker = new Worker("SeamCarver.js");
        img.onload = function() {
            log("Image loaded and ready for seam carving");
            canvas.height = img.height;
            canvas.width = img.width;
            ctx.drawImage(img, 0, 0);
            $("#resizer").css({
                //"top": $("#canvas").position().top,
                "left": $("#canvas").position().left,
                "height": img.height,
                "width": img.width
            });
            imageData = ctx.getImageData(0, 0, img.width, img.height);


            worker.addEventListener("message", function(e) {
                switch (e.data.action) {
                    case "done":
                        var start = new Date().getTime();
                        log("Reduced image available, copying it to canvas");
                        var result = e.data.image;
                        try {
                            ctx.putImageData(result, 0, 0);
                        } catch (e) {
                            log("Could not simply reassign the canvas, so copying the entire array");
                            var newImage = ctx.createImageData(result.width, result.height);
                            for (var i = 0; i < result.data.length; i++) {
                                newImage.data[i] = result.data[i];
                            }
                            ctx.putImageData(newImage, 0, 0);
                        }

                        log("Array Copy time " + (new Date().getTime() - start))
                        log("Reduced image placed on canvas");
                        break;
                    default:
                        log(e.data)
                        break;
                }
            }, false);
            $("#resizer").resizable({
                "stop": function() {
                    worker.postMessage({
                        "image": {
                            "width": imageData.width,
                            "height": imageData.height,
                            "data": imageData.data
                        },
                        "adjust": {
                            "height": $("#resizer").height(),
                            "width": $("#resizer").width()
                        }
                    });
                },
                "minHeight": imageData.height,
                "maxHeight": imageData.height,
                "minWidth": 100,
                "maxWidth": imageData.width
            });
        }
    }

    function log(msg) {
        if (typeof startTime === "undefined") {
            startTime = new Date().getTime();
        }
        $("#log").append($("<div>").html("<span style = 'color:GREEN'>" + (new Date().getTime() - startTime) + "</span> : " + msg));
    }

    $("#images img").first().click();
    $("#source").draggable({
        "start": function() {
            $(this).css("opacity", 0.5);
        },
        "stop": function() {
            $(this).css("opacity", 1);
        },
        "axis": "x",
        "revert": true
    });

    $("#yourImage").click(function() {
        $('#fileUpload').click();
    });

    window.handleFiles = function(files) {
        for (var i = 0; i < files.length; i++) {
            var file = files[i];
            var imageType = /image.*/;

            if (!file.type.match(imageType)) {
                alert("Please select an image file");
                continue;
            }

            var reader = new FileReader();
            reader.onload = function(e) {
                $("#source").attr("src", e.target.result);
                initCanvas();
            }
            reader.readAsDataURL(file);
        }
    }
});