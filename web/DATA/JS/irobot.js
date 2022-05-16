$(document).ready(function () {
  //載入完成要執行init
  $("#module_wrapper")
    .unbind()
    .bind("compLoaded", function () {
      //lowlag audios
      var tempSound = $(this).find("audio");
      if (tempSound.length > 0) {
        tempSound.each(function () {
          if ($SFXNameAr.indexOf($(this).attr("src")) == -1) {
            $SFXNameAr.push($(this).attr("src"));
            $SFXAr.push(new Audio($(this).attr("src")));
          }
        });
      }

      //hammer
      trigHammer();

      //tabs
      $(".tabs > span")
        .unbind()
        .bind("click", function () {
          if (!$(this).hasClass("selected")) {
            if (!lowlaged) {
              lowlaged = true;
              lowlagSFX();
              activeSFX();
            }
            //init
            $(this)
              .addClass("selected")
              .siblings(".selected")
              .removeClass("selected");
            openContent($(this).index());
          }
        });
      if ($(".tabs > span").length < 2) {
        $(".tabs").hide();
      }

      //sidetool
      $(".sideTool > div.btn_replay")
        .unbind()
        .bind("click", function () {
          $(this).hide();
          resetElem($(".contents > div.selected"));
        });
      //
      $(".sideTool > div.btn_answer")
        .unbind()
        .bind("click", function () {
          showAnswer();
        });

      //init

      $(this)
        .addClass("loaded")
        .delay(500)
        .queue(function () {
          $(".tabs > span").eq(0).click();
          $(this).dequeue().unbind();
        });
      deactiveLoading();
    });

  //create content

  //assetsPreload img
  $("#module_wrapper")
    .find("img")
    .each(function () {
      var src = $(this).attr("src");
      $("#module_wrapper > .assetsPreload").append(`<img src="${src}" />`);
    });
  //check loading
  checkCompLoading("#module_wrapper");

  $("#module_wrapper .units-title")
    .addClass("l" + lid)
    .text(getLessonName());
  $("#module_wrapper .tabs").addClass("l" + lid);
});

var lowlaged = false;
var lastPosX = 0;
var lastPosY = 0;
var isDragging = false;
var $elem = null;
var mopCounter = 0;
var shrink = 0.6;
var forceStop = false;

var trigHammer = function () {
  //hammer
  var myElement = document.getElementById("contents");
  var mc = new Hammer(myElement);
  mc.get("pan").set({ direction: Hammer.DIRECTION_ALL, threshold: 1 });
  mc.get("press").set({ time: 1 });
  mc.on("press", function (ev) {
    define$Elem(ev);
  });
  mc.on("pressup", function (ev) {
    isDragging = false;
    $elem = null;
  });
  mc.on("pan", function (ev) {
    if ($elem == null) {
      define$Elem(ev);
    }
    handleDrag(ev);
  });
};

var handleDrag = function (ev) {
  var mopgroup = $($elem).parent();
  if (!isDragging && $elem != null) {
    isDragging = true;
    mopCounter = 0;
    if (mopgroup.hasClass("mop-group")) {
      $("#module_wrapper").append(
        `<div id="fingerAvatar" class="fingerAvatar"><img src="./DATA/IMAGES/COMMON/finger2.png"/></div>`
      );
    }
  }

  if (isDragging && $elem && !forceStop) {
    //drag clon card

    if (mopgroup.hasClass("mop-group")) {
      var deltaContainerX = $("#module_wrapper").offset().left;
      var deltaContainerY = $("#module_wrapper").offset().top;
      $("#fingerAvatar").get(0).style.top =
        Math.round(
          ev.center.y / stageRatioReal -
            deltaContainerY / stageRatioReal -
            $("#fingerAvatar").height() / stageRatioReal / 2
        ) + "px";
      $("#fingerAvatar").get(0).style.left =
        Math.round(
          ev.center.x / stageRatioReal -
            deltaContainerX / stageRatioReal -
            $("#fingerAvatar").width() / stageRatioReal / 2
        ) + "px";
      if (
        mopgroup.find(">span").length != mopgroup.find(">span.onmop").length
      ) {
        checkCollision(ev);
      } else {
        forceStop = true;
        if ($($elem).parent().hasClass("mop-group")) {
          checkMopStatus();
        }
      }
    }
  }

  if (ev.isFinal) {
    if ($($elem).parent().hasClass("mop-group") && !forceStop) {
      checkMopStatus();
    }
    //then
    mopCounter = 0;
    forceStop = false;
    isDragging = false;
    $elem = null;
  }
};

