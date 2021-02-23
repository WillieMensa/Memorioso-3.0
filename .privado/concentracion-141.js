/*
	concentracion.js

	17/12/2018 - hay que detectar cuando se dieron vuelta todoslas baldosas

*/

//	-------------------------
//	equivalencias - Aliases
//	-------------------------
let Container = PIXI.Container,
	autoDetectRenderer = PIXI.autoDetectRenderer,
	Graphics = PIXI.Graphics,
	Sprite = PIXI.Sprite,
	AnimatedSprite = PIXI.extras.AnimatedSprite,
	TilingSprite = PIXI.extras.TilingSprite,
	loader = PIXI.loader,
	resources = PIXI.loader.resources,
	Text = PIXI.Text;



//	-------------------------
//	Constantes
//	-------------------------
var	FILA_BOTONES = 50,
	LINEA_BOTONES = 470,
	RENDERER_W = 1000,
	RENDERER_H = 600,
	FONDO_JUEGO = 0xecffb3,		//	 "#ffc",
	VERSION	= "1.4.1",			//	version inicial
	FONDO_AYUDA = 0x008cff,
	FONT_NIVEL1 = "Titan One",
	//	font-family: 'Luckiest Guy', cursive;
	FONT_NIVEL2 = "Titan One",
	//	DEBUG = false;
	DEBUG = true;



//	Create a Pixi (stage and) renderer
//	let	stage = new Container(),
let rendererOptions = {
	antialiasing: false,
	transparent: false,
	resolution: window.devicePixelRatio,
	autoResize: true,
	backgroundColor: FONDO_JUEGO,
	//	backgroundColor: linear-gradient( to bottom right, #eeff88, #33bb22 ),

}

//	Create the renderer
let renderer = autoDetectRenderer( RENDERER_W, RENDERER_H, rendererOptions );

// Put the renderer on screen in the corner
renderer.view.style.position = "absolute";
renderer.view.style.top = "0px";
renderer.view.style.left = "0px";

document.body.appendChild(renderer.view);

//Scale the canvas to the maximum window size
//	let scale = scaleToWindow(renderer.view);

//Set the initial game state
let state = Menu;
let myReq = undefined;


//	-------------------------
//	variables globales varias. might be used in more than one function
//	-------------------------
let	BotonAtras = undefined,
	BotonAyuda = undefined,
	BotonJugar = undefined,
	BotonAcercaDe = undefined,
	BotonMenu = undefined,
	BotonDificultad = undefined,
	Crono = undefined,
	start = undefined,
	elapsed = undefined,
	EscenaDeAyudas = undefined,			//	container ayudas
	EscenaDeJuego = undefined,			//	container juego
	EscenaAcercaDe = undefined,			//	container de estadisticas
	EscenaFinJuego = undefined,			//	container aviso de fin del juego
	EscenaMenuInic = undefined,			//	container pantalla de inicio
	EscenaDificultad = undefined,		//	container seleccion nivel de dificultad
	EscenarioGral = undefined			//	container del total (1er nivel)


//	variables especificas de esta aplicacion
let firstTile=null,						// primera pieza elegida por el jugador			
	secondTile=null,					// segunda pieza elegida por el jugador			
	canPick=true,						// puede el jugador elegir una pieza?
	nCol = undefined,					//	cantidad de columnas de baldositas en tablero
	nFil = undefined,					//	cantidad de filas de baldositas en tablero
	nivJuego = -1,						//	nivel de juego; debe ser un valor entre 0 y 13
	tilesOnBoard = undefined, 
	chosenTiles = undefined;			//	array con los numeros de las piezas

const	estiloTxtBoton = new PIXI.TextStyle({	//	estilo comun a los botones con texto
		fill: 0x008800,
		//	fontFamily: FONT_NIVEL2,
	    fontFamily: "Sigmar One",		//   fontFamily: "Arial",
		fontStyle: 'italic',
		fontWeight: 'bold',
		fill: ['#ffffff', '#008800'], // gradient
		fontSize: 24,
		padding: 4,
		stroke: '#4a1850',
		strokeThickness: 5,
		dropShadow: true,
		dropShadowColor: '#000000',
		dropShadowBlur: 4,
		dropShadowAngle: Math.PI / 6,
		dropShadowDistance: 6,

	});



const	aNivDif = [
		{ niv:0, nCol:4, nFil:2 },			//	8
		{ niv:1, nCol:5, nFil:2 },			//	10
		{ niv:2, nCol:4, nFil:3 },			//	12
		{ niv:3, nCol:7, nFil:2 },			//	14
		{ niv:4, nCol:4, nFil:4 },			//	16
		{ niv:5, nCol:9, nFil:2 },			//	18
		{ niv:6, nCol:5, nFil:4 },			//	20
		{ niv:7, nCol:8, nFil:3 },			//	24
		{ niv:8, nCol:7, nFil:4 },			//	28
		{ niv:9, nCol:6, nFil:5 },			//	30
		{ niv:10, nCol:8, nFil:4 },			//	32
		{ niv:11, nCol:6, nFil:6 },			//	36
		{ niv:12, nCol:8, nFil:5 },			//	40
		{ niv:13, nCol:8, nFil:6 },			//	48
		{ niv:14, nCol:9, nFil:6 }			//	54
	]


