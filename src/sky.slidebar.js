/**
 * slidebar
 */


; (function (window, $) {
  'use strict';

  // 获取jQuery对象
  var getJq = function (selector, context) {
    var jq = null;
    context = context || window.document;

    if (context === window.document) {
      jq = $(selector);
      if (jq.length === 0) {
        throw new Error('$("' + selector + '") is not exist!!!');
      }
    } else {
      jq = $(selector, context);
      // 递归
      if (jq.length === 0) {
        jq = getJq(selector, window.document);
      }
    }

    return jq;
  };

  //构造器
  function Slidebar(elem, options) {
    var t = this;

    t.opts = $.extend(true, {}, Slidebar.defaultOpts, options || {});
    t.$container = $(elem);

    //开关
    t.$switcher = getJq(t.opts.switcher, t.$container);
    //父容器宽度,即展开和收起的宽度
    t.containerWidth = t.opts.hasPadding ? t.$container.outerWidth() : t.$container.width();
    //是否显示内容	
    t.isShow = t.opts.isShow;

    //获取方位
    t.direction = t.getDirection();
    //判定调用的事件函数
    t.effectFn = t.opts.eventType === 'click' ? t.clickDelegete : t.hoverDelegete;

    t.initialize();
  }

  //初始化
  Slidebar.prototype.initialize = function () {
    this.initStyle();
    this.initEvents();
  }

  //初始化样式
  Slidebar.prototype.initStyle = function () {
    var t = this;

    if (t.isShow) {
      t.$container.css(t.direction, 0);
      t.open();
    } else {
      t.$container.css(t.direction, -t.containerWidth);
      t.close();
    }
  }

  //初始化事件
  Slidebar.prototype.initEvents = function () {
    this.effectFn();
  }

  //获取方位
  Slidebar.prototype.getDirection = function () {
    var t = this;

    var offsetLeft = t.$container.offset().left;

    //判断左偏移是否大于父容器宽度
    if (offsetLeft >= t.containerWidth)
      return 'right';
    else
      return 'left';
  }

  //click事件
  Slidebar.prototype.clickDelegete = function () {
    var t = this;

    t.$switcher.on('click', function () {
      t.isShow ? t.close() : t.open();
    });
  }

  //hover事件
  Slidebar.prototype.hoverDelegete = function () {
    var t = this;

    t.$container.hover(function () {
      t.open();
    }, function () {
      t.close();
    });
  }

  //打开
  Slidebar.prototype.open = function () {
    var t = this;

    t.isShow = true;
    t.$switcher.removeClass(t.opts.switchOff).addClass(t.opts.switchOn);
    t.$container.stop(true).animate(
      t.direction == 'right' ? { right: 0 } : { left: 0 },
      t.opts.speed
    );
  }

  //关闭
  Slidebar.prototype.close = function () {
    var t = this;

    t.isShow = false;
    t.$switcher.removeClass(t.opts.switchOn).addClass(t.opts.switchOff);
    t.$container.stop(true).animate(
      t.direction == 'right' ? { right: -t.containerWidth } : { left: -t.containerWidth },
      t.opts.speed
    );
  }



  // 默认参数
  Slidebar.defaultOpts = {
    eventType: 'click',				// 事件类型	[hover, click]
    switcher: '.switcher',		// 开关选择器
    switchOn: 'switch-off',		// 开关打开时状态
    switchOff: 'switch-on',		// 开关关闭时状态
    hasPadding: true,					// 切换时, 移动的距离是否包含内边距和边框
    isShow: true,							// 是否显示
    speed: 300								// 动画时长
  }

  //挂载到jquery对象
  $.fn.skySlidebar = function (options) {
    if (this.length === 0) {
      throw new Error('The elem is not exist!!!');
    }

    // 只实例化第一个
    return new Slidebar(this[0], options);
  }

})(window, jQuery);



