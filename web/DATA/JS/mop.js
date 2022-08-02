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

      //init

      $(this)
        .addClass("loaded")
        .delay(500)
        .queue(function () {
          $(".tabs > span").eq(pid).click();
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
var mopZoneCounter = 0;
var shrink = 0.6;
var mopZoneColours = [
  "rgba(231,34,25,1)",
  "rgba(233,88,126,1)",
  "rgba(35,187,228,1)",
  "rgba(106,184,45,1)",
  "rgba(163,49,141,1)",
];

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
        `<div id="mopAvatar" class="mopAvatar"><img src="./DATA/PT/BOOK2/IMAGES/mop.png"/></div>`
      );
    }
  }

  if (isDragging && $elem) {
    //drag clon card

    if (mopgroup.hasClass("mop-group")) {
      var deltaContainerX = $("#module_wrapper").offset().left;
      var deltaContainerY = $("#module_wrapper").offset().top;
      $("#mopAvatar").get(0).style.top =
        Math.round(
          ev.center.y / stageRatioReal -
            deltaContainerY / stageRatioReal -
            $("#mopAvatar").height() / stageRatioReal / 2
        ) + "px";
      $("#mopAvatar").get(0).style.left =
        Math.round(
          ev.center.x / stageRatioReal -
            deltaContainerX / stageRatioReal -
            $("#mopAvatar").width() / stageRatioReal / 2
        ) + "px";
      //是否需要一次完成?
      if (mopgroup.attr("max")) {
        //可分段完成
        checkCollisionMulti(ev);
      } else {
        //需要一次完成
        checkCollision(ev);
      }
    }
  }

  if (ev.isFinal) {
    if ($($elem).parent().hasClass("mop-group")) {
      checkMopStatus();
      //有產生刷地
      if (mopCounter > 0) {
        mopZoneCounter += 1;
      }
    }
    //then
    mopCounter = 0;
    isDragging = false;
    $elem = null;
  }
};

//單次完成
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
      if (!$(this).hasClass("mopped")) {
        //check neighbor
        var isNeighbor = false;
        if (mopgroup.find(".last").length > 0) {
          var ppx = mopgroup.find(".last").attr("px");
          var ppy = mopgroup.find(".last").attr("py");
          var cpx = $(this).attr("px");
          var cpy = $(this).attr("py");
          var dx = parseInt(cpx) - parseInt(ppx);
          var dy = parseInt(cpy) - parseInt(ppy);
          if (Math.abs(dx) <= 1 && Math.abs(dy) <= 1) {
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
            .addClass("mopped last " + directClass)
            .attr("ans", mopCounter)
            .text(mopCounter)
            .siblings(".last")
            .removeClass("last");
          //draw arrow?
          if (
            mopgroup.find(">span").length ==
            mopgroup.find(">span.mopped").length
          ) {
            var degree = 0;
            switch (directClass) {
              case "tr":
                degree = 0;
                break;
              case "tl":
                degree = 180;
                break;
              case "tt":
                degree = -90;
                break;
              case "td":
                degree = 90;
                break;
              case "tdr":
                degree = 45;
                break;
              case "ttr":
                degree = -45;
                break;
              case "tdl":
                degree = 135;
                break;
              case "ttl":
                degree = -135;
                break;
              default:
              // code block
            }
            cctx.translate(
              parseInt($(this).get(0).style.left) + mtw / 2,
              parseInt($(this).get(0).style.top) + mth / 2
            );
            cctx.rotate((degree * Math.PI) / 180);
            cctx.moveTo(0, -1 * cctx.lineWidth);
            cctx.lineTo(mtw / 3, 0);
            cctx.lineTo(0, cctx.lineWidth);

            cctx.closePath();

            //cctx.stroke();
            cctx.fillStyle = cctx.strokeStyle;
            cctx.fill();
            //reset cctx
            cctx.rotate((-1 * degree * Math.PI) / 180);
            cctx.translate(
              -1 * parseInt($(this).get(0).style.left) - mtw / 2,
              -1 * parseInt($(this).get(0).style.top) - mth / 2
            );
          }
        }
      }
    }
  });
};

