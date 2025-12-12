// JavaScript Document

$(document).ready(function () {
  //resize trigger
  $(window).resize(function () {
    resizeScreen();
  });

  //fullscreen
  $("#fullscreen")
    .unbind()
    .bind("click", function () {
      requestFullscreen();
    });

  //power
  $("#power")
    .unbind()
    .bind("click", function () {
      //fullscreen
      $(this).toggleClass("active");
    });

  if (getUrlParameter("tm")) {
    testmode = true;
  }

  //return
  $("#return")
    .unbind()
    .bind("click", function () {
      if (uid != null) {
        let elemName = "mainslider";
        let script_arr = [elemName + ".js"];
        let style_arr = [elemName + ".css"];
        $.getComponent(
          "./page/" + elemName + ".html",
          "#main",
          style_arr,
          "./css/",
          script_arr,
          "./js/"
        );

        console.log("load and goto Unit selection");

        //20230331 updated
        if (!demomode) {
          $("#demo").show();
          $("#demo").removeClass("real");
        } else {
          $("#demo").show();

          $("#demo").addClass("real");
        }
        //20230719 updated
        $("#power").show();
        //clean widgets
        $("#widget").empty();
        //clean canvas
        $("#canvas-board .canvas").remove();

        // pause audio tracker
        if (currentAudioTrack) {
          currentAudioTrack.pause();
        }
        $(".btn_remove").hide();
        $("#main").show();
        if ($(seriesXML).find("series").length <= 1) {
          $("#return").hide();
        }
        //start particle animation
        isPaused = false;
        ////202512:清空main-keep並隱藏
        $("#main-keep").empty().hide();
      } else if (lid != null) {
        removeUnits();
        console.log("return to Lesson selection");
        $("#return").click();
      } else if (bid != null) {
        closeBook();
        console.log("return to Book selection");
      } else if (sid != null) {
        console.log("return to Series selection");
        createSeries();
        $("#return").hide();
      } else {
        console.log("return to Login");
        createSeries();
        $("#return").hide();
      }

      //resetAudio
      resetAudio();
      resetPanel();
    });

  //painting erasor
  var pe = new Hammer(document.getElementById("canvas-board"));
  pe.get("pan").set({ direction: Hammer.DIRECTION_ALL });
  pe.on("pan", function (ev) {
    //erasor painting
    if ($(".pen_tool .eraser").hasClass("active")) {
      erasorPainting(ev);
    }
  });

  $("#backToGEO")
    .unbind()
    .bind("click", function () {
      if (demomode) {
        //回首頁
        window.location.reload();
      } else {
        //登出
        backToGEO();
      }
    });

  resizeScreen();
  Wow.init();
  //init
  toLogin();
  var sizerElement = new Hammer($("#root").get(0));

  //是否支援localstorge
  if (typeof Storage !== "undefined") {
    // Code for localStorage/sessionStorage.
    if (isIE()) {
      //checkBrowser
      let alertHint =
        "您的瀏覽器支援度過於老舊。請下載安裝Chrome或Edge等效能較好的瀏覽器，以獲得完整的使用體驗。";
      alert(alertHint);
    } else {
      //使用get
      uToken = getUrlParameter("token");
      //使用localStorage
      if (!uToken) {
        console.log("使用localstorge");
        uToken = window.localStorage.getItem("MemberToken");
        console.log(uToken);
      }
    }
  } else {
    // Sorry! No Web Storage support..
    alert("抱歉，您的瀏覽器不支援此應用程式。");
  }

  //bg effect
  setInterval(function () {
    if (!isPaused) {
      particles.push(
        new Particle(
          data[randomInt(0, data.length - 1)],
          {
            x: Math.random() * ($(window).width() / stageRatioReal),
            y: $(window).height() / stageRatioReal,
          },
          1 + Math.random() * 3
        )
      );
    }
  }, 200);
  update();
});

//parameters
let html2canvasScale = 5;
let testmode = false;
let translateCountDown = false; //繁轉簡倒數(勿動)
let uToken = ""; //user token(勿動)
let version = new Date().getDate(); //版本(勿動)
let sid, bid, lid, uid, pid, sectionID;
let userID = "-";
let uName = "DEMO用不插電帳號";
let dueDate = "2022/12/31";
let seriesXML;
let contentXML;
let audioPositionSwitch = false;
let keepString = [
  "(n.)",
  "(v.)",
  "(adj.)",
  "(adv.)",
  "=",
  "(s)",
  "(es)",
  " ",
  "(",
  ")",
];
let pieceArr = ["red", "green", "blue", "orange", "purple"];
var currentAudio;
var currentAudioTrack;
let countDownDefault = [0, 0, 0, 0];
var demomode = false;
//標籤
var tags = [];
//

let getLessonName = function () {
  var finalName = "";
  $(seriesXML)
    .find("series")
    .each(function (l) {
      var ssid = $(this).attr("sid");
      if (ssid == sid) {
        $(this)
          .find("book")
          .each(function (j) {
            var bbid = $(this).attr("bid");
            if (bbid == bid) {
              $(this)
                .find("lesson")
                .each(function (k) {
                  var llid = $(this).attr("lid");

                  if (llid == lid) {
                    finalName = $(this).text();
                  }
                });
            }
          });
      }
    });
  return finalName;
};

let getAllXML = function (llid, lessonName) {
  if (lid != llid) {
    uid = null;
    lid = llid;
    //create
    getContent();
  } else {
    showUnits();
  }
  $("#units-title").text(getLessonName());
};

let getContent = function () {
  let ssid = sid;
  let bbid = bid;
  let llid = lid;
  let xpath = demomode ? "./content_demo.xml" : "./content.xml";

  $.ajax({
    type: "GET",
    url: xpath,
    cache: false,
    contentType: "application/json; charset=utf-8",
    async: false,
    timeout: 10000,
    dataType: "xml",
    success: function (data) {
      contentXML = data;
      createUnits();
    },
    error: function (xhr, ajaxOptions, thrownError) {
      console.log(thrownError);
      console.log("content:Error");
    },
  });
};

let createUnits = function () {
  $("#icon-wrapper").empty();
  //
  $(contentXML)
    .find("lesson")
    .each(function (k) {
      let ssid = $(this).attr("sid");
      let bbid = $(this).attr("bid");
      let llid = $(this).attr("lid");
      //demo mode

      ////
      if (ssid == sid && bbid == bid && llid == lid) {
        let amount = $(this).find("section").length;

        //unit title
        $("#units-title")
          .removeClass()
          .addClass("units-title l" + llid);
        if (amount > 5) {
          $("#units-title").addClass("upper");
        } else {
          $("#units-title").removeClass("upper");
        }
        //

        $(this)
          .find("section")
          .each(function (i) {
            let thumb = $(this).attr("image");
            let name = $(this).attr("name");
            let nameArr = name.split("/");
            let id = i + 1;
            let section = $(this).attr("section");
            let iconHTML = `<li onclick="loadContainer(${id},${section})">
                        <img class="wow bounceIn" data-wow-delay="${
                          i * 0.1
                        }s" src="./DATA/${thumb}"/>
                        <h3>${nameArr[0]}<span>${
              nameArr[1] ? nameArr[1] : ""
            }</span></h3></li>`;

            $("#icon-wrapper").append(iconHTML);
            if (amount > 5 && i == Math.ceil(amount / 2) - 1) {
              $("#icon-wrapper").append("<br />");
            }
          });
      }
    });
  //
  $("#icon-wrapper")
    .find("li")
    .unbind()
    .bind("click", function () {
      $(this).addClass("visited");
    });
  showUnits();
};

