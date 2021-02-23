function memory_tiles_game_ui(){
	
	var playButtonCaptions = {
			PLAY_GAME_CAPTION: 'Play Game',
			CANCEL_GAME_CAPTION: 'Cancel Game'
		},
		bttnPlayGame = document.getElementById('bttnPlayGame'),
		bttnScramble = document.getElementById('bttnScramble'),
		nptColCount = document.getElementById('colCount'),
		nptRowCount = document.getElementById('rowCount'),
		
		spnColValue = document.getElementById('colValue'),
		spnRowValue = document.getElementById('rowValue'),
		
		spnMatchValue = document.getElementById('matchValue'),
		spnMisMatchValue = document.getElementById('misMatchValue'),
		spnBonusValue = document.getElementById('bonusValue'),
		
		spnTotalScore = document.getElementById('totalScore');
	
	//------------------------------------------------------------------------------
	
	function disableRightClick(e){
		
		if(!document.rightClickDisabled){
			if(document.layers) 
			{
				document.captureEvents(Event.MOUSEDOWN);
				document.onmousedown = disableRightClick;
			}else{
				document.oncontextmenu = disableRightClick;
			}
			return document.rightClickDisabled = true;
		}
		
		if(document.layers || (document.getElementById && !document.all)){
			if (e.which == 2||e.which == 3){
				return false;
			}
		}else{
			return false;
		}
	}
	
	//------------------------------------------------------------------------------
	
	function resetSliderState(disable){
		nptColCount.disabled = disable;
		nptRowCount.disabled = disable;
	}
	
	//------------------------------------------------------------------------------
	
	nptColCount.addEventListener('change', function(e){
		spnColValue.innerHTML = this.value;
		mtg_board.gotDirty();
		mtg_board.colCount(this.value);
		mtg_board.resetBoard();
		resetSliderState(true);
		bttnPlayGame.disabled = true;
		bttnScramble.disabled = true;
		return false;
	});
	
	//------------------------------------------------------------------------------
	
	nptRowCount.addEventListener('change', function(e){
		spnRowValue.innerHTML = this.value;
		mtg_board.gotDirty();
		mtg_board.rowCount(this.value);
		mtg_board.resetBoard();
		resetSliderState(true);
		bttnPlayGame.disabled = true;
		bttnScramble.disabled = true;
		return false;
	});
	
	//------------------------------------------------------------------------------
	
	bttnScramble.addEventListener('click', function(e){
		resetSliderState(true);	
		bttnPlayGame.disabled = true;
		this.disabled = true;
		mtg_board.scrambleTiles();
		return false;
	});
	
	//------------------------------------------------------------------------------
	
	bttnPlayGame.addEventListener('click', function(e){
		
		var condition = this.innerHTML === playButtonCaptions.PLAY_GAME_CAPTION;
		resetSliderState(true);	
		bttnPlayGame.disabled = true;
		if(condition === true){
			mtg_board.play();
			bttnScramble.disabled = true; 
		}else if(this.innerHTML === playButtonCaptions.CANCEL_GAME_CAPTION){
			mtg_board.cancel();
		}
		return false;
	});
	
	//------------------------------------------------------------------------------
	
	disableRightClick();
	
	//------------------------------------------------------------------------------
	
	return {
		setDefaultSize: function(){
			nptColCount.value = mtg_board.colCount();
			nptRowCount.value = mtg_board.rowCount();
			spnColValue.innerHTML = mtg_board.colCount();
			spnRowValue.innerHTML = mtg_board.rowCount();
		},
		updateScoreBoard: function(){
			var counters = mtg_board.scoreCounters;
				
			spnMatchValue.innerHTML = counters.matchCtr;
			spnMisMatchValue.innerHTML = counters.misMatchCtr;
			spnBonusValue.innerHTML = counters.bonusCtr;
		
			spnTotalScore.innerHTML = 	mtg_board.scoreValues.matchValue * counters.matchCtr +
										mtg_board.scoreValues.misMatchValue * counters.misMatchCtr +
										mtg_board.scoreValues.bonusValue * counters.bonusCtr;
		
		},
		resetScoreBoard: function(){
			spnMatchValue.innerHTML = 0;
			spnMisMatchValue.innerHTML = 0;
			spnBonusValue.innerHTML = 0;
			spnTotalScore.innerHTML = 0;
		},
		resetPlayButtonCaptions: function(gameStarted){
			if(gameStarted === true ){
				bttnPlayGame.innerHTML = playButtonCaptions.CANCEL_GAME_CAPTION;
			}else{
				bttnPlayGame.innerHTML = playButtonCaptions.PLAY_GAME_CAPTION;
			}
					
		},
		resetPlayButtonState: function(state){
			bttnPlayGame.disabled = state;
		},
		resetScrambleButtonState : function(state){
			bttnScramble.disabled = state;
		},
		resetSliderStates: function(state){
			resetSliderState(state);	
		}
		
	};	
	
}