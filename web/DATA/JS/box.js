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
      $(".sideTool > div.btn_playorder")
        .unbind()
        .bind("click", function () {
          $(this).toggleClass("active");
          if ($(this).hasClass("active")) {
            if ($("#cardAvatar").length < 1) {
              showAnimation(true);
            }
          }
        });

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
        `<div id="cardAvatar" class="cardAvatar"></div>`,
      );
      $($elem).clone().appendTo("#cardAvatar");
      $($elem).addClass("cached");
      var caWidth = parseInt($($elem).css("width")) / stageRatioReal;
      console.log(caWidth);
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
  }

  if (ev.isFinal) {
    if ($($elem).hasClass("cards")) {
      var frameElem = $(".contents > div.selected .boxes > div");
      var gotit = false;
      frameElem.each(function () {
        if ($(this).hasClass("selected")) {
          gotit = true;
        }
      });
      //checkCollision true
      if (gotit) {
        //check order status
        checkOrderStatus();
      } else {
        $("#cardAvatar").remove();
        $(".cached").removeClass("cached");
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
  var frameElem = $(".contents > div.selected .boxes > div");
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

var checkOrderStatus = function () {
  var gridElem = $(".contents > div.selected .boxes");
  var tempNum = gridElem.find(">div.selected").attr("size");
  var tempNumCard = $("#cardAvatar").find(">div").attr("size");
  if (tempNum >= tempNumCard) {
    //right
    rootSoundEffect($chimes);

    $("#cardAvatar > div").addClass("jumpin");
    $("#cardAvatar").attr("id", "").addClass("cardAvatarDie");
    var uniq = new Date().getTime();
    gridElem
      .find(">div.selected")
      .removeClass("selected")
      .append(
        `<span class="smoke"><img src="./DATA/IMAGES/common/chimes.gif?uniq=${uniq}"/></span>`,
      );
    $(".cached")
      .addClass("disable")
      .removeClass("cached")
      .delay(1000)
      .queue(function () {
        $(".smoke").remove();
        $(".cardAvatarDie").remove();
        $(this).dequeue();
        $(".sideTool > div.btn_replay").show();
      });
  } else {
    //wrong
    rootSoundEffect($fail);
    var uniq = new Date().getTime();
    gridElem
      .find(">div.selected")
      .removeClass("selected")
      .append(
        `<span class="smoke"><img src="./DATA/IMAGES/common/explode.gif?uniq=${uniq}"/></span>`,
      );
    $("#cardAvatar > div").addClass("flyout");
    $("#cardAvatar").attr("id", "").addClass("cardAvatarDie");
    $(".cached")
      .delay(1000)
      .queue(function () {
        $(".smoke").remove();
        $(".cardAvatarDie").remove();
        $(this).removeClass("cached").dequeue();
      });
  }
};

var toggleMe = function (elem) {
  rootSoundEffect($click);
  var range = $(".contents > div.selected > .boxes .box").length;
  var num = elem.attr("ans");
  if (num == "") {
    num = 1;
  } else {
    num = parseInt(num) + 1;
    if (num > range) {
      num = 1;
    }
  }
  elem.attr("ans", num).find("span").text(num);
  //check status
  var gotit = false;
  $(".contents > div.selected > .toys .toy").each(function () {
    if ($(this).attr("ans") == "") {
      gotit = true;
    }
  });
  if (!gotit) {
    $(".sideTool > div.btn_playorder").show();
  }
};

var showAnimation = function (boolean) {
  if (boolean) {
    animateBox();
  }
};

var animateBox = function () {
  var selectedElem = $(".contents > div.selected");
  var toys = selectedElem.find(".toys > .toy");
  var boxes = selectedElem.find(".boxes > .box");

  for (var i = 0; i < toys.length; i++) {
    var tar = toys.eq(i);
    var ans = tar.attr("ans");
    if (!tar.hasClass("disable")) {
      $("#module_wrapper").append(
        `<div id="cardAvatar" class="cardAvatar"></div>`,
      );
      var tar2 = tar.clone();
      tar2.find("span").remove();
      tar2.appendTo("#cardAvatar");
      tar.addClass("disable");
      var caWidth = parseInt(tar.css("width")) / stageRatioReal;
      $("#cardAvatar").css("width", caWidth + "px");
      $("#cardAvatar").css("height", caWidth + "px");
      //get box
      for (var k = 0; k < boxes.length; k++) {
        if (boxes.eq(k).attr("ans") == ans) {
          var tarBox = boxes.eq(k);
        }
      }
      //
      var deltaContainerX = $("#module_wrapper").offset().left;
      var deltaContainerY = $("#module_wrapper").offset().top;
      var intX = (tar.offset().left - deltaContainerX) / stageRatioReal;
      var intY = (tar.offset().top - deltaContainerY) / stageRatioReal;
      var desX =
        (tarBox.offset().left +
          tarBox.width() / 2 -
          $("#cardAvatar").width() / 2 -
          deltaContainerX) /
        stageRatioReal;
      var desY = (tarBox.offset().top - deltaContainerY) / stageRatioReal;
      $("#cardAvatar")
        .css({
          top: intY,
          left: intX,
        })
        .delay(50)
        .queue(function () {
          rootSoundEffect($show);
          $(this)
            .addClass("automove")
            .css({
              top: desY,
              left: desX,
            })
            .dequeue()
            .delay(800)
            .queue(function () {
              $(this).find(".toy").addClass("jumpin");
              rootSoundEffect($chimes);
              var uniq = new Date().getTime();
              tarBox.append(
                `<span class="smoke"><img src="./DATA/IMAGES/common/chimes.gif?uniq=${uniq}"/></span>`,
              );
              $(this)
                .dequeue()
                .delay(1000)
                .queue(function () {
                  $(".smoke").remove();
                  $("#cardAvatar").remove();
                  $(this).dequeue();
                  //continue?
                  if ($(".sideTool > div.btn_playorder").hasClass("active")) {
                    var doneToy = selectedElem.find(".toys > .toy.disable");
                    if (toys.length != doneToy.length) {
                      animateBox();
                    } else {
                      $(".sideTool > div.btn_playorder")
                        .removeClass("active")
                        .hide();
                      $(".sideTool > div.btn_replay").show();
                    }
                  }
                });
            });
        });
      break;
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
  elem.find(".cached").removeClass("cached");
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
  //smoke effect
  $(".smoke").remove();
  $(".cardAvatarDie").remove();
};

var resetTool = function () {
  $(".sideTool > div").removeClass("active").hide();
};
