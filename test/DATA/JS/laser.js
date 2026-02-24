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
        .find(".map .board >div >span")
        .each(function () {
          if ($(this).attr("int")) {
            if (!$(this).hasClass("laser")) {
              $(this).addClass("fit");
            } else {
              $(this)
                .unbind()
                .bind("click", function () {
                  $(".sideTool > div.btn_check").show();
                  rootSoundEffect($key);
                  if ($(this).hasClass("selected")) {
                    $(".sideTool > div.btn_check").click();
                  } else {
                    if ($(".sideTool > div.btn_check").hasClass("active")) {
                      $(".sideTool > div.btn_check").click();
                    }
                    $(".laser.selected").removeClass("selected");
                    $(this).addClass("selected");
                    $(".sideTool > div.btn_replay").show();
                    $(".sideTool > div.btn_answer").removeClass("active");
                  }
                });
            }
            //
            var obj = `<img class="wow bounceIn" src="./DATA/PT/BOOK5/IMAGES/${$(
              this,
            ).attr("int")}.png"/>`;
            $(this).append(obj);
          }
        });

      $(this)
        .find(".pieces >span")
        .each(function (index) {
          var obj = `<img class="wow bounceIn" src="./DATA/PT/BOOK5/IMAGES/${$(
            this,
          ).attr("int")}.png?u=${index}"/>`;
          $(this).append(obj);
        });

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
    //秀出答案
    $(".contents > div.selected")
      .find(".board span")
      .each(function () {
        if ($(this).hasClass("laser")) {
          if ($(this).attr("ans")) {
            $(this).addClass("selected");
            $(".sideTool > div.btn_replay").show();
          } else {
            $(this).removeClass("selected");
          }
        } else if ($(this).attr("box")) {
          $(this).removeClass().empty().unbind();
          var box = $(this).attr("box");
          var tiles = $(".contents > div.selected").find(".pieces span");
          for (var k = 0; k < tiles.length; k++) {
            if (tiles.eq(k).attr("int") == box) {
              tiles.eq(k).addClass("cached");
              //
              $(this).addClass(tiles.eq(k).attr("class"));
              $(this).append(tiles.eq(k).html());
              $(this)
                .unbind()
                .bind("click", function () {
                  $(".sideTool > div.btn_answer").removeClass("active");
                  var src1 = $(this).find("img").attr("src");
                  $(".contents > div.selected")
                    .find(".pieces span")
                    .each(function () {
                      if (
                        src1 == $(this).find("img").attr("src") &&
                        $(this).hasClass("cached")
                      ) {
                        $(this).removeClass("cached");
                        return false;
                      }
                    });
                  $(this).removeAttr("class").empty().unbind();
                  $(".sideTool > div.btn_check").removeClass("active");
                  checkAnswer(false);
                  rootSoundEffect($show);
                });
              break;
            }
          }
        } else if (!$(this).attr("int") && !$(this).attr("box")) {
          $(this).removeClass().empty().unbind();
        }
      });
    //
    rootSoundEffect($help);
  } else {
    $(".sideTool > div.btn_replay").click();
  }
  $(".sideTool > div.btn_check").removeClass("active").show();
};

var beamTimeout;
var beamDuration = 1300;
var joints = new Array();
var beams = new Array();
var checkAnswer = function (boolean) {
  if (boolean) {
    //建立光束
    joints = new Array();
    beams = new Array();
    var start = $(".contents > div.selected").find(".board .laser.selected");
    if (start.length > 0) {
      joints.push(start);
      caculateBeam();
      //
      $(".sideTool > div.btn_answer").hide();
    } else {
      rootSoundEffect($wrong);
      console.log("沒有選擇雷射筆");
    }
  } else {
    //移除光束
    clearTimeout(beamTimeout);
    $(".smoke").remove();
    $(".contents > div.selected").find("span.beam").remove();
    $(".contents > div.selected").find(".bingo").removeClass("bingo");
    $(".sideTool > div.btn_answer").show();
  }
};

