/**
 *  定时器
 */

;(function(window, $){  
  'use strict';

  // 是否是函数
  var isFunction = function(fn){
    return typeof fn === 'function';
  }


  /**
   * 构造器
   * @param {[type]} elem    [元素节点]
   * @param {[type]} options [参数]
   */
  function Timer(elem, options){
    var t = this;

    t.opts = $.extend(true, {}, Timer.defaultOpts, options || {});

    // 容器
    t.$container = $(elem);
    // 是否完成
    t.isDone = true;
    // 定时器
    t.timer = null;

    t.initialize();
  }

  // 初始化
  Timer.prototype.initialize = function(){
    var t = this;

    // 原始文本
    t.orignalTxt = t.$container.text();
    // 复制时间, 以防被修改
    t.seconds = t.opts.time < 0 ? t.opts.time = 0 : t.opts.time;

    t.onBeforeStart(t.opts.onBeforeStart);
    t.onAfterStart(t.opts.onAfterStart);
    t.onAfterEnd(t.opts.onAfterEnd);

    t.initEvents();
  }

  // 初始化事件
  Timer.prototype.initEvents = function(){
    var t = this;

    t.$container.on('click.Timer', function(){

      // 开始之前
      if(t.excuteStack(t.stackBeforeStart) === false){
        return;
      }

      // 开始
      t.start();
    })
  }

  // 开始
  Timer.prototype.start = function(){
    var t = this;

    // 未结束之前，直接返回, 不继续向下执行
    if(!t.isDone){
      return;
    }

    t.isDone = false;
    t.$container.html(t.seconds + 's');

    t.timer = window.setInterval(function(){ 
      t.tick.call(t);
    }, 1000);

    // 开始之后
    t.excuteStack(t.stackAfterStart);
  }

  // 停止
  Timer.prototype.stop = function(){
    var t = this;

    window.clearInterval(t.timer);
  }

  // tick
  Timer.prototype.tick = function(){
    var t = this;

    if(t.seconds <= 0){
      // 恢复初始状态
      t.isDone = true;
      t.seconds = t.opts.time;
      t.$container.html(t.orignalTxt);

      // 取消定时器
      window.clearInterval(t.timer);

      // 执行结束后的回调
      t.excuteStack(t.stackAfterEnd);

      return;
    }

    t.$container.html(--t.seconds + 's');
  }

  // 执行栈中的回调函数
  Timer.prototype.excuteStack = function(stack){ 
    var t = this;

    for(var i = 0; i < stack.length; i++){
      var value = stack[i].call(t);

      if(value === false){
        return false;
      }
    }
  }

  // 开始之前
  Timer.prototype.onBeforeStart = function(callback){
    var t = this;

    if(!t.stackBeforeStart){
      t.stackBeforeStart = [];
    }

    if(isFunction(callback)){
      t.stackBeforeStart.push(callback);
    }
  }

  // 开始之后
  Timer.prototype.onAfterStart = function(callback){
    var t = this;

    if(!t.stackAfterStart){
      t.stackAfterStart = [];
    }

    if(isFunction(callback)){
      t.stackAfterStart.push(callback);
    }
  }

  // 结束之后
  Timer.prototype.onAfterEnd = function(callback){
    var t = this;

    if(!t.stackAfterEnd){
      t.stackAfterEnd = [];
    }

    if(isFunction(callback)){
      t.stackAfterEnd.push(callback);
    }
  }

  // 默认参数
  Timer.defaultOpts = {
    // 时间-以秒为单位
    time: 60,
    // 开始前
    onBeforeStart: null,
    // 开始后
    onAfterStart: null
  }



  // 添加到jQuery原型上
  $.fn.skyTimer = function(options){
    if(this.length === 0){
      throw new Error('The elem is not exist!!!');
    }

    // 只实例化第一个
    return new Timer(this[0], options);
  };

})(window, jQuery);
