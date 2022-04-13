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

      $(".sideTool > div.btn_playorder")
        .unbind()
        .bind("click", function () {
          $(this).toggleClass("active");
          if ($(this).hasClass("active")) {
            showSlider(true);
          } else {
            showSlider(false);
          }
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
    $(".contents > div.selected .grids > div").removeClass(
      "afterward backward",
    );
    isDragging = true;
    if ($($elem).hasClass("cards")) {
      $("#module_wrapper").append(
        `<div id="cardAvatar" class="cardAvatar"></div>`,
      );
      $($elem).clone().appendTo("#cardAvatar");
      $($elem).addClass("cached");
      var caWidth =
        parseInt($(".contents > div.selected .grids .cardItem").css("width")) /
        stageRatioReal;
      $("#cardAvatar").css("width", caWidth + "px");
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

var checkOrderStatus = function () {
  var gridElem = $(".contents > div.selected .grids");
  var tempNum = gridElem.find(">div.selected >div").attr("ans");
  var tempNumCard = $("#cardAvatar").find(">div").attr("ans");
  $("#cardAvatar").remove();
  $(".cached").removeClass("cached");
  gridElem.find(">div.selected").removeClass("selected");
  if (tempNum != tempNumCard) {
    $(".sideTool > div.btn_answer").removeClass("active");
    //update order
    var fromOrder;
    var toOrder;
    gridElem.find(">div").each(function (index) {
      if ($(this).find("div").attr("ans") == tempNum) {
        toOrder = index;
      }
      if ($(this).find("div").attr("ans") == tempNumCard) {
        fromOrder = index;
      }
    });
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

var showSlider = function (boolean) {
  var selectedElem = $(".contents > div.selected");
  if (boolean) {
    //create slider
    playSeq = 0;
    if (selectedElem.find(".frames").length > 0) {
      selectedElem.find(".grids > div").each(function () {
        selectedElem
          .find(".gridSlider > .storyline")
          .append($(this).removeClass("afterward backward").html());
      });
      selectedElem.find(".frames > div").eq(0).addClass("selected");
    } else if (selectedElem.find(".framesMulti").length > 0) {
      if (selectedElem.find(".framesMulti.repeatAnswer").length == 0) {
        //單選答案
        selectedElem.find(".grids > div.selected").each(function () {
          selectedElem
            .find(".gridSlider > .storyline")
            .append($(this).removeClass("afterward backward").html());
        });
      } else {
        //複選答案
        selectedElem.find(".framesMulti > div").each(function () {
          var ans = $(this).attr("ans");
          var grids = selectedElem.find(".grids > div");
          for (var i = 0; i < grids.length; i++) {
            var tempAns = grids.eq(i).find(">div").attr("ans");
            if (ans == tempAns) {
              selectedElem
                .find(".gridSlider > .storyline")
                .append(grids.eq(i).removeClass("afterward backward").html());
            }
          }
        });
      }
      selectedElem.find(".framesMulti > div").eq(0).addClass("selected");
    } else {
      selectedElem.find(".grids > div").each(function () {
        selectedElem
          .find(".gridSlider > .storyline")
          .append($(this).removeClass("afterward backward").html());
      });
    }

    //
    selectedElem.find(".grids").hide();
    selectedElem
      .find(".gridSlider")
      .addClass("active")
      .find(".storyline >div")
      .removeClass("cards selected prevSlider nextSlider")
      .eq(playSeq)
      .addClass("selected")
      .next()
      .addClass("nextSlider");

    selectedElem.find(".gridSlider > .prev").addClass("disable");
    selectedElem.find(".gridSlider > .next").removeClass("disable");
    $(".sideTool > div.btn_answer").hide();
    selectedElem.find(".framesMulti > .cta").hide();
    selectedElem.find(".frames > .cta").hide();
  } else {
    selectedElem.find(".grids").show();
    selectedElem
      .find(".gridSlider")
      .removeClass("active")
      .find(".storyline")
      .css("left", 0)
      .empty();
    $(".contents > div.selected .frames > div").removeClass("selected");
    $(".contents > div.selected .framesMulti > div").removeClass("selected");
    $(".sideTool > div.btn_answer").show();
    //
    selectedElem.find(".framesMulti > .cta").show();
    selectedElem.find(".frames > .cta").show();
  }
};

var playSeq = 0;
var slideDistance = 220;
var slideDistanceLarge = 400;

var switchSlider = function (direction) {
  var selectedElem = $(".contents > div.selected");
  var storyline = selectedElem.find(".storyline");
  playSeq = playSeq + direction;
  selectedElem.find(".btn").removeClass("disable");
  rootSoundEffect($show);
  //first
  if (playSeq <= 0) {
    playSeq = 0;
    selectedElem.find(".btn.prev").addClass("disable");
  }
  //last
  if (playSeq >= storyline.find(">div").length - 1) {
    playSeq = storyline.find(">div").length - 1;
    selectedElem.find(".btn.next").addClass("disable");
  }

  storyline
    .css(
      "left",
      playSeq *
        (storyline.hasClass("lg") ? slideDistanceLarge : slideDistance) *
        -1 +
        "px",
    )
    .find(">div")
    .removeClass("selected prevSlider nextSlider")
    .eq(playSeq)
    .addClass("selected");

  selectedElem
    .find(".frames > div")
    .eq(playSeq)
    .addClass("selected")
    .siblings(".selected")
    .removeClass("selected");
  selectedElem
    .find(".framesMulti > div")
    .eq(playSeq)
    .addClass("selected")
    .siblings(".selected")
    .removeClass("selected");
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
var updateFrameMulti = function () {
  var tempFrame = $(".contents > div.selected .framesMulti");
  var full = true;
  tempFrame.find(">div").each(function (index) {
    if (!$(this).attr("ans")) {
      full = false;
    }
  });
  if (full) {
    tempFrame.find(".cta").removeClass("disable");
  } else {
    tempFrame.find(".cta").addClass("disable");
  }
};

var resetFrame = function () {
  $(".contents > div.selected .frames")
    .find(">div")
    .removeClass("wrong selected");
};

var resetFrameMulti = function () {
  //確定參考答案數量
  if ($(".contents > div.selected .framesMulti").attr("multiAns")) {
    var multiAnsArr = $(".contents > div.selected .framesMulti")
      .attr("multiAns")
      .split(";");
    $(".contents > div.selected .framesMulti").attr(
      "ans",
      multiAnsArr[Math.floor(Math.random() * multiAnsArr.length)],
    );
  }
  //依照答案數量分配格子
  $(".contents > div.selected .framesMulti").find("> div").remove();
  var ansArr = $(".contents > div.selected .framesMulti")
    .attr("ans")
    .split(",");
  for (var i = 0; i < ansArr.length; i++) {
    $(".contents > div.selected .framesMulti").prepend("<div />");
  }
};

var toggleMe = function (tar) {
  if ($(".contents > div.selected .grids").hasClass("mcq")) {
    //mcq = 單選題
    tar.parent().siblings(".selected").removeClass("selected");
    tar.parent().toggleClass("selected");
  } else {
    tar.parent().toggleClass("selected");
  }
  rootSoundEffect($pop);
  //
  var ansArr = $(".contents > div.selected .framesMulti")
    .attr("ans")
    .split(",");
  var count = ansArr.length;
  $(".contents > div.selected .framesMulti > div").remove();
  var cta = $(".contents > div.selected .framesMulti").find("> .cta");
  var selectedGrid = $(".contents > div.selected .grids > div.selected");
  selectedGrid.each(function () {
    $(
      `<div ans="${$(this).find(">div").attr("ans")}">${$(this)
        .find(">div")
        .attr("ans")}</div>`,
    ).insertBefore(cta);
    count--;
  });

  for (var k = 0; k < count; k++) {
    $(`<div></div>`).insertBefore(cta);
  }
  updateFrameMulti();

  //
  $(".sideTool > div.btn_answer").removeClass("active");
};

var showAnswer = function (boolean) {
  var selectedElem = $(".contents > div.selected");
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
  if (selectedElem.find(".framesMulti").length > 0) {
    //frames multi
    if (boolean) {
      rootSoundEffect($help);
      //
      var frame = selectedElem.find(".framesMulti");
      var ansArr = frame.attr("ans").split(",");
      frame.find(" > div").remove();
      var cta = frame.find("> .cta");
      for (var i = 0; i < ansArr.length; i++) {
        $(`<div ans="${ansArr[i]}">${ansArr[i]}</div>`).insertBefore(cta);
      }

      //
      if (selectedElem.find(".framesMulti.repeatAnswer").length == 0) {
        selectedElem.find(".grids > div").each(function () {
          var tempAns = $(this).find(">div").attr("ans");
          if (ansArr.indexOf(tempAns) == -1) {
            $(this).removeClass("selected");
          } else {
            $(this).addClass("selected");
          }
        });
      }
      //
      updateFrameMulti();
    }
  }
};

var checkAnswer = function () {
  var selectedElem = $(".contents > div.selected");
  selectedElem.find(".frames > div").each(function () {
    var tempAns = $(this).attr("ans");
    var tempAns2 = $(this).text();
    if (tempAns != tempAns2) {
      $(this).addClass("wrong");
    } else {
      $(this).removeClass("wrong");
    }
  });
  if (selectedElem.find(".frames > div.wrong").length > 0) {
    rootSoundEffect($stupid);
  } else {
    rootSoundEffect($chimes);
    var uniq = new Date().getTime();
    selectedElem
      .find(".frames")
      .append(
        `<span class="smoke"><img src="./DATA/IMAGES/common/chimes.gif?uniq=${uniq}"/></span>`,
      );
    $(".smoke")
      .delay(1500)
      .queue(function () {
        $(this).dequeue().remove();
      });
  }
};

var checkAnswerMulti = function () {
  var selectedElem = $(".contents > div.selected");
  var frame = selectedElem.find(".framesMulti");
  var ansArr = frame.attr("ans").split(",");
  frame.find("> div").each(function (index) {
    if (ansArr.indexOf($(this).attr("ans")) == -1) {
      $(this).addClass("wrong");
    } else {
      $(this).removeClass("wrong");
    }
  });
  if (frame.find("> div.wrong").length > 0) {
    rootSoundEffect($stupid);
  } else {
    rootSoundEffect($chimes);
    var uniq = new Date().getTime();
    selectedElem
      .find(".framesMulti")
      .append(
        `<span class="smoke"><img src="./DATA/IMAGES/common/chimes.gif?uniq=${uniq}"/></span>`,
      );
    $(".smoke")
      .delay(1500)
      .queue(function () {
        $(this).dequeue().remove();
      });
  }
};

var pickMe = function (tar) {
  var ans = tar.attr("ans");
  var cta = $(".contents > div.selected .framesMulti").find("> .cta");
  var selectedFrame = $(".contents > div.selected .framesMulti > div");
  selectedFrame.each(function () {
    if (!$(this).attr("ans")) {
      rootSoundEffect($pop);
      $(this).attr("ans", ans).text(ans);
      return false;
    }
  });
  //
  cta.removeClass("disable");
  $(".sideTool > div.btn_answer").removeClass("active");
};

var fixAnswer = function () {
  var cta = $(".contents > div.selected .framesMulti").find("> .cta");
  var selectedFrame = $(".contents > div.selected .framesMulti > div");
  for (var i = selectedFrame.length - 1; i >= 0; i--) {
    if (selectedFrame.eq(i).attr("ans")) {
      rootSoundEffect($pop);
      selectedFrame.eq(i).text("").removeAttr("ans");
      if (i == 0) {
        cta.addClass("disable");
      }
      break;
    }
  }

  $(".sideTool > div.btn_answer").removeClass("active");
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
  $(".sideTool > div.btn_playorder").show();
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
  var cardsArr = [];
  elem.find(".grids > div").each(function () {
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
  //
  if (elem.find(".framesMulti").length > 0) {
    resetFrameMulti();
    updateFrameMulti();
  }
  elem.find(".framesMulti > .cta").show();
  elem.find(".frames > .cta").show();

  //smoke effect
  $(".smoke").remove();
};

var resetTool = function () {
  $(".sideTool > div").removeClass("active").hide();
};
