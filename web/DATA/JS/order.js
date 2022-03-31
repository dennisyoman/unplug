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
      $(".sideTool > div.btn_answer")
        .unbind()
        .bind("click", function () {
          $(this).toggleClass("active");
          if ($(this).hasClass("active")) {
            /*rootSoundEffectName(
              $(".contents > div.selected").find("audio").attr("src"),
              true
            );*/
          } else {
            /*closePlayer();*/
          }
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

  //check loading
  checkCompLoading("#module_wrapper");
  $("#module_wrapper .units-title")
    .addClass("l" + lid)
    .text(getLessonName());
  $("#module_wrapper .tabs").addClass("l" + lid);
});

var gridW;
var gridH;
var gridsRow;
var gridsColumn;
var lowlaged = false;
var lastPosX = 0;
var lastPosY = 0;
var lastRX = 0;
var lastRZ = 0;
var isDragging = false;
var $elem = null;

var trigHammer = function () {
  //hammer
  var myElement = document.getElementById("contents");
  var mc = new Hammer(myElement);
  mc.get("pan").set({ direction: Hammer.DIRECTION_ALL });
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
  if (!isDragging && $elem != null) {
    isDragging = true;
    if ($($elem).hasClass("rotater")) {
      lastRX = parseInt($($elem).attr("curRX"));
      lastRZ = parseInt($($elem).attr("curRZ"));
    }
    if ($($elem).hasClass("dragger")) {
      lastPosX = $elem.offsetLeft;
      lastPosY = $elem.offsetTop;
    }
  }

  if (isDragging && $elem) {
    if ($($elem).hasClass("rotater")) {
      var RX = (-0.1 * ev.deltaY) / stageRatioReal + lastRX;
      var RZ = (-0.1 * ev.deltaX) / stageRatioReal + lastRZ;
      $($elem).attr("curRX", RX);
      $($elem).attr("curRZ", RZ);
      $elem.style.transform = "rotateX(" + RX + "deg) rotateZ(" + RZ + "deg)";
      //man
      $($elem)
        .find(".man")
        .each(function () {
          $(this).get(0).style.transform = "rotateX(" + -1 * RX + "deg)";
        });
    }
    if ($($elem).hasClass("dragger")) {
      var posX = ev.deltaX / stageRatioReal + lastPosX;
      var posY = ev.deltaY / stageRatioReal + lastPosY;
      $elem.style.left = posX + "px";
      $elem.style.top = posY + "px";
      $elem.style.position = "absolute";
    }
  }

  if (ev.isFinal) {
    isDragging = false;
    $elem = null;
  }
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
  if ($(".contents > div.selected").find(".lights").length > 0) {
    $(".sideTool > div.btn_playorder").show();
  }
  if ($(".contents > div.selected").find(".cards").length > 0) {
    $(".sideTool > div.btn_answer").show();
  }
};

var resetElem = function (elem) {
  //stage
  var tempStage = elem.find(".stage");
  tempStage
    .removeAttr("style")
    .attr("curRX", tempStage.attr("intRX"))
    .attr("curRZ", tempStage.attr("intRZ"));

  //men
  var tempMen = elem.find(".man");
  gridsRow = parseInt(tempStage.attr("row"));
  gridsColumn = parseInt(tempStage.attr("col"));
  gridW = parseInt(tempStage.find(".ground > img").attr("width")) / gridsColumn;
  gridH = parseInt(tempStage.find(".ground > img").attr("height")) / gridsRow;
  tempMen.each(function () {
    $(this).removeAttr("style");
    var intX = parseInt($(this).attr("intX"));
    var intY = parseInt($(this).attr("intY"));
    moveMan($(this), intX, intY);
  });

  //frame reset
  var tempFrameset = elem.find(".frames");
  tempFrameset.find("> div").empty();
  tempFrameset.find(".cta").addClass("disable");

  //cards & lights reset
  var tempSelected = elem.find(".selected");
  tempSelected.removeClass("selected");
};

var moveMan = function (tar, x, y) {
  var diffX = (gridsColumn / 2) * gridW - gridW / 2;
  var diffY = (gridsRow / 2) * gridH - gridH / 4;
  tar.css({
    top: (y - 1) * gridH * -1 + diffY + "px",
    left: (x - 1) * gridW * 1 - diffX + "px",
  });
};

var resetTool = function () {
  $(".sideTool > div").removeClass("active").hide();
};
