var Alarm = {
	states: ['start', 'stop', 'reset', 'dismiss'],
	snd: new Audio('/images/time_up.mp3'),
	timer_active: false,
	notify_times: [1200, 1500, 1740, 1800],
	time_up: 1800,
	elapsed: 0,
	state: 0,

	initialize: function() {
		$('#timer').click(function() {
			if(Alarm.state == 0) {
				Alarm.elapsed = 0;
				Alarm.start_time = Math.floor(Date.now()/1000);
				Alarm.ticker = setInterval(Alarm.update_timer, 200);
			}
			else if(Alarm.state == 1) {
				clearInterval(Alarm.ticker);
				Alarm.dismiss_alarm();
			}
			else if(Alarm.state == 2){
				Alarm.elapsed = 0;
				$('#timer .time-text').html(Alarm.format(Alarm.time_up));
			}
			else if(Alarm.state == 3) {
				Alarm.dismiss_alarm();
			}
			if(Alarm.state != 3) {
				Alarm.state += 1;
				Alarm.state %= 3;
			}
			else {
				if(Alarm.elapsed == Alarm.time_up)
					Alarm.state = 2;
				else
					Alarm.state = 1;
			}
			$('#timer .msg-text').html('Tap to '+Alarm.states[Alarm.state]);
		});
	},
	sound_alarm: function() {  
		Alarm.sounding = true;
		Alarm.snd.play(); 
		Alarm.alarming = setInterval(function() {
			$('#timer').toggleClass('alarming');
		}, 500);
	},
	dismiss_alarm: function() { 
		Alarm.sounding = false;
		Alarm.snd.pause(); 
		clearInterval(Alarm.alarming);
		$('#timer').removeClass('alarming');
	},
	format: function(time) {
		var hours = Math.floor( time / 3600 );
		time -= hours * 3600;
		var mins = Math.floor( time / 60 );
		time -= mins * 60;
		var secs = time;
		return (mins < 10 ? '0' : '')+mins+":"+(secs < 10 ? '0' : '')+secs;
	},
	update_timer: function() {
		Alarm.elapsed = Math.floor(Date.now()/1000) - Alarm.start_time;
		$('#timer .time-text').html(Alarm.format(Alarm.time_up-Alarm.elapsed));

		if(Alarm.notify_times.indexOf(Alarm.elapsed) != -1) {
			Alarm.state = 3;
			$('#timer .msg-text').html('Tap to '+Alarm.states[Alarm.state]);
			if(!Alarm.sounding) Alarm.sound_alarm();
		}
		if(Alarm.elapsed == Alarm.time_up) {
			clearInterval(Alarm.ticker);
			return;
		}
	}
};