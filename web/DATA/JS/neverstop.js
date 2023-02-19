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
          showAnswer();
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

var lowlaged = false;
var speed = 600;

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

var showAnswer = function () {
  rootSoundEffect($pop);
  $(".contents > div.selected .cards > span").each(function () {
    $(this).removeClass().addClass($(this).attr("ans"));
  });
  //按鈕全開
  $(".sideTool > div").removeClass("active").show();
};

var checkAnswer = function () {
  resetTool();
  //
  $(".contents > div.selected .cards").addClass("selected");
  $(".contents > div.selected .cards > span").eq(0).addClass("selected");
  isNextMove();
};

var isNextMove = function () {
  var currGird = $(".contents > div.selected .gridArea .grids >span.selected");
  var nextGrid = null;
  var currCard = $(".contents > div.selected .cards > span.selected");
  var direction = currCard.attr("class");

  if (direction.indexOf("up") != -1) {
    direction = "up";
    if (currGird.parent().prev().length > 0) {
      nextGrid = currGird.parent().prev().find(">span").eq(currGird.index());
    }
  } else if (direction.indexOf("right") != -1) {
    direction = "right";
    if (currGird.next().length > 0) {
      nextGrid = currGird.next();
    }
  } else if (direction.indexOf("down") != -1) {
    direction = "down";
    if (currGird.parent().next().length > 0) {
      nextGrid = currGird.parent().next().find(">span").eq(currGird.index());
    }
  } else if (direction.indexOf("left") != -1) {
    direction = "left";
    if (currGird.prev().length > 0) {
      nextGrid = currGird.prev();
    }
  }

  if (nextGrid != null && nextGrid.hasClass("deadend")) {
    //是否是牆
    nextGrid = null;
  }

  if (nextGrid == null) {
    if (currCard.next().length > 0) {
      currCard.removeClass("selected").next().addClass("selected");
      console.log("下一張卡");
      isNextMove();
    } else {
      console.log("GG");

      $(".contents > div.selected .ladybug")
        .delay(50)
        .queue(function () {
          $(this)
            .dequeue()
            .append(
              `<div class="resultIcon wow bounceIn"><img src="./DATA/IMAGES/common/icon_wrong.png"/></div>`
            )
            .delay(1200)
            .queue(function () {
              $(".resultIcon").remove();
              $(this).dequeue();
              $(".sideTool > div.btn_replay").show();
            });
          rootSoundEffect($wrong);
        });
    }
  } else {
    nextGrid.click();
  }
};

var resetElem = function (elem) {
  resetTool();
  elem.find(".selected").removeClass("selected");

  //reset ladybug
  if (elem.find(".ladybug").length > 0) {
    elem.find(".ladybug").each(function () {
      $(this).removeClass().addClass("ladybug");
    });
  }
  //reset sensorArea
  if (elem.find(".gridArea").length > 0) {
    elem.find(".gridArea .grids >span").each(function () {
      $(this)
        .unbind()
        .bind("click", function () {
          //停止中

          var piece = elem.find(".ladybug");
          piece.css("transtion", speed / 1000 + "s");

          ////決定方向
          var newCord = [$(this).parent().index(), $(this).index()];
          var originCord = [
            elem.find(".gridArea .grids >span.selected").parent().index(),
            elem.find(".gridArea .grids >span.selected").index(),
          ];
          piece.removeClass().addClass("ladybug");

          if (newCord[0] > originCord[0]) {
            //往下
            piece.addClass("down");
          } else if (newCord[0] < originCord[0]) {
            //往上
            piece.addClass("up");
          } else {
            if (newCord[1] > originCord[1]) {
              //往左
              piece.addClass("right");
            } else if (newCord[1] < originCord[1]) {
              //往右
              piece.addClass("left");
            }
          }

          ////更新地點
          elem.find(".gridArea .grids >span").removeClass("selected");
          $(this).addClass("selected");
          //

          var pX = parseInt($(this).parent().css("left"));
          var pY = parseInt($(this).parent().css("top"));
          var oX =
            (parseInt($(this).offset().left) -
              parseInt($(this).parent().offset().left)) /
            stageRatioReal;
          var oY =
            (parseInt($(this).offset().top) -
              parseInt($(this).parent().offset().top)) /
            stageRatioReal;
          var ww = parseInt($(this).css("width")) / stageRatioReal;
          var hh = parseInt($(this).css("height")) / stageRatioReal;

          piece.css("left", pX + oX + ww / 2).css("top", pY + oY + hh / 2);
          rootSoundEffect($show);
          $(this)
            .delay(speed + 100)
            .queue(function () {
              $(this).dequeue();
              //
              if ($(this).hasClass("end")) {
                piece.delay(500).queue(function () {
                  $(this).addClass("end").dequeue();
                });
                //
                var uniq = new Date().getTime();
                $(".contents > div.selected .ladybug")
                  .append(
                    `<div class="resultIcon"><img src="./DATA/IMAGES/common/chimes2.gif?uniq=${uniq}"/></div>`
                  )
                  .delay(1500)
                  .queue(function () {
                    $(this).dequeue();
                    $(".smoke").remove();
                    $(".resultIcon").remove();
                    $(".sideTool > div.btn_replay").show();
                  });
                rootSoundEffect($chimes);
              } else {
                //是否有下一個move
                isNextMove();
              }
            });
        });
      //init start
      if ($(this).hasClass("start")) {
        $(this).click();
        var piece = elem.find(".ladybug");
        piece.removeClass().addClass("ladybug");
      }
    });
  }

  //reset cards
  if (elem.find(".cards").length > 0) {
    elem.find(".cards > span").each(function () {
      $(this)
        .removeClass()
        .unbind()
        .bind("click", function () {
          rootSoundEffect($key);
          if ($(this).hasClass("up")) {
            $(this).removeClass().addClass("right");
          } else if ($(this).hasClass("right")) {
            $(this).removeClass().addClass("down");
          } else if ($(this).hasClass("down")) {
            $(this).removeClass().addClass("left");
          } else if ($(this).hasClass("left")) {
            $(this).removeClass().addClass("up");
          } else {
            $(this).addClass().addClass("up");
          }

          $(".sideTool > div.btn_replay").show();
          //check finish
          var complete = true;
          elem.find(".cards > span").each(function () {
            if ($(this).attr("ans")) {
              if (
                !$(this).hasClass("up") &&
                !$(this).hasClass("right") &&
                !$(this).hasClass("left") &&
                !$(this).hasClass("down")
              ) {
                complete = false;
              }
            }
          });
          if (complete) {
            $(".sideTool > div.btn_check").show();
          }
        });
    });
  }

  $(".smoke").remove();
  $(".resultIcon").remove();
  //
  $(".sideTool > div.btn_answer").removeClass("active").show();
};

var resetTool = function () {
  $(".sideTool > div").removeClass("active").hide();
};
