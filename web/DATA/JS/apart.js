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
      //init canvas
      $(".contents")
        .find(".puzzle")
        .each(function () {
          initCanvas($(this));
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

var clearCanvas = function (tar) {
  var can = tar.find("canvas").get(0);
  var cw = tar.find("canvas").attr("width");
  var ch = tar.find("canvas").attr("height");
  var ctx = can.getContext("2d");
  ctx.clearRect(0, 0, cw, ch);
};
var initCanvas = function (tar) {
  //canvas
  var can = tar.find("canvas").get(0);
  var cw = tar.find("canvas").attr("width");
  var ch = tar.find("canvas").attr("height");
  var ctx = can.getContext("2d");
  var isDraw = false;
  ctx.strokeStyle = "#1c9b64";
  ctx.lineWidth = 2;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  var startX, startY;
  var newZoomRatio = stageRatioReal / stageRatioMain;
  var ol = 0;
  var ot = 0;
  var intPoint = [0, 0];

  // Mouse Down Event
  ["mousedown", "touchstart"].forEach(function (e) {
    can.addEventListener(e, function (event) {
      $(".sideTool > div.btn_replay").removeClass("active").show();
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
            (event.clientY - tar.offset().top) / newZoomRatio - ot
          );
        } else {
          drawLineBoard(
            startX,
            startY,
            (event.touches[0].clientX - tar.offset().left) / newZoomRatio - ol,
            (event.touches[0].clientY - tar.offset().top) / newZoomRatio - ot
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

var goPuzzle = function (page) {
  //reset all puzzles
  $(".contents > div.selected").find(".selected").removeClass("selected");
  $(".contents > div.selected").find(".showAnswer").removeClass("showAnswer");
  $(".sideTool > div").removeClass("active").hide();
  //setup selected puzzle
  $(".contents > div.selected").find(".puzzle").eq(page).addClass("selected");
  if (
    $(".contents > div.selected").find(".puzzle").eq(page).find(".ans").length >
    0
  ) {
    $(".sideTool > div.btn_answer").removeClass("active").show();
  }
  clearCanvas($(".contents > div.selected").find(".puzzle.selected"));
};

var showAnswer = function (boolean) {
  if (boolean) {
    //秀出答案圖片
    $(".contents > div.selected .puzzle").addClass("showAnswer");
    //秀出次數答案
    $(".contents > div.selected .pattern > p span").text(
      $(".contents > div.selected .pattern").attr("ans")
    );
    $(".contents > div.selected .pattern").addClass("showAnswer");
  } else {
    $(".contents > div.selected .puzzle").removeClass("showAnswer");
    $(".contents > div.selected .pattern").removeClass("showAnswer");
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

var resetElem = function (elem) {
  elem.find(".showAnswer").removeClass("showAnswer");
  goPuzzle(0);
};

var resetTool = function () {
  $(".sideTool > div").removeClass("active").hide();
};