let showUnits = function (checkcheck) {
  $("#units").addClass("active");
};

let hideUnits = function () {
  $("#units").removeClass("active");
};

let removeUnits = function (reset) {
  $("#units").removeClass("active");
  if (reset != 1) {
    lid = null;
  }
};

let toLogin = function () {
  let elemName = "login";
  let script_arr = [elemName + ".js"];
  let style_arr = [elemName + ".css"];
  $.getComponent(
    "./page/" + elemName + ".html",
    "#main",
    style_arr,
    "./css/",
    script_arr,
    "./js/"
  );
};

let loadContainer = function (id, section) {
  //20230331 updated
  $("#demo").hide();

  pid = 0;
  //gpObj = {};
  uid = id;
  sectionID = section;
  //
  let htmlPath;
  $(contentXML)
    .find("lesson")
    .each(function (k) {
      let ssid = $(this).attr("sid");
      let bbid = $(this).attr("bid");
      let llid = $(this).attr("lid");
      //demo mode

      ////
      if (ssid == sid && bbid == bid && llid == lid) {
        htmlPath = $(this)
          .find("section:eq(" + (uid - 1) + ")")
          .attr("html");
        console.log("load:" + htmlPath);
        jsPath = $(this)
          .find("section:eq(" + (uid - 1) + ")")
          .attr("js");
        ////202512:新增type屬性
        type = $(this)
          .find("section:eq(" + (uid - 1) + ")")
          .attr("type");

        let script_arr = [
          /*jsPath*/
          jsPath,
        ];
        let style_arr = [
          /*cssPath*/
        ];
        ////202512:檢查是否為固定頁
        if (type == "keep") {
          keeplizeElement("#main-keep");

          ////202512:確認是否已存在main-keep
          var sectionDiv =
            ssid + "-" + bbid + "-" + llid + "-" + id + "-" + section;
          if ($("#" + sectionDiv).length > 0) {
            //已存在,顯示此區塊
            console.warn("已存在此固定頁,顯示此區塊");
            dekeeplizeElement("#" + sectionDiv);

            //重新載入JS
            $.getMultiScripts(script_arr, "./DATA/").done(function () {
              // all scripts loaded
              console.log("JS Loading Finished.");
            });
          } else {
            //不存在,新增此區塊
            console.warn("不存在此固定頁,新增此區塊");
            $("#main-keep").append(
              `<div id="${sectionDiv}" class="main"></div>`
            );
            $.getComponent(
              "./DATA/" + htmlPath,
              "#" + sectionDiv,
              style_arr,
              "./DATA/",
              script_arr,
              "./DATA/"
            );
          }

          $("#main").empty();
          $("#main-keep").show();
          $("#" + sectionDiv).show();
        } else {
          //固定頁全部隱藏
          console.warn("固定頁全部隱藏");
          keeplizeElement("#main-keep");
          //
          $.getComponent(
            "./DATA/" + htmlPath,
            "#main",
            style_arr,
            "./DATA/",
            script_arr,
            "./DATA/"
          );
        }

        resetAudio();
        loadPanel();
        hideUnits();
        $("#return").show();
        $("#main").show();
        //stop particle animation
        isPaused = true;
      }
    });
};
////202512:固定頁元素樣式
let keeplizeElement = function (name) {
  $(name).find("#module_wrapper").attr("id", "module_wrapper_keep");
  $(name).find("#contents").attr("id", "contents_keep");
  $(name).find(".tabs").addClass("tabs_keep").removeClass("tabs");
  $(name).find(".contents").addClass("contents_keep").removeClass("contents");
  $(name).find(".sideTool").addClass("sideTool_keep").removeClass("sideTool");
  $(name)
    .find(".assetsPreload")
    .addClass("assetsPreload_keep")
    .removeClass("assetsPreload");
  $("#main-keep").hide();
  $("#main-keep").find(">*").hide();
};
////202512:取消固定頁元素樣式
let dekeeplizeElement = function (name) {
  $(name).find("#module_wrapper_keep").attr("id", "module_wrapper");
  $(name).find("#contents_keep").attr("id", "contents");
  $(name).find(".tabs_keep").addClass("tabs").removeClass("tabs_keep");
  $(name)
    .find(".contents_keep")
    .addClass("contents")
    .removeClass("contents_keep");
  $(name)
    .find(".sideTool_keep")
    .addClass("sideTool")
    .removeClass("sideTool_keep");
  $(name)
    .find(".assetsPreload_keep")
    .addClass("assetsPreload")
    .removeClass("assetsPreload_keep");
};

let loadContainerInside = function (htmlPath, jsPath, p) {
  //20230331 updated
  $("#demo").hide();

  pid = p;
  console.log("pid:" + pid);
  let script_arr = [
    /*jsPath*/
    jsPath,
  ];
  let style_arr = [
    /*cssPath*/
  ];
  $.getComponent(
    "./DATA/" + htmlPath,
    "#main",
    style_arr,
    "./DATA/",
    script_arr,
    "./DATA/"
  );
  resetAudio();
  //loadPanel();
  //$("#return").show();
  $("#main").show();
  //stop particle animation
  isPaused = true;
};

let checkPanelBtns = function () {
  if (
    $("#module_wrapper").hasClass("module_order") ||
    $("#module_wrapper").hasClass("module_flood") ||
    $("#module_wrapper").hasClass("module_ant")
  ) {
    $(".btn_zoom").addClass("disabled");
  } else {
    $(".btn_zoom").removeClass("disabled");
  }
};

let loadPanel = function () {
  resetPanel();
  $("#root").append("<div id='panel' class='panel wow slideInUp'></div>");

  let elemName = "panel";
  let script_arr = [elemName + ".js"];
  let style_arr = ["panel.css"];
  $.getComponent(
    "./page/" + elemName + ".html",
    "#panel",
    style_arr,
    "./css/",
    script_arr,
    "./js/",
    true
  );
};

let loadMainSlider = function () {
  let elemName = "mainslider";
  let script_arr = [elemName + ".js"];
  let style_arr = [elemName + ".css"];
  $.getComponent(
    "./page/" + elemName + ".html",
    "#main",
    style_arr,
    "./css/",
    script_arr,
    "./js/"
  );
  //20230331 updated
  if (!demomode) {
    $("#demo").show();
    $("#demo").removeClass("real");
  } else {
    $("#demo").show();
    $("#demo").addClass("real");
  }
  //20230719 updated
  $("#power").show();
};

let getTimeStamp = function () {
  let timestamp = Date.parse(new Date()); //1610075969000
  timestamp = timestamp.toString().slice(0, 10);
  return timestamp;
};

