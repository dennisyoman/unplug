$(document).ready(function () {
  //載入完成要執行init
  $("#main-panel")
    .unbind()
    .bind("compLoaded", function () {
      checkPanelBtns();
      //btn
      $(".btn_intro")
        .unbind()
        .bind("click", function () {
          resetPanelBtns("btn_intro");
          switchIntro();
          clickthen();
        });

      $(".btn_widget")
        .unbind()
        .bind("click", function () {
          $(this).toggleClass("active");
          if ($(this).hasClass("active")) {
            resetPanelBtns("btn_widget");
          }
          clickthen();
        });

      $(".btn_erasor")
        .unbind()
        .bind("click", function () {
          //clean painting
          $("#widget > .painting,#canvas-board > .canvas").remove();
          resetPanelBtns("btn_erasor");
          clickthen();
        });

      $(".btn_paletton")
        .unbind()
        .bind("click", function () {
          $(this).toggleClass("active");
          if ($(this).hasClass("active")) {
            resetPanelBtns("btn_paletton");
            $(".btn_brush").addClass("active");
            appendPainting(true);
          } else {
            $(".btn_brush").removeClass("active");
            appendPainting(false);
          }
          clickthen();
        });

      $(".btn_zoom")
        .unbind()
        .bind("click", function () {
          $(this).toggleClass("active");
          if ($(this).hasClass("active")) {
            resetPanelBtns("btn_zoom");
          }
          createZoomSensor();
        });

      $(".btn_box")
        .unbind()
        .bind("click", function () {
          $(this).toggleClass("active");
          if ($(this).hasClass("active")) {
            resetPanelBtns("btn_box");
            rootSoundEffect($show);
          } else {
            rootSoundEffect($good);
          }
        });

      $(".btn_focus")
        .unbind()
        .bind("click", function () {
          $(this).toggleClass("active");
          if ($(this).hasClass("active")) {
            resetPanelBtns("btn_focus");
            appendMasker(true);
          } else {
            appendMasker(false);
          }
          clickthen();
        });

      $(".btn_tag")
        .unbind()
        .bind("click", function () {
          resetPanelBtns("btn_tag");
          appendTag(true);

          clickthen();
        });

      //pen tool
      $(".pen_tool")
        .find("span.colour")
        .each(function () {
          $(this).css("background", $(this).attr("col"));
        });
      $(".pen_tool")
        .find("span")
        .unbind()
        .bind("click", function (e) {
          e.stopPropagation();
          if ($(this).hasClass("colour")) {
            $(this)
              .addClass("active")
              .siblings(".colour.active")
              .removeClass("active");
            //
            if ($(".pen_tool .size.active").length == 0) {
              $(".pen_tool .size.md").click();
            }
          } else if ($(this).hasClass("size")) {
            $(this)
              .addClass("active")
              .siblings(".size.active,.eraser.active")
              .removeClass("active");
          } else if ($(this).hasClass("eraser")) {
            $(this)
              .addClass("active")
              .siblings(".size.active")
              .removeClass("active");
          }
          clickthen();
          setPen();
        });
      //init
      $(this)
        .addClass("loaded")
        .delay(500)
        .queue(function () {
          //pen tool
          $(".pen_tool .colour").eq(0).click();
          $(".pen_tool .size.md").eq(0).click();
          $(this).dequeue();
        });
      //deactiveLoading();
    });
  //get unit title

  $(contentXML)
    .find("lesson")
    .each(function (k) {
      let ut = "";
      let ssid = $(this).attr("sid");
      let bbid = $(this).attr("bid");
      let llid = $(this).attr("lid");
      if (ssid == sid && bbid == bid && llid == lid) {
        $(this)
          .find("section")
          .each(function (i) {
            if (parseInt($(this).attr("section")) == parseInt(sectionID)) {
              ut = $(this).attr("name");
            }
          });
        let utArr = ut.split("/");
        $("#unit-title").html(
          utArr[0] + (utArr[1] ? "/ <span>" + utArr[1] + "</span>" : "")
        );
      }
    });
  //get user info
  $(".user-info .username").html(uName);
  $(".user-info .duedate").html(dueDate);
  $(".user-info .unitpath").html(sid + "-B" + bid + "-L" + lid + "-S" + uid);

  //check loading
  checkCompLoading("#main-panel");
});

