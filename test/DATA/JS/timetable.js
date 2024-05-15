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

      $(".sideTool > div.btn_replay")
        .unbind()
        .bind("click", function () {
          resetElem($(".contents > div.selected"));
          rootSoundEffect($show);
          $(this).hide();
          $(".sideTool > div.btn_check").hide();
          $(".sideTool > div.btn_answer").removeClass("active");
        });
      $(".sideTool > div.btn_answer")
        .unbind()
        .bind("click", function () {
          $(this).toggleClass("active");
          if ($(this).hasClass("active")) {
            showAnswer(true);
            $(this).addClass("active");
            $(".sideTool > div.btn_replay").show();
            //$(".sideTool > div.btn_check").show();
          } else {
            $(".sideTool > div.btn_replay").click();
          }
        });
      $(".sideTool > div.btn_check")
        .unbind()
        .bind("click", function () {
          checkAnswer();
        });

      //build grid

      if ($(".grids").attr("bw")) {
        bw = parseInt($(".grids").attr("bw"));
      }
      if ($(".grids").attr("bh")) {
        bh = parseInt($(".grids").attr("bh"));
      }
      $(".grids > .row").each(function () {
        var size = $(this).attr("size");
        var dp = $(this).attr("dp");
        for (var i = 0; i < size; i++) {
          if (dp) {
            dp.split(",");
            if (dp.indexOf(i.toString()) >= 0) {
              $(this).append(
                `<span class="disablePermanent" style="width:${bw}px;height:${bh}px;"/>`
              );
            } else {
              $(this).append(`<span style="width:${bw}px;height:${bh}px;"/>`);
            }
          } else {
            $(this).append(`<span style="width:${bw}px;height:${bh}px;"/>`);
          }
        }
      });
      //resize blocks
      $(".blocks > div").each(function () {
        var size = $(this).attr("size").split(",");

        $(this)
          .find("img")
          .attr(
            "style",
            "width:" +
              parseInt(size[0]) * bw +
              "px;height:" +
              parseInt(size[1]) * bh +
              "px"
          );
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
//
var bw = 20;
var bh = 20.5;
var buffer = 0;
var blockCount = 0;

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
  if (!isDragging && $elem != null && $("#cardAvatar").length < 1) {
    isDragging = true;
    if ($($elem).hasClass("draggable")) {
      $("#contents").append(`<div id="cardAvatar" class="cardAvatar"></div>`);
      $($elem).find(">img").clone().appendTo("#cardAvatar");
      $("#cardAvatar").attr("size", $($elem).attr("size"));
      if ($($elem).attr("slug")) {
        $("#cardAvatar").attr("slug", $($elem).attr("slug"));
      }
      //移動已放上的方塊
      if ($($elem).hasClass("onboard")) {
        //clean linked blocks and remove this
        var link = $($elem).attr("link");
        var gridElem = $(
          ".contents > div.selected .grids > .row > span.disable"
        );
        gridElem.each(function () {
          if (link == $(this).attr("link")) {
            $(this).removeAttr("link").removeClass("disable selected");
          }
        });
        $("#cardAvatar").attr("link", link);
        $($elem).remove();
      } else {
        $($elem).addClass("disable");
      }
    }
  }

  if (isDragging && $elem) {
    //drag clon card
    if ($($elem).hasClass("draggable")) {
      var deltaContainerX = $("#module_wrapper").offset().left;
      var deltaContainerY = $("#module_wrapper").offset().top;
      $("#cardAvatar").get(0).style.top =
        Math.round(
          ev.center.y / stageRatioReal -
            deltaContainerY / stageRatioReal -
            $("#cardAvatar").height() / stageRatioReal / 2
        ) + "px";
      $("#cardAvatar").get(0).style.left =
        Math.round(
          ev.center.x / stageRatioReal -
            deltaContainerX / stageRatioReal -
            $("#cardAvatar").width() / stageRatioReal / 2
        ) + "px";
      checkCollision(ev);
    }
  }

  if (ev.isFinal) {
    if ($($elem).hasClass("draggable")) {
      var gridElem = $(".contents > div.selected .grids");
      var rowElem = gridElem.find(">.row");
      var gridSelected = rowElem.find("> span.selected");

      //checkCollision true
      var tempSize = $("#cardAvatar").attr("size").split(",");
      tempSize = tempSize[0] * tempSize[1];

      if (
        gridSelected.length == tempSize &&
        $(".contents > div.selected .grids > .row > span.selected.disable")
          .length < 1 &&
        $(
          ".contents > div.selected .grids > .row > span.selected.disablePermanent"
        ).length < 1
      ) {
        checkOrderStatus($($elem));
      } else {
        if (gridSelected.length > 0) {
          //有觸發感應表示放錯
          rootSoundEffect($surprise);
        } else {
          //撤回
          rootSoundEffect($show);
          $(".sideTool > div.btn_check").hide();
        }

        //fail place block
        gridSelected.removeClass("selected");

        var uniq = new Date().getTime();
        $("#cardAvatar").find("img").css("opacity", 0);
        $("#cardAvatar").append(
          `<span class="smoke"><img src="./DATA/IMAGES/common/smoke.gif?uniq=${uniq}"/></span>`
        );
        $("#cardAvatar")
          .delay(800)
          .queue(function () {
            $(this).remove().dequeue();
          });

        $($elem).removeClass("disable");
        //
        console.log($("#cardAvatar").attr("link"));
        $(".contents > div.selected .blocks")
          .find(">div[link='" + $("#cardAvatar").attr("link") + "']")
          .removeAttr("link")
          .removeClass("disable");
      }
      $(".sideTool > div.btn_answer").removeClass("active");
      $(".contents > div.selected .grids").removeClass("showanswer");
    }
    //then
    isDragging = false;
    $elem = null;
  }
};

var checkCollision = function (ev) {
  var size = $($elem).attr("size").split(",");
  var lastW = parseInt(size[0]) * bw * stageRatioReal;
  var lastH = parseInt(size[1]) * bh * stageRatioReal;
  var lastX = ev.center.x - lastW / 2;
  var lastY = ev.center.y - lastH / 2;

  var gridElem = $(".contents > div.selected .grids > .row > span");
  gridElem.each(function () {
    var oriX = $(this).offset().left;
    var oriW = $(this).width();
    var oriY = $(this).offset().top;
    var oriH = $(this).height();

    if (
      lastX < oriX + oriW / 2 - buffer &&
      lastX > oriX - lastW + oriW / 2 + buffer &&
      lastY > oriY - lastH + oriH / 2 + buffer &&
      lastY < oriY + oriH / 2 - buffer
    ) {
      $(this).addClass("selected");
    } else {
      $(this).removeClass("selected");
    }
  });
};

var checkOrderStatus = function (tar) {
  //place the block
  blockCount += 1;
  var blockElem = $(".contents > div.selected .blocks");
  var gridElem = $(".contents > div.selected .grids");
  var rowElem = gridElem.find(">.row");
  var gridSpan = rowElem.find("> span.selected");
  var rowElemZone = gridSpan.parent().attr("zone");
  var intx = 9999999;
  var inty = 9999999;
  //gridElem.find("p").css("opacity", 0);
  $(".alert").remove();
  gridSpan.each(function () {
    intx = Math.min(
      intx,
      $(this).offset().left - $("#module_wrapper").offset().left
    );
    inty = Math.min(
      inty,
      $(this).offset().top - $("#module_wrapper").offset().top
    );

    //
    $(this)
      .removeClass("selected")
      .addClass("disable")
      .attr("link", blockCount);
    //
    tar.attr("link", blockCount);
    $(".contents > div.selected .blocks")
      .find(">div[link='" + $("#cardAvatar").attr("link") + "']")
      .attr("link", blockCount);
  });
  $("#cardAvatar").get(0).style.top = inty / stageRatioReal + "px";
  $("#cardAvatar").get(0).style.left = intx / stageRatioReal + "px";

  $("#cardAvatar")
    .attr("link", blockCount)
    .attr("zone", rowElemZone)
    .removeAttr("id")
    .addClass("draggable onboard");

  //
  rootSoundEffect($pop);
  $(".sideTool > div.btn_replay").show();
  //確定是否完成
  if (blockElem.find(">div").length == blockElem.find(">div.disable").length) {
    $(".sideTool > div.btn_check").show();
  }
};

var showAnswer = function (boolean) {
  if (boolean) {
    $(".sideTool > div.btn_replay").click();
    $(".contents > div.selected .grids").addClass("showanswer");

    rootSoundEffect($help);
  } else {
    //$(".sideTool > div.btn_replay").click();
  }
};

var checkAnswer = function () {
  var gridElem = $(".contents > div.selected .grids");
  var zoneArr = gridElem.attr("zones").split(",");
  var cardsArray = new Array();
  var allCorrect = true;

  for (var z = 0; z < zoneArr.length; z++) {
    var rowElem = gridElem.find(">.row[zone='" + zoneArr[z] + "']");
    var zoneCorrect = false;
    if (!rowElem.eq(0).attr("ansID")) {
      var ansArr = rowElem.eq(0).attr("ans").split("^");
    } else {
      var ansArr = $.trim(
        $(".contents > div.selected").find(rowElem.eq(0).attr("ansID")).text()
      ).split("^");
    }

    var bestMatchAmount = 0;
    var nearestID = 0;
    for (var a = 0; a < ansArr.length; a++) {
      var tempAns = ansArr[a].split(",");
      var cards = $("#module_wrapper").find(
        ".cardAvatar.onboard[zone='" + rowElem.attr("zone") + "']"
      );
      cardsArray = new Array();
      cards.each(function () {
        var link = $(this).attr("link");
        var position =
          rowElem
            .find(">span[link='" + link + "']")
            .eq(0)
            .index() + 1;
        cardsArray.push($(this).attr("slug") + "=" + position);
      });

      var matchAmount = 0;
      for (var k = 0; k < cardsArray.length; k++) {
        if (tempAns.indexOf(cardsArray[k]) >= 0) {
          matchAmount += 1;
        }
      }
      if (matchAmount > bestMatchAmount) {
        bestMatchAmount = matchAmount;
        nearestID = a;
      }

      if (tempAns.sort().join(",") == cardsArray.sort().join(",")) {
        //跳出迴圈
        zoneCorrect = true;
        break;
      }
    }
    if (zoneCorrect) {
      //答案正確,沒事。前往下一個zone群
    } else {
      allCorrect = false;
      //錯誤,以最接近的答案為主要整理方向
      var tempAns = ansArr[nearestID].split(",");

      //踢掉錯誤的
      for (var k = 0; k < cardsArray.length; k++) {
        var killCardArr = cardsArray[k].split("=");
        var slugKill = killCardArr[0];
        var positionKill = parseInt(killCardArr[1]);
        if (tempAns.indexOf(cardsArray[k]) < 0) {
          //找到錯誤cardsArray[k]
          $("#module_wrapper")
            .find(
              ".cardAvatar.onboard[slug='" +
                slugKill +
                "'][zone='" +
                rowElem.attr("zone") +
                "']"
            )
            .each(function () {
              if (!$(this).attr("bingo")) {
                var position =
                  rowElem
                    .find(">span[link='" + $(this).attr("link") + "']")
                    .eq(0)
                    .index() + 1;
                if (positionKill == position) {
                  /*
                  //restore block

                  $(".contents > div.selected .blocks")
                    .find(">div[link='" + $(this).attr("link") + "']")
                    .removeAttr("link")
                    .removeClass("disable");
                  rowElem
                    .find(">span[link='" + $(this).attr("link") + "']")
                    .removeAttr("link")
                    .removeClass("disable");
                  //kill card
                  $(this).remove();*/
                  $(this).addClass("error");
                }
              }
            });
        } else {
          $("#module_wrapper")
            .find(
              ".cardAvatar.onboard[slug='" +
                slugKill +
                "'][zone='" +
                rowElem.attr("zone") +
                "']"
            )
            .each(function () {
              var position =
                rowElem
                  .find(">span[link='" + $(this).attr("link") + "']")
                  .eq(0)
                  .index() + 1;
              if (positionKill == position) {
                //一次只對一個就停止
                $(this).attr("bingo", "true");
                return false;
              }
            });
          //重整tempAns
          var matchId = tempAns.indexOf(cardsArray[k]);
          tempAns.splice(matchId, 1);
        }
      }
    }
  }
  //結論
  if (allCorrect) {
    //全部正確
    var uniq = new Date().getTime();
    rootSoundEffect($chimes);
    gridElem.append(
      `<span class="resultIcon wow bounceIn"><img src="./DATA/IMAGES/common/icon_right.png"/></span><span class="smoke"><img src="./DATA/IMAGES/common/chimes.gif?uniq=${uniq}"/></span>`
    );
    $(".smoke")
      .delay(1500)
      .queue(function () {
        $(".resultIcon").remove();
        $(this).dequeue().remove();
      });
  } else {
    //有錯誤的row群
    rootSoundEffect($tryagain);
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
  elem.find(".error").removeClass("error");
  elem.find(".disable").removeClass("disable");
  elem.find(".grids > .row > span").removeAttr("link");
  elem.find(".blocks > div").removeAttr("link");
  elem.find(".showanswer").removeClass("showanswer");

  $(".alert").remove();

  blockCount = 0;

  //smoke effect
  $(".smoke").remove();
  $(".resultIcon").remove();
  $(".cardAvatar").remove();

  $(".sideTool > div.btn_answer").show();
};

var resetTool = function () {
  $(".sideTool > div").removeClass("active").hide();
};
