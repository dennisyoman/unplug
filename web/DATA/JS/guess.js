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

      //init
      //增加卡片說明
      $("#module_wrapper .grids > div > div").each(function () {
        var tempTitle = $(this).attr("title");
        if (tempTitle && tempTitle != "") {
          $(this).append(`<p class="wow fadeIn">${tempTitle}</p>`);
        }
      });

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

var lowlaged = false;

var opanCanvas = function (tar, cw, ch) {
  //
  var cw = tar.find("canvas").attr("width");
  var ch = tar.find("canvas").attr("height");
  var canvasHTML = `
  <div id="drawer_wrapper" class="drawer_wrapper">
    <div class="drawer"><canvas width="${cw}" height="${ch}"></canvas></div>
    <div class="actions">
      <span class="cancel"><img src="./DATA/IMAGES/common/btn_close.png" /></span>
      <span class="eraseAll"><img src="./DATA/IMAGES/common/icon_erasor.png"
      /></span>
      <div class="draw_tool">
        <span class="colour" col="#FF0000"></span>
        <span class="colour" col="#FF9900"></span>
        <span class="colour" col="#FFCC00"></span>
        <span class="colour" col="#66CC66"></span>
        <span class="colour" col="#66CCFF"></span>
        <span class="colour" col="#9933CC"></span>
        <span class="colour" col="#FF0099"></span>
        <span class="colour" col="#993300"></span>
        <span class="colour" col="#000000"></span>
        <span class="colour" col="#CCCCCC"></span>
      </div>
      <span class="done"><img src="./DATA/IMAGES/common/btn_answer.png" /></span>
    </div>
  </div>`;
  $("#module_wrapper").append(canvasHTML);

  //canvas
  var can = $("#drawer_wrapper").find(".drawer > canvas").get(0);
  var ctx = can.getContext("2d");
  var isDraw = false;
  ctx.strokeStyle = "#333333";
  ctx.lineWidth = 2;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  var startX, startY;
  var newZoomRatio = stageRatioReal / stageRatioMain;
  var ol = (640 - cw) / 2;
  var ot = (360 - 40 - ch) / 2;
  var intPoint = [0, 0];

  $("#tar_focus").removeAttr("id");
  tar.attr("id", "tar_focus");

  //貼上原圖
  var tarCanvas = $("#tar_focus").find("canvas");
  var cctx = tarCanvas.get(0).getContext("2d");
  if (!isCanvasBlank(tarCanvas.get(0))) {
    ctx.drawImage(tarCanvas.get(0), 0, 0, cw, ch);
  }

  //JS
  //pen tool
  $("#module_wrapper .draw_tool")
    .find("span.colour")
    .each(function () {
      $(this).css("background", $(this).attr("col"));
    });
  $("#module_wrapper .draw_tool")
    .find("span.colour")
    .unbind()
    .bind("click", function (e) {
      e.stopPropagation();
      $(this)
        .addClass("active")
        .siblings(".colour.active")
        .removeClass("active");
      //
      ctx.strokeStyle = $(this).attr("col");
    })
    .eq(0)
    .click();
  $("#module_wrapper")
    .find(".cancel")
    .unbind()
    .bind("click", function () {
      $("#tar_focus").removeAttr("id");
      $("#drawer_wrapper").remove();
    });
  $("#module_wrapper")
    .find(".eraseAll")
    .unbind()
    .bind("click", function () {
      ctx.clearRect(0, 0, cw, ch);
    });
  $("#module_wrapper")
    .find(".done")
    .unbind()
    .bind("click", function () {
      if (!isCanvasBlank(can)) {
        cctx.clearRect(0, 0, cw, ch);
        cctx.drawImage(can, 0, 0, cw, ch);
        $("#tar_focus").addClass("drawed");
      } else {
        cctx.clearRect(0, 0, cw, ch);
        $("#tar_focus").removeClass("drawed");
      }
      //
      $("#tar_focus").removeAttr("id");
      $("#drawer_wrapper").remove();
    });

  // Mouse Down Event
  ["mousedown", "touchstart"].forEach(function (e) {
    can.addEventListener(e, function (event) {
      isDraw = true;
      newZoomRatio = stageRatioReal / stageRatioMain;

      if (event.clientX) {
        startX =
          (event.clientX - $(".drawer_wrapper").offset().left) / newZoomRatio -
          ol;
        startY =
          (event.clientY - $(".drawer_wrapper").offset().top) / newZoomRatio -
          ot;
      } else {
        startX =
          (event.touches[0].clientX - $(".drawer_wrapper").offset().left) /
            newZoomRatio -
          ol;
        startY =
          (event.touches[0].clientY - $(".drawer_wrapper").offset().top) /
            newZoomRatio -
          ot;
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
            (event.clientX - $(".drawer_wrapper").offset().left) /
              newZoomRatio -
              ol,
            (event.clientY - $(".drawer_wrapper").offset().top) / newZoomRatio -
              ot
          );
        } else {
          drawLineBoard(
            startX,
            startY,
            (event.touches[0].clientX - $(".drawer_wrapper").offset().left) /
              newZoomRatio -
              ol,
            (event.touches[0].clientY - $(".drawer_wrapper").offset().top) /
              newZoomRatio -
              ot
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

var openContent = function (id) {
  resetAudio();
  resetTool();
  $(".contents > div")
    .eq(id)
    .addClass("selected")
    .siblings(".selected")
    .removeClass("selected");
  resetElem($(".contents > div.selected"));
  //show side tool btn
  checkTool();
};

var resetElem = function (elem) {
  elem.find(".grids").show();
  elem.find(".grids-dots").remove();
  var eventsLength = elem.find(".grids > div").length - 2;
  var peopleLength = elem.find(".grids-people > div").length;
  if (eventsLength > 0 && peopleLength > 0) {
    var HTML = `<div class="grids-dots">
    <div class="events">`;
    for (var i = 0; i < eventsLength; i++) {
      HTML += `<div />`;
    }
    HTML += `</div>
    <div class="people">`;
    for (var i = 0; i < peopleLength; i++) {
      HTML += `<div />`;
    }
    HTML += `</div></div>`;
  }
  elem.find(".grids").after(HTML);

  //smoke effect
  $(".smoke").remove();
};

var checkTool = function () {};

var resetTool = function () {
  $(".sideTool > div").removeClass("active").hide();
};
