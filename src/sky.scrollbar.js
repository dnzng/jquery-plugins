/**
 *
 * scrollBar:
 *
 * 滚动条是：滑块移动，滚动条不动
 * 窗口是：  整个内容移动，窗口不动
 *
 * 窗口滚动 等价于 滑块的top在移动
 * 窗口高度 等价于 滑块的高度
 *
 * 位移、高度不同，但比率相同
 *
 * 核心算法：
 * 滚动比：
 * panel.scrollTop / panel.scrollHeight == bar.top / scrollbar.height
 * 高度比：
 * container.height / panel.scrollHeight == bar.offsetHeight / scrollbar.height
 * 
 * 注：
 * 1、panel的高度会变化且overflow:hidden时, jquery不能获取滚动的总大小，必须使用panel.scrollHeight来获取panel的总高度
 * 2、由于panel的变化，所以bar的高度也会跟着变化，所以使用bar.offsetHeight
 * 3、其它变量初始化确定
 * 
 */

; (function (window, $) {
  'use strict';

  var $doc = $(window.document);

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


  // 构造器
  function ScrollBar(elem, options) {
    var t = this;

    t.opts = $.extend(true, {}, ScrollBar.defaultOpts, options || {});

    t.$container = $(elem);
    t.$panel = getJq(t.opts.panel, t.$container);
    t.$track = getJq(t.opts.track, t.$container);
    t.$bar = t.$track.children(t.opts.bar);

    t.initialize();
  };

  ScrollBar.prototype.initialize = function () {
    var t = this;

    t.panelElem = t.$panel.get(0);
    t.barElem = t.$bar.get(0);

    t.scrollVal = 0;

    if (t.opts.direction === 'vertical') {
      t.containerSize = t.$container.height();			// 确定需要的容器大小
      t.trackSize = t.$track.height();							// 确定需要的滑道大小
      t.scrollTotalProp = 'scrollHeight';						// 确定需要滚动总大小的属性
      t.scrollPosProp = 'scrollTop';								// 确定滚动方位

      t.barSizeCss = 'height';		// 确定bar大小的css属性
      t.barPosCss = 'top';				// 确定bar方位的css属性
    }

    if (t.opts.direction === 'horizontal') {
      t.containerSize = t.$container.width();
      t.trackSize = t.$track.width();
      t.scrollTotalProp = 'scrollWidth';
      t.scrollPosProp = 'scrollLeft';

      t.barSizeCss = 'width';
      t.barPosCss = 'left';
    }

    t.updateLayout();
    t.initEvents();
  };

  // 设置比率
  // 核心算法
  ScrollBar.prototype.setAspectRatio = function () {
    var t = this;

    // 最大滚动距离
    t.maxScrollVal = t.panelElem[t.scrollTotalProp] - t.containerSize;

    if (t.scrollVal < 0) {
      t.scrollVal = 0;
    }

    if (t.scrollVal > t.maxScrollVal) {
      t.scrollVal = t.maxScrollVal;
    }

    // 距顶/左比
    t.aspectTop = t.scrollVal / t.panelElem[t.scrollTotalProp];
    // 大小比
    t.aspectSize = t.containerSize / t.panelElem[t.scrollTotalProp];
  }

  // 更新布局
  // 核心逻辑
  ScrollBar.prototype.updateLayout = function () {
    var t = this;

    // 更新比率
    t.setAspectRatio();

    // 更新panel
    t.$panel[t.scrollPosProp](t.scrollVal);

    // 更新track
    t.containerSize >= t.panelElem[t.scrollTotalProp] ? t.$track.hide() : t.$track.show();

    // JSON字符串转JSON对象
    var opts = $.parseJSON('{"' + t.barPosCss + '":' + Math.ceil(t.aspectTop * t.trackSize) + '}');
    // 更新bar
    t.$bar.css(t.barSizeCss, t.aspectSize * t.trackSize)
      .stop(true, true)
      .animate(opts, t.opts.time);
  }

  // 初始化事件
  ScrollBar.prototype.initEvents = function () {
    var t = this;

    t.wheelEvent();
    t.trackEvent();
    t.barEvent();
  }

  // 滚轮事件
  ScrollBar.prototype.wheelEvent = function () {
    var t = this;

    var k, delta;		// 系数、滚动值
    var wheelEvent = 'wheel mousewheel DOMMouseScroll';
    var docWheelEvent = 'wheel.DocWheel mousewheel.DocWheel DOMMouseScroll.DocWheel';

    t.$container.on(wheelEvent, function (e) {

      e = e.originalEvent;
      delta = e.deltaY || -e.wheelDelta || e.detail;
      delta === 0 ?
        k = 0 :
        k = delta > 0 ? 1 : -1;

      t.scrollVal = t.panelElem[t.scrollPosProp] + k * t.opts.speed;
      t.updateLayout();
    });

    // 禁止浏览器默认滚动
    t.$container.hover(function () {
      $doc.on(docWheelEvent, function () {
        return false;
      })
    }, function () {
      $doc.off('.DocWheel');
    });
  }

  // 获取相对于track的鼠标距离
  ScrollBar.prototype.getPos = function (event) {
    var t = this;

    // 出现滚动条时需加上文档滚动距离
    // offset是相对当前文档的
    if (t.opts.direction === 'vertical') {
      return $doc.scrollTop() + event.clientY - t.$track.offset().top;
    } else {
      return $doc.scrollLeft() + event.clientX - t.$track.offset().left;
    }
  }

  // 滑道事件
  ScrollBar.prototype.trackEvent = function () {
    var t = this;

    t.$track.on('mousedown', function (e) {
      t.setTrack(e);
    });
  }

  // 设置滑道
  ScrollBar.prototype.setTrack = function (event) {
    var t = this;

    var pos = t.getPos(event);

    // bar的位移 转成 panel的scrollTop,  且鼠标居于滑块中心
    t.scrollVal = (pos - t.$bar[t.barSizeCss]() / 2) / t.trackSize * t.panelElem[t.scrollTotalProp];
    t.updateLayout();
  }

  // bar事件
  ScrollBar.prototype.barEvent = function () {
    var t = this;

    // 按下
    t.$bar.on('mousedown', function (e) {
      var pos = t.getPos(e);

      var distance = pos - t.$bar.position()[t.barPosCss];

      // 移动
      $doc.on('mousemove.DocMove', function (e) {
        t.setBar(e, distance);
      })

      // 移动期间,禁用选取
      $doc.on('selectstart.DocMove', function () {
        return false;
      })

      // 松开时, 删除DocMove域中的所有事件
      $doc.on('mouseup.DocMove', function () {
        $doc.off('.DocMove');
      });

      // 阻止冒泡到track上
      return false;
    });
  }

  // 设置滑块
  ScrollBar.prototype.setBar = function (event, distance) {
    var t = this;

    var pos = t.getPos(event);

    // bar的位移 转 panel的scrollVal
    t.scrollVal = (pos - distance) / t.trackSize * t.panelElem[t.scrollTotalProp];
    t.updateLayout();
  }

  // 调到具体位置
  ScrollBar.prototype.jump = function (number) {
    var t = this;

    t.scrollVal = parseFloat(number);
    t.updateLayout();
  }

  // 默认参数
  ScrollBar.defaultOpts = {
    direction: 'vertical',				// 方向：horizontal | vertical
    panel: '.scrollbar-panel',		// 内容面板
    track: '.scrollbar-track',		// 滑道
    bar: '.bar',									// 滑块
    speed: 30,										// 滚轮每次滚动距离
    time: 100										  // 滑块滚动时间
  };


  // 挂载到jQuery原型上
  $.fn.skyScrollBar = function (options) {
    if (this.length === 0) {
      throw new Error('The elem is not exist!!!');
    }

    // 只实例化第一个并返回
    return new ScrollBar(this[0], options);
  }

})(window, jQuery);