//	======================================================================
//	Seccion experimental para cargar fonts con webfontloader
var fonts_ready = false;
var assets_ready = false;

WebFont.load({
	google: {
		families: [ 'Bangers', 'Titan One', 'Sigmar One', 'Sriracha' ]
	},
	active: function() {
		fonts_ready = true;
        preloaderCheck();
    }
  });

/*
setTimeout(function()
{
    init();
}, 10);
*/

//load resources
loader
	.add("memorioso2.json")		//	PIXI.loader.add("assets/spritesheet.json").load(setup);
	.load(function() {
		assets_ready = true;
		preloaderCheck();
    });
	//	.load(loader, resources)
	//	.load(setup);


//	PIXI.loader
//	    .add("image1","img/image1.png")
//	    .load(function() {
//	        assets_ready = true;
//	        preloaderCheck();
//	    });

function preloaderCheck() {
	if (fonts_ready && assets_ready)
		setup();
}

//	======================================================================
function setup() {

	if (DEBUG)
	{
		console.log("window.innerWidth,innerHeigh: " + window.innerWidth + ", " + window.innerHeight );
	}

	//Get a reference to the texture atlas id's
	//	Create an alias for the texture atlas frame ids
	id = resources["memorioso2.json"].textures;

	/* Create the sprites */

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

	//Create the EscenaFinJuego
	EscenaFinJuego = new PIXI.Container();
	EscenarioGral.addChild(EscenaFinJuego);

	//	Crear escenario de ayudas
	EscenaDeAyudas = new PIXI.Container();
	EscenarioGral.addChild(EscenaDeAyudas);

	//	Crear escenario de estadisticas
	EscenaAcercaDe = new PIXI.Container();
	EscenarioGral.addChild(EscenaAcercaDe);

	//	Crear escenario seleccion dificultad
	EscenaDificultad = new PIXI.Container();
	EscenarioGral.addChild(EscenaDificultad);

	//	prepara los botones de la aplicacion
	HaceBotones()

	//	Prepara las diferentes pantallas / escenas.
	PantallaInicio();
	PantallaAyuda();
	PantallaJugar();
	PantallaAcercaDe();
	PantallaFinJuego();
	PantallaDificultad();

	//	Set the initial game state
	//	state = play;
	state = Menu;

	//	Una grilla para ubicarnos en el canvas
	if (DEBUG) 
	{
		DibujaGrilla()
	}


	resize();		//	para refresca la pagina

	if (DEBUG)
	{
		console.log("Pantalla: " + EscenarioGral.width + ", " + EscenarioGral.height );
	}

	//Start the game loop
	gameLoop();
}



function gameLoop(){

	//Loop this function 60 times per second
	myReq = requestAnimationFrame(gameLoop);

	//Run the current state
	state();

	//Render the EscenarioGral
	renderer.render(EscenarioGral);

}




function resize() {

   // Determine which screen dimension is most constrained
  var ratio = Math.min(window.innerWidth/RENDERER_W,
                   window.innerHeight/RENDERER_H);

  // Scale the view appropriately to fill that dimension
  //	EscenarioGral.scale.x = EscenarioGral.scale.y = ratio;
  EscenarioGral.scale.x = EscenarioGral.scale.y = 0.8 * ratio;

  // Update the renderer dimensions
  renderer.resize(Math.ceil(RENDERER_W * ratio),
                  Math.ceil(RENDERER_H * ratio));
}



function PantallaInicio() {
	EscenaMenuInic.visible = true;

	const style = new PIXI.TextStyle({
		fill: "#040",					    //	fontFamily: FONT_NIVEL1,		//	    fontFamily: "Comic Sans MS",
	    fontFamily: 'Titan One',			//	cursive;
		fontSize: 96,
		fontWeight: "bold",
		padding: 8,
	});

	//	titulo del menu y juego
	var	txtTitulo = new PIXI.Text( "MEMORIOSO", style );

	//	txtTitulo.x = 600;
	txtTitulo.x = 200+ ( RENDERER_W - 200 ) / 2;
	//	txtTitulo.x = window.innerWidth / 2 ;
	txtTitulo.y = 200;			//	(RENDERER_H / 2);
	txtTitulo.anchor.set(0.5);
	//	txtTitulo.rotation = -0.2;

	EscenaMenuInic.addChild(txtTitulo);

	var count = 0;
	PIXI.ticker.shared.add(function() {
		count += 0.03;
		txtTitulo.rotation = ( -0.0 + Math.cos(count) * 0.2);
		//	txtTitulo.y = ( 200 + Math.cos(count) * 100.2);
	});


	//	aqui habria que agregar el boton para eventual cambio de nivel
	EscenaMenuInic.addChild(BotonDificultad);

	if (DEBUG)	{
		console.log("largo texto: " + txtTitulo.width );
		console.log("RENDERER_W: " + RENDERER_W );
		console.log("RENDERER_W - txtTitulo.width ) / 2: " + (RENDERER_W - txtTitulo.width ) / 2 );
		console.log("window.innerWidth: " + window.innerWidth );
	}

}



