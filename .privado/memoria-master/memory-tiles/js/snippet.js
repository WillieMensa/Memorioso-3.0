var arr1 = [],
	  arr2 = [],
	  rIndex; 

var nMax = 20;

for(var s=0; s<nMax; s++){
	arr1.push(s);
}

function removeIndex(index){
	return index !== rIndex; 
}

var k = 0;
var length = arr1.length;
while(k < nMax){
	var arr1Index = parseInt(Math.random() * (length));
	rIndex = arr1[arr1Index];
	arr2.push(rIndex);
	arr1 = arr1.filter(removeIndex);
	length = arr1.length;
	k++;
}

var cellCount = constants.BOARD_COLUMN_COUNT * constants.BOARD_ROW_COUNT,
			tileCount = cellCount / 2,
			i=0,
			srcImageTilePicked = [];
		
		// reset tile indices.
		tileIndices.length = 0;
		tileErased.length = 0;
		
		// initialize array items to 'unpicked'.
		for(i=0; i<cellCount; i += 1){
			srcImageTilePicked.push(0);
			tileErased.push(false);
		}
		
		// process entry tiles...
		for(i=0; i<tileCount; i += 1){
			
			var seed = (((constants.SOURCE_TILE_COLUMN_COUNT * constants.SOURCE_TILE_ROW_COUNT)-1) + 1),
				index = parseInt(Math.random() * seed);
			
			while ((srcImageTilePicked[index] !== 0) || (index === 0)){
				index = parseInt(Math.random() * seed);
			}
			
			srcImageTilePicked[index] = 1;
			tileIndices.push(index);
			//console.log('Tile Index[' + i + '] = ' + tileIndices[i]);
			
		}	
		
		// reset the first half of the array items to unpicked.
		for(i=0; i<tileCount; i += 1){
			srcImageTilePicked[i] = 0;
		}
		
		// process matching tiles...
		for(i=0; i<tileCount; i += 1){
			
			var index = parseInt(Math.random() * tileCount);
			
			while (srcImageTilePicked[index] !== 0){
				index = parseInt(Math.random() * tileCount);
			}
			srcImageTilePicked[index] = 1;
			tileIndices.push(tileIndices[index]);

		}

		