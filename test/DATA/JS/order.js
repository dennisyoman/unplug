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
          //有無sync?
          if ($(this).siblings(".sync").length > 0) {
            syncArrow($(this));
          }
        });

      //lights

      $(".lights > div")
        .unbind()
        .bind("click", function () {
          resetMen();

          $(".contents > div.selected .lights > div").removeClass(
            "passed wrong right"
          );
          //}
          $(this).toggleClass("selected");
          //
          if ($(this).siblings(".cta").hasClass("disable")) {
            if ($(".contents > div.selected .frames").hasClass("fixAnswer")) {
              showAnswer(true);
              $(".contents > div.selected .frames")
                .find("> div > div")
                .css("pointer-events", "none");
            }
          }
          $(".lights > .cta").removeClass("disable");
          $(".btn_answer").removeClass("active");
        });

      //sidetool
      $(".sideTool > div.btn_answer")
        .unbind()
        .bind("click", function () {
          $(this).toggleClass("active");
          if ($(this).hasClass("active")) {
            showLightAnswer(true);
            showAnswer(true);
          } else {
            showAnswer(false);
            showLightAnswer(false);
          }
        });
      $(".sideTool > div.btn_check")
        .unbind()
        .bind("click", function () {
          checkAnswer();
        });
      $(".sideTool > div.btn_replay")
        .unbind()
        .bind("click", function () {
          resetElem($(".contents > div.selected"));
        });

      $(".lights > .cta")
        .unbind()
        .bind("click", function () {
          goPassing(true);
          $(this).addClass("disable");
          $(".sideTool > div.btn_answer").removeClass("active");
        });

      //init
      ////if items exists;
      $("#contents .world3D").each(function () {
        var stage = $(this).find(".stage");
        var items = $(this).find(".items").find(">span");
        for (var i = 0; i < items.length; i++) {
          var item = items.eq(i);
          var man = `<div class="man ${item.attr("ans")}" intX="${item.attr(
            "pX"
          )}" intY="${item.attr("pY")}">
          <img
            class="wow bounceInDown"
            data-wow-delay=".4s"
            src="./DATA/${sid}/BOOK${bid}/IMAGES/${item.attr("ans")}.png"
          />
        </div>`;
          stage.append(man);
        }
      });
      ////if pickups exists;
      $("#contents .world3D").each(function () {
        var stage = $(this).find(".stage");
        var pickups = $(this).find(".pickups").find(">span");
        for (var i = 0; i < pickups.length; i++) {
          var pickup = pickups.eq(i);
          var man = `<div class="man ${pickup.attr("ans")}" intX="${pickup.attr(
            "pX"
          )}" intY="${pickup.attr("pY")}">
          <img
            class="wow bounceInDown"
            data-wow-delay=".4s"
            src="./DATA/${sid}/BOOK${bid}/IMAGES/${pickup.attr("ans")}.png"
          />
        </div>`;
          stage.append(man);
        }
      });

      //
      $(this)
        .addClass("loaded")
        .delay(500)
        .queue(function () {
          $(".tabs > span").eq(pid).click();
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
var loopTimes = 0;
var fightSpeed = 1000;
var targetFrame = null;

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
      $($elem).removeClass("autoMove");
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
      var RX = (-0.2 * ev.deltaY) / stageRatioReal + lastRX;
      var RZ = (-0.2 * ev.deltaX) / stageRatioReal + lastRZ;
      if (RX < 10) {
        RX = 10;
      }
      if (RX > 80) {
        RX = 80;
      }
      if (RZ > 50) {
        RZ = 50;
      }
      if (RZ < -50) {
        RZ = -50;
      }
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
      if (!$(this).attr("amount")) {
        $(this).removeClass("selected").empty().append($("#cardAvatar").html());
      } else {
        //改變箭頭樣式
        $("#cardAvatar")
          .find("img")
          .attr("src", "./DATA/IMAGES/common/arrow2.png");
        $("#cardAvatar > div").append("<p></p>");
        //箭頭方向相同則累加,否則重算
        var curAns = $(this).find("> div").attr("ans");
        var avatarAns = $("#cardAvatar").find("> div").attr("ans");
        if (curAns == avatarAns) {
          var curNumber = parseInt($(this).find("p").text()) || 1;

          $(this)
            .removeClass("selected")
            .empty()
            .append($("#cardAvatar").html());
          $(this)
            .find("p")
            .text(curNumber + 1);
        } else {
          $(this)
            .removeClass("selected")
            .empty()
            .append($("#cardAvatar").html());
          $(this).find("p").text(1);
        }
      }

      rootSoundEffect($pop);
      //user change status
      resetMen();

      //有無sync?
      if ($(this).siblings(".sync").length > 0) {
        syncArrow($(this));
      }
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
  }
  //user change status
  resetMen();
};