function HaceBotones() {
	//	prepara los botones; que en realidad son textos botonizados
	//	console.log("haciendo los botones");

	var BotonTexture;

	//	-------------------------------------------------------------	
	//	ESTILO COMUN A TODOS LOS BOTONES-TEXTO
	const style = new PIXI.TextStyle({
		fillGradientStops: [ 0,100 ],
		fill: 0x006600,
		fontFamily: "Bangers",
		fontSize: 32,
		//	fontStyle: "italic",
		fontWeight: "bold",
		padding: 8,
	});

	//	-------------------------------------------------------------	
	//	Preparacion del boton jugar
	BotonJugar = new PIXI.Text('Jugar', style);
	BotonJugar.anchor.set(0.0);
	BotonJugar.x = FILA_BOTONES;						// Set the initial position
	BotonJugar.y = 100;
	// Opt-in to interactivity
	BotonJugar.interactive = true;				
	BotonJugar.buttonMode = true;			// Shows hand cursor
	// Pointers normalize touch and mouse
	BotonJugar.on('pointerdown', Jugar );
	BotonJugar.on('click', Jugar ); // mouse-only
	BotonJugar.on('tap', Jugar ); // touch-only

	//	-------------------------------------------------------------
	//	Preparacion del boton AcercaDe
	BotonAcercaDe = new PIXI.Text('Acerca de', style);
	// Set the initial position
	BotonAcercaDe.anchor.set(0.0);
	BotonAcercaDe.x = FILA_BOTONES;							// Set the initial position
	BotonAcercaDe.y = 200;
	// Opt-in to interactivity
	BotonAcercaDe.interactive = true;
	BotonAcercaDe.buttonMode = true;				// Shows hand cursor
	// Pointers normalize touch and mouse
	BotonAcercaDe.on('pointerdown', AcercaDe );
	BotonAcercaDe.on('click',		 AcercaDe ); // mouse-only
	BotonAcercaDe.on('tap',		 AcercaDe ); // touch-only

	//	-------------------------------------------------------------
	//	Preparacion boton de ayudas
	BotonAyuda = new PIXI.Text('Ayuda', style);
	BotonAyuda.anchor.set(0.0);
	BotonAyuda.x = FILA_BOTONES;					// Set the initial position
	BotonAyuda.y = 300;
	// Opt-in to interactivity
	BotonAyuda.interactive = true;
	BotonAyuda.buttonMode = true;				// Shows hand cursor
	// Pointers normalize touch and mouse
	BotonAyuda.on('pointerdown', Ayuda );
	BotonAyuda.on('click', Ayuda ); // mouse-only
	BotonAyuda.on('tap', Ayuda ); // touch-only
	
	//	-------------------------------------------------------------
	//	Preparacion boton volver a inicio
	
	BotonAtras = new PIXI.Text('Volver', style);
	BotonAtras.anchor.set(0.0);
	BotonAtras.x = FILA_BOTONES;								// Set the initial position
	BotonAtras.y = 450;	
	BotonAtras.interactive = true;					// Opt-in to interactivity
	BotonAtras.buttonMode = true;					// Shows hand cursor
	// Pointers normalize touch and mouse
	BotonAtras.on('pointerdown', Menu );
	BotonAtras.on('click', Menu );
	BotonAtras.on('tap', Menu );
	
	
	//	-------------------------------------------------------------
	//	Preparacion otro botonMenu
	BotonMenu = new PIXI.Text('Volver', style);
	BotonMenu.anchor.set(0.0);
	BotonMenu.x = FILA_BOTONES;								// Set the initial position
	BotonMenu.y = 450;	
	BotonMenu.interactive = true;					// Opt-in to interactivity
	BotonMenu.buttonMode = true;					// Shows hand cursor
	// Pointers normalize touch and mouse
	BotonMenu.on('pointerdown', Menu );
	BotonMenu.on('click', Menu );
	BotonMenu.on('tap', Menu );
	
	//	-------------------------------------------------------------
	//	Preparacion BotonDificultad
	BotonDificultad = new PIXI.Text('Dificultad', style);
	BotonDificultad.anchor.set(0.0);
	BotonDificultad.x = FILA_BOTONES;								// Set the initial position
	BotonDificultad.y = 420;	
	BotonDificultad.interactive = true;					// Opt-in to interactivity
	BotonDificultad.buttonMode = true;					// Shows hand cursor
	// Pointers normalize touch and mouse
	BotonDificultad.on('pointerdown', Dificultad );
	BotonDificultad.on('click', Dificultad );
	BotonDificultad.on('tap', Dificultad );

	/*
	BotonDificultad.pointerdown = BotonDificultad.touchstart = function(data){
		// show the tile
		this.tint = 0x888888;
		this.alpha = 0.5;

		// wait a second then remove the tiles and make the player able to pick again
		setTimeout(function(){
			//	mostrar opciones de nivel
			EscenaDificultad.visible = true;
		},1000);
	}
	*/

	if (DEBUG)
	{
		console.log(" mousedown: " );
	}
			
}




