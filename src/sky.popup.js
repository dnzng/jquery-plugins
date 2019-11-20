/**
 * popup
 */

;(function(window, $){ 
  'use strict';
  
  // 转类数组
  var slice = Array.prototype.slice;
  
  // 是否是函数
  function isFunction( obj ){
    return typeof obj === 'function';	
  }

  // 获取 jQuery 对象
  function getJq( selector, context ){
    var jq = null;
    context = context || window.document;

    if(context === window.document){    
      jq = $(selector);
    }else{
      jq = $(selector, context);
      if(jq.length === 0){
        // 递归
        jq = getJq(selector, window.document);    
      }
    }

    return jq;
  };


  /**
   * 淡入淡出
   */
  function effectByFade( popup ){
    var t = popup;
    return {
      show: function( cb ){
        t.onAfterShow( cb );

        t.$container.fadeIn( t.opts.duration);
        t.$mask.stop( true ).fadeIn( t.opts.duration , function(){
          t.excuteStack( t.stackAfterShow );
        });
      },
      hide: function( cb ){
        t.onAfterHide( cb );

        t.$container.fadeOut( t.opts.duration );
        t.$mask.stop( true ).fadeOut( t.opts.duration , function(){
          t.excuteStack( t.stackAfterHide );
        });
      }
    }
  };



  /**
   * 构造器
   */
  function Popup(elem, options){  
    var t = this;

    t.opts = $.extend( true, {}, Popup.defaultOpts, options || {} );  

    t.$container = $( elem );
    t.$btnTrigger = $( t.opts.btnTrigger );
    t.$btnClose  = getJq( t.opts.btnClose, t.$container );

    t.$mask = Popup.mask;

    t.isVisible = false;

    t.onBeforeShow( t.opts.onBeforeShow );
    t.onAfterShow( t.opts.onAfterShow );
    t.onBeforeHide( t.opts.onBeforeHide );
    t.onAfterHide( t.opts.onAfterHide );

    t.initialize();
  };

  Popup.prototype.initialize = function(){
    var t = this;

    switch( t.opts.effect ){
      case 'fade': 
        t.effect = effectByFade(t);
      default: 
        t.effect = effectByFade(t);
    }

    t.initEvents();
  }

  // 初始化事件
  Popup.prototype.initEvents = function(){ 
    var t = this;

    // 显示按钮
    t.$btnTrigger.on('click', function(){
      t.show();
    });

    // 关闭按钮
    t.$btnClose.on('click', function(){
      // 隐藏
      t.hide();
    });
  };

  // 显示
  Popup.prototype.show = function( callback ){   
    // 先隐藏前一个,一次只显示一个弹窗
    if( Popup.refer && Popup.refer.isVisible ){ 
      Popup.refer.hide(); 
    }

    // 遮罩只添加一次，用挂载到构造函数上的静态变量refer，
    // 来引用当前显示的弹窗
    var t = Popup.refer = this;

    t.isVisible = true;

    if( !Popup.hasMask ){
      t.appendMask();
    }

    // 显示前
    if( t.excuteStack( t.stackBeforeShow ) === false ){
      return;
    }

    // 显示
    t.effect.show( callback );
    
    return this;
  };

  // 隐藏
  Popup.prototype.hide = function( callback ){
    var t = this;

    t.isVisible = false;

    // 隐藏前
    if( t.excuteStack(t.stackBeforeHide) === false ){
      return;
    }

    // 隐藏
    t.effect.hide( callback );

    return this;
  };

  // 添加遮罩 
  // 只添加一次  需初始化好事件
  Popup.prototype.appendMask = function(){
    var t = this;

    Popup.hasMask = true;

    t.$mask.addClass( t.opts.mask ).appendTo('body');

    t.$mask.on('click', function(){
      //遮罩只添加一次，永远指向当前显示的弹窗
      Popup.refer.hide()
    });
  };

  // 执行栈
  Popup.prototype.excuteStack = function( stack ){
    var t = this;
    
    // 将需要的参数,传递到栈中
    var rest = slice.call( arguments ).slice(1);
    for( var i = 0; i < stack.length; i++ ) {
      var value = stack[i].apply(t, rest);

      //返回false时，阻断向下执行
      if( value === false ){
        return false;
      }
    }
  };

  // 显示前
  Popup.prototype.onBeforeShow = function( callback ){
    var t = this;

    if( !t.stackBeforeShow ){
      t.stackBeforeShow = [];
    }

    if( isFunction( callback ) ){
      t.stackBeforeShow.push( callback );
    }

    return this;
  };

  // 显示后
  Popup.prototype.onAfterShow = function( callback ){
    var t = this;
    
    if( !t.stackAfterShow ){
      t.stackAfterShow = [];
    }

    if( isFunction(callback) ){
      t.stackAfterShow.push( callback );
    }

    return this;
  };

  // 隐藏前
  Popup.prototype.onBeforeHide = function( callback ){
    var t = this;
    
    if( !t.stackBeforeHide ){
      t.stackBeforeHide = [];
    }
    
    if( isFunction(callback) ){
      t.stackBeforeHide.push( callback );
    }

    return this;
  };

  // 隐藏后
  Popup.prototype.onAfterHide = function( callback ){
    var t = this;
    
    if( !t.stackAfterHide ){
      t.stackAfterHide = [];
    }
    
    if( isFunction(callback) ){
      t.stackAfterHide.push( callback );
    }

    return this;
  };

 
  // 显示哪个弹窗
  Popup.refer = null;

  // 是否有遮罩层
  Popup.hasMask = false;

  // 遮罩层DOM
  Popup.mask = $('<div/>');

  // 默认参数
  Popup.defaultOpts = {
    // 显示效果
    effect: 'fade',
    // 打开按钮
    btnTrigger: null,
    // 关闭按钮
    btnClose: null,
    // 动画时长
    duration: 300,
    // 遮罩层
    mask: 'popup-mask',
    // 显示前
    onBeforeShow: null,
    // 显示后
    onAfterShow: null,
    // 隐藏前
    onBeforeHide: null,
    // 隐藏后
    onAfterHide: null
  };
  
  // 挂载到 jQuery 原型上
  $.fn.skyPopup = function( options ){
    if( this.length === 0 ){
      var msg = this.selector || 'popup';
      throw new Error( '\'' + msg + '\'' + ' is not exist！！！');
    }

    // 只实例化第一个
    return new Popup( this[0], options );
  }

})(window, jQuery);



