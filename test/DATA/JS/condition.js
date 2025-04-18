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
          } else {
            showAnswer(false);
          }
        });
      $(".sideTool > div.btn_replay")
        .unbind()
        .bind("click", function () {
          $(this).hide();

          resetElem($(".contents > div.selected"));
        });

      $(".sideTool > div.btn_check")
        .unbind()
        .bind("click", function () {
          $(this).toggleClass("active");
          if ($(this).hasClass("active")) {
            checkAnswer(true);
          } else {
            checkAnswer(false);
          }
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

var showAnswer = function (boolean) {
  if (boolean) {
    //秀出答案圖片
    $(".contents > div.selected .puzzle").addClass("showAnswer");
    $(".sideTool > div.btn_replay").show();
    $(".sideTool > div.btn_check").hide();
    rootSoundEffect($help);
  } else {
    $(".contents > div.selected .puzzle").removeClass("showAnswer");
    $(".sideTool > div.btn_replay").show();
    $(".sideTool > div.btn_check").show();
  }
};
var checkAnswer = function (boolean) {
  if (boolean) {
    //確認是否只剩下一個
    if (
      $(".contents > div.selected .puzzle .subject .items").find(
        "span:not(.selected)"
      ).length == 1
    ) {
      //檢查答案
      var getWrong = false;
      $(".contents > div.selected .puzzle .subject .items")
        .find("span")
        .each(function () {
          $(this).removeClass("wrong");
          if (!$(this).hasClass("selected") && !$(this).hasClass("ans")) {
            $(this).addClass("wrong");
            getWrong = true;
          }
        });

      if (getWrong) {
        rootSoundEffect($stupid);
      } else {
        var uniq = new Date().getTime();
        $(".contents > div.selected")
          .find(".puzzle")
          .append(
            `<span class="resultIcon wow bounceIn"><img src="./DATA/IMAGES/common/icon_right.png"/></span><span class="smoke"><img src="./DATA/IMAGES/common/chimes.gif?uniq=${uniq}"/></span>`
          );
        $(".smoke")
          .delay(1500)
          .queue(function () {
            $(".resultIcon").remove();
            $(this).dequeue().remove();
          });
        //
        rootSoundEffect($chimes);
      }
    } else {
      rootSoundEffect($wrong);
      var alertmsg = "只有一個選項能符合所有條件喔！";
      $(".alert").remove();
      $(".contents > div.selected").append(
        `<div class="alert wow bounceInUp" onclick="$(this).remove()">${alertmsg}</div>`
      );
    }
  } else {
    $(".contents > div.selected .puzzle .subject .items")
      .find("span")
      .removeClass("wrong");
  }
};
var lowlaged = false;

var goCommand = function (cond) {
  var commands = $(".contents > div.selected .puzzle .conditons");
  var condition = $(".contents > div.selected .puzzle .conditon");
  var cid = condition.attr("cid");
  if (cond == 0) {
    cid = 0;
    condition.attr("cid", 0);
    //歸0
    condition.empty().append(commands.find("> span").eq(0).clone());
  } else if (cond > 0) {
    //next
    cid = parseInt(cid) + 1;
    condition.attr("cid", cid);
    condition.empty().append(commands.find("> span").eq(cid).clone());
  } else {
    //prev
    cid = parseInt(cid) - 1;
    condition.attr("cid", cid);
    condition.empty().append(commands.find("> span").eq(cid).clone());
  }
  //btns
  if (cid == 0) {
    $(".contents > div.selected .puzzle .prev").addClass("disable");
  } else {
    $(".contents > div.selected .puzzle .prev").removeClass("disable");
  }
  if (cid == commands.find("> span").length - 1) {
    $(".contents > div.selected .puzzle .next").addClass("disable");
  } else {
    $(".contents > div.selected .puzzle .next").removeClass("disable");
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
  elem.find(".showAnswer").removeClass("showAnswer");
  elem.find(".selected").removeClass("selected");
  elem.find(".wrong").removeClass("wrong");
  elem
    .find(".items > span")
    .unbind()
    .bind("click", function () {
      $(this).removeClass("wrong");
      $(".sideTool > div.btn_replay").show();
      if (elem.find(".conditons").length > 0) {
        $(".sideTool > div.btn_check").removeClass("active").show();
      }
      $(this).toggleClass("selected");
      if ($(this).hasClass("selected")) {
        rootSoundEffect($click);
      }
    });
  //
  if (elem.find(".conditons").length > 0) {
    $(".sideTool > div.btn_answer").removeClass("active").show();
    goCommand(0);
  }
  //
  $(".alert").remove();
  $(".sideTool > div.btn_check").hide();
};

var resetTool = function () {
  $(".sideTool > div").removeClass("active").hide();
};
