/**
 * backtotop
 */

; (function (window, $) {
  'use strict';

  var $win = $(window),
    // firfox不支持 body.scorllTop
    $bodyHtml = $('body, html');

  /**
   * 构造器函数
   */
  function BackToTop(elem, options) {
    var t = this;

    t.opts = $.extend({}, BackToTop.defaultOpts, options || {});

    t.$btn = $(elem);

    t.initialize();
  }

  BackToTop.prototype.initialize = function () {
    var t = this;

    t.isAnimate = false;
    t.max = $win.height() * (t.opts.k || 1);

    if (!t.opts.isAuto) {
      t.$btn.show();
    }

    t.initEvents();
  }

  // 初始化事件
  BackToTop.prototype.initEvents = function () {
    var t = this;

    t.$btn.on(t.opts.event, function () {
      t.start();
    })

    if (t.opts.isAuto) {
      $win.on('scroll.BackToTop', function () {
        t.scroll();
      }).trigger('scroll.BackToTop');
    }

    $win.on('resize.BackToTop', function () {
      t.max = $win.height() * (t.opts.k || 1);
    })
  }

  // 滚动
  BackToTop.prototype.scroll = function () {
    var t = this;

    var scrollTop = $win.scrollTop();

    scrollTop >= t.max ? t.$btn.fadeIn() : t.$btn.fadeOut();
  }

  // 开始
  BackToTop.prototype.start = function () {
    var t = this;

    var event = 'wheel.BackToTop mousewheel.BackToTop DOMMouseScroll.BackToTop';

    if (t.isAnimate === true) {
      return;
    }

    t.isAnimate = true;

    // 运动期间 禁用滚轮
    $win.on(event, function () {
      return false;
    });

    // 动画
    $bodyHtml.animate({ scrollTop: 0 }, {
      easing: t.opts.easing,
      duration: t.opts.duration,
      step: function (now, fx) {
        console.log(now);
      },
      complete: function () {
        t.isAnimate = false;
        $win.off(event);
      }
    });
  }

  // 默认参数
  BackToTop.defaultOpts = {
    event: 'click',
    isAuto: true,     // 移动速度,越大速度越慢	
    k: 1,	            // 系数，屏幕高的倍数					
    duration: 800,    // 运动时间	
    easing: 'swing',  // 运动效果，复杂的运动需要插件		
  };


  // 挂载到 jQuery 原型上
  $.fn.skyBackToTop = function (options) {
    if (this.length === 0) {
      var msg = this.selector || 'backtotop';
      throw new Error('\'' + msg + '\'' + ' is not exist！！！');
    }

    // 只实例化第一个并返回
    return new BackToTop(this[0], options);
  }

})(window, jQuery);