let checkLogin = function () {
  $(".error").html("login...");

  if (
    $('input[name="username"]').val() == "" ||
    $('input[name="password"]').val() == ""
  ) {
    $(".error").html("帳號或密碼沒填");
  } else {
    //case insensitive
    let uname = $('input[name="username"]').val().toUpperCase();
    userID = uname;
    window.localStorage.setItem("UserID", uname);
    let upass = $('input[name="password"]').val().toLowerCase() + "GIRF";
    var hash = md5(upass).toUpperCase();
    let timestamp = getTimeStamp();
    let sign = md5(timestamp + "LDD@Giraffe55825168").toUpperCase();

    $.ajax({
      type: "POST",
      url: "//api01.giraffe.com.tw/api/ludodo/eteaching/member-login",
      data: JSON.stringify({
        id: userID,
        pwd: hash,
        courseType: "",
        timestamp: timestamp,
        sign: sign,
        website: "U",
      }),
      async: false,
      contentType: "application/json; charset=utf-8",
      timeout: 10000,
      cache: false,
      dataType: "xml",
      success: function (data) {
        console.log(data);
        let code = $(data).find("code").first().text();
        let msg = $(data).find("msg").first().text();
        let encodedToken = $(data).find("token").first().text();
        if (code == "0" || code == 0) {
          uToken = $(data).find("token").first().text();
          dueDate = $(data).find("serviceenddate").first().text();
          uName = $(data).find("name").first().text();
          getSeriesXML();
        } else if (code == "2" || code == 2) {
          $(".error").html("此帳號已在線上");
          let passwordAgain = confirm("此帳號已在線上，是否要取代原登入者?");
          // if (passwordAgain && passwordAgain.toUpperCase() == upass) {
          if (passwordAgain) {
            reCheckLogin(encodedToken);
          } else {
            //alert("密碼錯誤");
            console.log("不踢掉原登入");
          }
        } else {
          $(".error").html(msg);
        }
      },
      error: function (xhr, ajaxOptions, thrownError) {
        console.log(thrownError);
        $(".error").html(thrownError);
      },
    });
  }
};

let reCheckLogin = function (encodedToken) {
  let timestamp = getTimeStamp();
  let sign = md5(timestamp + "LDD@Giraffe55825168").toUpperCase();
  $.ajax({
    type: "POST",
    url: "//api01.giraffe.com.tw/api/ludodo/eteaching/member-relogin",
    data: JSON.stringify({
      token: encodedToken,
      timestamp: timestamp,
      sign: sign,
    }),
    async: false,
    contentType: "application/json; charset=utf-8",
    timeout: 10000,
    cache: false,
    dataType: "xml",
    success: function (data) {
      let code = $(data).find("code").first().text();
      let msg = $(data).find("msg").first().text();
      if (code == "0") {
        uToken = $(data).find("token").first().text();
        dueDate = $(data).find("serviceenddate").first().text();
        window.localStorage.setItem("DueDate", dueDate);
        uName = $(data).find("name").first().text();
        getSeriesXML();
      } else {
        $(".error").html(msg);
      }
    },
    error: function (xhr, ajaxOptions, thrownError) {
      console.log(thrownError);
      $(".error").html(thrownError);
    },
  });
};
//update 2025/05/16
let getSeriesXML = function () {
  let xpath = demomode ? "./series_demo.xml" : "./series.xml";

  $.ajax({
    type: "GET",
    url: xpath,
    cache: false,
    contentType: "application/json; charset=utf-8",
    async: false,
    timeout: 10000,
    dataType: "xml",
    success: function (data) {
      console.log("Series:got");
      seriesXML = data;
      //如果不是測試也不是demo模式
      if (!testmode && !demomode) {
        $.ajax({
          type: "GET",
          url: "https://api01.giraffe.com.tw/api/ludodo/eteaching/get-member-course",
          data: { token: uToken },
          cache: false,
          contentType: "application/json; charset=utf-8",
          async: false,
          timeout: 10000,
          dataType: "xml",
          success: function (dataOpened) {
            // 會返回帳號可看的系列與冊數
            console.log(dataOpened);
            //處理對應課程
            var bookOpenedObj = new Object();
            $(dataOpened)
              .find("series")
              .each(function () {
                var ssid = $(this).attr("sid");
                var bidArr = [];
                $(this)
                  .find("book")
                  .each(function () {
                    bidArr.push($(this).attr("bid"));
                  });
                bookOpenedObj[ssid] = bidArr;
              });

            $(seriesXML)
              .find("series")
              .each(function () {
                var ssid = $(this).attr("sid");
                if (bookOpenedObj[ssid] == undefined) {
                  //沒有對應到ssid,刪掉此series
                  $(this).remove();
                } else {
                  console.log(bookOpenedObj[ssid]);
                  //對應book
                  $(this)
                    .find("book")
                    .each(function () {
                      var bbid = $(this).attr("bid");
                      if (bookOpenedObj[ssid].indexOf(bbid) < 0) {
                        //沒有對應到bid,刪掉此book
                        $(this).remove();
                      }
                    });
                }
              });
            console.log("--result--");
            console.log(seriesXML);
            //開始
            loadMainSlider();
          },
          error: function (xhr, ajaxOptions, thrownError) {
            console.log(thrownError);
            console.log("Series:error");
          },
        });
      } else {
        loadMainSlider();
      }
    },
    error: function (xhr, ajaxOptions, thrownError) {
      console.log(thrownError);
      console.log("Series:error");
    },
  });
};

//particle
class Particle {
  constructor(svg, coordinates, friction) {
    this.svg = svg;
    this.steps = $(window).height() / 2;
    this.item = null;
    this.friction = friction;
    this.coordinates = coordinates;
    this.position = this.coordinates.y;
    this.dimensions = this.render();
    this.rotation = Math.random() > 0.5 ? "-" : "+";
    this.scale = (0.5 + Math.random()) / 2;
    this.siner = 200 * Math.random();
  }

  destroy() {
    this.item.remove();
  }

  move() {
    this.position = this.position - this.friction;
    let top = this.position;
    let left =
      this.coordinates.x +
      Math.sin((this.position * Math.PI) / this.steps) * this.siner;
    this.item.css({
      transform:
        "translateX(" +
        left +
        "px) translateY(" +
        top +
        "px) scale(" +
        this.scale +
        ") rotate(" +
        this.rotation +
        (this.position + this.dimensions.height) +
        "deg)",
    });

    if (this.position < -this.dimensions.height) {
      this.destroy();
      return false;
    } else {
      return true;
    }
  }

  render() {
    this.item = $(this.svg, {
      css: {
        transform:
          "translateX(" +
          this.coordinates.x +
          "px) translateY(" +
          this.coordinates.y +
          "px)",
      },
    });
    $(".bgg").append(this.item);
    return {
      width: this.item.width(),
      height: this.item.height(),
    };
  }
}

const rhombus =
  '<svg viewBox="0 0 13 14"><path class="rhombus" d="M5.9,1.2L0.7,6.5C0.5,6.7,0.5,7,0.7,7.2l5.2,5.4c0.2,0.2,0.5,0.2,0.7,0l5.2-5.4 C12,7,12,6.7,11.8,6.5L6.6,1.2C6.4,0.9,6.1,0.9,5.9,1.2L5.9,1.2z M3.4,6.5L6,3.9c0.2-0.2,0.5-0.2,0.7,0l2.6,2.6 c0.2,0.2,0.2,0.5,0,0.7L6.6,9.9c-0.2,0.2-0.5,0.2-0.7,0L3.4,7.3C3.2,7.1,3.2,6.8,3.4,6.5L3.4,6.5z" /></svg>';