var checkCollision = function (ev) {
  var lastX = ev.center.x;
  var lastY = ev.center.y;
  var mopgroup = $($elem).parent();

  mopgroup.find(">span").each(function () {
    var oriX = $(this).offset().left + ($(this).width() * (1 - shrink)) / 2;
    var oriW = oriX + $(this).width() * shrink;
    var oriY = $(this).offset().top + ($(this).width() * (1 - shrink)) / 2;
    var oriH = oriY + $(this).height() * shrink;
    if (lastX >= oriX && lastX <= oriW && lastY >= oriY && lastY <= oriH) {
      if (!$(this).hasClass("last")) {
        //check neighbor
        var isNeighbor = false;
        if (mopgroup.find(".last").length > 0) {
          var ppx = mopgroup.find(".last").attr("px");
          var ppy = mopgroup.find(".last").attr("py");
          var cpx = $(this).attr("px");
          var cpy = $(this).attr("py");
          var dx = parseInt(cpx) - parseInt(ppx);
          var dy = parseInt(cpy) - parseInt(ppy);
          //需相鄰
          if (Math.abs(dx) <= 1 && Math.abs(dy) <= 1 && dx * dy == 0) {
            isNeighbor = true;
          }
        } else {
          //第一個區域
          isNeighbor = true;
        }
        //為鄰近區域
        if (isNeighbor) {
          rootSoundEffect($show);
          mopCounter += 1;
          var directClass = "";
          //是否畫線條
          if (ppx) {
            if (dx > 0 && dy == 0) {
              //to right
              directClass = "tr";
            } else if (dx < 0 && dy == 0) {
              //to left
              directClass = "tl";
            } else if (dx == 0 && dy > 0) {
              //to down
              directClass = "td";
            } else if (dx == 0 && dy < 0) {
              //to top
              directClass = "tt";
            } else if (dx > 0 && dy > 0) {
              //to right down
              directClass = "tdr";
            } else if (dx > 0 && dy < 0) {
              //to right top
              directClass = "ttr";
            } else if (dx < 0 && dy > 0) {
              //to left down
              directClass = "tdl";
            } else if (dx < 0 && dy < 0) {
              //to left top
              directClass = "ttl";
            }
          } else {
            $(this).addClass("last");
          }
          //canvas
          var mopgroupCanvas = mopgroup.find("canvas").get(0);
          var cctx = mopgroupCanvas.getContext("2d");
          cctx.strokeStyle = "#ff0000";

          cctx.lineCap = "round";
          cctx.lineJoin = "round";
          cctx.beginPath();
          var mtw = parseInt(mopgroup.find(".last").get(0).style.width);
          var mth = parseInt(mopgroup.find(".last").get(0).style.height);
          cctx.lineWidth = mtw * 0.2;
          cctx.moveTo(
            parseInt(mopgroup.find(".last").get(0).style.left) + mtw / 2,
            parseInt(mopgroup.find(".last").get(0).style.top) + mth / 2
          );
          var ltw = parseInt($(this).get(0).style.width);
          var lth = parseInt($(this).get(0).style.height);
          cctx.lineTo(
            parseInt($(this).get(0).style.left) + ltw / 2,
            parseInt($(this).get(0).style.top) + lth / 2
          );

          //cctx.closePath();
          cctx.stroke();

          //mopped
          $(this)
            .removeClass("tl tr td tt ttl ttr tdl tdr")
            .addClass("onmop last " + directClass)
            .attr("ans", mopCounter)
            .siblings(".last")
            .removeClass("last");
          //updateFrame
          updateFrame($(this));
        }
      }
    }
  });
};

var checkMopStatus = function () {
  var mopgroup = $($elem).parent();
  if (mopgroup.find(">span").length == mopgroup.find(">span.onmop").length) {
    //
    drawArrow();
    //全部區域完成
    rootSoundEffect($chimes);
    var uniq = new Date().getTime();
    mopgroup.append(
      `<div class="smoke"><img src="./DATA/IMAGES/common/chimes.gif?uniq=${uniq}"/></div>`
    );
    $(".smoke")
      .delay(1000)
      .queue(function () {
        $(this).dequeue().remove();
      });
    $(".sideTool > div.btn_replay").show();
  } else {
    //區域尚未完成

    //////重設
    mopgroup.find("> span").each(function () {
      $(this)
        .removeAttr("ans")
        .removeClass("onmop mopped last tl tr td tt ttl ttr tdl tdr");
      if ($(this).attr("preset")) {
        $(this).text($(this).attr("preset"));
      } else {
        $(this).text("");
      }
    });
    //canvas clean
    mopgroup.each(function () {
      var mopgroupCanvas = $(this).find("canvas").get(0);
      var cctx = mopgroupCanvas.getContext("2d");
      cctx.clearRect(
        0,
        0,
        $(mopgroupCanvas).attr("width"),
        $(mopgroupCanvas).attr("height")
      );
    });
    //
    resetFrame();
    rootSoundEffect($fail);
    var uniq = new Date().getTime();
    mopgroup.append(
      `<div class="smoke"><img src="./DATA/IMAGES/common/smoke2.gif?uniq=${uniq}"/></div>`
    );
    $(".smoke")
      .delay(1000)
      .queue(function () {
        $(this).dequeue().remove();
      });
  }
  $(".fingerAvatar").remove();
};

