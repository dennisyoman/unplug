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
            $(".sideTool > div.btn_replay").show();
            showAnswer(true);
          } else {
            //showAnswer(false);
            resetElem($(".contents > div.selected"));
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
          $(this).hide();
          $(".sideTool > div.btn_answer").removeClass("active");
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

var trigMe = function (tar) {
  var frame = $(".contents > div.selected").find(".puzzle .items.selected");
  //
  if (tar.parent().parent().hasClass("code")) {
    if (frame.length > 0) {
      var answerArr = frame.attr("ans").split(",");
      if (frame.find(">span").length < answerArr.length) {
        //還有欄位
        rootSoundEffect($pop);
        $(".sideTool > div.btn_replay").show();
        frame.append(tar.clone());
        if (frame.find(".indicator").length > 0) {
          updateIndicator(frame);
        }
      } else {
        //答案已滿
        rootSoundEffect($wrong);
      }
    }
  }
  if (tar.parent().parent().hasClass("puzzle")) {
    rootSoundEffect($show);
    tar
      .parent()
      .addClass("selected")
      .siblings(".selected")
      .removeClass("selected");
    tar.remove();
    window.event.stopPropagation();
  }
  //
  $(".sideTool > div.btn_answer").removeClass("active");
};

var trigMeHash = function (tar) {
  var frame = $(".contents > div.selected").find(".puzzle .items.selected");
  //
  if (tar.parent().parent().hasClass("code")) {
    if (
      tar.attr("iid") == "h1" ||
      tar.attr("iid") == "h2" ||
      tar.attr("iid") == "h3"
    ) {
      if (frame.length > 0) {
        var answerArr = frame.attr("ans").split(",");
        if (frame.find(">span").length < answerArr.length) {
          //還有欄位
          rootSoundEffect($pop);
          frame.append(tar.clone());
        } else {
          //答案已滿
          rootSoundEffect($wrong);
        }
      }
    } else if (tar.hasClass("done")) {
      if (frame.length > 0) {
        //填入
        var answerArr = frame.attr("ans").split(",");
        if (frame.find(">span").length < answerArr.length) {
          //還有欄位
          rootSoundEffect($pop);
          frame.append(tar.clone());
        } else {
          //答案已滿
          rootSoundEffect($wrong);
        }
      } else {
        var newSeq = parseInt(tar.attr("seq")) + 1;
        if (newSeq > 9) {
          newSeq = 1;
        }
        tar.attr("seq", newSeq);
        tar.empty().append(`
        <img
          width="20"
          height="auto"
          style="opacity:1;"
          src="./DATA/PT/BOOK2/IMAGES/hash_${tar.attr("seq")}.png"
      />`);
        rootSoundEffect($show);
      }
    } else {
      if (frame.length > 0) {
        frame.removeClass("selected");
      }
      tar.addClass("done");
      tar.attr("seq", 1);
      tar.empty().append(`
      <img
        width="20"
        height="auto"
        style="opacity:1;"
        src="./DATA/PT/BOOK2/IMAGES/hash_${tar.attr("seq")}.png"
    />`);
      rootSoundEffect($show);
    }
  }
  if (tar.parent().parent().hasClass("puzzle")) {
    rootSoundEffect($show);
    tar
      .parent()
      .addClass("selected")
      .siblings(".selected")
      .removeClass("selected");
    tar.remove();
    window.event.stopPropagation();
  }
  //
  $(".sideTool > div.btn_answer").removeClass("active");
};

var trigMeCheck = function (tar) {
  tar.removeClass("wrong").toggleClass("selected");
  rootSoundEffect($show);
  //
  $(".sideTool > div.btn_answer").removeClass("active");
};

var checkAnswer = function () {
  //code
  var getWrong = false;
  var codeItems = $(".contents > div.selected .code").find(".items > span");
  codeItems.each(function () {
    $(this).removeClass("wrong");
    var iid = $(this).attr("iid");
    var seq = $(this).attr("seq");
    if (seq && $(this).hasClass("done")) {
      if (iid != "h" + seq) {
        $(this).addClass("wrong");
        getWrong = true;
      }
    }
  });

  //checks
  var checkItems = $(".contents > div.selected .check").find(".items > span");
  checkItems.each(function () {
    $(this).removeClass("wrong");
    var ans = $(this).attr("ans");
    if (ans != "1" && $(this).hasClass("selected")) {
      $(this).addClass("wrong").removeClass("selected");
      getWrong = true;
    }
    if (ans == "1" && !$(this).hasClass("selected")) {
      $(this).addClass("wrong").removeClass("selected");
      getWrong = true;
    }
  });

  //puzzle
  var items = $(".contents > div.selected .puzzle").find(".items");
  items.each(function () {
    $(this).removeClass("selected");
    var kids = $(this).find(">span");
    kids.removeClass("wrong");
    var answerArr = $(this).attr("ans").split(",");
    if (kids.length == answerArr.length) {
      for (var i = 0; i < answerArr.length; i++) {
        console.log(answerArr[i], kids.eq(i).attr("iid"));
        console.log("--");
        if (answerArr[i] != kids.eq(i).attr("iid")) {
          kids.eq(i).addClass("wrong");
          getWrong = true;
        }
        //如果code那邊就錯了
        for (var k = 0; k < codeItems.length; k++) {
          if (kids.eq(i).attr("iid") == codeItems.eq(k).attr("iid")) {
            //如果code那邊就錯了 或是 圖案不同
            if (
              codeItems.eq(k).hasClass("wrong") ||
              codeItems.eq(k).find("img").attr("src") !=
                kids.eq(i).find("img").attr("src")
            ) {
              kids.eq(i).addClass("wrong");
              getWrong = true;
            }
          }
        }
      }
    } else {
      //數量不對
      getWrong = true;
      kids.addClass("wrong");
    }
  });

  //arrowSteps
  if ($(".contents > div.selected .arrowSteps").length > 0) {
    console.log("start here");
    var arrowSteps = $(".contents > div.selected .arrowSteps");
    var lines = $(".contents > div.selected .code .lines");
    var resetSeq = arrowSteps.find(">span").length;

    for (var k = 0; k < arrowSteps.find(">span").length; k++) {
      if (lines.find("> span[seq='" + k + "']").length > 0) {
        var lineAnsArr = lines
          .find("> span[seq='" + k + "']")
          .parent()
          .parent()
          .attr("ans")
          .split(",");
        console.log(lineAnsArr);
        if (lineAnsArr.indexOf(k.toString()) < 0) {
          getWrong = true;
          resetSeq = k;
          console.log(resetSeq);
          break;
        }
      } else {
        getWrong = true;
        console.log(resetSeq);
        break;
      }
    }

    arrowSteps.find(">span").each(function () {
      var seq = $(this).index();
      if (parseInt(seq) >= parseInt(resetSeq)) {
        $(this).removeClass("done");
      }
    });
    lines.find("> span").each(function () {
      var seq = $(this).attr("seq");
      if (parseInt(seq) >= parseInt(resetSeq)) {
        $(this).remove();
      } else if (parseInt(seq) == parseInt(resetSeq) - 1) {
        $(this)
          .parent()
          .parent()
          .addClass("selected")
          .siblings(".selected")
          .removeClass("selected");
      }
    });
    $(".contents > div.selected .puzzle .items")
      .find("> span")
      .each(function () {
        $(this).removeClass("wrong");
        var seq = $(this).attr("seq");
        if (parseInt(seq) >= parseInt(resetSeq)) {
          $(this).remove();
        }
      });
    //一開始就錯了
    if (resetSeq == 0) {
      lines.remove();
      $(".contents > div.selected .code > .items > span").removeClass(
        "selected"
      );
      $(".contents > div.selected .puzzle > .items > span").remove();
    }
  }

  //
  if (getWrong) {
    //
    rootSoundEffect($wrong);
    $(".contents > div.selected .puzzle").append(
      `<span class="resultIcon wow bounceIn"><img src="./DATA/IMAGES/common/icon_stupid.png"/></span>`
    );
    $(".resultIcon")
      .delay(1500)
      .queue(function () {
        $(this).dequeue().remove();
      });
  } else {
    rootSoundEffect($chimes);
    var uniq = new Date().getTime();
    $(".contents > div.selected .puzzle").append(
      `<span class="resultIcon wow bounceIn"><img src="./DATA/IMAGES/common/icon_right.png"/></span><span class="smoke"><img src="./DATA/IMAGES/common/chimes.gif?uniq=${uniq}"/></span>`
    );
    $(".smoke")
      .delay(1500)
      .queue(function () {
        $(".resultIcon").remove();
        $(this).dequeue().remove();
      });
  }
};

var showAnswer = function (boolean) {
  if (boolean) {
    rootSoundEffect($help);
    $(".contents > div.selected").find(".wrong").removeClass("wrong");
    //秀出答案圖片
    if ($(".contents > div.selected .puzzle").find(".ans").length > 0) {
      $(".contents > div.selected .puzzle").addClass("showAnswer");
    }
    //code
    if ($(".contents > div.selected .puzzle").find(".items").length > 0) {
      var items = $(".contents > div.selected .puzzle").find(".items");
      items.removeClass("selected");
      var codeItems = $(".contents > div.selected .code").find(".items > span");
      //hash按鈕
      codeItems.each(function () {
        var iid = $(this).attr("iid");
        var newSeq = -1;
        switch (iid) {
          case "h4":
            newSeq = 4;
            break;
          case "h5":
            newSeq = 5;
            break;
          case "h6":
            newSeq = 6;
            break;
          case "h7":
            newSeq = 7;
            break;
          case "h8":
            newSeq = 8;
            break;
          case "h9":
            newSeq = 9;
            break;
          default:
        }
        if (newSeq > 0) {
          $(this)
            .attr("seq", newSeq)
            .removeClass("wrong")
            .empty()
            .append(
              `
          <img
            width="20"
            height="auto"
            src="./DATA/PT/BOOK${bid}/IMAGES/hash_${$(this).attr("seq")}.png"
        />`
            )
            .addClass("done");
        }
      });
      //解答
      items.each(function () {
        $(this).empty();
        var answerArr = $(this).attr("ans").split(",");
        for (var i = 0; i < answerArr.length; i++) {
          for (var k = 0; k < codeItems.length; k++) {
            if (codeItems.eq(k).attr("iid") == answerArr[i]) {
              $(this).append(codeItems.eq(k).clone());
              break;
            }
          }
        }
      });
    }
    //check
    if ($(".contents > div.selected .check").length > 0) {
      var checkItems = $(".contents > div.selected .check").find(
        ".items > span"
      );
      checkItems.each(function () {
        $(this).removeClass("selected");
        if ($(this).attr("ans") == "1") {
          $(this).addClass("selected");
        }
      });
    }
    if ($(".contents > div.selected .arrowSteps").length > 0) {
      //check btn hide
      $(".sideTool > div.btn_check").hide();
    }
  } else {
    if ($(".contents > div.selected .puzzle").find(".ans").length > 0) {
      $(".contents > div.selected .puzzle").removeClass("showAnswer");
    }
    //code
    if ($(".contents > div.selected .puzzle").find(".items").length > 0) {
      var items = $(".contents > div.selected .puzzle").find(".items");
      items.empty().removeClass("selected");
      var codeItems = $(".contents > div.selected .code").find(".items > span");

      codeItems.each(function () {
        if (
          $(this).attr("iid") == "h4" ||
          $(this).attr("iid") == "h5" ||
          $(this).attr("iid") == "h6" ||
          $(this).attr("iid") == "h7" ||
          $(this).attr("iid") == "h8" ||
          $(this).attr("iid") == "h9"
        ) {
          $(this).empty().removeClass("done");
        }
      });
    }
    //check
    if ($(".contents > div.selected .check").length > 0) {
      var checkItems = $(".contents > div.selected .check").find(
        ".items > span"
      );
      checkItems.each(function () {
        $(this).removeClass("selected");
      });
    }
  }
};

var addIndicator = function (tar, indicator) {
  if (tar.find(".indicator").length == 0) {
    tar.append(
      $(".contents > div.selected")
        .find(indicator)
        .clone()
        .wrap("<h5/>")
        .parent()
        .html()
    );
  }
  //
  updateIndicator(tar);
};
var updateIndicator = function (tar) {
  var indicator = tar.find(".indicator");
  var filled = tar.find("> span");
  indicator.find("> span").each(function (index) {
    $(this).removeClass();
    if (index < filled.length) {
      $(this).addClass("done");
    } else if (index == filled.length) {
      $(this).addClass("next");
    }
  });
};

var trigMeAll = function (tar) {
  var frame = $(".contents > div.selected").find(".puzzle .items");
  //
  if (tar.parent().parent().hasClass("code")) {
    if (frame.length > 0) {
      var gotAnswer = false;
      frame.each(function () {
        var answerArr = $(this).attr("ans").split(",");
        if ($(this).attr("ans") == tar.attr("iid")) {
          gotAnswer = true;
          $(this).html(tar.clone());
          $(".sideTool > div.btn_replay").show();
        }
      });

      if (gotAnswer) {
        rootSoundEffect($pop);
      } else {
        rootSoundEffect($wrong);
      }
    }
  }
  //
  $(".sideTool > div.btn_answer").removeClass("active");
};

var trigMeSequence = function (tar) {
  var currArrowStepDone = $(".contents > div.selected").find(
    ".puzzle .arrowSteps > span.done"
  );
  var currArrowStep = $(".contents > div.selected")
    .find(".puzzle .arrowSteps > span")
    .eq(currArrowStepDone.length);
  var currItem = $(".contents > div.selected").find(
    ".code .items >span.selected"
  );
  if (currItem.length == 0) {
    //第一次
    currItem = $(".contents > div.selected").find(".code .items >span.start");
    //
    $(".contents > div.selected .puzzle > .items > span").remove();
  }

  //確認是否在目前的item周邊
  if (
    Math.abs(currItem.index() - tar.index()) == 1 ||
    Math.abs(currItem.index() - tar.index()) == 6
  ) {
    if (currItem.index() % 6 == 0 && currItem.index() - tar.index() == 1) {
      //wrong
      rootSoundEffect($wrong);
    } else if (
      currItem.index() % 6 == 5 &&
      currItem.index() - tar.index() == -1
    ) {
      //wrong
      rootSoundEffect($wrong);
    } else {
      //correct
      $(".sideTool > div.btn_check").show();

      //確認是否到最後
      if (
        $(".contents > div.selected").find(
          ".puzzle .arrowSteps > span:not(.done)"
        ).length > 0
      ) {
        //如果是第一個
        if (currItem.hasClass("start")) {
          $(".contents > div.selected .puzzle")
            .find("> .items")
            .eq(0)
            .append(currItem.clone());
          currItem.append(
            `<div class="lines"><span class="line1"></span></div>`
          );
        }
        //上字
        $(".contents > div.selected .puzzle")
          .find("> .items")
          .eq(parseInt(currArrowStep.attr("itemIndex")))
          .append(tar.clone().attr("seq", currArrowStep.index()));
        rootSoundEffect($pop);
        //

        if (tar.find(".lines").length == 0) {
          tar.append(`<div class="lines"></div>`);
        }
        tar
          .find(".lines")
          .append(
            `<span seq="${currArrowStep.index()}" class="${currArrowStep.attr(
              "class"
            )}"></span>`
          );
        tar.addClass("selected").siblings(".selected").removeClass("selected");
        //擺最後
        currArrowStep.addClass("done");
        $(".sideTool > div.btn_replay").show();
      } else {
        rootSoundEffect($wrong);
      }
      //
    }
  } else {
    rootSoundEffect($wrong);
  }

  //
  $(".sideTool > div.btn_answer").removeClass("active");
};
//
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
  elem.find(".done").removeClass("done");
  elem.find(".selected").removeClass("selected");
  elem.find(".wrong").removeClass("wrong");
  //
  if (elem.find(".ans").length > 0) {
    $(".sideTool > div.btn_answer").removeClass("active").show();
  }
  if (elem.find(".puzzle .items").length > 0) {
    $(".sideTool > div.btn_answer").removeClass("active").show();
    $(".sideTool > div.btn_check").removeClass("active").show();
  }
  if (elem.find(".check").length > 0) {
    $(".sideTool > div.btn_answer").removeClass("active").show();
    $(".sideTool > div.btn_check").removeClass("active").show();
  }
  //reset sub
  elem.find(".puzzle .items").removeClass("selected").empty();
  elem
    .find(".puzzle .items")
    .unbind()
    .bind("click", function () {
      if ($(this).find("div.reset").length < 1) {
        $(this).append(`<div class="reset"></div>`);
        $(this)
          .find("div.reset")
          .click(function (e) {
            //e.stopPropagation();
            rootSoundEffect($show);
            $(this).parent().empty();
          });
      }

      $(this)
        .toggleClass("selected")
        .siblings(".selected")
        .removeClass("selected");
    });

  //reset lines in codes
  elem.find(".code .items > span").find(".lines").remove();

  $(".smoke").remove();
  $(".resultIcon").remove();
};

var resetTool = function () {
  $(".sideTool > div").removeClass("active").hide();
};