//widget

var appendScorer = function (e) {
  e.stopPropagation();
  //pieceArr
  var pieceClass =
    pieceArr[$("#widget").children(".scorer").length % pieceArr.length];
  //
  if ($("#scorer").length < 1) {
    $("#widget").append(`<div id="scorer" class="scorer ${pieceClass}"/>`);
    $.getComponent(
      "./DATA/HTML/WIDGET/scorer.html",
      "#scorer",
      "",
      "",
      "",
      "",
      true
    );
  } else {
    console.log("點太快了`,急甚麼?");
  }
  //
};

var appendRoulette = function (e) {
  e.stopPropagation();

  if ($("#widget").children(".roulette").length < 1) {
    $("#widget").append(`<div id="roulette" class="roulette"/>`);
    $.getComponent(
      "./DATA/HTML/WIDGET/roulette.html",
      "#roulette",
      "",
      "",
      "",
      "",
      true
    );
  }
};

var appendFinger = function (e) {
  e.stopPropagation();

  if ($("#widget").children(".finger").length < 1) {
    $("#widget").append(`<div id="finger" class="finger"/>`);
    $.getComponent(
      "./DATA/HTML/WIDGET/finger.html",
      "#finger",
      "",
      "",
      "",
      "",
      true
    );
  }
};

var appendCountdown = function (e) {
  e.stopPropagation();

  if ($("#widget").children(".countdown").length < 1) {
    $("#widget").append(`<div id="countdown" class="countdown"/>`);
    $.getComponent(
      "./DATA/HTML/WIDGET/countdown.html",
      "#countdown",
      "",
      "",
      "",
      "",
      true
    );
  }
};

var appendCounter = function (e) {
  e.stopPropagation();

  if ($("#widget").children(".counter").length < 1) {
    $("#widget").append(`<div id="counter" class="counter"/>`);
    $.getComponent(
      "./DATA/HTML/WIDGET/counter.html",
      "#counter",
      "",
      "",
      "",
      "",
      true
    );
  }
};

var appendDice = function (e, type) {
  if (e != "") {
    e.stopPropagation();
  }
  if ($("#dice").length < 1) {
    switch (type) {
      case 1:
        if ($("#widget").children(".dice.red").length == 0) {
          $("#widget").append(`<div id="dice" class="dice red"/>`);
          $.getComponent(
            "./DATA/HTML/WIDGET/dice.html",
            "#dice",
            "",
            "",
            "",
            "",
            true
          );
        } else if ($("#widget").children(".dice.green").length == 0) {
          $("#widget").append(`<div id="dice" class="dice green"/>`);
          $.getComponent(
            "./DATA/HTML/WIDGET/dice.html",
            "#dice",
            "",
            "",
            "",
            "",
            true
          );
        }
        break;
      case 2:
        if ($("#widget").children(".dice.purple").length == 0) {
          $("#widget").append(`<div id="dice" class="dice purple"/>`);
          $.getComponent(
            "./DATA/HTML/WIDGET/dice.html",
            "#dice",
            "",
            "",
            "",
            "",
            true
          );
        } else if ($("#widget").children(".dice.yellow").length == 0) {
          $("#widget").append(`<div id="dice" class="dice yellow"/>`);
          $.getComponent(
            "./DATA/HTML/WIDGET/dice.html",
            "#dice",
            "",
            "",
            "",
            "",
            true
          );
        }
        break;
      case 3:
        if ($("#widget").children(".dice.blue").length == 0) {
          $("#widget").append(`<div id="dice" class="dice blue"/>`);
          $.getComponent(
            "./DATA/HTML/WIDGET/dice.html",
            "#dice",
            "",
            "",
            "",
            "",
            true
          );
        } else if ($("#widget").children(".dice.pink").length == 0) {
          $("#widget").append(`<div id="dice" class="dice pink"/>`);
          $.getComponent(
            "./DATA/HTML/WIDGET/dice.html",
            "#dice",
            "",
            "",
            "",
            "",
            true
          );
        }
      case 4:
        if ($("#widget").children(".dice.aan").length == 0) {
          $("#widget").append(`<div id="dice" class="dice aan"/>`);
          $.getComponent(
            "./DATA/HTML/WIDGET/dice.html",
            "#dice",
            "",
            "",
            "",
            "",
            true
          );
        }
        break;
    }
    $("#widget #dice").hide();
  } else {
    console.log("too fast");
  }
};