//可分多次完成
var checkCollisionMulti = function (ev) {
  var lastX = ev.center.x;
  var lastY = ev.center.y;
  var mopgroup = $($elem).parent();
  //連續次數限制
  var max = mopgroup.attr("max") ? parseInt(mopgroup.attr("max")) : 6;
  mopgroup.find(">span").each(function () {
    var oriX = $(this).offset().left + ($(this).width() * (1 - shrink)) / 2;
    var oriW = oriX + $(this).width() * shrink;
    var oriY = $(this).offset().top + ($(this).width() * (1 - shrink)) / 2;
    var oriH = oriY + $(this).height() * shrink;
    if (lastX >= oriX && lastX <= oriW && lastY >= oriY && lastY <= oriH) {
      if (!$(this).hasClass("mopped")) {
        //check neighbor
        var isNeighbor = false;
        if (mopgroup.find(".last").length > 0) {
          var ppx = mopgroup.find(".last").attr("px");
          var ppy = mopgroup.find(".last").attr("py");
          var cpx = $(this).attr("px");
          var cpy = $(this).attr("py");
          var dx = Math.abs(parseInt(ppx) - parseInt(cpx));
          var dy = Math.abs(parseInt(ppy) - parseInt(cpy));
          //不能斜向清潔
          if (dx <= 1 && dy <= 1 && dx * dy == 0) {
            isNeighbor = true;
          }
        } else {
          isNeighbor = true;
        }
        //為鄰近區域or不超過連續次數限制max
        if (isNeighbor && mopCounter < max) {
          rootSoundEffect($show);
          mopCounter += 1;
          if (!ppx) {
            $(this).addClass("last");
          }
          //canvas
          var mopgroupCanvas = mopgroup.find("canvas").get(0);
          var cctx = mopgroupCanvas.getContext("2d");
          cctx.strokeStyle =
            mopZoneColours[mopZoneCounter % mopZoneColours.length];

          cctx.lineCap = "round";
          cctx.lineJoin = "round";
          cctx.beginPath();
          var mtw = parseInt(mopgroup.find(".last").get(0).style.width);
          var mth = parseInt(mopgroup.find(".last").get(0).style.height);
          cctx.lineWidth = mtw * 0.7;
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
          //
          $(this)
            .addClass("mopped last")
            .attr("ans", mopCounter)
            .text(mopZoneCounter + 1)
            .siblings(".last")
            .removeClass("last");
        }
      }
    }
  });
};

var checkMopStatus = function () {
  var mopgroup = $($elem).parent();
  if (mopgroup.find(">span").length == mopgroup.find(">span.mopped").length) {
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
    if (mopgroup.attr("max")) {
      updateWasher(mopZoneCounter + 1);
    }
  } else {
    //區域尚未完成
    rootSoundEffect($pop);
    ////是否需要一次完成?
    if (mopgroup.attr("max")) {
      ////可分段完成
      mopgroup.find("> span.last").removeClass("last");
      $(".sideTool > div.btn_replay").show();
      //洗拖把
      rootSoundEffect($water);
      updateWasher(mopZoneCounter + 1);
    } else {
      ////需要一次完成
      //////重設
      mopgroup.find("> span").each(function () {
        $(this)
          .removeAttr("ans")
          .removeClass("mopped last tl tr td tt ttl ttr tdl tdr");
        if ($(this).attr("preset")) {
          $(this).text($(this).attr("preset"));
        } else {
          $(this).text("");
        }
      });
      updateWasher(0);
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
  }
  $(".mopAvatar").remove();
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

var updateWasher = function (num) {
  if ($(".contents > div.selected .washer").length > 0) {
    $(".contents > div.selected .washer").find("p > span").text(num);
    if (num > 0) {
      $(".contents > div.selected .washer")
        .addClass("active")
        .delay(1500)
        .queue(function () {
          $(this).dequeue().removeClass("active");
        });
    }
  }
};

var resetElem = function (elem) {
  var mopgroup = elem.find(".mop-group");
  mopgroup.find(">span").each(function () {
    $(this)
      .removeAttr("ans")
      .removeClass("mopped last tl tr td tt ttl ttr tdl tdr");
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
  updateWasher(0);
  mopCounter = mopZoneCounter = 0;
  $(".smoke").remove();
  $(".mopAvatar").remove();
  resetTool();
};

var resetTool = function () {
  $(".sideTool > div").removeClass("active").hide();
};