const pentahedron =
  '<svg viewBox="0 0 561.8 559.4"><path class="pentahedron" d="M383.4,559.4h-204l-2.6-0.2c-51.3-4.4-94-37-108.8-83l-0.2-0.6L6,276.7l-0.2-0.5c-14.5-50,3.1-102.7,43.7-131.4 L212.1,23C252.4-7.9,310.7-7.9,351,23l163.5,122.5l0.4,0.3c39,30.3,56,82.6,42.2,130.3l-0.3,1.1l-61.5,198 C480.4,525.6,435.5,559.4,383.4,559.4z M185.5,439.4h195.2l61.1-196.8c0-0.5-0.3-1.6-0.7-2.1L281.5,120.9L120.9,241.2 c0,0.3,0.1,0.7,0.2,1.2l60.8,195.8C182.5,438.5,183.7,439.1,185.5,439.4z M441,240.3L441,240.3L441,240.3z"/></svg>';
const x =
  '<svg viewBox="0 0 12 12"> <path class="x" d="M10.3,4.3H7.7V1.7C7.7,0.8,7,0,6,0S4.3,0.8,4.3,1.7v2.5H1.7C0.8,4.3,0,5,0,6s0.8,1.7,1.7,1.7h2.5v2.5 C4.3,11.2,5,12,6,12s1.7-0.8,1.7-1.7V7.7h2.5C11.2,7.7,12,7,12,6S11.2,4.3,10.3,4.3z"/></svg>';

const circle =
  '<svg x="0px" y="0px" viewBox="0 0 13 12"> <path class="circle" d="M6.5,0.1C3.4,0.1,0.8,2.8,0.8,6s2.6,5.9,5.7,5.9s5.7-2.7,5.7-5.9S9.7,0.1,6.5,0.1L6.5,0.1z M6.5,8.8 C5,8.8,3.8,7.6,3.8,6S5,3.2,6.5,3.2S9.2,4.4,9.2,6S8,8.8,6.5,8.8L6.5,8.8z"/> </svg>';

const point =
  '<svg viewBox="0 0 12 12"> <path class="point" d="M6,7.5L6,7.5C5.1,7.5,4.5,6.9,4.5,6v0c0-0.9,0.7-1.5,1.5-1.5h0c0.9,0,1.5,0.7,1.5,1.5v0C7.5,6.9,6.9,7.5,6,7.5z "/> </svg>';

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

const data = [point, rhombus, pentahedron, circle, x];

let isPaused = false;
window.onblur = function () {
  isPaused = true;
}.bind(this);
window.onfocus = function () {
  //isPaused = false;
}.bind(this);

let particles = [];

function update() {
  particles = particles.filter(function (p) {
    return p.move();
  });
  requestAnimationFrame(update.bind(this));
}

//common funcs

let isitEmpty = function (str) {
  var tempStr = str.replace(/\s+/g, "");
  return !(tempStr.length > 0);
};
// Wow
let Wow = (function () {
  "use strict";

  // Handle Wow
  let handleWow = function () {
    let wow = new WOW({
      boxClass: "wow", // animated element css class (default is wow)
      animateClass: "animated", // default
      mobile: true, // trigger animations on mobile devices (true is default)
      tablet: true, // trigger animations on tablet devices (true is default)
      live: true,
    });
    wow.init();
  };

  return {
    init: function () {
      handleWow(); // initial setup for counter
    },
  };
})();

////load component,css,js
$.getMultiScripts = function (arr, path) {
  $.each(arr, function (index, scr) {
    //是否載入過
    if ($.inArray(scr, js_cache_arr) >= 0) {
      //console.log(scr + " exists, remove it.");
      let srcc = (path || "") + scr + "?v=" + version;
      $("script[src='" + srcc + "']").remove();
    } else {
      //cache住
      js_cache_arr.push(scr);
      //console.log(js_cache_arr);
    }
    let sc = document.createElement("script");
    sc.src = (path || "") + scr + "?v=" + version;
    $("body").append(sc);
    //
    console.log(scr + " is loaded.");
    checkPanelBtns();
  });
  return {
    done: function (method) {
      if (typeof method == "function") {
        //如果傳入引數為一個方法
        method();
      }
    },
  };
};

$.getMultiStyles = function (arr, path) {
  $.each(arr, function (index, scr) {
    //是否載入過
    if ($.inArray(scr, css_cache_arr) >= 0) {
      //console.log(scr+" exists.");
    } else {
      //cache住
      css_cache_arr.push(scr);
      //
      $("head").append("<link>");
      let css = $("head").children(":last");
      css.attr({
        rel: "stylesheet",
        type: "text/css",
        href: (path || "") + scr + "?v=" + version,
      });
      //console.log(scr+" is loaded.");
    }
  });
};

$.getComponent = function (
  comp,
  comp_holder,
  css_arr,
  css_path,
  js_arr,
  js_path,
  noloading
) {
  if (!noloading) {
    resetDynamicFunctions();
    console.log("resetDynamicFunctions");
  } else {
    console.log("no resetDynamicFunctions");
  }
  let delayTime = 50;
  let chamount = $(comp_holder).length;
  if (noloading) {
  } else {
    activeLoading();
  }
  $(comp_holder)
    .delay(delayTime)
    .queue(function () {
      //先載入樣式
      if (css_arr != "") {
        //console.log("-- css --");
        $.getMultiStyles(css_arr, css_path);
      }

      //載入元件
      //console.log("-- component --");
      $(this).load(comp + "?v=" + version, function (response, status, xhr) {
        //console.log(comp+" is loaded.");
        chamount -= 1;
        if (chamount == 0) {
          //完成後載入js
          if (js_arr != "" && status != "error") {
            //console.log("-- js --");
            $.getMultiScripts(js_arr, js_path).done(function () {
              // all scripts loaded
              //console.log("Loading Finished.");
            });
          } else {
            //console.log("No js, all loading Finished.");
          }
        }
        if (status == "error") {
          if (
            confirm(
              "尚未完成本課，請選擇其他章節；或是double click畫面跳出loading"
            )
          ) {
            deactiveLoading();
          }
        }
      });
      $(this).dequeue();
    });
};

let css_cache_arr = [];
let js_cache_arr = [];
let stageRatio = 1; //real ratio = stageRatioMain * stageRatioRoot
let stageRatioReal = 1;
let stageRatioMain = 1; //放大工具
let stageRatioRoot = 1; //調整app尺寸fit screen
let stageRatioMax = 5;
let clientWidth = function () {
  return Math.max(window.innerWidth, document.documentElement.clientWidth);
};
let clientHeight = function () {
  return Math.max(window.innerHeight, document.documentElement.clientHeight);
};

let autofitScreen = function () {
  let clientW = clientWidth();
  let clientH = clientHeight();
  let stageW = 640;
  let stageH = 360;
  if (clientW / clientH > stageW / stageH) {
    stageRatioRoot = clientH / stageH;
  } else {
    stageRatioRoot = clientW / stageW;
  }
  stageRatioRoot = Math.min(stageRatioRoot, stageRatioMax);
  stageRatioReal = stageRatioRoot * stageRatioMain;
  stageRatio = Math.floor(stageRatioReal * 10) / 10;

  $("#root").css("zoom", "1");
  $("#root").css(
    "-ms-transform",
    "translate3d(-50.1%,-50.1%,0) scale(" +
      stageRatioRoot +
      "," +
      stageRatioRoot +
      ")"
  );
  $("#root").css(
    "-webkit-transform",
    "translate3d(-50.1%,-50.1%,0) scale(" +
      stageRatioRoot +
      "," +
      stageRatioRoot +
      ")"
  );
  $("#root").css(
    "transform",
    "translate3d(-50.1%,-50.1%,0) scale(" +
      stageRatioRoot +
      "," +
      stageRatioRoot +
      ")"
  );
};