var createZoomSensor = function () {
  if ($("#widget").children("#zoomSensor").length < 1) {
    $("#widget").append(`<div id="zoomSensor" class="zoomSensor"/>`);

    trigZoomHammer();
  } else {
    $("#zoomSensor").remove();
  }
};

//zoom & box
var canvasCord;
var downCord = [];
var upCord = [];
var isZoomDragging = false;

////zoom

var trigZoomHammer = function () {
  //hammer
  var myElement = document.getElementById("zoomSensor");
  var mc = new Hammer(myElement);
  mc.get("pan").set({ threshold: 0, direction: Hammer.DIRECTION_ALL });
  mc.on("pan", function (ev) {
    handleZoomDrag(ev);
  });
};

var handleZoomDrag = function (ev) {
  var elem = ev.target;
  var newZoomRatio = stageRatioReal / stageRatioMain;
  if (!isZoomDragging && $(elem).hasClass("zoomSensor")) {
    isZoomDragging = true;

    downCord = [
      (ev.center.x - $("#root").offset().left) / newZoomRatio,
      (ev.center.y - $("#root").offset().top) / newZoomRatio,
    ];
    appendZoomer();

    //pre setup
    $(".world3D > .stage,.voc,.visible,.sideTool > *").each(function () {
      if ($(this).css("display") != "none") {
        $(this).hide().addClass("bi");
      }
    });
    $(".btn_zoom > div").each(function () {
      if ($(this).css("display") != "none") {
        $(this).hide();
      }
    });
  }
  if ($(elem).hasClass("zoomSensor")) {
    upCord = [
      (ev.center.x - $("#root").offset().left) / newZoomRatio,
      (ev.center.y - $("#root").offset().top) / newZoomRatio,
    ];
    //custom zoomer
    $("#zoomer").css("top", Math.min(downCord[1], upCord[1]) + "px");
    $("#zoomer").css("left", Math.min(downCord[0], upCord[0]) + "px");
    $("#zoomer").css("height", Math.abs(downCord[1] - upCord[1]) + "px");
    $("#zoomer").css("width", Math.abs(downCord[0] - upCord[0]) + "px");
    $("#zoomer").attr("ih", Math.abs(downCord[1] - upCord[1]));
    $("#zoomer").attr("iw", Math.abs(downCord[0] - upCord[0]));
  }

  if (ev.isFinal) {
    isZoomDragging = false;
    if (
      Math.abs(downCord[0] - upCord[0]) < 5 ||
      Math.abs(downCord[1] - upCord[1]) < 5
    ) {
      $("#zoomer").remove();
    } else {
      $("#zoomSensor").css("pointer-events", "none");
      renderZoomer();
      //inactive btn
      $(".btn_zoom").click();
    }
  }
};
////202512:
var renderZoomer = function () {
  if ($(".panel .btn_zoom").hasClass("boxable")) {
    $("#zoomer").addClass("collectable");
    $("#zoomer .eraseAll").remove();
    $("#zoomer .erase").remove();
    $("#zoomer .edit").remove();
    $("#zoomer .resizer").remove();
  } else {
    $("#zoomer .collect").remove();
  }

  var newZoomRatio = stageRatioReal / stageRatioMain;
  //custom zoomer
  $("#zoomer").css("top", Math.min(downCord[1], upCord[1]) + "px");
  $("#zoomer").css("left", Math.min(downCord[0], upCord[0]) + "px");
  $("#zoomer").css("height", Math.abs(downCord[1] - upCord[1]) + "px");
  $("#zoomer").css("width", Math.abs(downCord[0] - upCord[0]) + "px");
  $("#zoomer").attr("ih", Math.abs(downCord[1] - upCord[1]));
  $("#zoomer").attr("iw", Math.abs(downCord[0] - upCord[0]));
  //pre setup
  $(".wow.animated").removeClass("wow").removeClass("animated").addClass("wa");
  $(".wow").removeClass("wow").addClass("w");
  $("#root").css("overflow", "visible");
  $("*:not(.card,.card *)").addClass("noAni");
  $(".card.active:not(.flipback)").addClass("keepCardFace");
  $(".card.active.flipback").addClass("keepCardback");
  //

  $("#main").css({
    padding: "400px",
    "margin-top": "-400px",
    "margin-left": "-400px",
  });
  $("#main-keep").css({
    padding: "400px",
    "margin-top": "-400px",
    "margin-left": "-400px",
  });

  //flipback
  html2canvas(
    $("#root").get(0),
    //可以帶上寬高擷取你所需要的部分內容
    {
      x: Math.min(downCord[0], upCord[0]) * newZoomRatio,
      y: Math.min(downCord[1], upCord[1]) * newZoomRatio,
      width: Math.abs(downCord[0] - upCord[0]) * newZoomRatio,
      height: Math.abs(downCord[1] - upCord[1]) * newZoomRatio,
      scrollX: 0,
      scrollY: 0,
      scale: html2canvasScale,
    }
  ).then(function (canvas) {
    rootSoundEffect($pop);
    var ctx = canvas.getContext("2d");

    ctx.webkitImageSmoothingEnabled = true;
    ctx.mozImageSmoothingEnabled = true;
    ctx.imageSmoothingEnabled = true;
    $("#zoomer .canvas").css("transform", "scale(" + 1 / newZoomRatio + ")");
    //create a new canvas
    var newCanvas = document.createElement("canvas");
    newCanvas.width = canvas.width;
    newCanvas.height = canvas.height;

    $("#zoomer .canvas").empty().get(0).appendChild(canvas);

    $("#zoomer .drawer").empty().get(0).appendChild(newCanvas);

    //finalize
    $("#zoomer .overlay").remove();
    $("#zoomer")
      .addClass("active")
      .attr("id", "")
      .delay(80)
      .queue(function () {
        $(this).dequeue();
        makeDrawable($(this));
        makeDraggable($(this), false, $(this));
      });

    //after setup
    $(".wa").addClass("wow").addClass("animated").removeClass("wa");
    $(".w").addClass("wow").removeClass("w");
    $("#root").css("overflow", "hidden");
    $(".noAni").removeClass("noAni");
    $(".keepCardFace").removeClass("keepCardFace");
    $(".keepCardback").removeClass("keepCardback");
    $(".bi").show().removeClass("bi");
    $("#main").css({
      padding: "0px",
      "margin-top": "0px",
      "margin-left": "0px",
    });
    $("#main-keep").css({
      padding: "0px",
      "margin-top": "0px",
      "margin-left": "0px",
    });
  });
};

