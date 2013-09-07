function Soup(client_id, ops){

	var self = this, 
		channel  = null,
		playlist = ops.playlist || [], 
		playlisted = [],
		playlist_o = ops.playlist || [],
		tracks_data = {};

	var options = {
		loading: function(){},
		playing: function(){},
		end: function(){},
		play: function(){},
		pause: function(){},
		error: function(){},
		load: function(){},
		dataload: function(){},

		/* Read only */
		autoplay: false,
		random: false,
		repeat_list: true,
		repeat_track: false,
	}
	
	$.extend(options, options, ops);

	this.getInfo = function(){
		return tracks_data[self.id];
	}

	this.getTracks = function(){
		return tracks_data;
	}

	var errorMessage = function(code){
		if(code === 0){
			options.error(code,"No playlist items");
		}else if(code === 1){
			options.error(1,'Invalid track ID')
		}else if(code === 2){
			options.error(2,'Cant load track info :(');
		}else if(code === 3){
			options.error(3, 'Error loading track info');
		}
	}

	var message = 'SO';

	(function foo() {
		for(var i = 0; i < playlist_o.length; i++ ){
			$.get('http://api.soundcloud.com/tracks/'+playlist_o[i]+'.json?client_id='+client_id, function(data) {
				var id = data.id;
				tracks_data[id] = {} ;
				tracks_data[id].duration = data.duration;
				tracks_data[id].waveform = data.waveform_url;
				tracks_data[id].artwork = data.artwork_url;
				tracks_data[id].title = data.title;
				tracks_data[id].link = "http://soundcloud.com/"+data.user.permalink+"/"+data.permalink;
			},'json').error(function(){
				errorMessage(2);
			});
		};
	})();


	this.init = function(id, auto){
		if(id === undefined){
			errorMessage(1);
			return;
		}


		SC.stream("/tracks/"+id,{
			whileloading: function(){ options.loading(this); },
			whileplaying: function(){ options.playing(this); },
			onfinish: function(){  options.end(this); self.end(); },
			onplay: function(){ options.play(); },
			onpause: function(){ options.pause(); },
			onload: function(){ options.load(); }
		},function(sound){
			channel = sound;
			self.id = playlist[0] || null;
			
			try{
				options.dataload(tracks_data[self.id]);	
			}catch(e){
				errorMessage(3);
			}

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
		if(!options.repeat_track){
			playlisted.push(playlist[0]);
			playlist.splice(0,1);

			self.next();
		}else{
			self.go(true);
		}
	}

	this.stop = function(){
		try{
			channel.destruct();
		}catch(e){
			return;
		}
	}

	this.repos = function(pos){
		channel.pause();
		channel.setPosition(pos * 1000);
		channel.play()
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
		}
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
		}

		self.init(playlist[0],auto);
	}

	if(playlist.length === 0){
		errorMessage(0);
	}else{
		this.go();
	}
}