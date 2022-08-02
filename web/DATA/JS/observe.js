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
        });

      //init
      //放上card-title欄位
      $("#module_wrapper .gridSlider").append(`<span class="card-title"/>`);
      //增加卡片說明
      $("#module_wrapper .grids > div > div").each(function () {
        var tempTitle = $(this).attr("title");
        if (tempTitle && tempTitle != "") {
          $(this).append(`<p class="wow fadeIn">${tempTitle}</p>`);
        }
      });
      //chart
      var ww = $("#module_wrapper .chart > .items").attr("w");
      var hh = $("#module_wrapper .chart > .items").attr("h");
      $("#module_wrapper .chart > .items span").each(function () {
        $(this)
          .css("width", ww + "px")
          .css("height", hh + "px")
          .css("line-height", hh + "px");
        $(this)
          .unbind()
          .bind("click", function () {
            if (!$(this).hasClass("cards")) {
              $(this).removeClass("wrong");
              if ($(this).hasClass("r")) {
                $(this).removeClass("r").addClass("w");
                rootSoundEffect($pop);
              } else if ($(this).hasClass("w")) {
                $(this).removeClass("w");
                rootSoundEffect($show);
              } else {
                $(this).addClass("r");
                rootSoundEffect($pop);
              }
              //sum up
              $(this).siblings(".sum").text($(this).parent().find(".w").length);
            }
          });
      });

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
    if ($elem == null) {
      define$Elem(ev);
    }
    //
    isDragging = false;
    $elem = null;
  });
  mc.on("pan", function (ev) {
    if ($elem == null) {
      define$Elem(ev);
    }

    if ($(".contents > div.selected .chart").length > 0) {
      handleDragChart(ev);
    } else {
      handleDrag(ev);
    }
  });
};

