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

      //build grid
      $(".grids > .row").each(function () {
        var size = $(this).attr("size");
        for (var i = 0; i < size; i++) {
          $(this).append(`<span style="width:${bw}px;height:${bh}px;"/>`);
        }
      });
      //resize blocks
      $(".blocks > div").each(function () {
        var size = $(this).attr("size");
        for (var i = 0; i < size; i++) {
          $(this)
            .find("img")
            .attr(
              "style",
              "width:" + parseInt(size) * bw + "px;height:" + bh + "px"
            );
        }
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
//
var bw = 35;
var bh = 28;
var buffer = 0;
var blockCount = 0;

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
  if (!isDragging && $elem != null && $("#cardAvatar").length < 1) {
    isDragging = true;
    if ($($elem).hasClass("draggable")) {
      $("#contents").append(`<div id="cardAvatar" class="cardAvatar"></div>`);
      $($elem).find(">img").clone().appendTo("#cardAvatar");
      $("#cardAvatar").attr("size", $($elem).attr("size"));
      //移動已放上的方塊
      if ($($elem).hasClass("onboard")) {
        //clean linked blocks and remove this
        var link = $($elem).attr("link");
        var gridElem = $(
          ".contents > div.selected .grids > .row > span.disable"
        );
        gridElem.each(function () {
          if (link == $(this).attr("link")) {
            $(this).removeAttr("link").removeClass("disable selected");
          }
        });
        $($elem).remove();
      }
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
      var gridElem = $(".contents > div.selected .grids");
      var rowElem = gridElem.find(">.row");
      var gridSelected = rowElem.find("> span.selected");

      //checkCollision true
      var tempSize = parseInt($("#cardAvatar").attr("size"));
      if (
        gridSelected.length == tempSize &&
        $(".contents > div.selected .grids > .row > span.selected.disable")
          .length < 1
      ) {
        //check order status
        checkOrderStatus();
      } else {
        //有觸發感應
        if (gridSelected.length > 0) {
          rootSoundEffect($surprise);
        } else {
          rootSoundEffect($show);
        }

        //fail place block
        gridSelected.removeClass("selected");

        var uniq = new Date().getTime();
        $("#cardAvatar").find("img").css("opacity", 0);
        $("#cardAvatar").append(
          `<span class="smoke"><img src="./DATA/IMAGES/common/smoke.gif?uniq=${uniq}"/></span>`
        );
        $("#cardAvatar")
          .delay(800)
          .queue(function () {
            $(this).remove().dequeue();
          });
      }
    }
    //then
    isDragging = false;
    $elem = null;
  }
};

var checkCollision = function (ev) {
  var lastW = parseInt($($elem).attr("size")) * bw * stageRatioReal;
  var lastX = ev.center.x - lastW / 2;
  var lastY = ev.center.y;

  var gridElem = $(".contents > div.selected .grids > .row > span");
  gridElem.each(function () {
    var oriX = $(this).offset().left;
    var oriW = $(this).width();
    var oriY = $(this).offset().top;
    var oriH = oriY + $(this).height();
    if (
      lastX < oriX + oriW / 2 - buffer &&
      lastX > oriX - lastW + oriW / 2 + buffer &&
      lastY >= oriY + buffer &&
      lastY <= oriH - buffer
    ) {
      $(this).addClass("selected");
    } else {
      $(this).removeClass("selected");
    }
  });
};

var checkOrderStatus = function () {
  //place the block
  blockCount += 1;
  var gridElem = $(".contents > div.selected .grids");
  var rowElem = gridElem.find(">.row");
  var gridSpan = rowElem.find("> span.selected");
  var intx = "";
  var inty = "";
  //gridElem.find("p").css("opacity", 0);
  $(".alert").remove();
  gridSpan.each(function () {
    if (intx == "") {
      intx = $(this).offset().left - $("#module_wrapper").offset().left;
      inty = $(this).offset().top - $("#module_wrapper").offset().top;
      $("#cardAvatar").get(0).style.top = inty / stageRatioReal + "px";
      $("#cardAvatar").get(0).style.left = intx / stageRatioReal + "px";
    }
    //
    $(this)
      .removeClass("selected")
      .addClass("disable")
      .attr("link", blockCount);
  });

  //有無重複的row
  var repeatRow = false;
  var rowComboArr = [];
  rowElem.each(function (index) {
    if ($(this).find(">span").length == $(this).find(">span.disable").length) {
      var currArray = [];
      for (var i = 0; i < $(this).find(">span").length; i++) {
        currArray.push($(this).find(">span").eq(i).attr("link"));
      }
      var NewArray = currArray.filter(function (element, index, self) {
        return index === self.indexOf(element);
      });
      for (var i = 0; i < currArray.length; i++) {
        for (var k = 0; k < NewArray.length; k++) {
          if (currArray[i] == NewArray[k]) {
            currArray[i] = k;
          }
        }
      }
      //
      var exsit = false;
      for (var i = 0; i < rowComboArr.length; i++) {
        if (currArray.join("^") == rowComboArr[i].join("^")) {
          exsit = true;
        }
      }

      if (!exsit) {
        rowComboArr.push(currArray);
      } else {
        repeatRow = true;
      }
    }
  });

  //
  if (!repeatRow) {
    $("#cardAvatar")
      .attr("link", blockCount)
      .removeAttr("id")
      .addClass("draggable onboard");

    //
    rootSoundEffect($pop);
    $(".sideTool > div.btn_replay").show();
    //確定是否完成
    if (
      gridElem.find(".row > span").length ==
      gridElem.find(".row > span.disable").length
    ) {
      rootSoundEffect($chimes);
      gridElem.append(
        `<span class="resultIcon wow bounceIn"><img src="./DATA/IMAGES/common/icon_right.png"/></span><span class="smoke"><img src="./DATA/IMAGES/common/chimes.gif?uniq=${uniq}"/></span>`
      );
      $(".smoke")
        .delay(1500)
        .queue(function () {
          $(".resultIcon").remove();
          $(this).dequeue().remove();
        });
    }
  } else {
    //gridElem.find("p").css("opacity", 1);
    var alert = `<p>兩列<b>不可以</b>使用一樣的組合方式<p>`;
    $(".contents > div.selected").append(
      `<div class="alert wow bounceInUp" onclick="$(this).remove()">${alert}</div>`
    );
    rootSoundEffect($surprise);
    //fail place block
    gridSpan.removeClass("selected disable");

    var uniq = new Date().getTime();
    $("#cardAvatar").find("img").css("opacity", 0);
    $("#cardAvatar").append(
      `<span class="smoke"><img src="./DATA/IMAGES/common/smoke.gif?uniq=${uniq}"/></span>`
    );
    $("#cardAvatar")
      .delay(800)
      .queue(function () {
        $(this).remove().dequeue();
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
  elem.find(".selected").removeClass("selected");
  elem.find(".disable").removeClass("disable");
  elem.find(".grids > .row > span").removeAttr("link");
  //elem.find("p").css("opacity", 1);
  $(".alert").remove();

  blockCount = 0;

  //smoke effect
  $(".smoke").remove();
  $(".resultIcon").remove();
  $(".cardAvatar").remove();
  //創造預設的方塊
  if (elem.find(".defaultBlocks").length > 0) {
    elem
      .find(".defaultBlocks")
      .find("span")
      .each(function () {
        blockCount += 1;
        //
        var dataArr = $(this).attr("buster").split(",");
        //指定位置
        var rowElem = elem.find(".grids > .row");
        var gridSpan = rowElem.find("> span.selected");
        var intx = "";
        var inty = "";
        var sr = parseInt(dataArr[1]) - 1;
        var sx = parseInt(dataArr[2]) - 1;
        var ss = parseInt(dataArr[0]);
        for (var k = sx; k < sx + ss; k++) {
          var tarSpan = rowElem.eq(sr).find("span").eq(k);
          tarSpan.addClass("disable").attr("link", blockCount);
          if (k == sx) {
            intx = tarSpan.offset().left - $("#module_wrapper").offset().left;
            inty = tarSpan.offset().top - $("#module_wrapper").offset().top;
          }
        }

        var tempBlock = `<div class="cardAvatar draggable onboard" size="${
          dataArr[0]
        }" link="${blockCount}" style="top: ${inty / stageRatioReal}px; left: ${
          intx / stageRatioReal
        }px;"><img src="./DATA/PT/BOOK1/IMAGES/block${
          dataArr[0]
        }.png" style="width:${bw * parseInt(dataArr[0])};height:${bh}"></div>`;
        //
        $("#contents").append(tempBlock);
      });
  }
};

var resetTool = function () {
  $(".sideTool > div").removeClass("active").hide();
};
