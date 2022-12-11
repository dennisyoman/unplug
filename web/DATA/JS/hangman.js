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

var checkAnswer = function () {
  var codes = $(".contents > div.selected").find(".hangman .code > span");
  var ans_array = new Array();
  codes.each(function () {
    $(this).removeClass("modeA modeB");
    ans_array.push($(this).attr("ans"));
  });
  codes.each(function () {
    for (var i = 0; i < ans_array.length; i++) {
      if ($(this).text() == ans_array[i]) {
        if ($(this).index() == i) {
          $(this).addClass("modeA");
        } else {
          $(this).addClass("modeB");
        }
      }
    }
  });
  //
  if (
    $(".contents > div.selected").find(".hangman .code > span.modeA").length ==
    codes.length
  ) {
    rootSoundEffect($chimes);
    var uniq = new Date().getTime();
    $(".contents > div.selected .hangman").append(
      `<span class="resultIcon wow bounceIn"><img src="./DATA/IMAGES/common/icon_right.png"/></span><span class="smoke"><img src="./DATA/IMAGES/common/chimes.gif?uniq=${uniq}"/></span>`
    );
    $(".smoke")
      .delay(1500)
      .queue(function () {
        $(".resultIcon").remove();
        $(this).dequeue().remove();
        //下一提
        $(".contents > div.selected .next").show();
        rootSoundEffect($bouncing);
      });
  } else {
    if (
      $(".contents > div.selected").find(".hangman .code > span.modeB")
        .length == 0 &&
      $(".contents > div.selected").find(".hangman .code > span.modeA")
        .length == 0
    ) {
      rootSoundEffect($fail);
      $(".contents > div.selected .hangman").append(
        `<span class="resultIcon wow bounceIn"><img src="./DATA/IMAGES/common/icon_wrong.png"/></span>`
      );
    } else {
      rootSoundEffect($wrong);
      $(".contents > div.selected .hangman").append(
        `<span class="resultIcon wow bounceIn"><img src="./DATA/IMAGES/common/icon_stupid.png"/></span>`
      );
    }
    $(".resultIcon")
      .delay(1500)
      .queue(function () {
        $(this).dequeue().remove();
      });
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
  elem.find(".next").hide();
  var keys = elem.find(".hangman .keys > span");
  var codes = elem.find(".hangman .code > span");
  keys.removeClass("used");
  codes.removeClass("selected modeA modeB");
  codes.eq(0).addClass("selected");
  //reset code
  var tempCode = new Array();
  keys.each(function () {
    tempCode.push($(this).text());
  });
  shuffle(tempCode);
  codes.each(function (index) {
    $(this).attr("ans", tempCode[index]).text("");
  });
  //func
  codes.each(function () {
    $(this)
      .unbind()
      .bind("click", function () {
        $(this)
          .toggleClass("selected")
          .siblings(".selected")
          .removeClass("selected");
      });
  });
  keys.each(function () {
    $(this)
      .unbind()
      .bind("click", function () {
        if (elem.find(".hangman .code > span.selected").length > 0) {
          if ($(this).hasClass("used")) {
            //去掉重複的
            for (var k = 0; k < codes.length; k++) {
              if (codes.eq(k).text() == $(this).text()) {
                codes.eq(k).removeClass("modeA modeB").text("");
              }
            }
            //
            elem
              .find(".hangman .code > span.selected")
              .removeClass("modeA modeB")
              .text($(this).text());
          } else {
            elem
              .find(".hangman .code > span.selected")
              .removeClass("modeA modeB")
              .text($(this).text());
          }
          rootSoundEffect($pop);
        } else {
          rootSoundEffect($wrong);
        }
        //set used
        keys.removeClass("used");
        for (var k = 0; k < codes.length; k++) {
          if (codes.eq(k).text() != "") {
            for (var i = 0; i < keys.length; i++) {
              if (codes.eq(k).text() == keys.eq(i).text()) {
                keys.eq(i).addClass("used");
              }
            }
          }
        }
        //都填好了
        if (
          elem.find(".hangman .keys > span.used").length ==
          elem.find(".hangman .code > span").length
        ) {
          $(".sideTool .btn_check").show();
        } else {
          $(".sideTool .btn_check").hide();
        }
      });
  });
};

var resetTool = function () {
  $(".sideTool > div").removeClass("active").hide();
};
