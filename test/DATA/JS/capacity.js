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
            showAnswer(true);
            $(".sideTool > div.btn_replay").show();
            $(".sideTool > div.btn_check").hide();
          } else {
            showAnswer(false);
            $(".sideTool > div.btn_replay").hide();
          }
        });

      $(".sideTool > div.btn_replay")
        .unbind()
        .bind("click", function () {
          $(".sideTool > div.btn_check").hide();
          $(".sideTool > div.btn_answer").removeClass("active");
          $(this).hide();
          resetElem($(".contents > div.selected"));
        });

      $(".sideTool > div.btn_check")
        .unbind()
        .bind("click", function () {
          checkAnswer();
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

    //simply drag
    if ($($elem).hasClass("simplyDrag")) {
      lastPosX = $elem.offsetLeft;
      lastPosY = $elem.offsetTop;
    }
  }

  if (isDragging && $elem) {
    //simply drag
    if ($($elem).hasClass("simplyDrag")) {
      $($elem).get(0).style.top = ev.deltaY / stageRatioReal + lastPosY + "px";
      $($elem).get(0).style.left = ev.deltaX / stageRatioReal + lastPosX + "px";
      checkCollision(ev);
    }
  }

  if (ev.isFinal) {
    //simply drag
    if ($($elem).hasClass("simplyDrag")) {
      //不能與自己感應
      $($elem).removeClass("selected");
      //
      lastPosX = 0;
      lastPosY = 0;
      resetPos($($elem));
      var frameElem = $(".contents > div.selected .cupsArea .sensor");
      var gotit = false;
      frameElem.each(function () {
        if ($(this).hasClass("selected")) {
          gotit = true;
        }
      });
      //checkCollision true
      if (gotit) {
        //check order status
        checkStatus();
      } else {
        console.log("沒碰到東西");
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
  var frameElem = $(".contents > div.selected .cupsArea .sensor");
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

var msg = "";
var checkStatus = function () {
  msg = "";
  $(".alert").remove();
  //是否有成功動作
  var moveMade = true;

  //做甚麼動作
  var touchElem = $(".contents > div.selected .cupsArea .sensor.selected");
  var cup1 = $(".contents > div.selected .cupsArea .cup1");
  var cup2 = $(".contents > div.selected .cupsArea .cup2");
  if (touchElem.hasClass("pour")) {
    console.log("倒水");
    if (parseInt($($elem).attr("fill")) > 0) {
      rootSoundEffect($show);
      setCap($($elem), 0);
    } else {
      msg = "容器裡沒有水，不需要倒掉。";
      moveMade = false;
      rootSoundEffect($wrong);
    }
  } else if (touchElem.hasClass("refill")) {
    //console.log("裝滿水");
    if (parseInt($($elem).attr("fill")) < parseInt($($elem).attr("cap"))) {
      rootSoundEffect($fill);
      setCap($($elem), parseInt($($elem).attr("cap")));
    } else {
      msg = "容器是滿的，無法加水。";
      moveMade = false;
      rootSoundEffect($wrong);
    }
  } else if (touchElem.hasClass("cup1")) {
    //console.log("cup2倒進cup1");
    if (parseInt($($elem).attr("fill")) > 0) {
      var vacancyCup1 =
        parseInt(cup1.attr("cap")) - parseInt(cup1.attr("fill"));
      var fillCup2 = parseInt(cup2.attr("fill"));
      if (vacancyCup1 > 0) {
        //還有空間
        rootSoundEffect($fill);
        if (vacancyCup1 >= fillCup2) {
          //容量夠
          var finalCup1 = parseInt(cup1.attr("fill")) + fillCup2;
          var finalCup2 = 0;
        } else {
          var finalCup1 = parseInt(cup1.attr("cap"));
          var finalCup2 = fillCup2 - vacancyCup1;
        }
        setCap(cup1, finalCup1);
        setCap(cup2, finalCup2);
      } else {
        //滿了不能倒了
        msg = "容器已滿，無法加水進去。";
        moveMade = false;
        rootSoundEffect($wrong);
      }
    } else {
      //滿了不能倒了
      msg = "容器裡沒有水。";
      moveMade = false;
      rootSoundEffect($wrong);
    }
  } else if (touchElem.hasClass("cup2")) {
    if (parseInt($($elem).attr("fill")) > 0) {
      //console.log("cup1倒進cup2");
      var vacancyCup2 =
        parseInt(cup2.attr("cap")) - parseInt(cup2.attr("fill"));
      var fillCup1 = parseInt(cup1.attr("fill"));
      if (vacancyCup2 > 0) {
        //還有空間
        rootSoundEffect($fill);
        if (vacancyCup2 >= fillCup1) {
          //容量夠
          var finalCup2 = parseInt(cup2.attr("fill")) + fillCup1;
          var finalCup1 = 0;
        } else {
          var finalCup2 = parseInt(cup2.attr("cap"));
          var finalCup1 = fillCup1 - vacancyCup2;
        }
        setCap(cup1, finalCup1);
        setCap(cup2, finalCup2);
      } else {
        //滿了不能倒了
        msg = "容器已滿，無法加水進去。";
        moveMade = false;
        rootSoundEffect($wrong);
      }
    } else {
      //滿了不能倒了
      msg = "容器裡沒有水。";
      moveMade = false;
      rootSoundEffect($wrong);
    }
  } else {
    moveMade = false;
    //console.log("甚麼事情都沒有做");
  }
  //是否需要更新步驟
  if (moveMade) {
    var stepBoard = $(".contents > div.selected .steps > .step");
    for (var k = 0; k < stepBoard.length; k++) {
      if (stepBoard.eq(k).find(".capacity").eq(0).text() == "") {
        var stepCup1 = stepBoard.eq(k).find(".cup1");
        var stepCup2 = stepBoard.eq(k).find(".cup2");
        stepBoard.eq(k).addClass("disable");
        stepBoard.eq(k).find(".capacity").eq(0).text(cup1.attr("fill"));
        stepBoard.eq(k).find(".capacity").eq(1).text(cup2.attr("fill"));
        setCap(stepCup1, cup1.attr("fill"));
        setCap(stepCup2, cup2.attr("fill"));
        break;
      }
    }

    checkAnswer();
  } else {
    //alert
    if (msg != "") {
      $(".contents > div.selected").append(
        `<div class="alert wow bounceInUp" onclick="$(this).remove()">${msg}</div>`
      );
    }
  }

  //
  $(".sideTool > div.btn_replay").show();
};

var showAnswer = function (boolean) {
  if (boolean) {
    //秀出答案
  } else {
  }
};

var checkAnswer = function () {
  var ans = $(".contents > div.selected .cupsArea").attr("ans");
  var gotAns = false;
  $(".contents > div.selected .capacity").each(function () {
    if ($(this).text() == ans) {
      $(this).addClass("selected");
      gotAns = true;
    }
  });
  if (gotAns) {
    console.log("答對");
    bingo($(".contents > div.selected .cupsArea"));
  } else {
    if (
      $(".contents > div.selected .steps > .step:not('.disable')").length == 0
    ) {
      console.log("錯誤");
      gameover($(".contents > div.selected .cupsArea"));
    }
  }
  //alert
  if (msg != "") {
    $(".contents > div.selected").append(
      `<div class="alert wow bounceInUp" onclick="$(this).remove()">${msg}</div>`
    );
  }
};

//把容器放回原位
var resetPos = function (tar) {
  var pos = tar.attr("ap").split(",");
  tar
    .removeAttr("style")
    .css("top", pos[0] + "px")
    .css("left", pos[1] + "px");
};

//設定容器的容量(num為單位量)
var setCap = function (tar, num) {
  var capcity = (num / parseInt(tar.attr("cap"))) * 100;
  tar
    .attr("fill", num)
    .find(".water")
    .css("height", capcity + "%");
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
  elem.find(".disable").removeClass("disable");
  elem.find(".simplyDrag").removeAttr("style");
  //ap
  elem.find(".cupsArea .cup").each(function () {
    resetPos($(this));
  });
  //reset water
  elem.find(".cup").each(function () {
    $(this).find(".water").remove();
    $(this).append("<span class='water'/>");
    //倒光水
    setCap($(this), 0);
  });

  //reset storyboard
  elem.find(".storyboard").removeClass("step2 step3 step4").addClass("step1");
  //reset steps
  elem.find(".steps > .step").each(function () {
    $(this).find(".capacity").text("");
  });
  $(".alert").remove();
  //smoke effect
  $(".smoke").remove();
  $(".resultIcon").remove();
  $(".cardAvatarDie").remove();
  //
  $(".sideTool > div.btn_answer").show();
};

var resetTool = function () {
  $(".sideTool > div").removeClass("active").hide();
};

var bingo = function (tar) {
  rootSoundEffect($chimes);
  var uniq = new Date().getTime();
  tar.append(
    `<span class="resultIcon wow bounceIn" style="z-index:9998"><img src="./DATA/IMAGES/common/icon_right.png"/></span><span class="smoke" style="z-index:9999"><img src="./DATA/IMAGES/common/chimes2.gif?uniq=${uniq}"/></span>`
  );
  $(".smoke")
    .delay(1500)
    .queue(function () {
      $(".resultIcon").remove();
      $(this).dequeue().remove();
    });
};

var gameover = function (tar) {
  rootSoundEffect($stupid);
  var uniq = new Date().getTime();
  tar.append(
    `<span class="resultIcon wow bounceIn" style="z-index:9998"><img src="./DATA/IMAGES/common/icon_wrong.png"/></span><span class="smoke" style="z-index:9999"><img src="./DATA/IMAGES/common/smoke.gif?uniq=${uniq}"/></span>`
  );
  $(".smoke")
    .delay(1500)
    .queue(function () {
      $(".resultIcon").remove();
      $(this).dequeue().remove();
    });
};

//任務二
var goto = function (tar) {
  if (tar.hasClass("step1")) {
    rootSoundEffect($fill);
    tar.removeClass("step1").addClass("step2");
  } else if (tar.hasClass("step2")) {
    rootSoundEffect($fill);
    tar.removeClass("step2").addClass("step3");
  } else if (tar.hasClass("step3")) {
    rootSoundEffect($pop);
    $(".sideTool > div.btn_replay").show();
    tar.addClass("step4");
  }
};
var goto2 = function (tar) {
  if (tar.hasClass("step1")) {
    rootSoundEffect($fill);
    tar.removeClass("step1").addClass("step2");
  } else if (tar.hasClass("step2")) {
    rootSoundEffect($fill);
    tar.removeClass("step2").addClass("step3");
  } else if (tar.hasClass("step3")) {
    rootSoundEffect($fill);
    tar.removeClass("step3").addClass("step4");
    tar.addClass("step4");
    $(".sideTool > div.btn_replay").show();
  }
};
