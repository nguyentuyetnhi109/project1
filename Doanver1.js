var VSHADER_SOURCE =
'attribute vec4 a_Position;\n' +
'attribute vec2 a_TextureCoord;\n' +
'attribute vec4 a_Normal;\n' +

'uniform mat4 u_VMatrix;\n' +
'uniform mat4 u_PMatrix;\n' +
'uniform mat4 u_MMatrix;\n' +
'uniform mat4 u_NMatrix;\n' +

'uniform vec3 u_AmbientLight;\n' +
'uniform vec3 u_LightColor;\n' +
'uniform vec3 u_LightPosition;\n' +

'varying vec2 v_TextureCoord;\n' +
'varying vec3 v_LightWeighting;\n' +

'void main(){\n' +
	'gl_Position = u_PMatrix * u_VMatrix * u_MMatrix * a_Position;\n' +
	'v_TextureCoord = a_TextureCoord;\n' +
	'vec3 normal = normalize(vec3(u_NMatrix * a_Normal));\n' + 
	'vec4 vertexPosition = u_MMatrix * a_Position;\n' +
	'vec3 lightDirection = normalize(u_LightPosition - vec3(vertexPosition));\n' +
	'float nDotL = max(dot(normal, lightDirection), 0.0);\n' +
	'v_LightWeighting = u_AmbientLight + u_LightColor * nDotL;\n' +

'}\n';

var FSHADER_SOURCE =
'precision mediump float;\n' +

'uniform sampler2D u_Sampler;\n' +

'varying vec2 v_TextureCoord;\n' +
'varying vec3 v_LightWeighting;\n' +	

'void main(){\n' +
	'vec4 textureColor = texture2D(u_Sampler, vec2(v_TextureCoord.s, v_TextureCoord.t));\n' +
	'gl_FragColor = vec4(textureColor.rgb * v_LightWeighting, textureColor.a);\n' +
'}\n';

var normalMatrix = new Matrix4();

function setMatrixUniforms(){
	gl.uniformMatrix4fv(shaderProgram.u_VMatrix, false, vMatrix.elements);
	gl.uniformMatrix4fv(shaderProgram.u_PMatrix, false, pMatrix.elements);
	gl.uniformMatrix4fv(shaderProgram.u_MMatrix, false, mMatrix.elements);

	normalMatrix.setInverseOf(mMatrix);
	normalMatrix.transpose();
	gl.uniformMatrix4fv(shaderProgram.u_NMatrix, false, mMatrix.elements);
}

var gl;
var shaderProgram;
var hud;
var ctx;
var canvas;
function initGL(){
	canvas = document.getElementById("ver1");
	gl = canvas.getContext("experimental-webgl");
	hud = document.getElementById('hud');
	ctx = hud.getContext('2d');

	shaderProgram = createProgram(gl, VSHADER_SOURCE, FSHADER_SOURCE);
	shaderProgram.a_Position = gl.getAttribLocation(shaderProgram, 'a_Position');
	shaderProgram.a_TextureCoord = gl.getAttribLocation(shaderProgram, 'a_TextureCoord');
	shaderProgram.a_Normal = gl.getAttribLocation(shaderProgram, 'a_Normal');
	gl.enableVertexAttribArray(shaderProgram.a_Normal);
	gl.enableVertexAttribArray(shaderProgram.a_Position);
	gl.enableVertexAttribArray(shaderProgram.a_TextureCoord);

	shaderProgram.u_MMatrix = gl.getUniformLocation(shaderProgram, 'u_MMatrix');
	shaderProgram.u_VMatrix = gl.getUniformLocation(shaderProgram, 'u_VMatrix');
	shaderProgram.u_PMatrix = gl.getUniformLocation(shaderProgram, 'u_PMatrix');
	shaderProgram.u_Sampler = gl.getUniformLocation(shaderProgram, 'u_Sampler');
	shaderProgram.u_NMatrix = gl.getUniformLocation(shaderProgram, 'u_NMatrix');
	//shaderProgram.u_ModelMatrix = gl.getUniformLocation(shaderProgram, 'u_ModelMatrix');
	shaderProgram.u_AmbientLight = gl.getUniformLocation(shaderProgram, 'u_AmbientLight');
	shaderProgram.u_LightPosition = gl.getUniformLocation(shaderProgram, 'u_LightPosition');
	shaderProgram.u_LightColor = gl.getUniformLocation(shaderProgram, 'u_LightColor');
}

var groundVertexPositionBuffer;
var groundVertexTextureCoordBuffer;
var groundVertexNormalBuffer;