function PantallaAyuda() {
	var graphics = new PIXI.Graphics();
	// draw a rounded rectangle
	graphics.lineStyle(4, 0x332211, 0.95)
	graphics.beginFill( FONDO_AYUDA, 0.95);
	graphics.drawRoundedRect(40, 40, RENDERER_W-80, RENDERER_H-200 );
	graphics.endFill();

	EscenaDeAyudas.addChild(graphics);

	const style = new PIXI.TextStyle({
		fill: "#ffffff",
		fontFamily: "Sriracha",
		fontSize: 24,
		fontStyle: "italic",
		fontWeight: "bold"
	});
	const richText = new PIXI.Text('Que es?\n' +
		'MEMORIOSO es un juego de concentracion y memoria.\n' + 
		'En que consiste?\n' + 
		'Hay un cojunto de fichas o cartas, cada una con una imagen, \n' + 
		'colocadas de forma tal que no se ve su anverso.\n' + 
		'Hay dos fichas de cada imagen. El juego consiste en encontrar\n' +
		'las parejas de imágenes iguales.\n' + 
		'Al pulsar sobre una imagen, esta se da vuelta.\n' + 
		'Se eligen dos fichas consecutivas. Si resultan ser iguales se\n' +
		'retiran del tablero. Si son diferentes vuelven a la posicion original.\n' + 
		'El juego finaliza cuando se han encontrado todas las parejas.', 
		style );

	richText.x = 60;
	richText.y = 60;

	EscenaDeAyudas.addChild(richText);
	EscenaDeAyudas.visible = true;

	//	Botones que se deben visualizar en pantalla de ayuda
	//	unicamente el de volver, entonces, remueve borones del padre y muestra el de ayuda

	//	BotonAcercaDe.visible = false;

	//	EscenaDeAyudas.addChild(BotonMenu);
	//	BotonMenu.visible = true;

}



function Menu() {
	//	definir cuales son las escenas visibles y cuales invisibles
	EscenaDeAyudas.visible = false;		//	container ayudas
	EscenaDeJuego.visible = false;
	EscenaAcercaDe.visible = false;		//	container estadisticas
	EscenaFinJuego.visible = false;		//	container aviso de fin del juego
	EscenaMenuInic.visible = true;		//	container pantalla de inicio
	EscenarioGral.visible = true;		//	container del juego
	EscenaDificultad.visible = false;	//	seleccion nivel dificultad

	//	BotonAyuda
	EscenaMenuInic.addChild(BotonAyuda);
	BotonAyuda.visible = true;
	BotonAyuda.alpha=1;

	//	BotonAcercaDe
	EscenaMenuInic.addChild(BotonAcercaDe);
	BotonAcercaDe.visible = true;

	//	BotonMenu.visible = true;

	//	BotonSalir
	//	EscenaMenuInic.addChild(BotonSalir);
	//	BotonSalir.visible =true;

	//	BotonJugar
	EscenaMenuInic.addChild(BotonJugar);
	BotonJugar.visible =true;
	BotonJugar.alpha=1;


	state = Menu;

}




function AcercaDe() {

//	definir cuales son las escenas visibles y cuales invisibles
	EscenaDeAyudas.visible = false;
	EscenaDeJuego.visible = false;
	EscenaAcercaDe.visible = true;
	EscenaFinJuego.visible = false;
	EscenaMenuInic.visible = false;
	EscenarioGral.visible = true;
	EscenaDificultad.visible = false;	//	seleccion nivel dificultad

	EscenaAcercaDe.addChild(BotonMenu);
	BotonMenu.visible = true;

	state = AcercaDe;

}




