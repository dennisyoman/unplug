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

var checkStatus = function () {
  if (
    $(".contents > div.selected").find(".flood").length > 0 &&
    $(".contents > div.selected").find(".flood > span").length ==
      $(".contents > div.selected").find(".flood > span").children().length
  ) {
    console.log("flood");
    $(".sideTool > div.btn_check").removeClass("active").show();
  }
  if ($(".contents > div.selected").find(".volcano").length > 0) {
    console.log("volcano");
    var complete = true;
    $(".contents > div.selected")
      .find(".volcano > span")
      .each(function () {
        if ($(this).find("p").text() == "") {
          complete = false;
        }
      });
    if (complete) {
      $(".sideTool > div.btn_check").removeClass("active").show();
    }
  }
  //
  $(".sideTool > div.btn_answer").removeClass("active");
};
var showAnswer = function (boolean) {
  if (boolean) {
    //秀出答案
    var days = $(".contents > div.selected").find(".calendar >div > span");
    $(".contents > div.selected")
      .find(".flood > span")
      .each(function () {
        var ans = $(this).attr("ans");
        $(this).empty().append(`<p>${ans}</p>`);
        for (var c = 0; c < days.length; c++) {
          if (days.eq(c).attr("ans") == ans) {
            $(this)
              .addClass(days.eq(c).attr("class"))
              .removeClass("active wrong");
          }
        }
      });
    $(".contents > div.selected")
      .find(".volcano > span")
      .each(function () {
        var ans = $(this).attr("ans");
        $(this).find("p").text(ans);
        for (var c = 0; c < days.length; c++) {
          if (days.eq(c).attr("ans") == ans) {
            $(this)
              .addClass(days.eq(c).attr("class"))
              .removeClass("active wrong");
          }
        }
      });
    //
    rootSoundEffect($help);
    $(".sideTool > div.btn_check").removeClass("active").show();
    $(".sideTool > div.btn_replay").removeClass("active").show();
  } else {
    $(".sideTool > div.btn_replay").click();
  }
};

var floodTimeout;
var floodDuration = 1000;

var checkAnswer = function (boolean) {
  if (boolean) {
    //
    $(".contents > div.selected")
      .find(".calendar >div > span")
      .removeClass("active");
    $(".contents > div.selected").find(".flood > span").removeClass("active");
    $(".contents > div.selected").find(".volcano > span").removeClass("active");
    $(".sideTool > div.btn_answer").hide();
    if ($(".contents > div.selected").find(".flood").length > 0) {
      flooding();
      rootSoundEffect($flood);
    }
    if ($(".contents > div.selected").find(".volcano").length > 0) {
      lava();
      rootSoundEffect($lava);
    }
    //
    $(".contents > div.selected").find(".map").addClass("flooding");
  } else {
    clearTimeout(floodTimeout);
    $(".contents > div.selected").find(".active").removeClass("active");
    $(".contents > div.selected").find(".flooding").removeClass("flooding");
    $(".smoke").remove();
    $(".sideTool > div.btn_answer").show();
    resetAudio();
  }
};

var flooding = function () {
  var days = $(".contents > div.selected").find(".calendar >div > span");
  var blocks = $(".contents > div.selected").find(".flood > span");
  for (var k = 0; k < days.length; k++) {
    if (!days.eq(k).hasClass("active")) {
      days.eq(k).addClass("active");
      //
      blocks.each(function () {
        var ans = $(this).attr("ans");
        var filledAns = $(this).find("p").text();
        if (ans == days.eq(k).attr("ans")) {
          if (ans != filledAns) {
            $(this)
              .removeClass()
              .addClass("wrong")
              .html(
                `<img class="wow bounceIn" src="./DATA/IMAGES/common/icon_wrong.png"/>`
              );
          } else {
            $(this).addClass("active");
          }
        }
      });
      //check wrong step
      if (
        $(".contents > div.selected").find(".flood > span.wrong").length == 0
      ) {
        //over check
        if (
          blocks.length ==
          $(".contents > div.selected").find(".flood > span.active").length
        ) {
          rootSoundEffect($chimes);
          $(".contents > div.selected")
            .find(".area")
            .append(
              `<span class="smoke"><img src="./DATA/IMAGES/common/chimes.gif"/></span>`
            );
          $(".smoke")
            .delay(2000)
            .queue(function () {
              $(this).dequeue().remove();
            });
        } else {
          floodTimeout = setTimeout(function () {
            flooding();
          }, floodDuration);
        }
      } else {
        rootSoundEffect($fail);
        $(".sideTool > div.btn_check").removeClass("active");
        $(".sideTool > div.btn_answer").removeClass("active").show();
        //
        $(".contents > div.selected").find(".map").removeClass("flooding");
      }
      //
      break;
    }
  }
};

