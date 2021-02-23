/*	=============================================================================
	sprite-test.js

	4/12/2018
	Ver manejo de eventos mouse en linea 923, function activePolygon() a titulo de ejemplo


	Pruebas para el manejo de sprites: trasladar, girar, voltear

	1/12/2018
	Manejando el traslado (drag and drop)
	Las piezas quedan seleccionadas (con alpha 0.5) hasta que se seleccione otra.
	Habria que detectar si tiene una posicion válida en el tablero, en cuyo caso debe ser deseleccionada y alpha 1
	Tambien habria que controlar que: 'si *seleccionActual* tiene valor definido cuando se está seleccionando otra pieza(?), 
	entonces la pieza apuntada debe marcarse cono no-seleccionada y apuntar a la pieza actual.

	Queda pendiente el giro y volteo (de la pieza seleccionada)

	boton salir debe cerrar la aplicacion


	OBSERVACIONES

	Se utilizan dos tipos de coordenadas:
		a/ unidades de pantalla: las coordenadas de la pantalla o canvas y
		b/ unidades de tablero: donde cada cuadrado unitario que compone un poliomino es una particula unitaria. 


*/

//=========
// define
//=========

//Aliases
"use strict";

//=====================
//	Constantes
//=====================
var	LIMITE_TABLERO = 450,
	LINEA_BOTONES = 550,
	LINEA_BOTONES_OFF = 700,
	RENDERER_W = 1000,
	RENDERER_H = 600,
	FONDO_JUEGO = 0xffffff,		//	 "#ffc",
	VERSION	= "0.7.0",			//	version inicial
	//	DEBUG = false;
	DEBUG = true;

//	array con lista de piezas para crear sprites draggables para cada caso
var LISTA_PIEZAS = [
		'pento-F.png',	'pento-I.png',	'pento-L.png',	'pento-N.png',
		'pento-P.png',	'pento-T.png',	'pento-U.png',	'pento-V.png',
		'pento-W.png',	'pento-X.png',	'pento-Y.png',	'pento-Z.png'
	];

//	array con lista de piezas para crear sprites draggables para cada caso
var LISTA_CUADROM = [ "cuad-L.png", "cuad-O.png", "cuad-S.png", "cuad-T.png" ];

//	equivalencias
var Container = PIXI.Container,
    autoDetectRenderer = PIXI.autoDetectRenderer,
    Sprite = PIXI.Sprite,
    loader = PIXI.loader,
    resources = PIXI.loader.resources,
    Text = PIXI.Text;

//----------------------------------------------------
//	Colores
//	https://www.w3schools.com/colors/colors_picker.asp
//	http://www.colorhexa.com/
//-------------------------------------
var BACKGROUND_COLOR = "0xddeeff";
var BACKGROUND_BOARD_COLOR = "0xeeeeee";

var BORDER_COLOR = "0x666600";  
var BORDER_STROKE_COLOR = "0xffff66";			//	"yellow";

var BOARD_COLOR = "0xB7F7DE"; //light green
var FIXED_BLOCK_COLOR = "0x666666";  //light gray
var FIXED_BORDER_COLOR = BOARD_COLOR;

var FOCUS_BORDER_COLOR = "red";
var BLOCK_BORDER_COLOR = "yellow";

var OPERATOR_COLOR = "0x3344FF";  //blue
var OPERATOR_CIRCLE_COLOR = "white";

var FLASH_BORDER_COLOR = "red";

var TEXT_FINISH_COLOR = "0xFF88EE";
var NEXT_BUTTON_TEXT_COLOR = "0xFF8800";
var NEXT_BUTTON_FILL_COLOR = "white";
var NEXT_BUTTON_BORDER_COLOR = "green";


//-------------------------------------------------------------------------
// block colors: 
// from : http://en.wikipedia.org/wiki/File:Pentomino_Puzzle_Solutions.svg	  
//-------------------------------------------------------------------------
//	BLOCK_COLOR vector contiene los colores asignados a cada pentomino

var BLOCK_COLOR = [ "#800000", "#BF8040", "#8F8F3D", "#BBDD99", 
					"#AAEEAA", "#99DDBB", "#88CCCC", "#99BBDD",
					"#AAAAEE", "#BB99DD", "#CC88CC", "#DD99BB" ];

var	COLOR_BLOCK_FIJO	= '#112233';	//	gris bastante oscuro

var	OUTER_ALIGNMENT	= 1;		//	???


//===========================
// value based on screen size
//===========================
var BLOCK_CELL_SIZE = 50;	//	tamaño de celdas del tablero en pixels (similar a imagen
var STAGE_X;
var STAGE_Y;
var STAGE_OFFSET_X;
var STAGE_OFFSET_Y;
var SCREEN_X;			//	ancho de pantalla en px
var SCREEN_Y;			//	alto de pantalla en px

//==================
// global variable
//==================
var SCREEN_BOARD_X	= 8;//	ancho del tablero en celdas. ordenada X de tablero
var SCREEN_BOARD_Y	= 8;//	ordenada Y de tablero
var BOARD_WIDTH;		//	ancho del tablero en unidades de pantalla
var BOARD_HIGH;			//	alto del tablero en unidades de pantalla
var boardStartX;		//	coordenadas para posicion del tablero
var boardStartY;


//	var	DEBUG = false;
var	DEBUG = true;
var	DEBUG2 = false;

var rendererOptions = {
	antialiasing: true,
	transparent: true,
	resolution: window.devicePixelRatio,
	autoResize: true,	//	backgroundColor: BACKGROUND_COLOR	//	default: 0x000000
}

//Create the renderer
//	750 de alto solo para visualizar los botones cuando son desplazados
var renderer = PIXI.autoDetectRenderer( RENDERER_W, RENDERER_H, rendererOptions );

//	-----------------------------------------------
//	To make the canvas fill the entire window, apply this CSS styling 
//	and resize the renderer to the size of the browser window.
renderer.view.style.position = "absolute";
renderer.view.style.display = "block";
renderer.autoResize = true;
renderer.resize(window.innerWidth - 40, window.innerHeight - 40);
// Put the renderer on screen in the corner
renderer.view.style.top = "0px";
renderer.view.style.left = "0px";


//Add the canvas that Pixi automatically created for you to the HTML document
document.body.appendChild(renderer.view);


//	para el drag and drop
var drag = false,
	seleccionActual = undefined; 


//Setup Pixi and load the texture atlas files - call the `setup` function when they've loaded
loader.add("images/pento.json")	
	.add("https://fonts.googleapis.com/css?family=Sriracha")
	.load(setup) ;



//	Define variables that might be used in more than one function
//	las variables que siguen me permiten utilizar un esquema similar al de sumado.js (que funciona)
var	arrPiezas = [],					//	array con pentominos
	arrPzDebug = [],				//	array con cuadrominos para debug
	BotonAtras = undefined,
	BotonJugar = undefined,
	BotonPunto = undefined,		//	esto solo para debug
	BotonSalir = undefined,
	BotonGirar = undefined,
	BotonVoltear = undefined,
	Crono = undefined,
	evento = undefined,				//	para avisar accion sobre botones en debug
	start = undefined,
	elapsed = undefined,
	EscenaDeJuego = undefined,		//	container juego
	EscenaFinJuego = undefined,		//	container aviso de fin del juego
	EscenaMenuInic = undefined,		//	container pantalla de inicio
	EscenarioGral = undefined;		//	container del total (1er nivel)
	if (DEBUG)
	{
		var EscenaDebug = undefined;
	}

var	idTexturas = undefined,			//	variable para contener texturas
	pzTexture = undefined,
	pointer = undefined,
	state = undefined, 
	capaMensajes = undefined,		//	container de mensajes
	BotonReinicio = undefined,		//	
	BotonPista = undefined			//	pistas