function Ayuda() {
//	definir cuales son las escenas visibles y cuales invisibles
	EscenaDeAyudas.visible = true;
	EscenaDeJuego.visible = false;
	EscenaAcercaDe.visible = false;
	EscenaFinJuego.visible = false;
	EscenaMenuInic.visible = false;
	EscenarioGral.visible = true;
	EscenaDificultad.visible = false;	//	seleccion nivel dificultad

	//	BotonJugar.y = LINEA_BOTONES_OFF;
	//	BotonAyuda.y = LINEA_BOTONES_OFF;		//	durante el juego mantenemos el boton de ayuda
	//	BotonAcercaDe.y = LINEA_BOTONES_OFF;
	//	BotonAtras.y = LINEA_BOTONES;

	EscenaDeAyudas.addChild(BotonAtras);
	BotonAtras.visible = true;

	state = Ayuda;

}


////////////////////////////////////////////////////////////////////////////////////////
//	solamente para depurar
function DibujaGrilla() {

	var posX=50, posY=50;
	var line = new PIXI.Graphics();
	//	var rectang = new PIXI.Graphics();

	line.lineStyle(1, "#bbbbbbb", 0.5 )

	//	lineas horizontales
	while (posY<RENDERER_H)
	{
		line.moveTo(0, posY);
		line.lineTo(RENDERER_W, posY);
		//	line.x = 0;
		//	line.y = ( 50 * i ) + 25 ;
		EscenarioGral.addChild(line);

		posY = posY+50;
	}

	//	lineas verticales
	while (posX<RENDERER_W)
	{
		line.moveTo(posX, 0);
		line.lineTo(posX, RENDERER_H);
		//	line.x = ( 50 * i ) + 25;
		//	line.y = 0;
		EscenarioGral.addChild(line);

		posX = posX+50;
	}

}




function end() {
	//	definir cuales son las escenas visibles y cuales invisibles

	if (DEBUG) {
		//	console.log("chosenTiles.length: " + chosenTiles.length );
		console.log("=== function end ===" );
	}

	EscenaDeAyudas.visible = false;		//	container ayudas
	EscenaDeJuego.visible = true;
	EscenaAcercaDe.visible = false;		//	container estadisticas
	EscenaFinJuego.visible = true;		//	container aviso de fin del juego
	EscenaMenuInic.visible = false;		//	container pantalla de inicio
	EscenarioGral.visible = true;		//	container del juego
	EscenaDificultad.visible = false;	//	seleccion nivel dificultad

	EscenaDeJuego.alpha = 0.8 ;

	//	BotonJugar
	EscenaFinJuego.addChild(BotonJugar);
	BotonJugar.visible =true;
	BotonJugar.alpha=1;

	EscenaFinJuego.addChild(BotonMenu);

	//	BotonAyuda.visible = true;
	//	BotonAcercaDe.visible = true;

	state = end;
	
}






//	-------------------------------------------------------
//	Funciones comunes a todas las aplicaciones con código especifico para la app
//	-------------------------------------------------------

function PantallaAcercaDe() {
	var graphics = new PIXI.Graphics();
	// draw a rounded rectangle
	graphics.lineStyle(4, 0x332211, 0.95)
	graphics.beginFill( FONDO_AYUDA, 0.95);
	graphics.drawRoundedRect(40, 40, RENDERER_W-80, RENDERER_H-200 );
	graphics.endFill();

	EscenaAcercaDe.addChild(graphics);

	const style = new PIXI.TextStyle({
		fill: "white",
		fontStyle: "italic",
		fontFamily: "Sriracha",
		fontSize: 32,
		fontWeight: "bold"
	});
	const richText = new PIXI.Text('Acerca de MEMORIOSO version ' + VERSION + '\n' +
		'Es un juego para ejercitar concentracion y memoria \n' +
		'desarrollado por Willie Verger Juegos de Ingenio\n\n' +
		'Soporte: info@ingverger.com.ar\n' +
		'Web: ingverger.com.ar\n' +
		'\n', style);
	richText.x = 60;
	richText.y = 60;
	EscenaAcercaDe.addChild(richText);

	EscenaAcercaDe.visible = true;

	BotonAyuda.visible = false;
	BotonAcercaDe.visible = false;

	EscenaAcercaDe.addChild(BotonMenu);
	BotonMenu.visible = true;
	//	BotonSalir.visible =false;

}



