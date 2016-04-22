$(function() {
  var isSuccess = false;
  var lang;


  /** ------------------------
   *
   * multi-language
   * 
   * ------------------------ */
  var langDict = {
    "english": {
      "lang-1": "<div>This may be the most dangerous app. You have to keep writing, or everything will be erased if you stop beyond the expiring time.</div><div>Now set the duration time you want to focus and the exciting expiring time.</div>",
      "lang-2": "Lasts for(minutes):", 
      "lang-3": "Expires in(seconds):",
      "lang-4": "Begin",
      "lang-5": "Time's up :( <br> Be more focus next time.",
      "lang-6": "Again",
      "lang-7": "Reset time",
      "lang-8": "Good job!<br />Do you want to go back to copy what you have written?",
      "lang-9": "Go back to copy",
      "lang-10": "Give up"
    },
    "chinese": {
      "lang-1": "<div>��Ҳ������������Σ�յ�д��Ӧ�ã������趨��ʱ����ڣ������ֹͣ�������ֳ����趨�ļ��ʱ�䣬֮ǰд�µ��������ݶ�����ʧ��</div><div>�������趨����ʱ��κͼ��ʱ�䡣</div>",
      "lang-2": "����ʱ��Σ�",
      "lang-3": "���ʱ�䣺",
      "lang-4": "��ʼ",
      "lang-5": "ʱ�䵽 _(:3 ����)_ <br> �´�Ҫ����ר��Ŷ~",
      "lang-6": "����һ��",
      "lang-7": "����ʱ��",
      "lang-8": "�ޡ�<br />�����ȥ���Ƹո�д��������",
      "lang-9": "��ȥ����",
      "lang-10": "��Ҫ��д"
    },
    "japanese": {
      "lang-1": "",
      "lang-2": "�־A�r�g:",
      "lang-3": "�g���r�g��",
      "lang-4": "�_ʼ",
      "lang-5": "ʱ�䵽 _(:3 ����)_ <br> �´�Ҫ����ר��Ŷ~",
      "lang-6": "����һ��",
      "lang-7": "����ʱ��",
      "lang-8": "�ޡ�<br />�����ȥ���Ƹո�д��������",
      "lang-9": "��ȥ����",
      "lang-10": "��Ҫ��д"
    }
  };

  $("[name=" + "english" + "]").addClass("hidden");

  function changeLanguage(lang) {
    for (var key in langDict) {
      $("[name=" + key + "]").removeClass("hidden");
    }
    $("[name=" + lang + "]").addClass("hidden");
    var chosenLang = langDict[lang];
    for (var langKey in chosenLang) {
      var langValue = chosenLang[langKey];
      $("." + langKey).html(langValue);
    }
  }

  $(".langSet").bind("click", function() {
    lang = $(this).attr("name");
    changeLanguage(lang);
  })



  /** ------------------------
   *
   * simplemde-markdown-editor
   * https://github.com/NextStepWebs/simplemde-markdown-editor
   * 
   * ------------------------ */
  var simplemde = new SimpleMDE({ element: $("#MyID")[0] });
  simplemde.value('');

  // let the height of typingarea adaptive
  // I didn't put them in the "begin" function because input GUI of mobiles would influence the height of window.innerHeight
  var $header = $("header");
  var $headerHeight = $header.height();

  var $footer = $("footer");
  var $footerHeight = $footer.height();
  
  var $mainWrapper = $(".main-wrapper"); 

  var $codeMirror = $(".CodeMirror");

  var pre = window.innerHeight - $headerHeight - $footerHeight;
  $mainWrapper.height(pre);
  $codeMirror.height(pre - 120);
  $codeMirror.css("background-color", "lightblue");



  /** ------------------------
   *
   * timer
   * 
   * ------------------------ */
  var remainingSet, expireSet, remainingOrigin, expireOrigin;

  // check whether the input for time is number
  $("form.intro :input").bind("blur", function() {
    if ($(this).is("#remainingTime")) {
      if (this.value > 0) {
        remainingSet = this.value * 60 * 1000;
        // save the initial set and prepare for users' choice to write again
        remainingOrigin = remainingSet;
      } else {
        alert("Please input positive numbers");
      }
    }
    if ($(this).is("#expireTime")) {
      if (this.value > 0) {
        expireSet = this.value * 1000;
        expireOrigin = expireSet;
      } else {
        alert("Please input positive numbers");
      }
    }
  })  

  $("button.submit").bind("click", function() {
    if ((typeof remainingSet) == "number" && (typeof expireSet) == "number") {
      $("div.fullpage-intro").css("display", "none");
      begin();
    } else {
      alert("Please input two positive numbers");
    }
  })

  var begin = function() {
    // show the remaining time and expiring time
    var $remainingShow = $("#remaining")
    var $expireShow = $("#expire")

    if (remainingSet <= 60000) {
      $remainingShow.text((remainingSet / 1000).toFixed(1) + "\"");
    } else {
      $remainingShow.text((remainingSet / 60000).toFixed(2) + "\'");
    }

    $expireShow.text((expireSet / 1000).toFixed(1) + "\"");


    function setExpire(value) {
      var value = value - 100;
      $expireShow.text((value / 1000).toFixed(1) + "\"");
      if (value <= 0) {
        // if both the time equal 0 at the same time, don't show the ".fail" overlay
        if (remainingSet + 100 == expireSet) {
          return false;
        } else {
          simplemde.value('');
          clearInterval(timer);
          $codeMirror.stop(true, true);
          if (remainingSet != expireSet) {
            $("div.fullpage-overlay.fail").removeClass("hidden");
          }
        }
      }
    }

    function setRemaining(value) {
      if (value <= 60000) {
        $remainingShow.text((remainingSet / 1000).toFixed(1) + "\"");
      } else {
        $remainingShow.text((remainingSet / 60000).toFixed(2) + "\'");
      }
      if (value <= 0) {
        // alert ("remaining"+value);
        clearInterval(timer);
        isSuccess = true;
        $codeMirror.stop();
        $codeMirror.css("opacity", "1");
        $("div.fullpage-overlay.success").removeClass("hidden");
      }
    }

    var timer = setInterval(function(){
      remainingSet = remainingSet - 100;
      setExpire(expireSet);
      setRemaining(remainingSet);
      expireSet = expireSet - 100;
    }, 100);

    // make text gradient
    $codeMirror.animate({opacity:'0'}, expireOrigin);
    // remember to clear the animation queue first
    simplemde.codemirror.on("change", function() {
      if (isSuccess === false) {
        expireSet = expireOrigin;
        $codeMirror.stop(true, true);
        $codeMirror.css("opacity", "1");
        $codeMirror.animate({opacity:'0'}, expireOrigin);
      }
      return false;
    });
  }



  /** ------------------------
   *
   * overlay (success or fail)
   * 
   * ------------------------ */
  $(".go-copy").bind("click", function() {
    $("div.fullpage-overlay").addClass("hidden");
  });

  $(".write-again").bind("click", function() {
    $("div.fullpage-overlay").addClass("hidden");
    $codeMirror.css("opacity", "1");
    simplemde.value('');
    remainingSet = remainingOrigin;
    expireSet = expireOrigin;
    isSuccess = false;
    begin();
    changeLanguage(lang);
  });
});