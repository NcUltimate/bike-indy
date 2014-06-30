var timer_active = false;
var notify_times = [9,4,0,-1];
var time_mins = 30;
var time_secs = 0;
var states = ['start', 'stop', 'reset', 'dismiss'];
var snd = snd = new Audio('/images/time_up.mp3');
var ticker;
var alarming;
var state = 0;

$(function() {
	$('#timer').click(function() {
		if(state == 0) {
			ticker = setInterval(update_timer, 1000);
		}
		else if(state == 1) {
			clearInterval(ticker);
			dismiss_alarm();
		}
		else if(state == 2){
			time_mins = 30;
			time_secs = 1;
			update_timer();
		}
		else if(state == 3) {
			dismiss_alarm();
		}
		if(state != 3) {
			state += 1;
			state %= 3;
		}
		else {
			if(time_mins == -1)
				state = 2;
			else
				state = 1;
		}
		$('#timer .msg-text').html('Tap to '+states[state]);
	});
});
function sound_alarm() {  
	snd.play(); 
	alarming = setInterval(function() {
		$('#timer').toggleClass('alarming');
	}, 800);
}
function dismiss_alarm() { 
	snd.pause(); 
	clearInterval(alarming);
	$('#timer').removeClass('alarming');
}

function update_timer() {
	time_secs--;
	if(time_secs == -1) {
		time_secs = 59;
		time_mins--;
		if(notify_times.indexOf(time_mins) != -1) {
			state = 3;
			$('#timer .msg-text').html('Tap to '+states[state]);
			sound_alarm();
		}
		if(time_mins == -1) {
			clearInterval(ticker);
			return;
		}
	}
	$('#timer .time-text').html((time_mins < 10 ? '0' : '') + time_mins + ':'+(time_secs < 10 ? '0' : '')+time_secs);
}