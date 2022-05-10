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

var zCounte = 0;
var ansSeq = [];
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
    if ($($elem).hasClass("piece")) {
      $("#module_wrapper").append(
        `<div id="pieceAvatar" class="pieceAvatar"></div>`
      );
      $($elem).clone().appendTo("#pieceAvatar");
      $($elem).addClass("cached");
    }
  }

  if (isDragging && $elem) {
    //drag clon card
    if ($($elem).hasClass("piece")) {
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
    if ($($elem).hasClass("piece")) {
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
  var frameElem = $(".contents > div.selected .board .zone > .piece.disable");
  frameElem.each(function () {
    var oriX = $(this).offset().left;
    var oriW = oriX + $(this).width();
    var oriY = $(this).offset().top;
    var oriH = oriY + $(this).height();
    var ans1 = $("#pieceAvatar > span").attr("piece");
    var ans2 = $(this).attr("piece");
    if (
      lastX >= oriX &&
      lastX <= oriW &&
      lastY >= oriY &&
      lastY <= oriH &&
      ans1 == ans2
    ) {
      $(this)
        .addClass("selected")
        .siblings(".selected")
        .removeClass("selected");
      $("#pieceAvatar > span").get(0).style.transform =
        $(this).get(0).style.transform;
    } else {
      $(this).removeClass("selected");
    }
  });
};

var checkStatus = function () {
  var selectedElem = $(
    ".contents > div.selected .board .zone > .piece.selected"
  );
  if (selectedElem.length > 0) {
    //有對應到
    rootSoundEffect($pop);
    zCounte++;
    var tempElem = selectedElem.clone().removeClass("disable").addClass("done");
    tempElem.get(0).style.zIndex = zCounte;
    $(".contents > div.selected .board").append(tempElem);
    $(".cached").addClass("done").removeClass("cached");
    selectedElem.remove();
    //
    $(".sideTool > div.btn_replay").fadeIn();
    //
    ansSeq.push(selectedElem.attr("pid"));
  } else {
    $(".cached").removeClass("cached");
    rootSoundEffect($show);
  }
  $("#pieceAvatar").remove();
  //check end
  if (
    $(".contents > div.selected .pieces .piece").length ==
    $(".contents > div.selected .pieces .piece.done").length
  ) {
    var ans = $(".contents > div.selected .board").attr("ans");
    ans = ans.split("^");
    var bingo = false;
    var tempAns = ansSeq.join(",");
    for (var i = 0; i < ans.length; i++) {
      if (ans[i] == tempAns) {
        bingo = true;
      }
    }

    var top = $(".contents > div.selected .board .bgg").get(0).style.height;
    var left = $(".contents > div.selected .board .bgg").get(0).style.width;
    if (bingo) {
      $(".contents > div.selected .board").append(
        `<span class="smoke wow bounceIn" style="top:${
          parseInt(top) / 2
        }px;left:${
          parseInt(left) / 2
        }px;"><img src="./DATA/IMAGES/common/icon_right.png"/></span>`
      );
      rootSoundEffect($chimes);
    } else {
      $(".contents > div.selected .board").append(
        `<span class="smoke wow bounceIn" style="top:${
          parseInt(top) / 2
        }px;left:${
          parseInt(left) / 2
        }px;"><img src="./DATA/IMAGES/common/icon_wrong.png"/></span>`
      );
      rootSoundEffect($stupid);
    }
    $(".smoke")
      .delay(1500)
      .queue(function () {
        $(this).dequeue().remove();
      });
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
  zCounte = 0;
  ansSeq = [];
  $("#module_wrapper .cached").removeClass("cached");
  $("#module_wrapper .done").removeClass("done");
  $(".pieceAvatar").remove();
  //
  elem.find(".puzzle").find(".board").html(elem.find(".ref").html());
};

var resetTool = function () {
  $(".sideTool > div").removeClass("active").hide();
};
