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

      //build grid
      $(".grids > .row").each(function () {
        var size = $(this).attr("size");
        for (var i = 0; i < size; i++) {
          $(this).append(`<span style="width:${bw}px;height:${bh}px;"/>`);
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

var lowlaged = false;
var lastPosX = 0;
var lastPosY = 0;
var isDragging = false;
var $elem = null;
//
var bw = 35;
var bh = 28;

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
    if ($($elem).hasClass("draggable")) {
      $("#module_wrapper").append(
        `<div id="cardAvatar" class="cardAvatar"></div>`,
      );
      $($elem).find(">img").clone().appendTo("#cardAvatar");
      $("#cardAvatar").attr("size", $($elem).attr("size"));
      $($elem).addClass("cached");
    }
  }

  if (isDragging && $elem) {
    //drag clon card
    if ($($elem).hasClass("draggable")) {
      var deltaContainerX = $("#module_wrapper").offset().left;
      var deltaContainerY = $("#module_wrapper").offset().top;
      $("#cardAvatar").get(0).style.top =
        Math.round(
          ev.center.y / stageRatioReal -
            deltaContainerY / stageRatioReal -
            $("#cardAvatar").height() / stageRatioReal / 2,
        ) + "px";
      $("#cardAvatar").get(0).style.left =
        Math.round(
          ev.center.x / stageRatioReal -
            deltaContainerX / stageRatioReal -
            $("#cardAvatar").width() / stageRatioReal / 2,
        ) + "px";
      checkCollision(ev);
    }
  }

  if (ev.isFinal) {
    if ($($elem).hasClass("draggable")) {
      var frameElem = $(".contents > div.selected .gem_container > div");
      var gotit = false;
      frameElem.each(function () {
        if ($(this).hasClass("selected")) {
          gotit = true;
        }
      });
      //checkCollision true
      if (gotit) {
        //check order status
        checkOrderStatus();
      } else {
        $("#cardAvatar").remove();
        $(".cached").removeClass("cached");
      }
    }
    //then
    isDragging = false;
    $elem = null;
  }
};

var checkCollision = function (ev) {
  var lastW = parseInt($($elem).attr("size")) * bw * stageRatioReal;
  var lastX = ev.center.x - lastW / 2;
  var lastY = ev.center.y;
  var buffer = 3;

  var frameElem = $(".contents > div.selected .grids > .row > span");
  var gotit = false;
  frameElem.each(function () {
    var oriX = $(this).offset().left;
    var oriW = $(this).width();
    var oriY = $(this).offset().top;
    var oriH = oriY + $(this).height();
    if (
      lastX < oriX + oriW / 2 - buffer &&
      lastX > oriX - lastW + oriW / 2 + buffer &&
      lastY >= oriY + buffer &&
      lastY <= oriH - buffer
    ) {
      $(this).addClass("selected");
      gotit = true;
    } else {
      $(this).removeClass("selected");
    }
  });
  if (gotit) {
    $("#cardAvatar").addClass("focus");
  } else {
    $("#cardAvatar").removeClass("focus");
  }
};

var checkOrderStatus = function () {
  var gridElem = $(".contents > div.selected .gem_container");
  var tempNum = gridElem.find(">div.selected").attr("ans");
  var tempNumCard = $("#cardAvatar").attr("ans");
  if (tempNum == tempNumCard) {
    //right
    $(".sideTool > div.btn_replay").show();
    rootSoundEffect($chimes);

    var uniq = new Date().getTime();
    gridElem
      .find(">div.selected")
      .removeClass("selected")
      .addClass("bingo")
      .append(
        `<span class="smoke"><img src="./DATA/IMAGES/common/chimes.gif?uniq=${uniq}"/></span>`,
      );
    $("#cardAvatar").remove();
    $(".cached")
      .removeClass("cached")
      .delay(800)
      .queue(function () {
        $(".smoke").remove();
        $(this).dequeue();
      });
  } else {
    //wrong
    rootSoundEffect($fail);
    var uniq = new Date().getTime();
    gridElem
      .find(">div.selected")
      .removeClass("selected")
      .append(
        `<span class="smoke"><img src="./DATA/IMAGES/common/smoke.gif?uniq=${uniq}"/></span>`,
      );
    $("#cardAvatar").remove();
    $(".cached")
      .removeClass("cached")
      .delay(800)
      .queue(function () {
        $(".smoke").remove();
        $(this).dequeue();
      });
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
};

var resetElem = function (elem) {
  elem.find(".selected").removeClass("selected");
  elem.find(".cached").removeClass("cached");

  //smoke effect
  $(".smoke").remove();
  $(".cardAvatar").remove();
};

var resetTool = function () {
  $(".sideTool > div").removeClass("active").hide();
};
