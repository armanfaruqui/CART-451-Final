//Adding support to different subredits
var tx_subs = [
  "/r/InterdimensionalCable",
  "/r/NotTimAndEric",
  "/r/ACIDS",
  "/r/fifthworldvideos",
  "/r/IllBeYourGuide",
  "/r/CommercialCuts",
];
var len_subs = tx_subs.length; // Number of subreddits videos are being called from
var MAX_REQ = 50; //Max number of links will be requested each JSON call
var PROB = 14; //Probability of accepting link (percentage)
var min_score = 1; //Minimum score for reddit posts

var state = null; // State variable that checks if the current content is crowdsourced from Reddit or from my array
var region = null; // State variable that checks which regional array the current content is from

// Timer variables
var sec = null;
var timer = null;
var timerScore = 0;

// Scores used by algorithm to determine which content users are more comfortable with
var northAmericaScore = 20;
var latinAmericaScore = 20;
var europeScore = 20;
var africaScore = 20;
var eastAsiaScore = 20;
var middleEastScore = 20;

var count = 0; // Counts number of videos gone through
var totalScore = 60; // Algorithm scores
var currentScore = 0;

var emojiClicked = false;

var min_score_slider = document.getElementById("min_score"); //Slider for minimum reddit score
var min_score_output = document.getElementById("score_preview"); //Output for minimum reddit score

// Update the min score & output whenever slider value changes
min_score_slider.oninput = function () {
  min_score_output.innerHTML = this.value;
  min_score = this.value;
};

// Array prototype functions
if (!Array.prototype.randomElement) {
  Array.prototype.randomElement = function () {
    return this[Math.floor(Math.random() * this.length)]; // Returns a randomly selected element
  };
}

if (!Array.prototype.randomPop) {
  Array.prototype.randomPop = function () {
    var index = Math.floor(Math.random() * this.length);
    return this.splice(index, 1)[0]; // Returns
  };
}

// Runs the animation when the TV is turned on/ the channel is changed
function animate_object(selector) {
  var reset = function () {
    // TODO: Will this work?
    $(selector).toggleClass("reset-animation");
  };

  reset();
  setTimeout(reset, 200);
}

// Returns ID from youtube url
function youtube_parser(url) {
  var regExp =
    /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  var match = url.match(regExp);
  if (match && match[2].length == 11) {
    return match[2];
  } else {
    //error
  }
}

// Starts Timer
function startTimer() {
  sec = 0;
  var ele = document.getElementById("timer");
  timer = setInterval(() => {
    sec++;
    ele.innerHTML = "00:" + sec;
  }, 1000);
}

// Ends timer and updates the algorithm
function endTimer() {
  var timeSpent = sec;
  console.log(`TIme score ${timeSpent}`);
  clearInterval(timer);

  if (timeSpent > 8 && timeSpent <= 30) {
    timerScore = 1;
  } else if (timeSpent > 30 && timeSpent <= 45) {
    timerScore = 2;
  } else if (timeSpent > 45 && timeSpent <= 60) {
    timerScore = 3;
  } else if (timeSpent > 60) {
    timerScore = 4;
  }

  if (region === "northAmerica") {
    northAmericaScore = northAmericaScore - timerScore;
  } else if (region === "latinAmerica") {
    latinAmericaScore = latinAmericaScore - timerScore;
  } else if (region === "europe") {
    europeScore = europeScore - timerScore;
  } else if (region === "africa") {
    africaScore = africaScore - timerScore;
  } else if (region === "eastAsia") {
    eastAsiaScore = eastAsiaScore - timerScore;
  } else if (region === "middleEast") {
    middleEastScore = middleEastScore - timerScore;
  }
}

// Allows emoji selection to affect the algorithm
function emojiSelect() {
  console.log("emoji button clicked");
  $(love).on("click", emojiAlgorithm(2));
  $(lol).on("click", emojiAlgorithm(2));
  $(mono).on("click", emojiAlgorithm(-1));
  $(wut).on("click", emojiAlgorithm(-2));
  $(whoa).on("click", emojiAlgorithm(-3));
}

