/**
 * 
 * countdonw(options)
 * options:
 * 		type: server | local, 时间类型,
 * 		time: 时间段, 如：'2017/04/25 00:00:01 - 2017/04/25 00:00:02',
 *   	onTick: 每次间隔，执行的函数，参数分别为 （天, 时, 分, 秒）,
 *   	onEnd: 结束时执行的回调函数，
 *   	delay: 间隔时间，默认 1000ms, 即 1s
 *
 *
 * 例子：
 * $.skyCountdown({
 * 		type: 'server',
 * 		time: '2017/04/25 00:00:01 - 2017/04/25 00:00:02',
 * 		onTick: function(day, hour, minute, second, isEnd){
 * 			document.body.innerHTML = day + '天' + hour + '时' + minute + '分' + second + '秒';
 * 		},
 * 		onEnd: function(){
 * 			console.log('It's over.');
 * 		}
 * })
 */

; (function ($) {

  function covertToStr(val) {
    return (parseInt(val) < 10) ? '0' + val : '' + val;
  };

  function countdown(options) {
    var opts = $.extend({}, countdown.defaultOpts, options || {});
    var times = opts.time.split(/\s+\-+(?:\s+)/g);
    var nowTime, endTime, difTime, timer;

    if (!times || !times.length) {
      return;
    }

    if (times.length === 1) {
      nowTime = new Date();
      endTime = new Date(times[0]);
    };

    if (times.length === 2) {
      nowTime = new Date(times[0]);
      endTime = new Date(times[1]);
    };

    difTime = endTime - nowTime;

    // 一次 interval
    function tick() {
      //首先判断 是否结束，避免不必要的执行
      if (difTime <= 0) {
        typeof opts.onTick === 'function' && opts.onTick('00', '00', '00', '00', true);
        typeof opts.onEnd === 'function' && opts.onEnd();

        clearInterval(timer);
      }

      var day = Math.floor(difTime / 1000 / 60 / 60 / 24),
        hour = Math.floor(difTime / 1000 / 60 / 60 % 24),
        minute = Math.floor(difTime / 1000 / 60 % 60),
        second = Math.floor(difTime / 1000 % 60);

      typeof opts.onTick === 'function' &&
        opts.onTick(covertToStr(day), covertToStr(hour), covertToStr(minute), covertToStr(second), false);
    };

    // 服务器时间
    function serverTime() {
      timer = setInterval(function () {
        difTime -= opts.delay;
        tick();
      }, opts.delay);
    };

    // 本地时间
    function localTime() {
      timer = setInterval(function () {
        var now = new Date();
        difTime -= now;
        tick();
      }, opts.delay);
    }

    opts.type === 'server' ? serverTime() : localTime();

    tick();
  };

  countdown.defaultOpts = {
    type: 'server',
    time: null,
    onTick: null,
    onEnd: null,
    delay: 1000
  };

  // 挂载到 jQuery 原型上
  $.fn.skyCountdown = countdown;

})(jQuery);