var syncArrow = function (tar) {
  var frameElem = $(".contents > div.selected .frames > div");
  var sync = tar.siblings(".sync");
  var arrowAmount = 0;

  //箭頭方向相同則累加,否則重算

  for (var i = 0; i < frameElem.length; i++) {
    if (frameElem.eq(i).find("> div").length > 0) {
      arrowAmount++;
    }
  }

  if (arrowAmount > 0) {
    sync.empty().append(`<div class="${tar
      .find(">div")
      .attr(
        "ans"
      )} wow bounceInUp animated" data-wow-delay="1.1s" ans="${sync.attr(
      "ans"
    )}" style="visibility: visible; animation-delay: 1.1s; animation-name: bounceIn;">
    <img src="./DATA/IMAGES/common/arrow2.png">
  <p>${arrowAmount}</p></div>`);
  } else {
    sync.empty();
  }
};
var showLightAnswer = function (boolean) {
  var lightElem = $(".contents > div.selected .lights > div");
  if (boolean) {
    lightElem.each(function () {
      if ($(this).hasClass("ans")) {
        $(this).removeClass("wrong passed right").addClass("selected");
      } else {
        $(this).removeClass("selected wrong passed right");
      }
    });
  } else {
    lightElem.removeClass("selected wrong passed right");
  }
  $(".lights > .cta").removeClass("disable");
};
var showAnswer = function (boolean) {
  var frameElem = $(".contents > div.selected .frames > div");
  resetMen();
  if (boolean) {
    frameElem.each(function () {
      if (!$(this).attr("amount")) {
        //標準箭頭
        $(this).removeClass("selected").empty().append(`
    <div class="${$(this).attr("ans")} wow bounceIn" ans="${$(this).attr(
          "ans"
        )}">
    <img src="./DATA/IMAGES/common/arrow1.png" />
    </div>`);
      } else {
        //組合型箭頭
        $(this).removeClass("selected").empty().append(`
    <div class="${$(this).attr("ans")} wow bounceIn" ans="${$(this).attr(
          "ans"
        )}">
    <img src="./DATA/IMAGES/common/arrow2.png" /><p>${$(this).attr(
      "amount"
    )}</p>
    </div>`);
      }
    });
    rootSoundEffect($help);

    //有無sync?
    if ($(".contents > div.selected .frames > .sync").length > 0) {
      var sync = $(".contents > div.selected .frames > .sync");
      sync.each(function () {
        $(
          this
        ).empty().append(`<div class="${$(this).attr("ans")} wow bounceInUp animated animated animated" data-wow-delay="1.1s" ans="${$(this).attr("ans")}" style="visibility: visible; animation-delay: 1.1s; animation-name: bounceIn;">
        <img src="./DATA/IMAGES/common/arrow2.png">
      <p>${$(this).attr("amount")}</p></div>`);
      });
    }

    //有無repeat?
    if ($(".contents > div.selected .frames > .repeat").length > 0) {
      var repeat = $(".contents > div.selected .frames > .repeat");
      repeat.each(function () {
        $(this).text($(this).attr("ans"));
      });
    }
    //有無result?
    if ($(".contents > div.selected").find(".result").length > 0) {
      var items = $(".contents > div.selected").find(".result >p >span");
      items.each(function () {
        $(this).removeClass("wrong right").text($(this).attr("ans"));
      });
    }
    //

    $(".sideTool > div.btn_answer").addClass("active");
  } else {
    if (!$(".contents > div.selected .frames").hasClass("fixAnswer")) {
      frameElem.each(function () {
        $(this).removeClass("selected").empty();
      });
    }
    //有無sync?
    if ($(".contents > div.selected .frames > .sync").length > 0) {
      $(".contents > div.selected .frames > .sync").empty();
    }
    //有無repeat?
    if ($(".contents > div.selected .frames > .repeat").length > 0) {
      $(".contents > div.selected .frames > .repeat").text("");
    }
  }
  //
  checkOrderStatus();
};

