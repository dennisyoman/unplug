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

var pieceMove = function () {
  var isEnd = false;
  var piece = $(".contents > div.selected .sensorArea > .piece").eq(0);
  var arrows = $(".contents > div.selected .arrows");
  var sensors = $(".contents > div.selected .sensorArea");
  var currGrid = sensors.find(">div > span.curr");
  var nextGrid;
  var currArrow = arrows.find("> span.curr");
  var nextArrow = arrows.find("> span").eq(0);

  if (currArrow.length > 0) {
    if (currArrow.next().length > 0) {
      nextArrow = currArrow.next();
    } else {
      //end
      isEnd = true;
    }
  }

  if (isEnd) {
    //check complete?
    if (
      $(".contents > div.selected .sensorArea >div >span:not(.done)").length ==
      0
    ) {
      //correct
      bingo($(".contents > div.selected .subject"), true);
    } else {
      //wrong
      bingo($(".contents > div.selected .subject"), false);
    }
  } else {
    if (nextArrow.hasClass("selected")) {
      currArrow.removeClass("curr");
      nextArrow.addClass("curr");
      //rootSoundEffect($pop);
      //skip
      movingTimer = setTimeout(pieceMove, 1);
    } else {
      //move
      var dirClass;
      if (nextArrow.hasClass("u")) {
        rowID -= 1;
        dirClass = "u";
      } else if (nextArrow.hasClass("d")) {
        rowID += 1;
        dirClass = "d";
      } else if (nextArrow.hasClass("l")) {
        colID -= 1;
        dirClass = "l";
      } else if (nextArrow.hasClass("r")) {
        colID += 1;
        dirClass = "r";
      }

      nextGrid = sensors.find("> div").eq(rowID).find(">span").eq(colID);
      if (rowID >= 0 && rowID <= 3 && colID >= 0 && colID <= 4) {
        var pX =
          parseInt(nextGrid.css("left")) +
          parseInt(nextGrid.css("width")) / 2 / stageRatioReal;
        var pY =
          parseInt(nextGrid.css("top")) +
          parseInt(nextGrid.css("height")) / 2 / stageRatioReal;
        piece.css("left", pX + "px").css("top", pY + "px");

        //
        currGrid.removeClass("curr");
        nextGrid
          .addClass("curr")
          .addClass("done")
          .append(`<span class="${dirClass}"></span>`);
        currArrow.removeClass("curr");
        nextArrow.addClass("curr").addClass("done");
        rootSoundEffect($show);
      } else {
        currGrid.removeClass("curr");
        nextGrid.addClass("curr");
        currArrow.removeClass("curr");
        nextArrow.addClass("curr").addClass("done");
        rootSoundEffect($wrong);
      }

      //
      movingTimer = setTimeout(pieceMove, 700);
    }
  }
};

var flowerMove = function () {
  var isEnd = false;
  var colors = $(".contents > div.selected .flowers");
  var flowers = $(".contents > div.selected .flowerArea");
  var fid = -1;
  if (flowers.find(">span.done").length > 0) {
    fid = flowers.find(">span.done").length - 1;
  }
  fid += 1;
  if (fid >= flowers.find(">span").length) {
    isEnd = true;
  }

  if (isEnd) {
    //check complete?
    if ($(".contents > div.selected .flowerArea >span.selected").length == 0) {
      //correct
      bingo($(".contents > div.selected .subject"), true);
    } else {
      //wrong
      bingo($(".contents > div.selected .subject"), false);
    }
  } else {
    var currFlower = flowers.find("> span").eq(fid);
    var currColor = colors
      .find("> span")
      .eq(fid % colors.find("> span").length);
    if (currFlower.hasClass(currColor.attr("ans"))) {
      //走到正確的花
      if (currFlower.hasClass("selected")) {
        rootSoundEffect($wrong);
      } else {
        rootSoundEffect($show);
      }
    } else {
      //走到錯誤的花
      if (currFlower.hasClass("selected")) {
        rootSoundEffect($good);
        currFlower.removeClass().addClass(currColor.attr("ans"));
      } else {
        currFlower.addClass("selected");
        rootSoundEffect($wrong);
      }
    }

    flowers
      .find("> span")
      .eq(fid)
      .addClass("active")
      .addClass("done")
      .siblings(".active")
      .removeClass("active");

    colors
      .find("> span")
      .eq(fid % colors.find("> span").length)
      .addClass("active")
      .siblings(".active")
      .removeClass("active");

    //
    movingTimer = setTimeout(flowerMove, 700);
  }
};

