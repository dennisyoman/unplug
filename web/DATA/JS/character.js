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
    }
  }

  if (ev.isFinal) {
    //simply drag
    if ($($elem).hasClass("simplyDrag")) {
      lastPosX = 0;
      lastPosY = 0;
    }
    //then
    isDragging = false;
    $elem = null;
  }
};

var showAnswer = function (boolean) {
  if (boolean) {
    //秀出類型1答案
    if ($(".contents > div.selected .textWrapper").length > 0) {
      var dones = $(
        ".contents > div.selected .container > .frames > .textWrapper.done"
      );
      var ansTotalArr = $(".contents > div.selected .container > .frames")
        .attr("ans")
        .split("^");
      var ansDoneArr = [];
      for (var d = 0; d < dones.length; d++) {
        ansDoneArr.push(dones.eq(d).attr("ans"));
      }
      //確認是否在已完成正確答案裡面
      for (var k = 0; k < ansTotalArr.length; k++) {
        if (ansDoneArr.indexOf(ansTotalArr[k]) < 0) {
          var currAnsArr = ansTotalArr[k].split(",");
          var target = $(
            ".contents > div.selected .container > .frames > .textWrapper:not('.done')"
          ).eq(0);
          for (var i = 0; i < currAnsArr.length; i++) {
            target
              .find(".mainText > span[pid='" + currAnsArr[i] + "']")
              .addClass("selected");
          }
          target.addClass("done").attr("ans", currAnsArr.join(","));
        }
      }
    }
    //秀出類型2答案
    if ($(".contents > div.selected .textFrame").length > 0) {
      $(".contents > div.selected .textFrame").addClass("done");
    }
    //秀出類型3答案
    if ($(".contents > div.selected .textDrag").length > 0) {
      $(".contents > div.selected .textDrag > span").each(function () {
        var answerPosArr = $(this).attr("ap").split(",");
        var clonee = $(this).clone().addClass("disabled");
        clonee
          .css("top", answerPosArr[0] + "px")
          .css("left", answerPosArr[1] + "px");

        $(".contents > div.selected .textDrag").append(clonee);
      });
    }
    rootSoundEffect($help);
  } else {
    $(".sideTool > div.btn_replay").click();
  }
};

var checkAnswer = function () {
  var from = $(
    ".contents > div.selected .container > .textWrapper > .mainText"
  );
  var currAnsArr = [];
  for (var d = 0; d < from.find(">span.selected").length; d++) {
    currAnsArr.push(from.find(">span.selected").eq(d).attr("pid"));
  }
  //小到大排序
  currAnsArr.sort(function (a, b) {
    return a - b;
  });

  var dones = $(
    ".contents > div.selected .container > .frames > .textWrapper.done"
  );
  var emptyFrames = $(
    ".contents > div.selected .container > .frames > .textWrapper:not('.done')"
  );
  var ansTotalArr = $(".contents > div.selected .container > .frames")
    .attr("ans")
    .split("^");
  var ansDoneArr = [];
  for (var d = 0; d < dones.length; d++) {
    ansDoneArr.push(dones.eq(d).attr("ans"));
  }
  //先確認是否在正確答案裡面
  if (ansTotalArr.indexOf(currAnsArr.join(",")) >= 0) {
    if (ansDoneArr.indexOf(currAnsArr.join(",")) >= 0) {
      //已經有答案了
      rootSoundEffect($stupid);
      var alertmsg = "答案不能重複";
      $(".contents > div.selected").append(
        `<div class="alert wow bounceInUp" onclick="$(this).remove()">${alertmsg}</div>`
      );
    } else {
      //填入新格子
      for (var i = 0; i < currAnsArr.length; i++) {
        emptyFrames
          .eq(0)
          .addClass("done")
          .attr("ans", currAnsArr.join(","))
          .find(".mainText > span[pid='" + currAnsArr[i] + "']")
          .addClass("selected");
      }
      rootSoundEffect($right);
      bingo(emptyFrames.eq(0));
    }
  } else {
    //錯誤答案
    rootSoundEffect($wrong);
    var alertmsg = "沒有這種組合喔";
    $(".contents > div.selected").append(
      `<div class="alert wow bounceInUp" onclick="$(this).remove()">${alertmsg}</div>`
    );
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
  elem.find(".done").removeClass("done");
  //reset and create frames
  var clonner = elem.find(".container > .textWrapper > .mainText");
  elem.find(".frames .textWrapper").empty().removeAttr("ans");
  elem.find(".frames .textWrapper").each(function () {
    $(this).append(clonner.clone());
    if ($(this).attr("pre")) {
      var pre = $(this).attr("pre");
      var preArr = pre.split(",");
      for (var i = 0; i < preArr.length; i++) {
        $(this)
          .find(".mainText > span[pid='" + preArr[i] + "']")
          .addClass("selected");
        $(this).addClass("done").attr("ans", pre);
      }
    }
  });
  //類型1
  elem
    .find(".container > .textWrapper > .mainText > span")
    .unbind()
    .bind("click", function () {
      $(this).toggleClass("selected");
      rootSoundEffect($key);
      //確認有無點擊
      if ($(this).parent().find(">span.selected").length > 0) {
        $(".sideTool > div.btn_check").show();
      } else {
        $(".sideTool > div.btn_check").hide();
      }
    });
  //類型2
  elem
    .find(".container > .textParts > span")
    .unbind()
    .bind("click", function () {
      var pid = $(this).attr("pid");
      var target = elem.find(
        ".container > .textCombo > span[ans='" + pid + "']:not('.done')"
      );
      if (target.length > 0) {
        target.eq(0).addClass("done");
        rootSoundEffect($right);
        bingo($(this));
        $(".sideTool > div.btn_replay").show();
      } else {
        rootSoundEffect($wrong);
      }
    });
  //類型3
  elem.find(".simplyDrag.disabled").remove();
  elem.find(".container > .textDrag > span").each(function () {
    var initPosArr = $(this).attr("ip").split(",");
    $(this)
      .css("top", initPosArr[0] + "px")
      .css("left", initPosArr[1] + "px");
  });
  //smoke effect
  $(".smoke").remove();
  $(".resultIcon").remove();
  $(".alert").remove();
  //
  $(".sideTool > div.btn_answer").show();
};

var resetTool = function () {
  $(".sideTool > div").removeClass("active").hide();
};

var bingo = function (tar) {
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