var gBlockGroup;		//este array contiene datos de los poliominos / poligonos a tratar (pentominos)
var gPolyGroup;			//	datos de poliominos for output on screen

//	------------------------------------------------
//	Preparacion de cuadromino a posicion fija
//	------------------------------------------------
var wCuadromGroup;		//	vector con datos de cuadrominos. Uno va en posición fija
var	wPolyCuadrom;		//	datos para colocacion en pantalla
var	nCuadromId	= 3;	//	identificador del cuadromino fijo a colocar en el tablero

//	var wCuadromino;		//	datos de cuadromino a colocar en posición fija
var wCuadromPos = {x:1,y:1};	//	posicion del cuadromino fijo
var gCeldasOcupadas;

//---------------------------
// For calculate board state 
//---------------------------
var gBoardState;		//	estado de las celdillas del tablero, ([1..SCREEN_BOARD_X] , [1..SCREEN_BOARD_Y])
var gTotalBlockCell;	//	total block cells
var gBlockCellUsed = 0; //	how many block cell used. Leva la cuenta de las celditas de tablero ocupadas
						//	Este velor se emplea para verificar si el problema ha sido resuelto.
var gBlockUsed = 0;		//	how many block used

var	pzActual = {};		//	Objeto con las caracteristicas de la pieza en operacion actualmente. 



function setup() {
	//	Preparacion general

	//	Create an alias for the texture atlas frame ids
	//	Hay varias formas de crear sprites a partir del atlas. Esta sería la mas expeditiva.
	idTexturas = PIXI.loader.resources["images/pento.json"].textures;
	//	inicialmente intento dibujar los elementos

	//	Make the game scene and add it to the EscenarioGral
	EscenarioGral = new PIXI.Container();

	// Size the renderer to fill the screen
	resize(); 
	// Listen for and adapt to changes to the screen size, e.g.,
	// user changing the window or rotating their device
	window.addEventListener("resize", resize);
	
	//	Escenario menu inicial
	EscenaMenuInic = new PIXI.Container();
	EscenarioGral.addChild(EscenaMenuInic);

	//	Escenario menu juego
	EscenaDeJuego = new PIXI.Container();
	EscenarioGral.addChild(EscenaDeJuego);

	if (DEBUG) {
		//	Escenario menu juego
		EscenaDebug = new PIXI.Container();
		EscenarioGral.addChild(EscenaDebug);
		
	}

	//Create the EscenaFinJuego
	EscenaFinJuego = new PIXI.Container();
	EscenarioGral.addChild(EscenaFinJuego);



	//	Prepara los botones necesarios
	HaceBotones();

	//	Prepara las diferentes pantallas / escenas.
	PantallaInicio();
	PantallaJugar();

	//	Set the initial game state
	//	state = play;
	state = Menu;

	//	Una grilla para ubicarnos en el canvas
	if (DEBUG) {	DibujaGrilla()	}

	//	definir cuales son las escenas visibles y cuales invisibles
	EscenaMenuInic.visible = true;			//	container pantalla de inicio
	EscenaFinJuego.visible = false;		//	container aviso de fin del juego
	EscenarioGral.visible = true;			//	container del juego

	var	MessageFin = new Text( "Solución correcta.\nFelicitaciones!", 
		{ fontFamily: "Sriracha",	fontSize: "32px", fill: "#600" });	
		MessageFin.x = 250;
		MessageFin.y = 420;
		EscenaFinJuego.addChild(MessageFin);

	//	detectar y procesar teclas pulsadas mediante 'keydown' event listener en el document
	document.addEventListener('keydown', onKeyDown);

	//	Render the EscenarioGral
	//	para ver si excribe bien
	renderer.render(EscenarioGral);

	//Start the game loop
	gameLoop();
}



function PantallaInicio() {
	EscenaMenuInic.visible = true;

	//	titulo del menu y juego
	var spriteTitulo = PIXI.utils.TextureCache["titulo.PNG"];
	spriteTitulo = new PIXI.Sprite(spriteTitulo);
	console.log('spriteTitulo.width: ' + spriteTitulo.width);
	spriteTitulo.x =	//	70 ;			(window.innerWidth - spriteTitulo.width) / 2;
		(RENDERER_W - spriteTitulo.width) / 2;

	spriteTitulo.y = 80 ;
	// make it a bit bigger, so it's easier to grab
	spriteTitulo.scale.set(1.0);
	EscenaMenuInic.addChild(spriteTitulo);

	var pixiTextStyle = {
		fontFamily: "Sriracha", 
		fontSize: "32px",
		fontStyle: 'normal',		//	The font style ('normal', 'italic' or 'oblique')
		fill: "0x020"
	};
	var richText = new Text( '100 rompecabezas con pentominos', pixiTextStyle );

	//	'Se dan como ayuda los valores de dos vértices.', style);
	//	richText.x = 100;
	richText.x = (RENDERER_W - richText.width) / 2;

	richText.y = 220;
	EscenaMenuInic.addChild(richText);

}



function gameLoop() {

	//Loop this function 60 times per second
	requestAnimationFrame(gameLoop);

	//	Run the current state
	//	Una grilla para ubicarnos en el canvas
	if (DEBUG2) { console.log('state: ' + state)	}
	state();

	//Render the EscenarioGral
	renderer.render(EscenarioGral);
}




//	--------------------------------------
function play() {
	if ( ProblemaResuelto() ) {
		state = end;
	} else {
		elapsed = Math.floor(( new Date().getTime() - start ) / 100 ) / 10;
	}
	//	Crono.text = "Tiempo: " + elapsed + " seg.";
}

////////////////////////////////////////////////////////////////////////////////////////
//	solamente para depurar
function DibujaGrilla() {

	var offset = undefined,
		salto = 50,
		line = new PIXI.Graphics();

	// set a fill and line style
	line.lineStyle(1, "#bbbbbbb", 0.5);

	//	lineas verticales
	offset = salto;
	//	console.log( 'offset, window.innerWidth: ' + offset + ', ' + window.innerWidth );
	while ( offset < window.innerWidth ) {
		//	console.log('window.innerHeight, offset: ' + window.innerHeight + ', ' + offset );
		line.moveTo(offset, 0);
		line.lineTo(offset, window.innerHeight );

		EscenarioGral.addChild(line);
		offset += salto;
	}

	//	lineas horizontales
	offset = salto;
	while ( offset < window.innerHeight ) {
		line.moveTo(0, offset);
		line.lineTo(window.innerWidth, offset );

		EscenarioGral.addChild(line);
		offset += salto;
	}


/*
	for (var i = 0; i < 18; i++)
	{
		//	lineas horizontales
		var line = new PIXI.Graphics();
		line.lineStyle(1, "#bbbbbbb", 0.5 )
		line.moveTo(0, 0);
		line.lineTo( , 0);
		line.x = 0;
		line.y = ( 50 * i ) + 10 ;
		EscenarioGral.addChild(line);

		//	lineas verticales
		line = new PIXI.Graphics();
		line.lineStyle(1, "#ace", 0.5);
		line.moveTo(0, 0);
		line.lineTo(0, window.innerHeight);
		line.x = ( 50 * i ) + 10;
		line.y = 0;
		EscenarioGral.addChild(line);
	}
*/

}