var drawArrow = function () {
  var mopgroup = $($elem).parent();
  var tarSpan = mopgroup.find("> span.last");
  var degree = 0;

  if (tarSpan.hasClass("tr")) {
    degree = 0;
  } else if (tarSpan.hasClass("tl")) {
    degree = 180;
  } else if (tarSpan.hasClass("tt")) {
    degree = -90;
  } else if (tarSpan.hasClass("td")) {
    degree = 90;
  } else if (tarSpan.hasClass("tdr")) {
    degree = 45;
  } else if (tarSpan.hasClass("ttr")) {
    degree = -45;
  } else if (tarSpan.hasClass("tdl")) {
    degree = 135;
  } else if (tarSpan.hasClass("ttl")) {
    degree = -135;
  }

  //canvas
  var mopgroupCanvas = mopgroup.find("canvas").get(0);
  var ctx = mopgroupCanvas.getContext("2d");
  ctx.strokeStyle = "#ff0000";
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  var mtw = parseInt(tarSpan.get(0).style.width);
  var mth = parseInt(tarSpan.get(0).style.height);
  ctx.lineWidth = mtw * 0.2;
  ctx.translate(
    parseInt(tarSpan.get(0).style.left) + mtw / 2,
    parseInt(tarSpan.get(0).style.top) + mth / 2
  );
  ctx.rotate((degree * Math.PI) / 180);
  ctx.moveTo(0, -1 * ctx.lineWidth);
  ctx.lineTo(mtw / 3, 0);
  ctx.lineTo(0, ctx.lineWidth);
  ctx.closePath();
  ctx.fillStyle = ctx.strokeStyle;
  ctx.fill();
  //reset cctx
  ctx.rotate((-1 * degree * Math.PI) / 180);
  ctx.translate(
    -1 * parseInt(tarSpan.get(0).style.left) - mtw / 2,
    -1 * parseInt(tarSpan.get(0).style.top) - mth / 2
  );
};

