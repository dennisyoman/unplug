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
  //是否有正確位置參數fp
  if ($("#cardAvatar > div").attr("fp")) {
    var itemFP = $("#cardAvatar > div").attr("fp").split("^");
    var itemW = $("#cardAvatar").get(0).style.width;
    var itemH = $("#cardAvatar").get(0).style.height;
    var itemTop = $("#cardAvatar").get(0).style.top;
    var itemLeft = $("#cardAvatar").get(0).style.left;
    console.log(itemTop, itemLeft);
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
        $("#cardAvatar").addClass("positionBingo");
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
    console.log(itemTop, itemLeft);
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
    $("#cardAvatar > div").attr("group") ==
      $(".contents > div.selected .sensorArea > .selected").attr("group")
  ) {
    $("#cardAvatar").addClass("right");
  }
  $("#cardAvatar").addClass(
    "s" + $(".contents > div.selected .sensorArea > .selected").index()
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
    console.log("coc");
    $(".sideTool > div.btn_check").click();
  }
  //
  $(".sideTool > div.btn_replay").show();
  $(".sideTool > div.btn_check").show();
};

var showAnswer = function (boolean) {
  var containers = $(".contents > div.selected .sensorArea").children();
  var toys = $(".contents > div.selected .toys > .toy");
  if (boolean) {
    //秀出答案
    $(".contents > div.selected").find(".selected").removeClass("selected");
    $(".contents > div.selected")
      .find(".cached")
      .removeClass("cached semiTransparent positionBingo");
    $(".contents > div.selected").find(".disable").removeClass("disable");
    $(".cardAvatarDie").remove();
    rootSoundEffect($help);
    //排位子
    var ansArray = [];

    containers.each(function (index) {
      var deltaContainerX = $("#module_wrapper").offset().left;
      var deltaContainerY = $("#module_wrapper").offset().top;
      var oX = 5;
      var oY = 30;
      if ($(this).attr("oX")) oX = parseInt($(this).attr("oX"));
      if ($(this).attr("oY")) oY = parseInt($(this).attr("oY"));
      var oriX =
        $(this).offset().left / stageRatioReal -
        deltaContainerX / stageRatioReal;
      var oriW = $(this).width() / stageRatioReal;
      var oriY =
        $(this).offset().top / stageRatioReal -
        deltaContainerY / stageRatioReal;
      var oriH = $(this).height() / stageRatioReal;
      ansArray.push([]);
      for (var i = 0; i < toys.length; i++) {
        if (
          toys.eq(i).attr("group") &&
          $(this).attr("group") &&
          toys.eq(i).attr("group") == $(this).attr("group")
        ) {
          //
          toys.eq(i).addClass("cached");
          var caWidth = parseInt(toys.eq(i).css("width")) / stageRatioReal;

          if (oX + caWidth > oriW) {
            oX = 5;
            oY += caWidth;
          }
          ansArray[ansArray.length - 1].push(
            `<div class="cardAvatar cardAvatarDie" style="width:${caWidth}px;height:${caWidth}px;top:${
              oriY + oY
            }px;left:${oriX + oX}px;">${toys.eq(i).prop("outerHTML")}</div>`
          );
          //
          oX += caWidth;
        }
      }
    });

    for (var i = 0; i < ansArray.length; i++) {
      var itemsArr = ansArray[i];
      for (var k = 0; k < itemsArr.length; k++) {
        $("#module_wrapper").append(itemsArr[k]);
      }
    }
  } else {
    toys.removeClass("cached semiTransparent positionBingo");
    $(".cardAvatarDie").remove();
  }
};

var toggleHint = function (tar) {
  rootSoundEffect($key);
  tar.toggleClass("showAnswer");
};

var checkAnswer = function () {
  if ($(".cardAvatarDie:not('.right')").length > 0) {
    $(".cardAvatarDie:not('.right')").click();
    rootSoundEffect($stupid);
  } else {
    rootSoundEffect($correct);
  }
};

var showSpecificAnswer = function (str) {
  rootSoundEffect($help);
  //
  var arr = str.split(",");
  //取消錯誤的
  for (var i = 0; i < arr.length; i++) {
    var sid = parseInt(arr[i]);
    var tar = $(".cardAvatarDie.s" + sid);
    if (tar.length > 0) {
    }
    $(".cardAvatarDie.s" + sid + ":not('.right')").click();
  }
  //補上缺少的
  var containers = $(".contents > div.selected .sensorArea").children();
  var toys = $(".contents > div.selected .toys > .toy");
  var ansArray = new Array();
  for (var j = 0; j < arr.length; j++) {
    var sid = parseInt(arr[j]);
    if ($(".cardAvatarDie.s" + sid).length == 0) {
      //排位子
      containers.each(function (index) {
        if (sid == index) {
          var deltaContainerX = $("#module_wrapper").offset().left;
          var deltaContainerY = $("#module_wrapper").offset().top;
          var oX = 5;
          var oY = 30;
          if ($(this).attr("oX")) oX = parseInt($(this).attr("oX"));
          if ($(this).attr("oY")) oY = parseInt($(this).attr("oY"));
          var oriX =
            $(this).offset().left / stageRatioReal -
            deltaContainerX / stageRatioReal;
          var oriW = $(this).width() / stageRatioReal;
          var oriY =
            $(this).offset().top / stageRatioReal -
            deltaContainerY / stageRatioReal;
          var oriH = $(this).height() / stageRatioReal;
          ansArray.push([]);
          for (var i = 0; i < toys.length; i++) {
            if (
              toys.eq(i).attr("group") &&
              $(this).attr("group") &&
              toys.eq(i).attr("group") == $(this).attr("group")
            ) {
              //
              toys.eq(i).addClass("cached");
              var caWidth = parseInt(toys.eq(i).css("width")) / stageRatioReal;

              if (oX + caWidth > oriW) {
                oX = 5;
                oY += caWidth;
              }
              ansArray[ansArray.length - 1].push(
                `<div class="cardAvatar cardAvatarDie" style="width:${caWidth}px;height:${caWidth}px;top:${
                  oriY + oY
                }px;left:${oriX + oX}px;">${toys.eq(i).prop("outerHTML")}</div>`
              );
              //
              oX += caWidth;
            }
          }
        }
      });

      for (var i = 0; i < ansArray.length; i++) {
        var itemsArr = ansArray[i];
        for (var k = 0; k < itemsArr.length; k++) {
          $("#module_wrapper").append(itemsArr[k]);
        }
      }
    }
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
  elem.find(".showAnswer").removeClass("showAnswer");
  elem.find(".cached").removeClass("cached semiTransparent positionBingo");
  elem.find(".disable").removeClass("disable");
  //shuffle toy
  if (!elem.find(".toys").hasClass("noShuffle")) {
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
  $(".resultIcon").remove();
  $(".cardAvatarDie").remove();
  //
  $(".sideTool > div.btn_answer").show();
};

var resetTool = function () {
  $(".sideTool > div").removeClass("active").hide();
};

var bingo = function () {
  rootSoundEffect($correct);
  var uniq = new Date().getTime();
  $(".contents > div.selected")
    .find(".sensorArea")
    .append(
      `<span class="resultIcon wow bounceIn"><img src="./DATA/IMAGES/common/icon_right.png"/></span><span class="smoke"><img src="./DATA/IMAGES/common/chimes2.gif?uniq=${uniq}"/></span>`
    );
  $(".smoke")
    .delay(1500)
    .queue(function () {
      $(".resultIcon").remove();
      $(this).dequeue().remove();
    });
};