function PantallaJugar() {
	var tablero,
		i = undefined,			//	para conteo usos varios
		aPosPolig = undefined,
		pzSprite = new Object(), cImagen;

	//	imagenes para la pantalla de juego
	var tableroTexture = idTexturas["tablero.png"];
	tablero = new PIXI.Sprite(tableroTexture);
	//	tablero = id["sumado-tablero.png"];

	tablero.x = 40;
	tablero.y = 40;
	// make it a bit bigger, so it's easier to grab
	//	tablero.scale.set(1.34);
	tablero.scale.set(1.0);
	EscenaDeJuego.addChild(tablero);

	//	asigno valores a la posicion inicial del tablero, sector colocacion de piezas
	boardStartX = tablero.x;
	boardStartY = tablero.y;

	Crono = new Text( "Tiempo: ", { fontFamily: "Sriracha",	fontSize: "16px", fill: "#a00"  } );
	Crono.position.set(400, 10 );
	EscenaDeJuego.addChild(Crono);

	//	-------------------------------------------------------------	
	//	Preparacion del boton girar
	var BotonTexture = PIXI.utils.TextureCache["boton-girar.png"];
	BotonGirar = new PIXI.Sprite(BotonTexture);
	// Set the initial position
	BotonGirar.anchor.set(0.5);
	BotonGirar.x = 260;
	BotonGirar.y =  LINEA_BOTONES;
	// Opt-in to interactivity
	BotonGirar.interactive = true;
	// Shows hand cursor
	BotonGirar.buttonMode = true;
	// Pointers normalize touch and mouse
	BotonGirar.on('pointerdown', Girar );
	BotonGirar.on('click', Girar ); // mouse-only
	BotonGirar.on('tap', Girar ); // touch-only
	BotonGirar.scale.set(0.7);
	//	Add the button to the EscenarioGral
	EscenaDeJuego.addChild(BotonGirar);

	//	-------------------------------------------------------------	//	Preparacion del boton girar
	var BotonTexture = PIXI.utils.TextureCache["boton-voltear.png"];
	BotonVoltear = new PIXI.Sprite(BotonTexture);
	// Set the initial position
	BotonVoltear.anchor.set(0.5);
	BotonVoltear.x = 360;
	BotonVoltear.y =  LINEA_BOTONES;
	// Opt-in to interactivity
	BotonVoltear.interactive = true;
	// Shows hand cursor
	BotonVoltear.buttonMode = true;
	// Pointers normalize touch and mouse
	BotonVoltear.on('pointerdown', Jugar );
	BotonVoltear.on('click', Jugar ); // mouse-only
	BotonVoltear.on('tap', Jugar ); // touch-only
	BotonVoltear.scale.set(0.7);
	//	Add the button to the EscenarioGral
	EscenaDeJuego.addChild(BotonVoltear);


	// creacion de los sprites draggables
	for ( i = 0; i < LISTA_PIEZAS.length; i++)
	{
		cImagen = LISTA_PIEZAS[i];
		pzTexture = PIXI.utils.TextureCache[cImagen];
		pzSprite = new PIXI.Sprite(pzTexture);

		pzSprite.nombre = cImagen;

		// Opt-in to interactivity
		pzSprite.interactive = true;
		//	draggableObjects.addChild(pzSprite);

		//	pzSprite.setDraggable(true);
		//	createDragAndDropFor(pzSprite);


		// this button mode will mean the hand cursor appears when you roll over the pzSprite with your mouse
		pzSprite.buttonMode = true;

		// center the pzSprite's anchor point
		pzSprite.anchor.set(0.5, 0.5);
		//	pzSprite.anchor.set(0.5);

		// make it a bit bigger, so it's easier to grab
		pzSprite.scale.set(1.0);

		// setup events
		//	Para ver el tratamiento a dar a los diferentes eventos de mouse, teclado y touch 
		//	en la function activePolygon() de wpentomino.puzzle.js, linea 1529
        // Mouse & touch events are normalized into the pointer* events for handling different
        // button events.

		//	ajustar las funciones que siguen similar a linea 1530 en pentomino-puzzle-11.js
		
		pzSprite
			.on('mousedown', onDragStart)
			.on('touchstart', onDragStart)
			.on('mouseup', onMouseUp)
			.on('mouseupoutside', onDragEnd)
			.on('touchend', onDragEnd)
			.on('touchendoutside', onDragEnd)
			.on('mousemove', onDragMove)
			.on('touchmove', onDragMove)
			.on('click', onClick);
		
/*
		//	temporalmente quiero detectar accion efecto
		pzSprite
			.on('mousedown',		onMousedown			)
			.on('touchstart',		onTouchstart		)
			.on('mouseup',			onMouseup			) 
			.on('mouseupoutside',	onMouseupoutside	)
			.on('touchend',			onTouchend			)
			.on('touchendoutside',	onTouchendoutside	)
			.on('mousemove',		onMousemove			)
			.on('touchmove',		onTouchmove			)
			.on('click',			onClick				);
*/

		//	add draggable objects to container
		EscenaDeJuego.addChild(pzSprite);

		// add it to the EscenarioGral
		//	EscenarioGral.addChild(pzSprite);

		//	console.log( 'pzSprite: ' + pzSprite + '\n  ------------------------' );
		//	console.log( 'pzSprite [0] y [1]: ' + pzSprite[0] + ', ' + pzSprite[1] );
		//	console.log( 'pzSprite:\n' + mostrarPropiedades( pzSprite, "pzSprite" ) + '\n  ------------------------' );

		arrPiezas[i] = pzSprite;
		arrPiezas[i].id = cImagen.slice(6, 7);		//	el atributo id identifica la pieza
		arrPiezas[i].num = i;						//	le asignamos numero para manejo posterior

		//	console.log( 'arrPiezas[' + i + ']: ' + arrPiezas[i] );
		//	console.log( 'arrPiezas[' + i + ']: ' + arrPiezas[i].id + ', ' + arrPiezas[i][1] );
		//	console.log( 'arrPiezas[' + i + ']:  \n' + mostrarPropiedades( arrPiezas[i], "arrPiezas" ) + '\n  ------------------------' );

	}

	//	console.log( 'arrPiezas[' + i + ']:  \n' + mostrarPropiedades( arrPiezas, "arrPiezas" ) + '\n  ------------------------' );


}



function Jugar() {
	var i = undefined;
//	definir cuales son las escenas visibles y cuales invisibles
	EscenaDeJuego.visible = true;
	EscenaFinJuego.visible = false;
	EscenaMenuInic.visible = false;
	EscenarioGral.visible = true;

	EscenaDeJuego.alpha = 0.99 ;

	//	pruebo quitar al boton del area visible (para no destuirlo y crearlo nuevmante)
	//	...y esto funciona. Asi es que...
	BotonJugar.y = LINEA_BOTONES_OFF;
	BotonAtras.y = LINEA_BOTONES;

	BotonJugar.disabled=true;
	BotonSalir.disabled=true;
	BotonAtras.disabled=false;
	BotonGirar.disabled=false;
	BotonVoltear.disabled=false;

	BotonJugar.visible = false;
	BotonSalir.visible = false;
	BotonAtras.visible = true;
	BotonGirar.visible = true;
	BotonVoltear.visible = true;

	//	posicionar los sprites de piezas pentominos
	for ( i = 0; i < arrPiezas.length; i++)	{
		estacionaPz( i );
	}

	//	anulo temporalmente...
	//	GenJuego()		//	genera un nuevo juego

	start = new Date().getTime();
	elapsed = 0;

	state = play;

}

function Menu() {
	//	definir cuales son las escenas visibles y cuales invisibles
	EscenaDeJuego.visible = false;
	EscenaFinJuego.visible = false;		//	container aviso de fin del juego
	EscenaMenuInic.visible = true;		//	container pantalla de inicio
	EscenarioGral.visible = true;		//	container del juego

	BotonJugar.y = LINEA_BOTONES;
	BotonSalir.y = LINEA_BOTONES;
	BotonPunto.y = LINEA_BOTONES - 50;	//	solo para debug
	BotonAtras.y = LINEA_BOTONES;
	BotonJugar.visible = true;
	BotonSalir.visible = true;
	BotonAtras.visible = true;

	BotonGirar.visible = false;
	BotonVoltear.visible = false;

	state = Menu;

}





