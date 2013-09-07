$(function(){
	var s = new Soup("e0e70592dcc6fb814edc8eed72d12be1",{
		loading: function(sound){
			$('.soup-progress.loaded').css('width', sound.bytesLoaded * 100  / sound.bytesTotal  + "%");
		},
		playing:function(sound){
			$('.soup-progress.played').css('width', sound.position * 100  /   + s.getInfo().duration + "%");
			$('.soup-time>.current-time').text(formatedTime(sound.position)); 
		},
		end: function(sound){
			$('.soup-track-title').animate({ top: 0	});
			$('.play_pause>img').attr('src', 'i/play_slim.png'); 
		},
		error: function(code,msg){
			console.log(msg);
		},
		play: function(){ 
			var title_bar = $('.soup-track-title');
			title_bar.children('h2').text(s.getInfo().title);

			title_bar.animate({ top: -26  });

			$('.play_pause>img').attr('src', 'i/pause_slim.png'); 
		},
		pause: function(){ $('.play_pause>img').attr('src', 'i/play_slim.png'); },
		load: function(){ 
				$('.soup-progress.loaded').css('width', sound.bytesLoaded * 100  / sound.bytesTotal  + "%");
		},
		dataload: function(info){
			$('.soup-progress.back-sc > img').attr('src', info.waveform );
			$('.soup-time>.total-time').text(formatedTime(info.duration));
		},

		playlist: ['75099885','51601678','58983827','41444181'],
		autoplay: true
	}); //Fin SouP object


	$('.play_pause').on('click', function(e) {	s.play_pause();	});
	$('.soup-control.next').on('click', function(e) {	s.next();	});
	$('.soup-control.prev').on('click', function(e) {	s.prev();	});
	$('.soup-progress-bar').on('click',function(e){	s.repos(100);	})
	$('.soup-control.list').on('click',function(e){ $('.soup-playlist').fadeIn(); })

})


window.formatedTime = function(time){
	var formated = "";
	var seconds = Math.round(time / 1000), minutes, hours;

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