function PantallaDificultad() {

	//	presentar las opciones de niveles de dificultad para elegir 
	//	y establecer cantidad de filas y columnas

	var	miBoton = undefined;

	//	definir cuales son las escenas visibles y cuales invisibles
	EscenaDeAyudas.visible = false;
	EscenaDeJuego.visible = false;
	EscenaAcercaDe.visible = false;
	EscenaFinJuego.visible = false;
	EscenaMenuInic.visible = false;
	EscenaDificultad.visible = true;


	miBoton = botonDeTexto( "Nivel: " + aNivDif[0].niv + " -> " + aNivDif[0].nCol + " columnas x " + aNivDif[0].nFil + " filas", 
			540, 050, 200, 36 );
	miBoton.on('pointerdown', nivel0 );
	miBoton.on('click', nivel0 ); // mouse-only
	miBoton.on('tap',	nivel0 ); // touch-only


	//	usar un loop for ...
	//	for (var i = 0; i<aNivDif.length ;i++ )
	for (var i = 1; i<aNivDif.length ;i++ )
	{

		miBoton = botonDeTexto( "Nivel: " + aNivDif[i].niv + " -> " + aNivDif[i].nCol + " columnas x " + aNivDif[i].nFil + " filas", 
			540, 050 + i*40, 200, 36 );

		// Pointers normalize touch and mouse
		//	hay que pasar el nivel de juego elegido
		miBoton.on('pointerdown', fijaDificultad(i) );
		miBoton.on('click', fijaDificultad(i) ); // mouse-only
		miBoton.on('tap', fijaDificultad(i) ); // touch-only

		//	miBoton.pointerdown = miBoton.click = miBoton.tap = 
		//			function(data){ nivJuego = aNivDif[i].niv }


		//	miBoton = EscenaDificultad.addChild( miBoton);
		EscenaDificultad.addChild( miBoton);
		

	}
	//	EscenaDificultad.addChild( botonDeTexto( " " + aNivDif[1].niv + " - " + aNivDif[1].nCol + " x " + aNivDif[1].nFil, "white", 100, 100, 200, 40, "green" ));
	//	EscenaDificultad.addChild( botonDeTexto( " " + aNivDif[1].niv + " - " + aNivDif[1].nCol + " x " + aNivDif[1].nFil, "white", 100, 100, 200, 40, "green" ));

	miBoton = botonDeTexto( "Iniciar", FILA_BOTONES, 300, 200, 40 );
	EscenaDificultad.addChild( miBoton );
	
	EscenaDificultad.addChild(BotonJugar);
	//	BotonJugar.visible =true;
	//	BotonJugar.alpha=1;


}


/*
//	--------------------------------------
function eligeDificultad() {

	if (DEBUG) {
		console.log("*** function eligeDificultad **** ");
	}

	//	definir cuales son las escenas visibles y cuales invisibles
	EscenaDeAyudas.visible = false;
	EscenaDeJuego.visible = false;
	EscenaAcercaDe.visible = false;
	EscenaFinJuego.visible = false;
	EscenaMenuInic.visible = false;
	EscenaDificultad.visible = true;
	//	EscenarioGral.visible = true;

	//	nivOk = false;

	state = fijaDificultad;

}
*/


function nivel0() { nivJuego = 0}



function fijaDificultad(i) { 

nivJuego = i

console.log("en fijaDificultad(), i: " + i);

if ( nivJuego > -1)
{
	state = Jugar;
}
//	state = fijaDificultad;

}



function PantallaJugar() {
	var tablero,
		i = undefined,			//	para conteo usos varios
		aPosPolig = undefined,
		num, cImagen;

	/*
		ejemplo de usos

	var tableroTexture = id["tablero.png"];
	tablero = new PIXI.Sprite(tableroTexture);
	//	tablero = id["sumado-tablero.png"];

	tablero.x = TABLERO_OFF_X;
	tablero.y = TABLERO_OFF_Y;
	// make it a bit bigger, so it's easier to grab
	//	tablero.scale.set(1.34);
	tablero.scale.set(nESCALA);
	EscenaDeJuego.addChild(tablero);

	*/

	//	control del tiempo
	Crono = new PIXI.Text( "Tiempo: ", { fontFamily: "Sriracha", fontSize: "16px", fill: "#a00"  } );	
	Crono.position.set(400, 10 );
	EscenaDeJuego.addChild(Crono);

	//	creacion de los sprites draggables para cada nro
	//	modelo en sumado.js


}


//	--------------------------------------
function play() {

	if (DEBUG) {
		//	console.log("chosenTiles.length: " + chosenTiles.length );
		console.log("*** function play - chosenTiles.length: " + chosenTiles.length );
	}

	//	if ( VerificaSuma() ) {
	if ( chosenTiles.length == 0 ) {

		console.log("chosenTiles.length == 0 " );

		EscenaFinJuego.visible = true;		//	container aviso de fin del juego
		EscenaDeJuego.visible = false;
		EscenaDeJuego.alpha = 0.8 ;

		BotonJugar.visible = true;
		BotonMenu.visible = true;

		//	cancelAnimationFrame(myReq);

		state = end;

	} else {
		elapsed = Math.floor(( new Date().getTime() - start ) / 100 ) / 10;
	}
	Crono.text = "Tiempo: " + elapsed + " seg.";
}



