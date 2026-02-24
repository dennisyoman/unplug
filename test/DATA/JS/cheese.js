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

      $(".sideTool > div.btn_replay")
        .unbind()
        .bind("click", function () {
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

var lowlaged = false;

var initCanvas = function () {
  //canvas
  var can = $(".contents > div.selected").find("canvas").get(0);
  var cw = $(".contents > div.selected").find("canvas").attr("width");
  var ch = $(".contents > div.selected").find("canvas").attr("height");
  var ctx = can.getContext("2d");
  var isDraw = false;
  ctx.strokeStyle = "#ff0000";
  ctx.lineWidth = 1;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  var startX, startY;
  var newZoomRatio = stageRatioReal / stageRatioMain;
  var ol = (640 - cw) / 2;
  var ot = (360 - 40 - ch) / 2;
  var intPoint = [0, 0];

  //JS
  // Mouse Down Event
  $(".contents > div.selected")
    .find(".sensor")
    .each(function () {
      var sensor = $(this).get(0);
      ["mousedown", "touchstart"].forEach(function (e) {
        sensor.addEventListener(e, function (event) {
          if (
            $(".contents > div.selected").find(".btn_draw").hasClass("active")
          ) {
            isDraw = true;
          }
          //透過洞
          if ($(sensor).hasClass("hole") && !$(sensor).hasClass("poked")) {
            isDraw = false;
          }
          newZoomRatio = stageRatioReal / stageRatioMain;

          if (event.clientX) {
            startX =
              (event.clientX - $("#contents").offset().left) / newZoomRatio -
              ol;
            startY =
              (event.clientY - $("#contents").offset().top) / newZoomRatio - ot;
          } else {
            startX =
              (event.touches[0].clientX - $("#contents").offset().left) /
                newZoomRatio -
              ol;
            startY =
              (event.touches[0].clientY - $("#contents").offset().top) /
                newZoomRatio -
              ot;
          }
          intPoint = [startX, startY];
        });
      });

      // Mouse Move Event
      ["mousemove", "touchmove"].forEach(function (e) {
        sensor.addEventListener(e, function (event) {
          if (isDraw) {
            if (event.clientX) {
              drawLineBoard(
                startX,
                startY,
                (event.clientX - $("#contents").offset().left) / newZoomRatio -
                  ol,
                (event.clientY - $("#contents").offset().top) / newZoomRatio -
                  ot,
              );
            } else {
              drawLineBoard(
                startX,
                startY,
                (event.touches[0].clientX - $("#contents").offset().left) /
                  newZoomRatio -
                  ol,
                (event.touches[0].clientY - $("#contents").offset().top) /
                  newZoomRatio -
                  ot,
              );
            }
          }
        });
      });

      ["mouseup", "touchend"].forEach(function (e) {
        sensor.addEventListener(e, function (event) {
          //first dot
          if (intPoint[0] == startX && intPoint[1] == startY) {
            if (isDraw) {
              ctx.arc(startX, startY, ctx.lineWidth / 2, 0, 2 * Math.PI, false);
              ctx.fillStyle = ctx.strokeStyle;
              ctx.fill();
              ctx.closePath();
            } else {
              //戳洞
              if ($(sensor).hasClass("hole") && !$(sensor).hasClass("poked")) {
                pokeHole($(sensor));
              }
            }
          }
          isDraw = false;
        });
      });

      ["mouseleave"].forEach(function (e) {
        sensor.addEventListener(e, function (event) {
          isDraw = false;
        });
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

var clearCanvas = function () {
  $(".contents > div.selected")
    .find("canvas")
    .get(0)
    .getContext("2d")
    .clearRect(
      0,
      0,
      $(".contents > div.selected").find("canvas").attr("width"),
      $(".contents > div.selected").find("canvas").attr("height"),
    );
};

var toggleCheese = function () {
  $(".contents > div.selected").find(".btn_cheese").toggleClass("active");
  if ($(".contents > div.selected").find(".btn_cheese").hasClass("active")) {
    $(".contents > div.selected").find(".encryption").addClass("active");
  } else {
    $(".contents > div.selected").find(".encryption").removeClass("active");
  }
  rootSoundEffect($show);
};

var pokeHole = function (hole) {
  if ($(".contents > div.selected").find(".btn_poke").hasClass("active")) {
    hole.addClass("poked");
    rootSoundEffect($pop);
  }
};

var togglePoke = function () {
  $(".contents > div.selected").find(".btn_poke").toggleClass("active");
  $(".contents > div.selected").find(".btn_draw").removeClass("active");
  rootSoundEffect($key);
};

var toggleDraw = function () {
  $(".contents > div.selected").find(".btn_draw").toggleClass("active");
  $(".contents > div.selected").find(".btn_poke").removeClass("active");
  rootSoundEffect($key);
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

  //init canvas
  initCanvas();
};

var resetElem = function (elem) {
  elem.find(".selected").removeClass("selected");
  elem.find(".done").removeClass("done");
  elem.find(".poked").removeClass("poked");
  elem.find(".active").removeClass("active");
  //canvas
  clearCanvas();
  //actions
  elem.find(".btn_cheese").click();
};

var resetTool = function () {
  $(".sideTool > div").removeClass("active").show();
};