function emojiAlgorithm(score) {
  if (state === "array" && region === "northAmerica") {
    if (emojiClicked === false) {
      emojiScore = score;
      northAmericaScore = northAmericaScore - emojiScore;
      console.log("emoji clicked");
      emojiClicked = true;
    }
  }
  if (state === "array" && region === "latinAmerica") {
    if (emojiClicked === false) {
      emojiScore = score;
      latinAmericaScore = latinAmericaScore - emojiScore;
      console.log("emoji clicked");
      emojiClicked = true;
    }
  }
  if (state === "array" && region === "europe") {
    if (emojiClicked === false) {
      emojiScore = score;
      europeScore = europeScore - emojiScore;
      console.log("emoji clicked");
      emojiClicked = true;
    }
  }
  if (state === "array" && region === "africa") {
    if (emojiClicked === false) {
      emojiScore = score;
      africaScore = africaScore - emojiScore;
      console.log("emoji clicked");
      emojiClicked = true;
    }
  }
  if (state === "array" && region === "eastAsia") {
    if (emojiClicked === false) {
      emojiScore = score;
      eastAsiaScore = eastAsiaScore - emojiScore;
      console.log("emoji clicked");
      emojiClicked = true;
    }
  }
  if (state === "array" && region === "middleEast") {
    if (emojiClicked === false) {
      emojiScore = score;
      middleEastScore = middleEastScore - emojiScore;
      console.log("emoji clicked");
      emojiClicked = true;
    }
  }
}

window.onload = function () {
  // DOM Emoji elements
  var love = document.getElementById("love");
  var lol = document.getElementById("lol");
  var mono = document.getElementById("mono");
  var wut = document.getElementById("wut");
  var whoa = document.getElementById("whoa");
  var emojis = document.getElementsByClassName("emojis");
  var emojiScore = 0;
};

emojiSelect();

