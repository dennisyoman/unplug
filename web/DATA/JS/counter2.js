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
      $(".sideTool > div.btn_replay")
        .unbind()
        .bind("click", function () {
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

var toneSticker = function (tar) {
  rootSoundEffect($show);
  //
  var areaArr = tar.parent().attr("sticker_area").split(",");
  for (var k = 0; k < areaArr.length; k++) {
    $("#" + areaArr[k]).attr("toneguess", tar.index() + 1);
    $("#" + areaArr[k]).css("filter", tar.attr("cssFilter"));
  }
};

var pasteSticker = function (tar) {
  rootSoundEffect($pop);
  //
  var areaArr = tar.parent().attr("sticker_area").split(",");
  for (var k = 0; k < areaArr.length; k++) {
    $("#" + areaArr[k])
      .empty()
      .attr("curr", tar.index() + 1)
      .append(`<img class="wow bounceIn" src="${tar.attr("sticker")}"/>`);
  }
  //
  ifAnswerComplete();
};

var addup = function (tar, max) {
  rootSoundEffect($key);
  //
  var currNum = tar.text();
  if (currNum == "?") {
    currNum = 1;
  } else {
    currNum = parseInt(currNum) + 1;
  }
  if (currNum > max) {
    currNum = 1;
  }
  tar.removeClass("wrong").text(currNum);
  $("#" + tar.attr("aim")).attr("guess", currNum);
  //
  ifAnswerComplete();
};

var ifAnswerComplete = function () {
  var stickers = $(".contents > div.selected").find(".stickers > span");
  var allDone = true;
  stickers.each(function () {
    if ($(this).attr("ans")) {
      //有正確答案
      if (!$(this).attr("curr")) {
        allDone = false;
      }
    } else {
      if (!$(this).attr("curr") || !$(this).attr("guess")) {
        allDone = false;
      }
    }
  });
  if (allDone) {
    $(".sideTool > div.btn_check").removeClass("active").show();
  }
};

var bingo = function (tar) {
  rootSoundEffect($chimes);
  var uniq = new Date().getTime();
  tar.append(
    `<span class="resultIcon wow bounceIn"><img src="./DATA/IMAGES/common/icon_right.png"/></span><span class="smoke uniq${uniq}"><img src="./DATA/IMAGES/common/chimes2.gif?uniq=${uniq}"/></span>`
  );
  $(`.smoke.uniq${uniq}`)
    .delay(1500)
    .queue(function () {
      $(".resultIcon").remove();
      $(this).dequeue().remove();
    });
};

var switchStickers = function (str) {
  rootSoundEffect($key);
  var strArr = str.split("^");
  var sensors = $(".contents > div.selected").find(".subject > .sensors");
  sensors.each(function (index) {
    $(this).attr("sticker_area", strArr[index]);
  });
};

var checkAnswer = function () {
  var stickers = $(".contents > div.selected").find(".stickers > span");
  var allRight = true;
  stickers.each(function () {
    if ($(this).attr("ans")) {
      //有正確答案
      if ($(this).attr("curr") != $(this).attr("ans")) {
        $(this).empty().removeAttr("curr");
        allRight = false;
      }
      //有tone
      if (
        $(this).attr("tone") &&
        $(this).attr("tone") != $(this).attr("toneguess")
      ) {
        $(this).css("filter", "none").removeAttr("toneguess");
        allRight = false;
      }
    } else {
      if ($(this).attr("curr") != $(this).attr("guess")) {
        allRight = false;
        var counter = $(".contents > div.selected").find(
          `.counters > span[aim='${$(this).attr("id")}']`
        );
        $(this).removeAttr("guess");
        counter.addClass("wrong").text("?");
      }
    }
  });

  if (allRight) {
    bingo($(".contents > div.selected").find(".puzzle"));
  } else {
    rootSoundEffect($stupid);
  }
};

var openContent = function (id) {
  $(".contents > div")
    .eq(id)
    .addClass("selected")
    .siblings(".selected")
    .removeClass("selected");
  resetElem($(".contents > div.selected"));
};

var resetElem = function (elem) {
  resetAudio();
  resetTool();
  elem.find(".selected").removeClass("selected");
  elem.find(".counters > span").removeClass("disable wrong").text("?");
  elem.find(".sensors > span").removeClass();
  elem
    .find(".stickers > span")
    .removeAttr("curr")
    .removeAttr("toneguess")
    .removeAttr("guess")
    .empty();

  $(".smoke").remove();
  $(".resultIcon").remove();
  //
  $(".sideTool > div.btn_replay").removeClass("active").show();
};

var resetTool = function () {
  $(".sideTool > div").removeClass("active").hide();
};