var caculateBeam = function () {
  var loop = $(".contents > div.selected").find(".board > div > span").length;
  for (var j = 0; j < joints.length; j++) {
    var tar = joints[j];
    var newTarget = tar;
    //找到下一個端點
    for (var i = 0; i < loop; i++) {
      console.log(i);
      if (tar.hasClass("right")) {
        //往右找端點
        if (newTarget.next().length > 0) {
          newTarget = newTarget.next();
          if (newTarget.children().length > 0) {
            console.log("找到右端點");
            beams.push([tar, newTarget, true, "right", i]);

            break;
          }
        } else {
          beams.push([tar, newTarget, false, "right", i]);
          console.log("出界");
          break;
        }
      } else if (tar.hasClass("left")) {
        //往左找端點
        if (newTarget.prev().length > 0) {
          newTarget = newTarget.prev();
          if (newTarget.children().length > 0) {
            console.log("找到左端點");
            beams.push([tar, newTarget, true, "left", i]);

            break;
          }
        } else {
          beams.push([tar, newTarget, false, "left", i]);

          console.log("出界");
          break;
        }
      } else if (tar.hasClass("duo")) {
        //先往左找端點
        if (newTarget.prev().length > 0) {
          newTarget = newTarget.prev();
          if (newTarget.children().length > 0) {
            console.log("先找到左端點");
            beams.push([tar, newTarget, true, "left", i]);
            //再往右找端點
            newTarget = tar;
            for (var k = 0; k < loop; k++) {
              if (newTarget.next().length > 0) {
                newTarget = newTarget.next();
                if (newTarget.children().length > 0) {
                  console.log("後找到右端點");
                  beams.push([tar, newTarget, true, "right", k]);

                  break;
                }
              } else {
                console.log("後往右出界");
                beams.push([tar, newTarget, false, "right", k]);

                break;
              }
            }

            break;
          }
        } else {
          console.log("先往左出界");
          beams.push([tar, newTarget, false, "left", i]);
          //再往右找端點
          newTarget = tar;
          for (var m = 0; m < loop; m++) {
            if (newTarget.next().length > 0) {
              newTarget = newTarget.next();
              if (newTarget.children().length > 0) {
                console.log("後找到右端點");
                beams.push([tar, newTarget, true, "right", m]);
                break;
              }
            } else {
              console.log("後往右出界");
              beams.push([tar, newTarget, false, "right", m]);

              break;
            }
          }
          //
          break;
        }
      } else if (tar.hasClass("up")) {
        //往上找端點
        if (newTarget.parent().prev().length > 0) {
          newTarget = newTarget
            .parent()
            .prev()
            .find(">span")
            .eq(newTarget.index());
          if (newTarget.children().length > 0) {
            console.log("找到上端點");
            beams.push([tar, newTarget, true, "up", i]);

            break;
          }
        } else {
          beams.push([tar, newTarget, false, "up", i]);
          console.log("出界");
          break;
        }
      } else if (tar.hasClass("down")) {
        //往下找端點
        if (newTarget.parent().next().length > 0) {
          newTarget = newTarget
            .parent()
            .next()
            .find(">span")
            .eq(newTarget.index());
          if (newTarget.children().length > 0) {
            console.log("找到下端點");
            beams.push([tar, newTarget, true, "down", i]);

            break;
          }
        } else {
          beams.push([tar, newTarget, false, "down", i]);
          console.log("出界");
          break;
        }
      } else if (tar.attr("int") == "diamond") {
        console.log("成功並啟動光束");
        tar.addClass("bingo");
        rootSoundEffect($chimes);
        var uniq = new Date().getTime();
        $(".contents > div.selected")
          .find(".diamond.bingo")
          .append(
            `<span class="smoke"><img src="./DATA/IMAGES/common/chimes.gif?uniq=${uniq}"/></span>`,
          );
        break;
      } else if (tar.attr("int") == "blackhole") {
        console.log("射到黑洞");
        tar.addClass("active");
        rootSoundEffect($surprise);
        break;
      }
    }
  }
  createBeam();
};

