/*global TimersList, Timer, TimerState*/
QUnit.module("timersListTest");

QUnit.test('loadTest', function(assert){

	var tick = function(){}, timers = new TimersList(tick), timer = new Timer('Name');

	timer.id = 123456;
	timer.alarmId = 4444;
	timer.state = TimerState.STOPPED;
	
	assert.strictEqual(0, timers.timers.length);
	
	timers.add(timer);
	
	assert.strictEqual(1, timers.timers.length);
	
	timers.save();
	
	timers = new TimersList(tick);
	
	assert.strictEqual(1, timers.timers.length);
	assert.strictEqual(timer.id, timers.timers[0].id);
	assert.strictEqual(timer.alarmId, timers.timers[0].alarmId);
	assert.strictEqual(timer.name, timers.timers[0].name);
	assert.strictEqual(timer.state, timers.timers[0].state);
});
