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

      $(".items > span").each(function () {
        $(this)
          .unbind()
          .bind("click", function () {
            $(".sideTool > div.btn_replay").removeClass("active").show();
            //
            if ($(this).hasClass("mode1")) {
              $(this).removeClass("mode1 wrong").addClass("mode2");
              rootSoundEffect($pop);
            } else if ($(this).hasClass("mode2")) {
              $(this).removeClass("mode2 wrong");
              rootSoundEffect($show);
            } else {
              $(this).removeClass("wrong").addClass("mode1");
              rootSoundEffect($pop);
            }
          });
        //
        var w = $(this).parent().attr("w");
        var h = $(this).parent().attr("h");
        $(this).css("width", w + "px");
        $(this).css("height", h + "px");
      });
      $(".areas > span").each(function () {
        $(this)
          .unbind()
          .bind("click", function () {
            if (!$(this).hasClass("origin")) {
              $(this).removeClass("anchored");
              ////移除拖曳上去的路燈
              //重設路燈
              $(".contents > div.selected .areas > span").removeClass(
                "mode1 mode2"
              );
              $(".contents > div.selected .areas > span").each(function () {
                if (
                  $(this).hasClass("origin") ||
                  $(this).hasClass("anchored")
                ) {
                  turnOn($(this));
                }
              });
              //result
              var result = $(
                ".contents > div.selected .areas > span.anchored"
              ).length;
              $(".contents > div.selected")
                .find(".result .amount")
                .text(result);
            } else {
              ////開關原始存在的路燈
              $(this).toggleClass("anchored");
              if ($(this).hasClass("anchored")) {
                turnOn($(this));
              } else {
                //關燈
                //重設路燈
                $(".contents > div.selected .areas > span").removeClass(
                  "mode1 mode2"
                );
                $(".contents > div.selected .areas > span").each(function () {
                  if (
                    $(this).hasClass("anchored") ||
                    ($(this).hasClass("anchored") && $(this).hasClass("origin"))
                  ) {
                    turnOn($(this));
                  }
                });
              }
            }
          });
        var w = $(this).parent().attr("w");
        var h = $(this).parent().attr("h");
        $(this).css("width", w + "px");
        $(this).css("height", h + "px");
      });

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
      $(".sideTool > div.btn_check")
        .unbind()
        .bind("click", function () {
          checkAns();
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
          $(".tabs > span").eq(0).click();
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

var checkAns = function () {
  var getWrong = false;
  //items
  $(".contents > div.selected .items > span").each(function () {
    var light = $(this).attr("ans");
    if (light == "m1" && !$(this).hasClass("mode1")) {
      getWrong = true;
      $(this).addClass("wrong");
    }
    if (light == "m2" && !$(this).hasClass("mode2")) {
      getWrong = true;
      $(this).addClass("wrong");
    }
    if (
      light == "" &&
      ($(this).hasClass("mode2") || $(this).hasClass("mode1"))
    ) {
      getWrong = true;
      $(this).addClass("wrong");
    }
  });
  //areas
  $(".contents > div.selected .areas > span").each(function () {
    if (!$(this).hasClass("mode1")) {
      getWrong = true;
      $(this).addClass("wrong");
    }
  });
  //
  if (getWrong) {
    rootSoundEffect($wrong);
    var uniq = new Date().getTime();
    $(".contents > div.selected")
      .find(".puzzle")
      .append(
        `<span class="resultIcon wow bounceIn"><img src="./DATA/IMAGES/common/icon_wrong.png"/></span>`
      );
    $(".resultIcon")
      .delay(1500)
      .queue(function () {
        $(this).dequeue().remove();
      });
  } else {
    rootSoundEffect($correct);
    $(".contents > div.selected").find(".items").addClass("disabled");
    //
    var uniq = new Date().getTime();
    $(".contents > div.selected")
      .find(".puzzle")
      .append(
        `<span class="resultIcon wow bounceIn"><img src="./DATA/IMAGES/common/icon_right.png"/></span><span class="smoke"><img src="./DATA/IMAGES/common/chimes.gif?uniq=${uniq}"/></span>`
      );
    $(".smoke")
      .delay(1800)
      .queue(function () {
        $(".contents > div.selected").find(".items").removeClass("disabled");
        //
        $(".resultIcon").remove();
        $(this).dequeue().remove();
      });
  }
  //result
  var result = 0;
  $(".contents > div.selected .areas > span").each(function () {
    var light = $(this).attr("ans");
    if (light == "anchored") {
      result++;
    }
  });
  $(".contents > div.selected").find(".result .mini").text(result);
};

var showAnswer = function (boolean) {
  $(".contents > div.selected .items > span").removeClass("wrong");
  $(".contents > div.selected .areas > span").removeClass("wrong");
  if (boolean) {
    //秀出答案圖片
    //items
    $(".contents > div.selected .items > span").each(function () {
      var light = $(this).attr("ans");
      if (light == "") {
        light = "none";
      }
      $(this).addClass(light);
    });
    ////areas
    $(".contents > div.selected .areas > span").removeClass("anchored");
    //先開燈
    var origins = $(".contents > div.selected .areas > span.origin");
    for (var i = 0; i < origins.length; i++) {
      turnOn(origins.eq(i));
    }
    $(".contents > div.selected .areas > span").each(function () {
      var light = $(this).attr("ans");
      if (light == "anchored") {
        turnOn($(this));
      }
    });
    //result
    var result = $(".contents > div.selected .areas > span.anchored").length;
    $(".contents > div.selected").find(".result .amount").text(result);
    $(".contents > div.selected").find(".result .mini").text(result);
    //
    $(".resultIcon").remove();
    $(".smoke").remove();
    rootSoundEffect($help);
    $(".sideTool > div.btn_check").hide();
  } else {
    //items
    $(".contents > div.selected .items > span").removeClass("m1 m2 none");
    ////areas
    $(".contents > div.selected .areas > span").removeClass(
      "mode1 mode2 anchored"
    );
    //result
    $(".contents > div.selected").find(".result .amount").text("");
    $(".contents > div.selected").find(".result .mini").text("");
    //
    rootSoundEffect($show);
    $(".sideTool > div.btn_check").show();
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
      $("#module_wrapper").append(
        `<div id="cardAvatar" class="cardAvatar">
        <img src="./DATA/PT/BOOK4/IMAGES/torch.png"/>
        </div>`
      );
    }
  }

  if (isDragging && $elem) {
    //drag clon card
    if ($($elem).hasClass("cards")) {
      var deltaContainerX = $("#module_wrapper").offset().left;
      var deltaContainerY = $("#module_wrapper").offset().top;
      $("#cardAvatar").get(0).style.top =
        Math.round(
          ev.center.y / stageRatioReal - deltaContainerY / stageRatioReal
        ) + "px";
      $("#cardAvatar").get(0).style.left =
        Math.round(
          ev.center.x / stageRatioReal - deltaContainerX / stageRatioReal
        ) + "px";
      checkCollision(ev);
    }
  }

  if (ev.isFinal) {
    if ($($elem).hasClass("cards")) {
      var frameElem = $(".contents > div.selected .areas > span");
      var gotit = false;
      frameElem.each(function () {
        if ($(this).hasClass("selected")) {
          gotit = true;
          //先開啟固定的燈
          /*
          var origins = $(
            ".contents > div.selected .areas > span.origin:not('.anchored')"
          );
          for (var i = 0; i < origins.length; i++) {
            turnOn(origins.eq(i));
          }*/
          //開啟拖曳的燈
          turnOn($(this));
          $(this).removeClass("selected");
          //result
          var result = $(
            ".contents > div.selected .areas > span.anchored"
          ).length;
          $(".contents > div.selected").find(".result .amount").text(result);
        }
      });

      if (!gotit) {
        rootSoundEffect($wrong);
      }
    }
    $("#cardAvatar").remove();
    //then
    isDragging = false;
    $elem = null;
  }
};

var checkCollision = function (ev) {
  var lastX = ev.center.x;
  var lastY = ev.center.y;
  var frameElem = $(".contents > div.selected .areas > span");
  frameElem.removeClass("temp");
  frameElem.each(function () {
    var oriX = $(this).offset().left;
    var oriW = oriX + $(this).width();
    var oriY = $(this).offset().top;
    var oriH = oriY + $(this).height();
    if (lastX >= oriX && lastX <= oriW && lastY >= oriY && lastY <= oriH) {
      if (!$(this).hasClass("origin") && !$(this).hasClass("anchored")) {
        $(this)
          .addClass("selected")
          .siblings(".selected")
          .removeClass("selected");
        toggleRange($(this), true);
      }
    } else {
      $(this).removeClass("selected");
    }
  });
};

var turnOn = function (tar) {
  tar.addClass("mode1 anchored");
  rootSoundEffect($key);
  var areas = $(".contents > div.selected .areas > span");
  areas.removeClass("temp");
  var neighbors = tar.attr("neighbor").split(",");
  for (var i = 0; i < neighbors.length; i++) {
    if (
      !areas.eq(parseInt(neighbors[i]) - 1).hasClass("origin") &&
      !areas.eq(parseInt(neighbors[i]) - 1).hasClass("anchored")
    ) {
      if (!areas.eq(parseInt(neighbors[i]) - 1).hasClass("mode1")) {
        areas.eq(parseInt(neighbors[i]) - 1).addClass("mode1");
      } else {
        areas.eq(parseInt(neighbors[i]) - 1).addClass("mode2");
      }
    }
  }
  //
  $(".sideTool > div.btn_replay").removeClass("active").show();
};

var toggleRange = function (tar, boolean) {
  var areas = $(".contents > div.selected .areas > span");
  var neighbors = tar.attr("neighbor").split(",");
  if (boolean) {
    tar.addClass("temp");
    for (var i = 0; i < neighbors.length; i++) {
      areas.eq(parseInt(neighbors[i]) - 1).addClass("temp");
    }
  } else {
    tar.removeClass("temp");
    for (var i = 0; i < neighbors.length; i++) {
      areas.eq(parseInt(neighbors[i]) - 1).removeClass("temp");
    }
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
  //items
  elem.find(".items > span").removeClass("wrong m1 m2 mode1 mode2 none");
  elem.find(".disabled").removeClass("disabled");
  //areas
  elem.find(".areas > span").removeClass("anchored mode1 mode2 wrong temp");
  //result
  elem.find(".result .amount").text("");
  elem.find(".result .mini").text("");
  //
  $(".sideTool > div.btn_answer").removeClass("active").show();
  $(".sideTool > div.btn_check").removeClass("active").show();
  $(".resultIcon").remove();
  $(".smoke").remove();
};

var resetTool = function () {
  $(".sideTool > div").removeClass("active").hide();
};