var checkAnswer = function () {
  $(".sideTool > .btn_check").hide();
  //找出錯誤
  if ($(".contents > div.selected .sensorArea").length > 0) {
    $(".sideTool > .btn_answer").hide();
    //disable arrow click event
    $(".contents > div.selected .arrows").addClass("done");
    //piece moving
    pieceMove();
  }
  //找出標註錯誤的訊息
  if ($(".contents > div.selected .TFArea").length > 0) {
    if ($(".contents > div.selected .TFArea > span.selected").hasClass("ans")) {
      //correct
      bingo($(".contents > div.selected .subject"), true);
    } else {
      //wrong
      bingo($(".contents > div.selected .subject"), false);
    }
  }
  //找出錯誤 花兒
  if ($(".contents > div.selected .flowers").length > 0) {
    $(".alert").remove();
    //第一步驟：底下花的排序是否正確
    var hinter = "排序規律不正確喔～";
    $(".contents > div.selected .flowers > span").each(function () {
      if ($(this).attr("class") == "" || $(this).attr("class") == "wrong") {
        hinter = "先完成此處花朵的排序規律";
      }
      if (!$(this).hasClass($(this).attr("ans"))) {
        $(this).addClass("wrong");
      }
    });
    if ($(".contents > div.selected .flowers > span.wrong").length > 0) {
      //第一步驟就錯了
      bingo($(".contents > div.selected .answer"), false);
      $(".contents > div.selected").append(
        `<div class="alert wow bounceInLeft" onClick="$(this).remove()">
          <p>${hinter}</p>
        </div>`
      );
    } else {
      //第二步驟：開始跑上面的花

      //disable arrow click event
      $(".contents > div.selected .flowers").addClass("done");
      //flower moving
      flowerMove();
    }
  }
};

var bingo = function (tar, boolean) {
  if (boolean) {
    //正確
    rootSoundEffect($chimes);
    var uniq = new Date().getTime();
    tar.append(
      `<span class="resultIcon wow bounceIn"><img src="./DATA/IMAGES/common/icon_right.png"/></span><span class="smoke"><img src="./DATA/IMAGES/common/chimes.gif?uniq=${uniq}"/></span>`
    );
    $(".smoke")
      .delay(1500)
      .queue(function () {
        $(".resultIcon").remove();
        $(this).dequeue().remove();
      });
  } else {
    //錯誤
    rootSoundEffect($tryagain);
    tar.append(
      `<span class="resultIcon wow bounceIn"><img src="./DATA/IMAGES/common/icon_wrong.png"/></span>`
    );
    $(".resultIcon")
      .delay(1500)
      .queue(function () {
        $(this).dequeue().remove();
      });
  }
};

