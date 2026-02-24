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
          resetTool();
          resetElem($(".contents > div.selected"));
        });

      $(".sideTool > div.btn_check")
        .unbind()
        .bind("click", function () {
          $(this).toggleClass("active");
          if ($(this).hasClass("active")) {
            checkAnswer(true);
          } else {
            checkAnswer(false);
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
  for (var i = 1; i <= 100; i++) {
    numArr.push(i);
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

var numArr = new Array();
var dir = [true, -1];

var setCode = function () {
  rootSoundEffect($show);
  var treasurebox = $(".contents > div.selected").find(".treasurebox");
  var code = treasurebox.find(".code");
  var frames = $(".contents > div.selected").find(".frames > div");
  var ansID = Math.floor(Math.random() * frames.length);

  treasurebox.addClass("active");
  $(".contents > div.selected")
    .find(".frames")
    .attr("ans", ansID)
    .addClass("active");
  //找起始的中位數
  var midIDArr = getMidID($(".contents > div.selected").find(".frames"));
  for (var i = 0; i < midIDArr.length; i++) {
    $(".contents > div.selected")
      .find(".frames")
      .find(">div")
      .eq(midIDArr[i])
      .addClass("mid");
  }
  frames.unbind().bind("click", function () {
    //是否點到中位數
    if ($(this).hasClass("mid") && $(this).parent().hasClass("midhint")) {
      var uniq = new Date().getTime();
      $(this).append(
        `<span class="smoke"><img src="./DATA/IMAGES/common/chimes2.gif?uniq=${uniq}"/></span>`,
      );
      $(".smoke")
        .delay(1500)
        .queue(function () {
          $(this).dequeue().remove();
        });
    }
    //清除提示
    $(".alert").remove();
    //
    var ansID = parseInt($(this).parent().attr("ans"));
    if (parseInt(ansID) == $(this).index()) {
      $(".mid").removeClass("mid");
      $(this).addClass("bingo");
      treasurebox
        .find(".code")
        .find("h3")
        .text(ansID + 1);
      treasurebox.removeClass("active").addClass("bingo");
      rootSoundEffect($chimes);
      var uniq = new Date().getTime();
      $(".contents > div.selected").append(
        `<span class="resultIcon wow bounceIn"><img src="./DATA/IMAGES/common/icon_right.png"/></span><span class="smoke"><img src="./DATA/IMAGES/common/chimes.gif?uniq=${uniq}"/></span>`,
      );
      $(".smoke")
        .delay(1500)
        .queue(function () {
          $(".resultIcon").remove();
          $(this).dequeue().remove();
        });
    } else {
      $(this).addClass("wrong");
      rootSoundEffect($wrong);
      //比大小
      var alert = "";
      var guess = $(".contents > div.selected").find(
        ".frames > div.wrong",
      ).length;
      if (parseInt(ansID) < $(this).index()) {
        alert = "密碼比數字小<br />共猜了" + guess + "次";
      } else {
        alert = "密碼比數字大<br />共猜了" + guess + "次";
      }
      //是否超過次數
      var max = $(".contents > div.selected").find(".frames").attr("max");
      if (max && guess >= max) {
        alert += "<br />達到次數限制";
        rootSoundEffect($tryagain);
        $(".contents > div.selected").append(
          `<span class="smoke wow bounceInUp"><img src="./DATA/IMAGES/common/icon_wrong.png"/></span>`,
        );
        $(".smoke")
          .delay(3000)
          .queue(function () {
            $(this).dequeue().remove();
          });
      }

      $(".contents > div.selected").append(
        `<div class="alert wow bounceInRight" onclick="$(this).remove()">${alert}</div>`,
      );
      //是否找新的中位數
      if (
        dir[1] == -1 ||
        (dir[0] && $(this).index() > dir[1]) ||
        (!dir[0] && $(this).index() < dir[1])
      ) {
        $(".mid").removeClass("mid");
        var midIDArr = getSectionMidID(
          $(".contents > div.selected").find(".frames"),
          $(this).index(),
          parseInt(ansID) > $(this).index(),
        );
        for (var i = 0; i < midIDArr.length; i++) {
          $(".contents > div.selected")
            .find(".frames")
            .find(">div")
            .eq(midIDArr[i])
            .addClass("mid");
        }
      }
      //
      if (parseInt(ansID) < $(this).index()) {
        //密碼比數字小
        dir = [false, $(this).index()];
      } else {
        //密碼比數字大
        dir = [true, $(this).index()];
      }
    }
  });
  //
  $(".sideTool > div.btn_answer").fadeIn();
  $(".sideTool > div.btn_replay").fadeIn();
  //
  $(".contents > div.selected .treasurebox .cta").addClass("disable");
};

var setTower = function () {
  rootSoundEffect($show);
  var treasurebox = $(".contents > div.selected").find(".treasurebox");
  var frames = $(".contents > div.selected").find(".tower > div");
  var records = $(".contents > div.selected").find(".record");
  var ansID = Math.floor(Math.random() * frames.length);
  frames.removeClass("hsu chin");
  //設定密碼
  shuffle(numArr);
  var tempArr = new Array();
  for (var i = 0; i < frames.length; i++) {
    tempArr.push(numArr[i]);
  }
  tempArr.sort(function (a, b) {
    if (a > b) return 1;
    if (a < b) return -1;
    return 0;
  });
  for (var i = 0; i < frames.length; i++) {
    frames.eq(i).find("p").text(tempArr[i]);
  }
  frames.eq(ansID).find("p").addClass("bingo");
  treasurebox.find(".code > h2").text(frames.eq(ansID).find("p").text());
  treasurebox.delay(1000).queue(function () {
    treasurebox.addClass("active");
    records.addClass("active");
    $(".contents > div.selected")
      .find(".tower")
      .attr("ans", ansID)
      .addClass("active");
    $(this).dequeue();
  });

  //找起始的中位數
  var midIDArr = getMidID($(".contents > div.selected").find(".tower"));
  for (var i = 0; i < midIDArr.length; i++) {
    $(".contents > div.selected")
      .find(".tower")
      .find(">div")
      .eq(midIDArr[i])
      .addClass("mid");
  }
  frames.unbind().bind("click", function () {
    //是否點到中位數
    if ($(this).hasClass("mid") && $(this).parent().hasClass("midhint")) {
      var uniq = new Date().getTime();
      $(this).append(
        `<span class="smoke"><img src="./DATA/IMAGES/common/chimes2.gif?uniq=${uniq}"/></span>`,
      );
      $(".smoke")
        .delay(1500)
        .queue(function () {
          $(this).dequeue().remove();
        });
    }
    //清除提示
    $(".alert").remove();
    //
    var ansID = $(this).parent().attr("ans");
    if (parseInt(ansID) == $(this).index()) {
      $(".mid").removeClass("mid");
      $(this).addClass("bingo");
      rootSoundEffect($chimes);
      var uniq = new Date().getTime();
      $(".contents > div.selected .record:not('.wrong')").append(
        `<span class="resultIcon wow bounceIn"><img src="./DATA/IMAGES/common/icon_right.png"/></span><span class="smoke"><img src="./DATA/IMAGES/common/chimes.gif?uniq=${uniq}"/></span>`,
      );
      $(".smoke")
        .delay(1800)
        .queue(function () {
          $(".resultIcon").remove();
          $(this).dequeue().remove();
        });
    } else {
      $(this).addClass("wrong");
      rootSoundEffect($wrong);
      //比大小
      var alert = "";
      var guess = $(".contents > div.selected").find(
        ".tower > div.wrong",
      ).length;
      if (parseInt(ansID) < $(this).index()) {
        alert = "白娘子位置比 " + ($(this).index() + 1) + " 樓低";
      } else {
        alert = "白娘子位置比 " + ($(this).index() + 1) + " 樓高";
      }

      /*$(".contents > div.selected").append(
        `<div class="alert wow bounceInRight" style="right:100px;bottom:15px" onclick="$(this).remove()">${alert}</div>`
      );*/
      //是否找新的中位數
      if (
        dir[1] == -1 ||
        (dir[0] && $(this).index() > dir[1]) ||
        (!dir[0] && $(this).index() < dir[1])
      ) {
        $(".mid").removeClass("mid");
        var midIDArr = getSectionMidID(
          $(".contents > div.selected").find(".tower"),
          $(this).index(),
          parseInt(ansID) > $(this).index(),
        );
        for (var i = 0; i < midIDArr.length; i++) {
          $(".contents > div.selected")
            .find(".tower")
            .find(">div")
            .eq(midIDArr[i])
            .addClass("mid");
        }
      }
      //
      if (parseInt(ansID) < $(this).index()) {
        //密碼比數字小
        dir = [false, $(this).index()];
      } else {
        //密碼比數字大
        dir = [true, $(this).index()];
      }
    }
  });
  //
  $(".sideTool > div.btn_answer").fadeIn();
  $(".sideTool > div.btn_replay").fadeIn();
  //
  $(".contents > div.selected .treasurebox .cta").addClass("disable");
};

var goTower = function () {
  var ansID = parseInt(
    $(".contents > div.selected").find(".tower").attr("ans"),
  );
  var tower = $(".contents > div.selected").find(".tower");
  var recordHsu = $(".contents > div.selected").find(".record.hsu");
  var cta = recordHsu.find(".cta");
  var recordChin = $(".contents > div.selected").find(".record.chin");
  var floors = tower.find("> div");

  //hsu
  var hsuID = 0;
  for (var i = 0; i < floors.length; i++) {
    if (!floors.eq(i).hasClass("wrong")) {
      hsuID = i;
      break;
    }
  }
  //chin
  var chinID = 0;
  var chinIDArr = [];
  for (var i = 0; i < floors.length; i++) {
    if (floors.eq(i).hasClass("mid")) {
      chinIDArr.push(i);
    }
  }
  chinID = chinIDArr[Math.floor(Math.random() * chinIDArr.length)];
  //尋找次數
  var times = recordHsu.find("> h3 > span").text();
  recordHsu.find("> h3 > span").text(1 + parseInt(times));
  recordChin.find("> h3 > span").text(1 + parseInt(times));
  //reset floors
  floors.removeClass("hsu chin");
  //確認是否正確
  if (hsuID != chinID) {
    //開不同層
    if (ansID == chinID) {
      //record
      recordHsu
        .addClass("wrong")
        .find(".steps")
        .append("<p>" + (hsuID + 1) + "F：X</p>");
      recordChin
        .addClass("bingo")
        .find(".steps")
        .append("<p style='color:#ff8426'>" + (chinID + 1) + "F：O</p>");
      //小青找到
      cta.hide();
      floors.eq(hsuID).addClass("hsu").click();
      floors.eq(chinID).addClass("chin").click();
    } else if (ansID == hsuID) {
      //record
      recordHsu
        .addClass("bingo")
        .find(".steps")
        .append("<p style='color:#eb6154'>" + (hsuID + 1) + "F：O</p>");
      recordChin
        .addClass("wrong")
        .find(".steps")
        .append("<p>" + (chinID + 1) + "F：X</p>");
      //許仙找到
      cta.hide();
      floors.eq(chinID).addClass("chin").click();
      floors.eq(hsuID).addClass("hsu").click();
    } else {
      //record
      recordHsu.find(".steps").append("<p>" + (hsuID + 1) + "F：X</p>");
      recordChin.find(".steps").append("<p>" + (chinID + 1) + "F：X</p>");
      //都沒找到
      floors.eq(hsuID).addClass("hsu").click();
      floors.eq(chinID).addClass("chin").click();
    }
  } else {
    //開同一層
    floors.eq(hsuID).addClass("hsu").click();
    floors.eq(chinID).addClass("chin");
    if (ansID == chinID) {
      //一起找到
      cta.hide();
      //record
      recordHsu
        .addClass("bingo")
        .find(".steps")
        .append("<p style='color:#eb6154'>" + (hsuID + 1) + "F：O</p>");
      recordChin
        .addClass("bingo")
        .find(".steps")
        .append("<p style='color:#eb6154'>" + (hsuID + 1) + "F：O</p>");
    } else {
      //record
      recordHsu.find(".steps").append("<p>" + (hsuID + 1) + "F：X</p>");
      recordChin.find(".steps").append("<p>" + (chinID + 1) + "F：X</p>");
    }
  }
};

var showAnswer = function (boolean) {
  if (boolean) {
    rootSoundEffect($help);
    //
    if ($(".frames").length > 0) {
      var ansID = $(".contents > div.selected").find(".frames").attr("ans");
      $(".contents > div.selected")
        .find(".frames > div")
        .eq(parseInt(ansID))
        .click();
    }
    //示範三
    if ($(".frames2").length > 0) {
      $(".sideTool > div.btn_check").removeClass("active").hide();
      $(".frames2").each(function () {
        $(this).find(">div").removeClass("bingo wrong");
        //
        var midIDArr = getMidID($(this));
        for (var i = 0; i < midIDArr.length; i++) {
          $(this).find(">div").eq(midIDArr[i]).addClass("bingo");
        }
      });
    }
    //任務三
    if ($(".tower").length > 0) {
      var ansID = $(".contents > div.selected").find(".tower").attr("ans");
      $(".contents > div.selected")
        .find(".tower > div")
        .eq(parseInt(ansID))
        .click();
    }
  } else {
    $(".sideTool > div.btn_replay").click();
  }
};

var checkAnswer = function (boolean) {
  if (boolean) {
    rootSoundEffect($help);
    //示範三
    if ($(".frames2").length > 0) {
      $(".frames2").each(function () {
        var midIDArr = getMidID($(this));
        for (var i = 0; i < midIDArr.length; i++) {
          if (!$(this).find(">div").eq(midIDArr[i]).hasClass("bingo")) {
            $(this).find(">div").eq(midIDArr[i]).addClass("wrong");
          } else {
            $(this).find(">div").eq(midIDArr[i]).addClass("good");
          }
        }
        //
        $(this)
          .find(">div.bingo:not('.good')")
          .addClass("wrong")
          .removeClass("bingo");
        $(this).find(">div.bingo.good").removeClass("good");
        //
      });
      //
      if ($(".frames2 > div.wrong").length == 0) {
        //correct
        rootSoundEffect($chimes);
        var uniq = new Date().getTime();
        $(".contents > div.selected").append(
          `<span class="resultIcon wow bounceIn"><img src="./DATA/IMAGES/common/icon_right.png"/></span><span class="smoke"><img src="./DATA/IMAGES/common/chimes.gif?uniq=${uniq}"/></span>`,
        );
        $(".smoke")
          .delay(1500)
          .queue(function () {
            $(".resultIcon").remove();
            $(this).dequeue().remove();
          });
      } else {
        rootSoundEffect($wrong);
      }
    }
  } else {
    $(".sideTool > div.btn_replay").click();
  }
};

var getMidID = function (tar) {
  var itemsLength = tar.find(">div").length;
  var midIDArr = [];
  //兩個以上才有中位數
  if (itemsLength > 0) {
    if (itemsLength % 2 == 0) {
      midIDArr.push(itemsLength / 2);
      midIDArr.push(itemsLength / 2 - 1);
    } else {
      midIDArr.push(Math.floor(itemsLength / 2));
    }
  }
  return midIDArr;
};
var getSectionMidID = function (tar, index, bigger) {
  var offset = 0;
  var counter = 0;
  var itemsLength = tar.find(">div").length;
  var midIDArr = [];
  if (bigger) {
    console.log("往右:", index);
    //往右

    for (var k = index + 1; k < itemsLength; k++) {
      if (!tar.find(">div").eq(k).hasClass("wrong")) {
        counter++;
      } else {
        break;
      }
    }
    itemsLength = counter;
    offset = index + 1;
  } else {
    console.log("往左:", index);
    //往左
    for (var k = index - 1; k >= 0; k--) {
      if (!tar.find(">div").eq(k).hasClass("wrong")) {
        counter++;
        offset = k;
      } else {
        break;
      }
    }
    itemsLength = counter;
  }

  //兩個以上才有中位數
  if (itemsLength > 0) {
    if (itemsLength % 2 == 0) {
      midIDArr.push(offset + itemsLength / 2);
      midIDArr.push(offset + itemsLength / 2 - 1);
    } else {
      midIDArr.push(offset + Math.floor(itemsLength / 2));
    }
  }
  return midIDArr;
};

var lowlaged = false;

var openContent = function (id) {
  resetAudio();
  resetTool();
  //20260204
  removeToggleAttachment();
  $(".contents > div")
    .eq(id)
    .addClass("selected")
    .siblings(".selected")
    .removeClass("selected");
  resetElem($(".contents > div.selected"));
};

var resetElem = function (elem) {
  $(".alert").remove();
  elem.find(".treasurebox .code h3").text("?");
  elem.find(".treasurebox .code h2").text("?");
  elem.find(".wrong").removeClass("wrong");
  elem.find(".disable").removeClass("disable");
  elem.find(".bingo").removeClass("bingo");
  elem.find(".mid").removeClass("mid");
  elem.find(".active").removeClass("active");
  dir = [true, -1];

  //示範三
  if (elem.find(".frames2").length > 0) {
    elem.find(".frames2").each(function () {
      $(this)
        .find(">div")
        .unbind()
        .bind("click", function () {
          $(this).toggleClass("bingo");
          rootSoundEffect($key);
          //answer
          $(".sideTool > div.btn_answer").removeClass("active");
          //replay
          $(".sideTool > div.btn_replay").fadeIn();
          //check
          $(".sideTool > div.btn_check").fadeIn();
        });
    });
    //
    $(".sideTool > div.btn_answer").fadeIn();
  }

  //任務三
  if (elem.find(".tower").length > 0) {
    elem.find(".record .steps p").remove();
    elem.find(".record > h3 > span").text("0");
    elem.find(".record .cta").show();
  }

  //smoke effect
  $(".smoke").remove();
  $(".resultIcon").remove();
};

var resetTool = function () {
  $(".sideTool > div").removeClass("active").hide();
};
