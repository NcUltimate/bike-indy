var Alarm = {
	states: ['start', 'stop', 'reset', 'dismiss'],
	snd: new Audio('/images/time_up.mp3'),
	timer_active: false,
	notify_times: [9,4,0,-1],
	time_mins: 30, time_secs: 0, state: 0,

	initialize: function() {
		$('#timer').click(function() {
			if(Alarm.state == 0) {
				Alarm.ticker = setInterval(Alarm.update_timer, 1000);
			}
			else if(Alarm.state == 1) {
				clearInterval(Alarm.ticker);
				Alarm.dismiss_alarm();
			}
			else if(Alarm.state == 2){
				Alarm.time_mins = 30;
				Alarm.time_secs = 1;
				Alarm.update_timer();
			}
			else if(Alarm.state == 3) {
				Alarm.dismiss_alarm();
			}
			if(Alarm.state != 3) {
				Alarm.state += 1;
				Alarm.state %= 3;
			}
			else {
				if(Alarm.time_mins == -1)
					Alarm.state = 2;
				else
					Alarm.state = 1;
			}
			$('#timer .msg-text').html('Tap to '+Alarm.states[Alarm.state]);
		});
	},
	sound_alarm: function() {  
		Alarm.snd.play(); 
		Alarm.alarming = setInterval(function() {
			$('#timer').toggleClass('alarming');
		}, 800);
	},
	dismiss_alarm: function() { 
		Alarm.snd.pause(); 
		clearInterval(Alarm.alarming);
		$('#timer').removeClass('alarming');
	},
	update_timer: function() {
		Alarm.time_secs--;
		if(Alarm.time_secs == -1) {
			Alarm.time_secs = 59;
			Alarm.time_mins--;
			if(Alarm.notify_times.indexOf(Alarm.time_mins) != -1) {
				Alarm.state = 3;
				$('#timer .msg-text').html('Tap to '+Alarm.states[Alarm.state]);
				Alarm.sound_alarm();
			}
			if(Alarm.time_mins == -1) {
				clearInterval(Alarm.ticker);
				return;
			}
		}
		$('#timer .time-text').html((Alarm.time_mins < 10 ? '0' : '') + Alarm.time_mins + ':'+(Alarm.time_secs < 10 ? '0' : '')+Alarm.time_secs);
	}
};