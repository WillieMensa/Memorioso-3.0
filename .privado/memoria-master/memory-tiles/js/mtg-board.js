function memory_tiles_game_board(){
	
	const 	TILE_WIDTH = 47,
			TILE_HEIGHT = 61,
			SOURCE_IMAGE_COLUMN_COUNT = 10,
			SOURCE_IMAGE_ROW_COUNT = 4,
			BOARD_PADDING = 35,
			TILE_DISTANCE = 20,
			MATCH_VALUE = 4,
			MISMATCH_VALUE = -2,
			BONUS_VALUE = 6,
			SHOW_TILE_FACE = false,
			HIDE_TILE_FACE = true,
			SOURCE_IMAGE = './images/tiles.png',
			TAP_SOUND = '.\\sounds\\tap.wav',
			DOUBLE_TAP_SOUND = '.\\sounds\\taptap.wav';
	
		counters = {
			matchCtr : 0,
			misMatchCtr : 0,
			bonusCtr : 0	
		},	
		bCtr = 0,
		clickCtr = 0,
		clickOK = true;
		tiler = null,
		tiles = [],
		tileCount = 0,
		tileErased = [],
		tileIndices = [],
		intervalCtr = 0,
		gameStarted = false,
		boardColumnCount = 6,
		boardRowCount = 4,
		previousImageIndex = -1,
		previousTileIndex = -1,
		boardGotDirty = false,
		srcImage = new Image(),
		container = document.getElementById('container'),
		boardCanvas = document.getElementById('board'),
		bufferCanvas = document.getElementById('buffer'),
		trackerCanvas = document.getElementById('tracker'),
		boardContext = boardCanvas.getContext('2d'),
		bufferContext = bufferCanvas.getContext('2d');
		trackerContext = trackerCanvas.getContext('2d');

	//------------------------------------------------------------------------------	
	
	function initTileIndices(){
		
		tileCount = boardColumnCount * boardRowCount;
		
		var entryTileCount = tileCount / 2,
			i=0,
			srcImageTilePicked = [];
		
		// reset tile indices.
		tileIndices.length = 0;
		tileErased.length = 0;
		
		// initialize array items to 'unpicked'.
		for(i=0; i<tileCount; i += 1){
			srcImageTilePicked.push(0);
			tileErased.push(false);
		}
		
		// process entry tiles...
		var seed = (SOURCE_IMAGE_COLUMN_COUNT * SOURCE_IMAGE_ROW_COUNT) ;
		for(i=0; i<entryTileCount; i += 1){
			
			var	index = parseInt(Math.random() * seed);
			
			while ((srcImageTilePicked[index] !== 0) || (index === 0)){
				index = parseInt(Math.random() * seed);
			}
			
			srcImageTilePicked[index] = 1;
			tileIndices.push(index);
			
		}	
		
		// reset the first half of the array items to unpicked.
		for(i=0; i<entryTileCount; i += 1){
			srcImageTilePicked[i] = 0;
		}
		
		// process matching tiles...
		seed = entryTileCount ;
		for(i=0; i<entryTileCount; i += 1){
			
			var index = parseInt(Math.random() * seed);
			
			while (srcImageTilePicked[index] !== 0){
				index = parseInt(Math.random() * seed);
			}
			srcImageTilePicked[index] = 1;
			tileIndices.push(tileIndices[index]);

		}
		
	}

	//------------------------------------------------------------------------------
	// Source tile images.
	function tile(tileIndex, srcX, srcY){
		
		var tX = tileIndex % SOURCE_IMAGE_COLUMN_COUNT,
			tY = parseInt(tileIndex / SOURCE_IMAGE_COLUMN_COUNT);
		
		return {
			x: srcX,
			y: srcY,
			imageIndex: tileIndex,	
			imageData: function(){
				return bufferContext.getImageData(tX * TILE_WIDTH, tY * TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT);
			}
		};
		
	}

	//------------------------------------------------------------------------------
	// Resize board canvas based on column and row counts.
	function resizeBoardAndTrackerCanvases(){
		
		var width = (2 * BOARD_PADDING) + //computed board's paddings
					((boardColumnCount - 1) * TILE_DISTANCE) + //computed tiles' total distances
					(boardColumnCount * TILE_WIDTH), // total tiles' width
			height =(2 * BOARD_PADDING) + 
					((boardRowCount - 1) * TILE_DISTANCE) + 
					(boardRowCount * TILE_HEIGHT);
					
		boardCanvas.width = trackerCanvas.width = width;
		boardCanvas.height = trackerCanvas.height = height;
		
	}
	
	//------------------------------------------------------------------------------
	// Draw tiles face down.
	function initTilesAndTracker(){
		
		var x=0,
			y=0,
			r=1,
			ctr = 0,
			fillStyle = '',
			destX=BOARD_PADDING,
			destY=BOARD_PADDING,
			currentTile = 0;

		trackerContext.clearRect(0,0, trackerCanvas.width, trackerCanvas.height);
		tiles.length = 0;
		
		for(y=0; y<boardRowCount; y += 1){
			for(x=0; x<boardColumnCount; x += 1){
			
				tiles.push(tile(tileIndices[ctr], destX, destY));
				
				trackerContext.beginPath();
				fillStyle = 'rgb(' +  r + ',255,0)';
				trackerContext.fillStyle = fillStyle;
				trackerContext.fillRect(destX, destY, TILE_WIDTH, TILE_HEIGHT);
				
				destX += TILE_WIDTH + TILE_DISTANCE;
				ctr += 1;
				r += 1;
				
			}
			destX = BOARD_PADDING;
			destY += TILE_HEIGHT + TILE_DISTANCE;
		}
		
		
		
		
	}
	
	//------------------------------------------------------------------------------
	
	function windowToCanvas(canvas, x, y){
		
		var bcr = canvas.getBoundingClientRect();
		return{
			x: x - bcr.left * (canvas.width/bcr.width),
			y: y - bcr.top * (canvas.height/bcr.height)
		};
		
	}
	
	//------------------------------------------------------------------------------
	
	boardCanvas.addEventListener('mouseup', function(e){
		
		if(!gameStarted || (e.which == 2 || e.which == 3)){return}
		
		var screenToClient = {
				x: function(canvas, x){
					return x - canvas.getBoundingClientRect().left * (canvas.width/canvas.getBoundingClientRect().width);
				},
				y: function(canvas, y){
					return y - canvas.getBoundingClientRect().top * (canvas.height/canvas.getBoundingClientRect().height);
				}
			},
			trackerImageData = trackerContext.getImageData(screenToClient.x(boardCanvas,e.clientX), screenToClient.y(boardCanvas,e.clientY), 1, 1),
			tileIndex = trackerImageData.data[0] - 1; // we started at 1 in our tracker's initialization thus we subtract the pixel data's low byte by 1 to make way for the zero-based tile indexing.
			
		if(tileIndex < 0){return} // the user clicked directly on the board, that is, not on a tile.
		
		var 	
			clickedTile = tiles[tileIndex],
			imageIndex = clickedTile.imageIndex;
		
		if(tileErased[tileIndex] === true || previousTileIndex === tileIndex){
			return false;
		}
		
		if(clickOK === true){
			clickCtr += 1;
			boardContext.putImageData(clickedTile.imageData(), clickedTile.x, clickedTile.y);
			mtg_sound.play(TAP_SOUND);
		}else{
			return false;
		}
		
		if(clickCtr === 1){
			
			previousImageIndex = imageIndex;
			previousTileIndex = tileIndex;
			
		}else if (clickCtr === 2){
			
			clickOK = false;
			var previousTile = tiles[previousTileIndex];
			
			if(previousImageIndex === imageIndex){
				
				setTimeout(function(){
					
					boardContext.clearRect(clickedTile.x, clickedTile.y, TILE_WIDTH, TILE_HEIGHT);
					boardContext.clearRect(previousTile.x, previousTile.y, TILE_WIDTH, TILE_HEIGHT);
					boardContext.beginPath();
					boardContext.strokeStyle = '#aaa';
					boardContext.strokeRect(clickedTile.x, clickedTile.y, TILE_WIDTH, TILE_HEIGHT);
					boardContext.strokeRect(previousTile.x, previousTile.y, TILE_WIDTH, TILE_HEIGHT);
					
					mtg_sound.play(DOUBLE_TAP_SOUND);
					bCtr += 1;
					if(bCtr === 3){
						counters.bonusCtr += 1;
						bCtr = 0;
					}
					counters.matchCtr += 1;
					mtg_ui.updateScoreBoard();
					
					tileErased[previousTileIndex] = true;
					tileErased[tileIndex] = true;
					
					previousImageIndex = -1;
					previousTileIndex = -1;
					clickOK = true;
					
					if(counters.matchCtr === (tileCount / 2)){
						alert('Game Over!');
						setBoard();
					}
					
				}, 1000);
				
			}else{
				
				setTimeout(function(){
					boardContext.putImageData(tile(0, clickedTile.x, clickedTile.y).imageData(), clickedTile.x, clickedTile.y);
					boardContext.putImageData(tile(0, previousTile.x, previousTile.y).imageData(),previousTile.x, previousTile.y);
					
					mtg_sound.play(DOUBLE_TAP_SOUND);
					bCtr = 0;
					counters.misMatchCtr += 1;
					mtg_ui.updateScoreBoard();
					
					previousImageIndex = -1;
					previousTileIndex = -1;
					clickOK = true;
					}, 1000);
				
			}		
			
			clickCtr = 0;
			
		}
	
	e.preventDefault();
	
	});
	
	//------------------------------------------------------------------------------
	
	function setTiles(showTileFace){
		
		if(boardGotDirty === true){
			boardContext.clearRect(0,0, boardCanvas.width, boardCanvas.height);
			boardGotDirty = false;
		}
		
		tiler = setInterval(function(){
			var tileIndex = (showTileFace === SHOW_TILE_FACE) ? tileIndices[intervalCtr] : 0;
				currentTile = tile(tileIndex, tiles[intervalCtr].x, tiles[intervalCtr].y);
				
			boardContext.putImageData(currentTile.imageData(), tiles[intervalCtr].x, tiles[intervalCtr].y);
			
			intervalCtr += 1;
			mtg_sound.play(TAP_SOUND);
			
			if(intervalCtr === tileCount){
				intervalCtr = 0;
				setTimeout(function(){
					mtg_ui.resetSliderStates(showTileFace);
					mtg_ui.resetScrambleButtonState(showTileFace);
					mtg_ui.resetPlayButtonState(false);
						
				}, 500);
				clearInterval(tiler);
			}
		}, 50);
		
	}
	
	//------------------------------------------------------------------------------
	
	function resetFlags(flagState){
		clickOK = flagState;
		gameStarted = flagState;	
	}
	
	//------------------------------------------------------------------------------
	
	function resetCounters(){
		
		counters.matchCtr = 0;
		counters.misMatchCtr = 0;
		counters.bonusCtr = 0;
		intervalCtr = 0;
		clickCtr = 0;
		bCtr = 0;
		
		tiler = null;
		mtg_ui.resetPlayButtonCaptions(false);
		mtg_ui.resetScoreBoard();
		
	}
	
	//------------------------------------------------------------------------------
	
	function setBoard(){
		
		resizeBoardAndTrackerCanvases();
		initTileIndices();
		initTilesAndTracker();
		resetFlags(false);
		resetCounters();
		setTiles(SHOW_TILE_FACE);
	
	}
	
	//------------------------------------------------------------------------------
	
	function initGame(){
		
		srcImage.src = SOURCE_IMAGE;
		srcImage.onload = function(){
			bufferContext.drawImage(srcImage, 0, 0);
			setBoard();
		};	
		
	}
	
	//------------------------------------------------------------------------------
	
	initGame();
	
	//------------------------------------------------------------------------------
	
	return {
		play: function(){
			resetFlags(true);
			resetCounters();
			setTiles(HIDE_TILE_FACE);
			mtg_ui.resetPlayButtonCaptions(gameStarted);
			mtg_ui.resetSliderStates(true);
		},
		cancel: function(){
			resetFlags(false);
			resetCounters();
			setTiles(SHOW_TILE_FACE);
			mtg_ui.resetPlayButtonCaptions(gameStarted);
			mtg_ui.resetScoreBoard();
		},
		scrambleTiles: function(){
			setBoard();
		},
		gotDirty : function(){
			boardGotDirty = true;
		},
		resetBoard: function(){
			setBoard();
		},
		colCount: function(){
			if(arguments.length>0){
				boardColumnCount = arguments[0]; //setter			
			}else{
				return boardColumnCount; // getter
			}	
		},
		rowCount: function(){
			if(arguments.length>0){
				boardRowCount = arguments[0]; //setter
			}else{
				return boardRowCount; //getter
			}	
		},
		scoreValues: {
			matchValue: MATCH_VALUE,
			misMatchValue: MISMATCH_VALUE,
			bonusValue: BONUS_VALUE
		},
		scoreCounters: counters
		
	};
	
}

