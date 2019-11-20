/**
 * select
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
      if (jq.length === 0) {
        jq = getJq(selector, window.document);
      }
    }

    return jq;
  };

  // 构造器
  function Select(elem, options) {
    var t = this;

    t.opts = $.extend(true, {}, Select.defaultOpts, options || {});

    t.$container = $(elem);
    t.$checked = getJq(t.opts.checked, t.$container);
    t.$listWrap = getJq(t.opts.listWrap, t.$container);
    t.$list = getJq(t.opts.listTag, t.$listWrap);

    t.listWrapElem = t.$listWrap.get(0);

    t.initialize();
  }

  Select.prototype.initialize = function () {
    var t = this;

    t.initEvents();
  }

  Select.prototype.initEvents = function () {
    var t = this;

    t.checkedClickEvent();
    t.listScrollEvent();
    t.listClickEvent();
    t.docClickEvent();
  }

  // 选中框点击事件
  Select.prototype.checkedClickEvent = function () {
    var t = this;

    // 选中框事件
    t.$checked.on('click', function () {
      t.$listWrap.stop(true).toggle();
    });

    // 选中框禁止选取
    t.$checked.on('selectstart', function () {
      return false;
    })
  }

  // 列表点击事件
  Select.prototype.listClickEvent = function () {
    var t = this;

    var txt;
    var fn = function () {
      txt = $(this).text();
      t.$checked.text(txt);
      t.$listWrap.stop(true).hide();
    }

    if (t.opts.listTag === 'ul') {
      t.$list.on('click', 'li', function () {
        fn.call(this);
      })
    } else {
      t.$list.on('click', function () {
        fn.call(this);
      })
    }

  }

  // 滚轮事件
  Select.prototype.listScrollEvent = function (event) {
    var t = this;

    // 系数、滚动值	、当前值
    var k, delta, curr;
    var wheelEvent = 'wheel mousewheel DOMMouseScroll';
    var docWheelEvent = 'wheel.DocWheel mousewheel.DocWheel DOMMouseScroll.DocWheel';

    // 滑轮事件
    t.$listWrap.on(wheelEvent, function (e) {

      e = e.originalEvent;
      delta = e.deltaY || -e.wheelDelta || e.detail;
      delta === 0 ?
        k = 0 :
        k = delta > 0 ? 1 : -1;

      curr = t.$listWrap.scrollTop();

      t.$listWrap.scrollTop(curr + k * t.opts.speed);

    })

    // 滚动时禁止浏览器滚动
    t.$listWrap.hover(function () {
      $doc.on(docWheelEvent, function () {
        return false;
      })
    }, function () {
      $doc.off('.DocWheel');
    });
  }

  // 文档点击事件
  Select.prototype.docClickEvent = function () {
    var t = this;

    var flag;

    $doc.on('click.Select', function (e) {
      flag = !!t.$container.has(e.target).length;

      if (!flag) {
        t.$listWrap.stop(true).hide();
      }
    })
  }

  // 默认参数
  Select.defaultOpts = {
    checked: null,    // 选中框
    listWrap: null,   // 列表容器
    listTag: 'ul',    // 列表标签
    speed: 20,        // 滚动速度
  };


  // 挂载到jQuery原型上
  $.fn.skySelect = function (options) {
    if (this.length === 0) {
      throw new Error('The elem is not exist!!!');
    }

    // 只实例化第一个并返回
    return new Select(this[0], options);
  }

})(window, jQuery);



