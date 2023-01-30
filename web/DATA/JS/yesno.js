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
          $(this).hide();
          resetElem($(".contents > div.selected"));
        });

      $(".sideTool > div.btn_check")
        .unbind()
        .bind("click", function () {
          checkAnswer();
        });
      $(".sideTool > div.btn_answer")
        .unbind()
        .bind("click", function () {
          $(this).toggleClass("active");
          if ($(this).hasClass("active")) {
            showAnswer(true);
            $(".sideTool > div.btn_answer").addClass("active");
          } else {
            showAnswer(false);
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
    $(".sideTool > div.btn_replay").click();
    //物品放置答案

    var elem = $(".contents > div.selected");
    var piece = elem.find(".piece");
    if (piece.length > 0) {
      if (elem.find(".subject").hasClass("needcards")) {
        initPieces(true);
      } else {
        //清掉arrow
        elem.find(".arrowArea .arrow").removeClass("selected");
        //移動
        var pX = parseInt(elem.find(".sensorArea").css("left"));
        var pY = parseInt(elem.find(".sensorArea").css("top"));
        for (var k = 0; k < piece.length; k++) {
          piece.eq(k).removeClass("selected").addClass("done");
          var name = piece.eq(k).attr("group");
          var sensor = elem.find(".sensorArea .sensor[name='" + name + "']");
          var oX = parseInt(sensor.css("left"));
          var oY = parseInt(sensor.css("top"));
          var ww = parseInt(sensor.css("width")) / stageRatioReal;
          var hh = parseInt(sensor.css("height")) / stageRatioReal;
          var diffX = 0;
          var diffY = 0;
          if (sensor.attr("diffX")) {
            diffX = parseInt(sensor.attr("diffX"));
          }
          if (sensor.attr("diffY")) {
            diffY = parseInt(sensor.attr("diffY"));
          }
          piece
            .eq(k)
            .css(
              "left",
              diffX == 0
                ? pX + oX + ww / 2
                : pX +
                    oX +
                    ww / 2 +
                    diffX +
                    parseInt(piece.eq(k).children().css("width")) /
                      2 /
                      stageRatioReal
            )
            .css(
              "top",
              diffY == 0
                ? pY + oY + hh / 2
                : pY +
                    oY +
                    hh / 2 +
                    diffY +
                    parseInt(piece.eq(k).children().css("height")) /
                      2 /
                      stageRatioReal
            );
          ////
          //橫向延伸
          if (sensor.attr("diffX")) {
            diffX =
              diffX == 0
                ? diffX +
                  parseInt(piece.eq(k).children().css("width")) /
                    2 /
                    stageRatioReal
                : diffX +
                  parseInt(piece.eq(k).children().css("width")) /
                    stageRatioReal;
            sensor.attr("diffX", diffX);
          }
          //垂直延伸
          if (sensor.attr("diffY")) {
            diffY =
              diffY == 0
                ? diffY +
                  parseInt(piece.eq(k).children().css("height")) /
                    2 /
                    stageRatioReal
                : diffY +
                  parseInt(piece.eq(k).children().css("height")) /
                    stageRatioReal;
            sensor.attr("diffY", diffY);
          }

          piece.eq(k).attr("location", sensor.attr("name"));
          rootSoundEffect($show);
        }
      }
    }

    //
    $(".sideTool > div.btn_replay").show();

    ////條件卡答案
    var containers = $(".contents > div.selected .cardArea").children();
    var toys = $(".contents > div.selected .toys > .toy");
    //秀出答案
    $(".contents > div.selected .toys")
      .find(".selected")
      .removeClass("selected");
    $(".contents > div.selected .toys")
      .find(".cached")
      .removeClass("cached semiTransparent");
    $(".cardAvatarDie").remove();
    rootSoundEffect($help);
    //排位子
    var ansArray = [];
    containers.each(function (index) {
      ansArray.push([]);
      for (var i = 0; i < toys.length; i++) {
        toys.eq(i).addClass("cached semiTransparent");
        var caWidth = parseInt(toys.eq(i).css("width")) / stageRatioReal;
        var caHeight = parseInt(toys.eq(i).css("height")) / stageRatioReal;

        //答案預設位置
        var ap = toys.eq(i).attr("ap").split(",");
        var ansTop = ap[0];
        var ansLeft = ap[1];
        //
        ansArray[ansArray.length - 1].push(
          `<div class="cardAvatar cardAvatarDie" style="width:${caWidth}px;height:${caHeight}px;top:${ansTop}px;left:${ansLeft}px;">${toys
            .eq(i)
            .prop("outerHTML")}</div>`
        );
      }
    });

    for (var i = 0; i < ansArray.length; i++) {
      var itemsArr = ansArray[i];
      for (var k = 0; k < itemsArr.length; k++) {
        $(".contents > div.selected .contain").append(itemsArr[k]);
      }
    }
    //
    $(".sideTool > div.btn_replay").show();
  } else {
    $(".sideTool > div.btn_replay").click();
  }
};

var lowlaged = false;
var lastPosX = 0;
var lastPosY = 0;
var isDragging = false;
var $elem = null;

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
  if (!isDragging && $elem != null) {
    isDragging = true;
    if ($($elem).hasClass("cards")) {
      $(".contents > div.selected .contain").append(
        `<div id="cardAvatar" class="cardAvatar"></div>`
      );
      $($elem).clone().appendTo("#cardAvatar");
      $($elem).addClass("cached");
      //是否有位置參數sp
      if ($($elem).attr("sp")) {
        $($elem).addClass("semiTransparent");
      }
      var caWidth = parseInt($($elem).css("width")) / stageRatioReal;
      var caHeight = parseInt($($elem).css("height")) / stageRatioReal;

      $("#cardAvatar").css("width", caWidth + "px");
      $("#cardAvatar").css("height", caHeight + "px");
    }
  }

  if (isDragging && $elem) {
    //drag clon card
    if ($($elem).hasClass("cards")) {
      var deltaContainerX = $(".contents > div.selected .contain").offset()
        .left;
      var deltaContainerY = $(".contents > div.selected .contain").offset().top;
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
    if ($($elem).hasClass("cards")) {
      var frameElem = $(".contents > div.selected .cardArea").children();
      var gotit = false;
      frameElem.each(function () {
        if ($(this).hasClass("selected")) {
          gotit = true;
        }
      });
      //checkCollision true
      if (gotit) {
        //check order status
        checkStatus();
      } else {
        var src1 = $("#cardAvatar").find("img").attr("src");
        $(".contents > div.selected")
          .find(".toys > div")
          .each(function () {
            if (src1 == $(this).find("img").attr("src")) {
              $(this).removeClass("cached semiTransparent");
            }
          });
        $("#cardAvatar").remove();
      }
    }
    //then
    isDragging = false;
    $elem = null;
  }
};

var checkCollision = function (ev) {
  var lastX = ev.center.x;
  var lastY = ev.center.y;
  var frameElem = $(".contents > div.selected .cardArea").children();
  frameElem.each(function () {
    var oriX = $(this).offset().left;
    var oriW = oriX + $(this).width();
    var oriY = $(this).offset().top;
    var oriH = oriY + $(this).height();
    if (lastX >= oriX && lastX <= oriW && lastY >= oriY && lastY <= oriH) {
      $(this).addClass("selected");
    } else {
      $(this).removeClass("selected");
    }
  });
};

var checkStatus = function () {
  //是否有黏性位置sp
  if ($("#cardAvatar > div").attr("sp")) {
    var itemSP = $("#cardAvatar > div").attr("sp").split("^");
    var itemW = $("#cardAvatar").get(0).style.width;
    var itemH = $("#cardAvatar").get(0).style.height;
    var itemTop = $("#cardAvatar").get(0).style.top;
    var itemLeft = $("#cardAvatar").get(0).style.left;
    console.log(itemTop, itemLeft);
    for (var k = 0; k < itemSP.length; k++) {
      var tempSP = itemSP[k].split(",");
      if (
        parseInt(itemTop) > parseInt(tempSP[0]) - parseInt(itemH) / 2 &&
        parseInt(itemTop) < parseInt(tempSP[0]) + parseInt(itemH) / 2 &&
        parseInt(itemLeft) > parseInt(tempSP[1]) - parseInt(itemW) / 2 &&
        parseInt(itemLeft) < parseInt(tempSP[1]) + parseInt(itemW) / 2
      ) {
        $("#cardAvatar").get(0).style.top = tempSP[0] + "px";
        $("#cardAvatar").get(0).style.left = tempSP[1] + "px";
      }
    }
  }
  //放置音效
  rootSoundEffect($key);
  //是否放對區域
  if (
    $("#cardAvatar > div").attr("group") &&
    $("#cardAvatar > div").attr("group") ==
      $(".contents > div.selected .cardArea > .selected").attr("group")
  ) {
    $("#cardAvatar").addClass("right");
  }

  //
  $("#cardAvatar")
    .unbind()
    .bind("click", function () {
      var src1 = $(this).find("img").attr("src");
      $(".contents > div.selected")
        .find(".toys > div")
        .each(function () {
          if (src1 == $(this).find("img").attr("src")) {
            $(this).removeClass("cached semiTransparent");
          }
        });
      $(this).remove();
      rootSoundEffect($show);
    })
    .removeAttr("id")
    .addClass("cardAvatarDie");
  //.css("pointer-events", "auto");
  //.css("cursor", "pointer");
  //

  //放完了沒
  if (
    $(".cardAvatarDie").length ==
    $(".contents > div.selected .cardArea > span").length
  ) {
    console.log("放完");
    initPieces(true);
  } else {
    console.log("還沒放完");
    initPieces(false);
  }

  $(".sideTool > div.btn_replay").show();
};

var nextPiece = function (tar) {
  tar.addClass("done").removeClass("selected");
  if (tar.next().length > 0) {
    tar.next().addClass("selected");
    $(".contents > div.selected").find(".sensorArea .sensor.start").click();
  } else {
    endGame();
  }
};

var initPieces = function (boolean) {
  var elem = $(".contents > div.selected");
  if (elem.find(".piece").length > 0) {
    if (boolean) {
      elem.find(".piece").addClass("selected");
      elem.find(".sensorArea .sensor.start").click();
      elem.find(".piece").removeClass("selected");
      elem.find(".piece").eq(0).addClass("selected");
    } else {
      elem.find(".piece").removeClass("selected");
      elem.find(".arrowArea .arrow").removeClass("selected");
    }
  }
};

var endGame = function () {
  console.log("game over");
  rootSoundEffect($show);
  if ($(".contents > div.selected").find(".subject").hasClass("noanswer")) {
    $(".sideTool > div.btn_check").hide();
  } else {
    $(".sideTool > div.btn_check").show();
  }
};

var bingo = function () {
  rootSoundEffect($correct);
  var uniq = new Date().getTime();
  $(".contents > div.selected")
    .find(".subject")
    .append(
      `<span class="resultIcon wow bounceIn"><img src="./DATA/IMAGES/common/icon_right.png"/></span><span class="smoke"><img src="./DATA/IMAGES/common/chimes2.gif?uniq=${uniq}"/></span>`
    );
  $(".smoke")
    .delay(1500)
    .queue(function () {
      $(".resultIcon").remove();
      $(this).dequeue().remove();
    });
};

var checkAnswer = function () {
  $(".contents > div.selected")
    .find(".piece")
    .each(function () {
      if ($(this).attr("location") != $(this).attr("group")) {
        $(this).addClass("wrong");
      }
    });
  if ($(".contents > div.selected").find(".piece.wrong").length > 0) {
    rootSoundEffect($stupid);
  } else {
    bingo();
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
  elem.find(".done").removeClass("done");
  elem.find(".wrong").removeClass("wrong");
  //reset piece
  if (elem.find(".piece").length > 0) {
    elem.find(".piece").each(function () {
      $(this)
        .attr("location", "")
        .unbind()
        .bind("click", function () {
          $(this)
            .addClass("selected")
            .siblings(".piece.selected")
            .removeClass("selected");
          rootSoundEffect($pop);
        });
    });
    //reset cards
    $(".contents > div.selected .ifcard").find(">span").removeClass("active");
    $(".contents > div.selected .mycard").find(">span").removeClass("active");
  }

  //reset sensorArea
  if (elem.find(".sensorArea").length > 0) {
    elem.find(".sensorArea .sensor").each(function () {
      //橫向放多物件
      if ($(this).attr("diffX")) {
        $(this).attr("diffX", 0);
      }
      //垂直放多物件
      if ($(this).attr("diffY")) {
        $(this).attr("diffY", 0);
      }
      $(this)
        .unbind()
        .bind("click", function () {
          var piece = elem.find(".piece.selected");
          //
          if (piece.length > 0) {
            var neighbor = elem
              .find(
                ".sensorArea .sensor[name='" + piece.attr("location") + "']"
              )
              .attr("neighbor");
            var neighbors = neighbor ? neighbor.split(",") : new Array();
            var myname = $(this).attr("name");

            //是否是鄰近格子
            if (neighbors.indexOf(myname) >= 0 || $(this).hasClass("start")) {
              //移動
              var pX = parseInt(elem.find(".sensorArea").css("left"));
              var pY = parseInt(elem.find(".sensorArea").css("top"));
              var oX = parseInt($(this).css("left"));
              var oY = parseInt($(this).css("top"));
              var ww = parseInt($(this).css("width")) / stageRatioReal;
              var hh = parseInt($(this).css("height")) / stageRatioReal;
              for (var k = 0; k < piece.length; k++) {
                var oriXY = piece.eq(k).attr("oriXY");
                if (oriXY && $(this).hasClass("start")) {
                  var oriXYArr = oriXY.split(",");
                  piece
                    .eq(k)
                    .css("left", oriXYArr[0] + "px")
                    .css("top", oriXYArr[1] + "px");
                } else {
                  var diffX = 0;
                  var diffY = 0;
                  if ($(this).attr("diffX")) {
                    diffX = parseInt($(this).attr("diffX"));
                  }
                  if ($(this).attr("diffY")) {
                    diffY = parseInt($(this).attr("diffY"));
                  }
                  piece
                    .eq(k)
                    .css(
                      "left",
                      diffX == 0
                        ? pX + oX + ww / 2
                        : pX +
                            oX +
                            ww / 2 +
                            diffX +
                            parseInt(piece.eq(k).children().css("width")) /
                              2 /
                              stageRatioReal
                    )
                    .css(
                      "top",
                      diffY == 0
                        ? pY + oY + hh / 2
                        : pY +
                            oY +
                            hh / 2 +
                            diffY +
                            parseInt(piece.eq(k).children().css("height")) /
                              2 /
                              stageRatioReal
                    );
                  ////
                  //橫向延伸
                  if ($(this).attr("diffX")) {
                    diffX =
                      diffX == 0
                        ? diffX +
                          parseInt(piece.eq(k).children().css("width")) /
                            2 /
                            stageRatioReal
                        : diffX +
                          parseInt(piece.eq(k).children().css("width")) /
                            stageRatioReal;
                    $(this).attr("diffX", diffX);
                  }
                  //垂直延伸
                  if ($(this).attr("diffY")) {
                    diffY =
                      diffY == 0
                        ? diffY +
                          parseInt(piece.eq(k).children().css("height")) /
                            2 /
                            stageRatioReal
                        : diffY +
                          parseInt(piece.eq(k).children().css("height")) /
                            stageRatioReal;
                    $(this).attr("diffY", diffY);
                  }
                }

                piece.eq(k).attr("location", $(this).attr("name"));
                rootSoundEffect($show);
                //是否有附帶arrows?
                elem.find(".arrowArea .arrow").removeClass("selected");
                elem
                  .find(
                    ".arrowArea .arrow[parent='" + $(this).attr("name") + "']"
                  )
                  .addClass("selected");
                //是否結束移動
                if ($(this).hasClass("end")) {
                  console.log("next");
                  nextPiece(piece.eq(k));
                }
              }
            } else {
              //非鄰近格子
              rootSoundEffect($wrong);
            }
          } else {
            rootSoundEffect($stupid);
          }

          //
          $(".sideTool > div.btn_replay").show();
        });
    });
  }

  //reset arrowrArea
  if (elem.find(".arrowArea").length > 0) {
    elem.find(".arrowArea .arrow").each(function () {
      $(this)
        .unbind()
        .bind("click", function () {
          console.log("fff");
          var sensor = elem.find(
            ".sensorArea .sensor[name='" + $(this).attr("target") + "']"
          );
          sensor.click();
        });
    });
  }

  //移動旗子到起點
  initPieces(true);

  //這個題目需要needcards
  if (elem.find(".subject").hasClass("needcards")) {
    elem.find(".piece").removeClass("selected");
    elem.find(".sensorArea .sensor").removeClass("selected");
    elem.find(".arrowArea .arrow").removeClass("selected");
  }

  //reset cards
  elem.find(".cached").removeClass("cached semiTransparent");
  $(".cardAvatar").remove();
  $(".smoke").remove();
  $(".resultIcon").remove();
  //

  $(".sideTool > div.btn_answer").removeClass("active").show();
  $(".sideTool > div.btn_check").hide();
  $(".sideTool > div.btn_replay").hide();
  //
  if (elem.find(".subject").hasClass("noanswer")) {
    $(".sideTool > div.btn_answer").hide();
  }
};

var resetTool = function () {
  $(".sideTool > div").removeClass("active").hide();
};

var afterDice = function (points) {
  $(".diceresult").html(points).show();
};