function HaceBotones() {
	var BotonTexture;
	//	Prepara los botones con las opciones de juego, ayuda, puntaje, salir
	//	Create an alias for the texture atlas frame ids
	//	Hay varias formas de crear sprites a partir del atlas. Esta sería la mas expeditiva.
	//	Get a reference to the texture atlas id's
	//	var buttonFrames			//	almacenar el array de imagenes del boton

	//	The button state textures
	//	Preparacion boton de juego
	//	buttonFrames = [id["botonjugarup.png"], id["botonjugarover.png"], 	id["botonjugardown.png"]];
	
	//	BotonJugar = t.button(buttonFrames, 100, LINEA_BOTONES );
	//	BotonJugar = id["botonjugarup.png"];

	//	-------------------------------------------------------------	
	//	Preparacion boton volver a inicio
	BotonTexture = PIXI.utils.TextureCache["boton-atras.png"];
	BotonAtras = new PIXI.Sprite(BotonTexture);
	// Set the initial position
	BotonAtras.anchor.set(0.5);
	BotonAtras.x = 100;
	BotonAtras.y =  LINEA_BOTONES;
	// Opt-in to interactivity
	BotonAtras.interactive = true;
	// Shows hand cursor
	BotonAtras.buttonMode = true;
	// Pointers normalize touch and mouse
	BotonAtras.on('pointerdown', Menu );
	BotonAtras.on('click', Menu );
	BotonAtras.on('tap', Menu );
	BotonAtras.scale.set(0.7);
	//	Add the button to the EscenarioGral
	EscenarioGral.addChild(BotonAtras);

	//	-------------------------------------------------------------	//	Preparacion del boton jugar
	BotonTexture = PIXI.utils.TextureCache["boton-jugar.png"];
	BotonJugar = new PIXI.Sprite(BotonTexture);
	// Set the initial position
	BotonJugar.anchor.set(0.5);
	BotonJugar.x = 260;
	BotonJugar.y =  LINEA_BOTONES;
	// Opt-in to interactivity
	BotonJugar.interactive = true;
	// Shows hand cursor
	BotonJugar.buttonMode = true;
	// Pointers normalize touch and mouse
	BotonJugar.on('pointerdown', Jugar );
	BotonJugar.on('click', Jugar ); // mouse-only
	BotonJugar.on('tap', Jugar ); // touch-only
	BotonJugar.scale.set(0.7);
	//	Add the button to the EscenarioGral
	EscenarioGral.addChild(BotonJugar);


	//	-------------------------------------------------------------	//	Preparacion del boton salir
	BotonTexture = PIXI.utils.TextureCache["boton-salir.png"];
	BotonSalir = new PIXI.Sprite(BotonTexture);
	// Set the initial position
	BotonSalir.anchor.set(0.5);
	BotonSalir.x = 420;
	BotonSalir.y =  LINEA_BOTONES;
	// Opt-in to interactivity
	BotonSalir.interactive = true;
	// Shows hand cursor
	BotonSalir.buttonMode = true;
	// Pointers normalize touch and mouse
	BotonSalir.on('pointerdown', Jugar );
	BotonSalir.on('click', Jugar ); // mouse-only
	BotonSalir.on('tap', Jugar ); // touch-only
	BotonSalir.scale.set(0.7);
	//	Add the button to the EscenarioGral
	EscenarioGral.addChild(BotonSalir);



	//	-------------------------------------------------------------
	if (DEBUG)	{
	//	Preparacion del boton auxiliar para deteccion acciones mouse
	BotonTexture = PIXI.utils.TextureCache["boton-puntaje.png"];
	BotonPunto = new PIXI.Sprite(BotonTexture);
	// Set the initial position
	BotonPunto.anchor.set(0.5);
	BotonPunto.x = 420;
	BotonPunto.y =  LINEA_BOTONES - 50;
	// Opt-in to interactivity
	BotonPunto.interactive = true;
	// Shows hand cursor
	BotonPunto.buttonMode = true;
	// Pointers normalize touch and mouse
	BotonPunto.on('pointerdown', BotonDebug );
	BotonPunto.on('click',		 BotonDebug ); // mouse-only
	BotonPunto.on('tap',		 BotonDebug ); // touch-only
	BotonPunto.scale.set(0.7);
	//	Add the button to the EscenarioGral
	EscenarioGral.addChild(BotonPunto);
	}


}

//---------------------------------------------------




function bubbleSort(inputArray, start, rest) {
	for (var i = rest - 1; i >= start;  i--) {
		for (var j = start; j <= i; j++) {
			if (inputArray[j+1][1] < inputArray[j][1] ) {
				var tempValue = inputArray[j];
				inputArray[j] = inputArray[j+1];
				inputArray[j+1] = tempValue;
			}
		}
	}
	return inputArray;
}



function end() {
	console.log("End() " );
	
	//	definir cuales son las escenas visibles y cuales invisibles
	EscenaDeJuego.visible = true;
	EscenaFinJuego.visible = true;		//	container aviso de fin del juego
	EscenaMenuInic.visible = false;		//	container pantalla de inicio
	EscenarioGral.visible = true;		//	container del juego

	EscenaDeJuego.alpha = 0.8 ;

	BotonJugar.y = LINEA_BOTONES_OFF ;
	BotonAtras.y = LINEA_BOTONES;

	BotonJugar.visible = true;
	BotonSalir.visible = true;
	BotonAtras.visible = true;
	
	BotonGirar.visible = false;
	BotonVoltear.visible = false;

}



//	procesar teclas pulsadas
function onKeyDown(key) {

	var	cualTecla = key.key;
	//	console.log( "cualTecla :" + cualTecla );

    if (key.key === "*" ) {
		state = Menu;
    }

    // W Key is 87
    // Up arrow is 38
    if (key.keyCode === 87 || key.keyCode === 38) {
    }

    // S Key is 83
    // Down arrow is 40
    if (key.keyCode === 83 || key.keyCode === 40) {
    }

    // A Key is 65
    // Left arrow is 37
    if (key.keyCode === 65 || key.keyCode === 37) {
    }

    // D Key is 68
    // Right arrow is 39
    if (key.keyCode === 68 || key.keyCode === 39) {
    }

}




function resize() {
 
  // Determine which screen dimension is most constrained
  var ratio = Math.min(window.innerWidth/RENDERER_W,
                   window.innerHeight/RENDERER_H);
 
  // Scale the view appropriately to fill that dimension
  EscenarioGral.scale.x = EscenarioGral.scale.y = ratio;
 
  // Update the renderer dimensions
  renderer.resize(Math.ceil(RENDERER_W * ratio),
                  Math.ceil(RENDERER_H * ratio));
}


function ProblemaResuelto() {
	//	var	resuelto = 
	//	console.log('--- verificando alcance de solucion correcta -----');
	return false;	//	por ahora

}



//=============================================================================
// BEGIN for board operator function
//=============================================================================

