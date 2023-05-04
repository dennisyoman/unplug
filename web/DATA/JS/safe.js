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
      $(".sideTool > div.btn_replay")
        .unbind()
        .bind("click", function () {
          //$(this).hide();
          resetElem($(".contents > div.selected"));
        });

      $("#jvk").keyboard({});

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

var openPanel = function () {
  rootSoundEffect($key);
  $("#inputpanel").toggleClass("selected");
};

var setCode = function (str) {
  rootSoundEffect($beep);
  $("#jvk").val(str);
};

var checkCode = function () {
  var gotit = true;
  var code = $("#jvk").val();
  if (code == "pya5") {
    var no = 2;
    $("#jvk").val("No." + no);
    $(".contents > div.selected")
      .find(".sensorArea > span")
      .eq(no - 1)
      .addClass("selected")
      .siblings(".selected")
      .removeClass("selected");
  } else if (code == "a5ex") {
    var no = 9;
    $("#jvk").val("No." + no);
    $(".contents > div.selected")
      .find(".sensorArea > span")
      .eq(no - 1)
      .addClass("selected")
      .siblings(".selected")
      .removeClass("selected");
  } else if (code == "v83w") {
    var no = 19;
    $("#jvk").val("No." + no);
    $(".contents > div.selected")
      .find(".sensorArea > span")
      .eq(no - 1)
      .addClass("selected")
      .siblings(".selected")
      .removeClass("selected");
  } else if (code == "e67h") {
    var no = 30;
    $("#jvk").val("No." + no);
    $(".contents > div.selected")
      .find(".sensorArea > span")
      .eq(no - 1)
      .addClass("selected")
      .siblings(".selected")
      .removeClass("selected");
  } else {
    gotit = false;
    $(".contents > div.selected")
      .find(".sensorArea > span")
      .each(function () {
        var str = $(this).find("p").text();
        var codeCombo = str.split("-");
        if (code == codeCombo[1]) {
          gotit = true;
          //紀錄順序
          $("#inputpanel").attr("code", codeCombo[1]);
          $("#jvk").val("No." + codeCombo[0]);
          //提示正確的置物箱
          $(".contents > div.selected")
            .find(".sensorArea > span")
            .eq(parseInt(codeCombo[0]) - 1)
            .addClass("selected")
            .siblings(".selected")
            .removeClass("selected");
        }
      });
  }

  if (gotit) {
    rootSoundEffect($good);
  } else {
    rootSoundEffect($surprise);
    $("#jvk").val("error!");
  }
};

var lowlaged = false;

var bingo = function (tar) {
  rootSoundEffect($chimes);
  var uniq = new Date().getTime();
  tar.append(
    `<span class="smoke"><img src="./DATA/IMAGES/common/chimes2.gif?uniq=${uniq}"/></span>`
  );
  $(".smoke")
    .delay(1500)
    .queue(function () {
      $(this).dequeue().remove();
    });
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
  elem.find(".wrong").removeClass("wrong");
  //
  $("#inputpanel").attr("code", "");
  $("#jvk").val("");
  $(".contents > div.selected")
    .find(".sensorArea > span")
    .removeClass("used")
    .unbind()
    .bind("click", function () {
      if ($(this).hasClass("gift")) {
        bingo($(this));
      } else {
        rootSoundEffect($click);
      }
      $(this).addClass("used").removeClass("selected");
      $("#jvk").val("");
    });
  //

  $(".smoke").remove();
  $(".resultIcon").remove();
};

var resetTool = function () {
  $(".sideTool > div").removeClass("active").show();
};