function PantallaFinJuego() {

	const style = new PIXI.TextStyle({
		fill: "#880000",
		fontFamily: "Bangers",
		fontSize: 48,
		fontWeight: "bold"
	});

	const	MessageFin = new PIXI.Text( "Bien resuelto!\nFelicitaciones!", style);
	MessageFin.x = ( RENDERER_W - MessageFin.width ) / 2;
	MessageFin.y = ( RENDERER_H - MessageFin.height ) / 2;
	EscenaFinJuego.addChild(MessageFin);
	EscenaFinJuego.addChild(BotonJugar);
	EscenaFinJuego.addChild(BotonMenu);

}



function Dificultad() {

//	definir cuales son las escenas visibles y cuales invisibles
	EscenaDeAyudas.visible = false;
	EscenaDeJuego.visible = false;
	EscenaAcercaDe.visible = false;
	EscenaFinJuego.visible = false;
	EscenaMenuInic.visible = false;
	//	EscenarioGral.visible = true;
	EscenaDificultad.visible = true;	//	seleccion nivel dificultad


	EscenaDificultad.addChild(BotonMenu);
	EscenaDificultad.addChild(BotonAtras);
	BotonMenu.visible = true;

	state = Dificultad;

}


//	=========================================
//	Codigo especifico para este juego
//	=========================================
function onTilesLoaded(){
	// choose 24 random tile images
	chosenTiles=new Array();

	const aImages=[
		"img-100.png",
		"img-101.png",
		"img-102.png",
		"img-103.png",
		"img-104.png",
		"img-105.png",
		"img-106.png",
		"img-107.png",
		"img-108.png",
		"img-109.png",
		"img-110.png",
		"img-111.png",
		"img-112.png",
		"img-113.png",
		"img-114.png",
		"img-115.png",
		"img-116.png",
		"img-117.png",
		"img-118.png",
		"img-119.png",
		"img-120.png",
		"img-121.png",
		"img-122.png",
		"img-123.png",
		"img-124.png",
		"img-125.png",
		"img-126.png",
		"img-127.png",
		"img-128.png",
		"img-129.png",
		"img-130.png",
		"img-131.png",
		"img-132.png",
		"img-133.png",
		"img-134.png",
		"img-135.png",
		"img-136.png",
		"img-137.png",
		"img-138.png",
		"img-139.png",
		"img-140.png",
		"img-141.png",
		"img-142.png",
		"img-143.png",
		"img-144.png",
		"img-145.png",
		"img-146.png",
		"img-147.png"
		];

	const offset_X = 100 + 50*(8-nCol),
		offset_Y = 50*(6-nFil);

	//	cambiar orden de los tiles/ baldosas
	while(chosenTiles.length< nFil * nCol ){
		var candidate=Math.floor(Math.random()*44);
		if(chosenTiles.indexOf(candidate)==-1){
			chosenTiles.push(candidate,candidate)
		}			
	}

	//	espiar contenido de chosenTiles
	if (DEBUG)	{ mostrarPropiedades(chosenTiles, "chosenTiles: ") }


	// shuffle the chosen tiles
	for(i=0;i<96;i++){
		var from = Math.floor(Math.random()* nFil * nCol);
		var to = Math.floor(Math.random()* nFil * nCol);
		var tmp = chosenTiles[from];
		chosenTiles[from]=chosenTiles[to];
		chosenTiles[to]=tmp;
	}


	//	agrego un array clone de chosenTiles para llevar la cuenta de los array que quedan en el tablero
	//	tilesOnBoard = chosenTiles;


	if (DEBUG)
	{
		//	for (i=0;i< chosenTiles.length	;i++ ) {
		//		console.log("chosenTiles[" + i + "]: " + chosenTiles[i]);
		//	}

	}


	//	estructura actual fija para 8 filas y 6 columnas
	// place down tiles
	for(i=0;i<nCol;i++){

		for(j=0;j<nFil;j++){

			//	console.log("chosenTiles[i*6+j]: " + chosenTiles[i*6+j] );

			// new sprite
			//	var tile = PIXI.Sprite.fromFrame(chosenTiles[i*6+j]);
			var tile = new PIXI.Sprite(id[aImages[chosenTiles[i*nFil+j]]]);


			// buttonmode+interactive = acts like a button
			//	console.log("linea 603, tile: " + tile );

			tile.buttonMode=true;
			tile.interactive = true;
			tile.scale.set(0.3);
			// is the tile selected?
			tile.isSelected=false;
			// set a tile value
			tile.theVal=chosenTiles[i*nFil+j]
			// place the tile
			//	tile.position.x = 7+i*100;
			tile.position.x = offset_X + i*90;
			//	tile.position.y = 7+  j*100;
			tile.position.y = offset_Y +  j*90;

			// paint tile black
			tile.tint = 0x000000;
			// set it a bit transparent (it will look grey)
			tile.alpha=0.5;
			// add the tile
			EscenarioGral.addChild(tile);
			// mouse-touch listener
			tile.mousedown = tile.touchstart = function(data){
				// can I pick a tile?
				if(canPick) {
					 // is the tile already selected?
					if(!this.isSelected){
						// set the tile to selected
						this.isSelected = true;
						// show the tile
						this.tint = 0xffffff;
						this.alpha = 1;
						// is it the first tile we uncover?
						if(firstTile==null){
							firstTile=this
						}
						// this is the second tile
						else{
							secondTile=this
							// can't pick anymore
							canPick=false;

							// did we pick the same tiles?
							if(firstTile.theVal==secondTile.theVal){

								//	elimino las baldositas quitadas del tablero
								//	var pos = tilesOnBoard.indexOf(firstTile.theVal);
								//	tilesOnBoard.splice(pos, 1 );
								//	pos = tilesOnBoard.indexOf(secondTile.theVal);
								//	tilesOnBoard.splice(pos, 1 );
	
								var pos = chosenTiles.indexOf(firstTile.theVal);
								chosenTiles.splice(pos, 1 );
								pos = chosenTiles.indexOf(secondTile.theVal);
								chosenTiles.splice(pos, 1 );
						
								if (DEBUG) {
									//	console.log("firstTile, secondTile: " + firstTile.theVal + ", " + secondTile.theVal);
									//	console.log("tilesOnBoard, chosenTiles: " + tilesOnBoard.length + ", " + chosenTiles.length );
								}

								// wait a second then remove the tiles and make the player able to pick again
								setTimeout(function(){
									EscenarioGral.removeChild(firstTile);
									EscenarioGral.removeChild(secondTile);
									firstTile=null;
									secondTile=null;
									canPick=true;
								},1000);
							}
							// we picked different tiles
							else{
								// wait a second then cover the tiles and make the player able to pick again
								setTimeout(function(){
									firstTile.isSelected=false
									secondTile.isSelected=false
									firstTile.tint = 0x000000;
									secondTile.tint = 0x000000;
									firstTile.alpha=0.5;
									secondTile.alpha=0.5;
									firstTile=null;
									secondTile=null;
									canPick=true	
								},1000);
							}
						}	
					}
				}
			}
		}
	} 
}