//------------------------
// insert block to board 
//------------------------
function insertBlockToBoard(board, boardX, boardY, block, curPos, value)
//	board	: array con los datos de ocupacion de celdillas
//	boardX	: ancho del tablero en celdillas
//	boardY	: alto del tablero en celdillas
//	block	: array con la posicion de los cuadrados que componen el pentomino
//	curPos	: posicion x,y donde se intenta insertar la pieza
//	value	: valor a asignar a la celdilla en caso de resultar exitosa la insercion
{
	var x, y, i;
	var cx, cy;
	var blockSize = block.length;

	//empty position 
	x = curPos.x; 
	y = curPos.y;
	
	//try to insert the block
	for(i = 0 ; i < blockSize; i++) {
		cx = block[i].x+x;
		cy = block[i].y+y; 
		//block cell need fit into x:[1..boardX], y:[1..boardY]	
		if(cx > boardX || cx < 1) break;
		if(cy > boardY || cy < 1) break;
		if(board[cx][cy] != 0) break;			//	la celdilla esta ocupada
	}
	
	if(i < blockSize) return (0); //can not insert it 
	
	//	insertó block  (set value != 0)
	for(i = 0 ; i < blockSize; i++) {
		cx = block[i].x+x;
		cy = block[i].y+y; 	
		board[cx][cy] = value;
	}

	return (1);
}

//-------------------------
// remove block from board 
//-------------------------
function removeBlockFromBoard(board, block, insPos)
{
	for(var i = 0 ; i < block.length; i++) {
		board[block[i].x+insPos.x][block[i].y+insPos.y] = 0;
	}
}



//-----------------------------------------------------------
//	lo que sigue, solo para ver como trata indicaciones de mouse y touch

function activePolygon()
{
	//inactivePolygon();
	for(var g = 0; g < gPolyGroup.length; g++) {
		var poly = gPolyGroup[g].poly;
		
		poly.setDraggable(true);
		
		// add cursor style
		poly.on('mouseover', function() {
			document.body.style.cursor = 'move';
		});
		
		poly.on('mouseout', function() {
			document.body.style.cursor = 'default';
		});

		poly.on('dragstart', function() {
			removeFromBoard(this);
			clearFocusPoly(getLastFocusPoly());
			hideOperatorObject(); //disable operator before drag
			setFocusPoly(this);
			setShadow(this);
			gBoardLayer.draw();
		});

		poly.on('dragend', function() {
			if(tryInsert2Board(this)) {
				//insert success
				
				//set to precise location
				this.setX(this.pos.boardX);
				this.setY(this.pos.boardY);
				
				//this.moveToBottom(); //move to bottom of board
				this.setZIndex(gBlockUsed+1); //after (board + blockUsed) 
				
				clearFocusPoly(this);
				hideOperatorObject();
				clearShadow(this);
				//drawOutline(this);
				setColor(this, 1); //set normal color
				gBoardLayer.draw();
				insertCheck();
			} else {
				showOperatorObject(this); //enable operator if insert failed
			}
			
			//	dumpBoard(gBoardState); //for debug only
		});
		
		poly.on('click', function() {
			clearFocusPoly(getLastFocusPoly());
			hideOperatorObject(); //remove operator from old position 
			removeFromBoard(this);
			setFocusPoly(this);
			setShadow(this);
			showOperatorObject(this); //enable operator at new position

			//	dumpBoard(gBoardState); //for debug only
		});	
	
		poly.on('dragmove click', function() {
			// for debug only
			//	writeMessage("(x,y) = (" + this.getPosition().x + "," + this.getPosition().y + '), offset(x,y)=(' + this.getOffset().x + ", " + this.getOffset().y  + "), scale = (" + this.getScale().x + ", " + this.getScale().y + "), RotationDeg = " + this.getRotationDeg() );
		});
		
	}
}

function inactivePolygon()
{
	for(var g = 0; g < gPolyGroup.length; g++) {
		var poly = gPolyGroup[g].poly;
		poly.setDraggable(false);
		poly.off('mouseover mouseout dragstart dragend click');
	}
	document.body.style.cursor = 'default';
}


//===============================================================
function CalcCeldasOcupadas()		//	arma un vector con los datos de las celdas ocupadas en el tablero
{
	var aCeldas = [];

	if (DEBUG2)
	{
		console.log('linea 3025, wCuadromPos: ' + wCuadromPos );
		console.log('linea 3026, wCuadromGroup[nCuadromId].blockStyle ' + wCuadromGroup[nCuadromId].blockStyle );
		console.log('linea 3027, wCuadromGroup[nCuadromId].blockStyle[0] ' + wCuadromGroup[nCuadromId].blockStyle[0] );
		console.log('linea 3027, wCuadromGroup[nCuadromId].blockStyle[0][0] ' + wCuadromGroup[nCuadromId].blockStyle[0][0] );
		console.log('linea 3027, wCuadromGroup[nCuadromId].blockStyle[0][0].x ' + wCuadromGroup[nCuadromId].blockStyle[0][0].x );
		console.log('linea 3029, wCuadromPos[0].x ' + wCuadromPos.x );
		console.log('linea 3030, wCuadromGroup[nCuadromId].blockStyle[0][0].y ' + wCuadromGroup[nCuadromId].blockStyle[0][0].y );
		console.log('linea 3031, wCuadromPos[0].y ' + wCuadromPos.y );

	}

	for (var i = 0; i < wCuadromGroup[nCuadromId].blockStyle[0].length; i++ )
	{
		aCeldas[i] = {};
		aCeldas[i].x = wCuadromGroup[nCuadromId].blockStyle[0][i].x + wCuadromPos.x;
		aCeldas[i].y = wCuadromGroup[nCuadromId].blockStyle[0][i].y + wCuadromPos.y;
	};

	return aCeldas;

}

//===========================================
// BEGIN for rotate & flip polygon block
//===========================================

