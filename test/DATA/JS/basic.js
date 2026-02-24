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
            $(".sideTool > div.btn_replay").show();
            $(".sideTool > div.btn_check").hide();
          } else {
            showAnswer(false);
            $(".sideTool > div.btn_replay").hide();
          }
        });

      $(".sideTool > div.btn_replay")
        .unbind()
        .bind("click", function () {
          $(".sideTool > div.btn_check").hide();
          $(".sideTool > div.btn_answer").removeClass("active");
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

/*
cards attr黏性位置座標sp : 接近位置放置時會主動靠齊的座標(多個, 以^區分)
cards attr參考答案座標ap : 解答的座標(只有一個)
cards attr直接解答座標fp : 放對會直接顯示正確的座標(多個, 以^區分)
cards attr所屬的群組group : 多個, 以^區分

.toys.noShuffle 卡片不隨機
.toys.toys_rectangle 卡片是滿版長方形,正確符號要放正中間(否則是玩具，符號會放在中下方)

.cards.repeat 卡片可以重複使用

.sensorArea.checkonchange 移動後馬上執行check

.sensorArea.nocheckbtn 不需要check

.simplyDrag : 單純移動的物件
*/

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
        `<div id="cardAvatar" class="cardAvatar"></div>`,
      );
      $($elem).clone().appendTo("#cardAvatar");
      //是否可以重複拖曳
      if (!$($elem).hasClass("repeat")) {
        $($elem).addClass("cached");
        //是否有正確位置參數fp
        if ($($elem).attr("fp") || $($elem).attr("sp") || $($elem).attr("ap")) {
          $($elem).addClass("semiTransparent");
        }
      }
      var caWidth = parseInt($($elem).css("width")) / stageRatioReal;
      var caHeight = parseInt($($elem).css("height")) / stageRatioReal;

      $("#cardAvatar").css("width", caWidth + "px");
      $("#cardAvatar").css("height", caHeight + "px");
    }
    //simply drag
    if ($($elem).hasClass("simplyDrag")) {
      lastPosX = $elem.offsetLeft;
      lastPosY = $elem.offsetTop;
    }
  }

  if (isDragging && $elem) {
    //drag clon card
    if ($($elem).hasClass("cards")) {
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
    //simply drag
    if ($($elem).hasClass("simplyDrag")) {
      var deltaContainerX = $("#module_wrapper").offset().left;
      var deltaContainerY = $("#module_wrapper").offset().top;
      $($elem).get(0).style.top = ev.deltaY / stageRatioReal + lastPosY + "px";
      $($elem).get(0).style.left = ev.deltaX / stageRatioReal + lastPosX + "px";
    }
  }

  if (ev.isFinal) {
    if ($($elem).hasClass("cards")) {
      var frameElem = $(".contents > div.selected .sensorArea").children();
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
              $(this).removeClass("cached semiTransparent positionBingo");
            }
          });
        $("#cardAvatar").remove();
      }
    }
    //simply drag
    if ($($elem).hasClass("simplyDrag")) {
      lastPosX = 0;
      lastPosY = 0;
    }
    //then
    isDragging = false;
    $elem = null;
  }
};