$(function () {
  var get_next_post = (function () {
    var youtube_video_regex = new RegExp(
      /(?:youtube\.com\/\S*(?:(?:\/e(?:mbed))?\/|watch\/?\?(?:\S*?&?v\=))|youtu\.be\/)([a-zA-Z0-9_-]{6,11})/
    );

    var videos = [],
      played = [];

    var probability_filter = function () {
      var trial = 100 * Math.random();
      return trial <= PROB; // Returns true or false
    };

    var get_api_call = function (time, sort, page) {
      var cb_subs = new Array(len_subs);
      cb_subs[0] = document.getElementById("IDC"); // Default
      cb_subs[1] = document.getElementById("NTE"); // Not Tim and Eric
      cb_subs[2] = document.getElementById("ACI"); // ACIDS
      cb_subs[3] = document.getElementById("FWV"); // Fifth World Videos
      cb_subs[4] = document.getElementById("IBG"); // I'll Be Your Guide
      cb_subs[5] = document.getElementById("CMC"); // Commercial Cuts

      console.log(cb_subs[0]);
      console.log(cb_subs[1]);

      //commit
      var final_url;
      var exist_checked = false;
      for (let i = 0; i < len_subs; i++) {
        exist_checked = exist_checked;
      }

      if (exist_checked) {
        do {
          var random_sub = Math.floor(len_subs * Math.random()); // Selects a random number between 0 and number of subs
        } while (cb_subs[random_sub].checked == false);

        let tx_message = "Checkeados:\n";
        for (let i = 0; i < len_subs; i++) {
          if (cb_subs[i].checked == true)
            tx_message += " · " + tx_subs[i] + "\n";
        }
      } else {
        // If non option is checked, use the default sub at position 0
        var random_sub = 0;
      }
      var prefix = `https://www.reddit.com` + tx_subs[random_sub];
      var suffix = ``;

      return (
        `https://www.reddit.com` +
        tx_subs[random_sub] +
        `/search.json?q=site%3Ayoutube.com+OR+site%3Ayoutu.be&restrict_sr=on&sort=${sort}&t=${time}&show="all"&limit=` +
        MAX_REQ +
        suffix
      );

      return null;
    };

    var add_youtube_url = function (reddit_post_data) {
      // Check if the URL is for youtube
      if (!youtube_video_regex.test(reddit_post_data.url)) {
        return false;
      }
      // Check to see if the entire video is being linked.
      // If a certain index is being linked, ignore the video.
      if (reddit_post_data.url.indexOf("t=") != -1) {
        return false;
      }
      // Check if a reddit post has less than 1 points.
      // If the post does, ignore it. It is unworthy.
      if (reddit_post_data.score < min_score) {
        return false;
      }
      var groups = youtube_video_regex.exec(reddit_post_data.url);
      // TODO: Trim video id?
      var video_id = groups[1]; // 2nd group is the video id.
      if (played.indexOf(video_id) != -1) {
        return false;
      }
      videos.push({
        video: video_id,
        link: `https://www.reddit.com${reddit_post_data.permalink}`,
      });
      played.push(video_id);
      return true;
    };

    // Loads reddit video URLs
    var load_posts = function () {
      var time = ["week", "month", "year", "all"].randomElement();
      var sort = ["relevance", "hot", "top", "new", "comments"].randomElement();
      var page = ["hot", "top", "new"].randomElement();
      var url = get_api_call(time, sort, page);
      console.log(`This is the url: ${url}`);
      if (url != "nada") {
        //Dirty awful hack
        $.getJSON(url, function (api_response) {
          api_response.data.children.forEach(function (child) {
            if (probability_filter()) {
              if (add_youtube_url(child.data)) {
                console.log("Added " + child.data.url);
              } else {
                console.log("Ignored " + child.data.url);
              }
            }
          });
        }).fail(function () {
          // Re-Poll on timeout/parse failure
          setTimeout(load_posts, 5000);
        });
      } //Else: see inside get_api_call()
    };

    // Loads video IDs from array of youtube urls
    var loadNews = function () {
      totalScore =
        northAmericaScore +
        latinAmericaScore +
        europeScore +
        eastAsiaScore +
        middleEastScore +
        africaScore;
      currentScore = Math.floor(Math.random() * totalScore);
      console.log(totalScore);
      console.log(currentScore);
      if (currentScore >= 0 && currentScore <= northAmericaScore) {
        region = "northAmerica";
        // Load video from North America array
        let url = links.northAmerica.randomPop();
        let id = youtube_parser(url);
        console.log(`id ${id}`);
        return { link: url, video: id };
      } else if (
        currentScore > northAmericaScore &&
        currentScore <= northAmericaScore + latinAmericaScore
      ) {
        region = "latinAmerica";
        // Load video from Latin America array
        let url = links.latinAmerica.randomPop();
        let id = youtube_parser(url);
        console.log(`id ${id}`);
        return { link: url, video: id };
      } else if (
        currentScore > northAmericaScore + latinAmericaScore &&
        currentScore <= northAmericaScore + latinAmericaScore + europeScore
      ) {
        region = "europe";
        // Load video from Europe array
        let url = links.europe.randomPop();
        let id = youtube_parser(url);
        console.log(`id ${id}`);
        return { link: url, video: id };
      } else if (
        currentScore > northAmericaScore + latinAmericaScore + europeScore &&
        currentScore <=
          northAmericaScore + latinAmericaScore + europeScore + africaScore
      ) {
        region = "africa";
        // Load vide form Africa array
        let url = links.africa.randomPop();
        let id = youtube_parser(url);
        console.log(`id ${id}`);
        return { link: url, video: id };
      } else if (
        currentScore > northAmericaScore + latinAmericaScore + europeScore &&
        currentScore <=
          northAmericaScore + latinAmericaScore + europeScore + eastAsiaScore
      ) {
        region = "eastAsia";
        // Load video from East Asia array
        let url = links.eastAsia.randomPop();
        let id = youtube_parser(url);
        console.log(`id ${id}`);
        return { link: url, video: id };
      } else if (
        currentScore >
          northAmericaScore + latinAmericaScore + europeScore + eastAsiaScore &&
        currentScore &&
        currentScore <= totalScore
      ) {
        region = "middleEast";
        // Load video from Middle East array
        let url = links.middleEast.randomPop();
        let id = youtube_parser(url);
        console.log(`id ${id}`);
        return { link: url, video: id };
      }
    };

    // Resets the variables that affect which video is likely to be displayed after 20 cycles
    var resetAlgorithm = function () {
      if ((count) => 20) {
        northAmericaScore = 20;
        latinAmericaScore = 20;
        europeScore = 20;
        africaScore = 20;
        eastAsiaScore = 20;
        middleEastScore = 20;
        count = 0;
      }
    };

    load_posts();

    //Loads the next set of videos
    var get_next_post = function () {
      let random = Math.random();
      if (random <= 0.5) {
        // 50 % chance its from reddit
        state = "reddit";
        region = "null";
        startTimer();
        emojiClicked = false;
        // If length of loaded video array is zero, try again AND again.
        if (videos.length < 5) {
          load_posts();
        }
        console.log(videos.randomPop());
        return videos.randomPop();
      } else if (random > 0.5) {
        // 50% chance its from my arrays
        state = "array";
        count++;
        startTimer();
        emojiClicked = false;
        console.log("Timer Started");
        return loadNews();
      }

      resetAlgorithm();
    };

    return get_next_post;
  })();

  // Channel change sfx
  var sound_effect = (function () {
    var sounds = {
      off: document.getElementById("off-audio"),
      switch: document.getElementById("switch-audio"),
    };
    return function (callback, effect) {
      var sound_effect = sounds[effect];
      return function () {
        sound_effect.play();
        callback();
      };
    };
  })();

  var animation = (function () {
    var crt_click = document.getElementById("off-audio");

    var last_timeout_id = undefined;

    return function (callback, external) {
      var background_animation = document.getElementById("rick-bg");
      var duration = background_animation.duration * 1000;

      if (last_timeout_id !== undefined) {
        console.log("Clearing last timeout");
        clearTimeout(last_timeout_id);
        //return false;
      }

      if (external === undefined) {
        external = 0;
      } else {
        external -= 800;
      }

      var click_offset = duration - 800;

      var arg_count = arguments.length;
      var callback_args = Array.prototype.slice.call(
        arguments,
        1,
        arg_count - 1
      );

      setTimeout(function () {
        background_animation.play();

        let last_time_id = setTimeout(function () {
          callback.apply(this, callback_args);
          last_time_id = undefined;
        }, click_offset);
      }, external);

      return true;
    };
  })();

  var animate_callback = function (callback) {
    return function () {
      if (animation(callback)) {
        endTimer();
        console.log("Timer Cleared");
        return;
      }
      callback();
    };
  };

  var volume_controller = function (player) {
    var playing_clip = false;

    var guard = function (other) {
      return function () {
        if (playing_clip) {
          return;
        }
        other.apply(this, arguments);
      };
    };

    var toggle_mute = function () {
      if (player.isMuted()) {
        player.unMute();
        animate_object(".volume");
      } else {
        player.mute();
      }
      $(".container").toggleClass("mute");
    };

    var set_volume = function (volume) {
      $(".volume").attr("data-volume", volume);
      animate_object(".volume");
      player.setVolume(volume);
    };

    var volume_up = function () {
      if (player.getVolume() == 100) {
        return;
      }

      if (player.isMuted()) {
        // Unmute the player
        toggle_mute();
      }

      set_volume(player.getVolume() + 10);
    };

    var volume_down = function () {
      if (player.getVolume() == 0) {
        return;
      }

      set_volume(player.getVolume() - 10);

      if (player.getVolume() == 0) {
        toggle_mute();
      }
    };

    var play_clip = function (audio_clip) {
      var initial_volume = player.getVolume();
      var ducked_volume = initial_volume / 10;

      player.setVolume(ducked_volume);
    };

    set_volume(50);

    return [toggle_mute, volume_up, volume_down, play_clip].map(guard);
  };

  var channel_manager = function (player, get_next_video, play_clip) {
    var channel_names = [
      "1",
      "2",
      "TWO",
      "3",
      "4",
      "42",
      "1337",
      "5",
      "6",
      "117",
      "💵",
      "💰",
      "7",
      "A113",
      "8",
      "AMMEL",
      "9",
      "10",
      "🐐",
      "101",
      "C137",
      "👌😂",
      "🍌",
      "☭",
      "🍆",
      "20",
      "30",
      "40",
      "50",
      "60",
      "69",
      "80",
      "90",
      "100",
      "/co/",
      "C132",
      "35C",
      "J19ζ7",
    ];

    var next_channel = function () {
      // Set channel name
      $("[data-channel-id]").attr("data-channel-id", channel_names.randomPop());

      var video = get_next_video();
      console.log(`This is ${video}`);

      // Display to the user that we ran out of video
      // This is probably from Reddit not responding to API requests.
      if (video === null) {
        $(".container").addClass("offline");
        var with_sound = sound_effect(next_channel, "switch");
        setTimeout(animate_callback(with_sound), 1000);
        return;
      }

      $(".container").removeClass("offline");

      player.loadVideoById(video);
    };

    return next_channel;
  };

  var tv_toggle = (function () {
    var player = null;
    var player_switch_handler = 0;

    var add_current_channel = function () {
      var videoInfo = player.getVideoData();
      var videoUrl = player.getVideoUrl();

      var imgUrl = `http://img.youtube.com/vi/${videoInfo.video_id}/mqdefault.jpg`;

      var listNode = $("#list-template li").clone();

      listNode.find(".poster div").css("background-image", `url(${imgUrl})`);
      listNode.find(".video-title").text(videoInfo.title);
      listNode.find(".video-author").text(videoInfo.author);

      listNode.find("a").attr({
        href: videoUrl,
        target: "_blank",
        title: videoInfo.title,
      });
      listNode.prependTo(".shows");
    };

    var get_next_video = function () {
      var post = get_next_post();
      console.log(`This is ${post}`);
      if (state === "reddit") {
        console.log(`Right here ${post.link}`);
        $("#video-url").attr({
          href: post.link,
          target: "_blank",
        });
      } else if (state === "array") {
        $("#video-url").attr({
          href: post,
          target: "_blank",
        });
      }
      return post.video;
    };

    var toggle_tv_classes = function () {
      // Turns the TV on and off
      $("body").toggleClass("tv-on");
      $("body").toggleClass("tv-off");
    };

    var on_ready = function (event) {
      // Changing this line because I need to run this in legacy machines
      //let [toggle_mute, volume_up, volume_down, play_clip] = volume_controller(player);
      var volume_controller_return = volume_controller(player);
      var toggle_mute = volume_controller_return[0];
      var volume_up = volume_controller_return[1];
      var volume_down = volume_controller_return[2];
      var play_clip = volume_controller_return[3];

      // Volume control
      $("#mute").on("click", animate_callback(toggle_mute));
      $("#volume-up").on("click", animate_callback(volume_up));
      $("#volume-down").on("click", animate_callback(volume_down));

      var next_channel = channel_manager(player, get_next_video, play_clip);

      // Move to the next channel
      $("#channel-up").on(
        "click",
        animate_callback(
          sound_effect(function () {
            if (!isNaN(player.getDuration())) {
              add_current_channel();
            }
            next_channel();
          }, "switch")
        )
      );

      $("#menu").on(
        "click",
        animate_callback(function () {
          $(".container").toggleClass("menu-overlay");
        })
      );

      // Start the set of videos
      //$("#channel-up").click();
    };

    var on_state_change = function (event) {
      switch (event.data) {
        case YT.PlayerState.ENDED:
          var last_url = player.getVideoUrl();
          setTimeout(function () {
            if (player_switch_handler == null) {
              return;
            }
            if (last_url !== player.getVideoUrl()) {
              return;
            }
            console.log("ENDED event");
            $("#channel-up").click();
          }, 50);
          return;
        case YT.PlayerState.PLAYING:
          clearTimeout(player_switch_handler);
          player_switch_handler = setTimeout(function () {
            console.log("Running PLAYING event");
            $("#channel-up").click();
            player_switch_handler = null;
          }, player.getDuration() * 1000 - 900);
          return;
        case YT.PlayerState.PAUSED:
          event.target.playVideo();
          return;
      }
    };

    var on_error = function (event) {
      // Changes channel when theres an error
      console.log("On Error Event");
      $("#channel-up").click();
    };

    var create_player = function () {
      // Creates the youtube player
      return new YT.Player("yt-iframe", {
        width: 1280,
        height: 720,
        videoId: get_next_video(),
        playerVars: {
          autoplay: 1,
          controls: 0,
          showinfo: 0,
          rel: 0,
          iv_load_policy: 3,
          disablekb: 1,
        },
        events: {
          onReady: on_ready,
          onStateChange: on_state_change,
          onError: on_error,
        },
      });
    };

    return function () {
      console.log("returning");
      toggle_tv_classes();

      if (player !== null) {
        player.destroy();

        var handlers = [
          "#menu",
          "#mute",
          "#channel-up",
          "#volume-up",
          "#volume-down",
          "#video-url",
        ];

        handlers.forEach(function (item) {
          $(item).off("click");
        });

        // Make sure we disable the menu.
        $(".container").removeClass("menu-overlay");

        // Make sure we can restart the TV
        player = null;

        return;
      }

      player = create_player();
    };
  })();

  $("#power").on("click", animate_callback(sound_effect(tv_toggle, "off")));
  $("body").addClass("tv-off");
});