var createBeam = function () {
  var board = $(".contents > div.selected").find(".board");
  joints = new Array();
  //
  for (var i = 0; i < beams.length; i++) {
    var start = beams[i][0];
    var end = beams[i][1];
    var outbound = beams[i][2];
    var direction = beams[i][3];
    var unit = parseInt(beams[i][4]);
    var ww = 40;
    var hh = 36;
    var gap = 1;
    var oX = start.index() * ww + ww / 2 + gap;
    var oY = start.parent().index() * hh + hh / 2 + gap;
    if (direction == "right") {
      var meter = (ww + gap) * (unit + 1);
      var degree = 0;
    } else if (direction == "left") {
      var meter = (ww + gap) * (unit + 1);
      var degree = 180;
    } else if (direction == "up") {
      var meter = (hh + gap) * (unit + 1);
      var degree = -90;
    } else if (direction == "down") {
      var meter = (hh + gap) * (unit + 1);
      var degree = 90;
    }

    //
    rootSoundEffect($beam);
    var colour = "";
    if (
      $(".contents > div.selected")
        .find(".board .laser.selected")
        .attr("int") == "laser_green"
    ) {
      colour = "green";
    }
    var beam = `<span class="beam ${colour}" style="top:${oY}px;left:${oX}px;width:${meter}px;transform:rotate(${degree}deg)"></span>`;
    board.append(beam);

    if (outbound) {
      console.log("建立一條有效光束");
      joints.push(beams[i][1]);
    } else {
      console.log("建立一條出界光束");
    }
  }
  //
  beams = new Array();

  if (joints.length > 0) {
    beamTimeout = setTimeout(function () {
      caculateBeam();
    }, beamDuration);
  } else {
    beamTimeout = setTimeout(function () {
      //結束後還沒找到鑽石

      if ($(".contents > div.selected").find(".diamond.bingo").length == 0) {
        rootSoundEffect($fail);
        $(".contents > div.selected")
          .find(".map")
          .append(
            `<span class="smoke wow bounceIn"><img src="./DATA/IMAGES/common/icon_wrong.png"/></span>`,
          );
        $(".smoke")
          .delay(1500)
          .queue(function () {
            $(this).dequeue().remove();
          });
      }
    }, beamDuration);
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
    if ($($elem).parent().hasClass("pieces")) {
      $("#module_wrapper").append(
        `<div id="cardAvatar" class="cardAvatar"></div>`,
      );
      $($elem).clone().appendTo("#cardAvatar");
      $($elem).addClass("cached");
    }
  }

  if (isDragging && $elem) {
    //drag clon card
    if ($($elem).parent().hasClass("pieces")) {
      var deltaContainerX = $("#module_wrapper").offset().left;
      var deltaContainerY = $("#module_wrapper").offset().top;
      $("#cardAvatar").get(0).style.top =
        Math.round(
          ev.center.y / stageRatioReal -
            deltaContainerY / stageRatioReal -
            $("#cardAvatar").height() / stageRatioReal / 2,
        ) + "px";
      $("#cardAvatar").get(0).style.left =
        Math.round(
          ev.center.x / stageRatioReal -
            deltaContainerX / stageRatioReal -
            $("#cardAvatar").width() / stageRatioReal / 2,
        ) + "px";
      checkCollision(ev);
    }
  }

  if (ev.isFinal) {
    if ($($elem).parent().hasClass("pieces")) {
      var frameElem = $(".contents > div.selected .board span");
      var gotit = false;
      frameElem.each(function () {
        if ($(this).hasClass("overlaped")) {
          gotit = true;
        }
      });
      //checkCollision true
      if (gotit) {
        checkStatus();
      } else {
        var src1 = $("#cardAvatar").find("img").attr("src");
        $(".contents > div.selected")
          .find(".pieces > span")
          .each(function () {
            if (src1 == $(this).find("img").attr("src")) {
              $(this).removeClass("cached");
              return false;
            }
          });
        rootSoundEffect($show);
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
  var frameElem = $(".contents > div.selected .board span");
  frameElem.each(function () {
    var oriX = $(this).offset().left;
    var oriW = oriX + $(this).width();
    var oriY = $(this).offset().top;
    var oriH = oriY + $(this).height();
    if (lastX >= oriX && lastX <= oriW && lastY >= oriY && lastY <= oriH) {
      $(this).addClass("overlaped");
    } else {
      $(this).removeClass("overlaped");
    }
  });
};

var checkStatus = function () {
  var target = $(".contents > div.selected .board span.overlaped");
  if (target.children().length > 0) {
    target.removeClass("overlaped");
    rootSoundEffect($wrong);
    var src1 = $("#cardAvatar").find("img").attr("src");
    $(".contents > div.selected")
      .find(".pieces span")
      .each(function () {
        if (
          src1 == $(this).find("img").attr("src") &&
          $(this).hasClass("cached")
        ) {
          $(this).removeClass("cached");
          return false;
        }
      });
    $("#cardAvatar").remove();
  } else {
    $(".sideTool > div.btn_check").removeClass("active");
    checkAnswer(false);
    rootSoundEffect($pop);
    target
      .removeClass("overlaped")
      .addClass($("#cardAvatar").find(">span").attr("class"));
    target.append($("#cardAvatar").find(">span").html());
    target.unbind().bind("click", function () {
      var src1 = $(this).find("img").attr("src");
      $(".contents > div.selected")
        .find(".pieces span")
        .each(function () {
          if (
            src1 == $(this).find("img").attr("src") &&
            $(this).hasClass("cached")
          ) {
            $(this).removeClass("cached");
            return false;
          }
        });
      $(this).removeAttr("class").empty().unbind();
      $(".sideTool > div.btn_check").removeClass("active");
      checkAnswer(false);
      rootSoundEffect($show);
    });
    $("#cardAvatar").remove();
    $(".sideTool > div.btn_replay").show();
  }
};

var openContent = function (id) {
  resetAudio();
  resetTool();
  //20260204
  removeToggleAttachment();
  $(".laser").clearQueue();
  $(".contents > div")
    .eq(id)
    .addClass("selected")
    .siblings(".selected")
    .removeClass("selected");
  resetElem($(".contents > div.selected"));
};

var resetElem = function (elem) {
  clearTimeout(beamTimeout);
  //
  $(".cardAvatar").remove();
  elem.find(".overlaped").removeClass("overlaped");
  elem.find(".selected").removeClass("selected");
  elem.find(".bingo").removeClass("bingo");
  elem.find(".cached").removeClass("cached");
  elem.find(".active").removeClass("active");
  elem.find("span.beam").remove();
  elem.find(".board span").each(function () {
    if (!$(this).attr("int")) {
      $(this).removeAttr("class").empty();
    }
  });

  if (elem.find(".laser").length == 1) {
    elem
      .find(".laser")
      .delay(500)
      .queue(function () {
        $(this).click().dequeue();
      });
  }

  $(".sideTool > div.btn_answer").removeClass("active").show();
  //$(".sideTool > div.btn_check").removeClass("active").show();
  $(".smoke").remove();
};

var resetTool = function () {
  $(".sideTool > div").removeClass("active").hide();
};