var checkCollision = function (ev) {
  var lastX = ev.center.x;
  var lastY = ev.center.y;
  var frameElem = $(".contents > div.selected .sensorArea").children();
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
  //是否有正確位置參數fp，正確的話會馬上告知
  if ($("#cardAvatar > div").attr("fp")) {
    var itemFP = $("#cardAvatar > div").attr("fp").split("^");
    var itemW = $("#cardAvatar").get(0).style.width;
    var itemH = $("#cardAvatar").get(0).style.height;
    var itemTop = $("#cardAvatar").get(0).style.top;
    var itemLeft = $("#cardAvatar").get(0).style.left;
    var gotRight = false;
    for (var k = 0; k < itemFP.length; k++) {
      var tempFP = itemFP[k].split(",");
      if (
        parseInt(itemTop) > parseInt(tempFP[0]) - parseInt(itemH) / 2 &&
        parseInt(itemTop) < parseInt(tempFP[0]) + parseInt(itemH) / 2 &&
        parseInt(itemLeft) > parseInt(tempFP[1]) - parseInt(itemW) / 2 &&
        parseInt(itemLeft) < parseInt(tempFP[1]) + parseInt(itemW) / 2
      ) {
        rootSoundEffect($correct);
        $("#cardAvatar").addClass("positionBingo right");
        $("#cardAvatar").get(0).style.top = tempFP[0] + "px";
        $("#cardAvatar").get(0).style.left = tempFP[1] + "px";
        var src1 = $("#cardAvatar").find("img").attr("src");
        $(".contents > div.selected")
          .find(".toys > div")
          .each(function () {
            if (src1 == $(this).find("img").attr("src")) {
              $(this).addClass("positionBingo");
            }
          });
        gotRight = true;
      }
    }
    if (!gotRight) {
      rootSoundEffect($pop);
    }
  } else {
    rootSoundEffect($pop);
  }

  //是否有黏性位置sp
  if ($("#cardAvatar > div").attr("sp")) {
    var itemSP = $("#cardAvatar > div").attr("sp").split("^");
    var itemW = $("#cardAvatar").get(0).style.width;
    var itemH = $("#cardAvatar").get(0).style.height;
    var itemTop = $("#cardAvatar").get(0).style.top;
    var itemLeft = $("#cardAvatar").get(0).style.left;
    console.log(itemTop + "," + itemLeft);
    var gotRight = false;
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
  //是否放對區域
  if (
    $("#cardAvatar > div").attr("group") &&
    $(".contents > div.selected .sensorArea > .selected").attr("group")
  ) {
    //取得物件所屬的groups
    var groups = $("#cardAvatar > div").attr("group").split("^");
    for (var j = 0; j < groups.length; j++) {
      if (
        $(".contents > div.selected .sensorArea > .selected").attr("group") ==
        groups[j]
      ) {
        $("#cardAvatar").addClass("right");
      }
    }
  }
  $("#cardAvatar").addClass(
    "s" + $(".contents > div.selected .sensorArea > .selected").index(),
  );
  //
  $("#cardAvatar")
    .unbind()
    .bind("click", function () {
      var src1 = $(this).find("img").attr("src");
      $(".contents > div.selected")
        .find(".toys > div")
        .each(function () {
          if (src1 == $(this).find("img").attr("src")) {
            $(this).removeClass("cached semiTransparent positionBingo");
          }
        });
      $(this).remove();
      rootSoundEffect($show);
    })
    .removeAttr("id")
    .addClass("cardAvatarDie")
    .css("pointer-events", "auto")
    .css("cursor", "pointer");
  //是否直接驗收
  if ($(".contents > div.selected .sensorArea").hasClass("checkonchange")) {
    $(".sideTool > div.btn_check").click();
  }
  //
  $(".sideTool > div.btn_replay").show();
  if (
    !$(".contents > div.selected .sensorArea").hasClass("checkonchange") &&
    !$(".contents > div.selected .sensorArea").hasClass("nocheckbtn")
  ) {
    $(".sideTool > div.btn_check").show();
  }
};

var showAnswer = function (boolean) {
  var sensors = $(
    ".contents > div.selected .photo,.contents > div.selected .word,.contents > div.selected .paragraph",
  );
  if (boolean) {
    //秀出答案
    sensors.addClass("selected");
    rootSoundEffect($help);
  } else {
    $(".sideTool > div.btn_replay").click();
  }
  ////dymamic function here
  withinShowAnswer(boolean);
};

var checkAnswer = function () {
  ////dymamic function here
  withinCheckAnswer();
};

var openContent = function (id) {
  resetAudio();
  resetTool();
  //20260204
  removeToggleAttachment();
  $(".contents > div")
    .eq(id)
    .addClass("selected")
    .siblings(".selected")
    .removeClass("selected");
  resetElem($(".contents > div.selected"));
};

var resetElem = function (elem) {
  elem.find(".selected").removeClass("selected");
  elem.find(".showAnswer").removeClass("showAnswer");
  elem.find(".cached").removeClass("cached");
  elem.find(".semiTransparent").removeClass("semiTransparent");
  elem.find(".positionBingo").removeClass("positionBingo");
  elem.find(".disable").removeClass("disable");
  elem.find(".simplyDrag").removeAttr("style");

  //smoke effect
  $(".smoke").remove();
  $(".resultIcon").remove();
  $(".cardAvatarDie").remove();
  //if has group
  if (elem.find(".group").length > 0) {
    elem.find(".group .item").eq(0).addClass("selected");
    if (elem.find(".group .item").length > 1) {
      elem.find(".navigation").remove();
      var nav = `
    <div class="navigation">
      <span class="btn prev" onclick="prevItem()"></span>
      <span class="page">1/${elem.find(".group .item").length}</span>
      <span class="btn next" onclick="nextItem()"></span>
    </div>`;
      elem.append(nav);
    } else {
      elem.find(".navigation").remove();
    }
  }
  //
  $(".sideTool > div.btn_answer").show();

  ////dymamic function here
  withinResetElem();
};

var prevItem = function () {
  var items = $(".contents > div.selected .group .item");
  var index = $(".contents > div.selected .group .item.selected").index();
  if (index > 0) {
    index--;
    items
      .eq(index)
      .addClass("selected")
      .siblings(".selected")
      .removeClass("selected");
    //update page
    $(".contents > div.selected .navigation .page").text(
      index + 1 + "/" + items.length,
    );
    rootSoundEffect($click);
  }
};
var nextItem = function () {
  var items = $(".contents > div.selected .group .item");
  var index = $(".contents > div.selected .group .item.selected").index();
  if (index < items.length - 1) {
    index++;
    items
      .eq(index)
      .addClass("selected")
      .siblings(".selected")
      .removeClass("selected");
    //update page
    $(".contents > div.selected .navigation .page").text(
      index + 1 + "/" + items.length,
    );
    rootSoundEffect($click);
  }
};

var resetTool = function () {
  $(".sideTool > div").removeClass("active").hide();
};

var bingo = function () {
  rootSoundEffect($chimes);
  var uniq = new Date().getTime();
  $("#module_wrapper").append(
    `<span class="resultIcon wow bounceIn" style="z-index:9998"><img src="./DATA/IMAGES/common/icon_right.png"/></span><span class="smoke" style="z-index:9999"><img src="./DATA/IMAGES/common/chimes2.gif?uniq=${uniq}"/></span>`,
  );
  $(".smoke")
    .delay(1500)
    .queue(function () {
      $(".resultIcon").remove();
      $(this).dequeue().remove();
    });
};

var toggleMeClass = (tar, classname) => {
  tar.toggleClass(classname);
  rootSoundEffect($key);
  $(".sideTool > div.btn_answer").removeClass("active");
  $(".sideTool > div.btn_replay").show();
};

var initCanvas = function (tar) {
  var newZoomRatio = stageRatioReal / stageRatioMain;
  var startX, startY;
  var ol = 0;
  var ot = 0;
  var intPoint = [0, 0];
  var isDraw = false;
  //setup size
  tar.find("canvas").attr("width", tar.width() / newZoomRatio / 2);
  tar.find("canvas").attr("height", tar.height() / newZoomRatio);
  //canvas
  var can = tar.find("canvas").get(0);
  var cw = tar.find("canvas").attr("width");
  var ch = tar.find("canvas").attr("height");
  var ctx = can.getContext("2d");
  ctx.strokeStyle = tar.attr("strokeColour")
    ? tar.attr("strokeColour")
    : "#1c9b64";
  ctx.lineWidth = tar.attr("lineWidth") ? tar.attr("lineWidth") : 2;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  // Mouse Down Event
  ["mousedown", "touchstart"].forEach(function (e) {
    can.addEventListener(e, function (event) {
      $(".sideTool > div.btn_erase").removeClass("active").show();
      isDraw = true;
      newZoomRatio = stageRatioReal / stageRatioMain;

      if (event.clientX) {
        startX = (event.clientX - tar.offset().left) / newZoomRatio - ol;
        startY = (event.clientY - tar.offset().top) / newZoomRatio - ot;
      } else {
        startX =
          (event.touches[0].clientX - tar.offset().left) / newZoomRatio - ol;
        startY =
          (event.touches[0].clientY - tar.offset().top) / newZoomRatio - ot;
      }
      intPoint = [startX, startY];
    });
  });

  // Mouse Move Event
  ["mousemove", "touchmove"].forEach(function (e) {
    can.addEventListener(e, function (event) {
      if (isDraw) {
        if (event.clientX) {
          drawLineBoard(
            startX,
            startY,
            (event.clientX - tar.offset().left) / newZoomRatio - ol,
            (event.clientY - tar.offset().top) / newZoomRatio - ot,
          );
        } else {
          drawLineBoard(
            startX,
            startY,
            (event.touches[0].clientX - tar.offset().left) / newZoomRatio - ol,
            (event.touches[0].clientY - tar.offset().top) / newZoomRatio - ot,
          );
        }
      }
    });
  });

  ["mouseup", "touchend"].forEach(function (e) {
    can.addEventListener(e, function (event) {
      //first dot
      if (intPoint[0] == startX && intPoint[1] == startY) {
        ctx.arc(startX, startY, ctx.lineWidth / 2, 0, 2 * Math.PI, false);
        ctx.fillStyle = ctx.strokeStyle;
        ctx.fill();
        ctx.closePath();
      }
      isDraw = false;
    });
  });

  ["mouseleave"].forEach(function (e) {
    can.addEventListener(e, function (event) {
      isDraw = false;
    });
  });

  function drawLineBoard(x, y, stopX, stopY) {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(stopX, stopY);
    ctx.closePath();
    ctx.stroke();
    startX = stopX;
    startY = stopY;
  }
};