var showAnswer = function (boolean) {
  if (boolean) {
    rootSoundEffect($help);
    $(".sideTool > .btn_replay").show();
    $(".sideTool > .btn_check").show();

    //找出錯誤
    if ($(".contents > div.selected .sensorArea").length > 0) {
      $(".contents > div.selected .arrows >span.ans")
        .addClass("selected")
        .siblings(".selected")
        .removeClass("selected");
    }
    //找出標註錯誤的訊息
    if ($(".contents > div.selected .TFArea").length > 0) {
      $(".contents > div.selected .TFArea >span.ans")
        .addClass("selected")
        .siblings(".selected")
        .removeClass("selected");
    }
    //找出錯誤 花系列
    if ($(".contents > div.selected .flowers").length > 0) {
      $(".contents > div.selected .flowers >span").each(function () {
        $(this).removeClass().addClass($(this).attr("ans"));
      });
      $(".contents > div.selected .flowerArea >span").each(function () {
        if ($(this).attr("ans")) {
          $(this).addClass("selected");
        } else {
          $(this).removeClass("selected");
        }
      });
    }
  } else {
    resetElem($(".contents > div.selected"));
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

var rowID = 0;
var colID = 0;
var movingTimer;
var resetElem = function (elem) {
  clearTimeout(movingTimer);
  //
  elem.find(".selected").removeClass("selected");
  elem.find(".curr").removeClass("curr");
  elem.find(".done").removeClass("done");
  elem.find(".active").removeClass("active");
  elem.find(".sensorArea > div > span").empty();

  //piece
  var piece = elem.find(".piece").eq(0);
  var startSensor = elem.find(".sensorArea >div >span.start").eq(0);
  startSensor.addClass("curr done");
  rowID = startSensor.parent().index();
  colID = startSensor.index();
  var pX =
    parseInt(startSensor.css("left")) +
    parseInt(startSensor.css("width")) / 2 / stageRatioReal;
  var pY =
    parseInt(startSensor.css("top")) +
    parseInt(startSensor.css("height")) / 2 / stageRatioReal;
  piece.css("left", pX + "px").css("top", pY + "px");

  //arrows
  elem
    .find(".arrows > span")
    .unbind()
    .bind("click", function () {
      $(this)
        .addClass("selected")
        .siblings(".selected")
        .removeClass("selected");
      rootSoundEffect($key);
      $(".sideTool > .btn_replay").show();
      $(".sideTool > .btn_check").show();
      $(".sideTool > .btn_answer").removeClass("active");
    });

  //TF
  elem
    .find(".TFArea > span")
    .unbind()
    .bind("click", function () {
      $(this)
        .addClass("selected")
        .siblings(".selected")
        .removeClass("selected");
      rootSoundEffect($key);
      $(".sideTool > .btn_replay").show();
      $(".sideTool > .btn_check").show();
      $(".sideTool > .btn_answer").removeClass("active");
    });

  //flowersArea
  elem.find(".flowerArea > span").each(function () {
    $(this).removeClass().addClass($(this).attr("int"));
    $(this)
      .unbind()
      .bind("click", function () {
        $(this).toggleClass("selected");
        rootSoundEffect($key);
        $(".sideTool > .btn_replay").show();
        $(".sideTool > .btn_check").show();
        $(".sideTool > .btn_answer").removeClass("active");
      });
  });

  //flower
  elem.find(".flowers > span").each(function () {
    $(this)
      .removeClass()
      .unbind()
      .bind("click", function () {
        var seqID = -1;
        var seqArr = $(this).parent().attr("seq").split(",");
        for (var i = 0; i < seqArr.length; i++) {
          if ($(this).hasClass(seqArr[i])) {
            seqID = i;
          }
        }
        if (seqID < 0) {
          seqID = 0;
        } else {
          seqID += 1;
          if (seqID > seqArr.length - 1) {
            seqID = 0;
          }
        }
        $(this).removeClass().addClass(seqArr[seqID]);
        rootSoundEffect($key);
        //
        $(".sideTool > .btn_replay").show();
        $(".sideTool > .btn_check").show();
        $(".sideTool > .btn_answer").removeClass("active");
      });
    if ($(this).attr("int")) {
      $(this).addClass($(this).attr("int"));
    }
  });

  //common
  $(".smoke").remove();
  $(".resultIcon").remove();
  $(".alert").remove();
  //
  $(".sideTool > .btn_check").hide();
  $(".sideTool > .btn_answer").show().removeClass("active");
};

var resetTool = function () {
  $(".sideTool > div").removeClass("active").hide();
};
