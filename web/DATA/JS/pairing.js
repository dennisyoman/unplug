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
          resetElem($(".contents > div.selected"));
          $(".sideTool > div.btn_answer").removeClass("active");
        });
      //pallette
      $(".palette > div").each(function () {
        var tempAns = $(this).attr("ans");
        var tempHEX = $(this).attr("col");
        if (tempAns != "-1") {
          $(this)
            .append(`<span style="background:#${tempHEX}"></span>`)
            .addClass("n" + tempAns);
        } else {
          $(this)
            .addClass("erasor")
            .append(`<img src="./DATA/IMAGES/common/icon_erasor.png" />`);
        }
        $(this)
          .unbind()
          .bind("click", function () {
            if (!$(this).hasClass("selected")) {
              rootSoundEffect($pop);
              $(this)
                .addClass("selected")
                .siblings(".selected")
                .removeClass("selected");
            } else {
              $(this).removeClass("selected");
            }
          });
      });

      //pieces
      $(".pieces > span").each(function () {
        $(this)
          .addClass("draggable")
          .unbind()
          .bind("click", function () {
            var selectedElem = $(".contents > div.selected");
            var paletteElem = selectedElem.find(".palette");
            if (paletteElem.find(">div.selected").length > 0) {
              rootSoundEffect($show);
              if (paletteElem.find(">div.selected.erasor").length > 0) {
                $(this).removeAttr("col");
                $(this).css("background", "none");
              } else {
                $(this).attr(
                  "col",
                  paletteElem.find(">div.selected").attr("ans")
                );
                $(this).css(
                  "background",
                  "#" + paletteElem.find(">div.selected").attr("col")
                );
              }
            } else {
              rootSoundEffect($show);
              $(this).removeAttr("col");
              $(this).css("background", "none");
            }

            //
            $(".sideTool > div.btn_answer").removeClass("active");
            checkOrderStatus();
          });
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

  //create content
  if ($(".pieces.squares").length > 0) {
    var listArr = $(".pieces.squares").attr("list").split(",");
    var listColumn = parseInt($(".pieces.squares").attr("column"));
    var squareWidth = parseInt($(".pieces.squares").attr("sw"));
    var squareHeight = parseInt($(".pieces.squares").attr("sh"));
    for (var i = 0; i < listArr.length; i++) {
      $(".pieces.squares")
        .css("width", listColumn * squareWidth + "px")
        .append(
          `<span style="width:${squareWidth}px;height:${squareHeight}px;" ans="${listArr[i]}" />`
        );
    }
  }
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
var $elem = null;

var trigHammer = function () {
  //hammer
  var myElement = document.getElementById("contents");
  var mc = new Hammer(myElement);
  mc.get("pan").set({ direction: Hammer.DIRECTION_ALL });
  mc.on("pan", function (ev) {
    handleDrag(ev);
  });
};

var handleDrag = function (ev) {
  $elem = ev.target;
  var paletteElem = $(".contents > div.selected .palette");
  if ($($elem).hasClass("draggable")) {
    if ($("#module_wrapper").find(".brushAvatar").length == 0) {
      if (
        paletteElem.find(">div.selected").length > 0 &&
        paletteElem.find(">div.selected.erasor").length == 0
      ) {
        $("#module_wrapper").append(
          `<div id="brushAvatar" class="brushAvatar brush"><img src="./DATA/IMAGES/common/icon_brush.png" /><span style="background:#${paletteElem
            .find(">div.selected")
            .attr("col")}"/></div>`
        );
      } else {
        $("#module_wrapper").append(
          `<div id="brushAvatar" class="brushAvatar"><img src="./DATA/IMAGES/common/icon_erasor.png" /></div>`
        );
      }
    }
    var deltaContainerX = $("#module_wrapper").offset().left;
    var deltaContainerY = $("#module_wrapper").offset().top;
    $("#brushAvatar").get(0).style.top =
      Math.round(
        ev.center.y / stageRatioReal - deltaContainerY / stageRatioReal
      ) + "px";
    $("#brushAvatar").get(0).style.left =
      Math.round(
        ev.center.x / stageRatioReal - deltaContainerX / stageRatioReal
      ) + "px";
    //
    var selectedElem = $(".contents > div.selected");
    var paletteElem = selectedElem.find(".palette");
    if (paletteElem.find(">div.selected").length > 0) {
      if (paletteElem.find(">div.selected.erasor").length > 0) {
        $($elem).removeAttr("col");
        $($elem).css("background", "none");
      } else {
        $($elem).attr("col", paletteElem.find(">div.selected").attr("ans"));
        $($elem).css(
          "background",
          "#" + paletteElem.find(">div.selected").attr("col")
        );
      }
    } else {
      $($elem).removeAttr("col");
      $($elem).css("background", "none");
    }

    //
    $(".sideTool > div.btn_answer").removeClass("active");
    checkOrderStatus();
  } else {
    $(".brushAvatar").remove();
  }

  if (ev.isFinal) {
    $elem = null;

    $(".brushAvatar").remove();
  }
};

var checkOrderStatus = function () {
  //pieces
  var selectedElem = $(".contents > div.selected");
  var paletteElem = selectedElem.find(".palette");
  var pieceElem = selectedElem.find(".pieces");
  var gotit = false;
  pieceElem.find(">span").each(function () {
    if (!$(this).attr("col")) {
      gotit = true;
    }
  });
  if (gotit) {
    paletteElem.find(".cta").addClass("disable");
  } else {
    paletteElem.find(".cta").removeClass("disable");
  }
};

var showAnswer = function (boolean) {
  if (boolean) {
    rootSoundEffect($help);
    var selectedElem = $(".contents > div.selected");
    var paletteElem = selectedElem.find(".palette");
    var pieceElem = selectedElem.find(".pieces");
    pieceElem.find("> span").each(function () {
      var tempAns = $(this).attr("ans");
      var tempCol = "";
      for (var i = 0; i < paletteElem.find("> div").length; i++) {
        if (tempAns == paletteElem.find("> div").eq(i).attr("ans")) {
          tempCol = paletteElem.find("> div").eq(i).attr("col");
        }
      }
      $(this)
        .attr("col", tempAns)
        .css("background", "#" + tempCol);
    });
    checkOrderStatus();
  }
};

var checkAnswer = function () {
  var selectedElem = $(".contents > div.selected");
  var pieceElem = selectedElem.find(".pieces");
  var bingo = true;
  pieceElem.find("> span").each(function () {
    var tempAns = $(this).attr("ans");
    var tempCol = $(this).attr("col");
    if (tempAns != tempCol) {
      bingo = false;
      $(this).removeAttr("col").css("background", "none");
    }
  });
  if (bingo) {
    var uniq = new Date().getTime();
    selectedElem
      .find(".artboard")
      .append(
        `<div class="resultIcon wow bounceIn"><img src="./DATA/IMAGES/common/icon_right.png"/></div>
        <div class="resultIcon"><img src="./DATA/IMAGES/common/chimes.gif?uniq=${uniq}"/></div>`
      )
      .delay(1500)
      .queue(function () {
        $(".resultIcon").remove();
        $(this).dequeue();
      });
    rootSoundEffect($chimes);
  } else {
    rootSoundEffect($surprise);
    selectedElem
      .find(".artboard > *")
      .addClass("wrong")
      .delay(800)
      .queue(function () {
        rootSoundEffect($tryagain);
        selectedElem.find(".artboard > *").removeClass("wrong").dequeue();
      });
    checkOrderStatus();
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
  $(".sideTool > div.btn_answer").show();
  $(".sideTool > div.btn_replay").show();
};

var resetElem = function (elem) {
  $(".palette > div").removeClass("selected");
  $(".pieces > span").removeAttr("col").css("background", "none");
  $(".resultIcon").remove();
  checkOrderStatus();
};

var resetTool = function () {
  $(".sideTool > div").removeClass("active").hide();
};
