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
        `<div id="cardAvatar" class="cardAvatar"></div>`
      );
      $($elem).clone().appendTo("#cardAvatar");
      $($elem).addClass("cached");
      //是否有正確位置參數fp
      if ($($elem).attr("fp")) {
        $($elem).addClass("semiTransparent");
      }
      var caWidth = parseInt($($elem).css("width")) / stageRatioReal;

      $("#cardAvatar").css("width", caWidth + "px");
      $("#cardAvatar").css("height", caWidth + "px");
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
    if ($($elem).hasClass("cards")) {
      var frameElem = $(".contents > div.selected .sensorArea");
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
    //then
    isDragging = false;
    $elem = null;
  }
};

var checkCollision = function (ev) {
  var lastX = ev.center.x;
  var lastY = ev.center.y;
  var frameElem = $(".contents > div.selected .sensorArea");
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
  //是否有正確位置參數fp
  if ($("#cardAvatar > div").attr("fp")) {
    var itemFP = $("#cardAvatar > div").attr("fp").split(",");
    var itemW = $("#cardAvatar").get(0).style.width;
    var itemH = $("#cardAvatar").get(0).style.height;
    var itemTop = $("#cardAvatar").get(0).style.top;
    var itemLeft = $("#cardAvatar").get(0).style.left;
    console.log(itemTop, itemLeft);
    if (
      parseInt(itemTop) > parseInt(itemFP[0]) - parseInt(itemH) / 2 &&
      parseInt(itemTop) < parseInt(itemFP[0]) + parseInt(itemH) / 2 &&
      parseInt(itemLeft) > parseInt(itemFP[1]) - parseInt(itemW) / 2 &&
      parseInt(itemLeft) < parseInt(itemFP[1]) + parseInt(itemW) / 2
    ) {
      rootSoundEffect($correct);
      $("#cardAvatar").addClass("positionBingo");
      $("#cardAvatar").get(0).style.top = itemFP[0] + "px";
      $("#cardAvatar").get(0).style.left = itemFP[1] + "px";
      var src1 = $("#cardAvatar").find("img").attr("src");
      $(".contents > div.selected")
        .find(".toys > div")
        .each(function () {
          if (src1 == $(this).find("img").attr("src")) {
            $(this).addClass("positionBingo");
          }
        });
    } else {
      rootSoundEffect($pop);
    }
  } else {
    rootSoundEffect($pop);
  }
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
    .attr("id", "")
    .addClass("cardAvatarDie")
    .css("pointer-events", "auto")
    .css("cursor", "pointer");

  $(".sideTool > div.btn_replay").show();
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
  elem.find(".cached").removeClass("cached semiTransparent positionBingo");
  elem.find(".disable").removeClass("disable");
  //shuffle toy
  var toyArr = [];
  elem.find(".toys > div").each(function () {
    $(this).attr("ans", "").find("span").text("");
    toyArr.push($(this).clone());
  });
  shuffle(toyArr);
  elem.find(".toys").empty().hide();
  for (var i = 0; i < toyArr.length; i++) {
    elem.find(".toys").append(toyArr[i].clone());
  }
  elem
    .find(".toys")
    .delay(100)
    .queue(function () {
      $(this).show().dequeue();
    });
  $(".contain").remove();
  //smoke effect
  $(".smoke").remove();
  $(".cardAvatarDie").remove();
};

var resetTool = function () {
  $(".sideTool > div").removeClass("active").hide();
};

var bingo = function () {
  rootSoundEffect($correct);
};
