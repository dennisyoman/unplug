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
          resetElem($(".contents > div.selected"));
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
  //add audio
  var audioBaseUrl = "https://et.ludodo.com.tw/UnplugFile/";
  var contentElem = $(".contents > div");
  contentElem.each(function () {
    var itemElem = $(this).find(".grid2 > div");

    for (var k = 0; k < itemElem.length; k++) {
      var seq = k + 1;
      var audioPath =
        audioBaseUrl +
        "B" +
        parseInt(bid) +
        "L" +
        lid +
        "_voice_story_" +
        seq +
        ".mp3";
      itemElem.eq(k).append(
        `<span class="storybtn wow bounceIn" onClick="playStory('${audioPath}',true,${k})"><audio preload="auto" src="${audioPath}" /></span>
          <span class="pausebtn" onClick="playStory('${audioPath}',false,${k})"/>`
      );
    }
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

var playStory = function (url, boolean, did) {
  console.log(url, boolean);
  var sameAudio = false;
  $(".contents > div.selected .grid2 > div").find(".pausebtn").hide();
  var itemElem = $(".contents > div.selected .grid2 > div").eq(did);
  for (let k = 0; k < $SFXNameAr.length; k++) {
    if (url == $SFXNameAr[k]) {
      if (currentAudio == $SFXAr[k]) {
        sameAudio = true;
      }
    }
  }

  if (boolean) {
    if (sameAudio) {
      currentAudio.play();
    } else {
      rootSoundEffectName(url);
    }
    itemElem.find(".pausebtn").show();
  } else {
    currentAudio.pause();
  }
};

var showAnswer = function (boolean) {
  var selectedElem = $(".contents > div.selected");

  if (boolean) {
    selectedElem.find(".grid2").addClass("showAnswer");
    rootSoundEffect($help);
  } else {
    resetElem(selectedElem);
    rootSoundEffect($show);
  }
};

var lowlaged = false;

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
  resetAudio();
  elem.find(".grid2").removeClass("showAnswer");
  elem.find(".pausebtn").hide();
  $(".sideTool > div.btn_answer").removeClass("active");
};

var resetTool = function () {
  $(".sideTool > div").removeClass("active").show();
};
