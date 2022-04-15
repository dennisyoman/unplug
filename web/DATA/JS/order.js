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
          resetMen();
          $(this).empty();
          checkOrderStatus();
        });

      //lights

      $(".lights > div")
        .unbind()
        .bind("click", function () {
          resetMen();
          if ($(".sideTool > div.btn_playorder").hasClass("active")) {
            $(".sideTool > div.btn_playorder").removeClass("active");
            $(".contents > div.selected .lights > div").removeClass(
              "passed wrong right",
            );
          }
          $(this).toggleClass("selected");
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
            goPassing(true);
          } else {
            goPassing(false);
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
var fightTimeout;
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
        '<div id="cardAvatar" class="cardAvatar"></div>',
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
    if ($($elem).parent().hasClass("cards")) {
      var frameElem = $(".contents > div.selected .frames > div");
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
      }
    }
    //then
    isDragging = false;
    $elem = null;
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
      resetMen();
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
    resetMen();
  }
};

var showAnswer = function (boolean) {
  var frameElem = $(".contents > div.selected .frames > div");
  resetMen();
  if (boolean) {
    frameElem.each(function () {
      $(this).removeClass("selected").empty().append(`
    <div class="${$(this).attr(
      "ans",
    )} wow bounceIn" ans="${$(this).attr("ans")}">
    <img src="./DATA/IMAGES/common/arrow1.png" />
    </div>`);
    });
    rootSoundEffect($help);
    $(".btn_answer").addClass("active");
  } else {
    frameElem.each(function () {
      $(this).removeClass("selected").empty();
    });
  }
  //
  checkOrderStatus();
};

//passing
var goPassing = function (boolean) {
  fightStep = 0;
  if (boolean) {
    passingAnimation();
  } else {
    resetMen();
    resetLights();
  }
};