var cubeVertexPositionBuffer;
var cubeVertexTextureCoordBuffer;
var cubeVertexIndexBuffer;
var cubeVertexNormalBuffer;

var moonVertexPositionBuffer;
var moonVertexTextureCoordBuffer;
var moonVertexIndexBuffer;
var moonVertexNormalBuffer;

function initBuffers(){
	////Ground
	var vertices = [
		-15.0, -1.0, -15.0,
		-15.0, -1.0, +15.0,
		+15.0, -1.0, -15.0,
		+15.0, -1.0, +15.0,
	];
	groundVertexPositionBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, groundVertexPositionBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
	groundVertexPositionBuffer.itemSize = 3;
	groundVertexPositionBuffer.numItems = 4;

	var groundVertexNormal = [
	   0.0,  1.0,  0.0,
       0.0,  1.0,  0.0,
       0.0,  1.0,  0.0,
       0.0,  1.0,  0.0,
	];
	groundVertexNormalBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, groundVertexNormalBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(groundVertexNormal), gl.STATIC_DRAW);
	groundVertexNormalBuffer.itemSize = 3;
	groundVertexNormalBuffer.numItems = 4;

	vertices = [
		0.0, 1.0, 
		0.0, 0.0, 
		1.0, 1.0, 
		1.0, 0.0 
	];
	groundVertexTextureCoordBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, groundVertexTextureCoordBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
	groundVertexTextureCoordBuffer.itemSize = 2;
	groundVertexTextureCoordBuffer.numItems = 4;

	////Cube
	vertices = [
		// Front face
            -1.0, -1.0,  1.0,
             1.0, -1.0,  1.0,
             1.0,  1.0,  1.0,
            -1.0,  1.0,  1.0,

            // Back face
            -1.0, -1.0, -1.0,
            -1.0,  1.0, -1.0,
             1.0,  1.0, -1.0,
             1.0, -1.0, -1.0,

            // Top face
            -1.0,  1.0, -1.0,
            -1.0,  1.0,  1.0,
             1.0,  1.0,  1.0,
             1.0,  1.0, -1.0,

            // Bottom face
            -1.0, -1.0, -1.0,
             1.0, -1.0, -1.0,
             1.0, -1.0,  1.0,
            -1.0, -1.0,  1.0,

            // Right face
             1.0, -1.0, -1.0,
             1.0,  1.0, -1.0,
             1.0,  1.0,  1.0,
             1.0, -1.0,  1.0,

            // Left face
            -1.0, -1.0, -1.0,
            -1.0, -1.0,  1.0,
            -1.0,  1.0,  1.0,
            -1.0,  1.0, -1.0
	];
	cubeVertexPositionBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexPositionBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
	cubeVertexPositionBuffer.itemSize = 3;
	cubeVertexPositionBuffer.numItems = 24;

	var cubeVertexNormal = [
			// Front face
             0.0,  0.0,  1.0,
             0.0,  0.0,  1.0,
             0.0,  0.0,  1.0,
             0.0,  0.0,  1.0,

            // Back face
             0.0,  0.0, -1.0,
             0.0,  0.0, -1.0,
             0.0,  0.0, -1.0,
             0.0,  0.0, -1.0,

            // Top face
             0.0,  1.0,  0.0,
             0.0,  1.0,  0.0,
             0.0,  1.0,  0.0,
             0.0,  1.0,  0.0,

            // Bottom face
             0.0, -1.0,  0.0,
             0.0, -1.0,  0.0,
             0.0, -1.0,  0.0,
             0.0, -1.0,  0.0,

            // Right face
             1.0,  0.0,  0.0,
             1.0,  0.0,  0.0,
             1.0,  0.0,  0.0,
             1.0,  0.0,  0.0,

            // Left face
            -1.0,  0.0,  0.0,
            -1.0,  0.0,  0.0,
            -1.0,  0.0,  0.0,
            -1.0,  0.0,  0.0
	];
	cubeVertexNormalBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexNormalBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cubeVertexNormal), gl.STATIC_DRAW);
	cubeVertexNormalBuffer.itemSize = 3;
	cubeVertexNormalBuffer.numItems = 24;

	var textureCoord = [
		// Front face
        0.0, 0.0,
        1.0, 0.0,
        1.0, 1.0,
        0.0, 1.0,

        // Back face
        1.0, 0.0,
        1.0, 1.0,
        0.0, 1.0,
        0.0, 0.0,

        // Top face
        0.0, 1.0,
        0.0, 0.0,
        1.0, 0.0,
        1.0, 1.0,

        // Bottom face
        1.0, 1.0,
        0.0, 1.0,
        0.0, 0.0,
        1.0, 0.0,

        // Right face
        1.0, 0.0,
        1.0, 1.0,
        0.0, 1.0,
        0.0, 0.0,

        // Left face
        0.0, 0.0,
        1.0, 0.0,
        1.0, 1.0,
        0.0, 1.0
	];
	cubeVertexTextureCoordBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexTextureCoordBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoord), gl.STATIC_DRAW);
	cubeVertexTextureCoordBuffer.itemSize = 2;
	cubeVertexTextureCoordBuffer.numItems = 24;

	var cubeVertexIndices = [
        0, 1, 2,      0, 2, 3,    // Front face
        4, 5, 6,      4, 6, 7,    // Back face
        8, 9, 10,     8, 10, 11,  // Top face
        12, 13, 14,   12, 14, 15, // Bottom face
        16, 17, 18,   16, 18, 19, // Right face
        20, 21, 22,   20, 22, 23  // Left face
	];
	cubeVertexIndexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVertexIndexBuffer);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cubeVertexIndices), gl.STATIC_DRAW);
	cubeVertexIndexBuffer.itemSize = 1;
	cubeVertexIndexBuffer.numItems = 36;

	////Moon
	var latitudeBands = 30;
    var longitudeBands = 30;
    var radius = 1.5;
    var nowx;
    var nowy;
    var nowz;

    var vertexPositionData = [];
    var normalData = [];
    var textureCoordData = [];
    for (var latNumber=0; latNumber <= latitudeBands; latNumber++) {
        var theta = latNumber * Math.PI / latitudeBands;
        var sinTheta = Math.sin(theta);
        var cosTheta = Math.cos(theta);

        for (var longNumber = 0; longNumber <= longitudeBands; longNumber++) {
            var phi = longNumber * 2 * Math.PI / longitudeBands;
            var sinPhi = Math.sin(phi);
            var cosPhi = Math.cos(phi);

            var x = cosPhi * sinTheta;
            var y = cosTheta;
            var z = sinPhi * sinTheta;
            var u = 1 - (longNumber / longitudeBands);
            var v = 1 - (latNumber / latitudeBands);
            
            normalData.push(x);
            normalData.push(y);
            normalData.push(z);
            textureCoordData.push(u);
            textureCoordData.push(v);
            vertexPositionData.push(radius * x);
            vertexPositionData.push(radius * y);
            vertexPositionData.push(radius * z);
        }
    }

    var indexData = [];
    for (var latNumber = 0; latNumber < latitudeBands; latNumber++) {
        for (var longNumber = 0; longNumber < longitudeBands; longNumber++) {
            var first = (latNumber * (longitudeBands + 1)) + longNumber;
            var second = first + longitudeBands + 1;
            indexData.push(first);
            indexData.push(second);
            indexData.push(first + 1);

            indexData.push(second);
            indexData.push(second + 1);
            indexData.push(first + 1);
        }
    }    
    moonVertexNormalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, moonVertexNormalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normalData), gl.STATIC_DRAW);
    moonVertexNormalBuffer.itemSize = 3;
    moonVertexNormalBuffer.numItems = normalData.length/3;

    moonVertexTextureCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, moonVertexTextureCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoordData), gl.STATIC_DRAW);
    moonVertexTextureCoordBuffer.itemSize = 2;
    moonVertexTextureCoordBuffer.numItems = textureCoordData.length/2;

    moonVertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, moonVertexPositionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexPositionData), gl.STATIC_DRAW);
    moonVertexPositionBuffer.itemSize = 3;
    moonVertexPositionBuffer.numItems = vertexPositionData.length/3;

    moonVertexIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, moonVertexIndexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexData), gl.STREAM_DRAW);
    moonVertexIndexBuffer.itemSize = 1;
    moonVertexIndexBuffer.numItems = indexData.length;
}

