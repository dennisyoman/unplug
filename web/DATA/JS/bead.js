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
var alertmsg = "";

var trigHammer = function () {
  //hammer
  var myElement = document.getElementById("contents");
  var mc = new Hammer(myElement);
  mc.get("pan").set({ direction: Hammer.DIRECTION_ALL });
  mc.get("press").set({ time: 0.0001 });
  mc.on("press", function (ev) {
    define$Elem(ev);
  });
  mc.on("pressup", function (ev) {
    handleDrag(ev);
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
  if ($($elem).parent().parent().hasClass("sensors")) {
    if (!isDragging) {
      $(".alert").remove();
      isDragging = true;
    }

    if (isDragging) {
      checkCollision(ev);
    }

    if (ev.isFinal) {
      //then
      isDragging = false;
      matchBeads();
    }
  }
};

var checkCollision = function (ev) {
  var lastX = ev.center.x;
  var lastY = ev.center.y;
  var beadElem = $(
    ".contents > div.selected .object .sensors > span:not(.done)"
  ).eq(0);
  var headElem = $(".contents > div.selected .object .answer > span.head");
  var bodyElem = $(".contents > div.selected .object .answer > span.body");
  ////
  beadElem.find("img").each(function (index) {
    var oriX = $(this).offset().left;
    var oriW = oriX + $(this).width();
    var oriY = $(this).offset().top;
    var oriH = oriY + $(this).height();
    var selectedBead = null;
    if (lastX >= oriX && lastX <= oriW && lastY >= oriY && lastY <= oriH) {
      if (!$(this).hasClass("selected")) {
        if ($(this).prev().length > 0) {
          if ($(this).prev().hasClass("selected")) {
            selectedBead = $(this);
          }
        } else {
          selectedBead = $(this);
        }
      }
    }
    if (selectedBead != null) {
      selectedBead.addClass("selected");
      //sync bead
      if (!headElem.hasClass("done")) {
        headElem.find("img").eq(index).addClass("selected");
      } else {
        if (!bodyElem.hasClass("done")) {
          alertmsg = "沒有選取第一段的起點";
          bodyElem.find("img").eq(index).addClass("selected");
        }
      }
    }
  });
};

var matchBeads = function () {
  var numElem = $(".contents > div.selected .object .answer > span.num");
  var headElem = $(".contents > div.selected .object .answer > span.head");
  var bodyElem = $(".contents > div.selected .object .answer > span.body");
  //
  var beadElem = $(
    ".contents > div.selected .object .sensors > span:not(.done)"
  ).eq(0);
  if (beadElem.find("img.selected").length > 0) {
    //sync 選到的珠子
    if (!headElem.hasClass("done")) {
      //頭還沒選
      if (
        beadElem.find("img.selected").length ==
        headElem.find("img.selected").length
      ) {
        headElem.addClass("done");
        //
        beadElem.find("img.selected").each(function () {
          $(this).removeClass("selected").addClass("done");
        });
        beadElem.addClass("done");
        rootSoundEffect($pop);
      } else {
        //與起點不合
        alertmsg = "請選出正確的起點。";
        beadElem.find("img.selected").removeClass("selected");
        headElem.find("img.selected").removeClass("selected");
        rootSoundEffect($stupid);
        $(".contents > div.selected").append(
          `<div class="alert wow bounceInUp" onclick="$(this).remove()">${alertmsg}</div>`
        );
      }
    } else {
      if (!bodyElem.hasClass("done")) {
        //第一次的body
        bodyElem.addClass("done");
        numElem.text(1);
        //
        beadElem.find("img.selected").each(function () {
          $(this).removeClass("selected").addClass("done");
        });
        beadElem.addClass("done");
        rootSoundEffect($pop);
      } else {
        //確認與第一次的body有無符合
        if (
          beadElem.find("img.selected").length ==
          bodyElem.find("img.selected").length
        ) {
          //match
          beadElem.find("img.selected").each(function () {
            $(this).removeClass("selected").addClass("done");
          });
          beadElem.addClass("done");
          rootSoundEffect($pop);
          numElem.text(parseInt(numElem.text()) + 1);
        } else {
          //與第一次的body不符合
          alertmsg = "與已選取的組合不同。";
          beadElem.find("img.selected").removeClass("selected");
          rootSoundEffect($stupid);

          $(".contents > div.selected").append(
            `<div class="alert wow bounceInUp" onclick="$(this).remove()">${alertmsg}</div>`
          );
        }
      }
    }
  } else {
    //錯誤選取珠子
    alertmsg = "請依段落順序從起點開始選起。";

    $(".contents > div.selected").append(
      `<div class="alert wow bounceInUp" onclick="$(this).remove()">${alertmsg}</div>`
    );

    rootSoundEffect($stupid);
  }
  //
  $(".sideTool > div.btn_check").removeClass("active").show();
};

var bingo = function (tar) {
  rootSoundEffect($chimes);
  var uniq = new Date().getTime();
  tar.append(
    `<span class="resultIcon wow bounceIn"><img src="./DATA/IMAGES/common/icon_right.png"/></span><span class="smoke uniq${uniq}"><img src="./DATA/IMAGES/common/chimes2.gif?uniq=${uniq}"/></span>`
  );
  $(`.smoke.uniq${uniq}`)
    .delay(1500)
    .queue(function () {
      $(".resultIcon").remove();
      $(this).dequeue().remove();
    });
};

var checkAnswer = function () {
  $(".alert").remove();
  alertmsg = "";
  var numElem = $(".contents > div.selected .object .answer > span.num");
  var headElem = $(".contents > div.selected .object .answer > span.head");
  var bodyElem = $(".contents > div.selected .object .answer > span.body");
  if (headElem.find("img").length != headElem.find("img.selected").length) {
    alertmsg = "起點選取錯誤。";
  } else if (
    bodyElem.find("img").length != bodyElem.find("img.selected").length
  ) {
    alertmsg = "重複段落選取錯誤。";
  } else if (numElem.text() != numElem.attr("ans")) {
    alertmsg = "重複次數錯誤。";
  }

  if (alertmsg == "") {
    rootSoundEffect($chimes);
    bingo($(".contents > div.selected").find(".object"));
  } else {
    rootSoundEffect($wrong);
    $(".contents > div.selected").append(
      `<div class="alert wow bounceInUp" onclick="$(this).remove()">${alertmsg}</div>`
    );
  }
};

var openContent = function (id) {
  $(".contents > div")
    .eq(id)
    .addClass("selected")
    .siblings(".selected")
    .removeClass("selected");
  resetElem($(".contents > div.selected"));
};

var resetElem = function (elem) {
  resetAudio();
  resetTool();
  //
  elem.find(".selected").removeClass("selected");
  elem.find(".done").removeClass("done");
  //head
  var tempElem = elem.find(".answer .head");
  tempElem.empty();
  if (tempElem.attr("default")) {
    var arr = tempElem.attr("default").split(",");
    for (var i = 0; i < arr.length; i++) {
      var item = arr[i].split("^");
      tempElem.append(
        `<img width="${item[0]}" src="${item[1]}" style="${item[2]}" />`
      );
    }
  }
  //body
  tempElem = elem.find(".answer .body");
  tempElem.empty();
  if (tempElem.attr("default")) {
    var arr = tempElem.attr("default").split(",");
    for (var i = 0; i < arr.length; i++) {
      var item = arr[i].split("^");
      tempElem.append(
        `<img width="${item[0]}" src="${item[1]}" style="${item[2]}" />`
      );
    }
  }
  //num
  tempElem = elem.find(".answer .num");
  tempElem.empty();
  if (tempElem.attr("default")) {
    tempElem.text(tempElem.attr("default"));
  }
  //
  $(".smoke").remove();
  $(".resultIcon").remove();
  $(".alert").remove();
  //
  $(".sideTool > div.btn_replay").removeClass("active").show();
};

var resetTool = function () {
  $(".sideTool > div").removeClass("active").hide();
};
