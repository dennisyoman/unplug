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
    $(".alert").remove();
    isDragging = true;
    if ($($elem).hasClass("cards")) {
      $("#module_wrapper").append(
        `<div id="cardAvatar" class="cardAvatar"></div>`
      );
      $($elem).clone().appendTo("#cardAvatar");
      //是否可以重複拖曳
      if (!$($elem).hasClass("repeat")) {
        $($elem).addClass("cached");
        //是否有正確位置參數fp
        if ($($elem).attr("fp") || $($elem).attr("sp") || $($elem).attr("ap")) {
          $($elem).addClass("semiTransparent");
        }
      }
      var caWidth = parseInt($($elem).css("width")) / stageRatioReal;
      var caHeight = parseInt($($elem).css("height")) / stageRatioReal;

      $("#cardAvatar").css("width", caWidth + "px");
      $("#cardAvatar").css("height", caHeight + "px");
    }
    //simply drag
    if ($($elem).hasClass("simplyDrag")) {
      lastPosX = $elem.offsetLeft;
      lastPosY = $elem.offsetTop;
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
  //是否有黏性位置sp
  if ($("#cardAvatar > div").attr("sp")) {
    var itemSP = $("#cardAvatar > div").attr("sp").split("^");
    var itemW = $("#cardAvatar").get(0).style.width;
    var itemH = $("#cardAvatar").get(0).style.height;
    var itemTop = $("#cardAvatar").get(0).style.top;
    var itemLeft = $("#cardAvatar").get(0).style.left;
    console.log(itemTop + "," + itemLeft);
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
    $(".contents > div.selected .sensorArea > .selected").attr("group")
  ) {
    //取得物件所屬的groups
    var groups = $("#cardAvatar > div").attr("group").split("^");
    for (var j = 0; j < groups.length; j++) {
      if (
        $(".contents > div.selected .sensorArea > .selected").attr("group") ==
        groups[j]
      ) {
        $("#cardAvatar").addClass("right");
      }
    }
  }
  $("#cardAvatar").addClass(
    "s" + $(".contents > div.selected .sensorArea > .selected").index()
  );
  //
  $("#cardAvatar")
    .unbind()
    .bind("click", function () {
      $(".alert").remove();
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
  //
  $(".sideTool > div.btn_replay").show();
  $(".sideTool > div.btn_check").show();
};

var showAnswer = function (boolean) {
  $(".alert").remove();
  if (boolean) {
    //秀出答案
    var toys = $(".contents > div.selected .toys");
    var targets = $(".contents > div.selected .frames > div");
    targets.each(function () {
      $(this).find(">div").remove();
      var pre = $(this).attr("pre");
      var preArr = pre.split(",");
      var img1 = toys.find(".cards[cid='" + preArr[0] + "'] > img").attr("src");
      var img2 = toys.find(".cards[cid='" + preArr[1] + "'] > img").attr("src");
      var combo = `<div
                style="
                  position: absolute;
                  z-index: 1;
                  width: 100%;
                  height: 100%;
                  top:0;left:0;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                "
              >
              <img width="50%" src="${img1}" onerror="this.style.display='none'">
              <img width="50%" src="${img2}" onerror="this.style.display='none'">
              </div>`;
      $(this).attr("ans", pre).addClass("disable").append(combo);
    });
    //
    rootSoundEffect($help);
  } else {
    $(".sideTool > div.btn_replay").click();
  }
};

var checkAnswer = function () {
  $(".alert").remove();
  //一定要完成組合
  if ($(".cardAvatarDie").length == 2) {
    var target = $(".contents > div.selected .frames > div:not('.disable')").eq(
      0
    );
    var ans =
      $(".s0").find(".cards").attr("cid") +
      "," +
      $(".s1").find(".cards").attr("cid");
    //先確認答案沒有出現過
    var ansDoneArr = [];
    for (
      var i = 0;
      i < $(".contents > div.selected .frames > div.disable").length;
      i++
    ) {
      ansDoneArr.push(
        $(".contents > div.selected .frames > div.disable").eq(i).attr("ans")
      );
    }
    if (ansDoneArr.indexOf(ans) < 0) {
      //沒出現過
      if ($(".cardAvatarDie:not('.right')").length > 0) {
        var alertmsg = "新組合";
        $(".contents > div.selected").append(
          `<div class="alert wow bounceInUp" style="bottom: 104px;
        left: 193px;" onclick="$(this).remove()">${alertmsg}</div>`
        );
        rootSoundEffect($wrong);
      }
      if ($(".cardAvatarDie.right").length == 2) {
        var alertmsg = "新字";
        $(".contents > div.selected").append(
          `<div class="alert wow bounceInUp" style="bottom: 104px;
        left: 198px;" onclick="$(this).remove()">${alertmsg}</div>`
        );
        bingo(target);
      }
      var img1 = $(".s0").find("img").attr("src");
      var img2 = $(".s1").find("img").attr("src");

      var combo = `<div
                style="
                  position: absolute;
                  z-index: 1;
                  width: 100%;
                  height: 100%;
                  top:0;left:0;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                "
              >
              <img width="50%" src="${img1}" onerror="this.style.display='none'">
              <img width="50%" src="${img2}" onerror="this.style.display='none'">
              </div>`;
      target.attr("ans", ans).addClass("disable").append(combo);
    } else {
      //出現過
      var alertmsg = "組合不能重複";
      $(".contents > div.selected").append(
        `<div class="alert wow bounceInUp" style="bottom: 104px;
        left: 175px;" onclick="$(this).remove()">${alertmsg}</div>`
      );
      rootSoundEffect($stupid);
    }
  } else {
    //沒有完成組合
    var alertmsg = "缺少部件";
    $(".contents > div.selected").append(
      `<div class="alert wow bounceInUp" style="bottom: 104px;
        left: 187px;" onclick="$(this).remove()">${alertmsg}</div>`
    );
    rootSoundEffect($stupid);
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
  elem.find(".cached").removeClass("cached");
  elem.find(".semiTransparent").removeClass("semiTransparent");
  elem.find(".positionBingo").removeClass("positionBingo");
  elem.find(".disable").removeClass("disable");
  elem.find(".simplyDrag").removeAttr("style");
  //清掉組合
  $(".contents > div.selected .frames > div")
    .removeClass("disable")
    .removeAttr("ans")
    .find(">div")
    .remove();

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
  $(".alert").remove();
  //
  $(".sideTool > div.btn_answer").show();
};

var resetTool = function () {
  $(".sideTool > div").removeClass("active").hide();
};

var bingo = function (tar) {
  rootSoundEffect($chimes);
  var uniq = new Date().getTime();
  tar.append(
    `<span class="resultIcon wow bounceIn" style="z-index:9998"><img src="./DATA/IMAGES/common/icon_right.png"/></span><span class="smoke" style="z-index:9999"><img src="./DATA/IMAGES/common/chimes2.gif?uniq=${uniq}"/></span>`
  );
  $(".smoke")
    .delay(1500)
    .queue(function () {
      $(".resultIcon").remove();
      $(this).dequeue().remove();
    });
};
