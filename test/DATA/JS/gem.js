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

      //gem_container2
      $(".gem_container2 > div").each(function () {
        var dashes = $(this).find(">.dashes");
        dashes.unbind().bind("click", function () {
          rootSoundEffect($pop);
          $(this).addClass("selected");
          $(".sideTool > div.btn_replay").show();
        });

        var piece = $(this).find(">span");
        piece.unbind().bind("click", function () {
          if ($(".colours > div.selected").length > 0) {
            rootSoundEffect($pop);
            $(this).attr("guess", $(".colours > div.selected").attr("ans"));
            $(this).css(
              "background",
              "#" + $(".colours > div.selected").attr("col")
            );
            $(".sideTool > div.btn_replay").show();
            checkAnswer($(this));
          } else {
            rootSoundEffect($show);
            $(this).attr("guess", "0");
            $(this).css("background", "transparent");
          }
        });
      });
      $(".colours > div")
        .unbind()
        .bind("click", function () {
          $(this)
            .toggleClass("selected")
            .siblings(".selected")
            .removeClass("selected");
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
    if ($($elem).hasClass("draggable")) {
      $("#module_wrapper").append(
        `<div id="cardAvatar" class="cardAvatar"></div>`
      );
      $($elem).find(">img").clone().appendTo("#cardAvatar");
      $("#cardAvatar").attr("ans", $($elem).attr("ans"));
      $($elem).addClass("cached");
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
      var frameElem = $(".contents > div.selected .gem_container > div");
      var gotit = false;
      frameElem.each(function () {
        if ($(this).hasClass("selected")) {
          gotit = true;
        }
      });
      //checkCollision true
      if (gotit) {
        //check order status
        checkOrderStatus();
      } else {
        $("#cardAvatar").remove();
        $(".cached").removeClass("cached");
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
  var frameElem = $(".contents > div.selected .gem_container > div");
  var gotit = false;
  frameElem.each(function () {
    var oriX = $(this).offset().left;
    var oriW = oriX + $(this).width();
    var oriY = $(this).offset().top;
    var oriH = oriY + $(this).height();
    if (lastX >= oriX && lastX <= oriW && lastY >= oriY && lastY <= oriH) {
      $(this).addClass("selected");
      gotit = true;
    } else {
      $(this).removeClass("selected");
    }
  });
  if (gotit) {
    $("#cardAvatar").addClass("focus");
  } else {
    $("#cardAvatar").removeClass("focus");
  }
};

var checkOrderStatus = function () {
  var gridElem = $(".contents > div.selected .gem_container");
  var tempNum = gridElem.find(">div.selected").attr("ans");
  var tempNumCard = $("#cardAvatar").attr("ans");
  if (tempNum == tempNumCard) {
    //right
    $(".sideTool > div.btn_replay").show();
    rootSoundEffect($chimes);

    var uniq = new Date().getTime();
    gridElem
      .find(">div.selected")
      .removeClass("selected")
      .addClass("bingo")
      .append(
        `<span class="smoke"><img src="./DATA/IMAGES/common/chimes.gif?uniq=${uniq}"/></span>`
      );
    $("#cardAvatar").remove();
    $(".cached")
      .removeClass("cached")
      .delay(800)
      .queue(function () {
        $(".smoke").remove();
        $(this).dequeue();
      });
  } else {
    //wrong
    rootSoundEffect($fail);
    var uniq = new Date().getTime();
    gridElem
      .find(">div.selected")
      .removeClass("selected")
      .append(
        `<span class="smoke"><img src="./DATA/IMAGES/common/smoke2.gif?uniq=${uniq}"/></span>`
      );
    $("#cardAvatar").remove();
    $(".cached")
      .removeClass("cached")
      .delay(800)
      .queue(function () {
        $(".smoke").remove();
        $(this).dequeue();
      });
  }
};

var checkAnswer = function (target) {
  var groups = target.parent().find(">span");
  var ansArr = [];
  var guessArr = [];
  groups.each(function () {
    ansArr.push($(this).attr("ans"));
    if ($(this).attr("guess")) {
      guessArr.push($(this).attr("guess"));
    }
  });
  ansArr.sort();
  guessArr.sort();
  console.log(ansArr, guessArr);
  if (JSON.stringify(ansArr) == JSON.stringify(guessArr)) {
    rootSoundEffect($chimes);
    var uniq = new Date().getTime();
    target
      .parent()
      .append(
        `<span class="smoke"><img src="./DATA/IMAGES/common/chimes.gif?uniq=${uniq}"/></span>`
      );
    $(".smoke")
      .delay(1500)
      .queue(function () {
        $(this).dequeue().remove();
      });
  }
};

var showAnswer = function (boolean) {
  if (boolean) {
    if ($(".contents > div.selected .gem_container").length > 0) {
      //任務一
      $(".contents > div.selected .gem_container > div")
        .removeClass("selected")
        .addClass("bingo");
    }
    if ($(".contents > div.selected .gem_container2").length > 0) {
      //任務二
      var colours = $(".contents > div.selected .colours").find(">div");
      $(".contents > div.selected .gem_container2 > div").each(function () {
        var dashes = $(this).find(">.dashes");
        dashes.addClass("selected");

        var piece = $(this).find(">span");
        for (var k = 0; k < piece.length; k++) {
          for (var i = 0; i < colours.length; i++) {
            if (piece.eq(k).attr("ans") == colours.eq(i).attr("ans")) {
              piece.eq(k).attr("guess", colours.eq(i).attr("ans"));
              piece.eq(k).css("background", "#" + colours.eq(i).attr("col"));
            }
          }
        }
      });
    }
    rootSoundEffect($help);
    $(".sideTool > div.btn_replay").show();
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
  elem.find(".cached").removeClass("cached");
  elem.find(".bingo").removeClass("bingo");
  elem.find(".disable").removeClass("disable");
  elem.find(".gem_container2 > div > span").css("background", "transparent");
  $(".sideTool > div.btn_answer").removeClass("active").show();
  //smoke effect
  $(".smoke").remove();
  $(".cardAvatar").remove();
};

var resetTool = function () {
  $(".sideTool > div").removeClass("active").hide();
};