var passingAnimation = function () {
  var frameElem = $(".contents > div.selected .frames > div");
  var itemsElem = $(".contents > div.selected .items > span");
  var lightsElem = $(".contents > div.selected .lights > div");
  var barrierElem = $(".contents > div.selected .barrier > span");
  var tempKing = $(".contents > div.selected .king");
  var tempGhost = $(".contents > div.selected .ghost");
  var xx = tempKing.attr("curX");
  var yy = tempKing.attr("curY");
  frameElem
    .eq(fightStep)
    .addClass("selected")
    .siblings(".selected")
    .removeClass("selected");
  switch (frameElem.eq(fightStep).attr("ans")) {
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
  }
  //add arrow
  appendArrow(frameElem.eq(fightStep).attr("ans"), xx, yy);
  //
  rootSoundEffect($show);
  moveMan(tempKing, xx, yy);

  //確定移動有無障礙
  var getStocked = false;
  barrierElem.each(function () {
    var pX = $(this).attr("pX");
    var pY = $(this).attr("pY");
    if (xx == pX && yy == pY) {
      getStocked = true;
    }
  });
  //移動到哪裡
  lightsElem.removeClass("passed");
  itemsElem.each(function () {
    var pX = $(this).attr("pX");
    var pY = $(this).attr("pY");
    var ans = $(this).attr("ans");
    if (xx == pX && yy == pY) {
      console.log(ans);
      for (var k = 0; k < lightsElem.length; k++) {
        var tempLight = lightsElem.eq(k);
        if (tempLight.attr("ans") == ans) {
          tempLight.addClass("passed");
          if (tempLight.hasClass("selected")) {
            if (!tempLight.hasClass("right")) {
              tempLight.addClass("right");
              rootSoundEffect($chimes);
              //
              var uniq = new Date().getTime();
              tempLight.append(
                `<span class="smoke"><img src="./DATA/IMAGES/common/chimes.gif?uniq=${uniq}"/></span>`,
              );
              $(".smoke")
                .delay(1500)
                .queue(function () {
                  $(this).dequeue().remove();
                });
            }
          } else {
            tempLight.addClass("wrong");
            rootSoundEffect($stupid);
          }
        }
      }
    }
  });
  //
  if (yy < 1 || yy > gridsRow || xx < 1 || xx > gridsColumn) {
    showResult("outbound");
  } else if (getStocked) {
    showResult("stocked");
  } else {
    fightStep++;
    if (fightStep < frameElem.length) {
      fightTimeout = setTimeout(passingAnimation, fightSpeed);
    } else {
      //lights
      for (var k = 0; k < lightsElem.length; k++) {
        var tempLight = lightsElem.eq(k);
        if (tempLight.hasClass("selected") && !tempLight.hasClass("right")) {
          tempLight.addClass("wrong");
        }
      }
      //
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

//fight

var goFight = function () {
  fightStep = 0;
  fightAnimation();
  var frameCheckBtn = $(".contents > div.selected .frames > .cta");
  frameCheckBtn.addClass("disable");
};

var fightAnimation = function () {
  var frameElem = $(".contents > div.selected .frames > div");
  var barrierElem = $(".contents > div.selected .barrier > span");
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
  }
  //add arrow
  appendArrow(frameElem.eq(fightStep).find(">div").attr("ans"), xx, yy);
  //
  rootSoundEffect($show);
  moveMan(tempKing, xx, yy);
  //確定移動有無障礙
  var getStocked = false;
  barrierElem.each(function () {
    var pX = $(this).attr("pX");
    var pY = $(this).attr("pY");
    if (xx == pX && yy == pY) {
      getStocked = true;
    }
  });
  //
  if (yy < 1 || yy > gridsRow || xx < 1 || xx > gridsColumn) {
    showResult("outbound");
  } else if (getStocked) {
    showResult("stocked");
  } else {
    fightStep++;
    if (fightStep < frameElem.length) {
      fightTimeout = setTimeout(fightAnimation, fightSpeed);
    } else {
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
  var tempKing = $(".contents > div.selected .king");
  var tempGhost = $(".contents > div.selected .ghost");
  switch (result) {
    case "outbound":
      console.log("outbound");
      var uniq = new Date().getTime();
      rootSoundEffect($stupid);
      tempKing
        .addClass("outbound")
        .append(
          `<span class="smoke"><img src="./DATA/IMAGES/common/smoke.gif?uniq=${uniq}"/></span>`,
        );
      $(".smoke")
        .delay(1000)
        .queue(function () {
          rootSoundEffect($tryagain);
          tempGhost.addClass("jump");
          $(this).dequeue().remove();
        });
      break;
    case "stocked":
      console.log("stocked");
      rootSoundEffect($stupid);
      tempKing
        .addClass("stocked")
        .delay(800)
        .queue(function () {
          rootSoundEffect($tryagain);
          tempGhost.addClass("jump");
          $(this).addClass("cry").dequeue();
        });
      break;
    case "fail":
      console.log("fail");
      rootSoundEffect($fail);
      tempKing
        .addClass("cry")
        .delay(800)
        .queue(function () {
          rootSoundEffect($tryagain);
          tempGhost.addClass("proud");
          $(this).dequeue();
        });
      break;
    case "success":
      console.log("success");
      var uniq = new Date().getTime();
      tempGhost.delay(300).queue(function () {
        rootSoundEffect($correct);
        tempKing.addClass("jump");
        $(this)
          .dequeue()
          .addClass("vanish")
          .append(
            `<span class="smoke"><img src="./DATA/IMAGES/common/smoke.gif?uniq=${uniq}"/></span>`,
          );
        $(".smoke")
          .delay(1000)
          .queue(function () {
            $(this).dequeue().remove();
          });
      });
      //
      break;
    default:
    // code block
  }
};

var appendArrow = function (direction, xx, yy) {
  $(".contents > div.selected .stage").append(
    `<div id="arrow" class="arrow ${direction}" />`,
  );
  var diffX = (gridsColumn / 2) * gridW - gridW / 2;
  var diffY = (gridsRow / 2) * gridH - gridH / 2;
  switch (direction) {
    case "u":
      diffY += gridH / 2;
      break;
    case "d":
      diffY -= gridH / 2;
      break;
    case "l":
      diffX -= gridW / 2;
      break;
    case "r":
      diffX += gridW / 2;
      break;
  }
  $("#arrow")
    .css({
      top: (yy - 1) * gridH * -1 + diffY + "px",
      left: (xx - 1) * gridW * 1 - diffX + "px",
    })
    .removeAttr("id");
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
var resetLights = function () {
  var tempLights = $(".contents > div.selected .lights > div");
  tempLights.removeClass("selected passed wrong right");
};

var resetMen = function () {
  clearTimeout(fightTimeout);
  var tempMen = $(".contents > div.selected .man");
  tempMen.each(function () {
    $(this)
      .removeAttr("style")
      .removeClass("vanish cry stocked jump outbound proud");
    var RXX = parseInt($(this).parent().attr("curRX"));
    $(this).get(0).style.transform = "rotateX(" + -1 * RXX + "deg)";
    var intX = parseInt($(this).attr("intX"));
    var intY = parseInt($(this).attr("intY"));
    moveMan($(this), intX, intY);
  });
  $(".btn_answer").removeClass("active");
  $(".contents > div.selected .frames .selected").removeClass("selected");
  $(".contents > div.selected .arrow").removeClass();
};

var resetElem = function (elem) {
  //stage
  var tempStage = elem.find(".stage");
  tempStage
    .removeAttr("style")
    .attr("curRX", tempStage.attr("intRX"))
    .attr("curRZ", tempStage.attr("intRZ"));
  gridsRow = parseInt(tempStage.attr("row"));
  gridsColumn = parseInt(tempStage.attr("col"));
  gridW = parseInt(tempStage.find(".ground > img").attr("width")) / gridsColumn;
  gridH = parseInt(tempStage.find(".ground > img").attr("height")) / gridsRow;

  //men
  resetMen();

  //frame reset
  var tempFrameset = elem.find(".frames");
  tempFrameset.find("> div").empty();
  checkOrderStatus();

  //cards & lights reset
  elem.find(".selected").removeClass("selected");

  //lights
  resetLights();

  //smoke effect
  $(".smoke").remove();
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
