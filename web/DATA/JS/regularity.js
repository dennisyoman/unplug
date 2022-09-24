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
          $(".sideTool > div.btn_check").hide();
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

var showAnswer = function (boolean) {
  if (boolean) {
    //秀出答案圖片
    //$(".contents > div.selected .puzzle").addClass("showAnswer");
    $(".contents > div.selected .puzzle .subject")
      .find("span")
      .each(function () {
        var mode = $(this).attr("mode").split("^");
        $(this).removeClass("wrong");
        $(this).removeClass(mode.join(" "));
        $(this).addClass($(this).attr("ans"));
      });
    $(".sideTool > div.btn_replay").show();
    $(".sideTool > div.btn_check").hide();
    rootSoundEffect($help);
  } else {
    $(".sideTool > div.btn_replay").click();
  }
};
var checkAnswer = function (boolean) {
  //檢查答案
  $(".contents > div.selected .puzzle .subject")
    .find("span")
    .each(function () {
      if ($(this).hasClass($(this).attr("ans"))) {
        $(this).removeClass("wrong");
      } else {
        $(this).addClass("wrong");
      }
    });

  if (
    $(".contents > div.selected .puzzle .subject").find("span.wrong").length > 0
  ) {
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
};
var lowlaged = false;

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
  elem.find(".subject > span").each(function () {
    var mode = $(this).attr("mode").split("^");
    $(this)
      .removeClass(mode.join(" "))
      .unbind()
      .bind("click", function () {
        $(this).removeClass("wrong");
        $(".sideTool > div.btn_check").show();
        $(".sideTool > div.btn_replay").show();
        //
        rootSoundEffect($click);
        mode = $(this).attr("mode").split("^");
        var curID = 0;
        for (var i = 0; i < mode.length; i++) {
          if ($(this).hasClass(mode[i])) {
            $(this).removeClass(mode[i]);
            curID = i + 1;
          }
        }
        if (curID >= mode.length) {
          curID = 0;
        }
        $(this).addClass(mode[curID]);
      });
    //defaultClass
    if ($(this).attr("defaultClass")) {
      $(this).addClass($(this).attr("defaultClass"));
    }
  });

  $(".sideTool > div.btn_answer").removeClass("active").show();
};

var resetTool = function () {
  $(".sideTool > div").removeClass("active").hide();
};