var checkAnswer = function () {
  if ($(".contents > div.selected").find(".result").length > 0) {
    var items = $(".contents > div.selected").find(".result >p >span");
    items.each(function () {
      if ($(this).attr("ans") != $(this).text()) {
        $(this).addClass("wrong");
      } else {
        $(this).addClass("right");
      }
    });
    //
    if (
      $(".contents > div.selected").find(".result >p >span.wrong").length > 0
    ) {
      rootSoundEffect($wrong);
    } else {
      rootSoundEffect($right);
    }
  }
};

//passing
var goPassing = function (boolean) {
  $(".alert").remove();
  fightStep = 0;
  loopTimes = 0;
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
  if (frameElem.eq(fightStep).parent().hasClass("secondary")) {
    appendArrow(frameElem.eq(fightStep).attr("ans"), xx, yy, "blue");
  } else {
    appendArrow(frameElem.eq(fightStep).attr("ans"), xx, yy, "");
  }
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
                `<span class="smoke"><img src="./DATA/IMAGES/common/chimes.gif?uniq=${uniq}"/></span>`
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
    if (!frameElem.eq(fightStep).attr("amount")) {
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
          if (tempGhost.length > 0) {
            showResult("fail");
          } else {
            showResult("success");
          }
        }
      }
    } else {
      var restSteps = parseInt(frameElem.eq(fightStep).find("p").text());
      if (restSteps > 1) {
        frameElem
          .eq(fightStep)
          .find("p")
          .text(restSteps - 1);
        fightTimeout = setTimeout(passingAnimation, fightSpeed);
      } else {
        frameElem.eq(fightStep).find("p").text("");
        fightStep++;
        if (fightStep < frameElem.length) {
          fightTimeout = setTimeout(passingAnimation, fightSpeed);
        } else {
          //lights
          for (var k = 0; k < lightsElem.length; k++) {
            var tempLight = lightsElem.eq(k);
            if (
              tempLight.hasClass("selected") &&
              !tempLight.hasClass("right")
            ) {
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
            if (tempGhost.length > 0) {
              showResult("fail");
            } else {
              showResult("success");
            }
          }
        }
      }
    }
  }
};

//fight
var goRepeatFrames = function (frame, btn) {
  var prevFrame = btn.parent().prev();
  //依順序觸發
  if (
    !prevFrame ||
    prevFrame.find("span.repeat").length == 0 ||
    prevFrame.find("span.repeat.visited").length > 0
  ) {
    $(".contents > div.selected .king").removeClass("jump");
    btn.addClass("visited");
    //
    var frameRepeatBtn = $(".contents > div.selected .frames > span.repeat");
    frameRepeatBtn.addClass("disable");
    //
    goFight(frame);
  } else {
    rootSoundEffect($wrong);
    $(".alert").remove();
    var alert = "請依照順序移動。";
    if (alert != "") {
      $(".contents > div.selected").append(
        `<div class="alert wow fadeIn" onclick="$(this).remove()">${alert}</div>`
      );
    }
  }
};

var goFight = function (tar) {
  $(".alert").remove();
  if (tar) {
    targetFrame = tar;
  } else {
    targetFrame = null;
  }
  fightStep = 0;
  loopTimes = 0;
  fightAnimation();
  var frameCheckBtn = $(".contents > div.selected .frames > .cta");
  frameCheckBtn.addClass("disable");
  $(".sideTool > div.btn_answer").removeClass("active");
};

var pairFight = function (alertMsg) {
  var allMatch = true;
  var framesPair = $(".contents > div.selected .frames.pair");

  framesPair.each(function () {
    var frames = $("#" + $(this).attr("pair-target"));
    var repeatTimes = parseInt($(this).find(".repeat").text());
    var framesArray = [];
    var framesPairArray = [];
    frames.find(">div").each(function () {
      framesArray.push($(this).find(">div").attr("ans"));
    });

    for (var i = 0; i < repeatTimes; i++) {
      $(this)
        .find(">div")
        .each(function () {
          //箭頭無數字
          var loop = 1;
          //箭頭內有數字的
          if ($(this).attr("amount")) loop = parseInt($(this).attr("amount"));
          for (var g = 0; g < loop; g++) {
            framesPairArray.push($(this).find(">div").attr("ans"));
          }
        });
    }
    //顯示錯誤的
    for (var i = 0; i < framesArray.length; i++) {
      if (framesArray[i] != framesPairArray[i]) {
        frames.find(">div").eq(i).addClass("selected");
      }
    }
    //
    if (framesArray.join("^") != framesPairArray.join("^")) {
      allMatch = false;
    }
  });

  //
  if (allMatch) {
    goFight();
  } else {
    $(".alert").remove();
    //
    rootSoundEffect($wrong);
    var alert = alertMsg || "兩邊的次數與方向需吻合才能移動。";
    if (alert != "") {
      $(".contents > div.selected").append(
        `<div class="alert wow fadeIn" onclick="$(this).remove()">${alert}</div>`
      );
    }
  }
};

