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
var	LINEA_BOTONES = 470,
	RENDERER_W = 1000,
	RENDERER_H = 600,
	FONDO_JUEGO = 0xecffb3,		//	 "#ffc",
	VERSION	= "0.5.0",			//	version inicial
	FONDO_AYUDA = 0x008cff,
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

//load resources
loader
	.add("memorioso2.json")		//	PIXI.loader.add("assets/spritesheet.json").load(setup);
	//	.load(loader, resources)
	.load(setup);


//	-------------------------
//	variables globales varias. might be used in more than one function
//	-------------------------
let	BotonAtras = undefined,
	BotonAyuda = undefined,
	BotonJugar = undefined,
	BotonAcercaDe = undefined,
	Crono = undefined,
	start = undefined,
	elapsed = undefined,
	EscenaDeAyudas = undefined,			//	container ayudas
	EscenaDeJuego = undefined,			//	container juego
	EscenaAcercaDe = undefined,			//	container de estadisticas
	EscenaFinJuego = undefined,			//	container aviso de fin del juego
	EscenaMenuInic = undefined,			//	container pantalla de inicio
	EscenarioGral = undefined			//	container del total (1er nivel)


//	variables especificas de esta aplicacion
let firstTile=null,						// primera pieza elegida por el jugador			
	secondTile=null,					// segunda pieza elegida por el jugador			
	canPick=true,						// puede el jugador elegir una pieza?
	nCol = undefined,					//	cantidad de columnas de baldositas en tablero
	nFil = undefined,					//	cantidad de filas de baldositas en tablero
	chosenTiles = undefined;			//	array con los numeros de las piezas




function setup() {

	console.log( "inicio setup" );

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

	//	prepara los botones de la aplicacion
	HaceBotones()

	//	Prepara las diferentes pantallas / escenas.
	PantallaInicio();
	PantallaAyuda();
	PantallaJugar();
	PantallaAcercaDe();

	//	Set the initial game state
	//	state = play;
	state = Menu;

	//	Una grilla para ubicarnos en el canvas
	if (DEBUG) 
	{
		DibujaGrilla()
	}


	resize();		//	para refresca la pagina

	var	MessageFin = new PIXI.Text( "Bien resuelto!\nFelicitaciones!", 
		{ fontFamily: "Luckiest Guy",	fontSize: "32px", fill: "#600" });
		MessageFin.x = ( RENDERER_W - MessageFin.width ) / 2;
		MessageFin.y = ( RENDERER_H - MessageFin.height ) / 2;
	EscenaFinJuego.addChild(MessageFin);

	EscenaFinJuego.addChild(BotonJugar);
	EscenaFinJuego.addChild(BotonAtras);

	
	//Start the game loop
	gameLoop();
}



function gameLoop(){

	//Loop this function 60 times per second
	requestAnimationFrame(gameLoop);

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
  EscenarioGral.scale.x = EscenarioGral.scale.y = ratio;

  // Update the renderer dimensions
  renderer.resize(Math.ceil(RENDERER_W * ratio),
                  Math.ceil(RENDERER_H * ratio));
}



function PantallaInicio() {
	EscenaMenuInic.visible = true;

	const style = new PIXI.TextStyle({
		fill: "#040",
		fontFamily: "Luckiest Guy",
		fontSize: 128,
		//	fontWeight: "bold",
		padding: 4,
	});

	//	titulo del menu y juego
	var	txtTitulo = new Text( "MEMORIOSO", style );

		//	txtTitulo.x = 600;
		txtTitulo.x = ( RENDERER_W - txtTitulo.width ) / 2;
		//	txtTitulo.x = window.innerWidth / 2 ;
		txtTitulo.y = 200;			//	(RENDERER_H / 2);
		txtTitulo.rotation = -0.2;

	EscenaMenuInic.addChild(txtTitulo);

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
		fill: "green",
		fontFamily: "Luckiest Guy",
		fontSize: 32,
		fontStyle: "italic",
		fontWeight: "bolder",
		padding: 4,
	});

	//	-------------------------------------------------------------	
	//	Preparacion del boton jugar
	BotonJugar = new PIXI.Text('Jugar', style);
	BotonJugar.anchor.set(0.5);
	BotonJugar.x = 260;						// Set the initial position
	BotonJugar.y =  LINEA_BOTONES;
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
	BotonAcercaDe.anchor.set(0.5);
	BotonAcercaDe.x = 440;							// Set the initial position
	BotonAcercaDe.y =  LINEA_BOTONES;
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
	BotonAyuda.anchor.set(0.5);
	BotonAyuda.x = 620;					// Set the initial position
	BotonAyuda.y =  LINEA_BOTONES;
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
	BotonAtras.anchor.set(0.5);
	BotonAtras.x = 760;								// Set the initial position
	BotonAtras.y =  LINEA_BOTONES + 60;	
	BotonAtras.interactive = true;					// Opt-in to interactivity
	BotonAtras.buttonMode = true;					// Shows hand cursor
	// Pointers normalize touch and mouse
	BotonAtras.on('pointerdown', Menu );
	BotonAtras.on('click', Menu );
	BotonAtras.on('tap', Menu );
	
}