var makeDrawable = function (tar) {
  var can = tar.find(".drawer > canvas").get(0);
  var ctx = can.getContext("2d");
  var isDraw = false;
  ctx.strokeStyle = "#66ccff";
  ctx.lineWidth = 5 * html2canvasScale;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  var startX, startY;
  var _eraserWidth = 100;
  var intPoint = [0, 0];

  // Mouse Down Event
  ["mousedown", "touchstart"].forEach(function (e) {
    can.addEventListener(e, function (event) {
      isDraw = true;
      var tw = parseInt(tar.get(0).style.width) / parseInt(tar.attr("iw"));
      var th = parseInt(tar.get(0).style.height) / parseInt(tar.attr("ih"));

      if (event.clientX) {
        startX = ((event.clientX - tar.offset().left) * html2canvasScale) / tw;
        startY = ((event.clientY - tar.offset().top) * html2canvasScale) / th;
      } else {
        startX =
          ((event.touches[0].clientX - tar.offset().left) * html2canvasScale) /
          tw;
        startY =
          ((event.touches[0].clientY - tar.offset().top) * html2canvasScale) /
          th;
      }
      intPoint = [startX, startY];
    });
  });

  // Mouse Move Event
  ["mousemove", "touchmove"].forEach(function (e) {
    can.addEventListener(e, function (event) {
      var tw = parseInt(tar.get(0).style.width) / parseInt(tar.attr("iw"));
      var th = parseInt(tar.get(0).style.height) / parseInt(tar.attr("ih"));

      if (isDraw) {
        if (tar.find(".erase").hasClass("active")) {
          if (event.clientX) {
            ctx.clearRect(
              ((event.clientX - tar.offset().left) * html2canvasScale) / tw -
                _eraserWidth / 2,
              ((event.clientY - tar.offset().top) * html2canvasScale) / th -
                _eraserWidth / 2,
              _eraserWidth,
              _eraserWidth
            );
          } else {
            ctx.clearRect(
              ((event.touches[0].clientX - tar.offset().left) *
                html2canvasScale) /
                tw -
                _eraserWidth / 2,
              ((event.touches[0].clientY - tar.offset().top) *
                html2canvasScale) /
                th -
                _eraserWidth / 2,
              _eraserWidth,
              _eraserWidth
            );
          }
        } else {
          if (event.clientX) {
            drawLine(
              startX,
              startY,
              ((event.clientX - tar.offset().left) * html2canvasScale) / tw,
              ((event.clientY - tar.offset().top) * html2canvasScale) / th
            );
          } else {
            drawLine(
              startX,
              startY,
              ((event.touches[0].clientX - tar.offset().left) *
                html2canvasScale) /
                tw,
              ((event.touches[0].clientY - tar.offset().top) *
                html2canvasScale) /
                th
            );
          }
        }
      }
    });
  });

  ["mouseup", "touchend"].forEach(function (e) {
    can.addEventListener(e, function (event) {
      //first dot
      if (
        intPoint[0] == startX &&
        intPoint[1] == startY &&
        !tar.find(".erase").hasClass("active")
      ) {
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

  function drawLine(x, y, stopX, stopY) {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(stopX, stopY);
    ctx.closePath();
    ctx.stroke();
    startX = stopX;
    startY = stopY;
  }
};
////202512:
var appendZoomer = function () {
  if ($("#widget").children("#zoomer").length < 1) {
    $("#widget").append(`<div id="zoomer" class="zoomer"/>`);
    $("#zoomer").css("top", downCord[1] + "px");
    $("#zoomer").css("left", downCord[0] + "px");
    var zoomerHTML = `<div class="zoomer_wrapper">
            <div class="collect"></div>
            <span class="edit"></span>
            <span class="erase"></span>
            <span class="eraseAll"></span>
            <div class="drawer"></div>
            <div class="canvas"></div>
            <div class="overlay"></div>
            <span class="resizer lt" />
            <span class="resizer rt" />
            <span class="resizer lb" />
            <span class="resizer rb" />
          </div>`;
    $("#zoomer").html(zoomerHTML);
    //js
    $("#zoomer")
      .unbind()
      .bind("mousedown", function (e) {
        getHighestDepthWidget($(this));
      })
      .bind("touchstart", function (e) {
        getHighestDepthWidget($(this));
      });
    getHighestDepthWidget($("#zoomer"));

    $("#zoomer .edit")
      .unbind()
      .bind("click", function (e) {
        $(this).toggleClass("active").siblings(".erase").removeClass("active");

        if ($(this).hasClass("active")) {
          $(this).siblings(".eraseAll").addClass("active");
          $(this).siblings(".drawer").addClass("editable");
        } else {
          $(this).siblings(".eraseAll").removeClass("active");
          $(this).siblings(".drawer").removeClass("editable");
        }
      });
    $("#zoomer .erase")
      .unbind()
      .bind("click", function (e) {
        $(this).toggleClass("active").siblings(".edit").removeClass("active");
        if ($(this).hasClass("active")) {
          $(this).siblings(".drawer").addClass("editable");
          $(this).siblings(".eraseAll").addClass("active");
        } else {
          $(this).siblings(".eraseAll").removeClass("active");
          $(this).siblings(".drawer").removeClass("editable");
        }
      });
    $("#zoomer .eraseAll")
      .unbind()
      .bind("click", function (e) {
        $(this).removeClass("active");
        $(this).siblings(".edit").removeClass("active");
        $(this).siblings(".erase").removeClass("active");
        $(this).siblings(".drawer").removeClass("editable");
        //
        var clearTar = $(this).siblings(".drawer").find("canvas");
        var cctx = clearTar.get(0).getContext("2d");
        cctx.clearRect(0, 0, clearTar.attr("width"), clearTar.attr("height"));
      });
    $("#zoomer .collect")
      .unbind()
      .bind("click", function (e) {
        cloneCanvasIntoBox($(this).siblings(".canvas").find("canvas").get(0));
        $(this).parent().parent().remove();
      });
  }
};

//////202512:截圖
var boxCaptureMe = function (tar) {
  var newZoomRatio = stageRatioReal / stageRatioMain;
  appendZoomer();
  var $tar = $(tar);
  var $moduleWrapper = $("#root");

  // 使用 getBoundingClientRect 直接計算相對位置
  var tarRect = $tar[0].getBoundingClientRect();
  var moduleWrapperRect = $moduleWrapper[0].getBoundingClientRect();

  var tarX = (tarRect.left - moduleWrapperRect.left) / newZoomRatio;
  var tarY = (tarRect.top - moduleWrapperRect.top) / newZoomRatio;
  var tarWidth = tarRect.width / newZoomRatio;
  var tarHeight = tarRect.height / newZoomRatio;
  downCord = [tarX, tarY];
  upCord = [tarX + tarWidth, tarY + tarHeight];
  //
  renderZoomer();
};

//////202512:新增字串(attr:content)到box裡
var boxAddMe = function (tar) {
  var text = tar.attr("content").trim();
  var $item = $("<div>").addClass("canvas_item custom_canvas_item");
  $item.append(`<p>${text}</p>`);
  var $button_remove = $("<span>").addClass("button_remove");
  $item.prepend($button_remove);
  $(".canvas_list").prepend($item);
  $(".canvas_list").animate({ scrollTop: 0 }, 300);

  $item.find(".button_remove").click(function () {
    //刪除
    $item.remove();
    rootSoundEffect($show);
  });
  $item.find("p").click(function () {
    //新增到某處
    cloneItemFromBox($(this));
  });

  //打開panel
  if (!$(".btn_box").hasClass("active")) {
    $(".btn_box").click();
  }
  rootSoundEffect($pop);
};

//////202512:把canvas複製到box裡
var cloneCanvasIntoBox = function (canvas) {
  var newCanvas = document.createElement("canvas");
  newCanvas.width = canvas.width;
  newCanvas.height = canvas.height;
  var ctx = newCanvas.getContext("2d");
  ctx.drawImage(canvas, 0, 0);
  var $item = $("<div>").addClass("canvas_item");
  $(newCanvas).css({
    width: newCanvas.width / 10 + "px",
    height: newCanvas.height / 10 + "px",
  });
  $item.css({
    width: newCanvas.width / 10 + "px",
    height: newCanvas.height / 10 + "px",
  });
  $item.append(newCanvas);
  $item.append(newCanvas);
  //新增刪除按鈕
  var $button_remove = $("<span>").addClass("button_remove");
  $item.prepend($button_remove);
  $(".canvas_list").prepend($item);
  $(".canvas_list").animate({ scrollTop: 0 }, 300);

  $item.find(".button_remove").click(function () {
    //刪除
    $item.remove();
    rootSoundEffect($show);
  });
  $item.find("canvas").click(function () {
    //新增到某處
    cloneItemFromBox($(this));
  });

  //打開panel
  if (!$(".btn_box").hasClass("active")) {
    $(".btn_box").click();
  }
  rootSoundEffect($pop);
};
//////202512:把canvas或文字複製到box裡
var cloneItemFromBox = function (item) {
  var element = item.jquery ? item[0] : item;
  var isCanvas =
    element &&
    (element.tagName === "CANVAS" || element instanceof HTMLCanvasElement);
  console.log("tar is canvas:", isCanvas, item);

  var target =
    $("#main-keep > .main.selected").length > 0
      ? $("#main-keep > .main.selected")
      : $("#widget");

  if (isCanvas) {
    //開始clone canvas
    var newCanvas = document.createElement("canvas");
    newCanvas.width = element.width;
    newCanvas.height = element.height;
    newCanvas.getContext("2d").drawImage(element, 0, 0);

    var scaledWidth = newCanvas.width / 10;
    var scaledHeight = newCanvas.height / 10;
    var scaledSize = {
      width: scaledWidth + "px",
      height: scaledHeight + "px",
      left: "30%",
      top: "30%",
    };

    var $item = $("<div>")
      .addClass("canvas_item")
      .css(scaledSize)
      .append($(newCanvas).css(scaledSize));
  } else {
    //開始clone 文字
    var text = $(item).text();
    var initPosition = { left: "30%", top: "30%" };
    var $item = $("<div>")
      .addClass("canvas_item custom_canvas_item")
      .css(initPosition)
      .append($("<p>").text(text));
  }

  target.append($item);
  makeDraggable($item, false, $item);
  rootSoundEffect($pop);
};

////202512:輸入文字的canvas_item
var addCustomCanvas = function () {
  var $item = $("<div>").addClass("canvas_item custom_canvas_item");

  var text = window.prompt("請輸入要新增的文字：", "");
  if (text === null || text.trim() === "") {
    return; // 取消或空字串則不處理
  } else {
    rootSoundEffect($pop);
  }
  text = text.trim();

  $item.append(`<p>${text}</p>`);
  var $button_remove = $("<span>").addClass("button_remove");
  $item.prepend($button_remove);
  $(".canvas_list").prepend($item);
  $(".canvas_list").animate({ scrollTop: 0 }, 300);

  $item.find(".button_remove").click(function () {
    //刪除
    $item.remove();
    rootSoundEffect($show);
  });
  $item.find("p").click(function () {
    //新增到某處
    cloneItemFromBox($(this));
  });
};

//painting

var appendPainting = function (active) {
  if (active) {
    $("#canvas-board").clearQueue();
    canvasCord = [2400, 1280, 0, 0];
    if ($("#widget").children("#painting").length < 1) {
      $("#widget").append(`<div id="painting" class="painting"/>`);
      $.getComponent(
        "./DATA/HTML/WIDGET/painting.html",
        "#painting",
        "",
        "",
        "",
        "",
        true
      );
    }
  } else {
    $(".pen_tool").find("span.size.md").click();
    $("#painting").remove();
    clickthen();
  }
};

var appendMasker = function (active) {
  if (active) {
    if ($("#widget").children("#masker").length == 0) {
      $("#widget").append(`<div id="masker" class="masker"/>`);
      $.getComponent(
        "./DATA/HTML/WIDGET/masker.html",
        "#masker",
        "",
        "",
        "",
        "",
        true
      );
    }
  } else {
    $("#masker").remove();
  }
};

var appendTag = function (active) {
  if (active) {
    if ($("#widget").children("#tag").length == 0) {
      $("#widget").append(`<div id="tag" class="tag"/>`);
      $.getComponent(
        "./DATA/HTML/WIDGET/tag.html",
        "#tag",
        "",
        "",
        "",
        "",
        true
      );
    }
  }
};

var appendTagPicker = function (active) {
  if (active) {
    if ($("#widget").children("#tagPicker").length == 0) {
      $("#widget").append(`<div id="tagPicker" class="tagPicker"/>`);
      $.getComponent(
        "./DATA/HTML/WIDGET/tagPicker.html",
        "#tagPicker",
        "",
        "",
        "",
        "",
        true
      );
    }
  } else {
    $("#tagPicker").remove();
  }
};

//common

var resetPanelBtns = function (classname) {
  $("#main-panel .btn:not(.btn_bulb)").each(function (i) {
    if ($(this).hasClass("active") && !$(this).hasClass(classname)) {
      $(this).click();
    }
  });
};

var clickthen = function () {
  if (
    $(".btn_paletton").hasClass("active") ||
    $(".btn_brush").hasClass("active")
  ) {
    $("#canvas-board > .canvas").addClass("disabled");
    $("#painting").removeClass("disabled");
    if ($(".pen_tool .eraser").hasClass("active")) {
      $("#canvas-board").css("pointer-events", "auto");
    } else {
      $("#canvas-board").css("pointer-events", "none");
    }
  } else {
    $("#canvas-board > .canvas").removeClass("disabled");
    $("#painting").addClass("disabled");
    $("#canvas-board").css("pointer-events", "none");
  }
  //
  /*Dennis update 2022/1/14 start*/
  $("#canvas-board .canvas").removeClass("selected");
  $("#cbg").hide();
  $("#cba").hide();
  /*Dennis update 2022/1/14 end*/
};

var getHMS = function (timeM) {
  var HH = "0" + Math.floor(timeM / (60 * 60 * 1000));
  timeM -= HH * 60 * 60 * 1000;
  var MM = "0" + Math.floor(timeM / (60 * 1000));
  timeM -= MM * 60 * 1000;
  var SS = "0" + Math.floor(timeM / 1000);

  if (HH > 0) {
    return HH.substr(-2, 2) + "：" + MM.substr(-2, 2) + "：" + SS.substr(-2, 2);
  } else {
    return MM.substr(-2, 2) + "：" + SS.substr(-2, 2);
  }
  //return HH+"h:"+MM+"m";
};

var setPen = function () {
  var colour = $(".pen_tool").find("span.colour.active").attr("col");
  var stroke = $(".pen_tool").find("span.size.active").attr("value");
  $("#painting").attr("col", colour).attr("stroke", stroke);
  if ($(".pen_tool").find("span.eraser.active").length > 0) {
    $("#painting").addClass("disabled");
  } else {
    $("#painting").removeClass("disabled");
  }
};

var checkPanelBtns = function () {
  //關閉截圖功能
  if (
    $("#module_wrapper").hasClass("module_order") ||
    $("#module_wrapper").hasClass("module_flood") ||
    $("#module_wrapper").hasClass("module_ant")
  ) {
    $(".btn_zoom").addClass("disabled");
  } else {
    $(".btn_zoom").removeClass("disabled");
  }

  ////202512:修改zoom造型功能
  if ($("#module_wrapper").hasClass("module_story")) {
    $(".btn_zoom").addClass("boxable");
  } else {
    $(".btn_zoom").removeClass("boxable");
  }
  ////202512:開啟box功能
  if ($("#module_wrapper").hasClass("module_has_box")) {
    $(".btn_box").removeClass("disabled");
  } else {
    $(".btn_box").addClass("disabled").removeClass("active");
  }
};