/*
	por ahora en suspenso

//-------------------------------------
// 90 degree clockwise a polygon block
//-------------------------------------
var animateRotate90Object = new animateRotate90();
function rotate90(poly, time)
{
	var block = gPolyGroup[poly.polyId].block;

	
	if(animateRotate90Object.isRunning()) return;
	//console.log(poly.getRotationDeg());
	if(typeof time == "undefined") time = 150;
	animateRotate90Object.init(poly, time);
	animateRotate90Object.start();	
	
	//block rotate 90 degree clockwise, (X, Y) ==> (-Y, X)
	for(var i = 0 ; i < block.length; i++) {
		var tmpX = block[i].x;
		block[i].x = -block[i].y;
		block[i].y = tmpX;
	}
	blockNormalization(block); //external function
}

function rotate90Running()
{
	return animateRotate90Object.isRunning();
}

//---------------------------------
// left-right flip a polygon block
//---------------------------------
var animateFlipObject = new animateLeftRightFlip();
function leftRightFlip(poly, time)
{
	var block = gPolyGroup[poly.polyId].block;
	
	if(animateFlipObject.isRunning()) return;
	if(typeof time == "undefined") time = 150;
	animateFlipObject.init(poly, time);
	animateFlipObject.start();	
	
	//block left right flip, (X , Y) ==> (-X , Y)
	for(var i = 0 ; i < block.length; i++) {
		block[i].x = -block[i].x
	}
	blockNormalization(block); //external function
}

function leftRightFlipRunning()
{
	return animateFlipObject.isRunning();
}

//---------------------------------------
// 90 degree clockwise the focus polygon
//---------------------------------------
function rotateFocusPoly()
{
	//----------------------------------------------------------------------------------------
	// For (kineticJS 4.4.0)
	// previous version will reset degree to 0 if degree >= 360 in animateRotate90 function
	// but it can not work for kineticJS 4.4.0, so set here
	//----------------------------------------------------------------------------------------
	if(getLastFocusPoly().getRotationDeg() >= 360) { // >= 360 degree
		getLastFocusPoly().setRotation(0);
	}
	rotate90(getLastFocusPoly());

	//gBoardLayer.draw();
}

//-----------------------------------
// left-right flip the focus polygon
//-----------------------------------
function flipFocusPoly()
{
	leftRightFlip(getLastFocusPoly());
	////gBoardLayer.draw();
}

var rotateObject; //a rotate object, display on the focus polygon
var flipObject;   //a flip object, display on the focus polygon

//--------------------------------
// create flip & rotate operator
//--------------------------------
function createOperatorObject()
{
	var radius = (BLOCK_CELL_SIZE)/4;

	rotateObject = new Kinetic.Shape({
		drawFunc: function(canvas) {
			var context = canvas.getContext();
			//create a circle, opacity = 0.3 
			context.beginPath();
			context.arc(0, 0, radius, 0, 2.0 * Math.PI, false);
			context.fillStyle =OPERATOR_CIRCLE_COLOR;
			context.fill();
			canvas.fill(this); //for mouse selection

	
			//create a rotate arrow, opacity = 1.0 
			context.beginPath();
			context.globalAlpha=1.0	
			context.arc(0, 0, radius, 1.3 * Math.PI, 2.1 * Math.PI, false);
			context.lineTo(2*radius/3,-radius/3);
			context.lineTo(radius+radius/10,-radius/2.5);
			context.arc(0, 0, radius, 2.1 * Math.PI, 2.1 * Math.PI, true);
			context.arc(0, 0, radius, 2.1 * Math.PI, 1.3 * Math.PI, true);
			context.stroke();
			canvas.fillStroke(this);

			//create a rotate arrow, opacity = 1.0 
			context.beginPath();
			context.arc(0, 0, radius, 2.3 * Math.PI, 1.1 * Math.PI, false);
			context.lineTo(-2*radius/3,radius/3);
			context.lineTo(-radius-radius/10,+radius/2.5);
			context.lineTo(-radius,0);
			context.arc(0, 0, radius, 1.1 * Math.PI, 1.1 * Math.PI, true);
			context.arc(0, 0, radius, 1.1 * Math.PI, 2.3 * Math.PI, true);
			context.stroke();
			canvas.fillStroke(this);			
		
		},
		opacity: 0.3,
//		fill: OPERATOR_CIRCLE_COLOR,
		stroke: OPERATOR_COLOR, //blue
		strokeWidth: 2
	});	
		  

	// add cursor style
	rotateObject.on('mouseover', function() {
		document.body.style.cursor = 'pointer';
	});
		
	rotateObject.on('mouseout', function() {
		document.body.style.cursor = 'default';
	});
	
	rotateObject.on('click', function() {
		rotateFocusPoly();
	});

	//---------------------------------------------------------------
	
	flipObject = new Kinetic.Shape({
		drawFunc: function(canvas) {
			var context = canvas.getContext();
			//create a circle, opacity = 0.3 
			context.beginPath();
			context.arc(0, 0, radius, 0, 2.0 * Math.PI, false);
			context.fillStyle =OPERATOR_CIRCLE_COLOR;
			context.fill();
			canvas.fill(this); //for mouse selection

			
			//create a left arrow, opacity = 1.0 
			context.beginPath();
			context.globalAlpha=1.0	
			
			context.lineTo(radius/10,0);
			context.lineTo(4*radius/5,0);
			context.lineTo(4*radius/5,-radius/5);
			context.lineTo(radius+radius/5,0);
			context.lineTo(4*radius/5,radius/5);
			context.lineTo(4*radius/5,0);
			context.lineTo(radius/10,0);
			context.fill();
			canvas.fill(this);
			//context.stroke(context);
			canvas.fillStroke(this);
		
			//create a right arrow, opacity = 1.0 
			context.beginPath();
			context.lineTo(-radius/10,0);
			context.lineTo(-4*radius/5,0);
			context.lineTo(-4*radius/5,-radius/5);
			context.lineTo(-radius-radius/5,0);
			context.lineTo(-4*radius/5,+radius/5);
			context.lineTo(-4*radius/5,0);
			context.lineTo(-radius/10,0);
			context.fill();
			canvas.fill(this);
			//context.stroke(context);
			canvas.fillStroke(this);
		},
		opacity: 0.3,
//		fill: OPERATOR_CIRCLE_COLOR,
		stroke: OPERATOR_COLOR, //blue
		strokeWidth: 2
	});		

	// add cursor style
	flipObject.on('mouseover', function() {
		document.body.style.cursor = 'pointer';
	});
		
	flipObject.on('mouseout', function() {
		document.body.style.cursor = 'default';
	});

	flipObject.on('click', function() {
		flipFocusPoly();
	});
}

var rotateOperatorStatus = 0; //0: remove, 1:add
var flipOperatorStatus = 0; //0: remove, 1:add

//---------------------------------------------
// Add flip & rotate object to layer (kinetic)
//---------------------------------------------
function addOperator2Layer()
{
	gBoardLayer.add(rotateObject);
	gBoardLayer.add(flipObject);
	rotateObject.hide();
	flipObject.hide();
	rotateOperatorStatus = 0;
	flipOperatorStatus = 0;
}

function showOperatorObject(poly)
{
	var cx = poly.getPosition().x;
	var cy = poly.getPosition().y;

	if(poly.hasRotate) {
		rotateObject.show();
		rotateObject.setX(cx);
		rotateObject.setY(cy);
		rotateObject.moveToTop();
		rotateOperatorStatus = 1;
	}
	
	if(poly.hasFlip) {
		flipObject.show();
		flipObject.setX(cx);
		flipObject.setY(cy -(BLOCK_CELL_SIZE)*2/3);
		flipObject.moveToTop();
		flipOperatorStatus = 1;
	}
	gBoardLayer.draw();

}

//--------------------------------------------------
// Remove flip & rotate object from layer (kinetic)
//--------------------------------------------------
function hideOperatorObject()
{
	if(rotateOperatorStatus) {
		//gBoardLayer.remove(rotateObject);
		rotateObject.hide();
	}
	if(flipOperatorStatus) {
		//gBoardLayer.remove(flipObject);
		flipObject.hide();
	}
	rotateOperatorStatus = 0;
	flipOperatorStatus = 0;
}

*/

//-------------------------
// Set focus polygon style
//-------------------------
function setFocusPoly(poly)
{
	if(typeof poly == "undefined") return;
	
	poly.setStroke(FOCUS_BORDER_COLOR);
	poly.setStrokeWidth(2);
	poly.moveToTop();
	lastFocusPolyId = poly.polyId;
}

//----------------------------
// Set un-focus polygon style
//----------------------------
function clearFocusPoly(poly)
{
	if(typeof poly == "undefined") return;
	
	poly.setStroke(BLOCK_BORDER_COLOR);
	poly.setStrokeWidth(2);
	lastFocusPolyId = -1;
}

//----------------------------
// Set shadow
//----------------------------
function setShadow(poly)
{ 
	//poly.enableShadow();
	poly.setShadowColor('black');
	poly.setShadowBlur(5);
	poly.setShadowOffset([4, 4]);
	poly.setShadowOpacity(0.8);
}

//----------------------------
// clear shadow
//----------------------------
function clearShadow(poly)
{
	//poly.disableShadow();
	poly.setShadowColor('white');
	poly.setShadowBlur(0);
	poly.setShadowOffset([0, 0]);
	poly.setShadowOpacity(0);
}


var lastFocusPolyId = -1; //focus polygon block

function getLastFocusPoly()
{
	if (DEBUG)
	{
		console.log( 'lastFocusPolyId: ' + lastFocusPolyId);
		console.log( 'gPolyGroup:  \n' + mostrarPropiedades(gPolyGroup, "gPolyGroup" ) + '\n  ------------------------' );
	}

	if(lastFocusPolyId < 0) return; //return "undefined"
	
	return gPolyGroup[lastFocusPolyId].poly;
}