let shuffle = function (array) {
  for (let i = array.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
};

let mySort = function (array, tarObj, val) {
  array.sort(function (a, b) {
    let aRV = parseInt(tarObj[a][val]);
    let bRV = parseInt(tarObj[b][val]);
    if (aRV > bRV) return 1;
    if (aRV < bRV) return -1;
    return 0;
  });
};

let requestFullscreen = function () {
  var isInFullScreen =
    (document.fullscreenElement && document.fullscreenElement !== null) ||
    (document.webkitFullscreenElement &&
      document.webkitFullscreenElement !== null) ||
    (document.mozFullScreenElement && document.mozFullScreenElement !== null) ||
    (document.msFullscreenElement && document.msFullscreenElement !== null);

  var docElm = document.documentElement;
  if (!isInFullScreen) {
    if (docElm.requestFullscreen) {
      docElm.requestFullscreen();
    } else if (docElm.mozRequestFullScreen) {
      docElm.mozRequestFullScreen();
    } else if (docElm.webkitRequestFullScreen) {
      docElm.webkitRequestFullScreen();
    } else if (docElm.msRequestFullscreen) {
      docElm.msRequestFullscreen();
    }
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    }
  }
};

//draggable
let defineElem = function (ev) {
  firstElem = ev.target;
  var attr = $(firstElem).attr("mt");
  if (typeof attr !== "undefined" && attr !== false) {
    var loop = parseInt(attr);
    for (var n = 0; n < loop; n++) {
      firstElem = $(firstElem).parent().get(0);
    }
    console.log("got firstelem");
  }
};
let define$Elem = function (ev) {
  $elem = ev.target;
  var attr = $($elem).attr("mt");
  if (typeof attr !== "undefined" && attr !== false) {
    var loop = parseInt(attr);
    for (var n = 0; n < loop; n++) {
      $elem = $($elem).parent().get(0);
    }
  }
};

var paintVar;
var paintPauseDuration = 1500;
var groupID = new Date().getTime();
var firstElem = null;
var click = {
  x: 0,
  y: 0,
  threshold: 8,
};
let makeDraggable = function (tar, stay, resizeTar) {
  var audioTrackerDragger = new Hammer(tar.get(0));
  var isATDrag = false;
  tar.addClass("dragger");
  var lastATPosX, lastATPosY, lastRTX, lastRTY;
  var newRatio = stageRatio;
  audioTrackerDragger
    .get("pan")
    .set({ direction: Hammer.DIRECTION_ALL, threshold: 1 });
  audioTrackerDragger.get("press").set({ time: 1 });
  audioTrackerDragger.on("press", function (ev) {
    defineElem(ev);
  });
  audioTrackerDragger.on("pressup", function (ev) {
    firstElem = null;
  });
  audioTrackerDragger.on("pan", function (ev) {
    if (firstElem == null) {
      console.log("no elem");
      defineElem(ev);
    }
    var elem = ev.target;
    if ($(elem).hasClass("dragger") && firstElem == null) {
      firstElem = elem;
    }

    //移動的本體
    if (
      firstElem &&
      $(firstElem).hasClass("dragger") &&
      !$(firstElem).hasClass("disable")
    ) {
      if (
        $(firstElem).parent().hasClass("widget") ||
        $(firstElem).parent().hasClass("canvas-board")
      ) {
        newRatio = stageRatio / stageRatioMain;
      } else {
        newRatio = stageRatio;
      }
      if (!isATDrag) {
        isATDrag = true;
        lastATPosX = firstElem.offsetLeft;
        lastATPosY = firstElem.offsetTop;
      }

      var posX = ev.deltaX / newRatio + lastATPosX;
      var posY = ev.deltaY / newRatio + lastATPosY;
      var dx = posX - parseFloat(firstElem.style.left);
      var dy = posY - parseFloat(firstElem.style.top);

      if (isATDrag) {
        firstElem.style.left = posX + "px";
        firstElem.style.top = posY + "px";
        //move as a group with same gid
        if ($(firstElem).hasClass("canvas")) {
          var dPos = [dx, dy];
          groupMoving($(firstElem), dPos);
        }
      }
    }
    //resizer
    if ($(firstElem).hasClass("resizer")) {
      if (!isATDrag) {
        newRatio = stageRatio / stageRatioMain;

        isATDrag = true;
        lastRTX = resizeTar.get(0).offsetLeft;
        lastRTY = resizeTar.get(0).offsetTop;
        lastRTW = resizeTar.width() / newRatio;
        lastRTH = resizeTar.height() / newRatio;
      }

      if (isATDrag) {
        if ($(firstElem).hasClass("rb")) {
          var ww = lastRTW + ev.deltaX / newRatio;
          var hh = lastRTH + ev.deltaY / newRatio;
        } else if ($(firstElem).hasClass("rt")) {
          var ww = lastRTW + ev.deltaX / newRatio;
          var hh = lastRTH - ev.deltaY / newRatio;
          resizeTar.css("top", lastRTY + ev.deltaY / newRatio);
        } else if ($(firstElem).hasClass("lb")) {
          var ww = lastRTW - ev.deltaX / newRatio;
          var hh = lastRTH + ev.deltaY / newRatio;
          resizeTar.css("left", lastRTX + ev.deltaX / newRatio);
        } else if ($(firstElem).hasClass("lt")) {
          var ww = lastRTW - ev.deltaX / newRatio;
          var hh = lastRTH - ev.deltaY / newRatio;
          resizeTar.css("left", lastRTX + ev.deltaX / newRatio);
          resizeTar.css("top", lastRTY + ev.deltaY / newRatio);
        }
        resizeTar.width(ww + "px");
        resizeTar.height(hh + "px");
      }
    }
    //ending
    if (ev.isFinal) {
      ////202512
      //reset edit buttons
      $(firstElem).siblings(".edit").removeClass("active");
      $(firstElem).siblings(".erase").removeClass("active");
      $(firstElem).siblings(".eraseAll").removeClass("active");
      $(firstElem).siblings(".drawer").removeClass("editable");

      $(".resizer").removeAttr("style");
      //
      if ($(firstElem).hasClass("canvas")) {
        groupDeleting($(firstElem));
      } else {
        if (
          posX < 0 - ($(firstElem).width() / stageRatio) * 0.7 ||
          posX > 640 - ($(firstElem).width() / stageRatio) * 0.3 ||
          posY < 0 - ($(firstElem).height() / stageRatio) * 0.6 ||
          posY > 280 - ($(firstElem).height() / stageRatio) * 0.4
        ) {
          if (stay || !$(firstElem).hasClass("dragger")) {
          } else {
            if (
              $(firstElem).hasClass("audioTrack") &&
              $(firstElem).hasClass("active")
            ) {
              if (currentAudioTrack) {
                currentAudioTrack.pause();
              }
            }
            $(firstElem).remove();
          }
        }
      }

      isATDrag = false;
      firstElem = null;
    }
  });

  tar.removeAttr("id");
};

