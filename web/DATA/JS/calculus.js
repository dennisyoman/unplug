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
          //
          $(".alert").remove();
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
          //
          $(".alert").remove();
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

    selectedElem
      .find(".card-title")
      .text(
        selectedElem.find(".storyline").find(">div.selected").attr("title")
      );

    selectedElem.find(".gridSlider > .prev").addClass("disable");
    selectedElem.find(".gridSlider > .next").removeClass("disable");
    $(".sideTool > div.btn_answer").hide();
    selectedElem.find(".framesMulti > .cta").hide();
    selectedElem.find(".frames > .cta").hide();
    //
    if (selectedElem.find(".gridSlider > .storyline > div").length <= 1) {
      selectedElem.find(".gridSlider > .prev").hide();
      selectedElem.find(".gridSlider > .next").hide();
    } else {
      selectedElem.find(".gridSlider > .prev").show();
      selectedElem.find(".gridSlider > .next").show();
    }
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

    //
    checkTool();
    selectedElem.find(".framesMulti > .cta").show();
    selectedElem.find(".frames > .cta").show();
  }
};

var slideToMe = function (target) {
  /*
  $(".sideTool > div.btn_playorder").click();
  var selectedElem = $(".contents > div.selected");
  var cards = selectedElem.find(".gridSlider > .storyline > div");
  cards.each(function (index) {
    var tempSrc1 = $(this).find("img").attr("src");
    var tempSrc2 = target.find("img").attr("src");
    if (tempSrc1 == tempSrc2) {
      switchSlider(index);
    }
  });*/
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
        "px"
    )
    .find(">div")
    .removeClass("selected prevSlider nextSlider")
    .eq(playSeq)
    .addClass("selected");

  selectedElem
    .find(".card-title")
    .text(storyline.find(">div.selected").attr("title"));

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
      multiAnsArr[Math.floor(Math.random() * multiAnsArr.length)]
    );
  }
  //依照參考答案數量分配格子
  $(".contents > div.selected .framesMulti").find("> div").remove();
  if ($(".contents > div.selected .framesMulti").attr("freeanswer")) {
    for (
      var i = 0;
      i <
      parseInt($(".contents > div.selected .framesMulti").attr("freeanswer"));
      i++
    ) {
      $(".contents > div.selected .framesMulti").prepend("<div />");
    }
  } else {
    var ansArr = $(".contents > div.selected .framesMulti")
      .attr("ans")
      .split(",");
    for (var i = 0; i < ansArr.length; i++) {
      $(".contents > div.selected .framesMulti").prepend("<div />");
    }
  }
};

//一個答案出現一次用toggleMe, 一個答案可以多次出現用pickMe
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
  if ($(".contents > div.selected .framesMulti").attr("freeanswer")) {
    var count = parseInt(
      $(".contents > div.selected .framesMulti").attr("freeanswer")
    );
  } else {
    var ansArr = $(".contents > div.selected .framesMulti")
      .attr("ans")
      .split(",");
    var count = ansArr.length;
  }

  $(".contents > div.selected .framesMulti > div").remove();
  var cta = $(".contents > div.selected .framesMulti").find("> .cta");
  var selectedGrid = $(".contents > div.selected .grids > div.selected");
  selectedGrid.each(function () {
    $(
      `<div ans="${$(this).find(">div").attr("ans")}">${$(this)
        .find(">div")
        .attr("ans")}</div>`
    ).insertBefore(cta);
    count--;
  });

  for (var k = 0; k < count; k++) {
    $(`<div></div>`).insertBefore(cta);
  }
  updateFrameMulti();

  //
  $(".sideTool > div.btn_answer").removeClass("active");
  checkTool();
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
  checkTool();
};