function PantallaAyuda() {
	var graphics = new PIXI.Graphics();
	// draw a rounded rectangle
	graphics.lineStyle(4, 0x332211, 0.95)
	graphics.beginFill( FONDO_AYUDA, 0.95);
	graphics.drawRoundedRect(40, 40, RENDERER_W-80, RENDERER_H-140 );
	graphics.endFill();

	EscenaDeAyudas.addChild(graphics);

	var richText = new PIXI.Text('¿Qué es?\n' +
		'MEMORIOSO es un juego de concentraci&oacute;n y memoria.\n' + 
		'¿En que consiste?\n' + 
		'Hay un cojunto de fichas o cartas, cada una con una imagen, \n' + 
		'colocadas de forma tal que no se ve su anverso.\n' + 
		'Hay dos fichas de cada imagen. El juego consiste en encontrar\n' +
		'las parejas de imágenes iguales.\n' + 
		'Al pulsar sobre una imagen, ésta se da vuelta.\n' + 
		'Se eligen dos fichas consecutivas. Si resultan ser iguales se\n' +
		'retiran del tablero. Si son diferentes vuelven a la posición original.\n' + 
		'El juego finaliza cuando se han encontrado todas las parejas.', 
		{ fontFamily: "Sriracha",	fontSize: "28px", fill: "0xffffcc"  } );

	richText.x = 60;
	richText.y = 60;

	EscenaDeAyudas.addChild(richText);
	EscenaDeAyudas.visible = true;

	//	Botones que se deben visualizar en pantalla de ayuda
	//	unicamente el de volver, entonces, remueve borones del padre y muestra el de ayuda

	//	BotonAcercaDe.visible = false;

	//	EscenaDeAyudas.addChild(BotonAtras);
	//	BotonAtras.visible = true;

}



function Menu() {
	//	definir cuales son las escenas visibles y cuales invisibles
	EscenaDeAyudas.visible = false;		//	container ayudas
	EscenaDeJuego.visible = false;
	EscenaAcercaDe.visible = false;		//	container estadisticas
	EscenaFinJuego.visible = false;		//	container aviso de fin del juego
	EscenaMenuInic.visible = true;		//	container pantalla de inicio
	EscenarioGral.visible = true;		//	container del juego

	//	BotonAyuda
	EscenaMenuInic.addChild(BotonAyuda);
	BotonAyuda.visible = true;
	BotonAyuda.alpha=1;

	//	BotonAcercaDe
	EscenaMenuInic.addChild(BotonAcercaDe);
	BotonAcercaDe.visible = true;

	BotonAtras.visible = true;

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

	EscenaAcercaDe.addChild(BotonAtras);
	BotonAtras.visible = true;

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

	EscenaDeJuego.alpha = 0.8 ;

	BotonJugar.visible = true;
	BotonAyuda.visible = true;
	BotonAcercaDe.visible = true;
	
}






//	-------------------------------------------------------
//	Funciones comunes a todas las aplicaciones con código especifico para la app
//	-------------------------------------------------------

function PantallaAcercaDe() {
	var graphics = new PIXI.Graphics();
	// draw a rounded rectangle
	graphics.lineStyle(4, 0x332211, 0.95)
	graphics.beginFill( FONDO_AYUDA, 0.95);
	graphics.drawRoundedRect(40, 40, RENDERER_W-80, RENDERER_H-140 );
	graphics.endFill();

	EscenaAcercaDe.addChild(graphics);

	var richText = new PIXI.Text('Acerca de MEMORIOSO version ' + VERSION + '\n' +
		'Es un juego para ejercitar concentración y memoria desarrollado por \n' +
		'Willie Verger Juegos de Ingenio\n\n' +
		'Soporte: info@ingverger.com.ar\n' +
		'Web: ingverger.com.ar\n' +
		'\n' , { fontFamily: "Sriracha",	fontSize: "32px", fill: "0xffffcc"  } );

	richText.x = 60;
	richText.y = 60;
	EscenaAcercaDe.addChild(richText);

	EscenaAcercaDe.visible = true;

	BotonAyuda.visible = false;
	BotonAcercaDe.visible = false;

	EscenaAcercaDe.addChild(BotonAtras);
	BotonAtras.visible = true;
	//	BotonSalir.visible =false;

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
		console.log("=== function play ===" );
	}

	//	if ( VerificaSuma() ) {
	if ( chosenTiles.length == 0 ) {
		state = end;
	} else {
		elapsed = Math.floor(( new Date().getTime() - start ) / 100 ) / 10;
	}
	Crono.text = "Tiempo: " + elapsed + " seg.";
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
			tile.scale.set(0.35);
			// is the tile selected?
			tile.isSelected=false;
			// set a tile value
			tile.theVal=chosenTiles[i*nFil+j]
			// place the tile
			tile.position.x = 7+i*100;
			tile.position.y = 7+  j*100;
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

	nFil = 2;
	nCol = 4;


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

