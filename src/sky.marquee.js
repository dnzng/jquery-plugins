/**
 * marquee
 */

; (function (window, $) {
  'use strict';

  // 构造器
  function Marquee(elem, options) {
    var t = this;

    t.opts = $.extend(true, {}, Marquee.defaultOpts, options || {});

    // 各容器
    t.$container = $(elem);
    t.$wrap = t.$container.children();
    t.eleWrap = t.$wrap.get(0);
    t.$slides = t.$wrap.children();

    t.initialize();
  }

  // 初始化
  Marquee.prototype.initialize = function () {
    var t = this;

    t.cssProp = t.opts.direction;
    t.length = t.$slides.length;

    // slideSize
    function getSlideSize(total) {
      return (total - (t.opts.itemsPerView - 1) * t.opts.spaceBetween) / t.opts.itemsPerView;
    }
    if (t.cssProp === 'left' || t.cssProp === 'right') {
      t.slideSize = getSlideSize(t.$container.width());
      t.slideCss = 'width';
    } else {
      t.slideSize = getSlideSize(t.$container.height());
      t.slideCss = 'height';
    }

    // 最大距离
    t.maxDistance = (t.slideSize + t.opts.spaceBetween) * t.length;

    // 修正子元素和 cssProp
    if (t.length <= t.opts.itemsPerView) {
      if (t.cssProp === 'right') {
        t.cssProp = 'left';
      }
      if (t.cssProp === 'bottom') {
        t.cssProp = 'top';
      }
    } else {
      t.eleWrap.innerHTML += t.eleWrap.innerHTML;
      t.length *= 2;
      t.$slides = t.$wrap.children();
    }

    t.initLayout();
    t.initEvents();
  }

  Marquee.prototype.initLayout = function () {
    var t = this;

    // 设置slide
    t.$slides.each(function (i) {
      $(this).css({
        position: 'absolute',
        overflow: 'hidden'
      });
      $(this).css(t.slideCss, t.slideSize);
      $(this).css(t.cssProp, i * (t.slideSize + t.opts.spaceBetween));
    });

    // 设置wrap
    t.$wrap.css('position', 'absolute');
    t.$wrap.css(t.opts.direction, 0);
  }

  Marquee.prototype.initEvents = function () {
    var t = this;

    if (t.length <= t.opts.itemsPerView) {
      return;
    }

    t.$container.on('mouseover', function () {
      t.pause();
    });

    t.$container.on('mouseout', function () {
      t.play();
    }).trigger('mouseout');
  }

  // 开始
  Marquee.prototype.play = function () {
    var t = this;

    t.timer = setInterval(function () {
      t.tick();
    }, t.opts.time);
  }

  // 暂停
  Marquee.prototype.pause = function () {
    var t = this;

    window.clearInterval(t.timer);
  }

  // tick 
  // 核心算法和逻辑
  Marquee.prototype.tick = function () {
    var t = this;

    // 滚动距离
    var distance = Math.abs(parseInt(t.$wrap.css(t.cssProp))) || 0;

    // 修正滚动
    if (distance >= t.maxDistance) {
      t.$wrap.css(t.cssProp, 0);
    }

    // 实现滚动
    t.$wrap.css(t.cssProp, '-=' + t.opts.speed);
  }


  // 默认参数
  Marquee.defaultOpts = {
    direction: 'left',	// 方向
    spaceBetween: 10,		// 间隔
    itemsPerView: 3,		// 显示个数
    speed: 1,						// 速度
    time: 30						// 每隔time移动一个speed,单位ms
  };


  // 挂载到jQuery原型上
  $.fn.skyMarquee = function (options) {
    if (this.length === 0) {
      throw new Error('The elem is not exist!!!');
    }

    // 只实例化第一个
    return new Marquee(this[0], options);
  }

})(window, jQuery);



