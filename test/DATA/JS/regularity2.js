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

var moveMe = function (tar) {
  if (tar.hasClass("available")) {
    $(".contents > div.selected .subject span.available").removeClass(
      "available",
    );
    //
    var prevDot = $(".contents > div.selected .subject span.selected");
    if (prevDot.length > 0) {
      prevDot.removeClass("selected").addClass(tar.attr("dir"));
    }
    //
    tar.addClass("selected visited").removeClass("available");

    rootSoundEffect($show);
    //next colour from hint
    var hint = $(".contents > div.selected .hint");
    var colourIndex = hint.find(">span.selected").index();
    colourIndex = colourIndex + 1;
    if (colourIndex >= hint.find(">span").length) {
      colourIndex = 0;
    }
    hint
      .find(">span")
      .eq(colourIndex)
      .addClass("selected")
      .siblings(".selected")
      .removeClass("selected");
    // next available dots
    var colour = hint.find(">span").eq(colourIndex).attr("ans");
    var tarIndex = tar.index();
    var prevLine = tar.parent().prev();
    var nextLine = tar.parent().next();
    if (prevLine.length > 0) {
      var tempDot = prevLine.find("> span").eq(tarIndex);
      if (tempDot.hasClass(colour) && !tempDot.hasClass("visited")) {
        tempDot.addClass("available").attr("dir", "north");
      }
    }
    if (nextLine.length > 0) {
      var tempDot = nextLine.find("> span").eq(tarIndex);
      if (tempDot.hasClass(colour) && !tempDot.hasClass("visited")) {
        tempDot.addClass("available").attr("dir", "south");
      }
    }
    if (tar.prev().length > 0) {
      var tempDot = tar.prev();
      if (tempDot.hasClass(colour) && !tempDot.hasClass("visited")) {
        tempDot.addClass("available").attr("dir", "west");
      }
    }
    if (tar.next().length > 0) {
      var tempDot = tar.next();
      if (tempDot.hasClass(colour) && !tempDot.hasClass("visited")) {
        tempDot.addClass("available").attr("dir", "east");
      }
    }
    //check result
    if (tar.hasClass("peach")) {
      rootSoundEffect($chimes);
      //effect
      var uniq = new Date().getTime();
      $(".contents > div.selected")
        .find(".subject")
        .append(
          `<span class="resultIcon wow bounceIn small"><img src="./DATA/PT/BOOK5/IMAGES/peach.png"/></span><span class="smoke"><img src="./DATA/IMAGES/common/chimes.gif?uniq=${uniq}"/></span>`,
        );
      $(".smoke")
        .delay(1500)
        .queue(function () {
          $(".resultIcon").remove();
          $(this).dequeue().remove();
        });
      //addup
      var sum = $(".contents > div.selected").find(".result > p > span").text();
      sum = parseInt(sum) + 1;
      $(".contents > div.selected").find(".result > p > span").text(sum);
    } else if (tar.hasClass("end")) {
      $(".contents > div.selected .subject span.available").removeClass(
        "available",
      );
      //
      rootSoundEffect($correct);
      //
      var uniq = new Date().getTime();
      $(".contents > div.selected")
        .find(".subject")
        .append(
          `<span class="resultIcon wow bounceIn small"><img src="./DATA/PT/BOOK5/IMAGES/shovel.png"/></span><span class="smoke"><img src="./DATA/IMAGES/common/chimes.gif?uniq=${uniq}"/></span>`,
        );
      $(".smoke")
        .delay(2500)
        .queue(function () {
          $(".resultIcon").remove();
          $(this).dequeue().remove();
        });
    } else if (
      $(".contents > div.selected .subject span.available").length < 1
    ) {
      rootSoundEffect($wrong);
      //
      var uniq = new Date().getTime();
      $(".contents > div.selected")
        .find(".subject")
        .append(
          `<span class="resultIcon wow bounceInDown"><img src="./DATA/IMAGES/common/icon_wrong.png"/></span>`,
        );
      $(".resultIcon")
        .delay(2500)
        .queue(function () {
          $(this).dequeue().remove();
        });
    }
  } else {
    rootSoundEffect($stupid);
  }
};

var showAnswer = function (boolean) {
  if (boolean) {
    //秀出答案
    $(".contents > div.selected")
      .find(".subject span")
      .each(function () {
        $(this)
          .removeClass("wrong available visited east south west north selected")
          .removeAttr("dir");
        if ($(this).attr("ans")) {
          $(this).addClass("visited " + $(this).attr("ans"));
        }
        if ($(this).hasClass("end")) {
          $(this).addClass("selected");
        }
      });
    var sum = $(".contents > div.selected")
      .find(".result > p > span")
      .attr("ans");
    $(".contents > div.selected").find(".result > p > span").text(sum);
    //
    $(".sideTool > div.btn_replay").show();
    rootSoundEffect($help);
  } else {
    $(".sideTool > div.btn_replay").click();
  }
};

var lowlaged = false;

var openContent = function (id) {
  resetAudio();
  resetTool();
  //20260204
  removeToggleAttachment();
  $(".contents > div")
    .eq(id)
    .addClass("selected")
    .siblings(".selected")
    .removeClass("selected");
  resetElem($(".contents > div.selected"));
};

var resetElem = function (elem) {
  elem.find(".selected").removeClass("selected");
  elem.find(".subject span").each(function () {
    $(this)
      .removeClass("wrong available visited east south west north selected")
      .removeAttr("dir")
      .unbind()
      .bind("click", function () {
        moveMe($(this));
        $(".sideTool > div.btn_replay").show();
      });
    if ($(this).hasClass("start")) {
      $(this).addClass("available");
    }
  });
  elem.find(".hint > span").each(function () {
    if ($(this).hasClass("start")) {
      $(this).addClass("selected");
    }
  });
  elem.find(".result > p > span").text("0");

  $(".sideTool > div.btn_answer").removeClass("active").show();
};

var resetTool = function () {
  $(".sideTool > div").removeClass("active").hide();
};