var lava = function () {
  var days = $(".contents > div.selected").find(".calendar >div > span");
  var blocks = $(".contents > div.selected").find(".volcano > span");
  for (var k = 0; k < days.length; k++) {
    if (!days.eq(k).hasClass("active")) {
      days.eq(k).addClass("active");
      //
      blocks.each(function () {
        var ans = $(this).attr("ans");
        var filledAns = $(this).find("p").text();
        if (ans == days.eq(k).attr("ans")) {
          if (ans != filledAns) {
            $(this)
              .removeClass()
              .addClass("wrong")
              .find("p")
              .html(
                `<img class="wow fadeIn" src="./DATA/IMAGES/common/icon_wrong.png"/>`
              );
          } else {
            $(this).addClass("active");
          }
        }
      });
      //check wrong step
      if (
        $(".contents > div.selected").find(".volcano > span.wrong").length == 0
      ) {
        //over check
        if (
          blocks.length ==
          $(".contents > div.selected").find(".volcano > span.active").length
        ) {
          rootSoundEffect($chimes);
          $(".contents > div.selected")
            .find(".area")
            .append(
              `<span class="smoke"><img src="./DATA/IMAGES/common/chimes.gif"/></span>`
            );
          $(".smoke")
            .delay(2000)
            .queue(function () {
              $(this).dequeue().remove();
            });
        } else {
          floodTimeout = setTimeout(function () {
            lava();
          }, floodDuration);
        }
      } else {
        rootSoundEffect($fail);
        $(".sideTool > div.btn_check").removeClass("active");
        $(".sideTool > div.btn_answer").removeClass("active").show();
        //
        $(".contents > div.selected").find(".map").removeClass("flooding");
      }
      //
      break;
    }
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
  resetAudio();
  clearTimeout(floodTimeout);
  //
  elem.find(".selected").removeClass("selected");
  elem.find(".active").removeClass("active");
  elem.find(".wrong").removeClass("wrong");
  elem.find(".flooding").removeClass("flooding");
  //
  elem.find(".calendar >div > span").each(function () {
    $(this)
      .addClass("c" + (($(this).index() % 6) + 1))
      .html($(this).attr("ans"))
      .unbind()
      .bind("click", function () {
        //check seq
        var seq = $(this).attr("ans");
        seq = parseInt(seq) - 1;
        if (
          elem.find(".flood > span.c" + seq).length > 0 ||
          elem.find(".volcano > span.c" + seq).length > 0 ||
          seq == 0
        ) {
          rootSoundEffect($key);
          $(this).addClass("active").siblings(".active").removeClass("active");
        } else {
          rootSoundEffect($wrong);
        }
      });
  });
  elem.find(".flood > span").each(function () {
    $(this)
      .removeClass()
      .empty()
      .unbind()
      .bind("click", function () {
        var day = $(".contents > div.selected").find(".calendar span.active");
        if (day.length > 0) {
          $(".sideTool > div.btn_replay").show();
          //
          rootSoundEffect($key);
          $(this)
            .removeClass()
            .addClass(day.attr("class"))
            .removeClass("active")
            .html(`<p>${day.attr("ans")}</p>`);
        } else {
          rootSoundEffect($wrong);
        }
        //
        checkStatus();
      });
  });
  elem.find(".volcano > span").each(function () {
    $(this).css("mask-image", "url(" + $(this).attr("mask") + ")");
    $(this).css("-webkit-mask-image", "url(" + $(this).attr("mask") + ")");
    $(this).find("p").text("");

    $(this)
      .removeClass()
      .unbind()
      .bind("click", function () {
        var day = $(".contents > div.selected").find(".calendar span.active");
        if (day.length > 0) {
          $(".sideTool > div.btn_replay").show();
          //
          rootSoundEffect($key);
          $(this)
            .removeClass()
            .addClass(day.attr("class"))
            .removeClass("active")
            .find("p")
            .html(day.attr("ans"));
        } else {
          rootSoundEffect($wrong);
        }
        //
        checkStatus();
      });
  });
  /*
  elem.find(".volcano > span").each(function () {
    var ww = $(this).get(0).style.width;
    var hh = $(this).get(0).style.height;
    $(this).get(0).style.width = Math.round((parseInt(ww) * 3) / 5) + "px";
    $(this).get(0).style.height = Math.round((parseInt(hh) * 3) / 5) + "px";
  });
  console.log("------");
  console.log(elem.find(".volcano").html());*/

  //
  $(".sideTool > div.btn_answer").removeClass("active").show();
  $(".sideTool > div.btn_check").removeClass("active").hide();
  $(".smoke").remove();
};

var resetTool = function () {
  $(".sideTool > div").removeClass("active").hide();
};
