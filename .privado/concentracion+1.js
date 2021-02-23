/*
	concentracion.js
*/

//	-------------------------
//	Constantes
//	-------------------------
var	RENDERER_W = 1000,
	RENDERER_H = 600,
	FONDO_JUEGO = 0xa0c0e0,		//	 "#ffc",
	VERSION	= "0.5.0",			//	version inicial
	//	DEBUG = false;
	DEBUG = true;


//	-------------------------
//	equivalencias
//	-------------------------
var Container = PIXI.Container,
    autoDetectRenderer = PIXI.autoDetectRenderer,
    Sprite = PIXI.Sprite,
    loader = PIXI.loader,
    resources = PIXI.loader.resources,
    Text = PIXI.Text;

//	-------------------------
//	variables globales varias
//	-------------------------
var	EscenaDeAyudas = undefined,			//	container ayudas
	EscenaDeJuego = undefined,			//	container juego
	EscenaSobre = undefined,			//	container de estadisticas
	EscenaFinJuego = undefined,			//	container aviso de fin del juego
	EscenaMenuInic = undefined,			//	container pantalla de inicio
	EscenarioGral = undefined			//	container del total (1er nivel)

		
	var firstTile=null;							// primera pieza elegida por el jugador			
	var secondTile=null;						// segunda pieza elegida por el jugador			
	var canPick=true;							// puede el jugador elegir una pieza?


	//Create the renderer
	var rendererOptions = {
		antialiasing: true,
		transparent: true,
		resolution: window.devicePixelRatio,
		autoResize: true,	//	
		backgroundColor: FONDO_JUEGO	//	default: 0x000000
	}
	var renderer = PIXI.autoDetectRenderer( RENDERER_W, RENDERER_H, rendererOptions );	// crear una instancia de renderer
	var tileAtlas = ["images.json"];			// importing a texture atlas created with texturepacker			


	document.body.appendChild(renderer.view);	// add the renderer view element to the DOM			


	//	Setup Pixi and load the texture atlas files - call the `setup` function when they've loaded
	loader.add(tileAtlas)	
		.add("https://fonts.googleapis.com/css?family=Sriracha")
		.load(setup) ;


function setup() {			//	Preparacion general

	//	Make the game scene and add it to the EscenarioGral
	EscenarioGral = new PIXI.Container();


	onTilesLoaded();

}

function onTilesLoaded(){
	// choose 24 random tile images
	var chosenTiles=new Array();
	while(chosenTiles.length<48){
		var candidate=Math.floor(Math.random()*44);
		if(chosenTiles.indexOf(candidate)==-1){
			chosenTiles.push(candidate,candidate)
		}			
	}
	// shuffle the chosen tiles
	for(i=0;i<96;i++){
		var from = Math.floor(Math.random()*48);
		var to = Math.floor(Math.random()*48);
		var tmp = chosenTiles[from];
		chosenTiles[from]=chosenTiles[to];
		chosenTiles[to]=tmp;
	}
	// place down tiles
	for(i=0;i<8;i++){
		for(j=0;j<6;j++){
			// new sprite
			var tile = PIXI.Sprite.fromFrame(chosenTiles[i*6+j]);
			// buttonmode+interactive = acts like a button
			tile.buttonMode=true;
			tile.interactive = true;
			// is the tile selected?
			tile.isSelected=false;
			// set a tile value
			tile.theVal=chosenTiles[i*6+j]
			// place the tile
			tile.position.x = 7+i*80;
			tile.position.y = 7+  j*80;
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
	requestAnimationFrame(animate);
}

function animate() {
	requestAnimationFrame(animate);

	//Render the EscenarioGral
	renderer.render(EscenarioGral);
}