//canvas painting erasor
var pRatio = 4;
let erasorPainting = function (ev) {
  var _eraserWidth = 40;
  if (ev.isFinal) {
    $("#canvas-board .canvas").each(function (index) {
      if (isCanvasBlank($(this).find("canvas").get(0))) {
        $(this).remove();
      }
    });
  } else {
    $("#canvas-board .canvas").each(function (index) {
      var canv = $(this).find("canvas").get(0);
      var newPos = [
        ev.center.x - parseInt($(this).offset().left),
        ev.center.y - parseInt($(this).offset().top),
      ];
      var ctxx = canv.getContext("2d");
      var newZoomRatio = stageRatioReal / stageRatioMain;
      ctxx.clearRect(
        (newPos[0] * pRatio) / newZoomRatio - _eraserWidth / 2,
        (newPos[1] * pRatio) / newZoomRatio - _eraserWidth / 2,
        _eraserWidth,
        _eraserWidth
      );
    });
  }
};

let groupMoving = function (tar, arrPos) {
  var tempGIDArr = tar.attr("gid").split(",");
  var tempGID = tempGIDArr[tempGIDArr.length - 1];
  var tarUID = tar.attr("uid");
  $("#canvas-board .canvas").each(function (index) {
    var tempGIDArrMe = $(this).attr("gid").split(",");
    var tempGIDMe = tempGIDArrMe[tempGIDArrMe.length - 1];
    if (tempGIDMe == tempGID && $(this).attr("uid") != tarUID) {
      $(this).get(0).style.left =
        parseFloat($(this).get(0).style.left) + arrPos[0] + "px";
      $(this).get(0).style.top =
        parseFloat($(this).get(0).style.top) + arrPos[1] + "px";
    }
  });
};

let groupDeleting = function (tar) {
  var groupMinX = 640;
  var groupMaxX = 0;
  var groupMinY = 320;
  var groupMaxY = 0;
  var tempGIDArr = tar.attr("gid").split(",");
  var tempGID = tempGIDArr[tempGIDArr.length - 1];
  console.log(tempGID);

  $("#canvas-board .canvas").each(function (index) {
    var tempGIDArrMe = $(this).attr("gid").split(",");
    var tempGIDMe = tempGIDArrMe[tempGIDArrMe.length - 1];
    if (tempGIDMe == tempGID) {
      var tx = parseInt($(this).get(0).style.left);
      var ty = parseInt($(this).get(0).style.top);
      var tw = parseInt($(this).get(0).style.width);
      var th = parseInt($(this).get(0).style.height);
      groupMinX = Math.min(tx, groupMinX);
      groupMaxX = Math.max(tx + tw, groupMaxX);
      groupMinY = Math.min(ty, groupMinY);
      groupMaxY = Math.max(ty + th, groupMaxY);
    }
  });
  //
  var groupW = parseInt(groupMaxX - groupMinX) / pRatio;
  var groupH = parseInt(groupMaxY - groupMinY) / pRatio;

  if (
    groupMinX < 0 - groupW * 0.2 ||
    groupMinX > 640 - groupW * 0.8 ||
    groupMinY < 0 - groupH * 0.2 ||
    groupMinY > 320 - groupH * 0.8
  ) {
    $("#canvas-board .canvas").each(function (index) {
      var tempGIDArrMe = $(this).attr("gid").split(",");
      var tempGIDMe = tempGIDArrMe[tempGIDArrMe.length - 1];
      if (tempGIDMe == tempGID) {
        $(this).remove();
      }
    });
    if ($("#canvas-board .canvas.selected").length > 0) {
      $("#cbg").fadeIn();
      $("#cba").fadeIn();
    } else {
      $("#cbg").hide();
      $("#cba").hide();
    }
  }
};

let groupSelect = function (tar) {
  var tempGIDArr = tar.attr("gid").split(",");
  var tempGID = tempGIDArr[tempGIDArr.length - 1];
  $("#canvas-board .canvas").each(function (index) {
    var tempGIDArrMe = $(this).attr("gid").split(",");
    var tempGIDMe = tempGIDArrMe[tempGIDArrMe.length - 1];
    if (tempGIDMe == tempGID) {
      $(this).toggleClass("selected");
      getHighestDepthCanvas($(this));
    }
  });

  if ($("#canvas-board .canvas.selected").length > 0) {
    $("#cbg").fadeIn();
    $("#cba").fadeIn();
  } else {
    $("#cbg").hide();
    $("#cba").hide();
  }
};

let groupCanvas = function () {
  var newGid = new Date().getTime();
  $("#canvas-board .canvas").each(function (index) {
    if ($(this).hasClass("selected")) {
      var tempGIDArrMe = $(this).attr("gid").split(",");
      tempGIDArrMe.push(newGid);
      $(this).attr("gid", tempGIDArrMe.join(",")).removeClass("selected");
    }
  });
  $("#cbg").hide();
  $("#cba").hide();
};
let apartCanvas = function () {
  $("#canvas-board .canvas").each(function (index) {
    if ($(this).hasClass("selected")) {
      var tempGIDArrMe = $(this).attr("gid").split(",");
      tempGIDArrMe.pop();
      if (tempGIDArrMe.length < 1) {
        var newGid = new Date().getTime();
        $(this)
          .attr("gid", newGid + index)
          .removeClass("selected");
      } else {
        $(this).attr("gid", tempGIDArrMe.join(",")).removeClass("selected");
      }
    }
  });
  $("#cbg").hide();
  $("#cba").hide();
};

let isCanvasBlank = function (canvas) {
  var context = canvas.getContext("2d");
  var pixelBuffer = new Uint32Array(
    context.getImageData(0, 0, canvas.width, canvas.height).data.buffer
  );

  return !pixelBuffer.some((color) => color !== 0);
};