function botonDeTexto(	//	funcion para preparar un boton con texto
		texto,
		posX,   		//	posicion X del fondo rectangular
		posY,   	    //	
		ancho,  		//	ancho del fondo rectangular
		alto   		//	alto del idem
	) {


	//	-------------------------------------------------------------
	//	Esquema de preparacion de un texto boton
	var miBoton = new PIXI.Text( texto, estiloTxtBoton);
	miBoton.anchor.set(0.5);
	miBoton.x = posX + (ancho / 2 );			// Set the initial position
	miBoton.y = posY + (alto / 2 );	
	
	miBoton.interactive = true;					// Opt-in to interactivity
	miBoton.buttonMode = true;					// Shows hand cursor

	return miBoton

}





function Jugar() {
	//	acciones a realizar durante el juego

	if (DEBUG) {
		//	console.log("chosenTiles.length: " + chosenTiles.length );
		console.log("=== function Jugar ===" );
	}


	//	var i = undefined;
	
	//	definir cuales son las escenas visibles y cuales invisibles
	EscenaDeAyudas.visible = false;
	EscenaDeJuego.visible = true;
	EscenaAcercaDe.visible = false;
	EscenaFinJuego.visible = false;
	EscenaMenuInic.visible = false;
	//	EscenarioGral.visible = true;

	EscenaDeJuego.alpha = 0.99 ;

	console.log("juego con nivel " + nivJuego );
	nFil = aNivDif[nivJuego].nFil;
	nCol = aNivDif[nivJuego].nCol;


	//	GenJuego()		//	genera un nuevo juego
	onTilesLoaded()

	
	if (DEBUG)
	{
		// Accessing the prototype
		//	console.log( Object.getPrototypeOf(EscenarioGral.children )) ;
		//	console.log(EscenarioGral.children.length);
		
	}

	start = new Date().getTime();
	elapsed = 0;

	state = play;

}


function GenJuego()			//	genera un nuevo juego
{
}


//	====================================================
//	para experimentar
//	====================================================


//-------------------------------------------------
//	funciones exclusivas para depuracion
//-------------------------------------------------
function mostrarPropiedades(objeto, nombreObjeto) {
	//	https://developer.mozilla.org/es/docs/Web/JavaScript/Guide/Trabajando_con_objectos

	var resultado = nombreObjeto;
	for (var i in objeto) {
		resultado +=  "." + i + " = " + objeto[i] + "\n";		
	}
	return resultado;
}


function recorrerObjeto(objeto)
{
	var respuesta="";
	for (var i in objeto)
	{
		//	respuesta+=i+": "+ Object.entries(objeto[i])+"<br>";
		respuesta+=i+": "+ objeto[i].name +"<br>";
	}
	return respuesta
}