var setRepeatTimes = function (tar) {
  var frames = $("#" + tar.parent().attr("pair-target"));
  var framesPair = tar.parent();
  var max = Math.ceil(
    frames.find(">div").length / framesPair.find(">div").length
  );

  var times = parseInt(tar.text()) + 1;
  if (times > max) {
    times = 1;
  }
  tar.text(times);

  rootSoundEffect($click);
};

var setPickupAmount = function (tar, id) {
  var max = $(".contents > div.selected").find(".man." + id).length;
  var cur = parseInt(tar.text()) + 1;
  if (cur > max) {
    cur = 0;
  }
  tar.removeClass("wrong right").text(cur);
  rootSoundEffect($click);
  //
  $(".sideTool > div.btn_check").removeClass("active").show();
};

var fightAnimation = function () {
  if (targetFrame != null) {
    var frameElem = targetFrame.find(">div");
  } else {
    var frameElem = $(".contents > div.selected .frames:not('.pair') > div");
  }

  var barrierElem = $(".contents > div.selected .barrier > span");
  var pickupsElem = $(".contents > div.selected .pickups > span");
  var tempKing = $(".contents > div.selected .king");
  var tempGhost = $(".contents > div.selected .ghost");
  var tempMan = $(".contents > div.selected .man");
  var xx = tempKing.attr("curX");
  var yy = tempKing.attr("curY");

  frameElem.removeClass("selected").eq(fightStep).addClass("selected");

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

  //同步pair的閃動
  var pairFrame = null;
  $(".contents > div.selected .frames.pair").each(function () {
    if (
      $(this).attr("pair-target") == frameElem.eq(fightStep).parent().attr("id")
    ) {
      pairFrame = $(this);
    }
  });

  if (pairFrame) {
    var pairSeqArr = new Array();
    var repeat = pairFrame.find("span.repeat").text() || 1;
    for (var k = 0; k < parseInt(repeat); k++) {
      pairFrame.find(">div").each(function () {
        var counter = $(this).attr("amount") || 1;
        for (var i = 0; i < parseInt(counter); i++) {
          pairSeqArr.push($(this).index());
        }
      });
    }
    $(".contents > div.selected .frames.pair")
      .find(".selected")
      .removeClass("selected");
    pairFrame
      .children()
      .eq(pairSeqArr[frameElem.eq(fightStep).index()])
      .addClass("selected");
  }

  //add arrow
  if (frameElem.eq(fightStep).parent().hasClass("secondary")) {
    appendArrow(
      frameElem.eq(fightStep).find(">div").attr("ans"),
      xx,
      yy,
      "blue"
    );
  } else {
    appendArrow(frameElem.eq(fightStep).find(">div").attr("ans"), xx, yy, "");
  }

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
  //確定有無撿到物品pickups
  pickupsElem.each(function () {
    var pX = $(this).attr("pX");
    var pY = $(this).attr("pY");
    if (xx == pX && yy == pY) {
      for (var i = 0; i < tempMan.length; i++) {
        if (
          tempMan.eq(i).attr("intX") == pX &&
          tempMan.eq(i).attr("intY") == pY
        ) {
          rootSoundEffect($pop);
          $(".smoke").dequeue().remove();
          var uniq = new Date().getTime();
          tempMan
            .eq(i)
            .addClass("vanish")
            .append(
              `<span class="smoke"><img src="./DATA/IMAGES/common/chimes.gif?uniq=${uniq}"/></span>`
            );
          $(".smoke")
            .delay(1000)
            .queue(function () {
              $(this).dequeue().remove();
            });
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
    if (!frameElem.eq(fightStep).attr("amount")) {
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
          if (tempGhost.length > 0) {
            showResult("fail");
          } else {
            showResult("success");
          }
        }
      }
    } else {
      var restSteps = parseInt(frameElem.eq(fightStep).find("p").text());
      if (restSteps > 1) {
        frameElem
          .eq(fightStep)
          .find("p")
          .text(restSteps - 1);
        fightTimeout = setTimeout(fightAnimation, fightSpeed);
      } else {
        frameElem.eq(fightStep).find("p").text("");
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
            if (tempGhost.length > 0) {
              showResult("fail");
            } else {
              showResult("success");
            }
          }
        }
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
          `<span class="smoke"><img src="./DATA/IMAGES/common/smoke2.gif?uniq=${uniq}"/></span>`
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
      tempKing.delay(300).queue(function () {
        rootSoundEffect($correct);
        $(this).addClass("jump");
        $(this).dequeue();
        //到達石頭
        if (!tempGhost.hasClass("stone")) {
          tempGhost
            .addClass("vanish")
            .append(
              `<span class="smoke"><img src="./DATA/IMAGES/common/explode.gif?uniq=${uniq}"/></span>`
            );
        } else {
          tempGhost
            .addClass("vanish")
            .append(
              `<span class="smoke"><img src="./DATA/IMAGES/common/chimes.gif?uniq=${uniq}"/></span>`
            );
        }
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
  //$(".sideTool > div.btn_replay").fadeIn();
  //
  $(".contents > div.selected .frames > .repeat").removeClass("disable");
};

var appendArrow = function (direction, xx, yy, colour) {
  $(".contents > div.selected .stage").append(
    `<div id="arrow" class="arrow ${direction} ${colour}" />`
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
  $(".sideTool > div.btn_answer").removeClass("active");
  $(".contents > div.selected .frames .selected").removeClass("selected");
  $(".contents > div.selected .arrow").removeClass();
};

var resetElem = function (elem) {
  //stage
  var tempStage = elem.find(".stage");
  tempStage
    .removeAttr("style")
    .addClass("autoMove")
    .attr("curRX", tempStage.attr("intRX"))
    .attr("curRZ", tempStage.attr("intRZ"))
    .css("-webkit-transform", "rotateX(0deg) rotateZ(0deg)")
    .css("transform", "rotateX(0deg) rotateZ(0deg)")
    .delay(10)
    .queue(function () {
      tempStage
        .css(
          "-webkit-transform",
          "rotateX(" +
            tempStage.attr("intRX") +
            "deg) rotateZ(" +
            tempStage.attr("intRZ") +
            "deg)"
        )
        .css(
          "transform",
          "rotateX(" +
            tempStage.attr("intRX") +
            "deg) rotateZ(" +
            tempStage.attr("intRZ") +
            "deg)"
        )
        .dequeue();
    });
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

  //有無sync?
  if ($(".contents > div.selected .frames > .sync").length > 0) {
    $(".contents > div.selected .frames > .sync").empty();
  }
  //有無repeat?
  if ($(".contents > div.selected .frames > .repeat").length > 0) {
    $(".contents > div.selected .frames > .repeat")
      .removeClass("disable visited")
      .text("1");
  }

  //有無hint?
  if ($(".contents > div.selected .hint").length > 0) {
    $(".contents > div.selected .hint")
      .fadeIn()
      .unbind()
      .bind("click", function () {
        $(this).hide();
      });
  }

  //cards & lights reset
  elem.find(".selected").removeClass("selected");

  //lights
  resetLights();
  $(".sideTool > div").removeClass("active").hide();

  //smoke effect
  $(".smoke").remove();

  //答案固定?
  if ($(".contents > div.selected .frames").hasClass("fixAnswer")) {
    showAnswer(true);
    $(".contents > div.selected .frames")
      .find("> div > div")
      .css("pointer-events", "none");
  }

  ////不被fixAnswer答案固定showAnswer()影響的項目放下面

  //有無repeat.notfixed?
  if ($(".contents > div.selected .frames > .repeat.notfixed").length > 0) {
    $(".contents > div.selected .frames > .repeat.notfixed")
      .removeClass("disable visited")
      .text("1");
  }

  //有無result?
  if ($(".contents > div.selected .result").length > 0) {
    elem.find(".wrong,.right").removeClass("wrong right");
    $(".contents > div.selected .result span").text("0");
  }

  //show side tool btn
  if ($(".contents > div.selected").find(".lights").length > 0) {
    $(".lights > .cta").removeClass("disable");
    $(".sideTool > div.btn_answer").show();
  }
  if ($(".contents > div.selected").find(".cards").length > 0) {
    $(".sideTool > div.btn_answer").show();
  }
  if ($(".contents > div.selected").find(".result").length > 0) {
    $(".sideTool > div.btn_answer").show();
  }
  $(".sideTool > div.btn_replay").show();
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