//sizer
var firstSizerElem = null;
let adjustSizer = function () {
  var sizerElement = new Hammer($("#root").get(0));
  var isMainDrag = false;
  var lastMainPosX, lastMainPosY, lastWidgetPosX, lastWidgetPosY;
  sizerElement
    .get("pan")
    .set({ direction: Hammer.DIRECTION_ALL, threshold: 1 });
  sizerElement.get("press").set({ time: 2 });
  sizerElement.on("press", function (ev) {
    firstSizerElem = ev.target;
  });
  sizerElement.on("pressup", function (ev) {
    firstSizerElem = null;
  });

  sizerElement.on("pan", function (ev) {
    var elem;
    //移動的本體

    if (
      ($(firstSizerElem).parent().hasClass("main") ||
        $(firstSizerElem).parent().parent().hasClass("main") ||
        $(firstSizerElem).hasClass("main") ||
        $(firstSizerElem).hasClass("root")) &&
      !$("#sizer").hasClass("lock")
    ) {
      elem = $("#main").get(0);
      if (!isMainDrag) {
        isMainDrag = true;
        lastMainPosX = elem.offsetLeft;
        lastMainPosY = elem.offsetTop;
      }
      var posX = (ev.deltaX / stageRatio) * stageRatioMain + lastMainPosX;
      var posY = (ev.deltaY / stageRatio) * stageRatioMain + lastMainPosY;
      var rangeX = Math.abs((640 * (stageRatioMain - 1)) / 2);
      var rangeY = Math.abs((360 * (stageRatioMain - 1)) / 2);
      if (posX > rangeX) {
        posX = rangeX;
      } else if (posX < rangeX * -1) {
        posX = rangeX * -1;
      }
      if (posY > rangeY) {
        posY = rangeY;
      } else if (posY < rangeY * -1) {
        posY = rangeY * -1;
      }

      elem.style.left = posX + "px";
      elem.style.top = posY + "px";
    } else if ($(firstSizerElem).hasClass("sizer_dragger")) {
      if (!isMainDrag) {
        isMainDrag = true;
        lastMainPosY = firstSizerElem.offsetTop;
        $("#sizer").removeClass("lock");
      }
      var posY = (ev.deltaY / stageRatio) * stageRatioMain + lastMainPosY;
      posY = Math.min(40, posY);
      posY = Math.max(0, posY);
      firstSizerElem.style.top = posY + "px";
      //sizing
      stageRatioMain = 1 * (posY / 40) + 1;
      stageRatioReal = stageRatioRoot * stageRatioMain;
      stageRatio = Math.floor(stageRatioReal * 10) / 10;

      $("#sizer_dragger").text("x " + Math.round(stageRatioMain * 10) / 10);

      //
      $("#main").css(
        "-ms-transform",
        "scale(" + stageRatioMain + "," + stageRatioMain + ")"
      );
      $("#main").css(
        "-webkit-transform",
        "scale(" + stageRatioMain + "," + stageRatioMain + ")"
      );
      $("#main").css(
        "transform",
        "scale(" + stageRatioMain + "," + stageRatioMain + ")"
      );

      var rangeX = Math.abs((640 * (stageRatioMain - 1)) / 2);
      var rangeY = Math.abs((360 * (stageRatioMain - 1)) / 2);
      var sX = parseInt($("#main").get(0).style.left);
      var sY = parseInt($("#main").get(0).style.top);
      if (sX > rangeX) {
        $("#main").get(0).style.left = rangeX + "px";
      } else if (sX < rangeX * -1) {
        $("#main").get(0).style.left = rangeX * -1 + "px";
      }
      if (sY > rangeY) {
        $("#main").get(0).style.top = rangeY + "px";
      } else if (sY < rangeY * -1) {
        $("#main").get(0).style.top = rangeY * -1 + "px";
      }
    }

    //ending
    if (ev.isFinal) {
      isMainDrag = false;
      firstSizerElem = null;
      if (
        $("#sizer_dragger").text() == "x 1" &&
        !$("#sizer").hasClass("lock")
      ) {
        defaultSizer();
      }
    }
  });
};

let defaultSizer = function () {
  //reset sizer
  $("#sizer").show().addClass("lock");
  $("#sizer_dragger").text("x 1");
  $("#sizer_dragger").get(0).style.top = 0;
  stageRatioMain = 1;
  stageRatioReal = stageRatioRoot * stageRatioMain;
  stageRatio = Math.floor(stageRatioReal * 10) / 10;
  $("#main")
    .addClass("autoMoving")
    .css("-ms-transform", "scale(1,1)")
    .css("top", 0)
    .css("left", 0);
  $("#main")
    .addClass("autoMoving")
    .css("-webkit-transform", "scale(1,1)")
    .css("top", 0)
    .css("left", 0);
  $("#main")
    .addClass("autoMoving")
    .css("transform", "scale(1,1)")
    .css("top", 0)
    .css("left", 0);
  $("#main")
    .delay(600)
    .queue(function () {
      $(this).removeClass("autoMoving").dequeue();
    });
};

//共用音效控制
let $fill = new Audio("./sfx/fill.mp3");
let $chimes = new Audio("./sfx/chimes.mp3");
let $correct = new Audio("./sfx/correct.mp3");
let $fail = new Audio("./sfx/fail.mp3");
let $tryagain = new Audio("./sfx/tryagain.mp3");
let $stupid = new Audio("./sfx/stupid.mp3");
let $show = new Audio("./sfx/show.mp3");
let $bouncing = new Audio("./sfx/bouncing.mp3");
let $help = new Audio("./sfx/help.mp3");
let $pop = new Audio("./sfx/pop.mp3");
let $click = new Audio("./sfx/click.mp3");
let $surprise = new Audio("./sfx/surprise.mp3");
let $water = new Audio("./sfx/water.mp3");
let $good = new Audio("./sfx/good.mp3");
let $right = new Audio("./sfx/right.mp3");
let $wrong = new Audio("./sfx/wrong.mp3");
let $key = new Audio("./sfx/pushing_a_key.mp3");
let $beep = new Audio("./sfx/beep.mp3");
let $beam = new Audio("./sfx/beam.mp3");
let $flood = new Audio("./sfx/flood.mp3");
let $lava = new Audio("./sfx/lava.mp3");

//combine
var sfxLowLagged = 0;
let $SFXAr = [
  $fill,
  $chimes,
  $correct,
  $fail,
  $tryagain,
  $stupid,
  $show,
  $bouncing,
  $help,
  $pop,
  $click,
  $surprise,
  $water,
  $good,
  $right,
  $wrong,
  $key,
  $beep,
  $beam,
  $flood,
  $lava,
];
let $SFXNameAr = [
  "$fill",
  "chimes",
  "correct",
  "fail",
  "tryagain",
  "stupid",
  "show",
  "bouncing",
  "help",
  "pop",
  "click",
  "surprise",
  "water",
  "good",
  "right",
  "wrong",
  "key",
  "beep",
  "beam",
  "flood",
  "lava",
];
for (let k = 0; k < $SFXAr.length; k++) {
  $SFXAr[k].preload = "auto";
}
function lowlagSFX() {
  for (let k = sfxLowLagged; k < $SFXAr.length; k++) {
    lowLag.load([$SFXAr[k].src], $SFXNameAr[k]);
  }
}

//需用開始紐觸發
function activeSFX() {
  if (!isIE()) {
    for (let k = sfxLowLagged; k < $SFXAr.length; k++) {
      $SFXAr[k].play();
      $SFXAr[k].pause();
      sfxLowLagged += 1;
    }
  } else {
    for (let k = sfxLowLagged; k < $SFXAr.length; k++) {
      sfxLowLagged += 1;
    }
  }
  console.log("lowlag end at:" + sfxLowLagged);
}

function rootSoundEffectName($name, $showplayer, st, et) {
  resetAudio();
  //
  var gotAudio = false;
  for (let k = 0; k < $SFXNameAr.length; k++) {
    if ($name == $SFXNameAr[k]) {
      currentAudio = $SFXAr[k];
      gotAudio = true;
    }
  }
  if (!gotAudio) {
    console.log("沒有音檔:" + $name);
  }

  currentAudio.pause();
  currentAudio.currentTime = 0;
  if (st) {
    currentAudio.currentTime = st;
  }
  currentAudio.play();
  console.log("ie");

  if ($showplayer) {
    loadPlayer();
    $(currentAudio)
      .unbind()
      .on("timeupdate", function () {
        playerGotoPosition();
      })
      .on("ended", function () {
        playerAudioEnd();
      });
  } else {
    if (et) {
      $(currentAudio)
        .unbind()
        .on("timeupdate", function () {
          if (currentAudio.currentTime >= et) {
            currentAudio.pause();
          }
        })
        .on("ended", function () {
          console.log("force end");
        });
    }
  }
}