//-------------------------------------------------
//	funciones exclusivas para depuracion
//-------------------------------------------------
function mostrarPropiedades(objeto, nombreObjeto) {
	//	https://developer.mozilla.org/es/docs/Web/JavaScript/Guide/Trabajando_con_objectos

	var resultado = "";
	for (var i in objeto) {
		if (objeto.hasOwnProperty(i)) {
			resultado += nombreObjeto + "." + i + " = " + objeto[i] + "\n";
		}
	}
	return resultado;
}

//	function recorrerObjeto(obj)
//	{
//	    var respuesta="";
//	
//		for (const prop in obj) {
//		  console.log(obj.${prop} = ${obj[prop]} );
//		}
//	
//	    for (var i in obj)
//	    {
//	        respuesta += i + ": " + obj[i] + "\n";
//	    }
//	    return respuesta
//	}


function PantaDebug() {
	//	esta funcion solo para depuracion y experimentar

	var tablero,
		i = undefined,			//	para conteo usos varios
		aPosPolig = undefined,
		pzSprite, cImagen;


	evento = new Text( "Accion realizada: ", { fontFamily: "Sriracha",	fontSize: "20px", fill: "#a00"  } );
	evento.position.set(400, 20 );
	EscenaDebug.addChild(evento);


	// creacion de un sprite draggable
	i = 3;	//	for ( i = 0; i < LISTA_CUADROM.length; i++)
	//	{
		cImagen = LISTA_CUADROM[i];
		pzTexture = PIXI.utils.TextureCache[cImagen];
		pzSprite = new PIXI.Sprite(pzTexture);

		pzSprite.nombre = cImagen;

		pzSprite.interactive = true;
		//	draggableObjects.addChild(pzSprite);    

		// this button mode will mean the hand cursor appears when you roll over the pzSprite with your mouse
		pzSprite.buttonMode = true;

		// center the pzSprite's anchor point
		//	pzSprite.anchor.set(0.5);
		pzSprite.anchor.set(0.5);

		// make it a bit bigger, so it's easier to grab
		pzSprite.scale.set(1.0);


		// setup events
		//	Para ver el tratamiento a dar a los diferentes eventos de mouse, teclado y touch 
		//	en la function activePolygon() de wpentomino.puzzle.js, linea 1529

		// add cursor style
		pzSprite.on('mouseover', function() {
			evento.text = "               ";
			evento.text = "Accion realizada: mouseover";
		});
	

		pzSprite.on('mousedown', function() {
			evento.text = "        Accion realizada: mousedown";
		});
	
		pzSprite.on('mouseup', function() {
			evento.text = "Accion realizada: mouseup                ";
		});
	
		pzSprite.on('mousemove', function() {
			evento.text = "Accion realizada: mousemove             ";
		});
	
		pzSprite.on('click', function() {
			evento.text = "     Accion realizada: click         ";
		});
	
		pzSprite.on('dblclick', function() {
			evento.text = "      Accion realizada: mousedown          ";
		});
	
		pzSprite.on('mouseover', function() {
			evento.text = "Accion realizada: mouseover";
		});
	
		pzSprite.on('mouseout', function() {
			evento.text = "Accion realizada: mouseout";
		});
	
		pzSprite.on('mouseenter', function() {
			evento.text = "Accion realizada: mouseenter";
		});
	
		pzSprite.on('mouseleave', function() {
			evento.text = "Accion realizada: mouseleave";
		});
	
		pzSprite.on('contextmenu', function() {
			evento.text = "Accion realizada: contextmenu";
		});
	
		//	add draggable objects to container
		EscenaDebug.addChild(pzSprite);

		// add it to the EscenarioGral
		//	EscenarioGral.addChild(pzSprite);
		
		arrPzDebug[i] = pzSprite;
		arrPzDebug[i].id = cImagen.slice(5, 7);		//	el atributo id identifica la pieza
		
	//	}

	//	posicionar los sprites de cuadrominos
	//	for ( i = 0; i < arrPzDebug.length; i++)
	//	{
		//	formula para calcular posicion de estacionamiento
		arrPzDebug[i].x = LIMITE_TABLERO + 100 ;
		//	arrPiezas[i].y = i * 50 ;
		arrPzDebug[i].y = 150 + i * 50 ;
	//	}


}



function BotonDebug() {
	console.log("BotonDebug	-------------------------------------------");

//	definir cuales son las escenas visibles y cuales invisibles
	EscenaDeJuego.visible = false;
	EscenaFinJuego.visible = false;
	EscenaMenuInic.visible = false;
	EscenarioGral.visible = true;

	BotonJugar.y = LINEA_BOTONES_OFF;
	BotonAtras.y = LINEA_BOTONES;

	BotonAtras.visible = true;
	BotonAtras.disabled=false;

	state = PantaDebug;

}


//---------------------------------------------------

function onPointerDown() {
	console.log( 'onPointerDown --> this.isdown - this.id: ' + this.isdown + ' - ' + this.id);
	//	console.log( 'this: ' + this );
	//	console.log( '   pzActual: ' + pzActual );
	pzActual.id = this.id;
	pzActual.enUso = true;	
	this.data = event.data;
	this.alpha = 0.5;
	this.dragging = true;
	//	} else {
	//		this.isdown = true;
	//		this.alpha = 0.5;
	//		//	this.texture = textureButtonDown;
	//		console.log( 'onPointerDown 2da pasada --------------------' );
	//		this.alpha = 0.3;
	//	}
	//	pzActual.id = this.id;

	if (this.isdown)
	{
	}

}

function onPointerUp() {
    //	this.isdown = false;
	//	console.log( 'onPointerUp --------------------' );
	console.log( 'pzActual = : ' + pzActual );
	//	console.log( 'pzActual != " " : ' + (pzActual != " ") );
	//	console.log( 'pzActual == " " : ' + pzActual == " " );
	//	console.log( 'pzActual === " " : ' + pzActual === " " );

	//	pzActual.enUso	
	//	if (!pzActual.enUso)
	//	{
	this.isdown = false;
	//	}
    //	if (this.isOver) {
	//		//	aqui se puede cambiar la apariencia
    //	    //	this.texture = textureButtonOver;
    //	}
    //	else {
	//	aqui se puede cambiar la apariencia
	//	this.texture = textureButton;
    //	}
}

function onPointerOver() {
	//	no uso esta funcion para las piezas. Para los botones ???

    //	this.isOver = true;
	//	console.log( 'onPointerOver ---- this.isdown:' + this.isdown );
    //	if (this.isdown) {
    //	    return;
    //	}
	//	aqui se puede cambiar la apariencia
    //	this.texture = textureButtonOver;
}

function onPointerOut() {
    //	this.isOver = false;
	//	console.log( 'onPointerOut --------------------' );
    //	if (this.isdown) {
    //	    return;
    //	}
	//	aqui se puede cambiar la apariencia
    //	this.texture = textureButton;
}





function onPointerMove(event)
{
	this.data = event.data;

	if (DEBUG)
	{
		var oEventTarget = event.target;
		console.log( "inicio onPointerMove ----------------------------" );
		console.log( "this.dragging: " +  this.dragging );
		//	console.log( 'objeto event:  \n' + recorrerObjeto( event ) + '------------------------' );
	}


	if (this.dragging)
    {
		var newPosition = this.data.getLocalPosition(this.parent);
		/////////////////////////////////////////////////////

        this.position.x = newPosition.x;
        this.position.y = newPosition.y;

		//	this.position.x += e.data.originalEvent.movementX;
		//	this.position.y += e.data.originalEvent.movementY;

 		if (DEBUG) {
			console.log("newPosition - this.position: " + newPosition.x + ", " + newPosition.y + ", " + this.position.x + ", " + this.position.y );
		}


    }

	this.alpha = 1;
    this.dragging = false;
    // set the interaction data to null
    this.data = null;

}


