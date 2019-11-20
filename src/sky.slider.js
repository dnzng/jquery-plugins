/**
 * slider
 */

;(function(window, $){
  'use strict';

  // 获取jQuery对象
  var getJq = function(selector, context){
    var jq = null;
    context = context || window.document;

    if(context === window.document){
      jq = $(selector);
      /*if(jq.length === 0){
        throw new Error('$("' + selector + '") is not exist!!!');
      }*/
    }else{
      jq = $(selector, context);
      if(jq.length === 0){
        // 递归
        jq = getJq(selector, window.document);
      }
    }

    return jq;
  };
  
  // 构造器
  function Slider(elem, options){
    var t = this;

    t.opts = $.extend(true, {}, Slider.defaultOpts, options || {});

    t.$container = $(elem);
    t.$wrapper = getJq(t.opts.wrapper, t.$container);
    t.$btnPrev = getJq(t.opts.btnPrev, t.$container);
    t.$btnNext = getJq(t.opts.btnNext, t.$container);
    t.$indicator = getJq(t.opts.indicator, t.$container);

    t.$slides = t.$wrapper.children(t.opts.slide);

    t.initialize();
  }

  Slider.prototype.initialize = function(){
    var t = this;

    t.index = t.opts.defaultIndex;
    t.count = t.$slides.length;           	
    t.containerWidth = t.$container.width();
    t.containerHeight = t.$container.height();

    //是否正在执行动画
    t.isAnimate = false;						

    var upperName = t.opts.effect.charAt(0).toUpperCase() + t.opts.effect.substr(1);
    t.effectFn = t['changeBy' + upperName];

    t.initLayout();
    t.ininEvents();
  }

  // 初始化布局
  Slider.prototype.initLayout = function(){
    var t = this;

    t.$wrapper.css('position', 'relative');
    t.$slides.css({display: 'none', position: 'absolute'});
    t.$slides.eq(t.index).css('display', 'block');

    // 初始化上下按钮
    if(t.opts.autoArrowVisible){
      t.$btnPrev.hide();
      t.$btnNext.hide();
    }

    // 初始化指示器
    if(t.$indicator.length){
      t.initIndicator();
    }
  }

  // 初始化指示器
  Slider.prototype.initIndicator = function(){  
    var t = this;

    var indicatorHTML = '',	
      dotClass = t.opts.dot.substr(1);		
    for(var i = 0; i < t.count; i++){
      indicatorHTML += '<' + t.opts.indicatorChildTag + ' class="' + dotClass + '"></' + t.opts.indicatorChildTag + '>'
    }
    t.$indicator.html(indicatorHTML); 		
    t.$dots = t.$indicator.children();  		

    // 初始化样式
    t.$dots.removeClass(t.opts.active)
      .eq(t.index).addClass(t.opts.active);

    // 初始化事件
    t.$dots.on(t.opts.eventType, function(){
      var i = $(this).index();
      t.setIndex(i);
    });
  }

  // 初始化事件
  Slider.prototype.ininEvents = function(){
    var t = this;

    if(t.$btnPrev.length || t.$btnNext.length){
      t.$btnPrev.on('click', function(){
        t.prev();
      })

      t.$btnNext.on('click', function(){
        t.next();
      })
    }

    t.$container.hover(function(){
      if(t.opts.autoArrowVisible){
        t.$btnPrev.stop(true).fadeIn();
        t.$btnNext.stop(true).fadeIn();
      }
    },function(){
      if(t.opts.autoArrowVisible){
        t.$btnPrev.stop(true).fadeOut();
        t.$btnNext.stop(true).fadeOut();
      }
    });

    // 自动播放
    t.checkAutoPlay();
  }

  // fade
  Slider.prototype.changeByFade = function(index){   
    var t = this;

    t.$slides.fadeOut(t.opts.speed)
      .css('z-index', 2)
        .eq(index)
          .css('z-index', 5)
            .stop(true, true)
              .fadeIn(t.opts.speed);
  }

  // slide
  Slider.prototype.changeByScroll = function(index){ 
    var t = this;   

    var scrollWidth = (index > t.index) ? t.containerWidth : -t.containerWidth;  
    var itemNew = t.$slides.eq(index); 		
    var itemOld = t.$slides.eq(t.index);  	

    t.isAnimate = true;

    // 动画结束回调
    function doFinish() {  
      itemOld.css('display', 'none');
      t.isAnimate = false;
    }

    // 移除旧的元素
    itemOld.animate({left: -scrollWidth}, t.opts.speed);
    // 移入新的元素
    itemNew.css({ display: 'block', left: scrollWidth})
        .animate({left: 0}, t.opts.speed, doFinish);
  }

  Slider.prototype.checkAutoPlay = function(){  
    var t = this;			

    if(t.opts.autoPlay){  
      if(t.timer){
        window.clearTimeout(t.timer);
        t.timer = null;
      }
      t.timer = window.setTimeout(function(){ 
        t.next();
      }, t.opts.autoDelay);
    }		
  }

  // 上一个
  Slider.prototype.prev = function(){
    var t = this;

    t.setIndex(t.index - 1);
  }

  // 下一个
  Slider.prototype.next = function(){
    var t = this;

    t.setIndex(t.index + 1);
  }

  Slider.prototype.setIndex = function(index){ 
    var t = this;		

    if(index < 0){ index = t.count - 1; }
    if(index >= t.count){ index = 0; }

    t.changeTo(index);
  }

  // 核心逻辑
  Slider.prototype.changeTo = function(index){
    var t = this;

    // 跳转到当前或动画未结束，直接返回
    if(t.index === index || t.isAnimate) return;

    t.effectFn.call(t, index);
    t.index = index;

    if(t.$indicator.length){
      t.$dots.removeClass(t.opts.active)
          .eq(index).addClass(t.opts.active);
    }

    // 效果完成后继续执行
    t.checkAutoPlay();
  }

  // 默认参数
  Slider.defaultOpts = {
    effect: 'fade',								//效果  fade|scroll
    defaultIndex: 0,							//默认下标

    slidesPerView: 1,							//每屏显示个数

    wrapper: '.slider-wrapper',					//slide容器
    slide: '.slider-slide',						//slide

    btnPrev: null,								//上一个按钮	
    btnNext: null,								//下一个按钮

    eventType: 'mouseover',						//指示器事件
    indicator: null,							//指示器容器
    indicatorChildTag: 'a',						//指示器容器子标签
    dot: '.slider-dot',							//指示器子元素类名
    active: 'on',								//指示器当前类名

    autoPlay: true,								//是否自动播放
    autoArrowVisible: false,					//按钮是否自动显示
    autoDelay: 2500,							//切换时间
    speed: 500									//变化速度
  };
  

  // 挂载到jQuery原型上
  $.fn.skySlider = function(options){
    if(this.length === 0){
      throw new Error('The elem is not exist!!!');
    }

    // 只实例化第一个并返回
    return new Slider(this[0], options);
  }

})(window, jQuery);