function rootSoundEffect($tar) {
  for (let k = 0; k < $SFXAr.length; k++) {
    if ($tar == $SFXAr[k]) {
      if (isIE()) {
        $tar.pause();
        $tar.currentTime = 0;
        $tar.play();
        console.log("ie");
      } else {
        lowLag.change($SFXNameAr[k], false);
        lowLag.stop();
        lowLag.play();
        console.log("non-ie");
      }
    }
  }
}

function resetPanel() {
  $("#masker").remove();
  $("#panel").remove();
  $("#zoomSensor").remove();
  $("#painting").remove();
}

function resetAudio() {
  $("#player").remove();
  lowLag.stop();
  if (currentAudio) {
    currentAudio.pause();
  }
}

// system funcs
let isIE = function () {
  if (!!window.ActiveXObject || "ActiveXObject" in window) {
    return true;
  } else {
    return false;
  }
};

let is_iPhone_or_iPad = function () {
  return (
    navigator.platform.indexOf("iPhone") != -1 ||
    navigator.platform.indexOf("iPad") != -1
  );
};

var isMobile = function () {
  try {
    document.createEvent("TouchEvent");
    return true;
  } catch (e) {
    return false;
  }
};

let getUrlParameter = function getUrlParameter(sParam) {
  let sPageURL = window.location.search.substring(1),
    sURLVariables = sPageURL.split("&"),
    sParameterName,
    i;

  for (i = 0; i < sURLVariables.length; i++) {
    sParameterName = sURLVariables[i].split("=");

    if (sParameterName[0] === sParam) {
      return sParameterName[1] === undefined
        ? true
        : decodeURIComponent(sParameterName[1]);
    }
  }
};

let resizeScreen = function () {
  let keying = false;
  $("input").each(function (index) {
    if ($(this).is(":focus")) {
      keying = true;
    }
  });

  if (!keying) {
    autofitScreen();
    setTimeout(function () {
      autofitScreen();
    }, 500);
    setTimeout(function () {
      autofitScreen();
    }, 1500);
  }

  //
  if ($(".btn_paletton").hasClass("active")) {
    $(".btn_paletton").click();
  }
};

let counter = 20;
let checkCompLoading = function (elem) {
  counter -= 1;
  let total = $(elem).find("> .assetsPreload").find("img").length;
  let imgGot = 0;
  $(elem)
    .find("> .assetsPreload")
    .find("img")
    .each(function (index) {
      if ($(this).width() * $(this).height() > 0) {
        imgGot += 1;
      }
    });

  if (imgGot / total >= 1 || counter < 0 || total == 0) {
    counter = 20;
    $("#loading p").text("Ready");

    //是否有loading effect
    if ($loadType != "") {
      $(elem)
        .delay(1000)
        .queue(function () {
          activeLoading();
          $(elem).dequeue();
          //
          $(elem).trigger("compLoaded");
        });
    } else {
      $(elem).trigger("compLoaded");
    }
    //hide image not found icon
    $("img").attr("onerror", "this.style.display='none'");
  } else {
    setTimeout(function () {
      checkCompLoading(elem);
    }, 100);
    $("#loading p").text(Math.ceil((100 * imgGot) / total) + "%");
  }
};

//等待載入
$loadType = "";
let activeLoading = function () {
  $("#loading p").text("");
  let typeString = "spinIn";
  $("#loading")
    .removeClass()
    .addClass("loading " + typeString);
  $("#loading")
    .unbind()
    .bind("dblclick", function () {
      deactiveLoading();
    });
};

let removeBR = function (str) {
  console.log(str);
  var arr = str.split(/<br\s*\/?>/);
  if (isitEmpty(arr[0])) {
    res = arr[0] + arr.slice(1).join("<br>");
  } else {
    res = str;
  }

  return res;
};

let deactiveLoading = function () {
  $("#loading").dequeue();
  $("#loading").clearQueue();
  $("#loading").removeClass().addClass("loading");
};

let formatIOSDate = function (str) {
  let iosDate = str.toString();
  iosDate = iosDate.replace("-", "/");
  iosDate = iosDate.replace("-", "/");
  //console.log("xxx:"+iosDate);
  return iosDate;
};

let openNewWindow = function (url) {
  //var a = $('a')[0];
  let a = $("<a href='" + url + "' target='_blank'>geo</a>").get(0);
  let e = document.createEvent("MouseEvents");
  e.initEvent("click", true, true);
  a.dispatchEvent(e);
};

let backToGEO = function () {
  let logoutConfirm = confirm("Log out now？");

  if (logoutConfirm) {
    //window.location.reload();

    $.ajax({
      type: "GET",
      url: "//api01.giraffe.com.tw/api/ludodo/eteaching/member-logout",
      data: { token: uToken },
      async: false,
      contentType: "application/json; charset=utf-8",
      timeout: 10000,
      cache: false,
      dataType: "xml",
      success: function (data) {
        console.log(data);
        let code = $(data).find("code").first().text();
        let msg = $(data).find("msg").first().text();
        if (code == "0" || code == 0) {
          window.location.reload();
        } else {
          alert(msg);
        }
      },
      error: function (xhr, ajaxOptions, thrownError) {
        console.log(thrownError);
        alert(thrownError);
      },
    });
  }
};

var getHighestDepthWidget = function (tar) {
  var nextZIndex = parseInt($("#widget").attr("zindex"));
  var curZIndex = parseInt(tar.css("z-index"));
  if (curZIndex != nextZIndex) {
    nextZIndex += 1;
    tar.css("z-index", nextZIndex);
    $("#widget").attr("zindex", nextZIndex);
    $("#canvas-board").attr("zindex", nextZIndex);
  }
};

var getHighestDepthCanvas = function (tar) {
  var nextZIndex = parseInt($("#canvas-board").attr("zindex"));
  var curZIndex = parseInt(tar.css("z-index"));
  if (curZIndex != nextZIndex) {
    nextZIndex += 1;
    var tempGIDArr = tar.attr("gid").split(",");
    var tempGID = tempGIDArr[tempGIDArr.length - 1];
    $("#canvas-board .canvas").each(function (index) {
      var tempGIDArrMe = $(this).attr("gid").split(",");
      var tempGIDMe = tempGIDArrMe[tempGIDArrMe.length - 1];
      if (tempGIDMe == tempGID) {
        $(this).css("z-index", nextZIndex);
      }
    });
    $("#canvas-board").attr("zindex", nextZIndex);
  }
};

let showError = function (msg) {
  alert(msg);
};

//
window.onload = function () {
  //
  if (!isIE()) {
    lowLag.init();
    lowlagSFX();
    activeSFX();
  }
  resizeScreen();
  //onerror="this.style.display='none'"
};

// Dynamic Functions

var afterDice, withinCheckAnswer, withinShowAnswer, withinResetElem, tapElem;

var resetDynamicFunctions = function () {
  tapElem = function (tar) {
    console.log("init tapElem:", tar);
  };
  afterDice = function (points) {
    console.log("init afterDice:", points);
  };
  withinCheckAnswer = function () {
    console.log("init afterCheckAnswer");
  };

  withinShowAnswer = function (boolean) {
    console.log("init afterShowAnswer:", boolean);
  };
  withinResetElem = function () {
    console.log("init afterResetElem");
  };
};
