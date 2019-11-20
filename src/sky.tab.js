/**
 * tab 切换
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
      if (jq.length === 0) {
        jq = getJq(selector, window.document);
      }
    }

    return jq;
  };

  // 构造器
  function Tab(elem, options) {
    var t = this;

    t.opts = $.extend(true, {}, Tab.defaultOpts, options || {});

    t.$container = $(elem);

    // tabNav
    t.$tabNav = getJq(t.opts.tabNav, t.$container);
    t.$navs = t.$tabNav.children();
    t.length = t.$navs.length;

    // tabMain
    t.$tabMain = getJq(t.opts.tabMain, t.$container);
    t.$mains = t.$tabMain.children();

    t.initEvents();
  }

  // 事件
  Tab.prototype.initEvents = function () {
    var t = this;

    t.$navs.on(t.opts.event, function () {
      var i = $(this).index();
      t.toIndex(i);
    }).eq(t.opts.defaultIndex).trigger(t.opts.event);
  }

  Tab.prototype.toIndex = function (index) {
    var t = this;

    t.activeIndex = index;

    t.$navs.removeClass(t.opts.active)
      .eq(index).addClass(t.opts.active);

    t.$mains.hide().eq(index).show();

    typeof t.opts.onChange === 'function' && t.opts.onChange(t);
  }

  // 默认参数
  Tab.defaultOpts = {
    event: 'mouseover',
    tabNav: null,
    tabMain: null,
    active: 'on',
    defaultIndex: 0,
    onChange: null
  };


  // 挂载到jQuery原型上
  $.fn.skyTab = function (options) {
    if (this.length === 0) {
      var msg = this.selector || 'tab';
      throw new Error('\'' + msg + '\'' + ' is not exist！！！');
    }

    // 只实例化第一个
    return new Tab(this[0], options);
  }

})(window, jQuery);



