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
  rootSoundEffect($pop);
  $(".sideTool > div.btn_answer").removeClass("active");
  tar.toggleClass("done");
  //
  $(".contents > div.selected .pattern > p span").text(
    $(".contents > div.selected .sensors > span.done").length
  );
  $(".contents > div.selected .pattern").addClass("showAnswer");
};

var showAnswer = function (boolean) {
  if (boolean) {
    rootSoundEffect($help);
    //秀出答案圖片
    if ($(".contents > div.selected .puzzle").find(".ans").length > 0) {
      $(".contents > div.selected .puzzle").addClass("showAnswer");
    }
    //秀出重複區域
    $(".contents > div.selected .puzzle .sensors > span").addClass("done");
    //秀出次數答案
    $(".contents > div.selected .pattern > p span").text(
      $(".contents > div.selected .pattern").attr("ans")
    );
    $(".contents > div.selected .pattern").addClass("showAnswer");
  } else {
    $(".contents > div.selected .puzzle").removeClass("showAnswer");
    $(".contents > div.selected .pattern").removeClass("showAnswer");
    //重設重複區域
    $(".contents > div.selected .puzzle .sensors > span").removeClass("done");
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
    if ($($elem).hasClass("draggable")) {
      $("#module_wrapper").append(
        `<div id="pieceAvatar" class="pieceAvatar"></div>`
      );
      $($elem).clone().removeClass().addClass("piece").appendTo("#pieceAvatar");
    }
  }

  if (isDragging && $elem) {
    //drag clon card
    if ($($elem).hasClass("draggable")) {
      var deltaContainerX = $("#module_wrapper").offset().left;
      var deltaContainerY = $("#module_wrapper").offset().top;
      $("#pieceAvatar").get(0).style.top =
        Math.round(
          ev.center.y / stageRatioReal -
            deltaContainerY / stageRatioReal -
            $("#pieceAvatar").height() / stageRatioReal / 2
        ) + "px";
      $("#pieceAvatar").get(0).style.left =
        Math.round(
          ev.center.x / stageRatioReal -
            deltaContainerX / stageRatioReal -
            $("#pieceAvatar").width() / stageRatioReal / 2
        ) + "px";
      checkCollision(ev);
    }
  }

  if (ev.isFinal) {
    if ($($elem).hasClass("draggable")) {
      checkStatus();
    }
    //then
    isDragging = false;
    $elem = null;
  }
};

var checkCollision = function (ev) {
  var lastX = ev.center.x;
  var lastY = ev.center.y;
  var frameElem = $(".contents > div.selected .puzzle .sensors > span");
  frameElem.each(function () {
    var oriX = $(this).offset().left;
    var oriW = oriX + $(this).width();
    var oriY = $(this).offset().top;
    var oriH = oriY + $(this).height();
    var ans1 = $("#pieceAvatar > span").attr("src");
    var ans2 = $(this).attr("src");
    if (
      lastX >= oriX &&
      lastX <= oriW &&
      lastY >= oriY &&
      lastY <= oriH &&
      ans1 == ans2 &&
      !$(this).hasClass("done")
    ) {
      $(this)
        .addClass("selected")
        .siblings(".selected")
        .removeClass("selected");
    } else {
      $(this).removeClass("selected");
    }
  });
};

var checkStatus = function () {
  var selectedElem = $(
    ".contents > div.selected .puzzle .sensors > span.selected"
  );
  if (selectedElem.length > 0) {
    //有對應到
    rootSoundEffect($pop);
    selectedElem.removeClass("selected").addClass("done");
    //次數
    $(".contents > div.selected .pattern").addClass("showAnswer");
    $(".contents > div.selected .pattern > p span").text(
      $(".contents > div.selected .puzzle .sensors > span.done").length
    );

    //
    $(".sideTool > div.btn_replay").show();
  } else {
    rootSoundEffect($show);
  }
  $("#pieceAvatar").remove();
  //check end
  if (
    $(".contents > div.selected .puzzle .sensors > span").length ==
    $(".contents > div.selected .puzzle .sensors > span.done").length
  ) {
    console.log("complete");
  }
};

var switchSample = function (tar, repeat) {
  var newSRC = tar.attr("url");
  var target = $(".contents > div.selected .sample");
  var ansTarget = $(".contents > div.selected .pattern");
  var oldSRC = target.find("img").attr("src");
  if (newSRC != oldSRC) {
    target.find("img").attr("src", newSRC);
    ansTarget.addClass("showAnswer").find("p > span").text(repeat);
    tar.addClass("selected").siblings(".selected").removeClass("selected");
  } else {
    ansTarget.removeClass("showAnswer");
    tar.removeClass("selected");
    target.find("img").attr("src", target.attr("url"));
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
  elem.find(".showAnswer").removeClass("showAnswer");
  elem.find(".done").removeClass("done");
  elem.find(".selected").removeClass("selected");
  //
  if (elem.find(".ans").length > 0 || elem.find(".sensors").length > 0) {
    $(".sideTool > div.btn_answer").removeClass("active").show();
  }

  //sample
  var newSRC = elem.find(".sample").attr("url");
  var target = elem.find(".sample > img");
  target.attr("src", newSRC);

  //draggable elements
  $("#pieceAvatar").remove();
};

var resetTool = function () {
  $(".sideTool > div").removeClass("active").hide();
};