var vMatrix = new Matrix4();
var pMatrix = new Matrix4();
var mMatrix = new Matrix4();

function drawGround(){
	
	mMatrix.setTranslate(0, 0, 0);
	gl.bindBuffer(gl.ARRAY_BUFFER, groundVertexPositionBuffer);
	gl.vertexAttribPointer(shaderProgram.a_Position, groundVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
	gl.bindBuffer(gl.ARRAY_BUFFER, groundVertexTextureCoordBuffer);
	gl.vertexAttribPointer(shaderProgram.a_TextureCoord, groundVertexTextureCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);
	gl.bindBuffer(gl.ARRAY_BUFFER, groundVertexNormalBuffer);
	gl.vertexAttribPointer(shaderProgram.a_Normal, groundVertexNormalBuffer.itemSize, gl.FLOAT, false, 0, 0)
	setMatrixUniforms();

	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, groundTexture);
	gl.uniform1i(shaderProgram.u_Sampler, 0);

	gl.drawArrays(gl.TRIANGLE_STRIP, 0, groundVertexPositionBuffer.numItems);
}

var xRotCube = 0;
var yRotCube = 0;
var zRotCube = 0;

function drawCube(){
	
	gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexPositionBuffer);
	gl.vertexAttribPointer(shaderProgram.a_Position, cubeVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
	gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexTextureCoordBuffer);
	gl.vertexAttribPointer(shaderProgram.a_TextureCoord, cubeVertexTextureCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);
	gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexNormalBuffer);
	gl.vertexAttribPointer(shaderProgram.a_Normal, cubeVertexNormalBuffer.itemSize, gl.FLOAT, false, 0, 0);

	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, cubeTexture);
	gl.uniform1i(shaderProgram.u_Sampler, 0);

	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVertexIndexBuffer);

	checkInteract();
	for (var i = 0; i < numCubes; i++){
		if (!Cubes[i].lock){
			mMatrix.setTranslate(Cubes[i].x, Cubes[i].y, Cubes[i].z);
			mMatrix.rotate(degToRad(xRotCube), 1, 0, 0);
			mMatrix.rotate(degToRad(yRotCube), 0, 1, 0);
			mMatrix.rotate(degToRad(zRotCube), 0, 0, 1);

			setMatrixUniforms();

			gl.drawElements(gl.TRIANGLES, cubeVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
		}
	}
	
}

