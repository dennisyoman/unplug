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

      //frames
      $(".frames > div")
        .unbind()
        .bind("click", function () {
          $(this).empty();
          checkOrderStatus();
        });

      //sidetool
      $(".sideTool > div.btn_answer")
        .unbind()
        .bind("click", function () {
          $(this).toggleClass("active");
          if ($(this).hasClass("active")) {
            showAnswer(true);
          } else {
            showAnswer(false);
          }
        });
      $(".sideTool > div.btn_playorder")
        .unbind()
        .bind("click", function () {
          $(this).toggleClass("active");
          if ($(this).hasClass("active")) {
            //
          } else {
            //
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

var fightStep = 0;
var fightSpeed = 1000;

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
    if ($($elem).parent().hasClass("cards")) {
      $("#module_wrapper").append(
        '<div id="cardAvatar" class="cardAvatar"></div>'
      );
      $($elem).clone().appendTo("#cardAvatar");
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
    //drag clon card
    if ($($elem).parent().hasClass("cards")) {
      var deltaContainerX = $("#module_wrapper").offset().left;
      var deltaContainerY = $("#module_wrapper").offset().top;
      $("#cardAvatar").get(0).style.top =
        Math.round(
          ev.center.y / stageRatioReal -
            deltaContainerY / stageRatioReal -
            $("#cardAvatar").height() / stageRatioReal / 2
        ) + "px";
      $("#cardAvatar").get(0).style.left =
        Math.round(
          ev.center.x / stageRatioReal -
            deltaContainerX / stageRatioReal -
            $("#cardAvatar").width() / stageRatioReal / 2
        ) + "px";
      checkCollision(ev);
    }
  }

  if (ev.isFinal) {
    isDragging = false;
    $elem = null;
    //check order status
    checkOrderStatus();
  }
};

var checkCollision = function (ev) {
  var lastX = ev.center.x;
  var lastY = ev.center.y;
  var frameElem = $(".contents > div.selected .frames > div");
  frameElem.each(function () {
    var oriX = $(this).offset().left;
    var oriW = oriX + $(this).width();
    var oriY = $(this).offset().top;
    var oriH = oriY + $(this).height();
    if (lastX >= oriX && lastX <= oriW && lastY >= oriY && lastY <= oriH) {
      $(this).addClass("selected");
    } else {
      $(this).removeClass("selected");
    }
  });
};
var checkOrderStatus = function () {
  //fill frame with clone card
  var count = 0;
  var frameElem = $(".contents > div.selected .frames > div");
  var frameCheckBtn = $(".contents > div.selected .frames > .cta");
  frameElem.each(function () {
    if ($(this).hasClass("selected")) {
      $(this).removeClass("selected").empty().append($("#cardAvatar").html());
      rootSoundEffect($pop);
      //user change status
      $(".btn_answer").removeClass("active");
    }
    if ($(this).find(">div").length > 0) {
      count++;
    }
  });
  //remove clone card
  $("#cardAvatar").remove();
  //check status
  if (frameElem.length == count) {
    frameCheckBtn.removeClass("disable");
  } else {
    frameCheckBtn.addClass("disable");
    //user change status
    $(".btn_answer").removeClass("active");
  }
};

var showAnswer = function (boolean) {
  var frameElem = $(".contents > div.selected .frames > div");
  if (boolean) {
    frameElem.each(function () {
      $(this).removeClass("selected").empty().append(`
    <div class="${$(this).attr(
      "ans"
    )} wow bounceIn" ans="${$(this).attr("ans")}">
    <img src="./DATA/IMAGES/common/arrow1.png" />
    </div>`);
    });
    rootSoundEffect($chimes);
  } else {
    frameElem.each(function () {
      $(this).removeClass("selected").empty();
    });
  }
  //
  checkOrderStatus();
};

var goFight = function () {
  fightStep = 0;
  fightAnimation();
  var frameCheckBtn = $(".contents > div.selected .frames > .cta");
  frameCheckBtn.addClass("disable");
};

var fightAnimation = function () {
  var frameElem = $(".contents > div.selected .frames > div");
  var tempKing = $(".contents > div.selected .king");
  var tempGhost = $(".contents > div.selected .ghost");
  var xx = tempKing.attr("curX");
  var yy = tempKing.attr("curY");
  frameElem
    .eq(fightStep)
    .addClass("selected")
    .siblings(".selected")
    .removeClass("selected");
  switch (frameElem.eq(fightStep).find(">div").attr("ans")) {
    case "u":
      yy = parseInt(yy) + 1;
      break;
    case "d":
      yy = parseInt(yy) - 1;
      break;
    case "l":
      xx = parseInt(xx) - 1;
      break;
    case "r":
      xx = parseInt(xx) + 1;
      break;
    default:
    // code block
  }
  //確定移動有無障礙
  if (yy < 1 || yy > gridsRow || xx < 1 || xx > gridsColumn) {
    console.log("stocked");
    showResult("stocked");
  } else {
    console.log(xx, yy);
    moveMan(tempKing, xx, yy);
    fightStep++;
    if (fightStep < frameElem.length) {
      setTimeout(fightAnimation, fightSpeed);
    } else {
      //
      console.log("end");
      if (
        tempKing.attr("curX") == tempGhost.attr("curX") &&
        tempKing.attr("curY") == tempGhost.attr("curY")
      ) {
        showResult("success");
      } else {
        showResult("fail");
      }
    }
  }
};

var showResult = function (result) {
  switch (result) {
    case "stocked":
      console.log("stocked");
      break;
    case "fail":
      console.log("fail");
      break;
    case "success":
      console.log("success");
      break;
    default:
    // code block
  }
  //rootSoundEffect($pop);
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
  checkOrderStatus();

  //cards & lights reset
  elem.find(".selected").removeClass("selected");
  elem.find(".onactive").removeClass("onactive");
};

var moveMan = function (tar, x, y) {
  var diffX = (gridsColumn / 2) * gridW - gridW / 2;
  var diffY = (gridsRow / 2) * gridH - gridH / 4;
  tar.css({
    top: (y - 1) * gridH * -1 + diffY + "px",
    left: (x - 1) * gridW * 1 - diffX + "px",
  });
  tar.attr({
    curX: x,
    curY: y,
  });
};

var resetTool = function () {
  $(".sideTool > div").removeClass("active").hide();
};
