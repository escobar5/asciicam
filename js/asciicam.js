/*jslint browser: true */
(function (app) {
	"use strict";
	var cam, intervalId, canvas, canvasCtx, ascii, btnStart, btnStop,
	    loopSpeed = 100,
	    width = 160,
	    height = 120;

    app.init = function () {
		//Get all the page element we need
        cam = document.getElementById('cam');
        ascii = document.getElementById("asciiText");
		canvas = document.createElement("canvas");
		canvasCtx = canvas.getContext("2d");
		btnStart = document.getElementById('startbtn');
        btnStop = document.getElementById('stopbtn');
        
        //Init events
        btnStart.addEventListener('click', app.startCam);
        btnStop.addEventListener('click', app.stopCam);
    };

    app.startCam = function (e) {
		// Get specific vendor methods
		navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
		window.URL = window.URL || window.webkitURL || window.mozURL || window.msURL;

		// If browser supports user media
		if (navigator.getUserMedia) {
			navigator.getUserMedia({video: true, toString: function () { return "video"; } },
				function successCallback(stream) {
					//if (navigator.getUserMedia === navigator.mozGetUserMedia) {
					//	cam.src = stream;
					//} else {
						cam.src = window.URL.createObjectURL(stream) || stream;
					//}
					cam.play();
					intervalId = setInterval(app.loop, loopSpeed);
					btnStart.style.display = "none";
					btnStop.style.display = "inline-block";
				},
				function errorCallback(error) {
					window.alert("An error ocurred getting user media. Code:" + error.code);
				});
		} else {
			//Browser doesn't support user media
			window.alert("Your browser does not support user media");
		}

		e.preventDefault();
    };

    app.stopCam = function (e) {
		clearInterval(intervalId);
		cam.src = "";
		e.preventDefault();
		btnStop.style.display = "none";
		btnStart.style.display = "inline-block";
    };

    //The generation of the ascii text was taken from this great sample from thecodeplayer:
    //http://thecodeplayer.com/walkthrough/cool-ascii-animation-using-an-image-sprite-canvas-and-javascript
    app.loop = function () {
		var r, g, b, gray, pixels, colordata, character,
		    line = "",
            i = 0;
		
		//clear canvas
		canvasCtx.clearRect(0, 0, width, height);

		//draw the video frame
		canvasCtx.drawImage(cam, 0, 0, width, height);
		
		//accessing pixel data
		pixels = canvasCtx.getImageData(0, 0, width, height);
		colordata = pixels.data;

		//every pixel gives 4 integers -> r, g, b, a
		//so length of colordata array is width*height*4
		
		ascii.innerHTML = ''; //clear contents

		for (i = 0; i < colordata.length; i = i + 4) {
			r = colordata[i];
			g = colordata[i + 1];
			b = colordata[i + 2];
			//converting the pixel into grayscale
			gray = r * 0.2126 + g * 0.7152 + b * 0.0722;
			//overwriting the colordata array with grayscale values
			//colordata[i] = colordata[i+1] = colordata[i+2] = gray;
			
			//text for ascii art.
			//blackish = dense characters like "W", "@"
			//whitish = light characters like "`", "."
			if (gray > 250) {
                character = " "; //almost white
            } else if (gray > 230) {
                character = "`";
            } else if (gray > 200) {
                character = ":";
            } else if (gray > 175) {
                character = "*";
            } else if (gray > 150) {
                character = "+";
            } else if (gray > 125) {
                character = "#";
            } else if (gray > 50) {
                character = "W";
            } else {
                character = "@"; //almost black
            }
			
			//newlines and injection into dom
			if (i !== 0 && (i / 4) % width === 0) {//if the pointer reaches end of pixel-line
				ascii.appendChild(document.createTextNode(line));
				//newline
				ascii.appendChild(document.createElement("br"));
				//emptying line for the next row of pixels.
				line = "";
			}
			
			line += character;
		}
    };
    
    app.init();

}(window.asciicam = window.asciicam || {}));
