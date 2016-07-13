(function () {

  function init () {
    addEvent(window, 'unload', EventCache.flush);
    addEvent(window, 'resize', checkImages);
    checkImages();
  }

  function checkImages () {
    var i;
    var images = document.getElementsByClassName("imageFigure");

    for (i = 0; i < images.length; ++i) {
      if (isZoomable(images[i])) {
        makeZoomable(images[i]);
      }
    }
  }

  function makeZoomable (i) {
    i.className = i.className + " zoomable";
    i.style.transition = "transform 200ms ease-out";
    i.style.cursor = "zoom-in";
    i.zzz = {};
    i.zzz.style = {};
    i.zzz.style.position = getComputedStyle(i).getPropertyValue("position");
    i.zzz.style.zIndex = getComputedStyle(i).getPropertyValue("z-index");
    addEvent(i, 'click', zoomableHandler);
  }

  function isZoomable (imgToCheck) {
    var imgNatWidth = imgToCheck.naturalWidth;
    var imgNatHeight = imgToCheck.naturalHeight;
    var imgDisWidth = imgToCheck.clientWidth;
    var imgDisHeight = imgToCheck.clientHeight;
    var result = null;
    if (imgNatWidth > imgDisWidth || imgNatHeight > imgDisHeight) {
      if (imgDisWidth < (window.innerWidth - 20) && imgDisHeight < (window.innerHeight - 20)) {
        result = true;
      } else {
        result = false;
      }
    } else {
      result = false;
    }
    return result;
  }

  function zoomableHandler (e) {
    this.removeEventListener('click', zoomableHandler);
    scaleImageUp(this);
    addEvent(this, 'click', zoomedHandler);
    addEvent(window, 'scroll', zoomedHandler);
  }

  function zoomedHandler () {
    var o = document.getElementsByClassName("zoomableOverlay")[0];
    var i = document.getElementsByClassName("zoomed")[0];

    window.removeEventListener('scroll', zoomedHandler);
    i.removeEventListener('click', zoomedHandler);
    addEvent(i, 'click', zoomableHandler);

    scaleImageDown(i);
  }

  function scaleImageUp (i) {
    var iNatWidth = i.naturalWidth;
    var iNatHeight = i.naturalHeight;
    var iDisWidth = i.clientWidth;
    var iDisHeight = i.clientHeight;
    var iNewWidth = null;
    var iNewHeight = null;
    var ratio = null;
    var xTranslate = null;
    var yTranslate = null;
    // Calculate the scaling ratio
    if (window.innerWidth < iNatWidth) {
      iNewWidth = window.innerWidth - 20;
    } else if (window.innerHeight < iNatHeight) {
      iNewHeight = window.innerHeight - 20;
    } else {
      iNewWidth = i.naturalWidth;
      iNewHeight = i.naturalHeight;
    }
    if (iNewWidth > iNewHeight) {
      ratio = iNewWidth / iDisWidth;
    } else {
      ratio = iNewHeight / iDisHeight;
    }
    // Calculate the translate values
    var offsetX = i.getBoundingClientRect().left;
    var offsetY = i.getBoundingClientRect().top;
    var winCenterX = window.innerWidth / 2;
    var winCenterY = window.innerHeight / 2;
    var iCenterX = iDisWidth / 2;
    var iCenterY = iDisHeight / 2;

    xTranslate = (winCenterX - offsetX - iCenterX) / ratio;
    yTranslate = (winCenterY - offsetY - iCenterY) / ratio;

    i.style.transform = "scale(" + ratio + ") translateX(" + xTranslate + "px) translateY(" + yTranslate + "px)";
    i.style.cursor = "zoom-out";
    i.style.zIndex = 999;
    i.style.position = "relative";
    i.className = i.className.replace(" zoomable", " zoomed");
    showOverlay();
  }

  function scaleImageDown (i) {
    hideOverlay();
    i.style.transform = "scale(1)";
    i.style.cursor = "zoom-in";
    i.className = i.className.replace(" zoomed", " zoomable");
  }

  function showOverlay () {
    var i = document.getElementsByClassName("zoomed")[0];
    var o = document.createElement("DIV");

    addEvent(o, 'click', zoomedHandler);

    o.className = "zoomableOverlay";
    o.style.height = window.innerHeight + "px";
    o.style.width = window.innerWidth + "px";
    o.style.position = "fixed";
    o.style.top = 0;
    o.style.left = 0;
    o.style.cursor = "zoom-out";
    o.style.zIndex = 998;
    o.style.transition = "opacity 200ms linear";

    i.parentNode.insertBefore(o, i);

    o.style.opacity = 1;
  }

  function hideOverlay () {
    var o = document.getElementsByClassName("zoomableOverlay")[0];
    var i = document.getElementsByClassName("zoomed")[0];

    o.style.opacity = 0;

    var t = setTimeout(function () {
      o.remove();
      i.style.zIndex = i.zzz.style.zIndex;
      i.style.position = i.zzz.style.position;
      clearTimeout(t);
    }, 200);
  }

  // Cross browser get document size from http://james.padolsey.com/snippets/get-document-height-cross-browser/
  function getDocSize() {
      var d = document;
      var h = Math.max(d.body.scrollHeight, d.documentElement.scrollHeight, d.body.offsetHeight, d.documentElement.offsetHeight, d.body.clientHeight, d.documentElement.clientHeight);
      var w = Math.max(d.body.scrollWidth, d.documentElement.scrollWidth, d.body.offsetWidth, d.documentElement.offsetWidth, d.body.clientWidth, d.documentElement.clientWidth);
      return {
        height: h,
        width: w
      };
  }

  // Rock solid add event method by Dustin Diaz (http://dustindiaz.com/rock-solid-addevent)
  function addEvent (obj, type, fn) {
    if (obj.addEventListener) {
      obj.addEventListener( type, fn, false );
      EventCache.add(obj, type, fn);
    }
    else if (obj.attachEvent) {
      obj["e"+type+fn] = fn;
      obj[type+fn] = function() { obj["e"+type+fn]( window.event ); }
      obj.attachEvent( "on"+type, obj[type+fn] );
      EventCache.add(obj, type, fn);
    }
    else {
      obj["on"+type] = obj["e"+type+fn];
    }
  }

  // Store the event cache
  var EventCache = function () {
    var listEvents = [];
    return {
      listEvents : listEvents,
      add : function(node, sEventName, fHandler){
        listEvents.push(arguments);
      },
      flush : function(){
        var i, item;
        for(i = listEvents.length - 1; i >= 0; i = i - 1){
          item = listEvents[i];
          if(item[0].removeEventListener){
            item[0].removeEventListener(item[1], item[2], item[3]);
          };
          if(item[1].substring(0, 2) != "on"){
            item[1] = "on" + item[1];
          };
          if(item[0].detachEvent){
            item[0].detachEvent(item[1], item[2]);
          };
          item[0][item[1]] = null;
        };
      }
    };
  }();

  // Check wether or not the document is ready until it is ready
  var readyStateCheckInterval = setInterval(function() {
    if (document.readyState === "complete") {
      init();
      clearInterval(readyStateCheckInterval);
    }
  }, 10);
})();