//--------------------------------------------------------------------
//reemplazo de anteriores controles de puntero


function onDragEnd()
{
	//	this sería el sprite con numero a posicionar
	var lNumOK = false,
		newXpos = undefined,	//	coord X de talero
		newYpos = undefined,
		i = undefined;			//	indica numero bien ubicado

	console.log( "onDragEnd() -------------------" );

    if (this.dragging)
    {
        var newPosition = this.data.getLocalPosition(this.parent);
		//	this.parent es el puntero del mouse
		//	newPosition toma las coordenadas del puntero del mouse

		//	console.log("newPosition: " + newPosition.x + ', ' + newPosition.y );

		//	debo detectar si estoy en el area del tablero o area de estacionamiento de fichas
		//	ficha es un sprite asociado a un número a colocar en tablero.
		//	console.log( "Iniciando onDragEnd() puntero en : " + newPosition.x.toString().substr(0,8) +','+ newPosition.y.toString().substr(0,8) );
		//	console.log( "this.num: " + this.num)

		//	var delta_X = newPosition.x - this.position.x;
		//	var delta_Y = newPosition.y - this.position.y;
		//	this.position.x = newPosition.x + delta_X;
		//	this.position.y = newPosition.y + delta_Y;

		this.position.x = newPosition.x;
        this.position.y = newPosition.y;



		//	Estamos en el tablero o afuera?
		if ( this.position.x < 0 || this.position.x > LIMITE_TABLERO || this.position.y < 0 || this.position.y > LIMITE_TABLERO )
		{
			//	estamos afuera del tablero. va al estacionamiento.
			console.log( "afuera del tablero!.  pieza va al estacionamiento")	
			lNumOK = false;
		} else { 
			//	dentro del tablero
			//	determinar en que celda debe caer la pieza
			newXpos = Math.floor( ( newPosition.x - boardStartX ) / BLOCK_CELL_SIZE );
			newYpos = Math.floor( ( newPosition.y - boardStartY ) / BLOCK_CELL_SIZE ) ;

			//	aTablero = { newXpos, newYpos};
			//	verificar que la pieza quede integramente dentro del tablero y
			//	que no tenga superposición con otra pieza ya colocada
			//	Para eso hay determinar cuales son las celdas que ocupará y si esas celdas estan libres
			//	A la posicion de origen habra que adicionar la posicion relativa de las celdas del pentomino

			//	ver function insertBlockToBoard(board, boardX, boardY, block, curPos, value)
			//	linea 157 de polysolution.js

			//	si todo bien
			lNumOK = true;
		}

		console.log("this.num: " + this.num );

		if ( !lNumOK )		//	afuera del tablero
		{
			//	formula para calcular posicion de estacionamiento
			//	newPosition.x = LIMITE_TABLERO + 50 + ( 2 - ( 2 + this.num )  % 3 ) * 60 ;
			//	newPosition.y = this.num * 50 ;

			estacionaPz( this.num );

		}
		this.position.x = newPosition.x;
        this.position.y = newPosition.y;
    }
	this.alpha = 1;

	//	revisar la linea que sigue; solo par testear
	this.dragging = false;

    // set the interaction data to null
    this.data = null;

	//	anula la indicacion de poliomino seleccionado
	//	seleccionActual = undefined; 

}



function onDragMove()
{
	console.log( "onDragMove() -------------------" );

    if (this.dragging)
    {
        var newPosition = this.data.getLocalPosition(this.parent);
		//	this.parent es el puntero del mouse. newPosition toma sus coordenadas ???

		//	var delta_X = newPosition.x - this.position.x;
		//	var delta_Y = newPosition.y - this.position.y;
        //	this.position.x = newPosition.x + delta_X;
        //	this.position.y = newPosition.y + delta_Y;

		this.position.x = newPosition.x;
        this.position.y = newPosition.y;

    }
}



function Girar() {
	//	gira la pieza seleccionada
	//	this es el boton girar
	//	this.rotation = 0.6; gira el boton

	//	hay que detectar la pieza seleccionada para aplicarle el giro
	arrPiezas[seleccionActual].rotation += Math.PI / 4
	console.log('En girar, pieza seleccionada: ' + seleccionActual );
	console.log( 'rotation: ' + arrPiezas[seleccionActual].rotation );

}




function onDragStart(event)
{
    // store a reference to the data
    // the reason for this is because of multitouch
    // we want to track the movement of this particular touch
    this.data = event.data;
    this.alpha = 0.5;

	/////////////////////////////
	//	debug
	console.log( "onDragStart / this.data: " + this.id );

	//	eventualmente verificar que no sea el cuadromino fijo
    this.dragging = true;

	var newPosition = this.data.getLocalPosition(this.parent);	//	posicion puntero del mouse

	this.position.x = newPosition.x;
	this.position.y = newPosition.y;

	//	dejar seleccionado este poliomino. Debe ser deseleccionado en dragend
	seleccionActual = this.num;

	if (DEBUG)
	{
		//	console.log( 'this.parent: ' + this.parent);
		//	console.log( 'newPosition: ' + newPosition.x + ',' + newPosition.y );
		//	console.log( 'this.dragging: '  + this.dragging );
		console.log( 'seleccionActual: ' + seleccionActual );
		console.log( '------------------' );

	}

}


function estacionaPz( quien ) {
	//	quien trae el nro de pieza 
	//	console.log( "quien: " + quien );
	
	//	formula para calcular posicion de estacionamiento
	arrPiezas[quien].x = LIMITE_TABLERO + 120 + ( quien  % 3 ) * 130 + quien * 5;
	arrPiezas[quien].y = 130 + Math.floor( quien / 3) * 130 ;

};


function onMousedown()		{	console.log('mousedown'		)};
function onTouchstart()		{	console.log('touchstart'	)}; 
function onMouseup()		{	console.log('mouseup'		)}; 
function onMouseupoutside() {	console.log('mouseupoutside')}; 
function onTouchend()		{	console.log('touchend'		)}; 
function onTouchendoutside(){	console.log('touchendoutside'	)}; 
function onMousemove()		{	console.log('mousemove'		)}; 
function onTouchmove()		{	console.log('touchmove'		)}; 



function onClick() {
	//	cambiar aspecto del poliomino para hacer saber que esta seleccionado
	//	habilitar botones para giro y volteo de la pieza seleccionada

	if (DEBUG)	{
		console.log( "inicio onClick() / seleccionActual: " + seleccionActual );
	}

    this.data = event.data;
	this.alpha = 0.3;

	if (seleccionActual == undefined)
	{
		seleccionActual = this.num;
		this.alpha = 0.3;
	} else {
		this.alpha = 1;
		seleccionActual = undefined;
	}
	
	console.log( 'saliendo de onClick: seleccionActual: ' + seleccionActual )

}


function onMouseUp() {
	//	this sería el sprite con numero a posicionar
	var lNumOK = false,
		i = undefined;			//	indica numero bien ubicado

	console.log( "onMouseUp() -------------------" );

    if (this.dragging)
    {
        var newPosition = this.data.getLocalPosition(this.parent);
		this.position.x = newPosition.x;
        this.position.y = newPosition.y;

		console.log("this.num: " + this.num );

    }

	//	this.alpha = 1;

	//	revisar la linea que sigue; solo par testear
	this.dragging = false;

    // set the interaction data to null
    //	this.data = null;

	//	anula la indicacion de poliomino seleccionado
	//	seleccionActual = undefined; 

}