var handleDrag = function (ev) {
  if (!isDragging && $elem != null) {
    $(".contents > div.selected .grids > div").removeClass(
      "afterward backward"
    );
    isDragging = true;

    if ($($elem).hasClass("cards")) {
      $("#module_wrapper").append(
        `<div id="cardAvatar" class="cardAvatar"></div>`
      );
      $($elem).clone().appendTo("#cardAvatar");
      $($elem).addClass("cached");
      var caWidth =
        parseInt($(".contents > div.selected .grids .cardItem").css("width")) /
        stageRatioReal;
      $("#cardAvatar")
        .css("width", caWidth + "px")
        .attr("num", $($elem).parent().index());
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
      var frameElem = $(".contents > div.selected .grids > div");
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
  var frameElem = $(".contents > div.selected .grids > div");
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

var handleDragChart = function (ev) {
  if (!isDragging && $elem != null) {
    isDragging = true;

    if ($($elem).hasClass("cards")) {
      $("#module_wrapper").append(
        `<div id="cardAvatar" class="numAvatar">${$($elem).attr("cid")}</div>`
      );
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
      checkCollisionChart(ev);
    }
  }

  if (ev.isFinal) {
    if ($($elem).hasClass("cards")) {
      var frameElem = $(".contents > div.selected .frames > div");
      var gotit = false;
      frameElem.each(function () {
        if ($(this).hasClass("selected")) {
          gotit = true;
        }
      });
      //checkCollision true
      if (gotit) {
        //check order status
        $(".contents > div.selected .frames > div.selected")
          .text($("#cardAvatar").text())
          .removeClass("selected");
        rootSoundEffect($key);
      } else {
        rootSoundEffect($show);
      }
      $("#cardAvatar").remove();
    }
    //then
    isDragging = false;
    $elem = null;
  }
};

var checkCollisionChart = function (ev) {
  var lastX = ev.center.x;
  var lastY = ev.center.y;
  var frameElem = $(".contents > div.selected .frames > div");
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
  var gridElem = $(".contents > div.selected .grids");
  var fromOrder = parseInt($("#cardAvatar").attr("num"));
  var toOrder = gridElem.find(">div.selected").index();
  $("#cardAvatar").remove();
  $(".cached").removeClass("cached");
  gridElem.find(">div.selected").removeClass("selected");
  if (fromOrder != toOrder) {
    $(".sideTool > div.btn_answer").removeClass("active");
    //update order
    if (fromOrder > toOrder) {
      gridElem
        .find(">div")
        .eq(fromOrder)
        .insertBefore(gridElem.find(">div").eq(toOrder));
      gridElem.find(">div").each(function (index) {
        if (index > toOrder && index <= fromOrder) {
          $(this).addClass("backward");
        }
      });
    } else {
      gridElem
        .find(">div")
        .eq(fromOrder)
        .insertAfter(gridElem.find(">div").eq(toOrder));
      gridElem.find(">div").each(function (index) {
        if (index < toOrder && index >= fromOrder) {
          $(this).addClass("afterward");
        }
      });
    }
    rootSoundEffect($show);
    updateFrame();
  }
};

var showCompare = function (boolean, tar) {
  var selectedElem = $(".contents > div.selected");
  if (boolean) {
    //create slider
    playSeq = 0;

    selectedElem.find(".gridSlider > .storyline").append(tar.clone());
    selectedElem
      .find(".gridSlider > .storyline")
      .css("left", "-100px")
      .append(selectedElem.find(".frames .cardItem").clone());

    //
    selectedElem.find(".grids").hide();
    selectedElem
      .find(".gridSlider")
      .addClass("active")
      .find(".storyline >div")
      .removeClass("cards selected prevSlider nextSlider")
      .removeAttr("onclick");

    selectedElem.find(".card-title").text("圈出與右圖不一樣的地方");

    $(".sideTool > div.btn_answer").hide();
    $(".sideTool > div.btn_check").hide();
    $(".sideTool > div.btn_replay").hide();
    selectedElem.find(".frames").hide();
    ////click func
    //sync
    var avatar = selectedElem.find(".gridSlider > .storyline .cardItem").eq(0);
    avatar
      .find(".diff")
      .unbind()
      .bind("click", function () {
        $(this).toggleClass("active");
        if ($(this).hasClass("active")) {
          rootSoundEffect($right);
        } else {
          rootSoundEffect($show);
        }
        avatar
          .find(".diffAmount")
          .removeClass("wrong")
          .text(avatar.find(".diff.active").length);
        //origin
        tar.find(".diff").eq($(this).index()).toggleClass("active");
        tar
          .find(".diffAmount")
          .removeClass("wrong")
          .text(avatar.find(".diff.active").length);
      });
  } else {
    selectedElem.find(".grids").show();
    selectedElem
      .find(".gridSlider")
      .removeClass("active")
      .find(".storyline")
      .css("left", 0)
      .empty();
    $(".contents > div.selected .frames > div").removeClass("selected");

    //
    selectedElem.find(".frames").show();
    checkTool();
  }
};

var updateFrame = function () {
  var tempGrid = $(".contents > div.selected .grids");
  var tempFrame = $(".contents > div.selected .frames");
  tempGrid.find(">div").each(function (index) {
    var tempAns = $(this).find("> div").attr("ans");
    tempFrame.find(">div").eq(index).text(tempAns);
  });
  resetFrame();
  //
  tempFrame.find(".cta").removeClass("disable");
};

var resetFrame = function () {
  $(".contents > div.selected .frames")
    .find(">div")
    .removeClass("wrong selected");
};

var showAnswer = function (boolean) {
  var selectedElem = $(".contents > div.selected");
  //frame
  if (selectedElem.find(".frames").length > 0) {
    if (boolean) {
      rootSoundEffect($help);
      //
      var originArr = [];
      selectedElem.find(".frames > div").each(function () {
        originArr.push($(this).attr("ans"));
      });

      var cardsArr = [];
      selectedElem.find(".grids > div").each(function () {
        cardsArr.push($(this).removeClass("afterward backward").clone());
      });
      selectedElem.find(".grids").empty();

      for (var i = 0; i < originArr.length; i++) {
        for (var k = 0; k < cardsArr.length; k++) {
          var tempElem = cardsArr[k];
          if (originArr[i] == tempElem.find(">div").attr("ans")) {
            console.log(tempElem.find(">div").attr("ans"));
            selectedElem.find(".grids").append(tempElem.clone());
            break;
          }
        }
      }
      //
      updateFrame();
    }
  }
  //frames.observe
  if (selectedElem.find(".frames.observe").length > 0) {
    if (boolean) {
      selectedElem.find(".grids > div").each(function () {
        var card = $(this).find(".cardItem");
        var diffs = card.find(".diff");
        var diffAmount = card.find(".diffAmount");
        diffs.addClass("active");
        diffAmount.removeClass("wrong").text(diffs.length);
      });
    }
  }

  //chart 代表沒有grid
  if (selectedElem.find(".chart").length > 0) {
    if (boolean) {
      //chart
      selectedElem.find(".chart > .items span").each(function () {
        if ($(this).hasClass("cards")) {
          //沒事發生
        } else if ($(this).hasClass("sum")) {
          $(this).text($(this).attr("ans"));
        } else {
          $(this).removeClass("r w wrong").addClass($(this).attr("ans"));
        }
      });
      //frames
      var tempFrame = $(".contents > div.selected .frames");
      tempFrame.find("> div").each(function () {
        $(this).text($(this).attr("ans"));
      });
    }
  }

  checkTool();
};

var checkAnswer = function () {
  var selectedElem = $(".contents > div.selected");
  //frame
  selectedElem.find(".frames > div").each(function () {
    var tempAns = $(this).attr("ans");
    var tempAns2 = $(this).text();
    if (tempAns != tempAns2) {
      $(this).addClass("wrong");
    } else {
      $(this).removeClass("wrong");
    }
  });
  //grid
  selectedElem.find(".grids > div").each(function () {
    var card = $(this).find(".cardItem");
    var diffs = card.find(".diff");
    var diffAmount = card.find(".diffAmount");
    if (diffs.length != parseInt(diffAmount.text())) {
      diffAmount.addClass("wrong");
    } else {
      diffAmount.removeClass("wrong");
    }
  });

  //chart
  selectedElem.find(".chart .items span").each(function () {
    if (!$(this).hasClass("cards")) {
      if (!$(this).hasClass("sum")) {
        if (!$(this).hasClass($(this).attr("ans"))) {
          $(this).addClass("wrong");
        } else {
          $(this).removeClass("wrong");
        }
      }
    }
  });

  //pesent result
  if (selectedElem.find(".wrong").length > 0) {
    rootSoundEffect($stupid);
  } else {
    rootSoundEffect($chimes);
    var uniq = new Date().getTime();
    selectedElem
      .find(".frames")
      .append(
        `<span class="resultIcon wow bounceInUp"><img src="./DATA/IMAGES/common/icon_right.png"/></span><span class="smoke"><img src="./DATA/IMAGES/common/chimes.gif?uniq=${uniq}"/></span>`
      );
    $(".smoke")
      .delay(1500)
      .queue(function () {
        $(".resultIcon").remove();
        $(this).dequeue().remove();
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
  //show side tool btn
  checkTool();
};

var resetElem = function (elem) {
  elem
    .find(".gridSlider")
    .removeClass("active")
    .find(".storyline")
    .css("left", 0)
    .empty();
  //reset grid to origin
  var originArr = [
    "A",
    "B",
    "C",
    "D",
    "E",
    "F",
    "G",
    "H",
    "I",
    "J",
    "K",
    "L",
    "M",
    "N",
    "O",
    "P",
    "Q",
    "R",
  ];

  if (elem.find(".grids").hasClass("decimal")) {
    originArr = [
      "1",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      "10",
      "11",
      "12",
      "13",
      "14",
      "15",
      "16",
      "17",
      "18",
    ];
  }
  var cardsArr = [];
  elem.find(".grids > div").each(function () {
    $(this).removeClass("afterward backward");
    cardsArr.push($(this).removeClass("selected").clone());
  });

  elem.find(".grids").empty();
  for (var i = 0; i < originArr.length; i++) {
    for (var k = 0; k < cardsArr.length; k++) {
      var tempElem = cardsArr[k];
      if (originArr[i] == tempElem.find(">div").attr("ans")) {
        elem.find(".grids").append(cardsArr[k]);
      }
    }
  }

  elem.find(".grids").show();
  //
  if (elem.find(".frames").length > 0) {
    updateFrame();
  }
  elem.find(".frames > .cta").show();

  //
  elem.find(".diff").removeClass("active");
  elem.find(".diffAmount").removeClass("wrong").text("");
  //chart 代表沒有grid
  if (elem.find(".chart").length > 0) {
    //chart
    elem.find(".chart > .items span").each(function () {
      if ($(this).hasClass("sum")) {
        $(this).text("");
      } else {
        $(this).removeClass("r w wrong");
      }
    });
    //frames
    elem.find(".frames").find("> div").text("");
  }
  $(".sideTool > div").removeClass("active");
  //smoke effect
  $(".smoke").remove();
  $(".resultIcon").remove();
};

var checkTool = function () {
  $(".sideTool > div.btn_answer").show();
  $(".sideTool > div.btn_replay").show();
  $(".sideTool > div.btn_check").show();
};

var resetTool = function () {
  $(".sideTool > div").removeClass("active").hide();
};