var xRotMoon = 0;
var xSpeed = 0;

var zRotMoon = 0;
var zSpeed = 0;

var xTranMoon = 0;
var zTranMoon = 0;

var z = 0.5;
function drawMoon(){
	if (xTranMoon < -15) xTranMoon = -15;
	if (xTranMoon > 15) xTranMoon = 15;
	if (zTranMoon > 15) zTranMoon = 15;
	if (zTranMoon < -15) zTranMoon = -15;
	mMatrix.setTranslate(xTranMoon, 0, zTranMoon);
	mMatrix.rotate(degToRad(xRotMoon), 1, 0, 0);
	mMatrix.rotate(degToRad(zRotMoon), 0, 0, 1);

	gl.bindBuffer(gl.ARRAY_BUFFER, moonVertexPositionBuffer);
	gl.vertexAttribPointer(shaderProgram.a_Position, moonVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
	gl.bindBuffer(gl.ARRAY_BUFFER, moonVertexTextureCoordBuffer);
	gl.vertexAttribPointer(shaderProgram.a_TextureCoord, moonVertexTextureCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);
	gl.bindBuffer(gl.ARRAY_BUFFER, moonVertexNormalBuffer);
	gl.vertexAttribPointer(shaderProgram.a_Normal, moonVertexNormalBuffer.itemSize, gl.FLOAT, false, 0, 0);

	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, moonTexture);
	gl.uniform1i(shaderProgram.u_Sampler, 0);

	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, moonVertexIndexBuffer);
	setMatrixUniforms();

	gl.drawElements(gl.TRIANGLES, moonVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
}

function degToRad(degrees) {
        return degrees * Math.PI / 180;
    }

var eye_X = 0, eye_Y = 18, eye_Z = 90;
var xMoonCamera = 0, zMoonCamera = 5;
function drawScene(){
	gl.useProgram(shaderProgram);
	pMatrix.setPerspective(eye_Z, 1, 1, 100);
	vMatrix.setLookAt(xMoonCamera, eye_Y, zMoonCamera, xMoonCamera, 0, zMoonCamera-3, 0, 1, 0);

	gl.uniform3f(shaderProgram.u_AmbientLight, 0.2, 0.2, 0.2);
	//var lightingDirection = new Vector3([0, 5, 0]);
	//lightingDirection.normalize();
	gl.uniform3f(shaderProgram.u_LightPosition, 0.0, 15.0, 35.0);
	gl.uniform3f(shaderProgram.u_LightColor, 2.0, 2.0, 2.0);

	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	initCubes();
	drawGround();
	drawCube();
	drawMoon();

}