var showAnswer = function () {
  var selectedElem = $(".contents > div.selected");
  if (selectedElem.find(".frames").length > 0) {
    rootSoundEffect($help);
    //reset elem
    $(".sideTool > div.btn_replay").click();
    //reset btn
    $(".sideTool > div.btn_replay").removeClass("active").show();
    $(".sideTool > div.btn_answer").hide();
    //fill in answer
    var tempFrame = selectedElem.find(".frames");
    var tempAnsArray = tempFrame.attr("ans").split(",");
    var html = "";
    for (var i = 0; i < tempAnsArray.length; i++) {
      var classname = "";
      if (i == 0) {
        classname = "start";
      }
      html += `<div class="${classname}">${tempAnsArray[i]}</div>`;
    }
    tempFrame.find(">div").remove();
    tempFrame.find(">p").before(html);
    tempFrame.find(">p > span").text(tempFrame.find(">div").length);

    //get first grid
    var mopgroup = selectedElem.find(".mop-group");
    for (var k = 0; k < mopgroup.find(">span").length; k++) {
      if (mopgroup.find(">span").eq(k).attr("preset") == tempAnsArray[0]) {
        mopgroup.find(">span").eq(k).addClass("last");
      }
    }
    //build up path and arrow
    for (var i = 0; i < tempAnsArray.length; i++) {
      //get current grid
      var targetSpan;
      var preSpan = mopgroup.find(".last");
      for (var k = 0; k < mopgroup.find(">span").length; k++) {
        if (mopgroup.find(">span").eq(k).attr("preset") == tempAnsArray[i]) {
          targetSpan = mopgroup.find(">span").eq(k);
        }
      }
      var ppx = preSpan.attr("px");
      var ppy = preSpan.attr("py");
      var cpx = targetSpan.attr("px");
      var cpy = targetSpan.attr("py");
      var dx = parseInt(cpx) - parseInt(ppx);
      var dy = parseInt(cpy) - parseInt(ppy);
      mopCounter += 1;
      var directClass = "";
      //畫線條
      if (dx > 0 && dy == 0) {
        directClass = "tr";
      } else if (dx < 0 && dy == 0) {
        directClass = "tl";
      } else if (dx == 0 && dy > 0) {
        directClass = "td";
      } else if (dx == 0 && dy < 0) {
        directClass = "tt";
      } else if (dx > 0 && dy > 0) {
        directClass = "tdr";
      } else if (dx > 0 && dy < 0) {
        directClass = "ttr";
      } else if (dx < 0 && dy > 0) {
        directClass = "tdl";
      } else if (dx < 0 && dy < 0) {
        directClass = "ttl";
      }

      //canvas
      var mopgroupCanvas = mopgroup.find("canvas").get(0);
      var cctx = mopgroupCanvas.getContext("2d");
      cctx.strokeStyle = "#ff0000";
      cctx.lineCap = "round";
      cctx.lineJoin = "round";
      cctx.beginPath();
      var mtw = parseInt(preSpan.get(0).style.width);
      var mth = parseInt(preSpan.get(0).style.height);
      cctx.lineWidth = mtw * 0.2;
      cctx.moveTo(
        parseInt(preSpan.get(0).style.left) + mtw / 2,
        parseInt(preSpan.get(0).style.top) + mth / 2
      );
      var ltw = parseInt(targetSpan.get(0).style.width);
      var lth = parseInt(targetSpan.get(0).style.height);
      cctx.lineTo(
        parseInt(targetSpan.get(0).style.left) + ltw / 2,
        parseInt(targetSpan.get(0).style.top) + lth / 2
      );

      cctx.stroke();
      //mopped
      targetSpan
        .removeClass("tl tr td tt ttl ttr tdl tdr")
        .addClass("onmop last " + directClass)
        .attr("ans", mopCounter)
        .siblings(".last")
        .removeClass("last");
      $elem = targetSpan.get(0);
    }
    drawArrow();
  }
};
var updateFrame = function (tar) {
  var selectedElem = $(".contents > div.selected");
  var tempFrame = selectedElem.find(".frames");
  var gotIt = false;
  tempFrame.find(">div").each(function () {
    if (isitEmpty($(this).text())) {
      $(this).text(tar.attr("preset"));
      gotIt = true;
      return false;
    }
  });
  if (!gotIt) {
    tempFrame.find(">p").before(`<div>${tar.attr("preset")}</div>`);
  }
  tempFrame.find(">p > span").text(mopCounter);
};
var resetFrame = function () {
  var selectedElem = $(".contents > div.selected");
  var tempFrame = selectedElem.find(".frames");
  var tempAnsArray = tempFrame.attr("ans").split(",");

  var html = "";
  for (var i = 0; i < tempAnsArray.length; i++) {
    var classname = "";
    if (i == 0) {
      classname = "start";
    }
    if (i == tempAnsArray.length - 1) {
      //classname = "end";
    }
    html += `<div class="${classname}"></div>`;
  }
  html += `<p>共使用<span>0</span>格</p>`;
  tempFrame.empty().append(html);
  //
  $(".sideTool > div.btn_answer").removeClass("active").show();
};

var openContent = function (id) {
  resetAudio();
  resetTool();
  $(".contents > div")
    .eq(id)
    .addClass("selected")
    .siblings(".selected")
    .removeClass("selected");
  resetElem($(".contents > div.selected"));
  //show side tool btn
};

var resetElem = function (elem) {
  var mopgroup = elem.find(".mop-group");
  mopgroup.find(">span").each(function () {
    $(this)
      .removeAttr("ans")
      .removeClass("onmop mopped last tl tr td tt ttl ttr tdl tdr");
    if ($(this).attr("preset")) {
      $(this).text($(this).attr("preset"));
    } else {
      $(this).text("");
    }
  });
  //canvas clean
  mopgroup.each(function () {
    var mopgroupCanvas = $(this).find("canvas").get(0);
    var cctx = mopgroupCanvas.getContext("2d");
    cctx.clearRect(
      0,
      0,
      $(mopgroupCanvas).attr("width"),
      $(mopgroupCanvas).attr("height")
    );
  });

  //
  mopCounter = 0;
  $(".smoke").remove();
  $(".fingerAvatar").remove();
  resetTool();
  if (elem.find(".frames").length > 0) {
    resetFrame();
  }
};

var resetTool = function () {
  $(".sideTool > div").removeClass("active").hide();
};
