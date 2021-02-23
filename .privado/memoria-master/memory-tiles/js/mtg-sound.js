function memory_tiles_game_sound(){
	
	var mySound = document.getElementById("my-sound"); 
	
	//------------------------------------------------------------------------------
	
	return {
		play:function(soundFile,loop){
				mySound.src = soundFile;
				mySound.loop = loop;
				mySound.play();
			},
		stop: mySound.pause()
	};
	
}