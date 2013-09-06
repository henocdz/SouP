
$(function(){
	var s = new Soup("e0e70592dcc6fb814edc8eed72d12be1",{
		loading: function(sound){
			$('.soup-progress.loaded').css('width', sound.bytesLoaded * 100  / sound.bytesTotal  + "%");
			
		},
		playing:function(sound){
			$('.soup-progress.played').css('width', sound.position * 100  / sound.duration  + "%");
			$('.soup-time>.total-time').text(s.formatedTime());
		},
		end: function(sound){ },
		error: function(code,msg){
			console.log(msg);
		},
		play: function(){ $('.play_pause>img').attr('src', 'i/pause_slim.png'); },
		pause: function(){ $('.play_pause>img').attr('src', 'i/play_slim.png'); },
		load: function(){ $('.soup-time>.current-time').text(s.formatedTime("total"));  },
		playlist: ['82268275']
	});


	$('.play_pause').on('click', function(e) {	s.play_pause();	});
	$('.soup-control.next').on('click', function(e) {	s.next();	});
	$('.soup-control.prev').on('click', function(e) {	s.prev();	});

})

function Soup(client_id, ops){

	var self = this, 
		channel  = null,
		playlist = ops.playlist || [], 
		playlisted = [],
		playlist_o = ops.playlist || [];

	var options = {
		loading: function(){},
		playing: function(){},
		end: function(){},
		play: function(){},
		pause: function(){},
		error: function(){},
		load: function(){},

		/* Read only */
		autoplay: false,
		random: false,
		repeat_list: true,
		repeat_track: false,
	}
		
	$.extend(options, options, ops);

	var errorMessage = function(code){
		if(code === 0){
			options.error(code,"No playlist items");
		}else if(code === 1){
			options.error(1,'Invalid track ID')
		}
	}

	this.init = function(id, auto){
		if(id === undefined){
			errorMessage(1);
			return;
		}


		try{
			console.log(channel)
		}catch(e){}

		SC.stream("/tracks/"+id,{
			whileloading: function(){ options.loading(this); },
			whileplaying: function(){ options.playing(this); },
			onfinish: function(){ self.end(); options.end(this); },
			onplay: function(){ options.play(); },
			onpause: function(){ options.pause(); },
			onload: function(){ options.load(); }
		},function(sound){
			channel = sound;

			if(options.autoplay || auto){
				channel.play();
			}

		});
	}

	this.play_pause = function(){
		if( !channel ){
			self.go(true);
		}else if( channel.paused || !channel.playState){
			channel.play();
		}else{
			channel.pause();
		}
	}

	this.end = function(){
		if(!repeat_track){
			playlisted.push(playlist[0]);
			playlist.splice(0,1);

			self.next();
		}else{
			s.go();
		}
	}

	this.stop = function(){
		try{
			channel.destruct();
		}catch(e){
			return;
		}
	}

	this.formatedTime = function(time){

		var time = time || '';
		if(!channel){
			return undefined;
		}

		var milis;
		
		if( time.toUpperCase() === 'TOTAL'){
			 milis = channel.duration;
		}else{

			milis = channel.position;
		}

		var formated = "";
		var seconds = Math.round(milis / 1000), minutes, hours;

		if(seconds < 60){
			formated = "00:"+(seconds<10?'0'+seconds:seconds);
		}else if(seconds > 60 &&  seconds < 3600){
			minutes = Math.floor(seconds/60);
			seconds = seconds % 60;

			formated = (minutes<10?'0'+minutes:minutes) + ":" + (seconds<10?'0'+seconds:seconds);
		}else{
			minutes = seconds % 60;
			seconds = minutes % 60;
			hours = Math.floor(seconds/24);

			formated = hours + ':' + minutes + ':' + seconds;
		}

		return formated;

	}


	this.next = function(){
		if(playlist.length > 1 || (playlist.length === 0 && options.repeat_list)){
			
			try{
				channel.destruct();
			}catch(e){
				return;
			}


			playlisted.push(playlist[0]);
			playlist.splice(0,1);

			if(playlist.length === 0){
				playlist = playlisted;
				playlisted = [];
			}

			self.init(playlist[0], true);

			
		}/*else{
			self.stop();
			channel.destruct();

			playlist = playlisted;
		}*/

	}

	this.prev = function(){
		if( ( playlisted.length > 0 ) ){
			channel.destruct();

			playlist.splice(0,0,playlisted.pop());

			self.init(playlist[0], true);
		}
	}

	//Inicializar

	SC.initialize({
		client_id: client_id
	})

	
	this.go = function(auto){
		var auto = auto || false;

		if(options.random){
			playlist.sort(function() {return 0.5 - Math.random()});
			console.log(playlist)
		}
			
		self.init(playlist[0],auto);
	}

	if(playlist.length === 0){
		errorMessage(0);
	}else{
		this.go();
	}


}