var groundTexture;
var cubeTexture;
var moonTexture;
function initTextures(){
	groundTexture = gl.createTexture();
	groundTexture.image = new Image();	
	groundTexture.image.onload = function(){
		handleLoadedTexture(groundTexture);
	}
	groundTexture.image.src = "uranus.jpg";

	cubeTexture = gl.createTexture();
	cubeTexture.image = new Image();
	cubeTexture.image.onload = function(){
		handleLoadedTexture(cubeTexture);
	}
	cubeTexture.image.src = "sun.jpg";

	moonTexture = gl.createTexture();
	moonTexture.image = new Image();
	moonTexture.image.onload = function(){
		handleLoadedTexture(moonTexture);
	}
	moonTexture.image.src = "snow.jpg";
}

var winGame = false;
var currentScore = 0;
function draw2D(){
	ctx.clearRect(0, 0, 500, 500);
	ctx.font = '25px "Times New Roman"';
	ctx.fillStyle = 'rgba(0, 255, 0, 1)';
	ctx.textAlign = 'center';
	if (winGame){
		ctx.font = '30px "Times New Roman"';
		ctx.fillStyle = 'rgba(255, 255, 0, 1)';
		ctx.textAlign = 'center';
		ctx.fillText('***** YOU WIN *****', 250, 50);
	}
	else {
		ctx.fillText('YOUR SCORE: ' + currentScore, 250, 50);
	}
}
function handleLoadedTexture(texture){
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);    
    gl.bindTexture(gl.TEXTURE_2D, null);
}
function main(){
	initGL();
	initBuffers();
	initTextures();

	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	gl.enable(gl.DEPTH_TEST);

	document.onkeydown = handleKeyDown;
	document.onkeyup = handleKeyUp;

	tick = function(){
		animate();
		handleKeys();
		drawScene();
		draw2D();
		requestAnimationFrame(tick);
	}
	tick();
}

var angle = 0;
var lastTime = 0;
    function animate() {
        var timeNow = new Date().getTime();
        if (lastTime != 0) {
            var elapsed = timeNow - lastTime;
            xRotCube += (360 * elapsed) / 100.0;
            yRotCube += (360 * elapsed) / 100.0;
            zRotCube += (360 * elapsed) / 100.0;

            xRotMoon += (xSpeed * elapsed) / 10.0;
            zRotMoon += (zSpeed * elapsed) / 10.0;
        }
        lastTime = timeNow;
    }

function Cube(xCoord, yCoord, zCoord){
	this.x = xCoord;
	this.y = yCoord;
	this.z = zCoord;
	this.lock = false;
}

var numCubes = 15;
var Radius = 12;
var xCube, zCube;
var Angle = 0;
var Cubes = [];
function initCubes(){
	for (var i = 0; i < numCubes; i++){
		xCube = Radius * Math.cos(degToRad(Angle));
		zCube = Radius * Math.sin(degToRad(Angle));
		Angle += 24;
		Cubes.push(new Cube(xCube, 0, zCube));
	}
}
var sqrDis;
function checkInteract(){
	var sqrDis;
	for (var i = 0; i < numCubes; i++){
		if (!Cubes[i].lock){
			sqrDis = (Cubes[i].x - xTranMoon) * (Cubes[i].x - xTranMoon) + (Cubes[i].z - zTranMoon) * (Cubes[i].z - zTranMoon);
			if (sqrDis < 3 ){
				Cubes[i].lock = true;
				currentScore += 10;
		 	}
		 	if (currentScore == 10 * numCubes)
		 		winGame = true;
		}
	}
}

var currentlyPressedKeys = [];
function handleKeyDown(event){
	currentlyPressedKeys[event.keyCode] = true;
}
function handleKeyUp(event){
	currentlyPressedKeys[event.keyCode] = false;
}
function handleKeys(){
	if (currentlyPressedKeys[33]){
		//Page Up
		eye_Z -= 0.05;
		zMoonCamera -= 0.05;
	}
	if (currentlyPressedKeys[34]){
		//Page Down
		eye_Z += 0.05;
		zMoonCamera += 0.05;
	}

	if (currentlyPressedKeys[37]){
		//Left cursor key
		zSpeed += 0.7;
		xTranMoon -= 0.09;
		xMoonCamera -= 0.03;
	}
	if (currentlyPressedKeys[39]){
		//Right cursor key
		zSpeed -= 0.7;
		xTranMoon += 0.09;
		xMoonCamera += 0.03;
	}
	if (currentlyPressedKeys[38]){
		//Up cursor key
		xSpeed -= 0.7;
		zTranMoon -= 0.09;
		zMoonCamera -= 0.03;
	}
	if (currentlyPressedKeys[40]){
		//Down cursor key
		xSpeed += 0.7;
		zTranMoon += 0.09;
		zMoonCamera += 0.03;
	}
}