var checkAnswer = function () {
  var selectedElem = $(".contents > div.selected");
  $(".alert").remove();
  var alert = "";
  var matched = false;
  //condition?
  if (selectedElem.find(".condition").length > 0) {
    var conditions = selectedElem.find(".condition > span");

    for (var i = 0; i < conditions.length; i++) {
      if (!conditions.eq(i).hasClass("matched")) {
        var cond = conditions.eq(i).text();
        console.log(cond);
        if (cond.indexOf("=") != -1) {
          //固定位置 match[0]的要等於ans[1]
          var ans = cond.split("=");
          cond = "=";
        } else if (cond.indexOf("-") != -1) {
          //前後順序 match[0] 的位置要小於 match[1]
          var ans = cond.split("-");
          cond = "-";
        } else if (cond.indexOf("+") != -1) {
          //前後順序 match[1] 的位置接著 match[0]
          var ans = cond.split("+");
          cond = "+";
        } else if (cond.indexOf("&") != -1) {
          //match[1] 要相鄰 match[0]
          var ans = cond.split("&");
          cond = "&";
        }

        //開始判斷
        var targets = [];
        var match = [-1, -1];
        selectedElem.find(".frames > div").each(function (index) {
          var tempAns = $(this).text();
          if (ans[0] == tempAns) {
            match[0] = index + 1;
            targets[0] = $(this);
          }
          if (ans[1] == tempAns) {
            match[1] = index + 1;
            targets[1] = $(this);
          }
        });
        switch (cond) {
          case "=":
            //A固定位置
            var anss = ans[1].split("^");
            var gotit = false;
            for (var m = 0; m < anss.length; m++) {
              if (match[0] == anss[m]) {
                gotit = true;
              }
            }
            if (!gotit) {
              targets[0].addClass("wrong");

              alert += `<p><b>${targets[0].text()}</b>必須在第<b>${
                anss[0]
              }</b>格`;
              for (var m = 1; m < anss.length; m++) {
                alert += `或第<b>${anss[m]}</b>格`;
              }
              alert += `</p>`;
            }

            break;
          case "-":
            //A必須在B之前
            if (match[0] >= match[1]) {
              targets[0].addClass("wrong");
              targets[1].addClass("wrong");
              alert += `<p><b>${targets[0].text()}</b>必須在<b>${targets[1].text()}</b>之前<p>`;
            }
            break;
          case "+":
            //A之後必須接著B
            if (parseInt(match[0]) + 1 != parseInt(match[1])) {
              targets[0].addClass("wrong");
              targets[1].addClass("wrong");
              alert += `<p><b>${targets[0].text()}</b>之後必須接著<b>${targets[1].text()}</b><p>`;
            }
            break;
          case "&":
            //A和B要相鄰
            if (
              parseInt(match[0]) + 1 != parseInt(match[1]) &&
              parseInt(match[0]) - 1 != parseInt(match[1])
            ) {
              targets[0].addClass("wrong");
              targets[1].addClass("wrong");
              alert += `<p><b>${targets[0].text()}</b>和<b>${targets[1].text()}</b>要相鄰<p>`;
            }
            break;
          default:
          // code block
        }
      } else {
        //matched answers
        if (!matched) {
          var gotWrongAns = false;
          var ansArr = conditions.eq(i).text().split(",");
          selectedElem.find(".frames > div").each(function (index) {
            var tempAns = ansArr[index];
            var tempAns2 = $(this).text();
            if (tempAns != tempAns2) {
              $(this).addClass("wrong");
              gotWrongAns = true;
            } else {
              $(this).removeClass("wrong");
            }
          });
          if (!gotWrongAns) {
            matched = true;
          }
        }
      }
    }
    //show alert

    if (alert != "") {
      selectedElem.append(
        `<div class="alert wow bounceInUp" onclick="$(this).remove()">${alert}</div>`
      );
    }
  } else {
    selectedElem.find(".frames > div").each(function () {
      var tempAns = $(this).attr("ans");
      var tempAns2 = $(this).text();
      if (tempAns != tempAns2) {
        $(this).addClass("wrong");
      } else {
        $(this).removeClass("wrong");
      }
    });
  }
  //present result
  if (selectedElem.find(".frames > div.wrong").length > 0) {
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

//一個答案出現一次用toggleMe, 一個答案可以多次出現用pickMe
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
  checkTool();
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
  checkTool();
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
  $(".resultIcon").remove();
  $(".alert").remove();
};

var checkTool = function () {
  if (
    !$(".contents > div.selected").find(".framesMulti").attr("freeanswer") &&
    !$(".contents > div.selected").find(".frames").attr("freeanswer") &&
    ($(".contents > div.selected").find(".framesMulti").length > 0 ||
      $(".contents > div.selected").find(".frames").length > 0)
  ) {
    $(".sideTool > div.btn_answer").show();
  } else {
    $(".sideTool > div.btn_answer").hide();
  }

  var gotit = false;
  if ($(".contents > div.selected").find(".frames").length > 0) {
    var gridDiv = $(".contents > div.selected").find(".frames > div");

    for (var k = 0; k < gridDiv.length; k++) {
      if (gridDiv.eq(k).attr("ans")) {
        gotit = true;
      }
    }
  } else if ($(".contents > div.selected").find(".framesMulti").length > 0) {
    var gridDiv = $(".contents > div.selected").find(".framesMulti > div");
    var gotit = false;
    for (var k = 0; k < gridDiv.length; k++) {
      if (gridDiv.eq(k).attr("ans")) {
        gotit = true;
      }
    }
  } else {
    gotit = true;
  }
  if (gotit) {
    $(".sideTool > div.btn_playorder").show();
  } else {
    $(".sideTool > div.btn_playorder").hide();
  }
};

var resetTool = function () {
  $(".sideTool > div").removeClass("active").hide();
};
