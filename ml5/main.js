$(document).ready(function() {
  var face = "🙃";
  var video = document.getElementById('video');
  var constraints = { audio:false, video: {width:640, height:480} };

  /**
   * PHASE 1:
   *
   * A little bit of playing with the browser's UserMedia API.
   *
   * This function connects the video element on the page
   * to input from the webcam.
   */
  function connectWebcamToVideo() {
    navigator.mediaDevices.getUserMedia(constraints).then(function(stream) {
      video.width = constraints.video.width;
      video.height = constraints.video.height;
      video.srcObject = stream;
    });
  }

  /**
   * PHASE 2:
   *
   * Setting up a pre-trained PoseNet Model in ML5
   *
   * This function sets up the posenet model, and
   * and handles its detections.
   */
  function runPoseNet() {
    var poseNet = ml5.poseNet(video, function() {
        $('.overlay').fadeOut();

        poseNet.on("pose", function(results) {
          // If there aren't any detections,
          // remove any indicators from the frame.
          if (results.length == 0 ) { $('.detection').remove(); }

          var bounds = video.getBoundingClientRect();

          // Loop over the detected results:
          for (var index in results) {
            var result = results[index];

            console.log(result);

            // Draw three keypoints on the screen.
            var nose = drawKeypoint("nose", result, bounds)
            var left = drawKeypoint("leftEar", result, bounds);
            var right = drawKeypoint("rightEar", result, bounds);

            // Calculate key emoji parameters.
            var location = getLocation(nose, bounds)
            var scale = getScale(left, right)

            // Draw the emoji!
            drawEmoji(location, scale)
          }
        });
    });
  }

  /**
   * PHASE 3
   *
   * A little bit of debugging!
   *
   * This function draws the detected keypoint that
   * you choose to the screen in absolute coordinates.
   */
  function drawKeypoint(keypointName, result, bounds) {

    if ($('.' + keypointName).length == 0) {
      $(document.body).append(
        $('<span>')
          .addClass('detection')
          .addClass('point')
          .addClass(keypointName)
      );
    }

    $('.' + keypointName)
      .css("top", (bounds.top + result.pose[keypointName].y) + 'px')
      .css("left", (bounds.left + result.pose[keypointName].x) + 'px');

    return result.pose[keypointName];
  }

  /**
   * PHASE 4
   *
   * A little bit of math.
   *
   * Getting th
   */
  function getLocation(keypoint, bounds) {
    return {
      top: bounds.top + keypoint.y + 'px',
      left: bounds.left + keypoint.x + "px"
    }
  }

  function getScale(left, right) {
    let distance = Math.sqrt(Math.pow(right.x - left.x, 2) + Math.pow(right.y - left.y, 2));
    let normal = 110;
    return (distance / normal) * 12 + 'em';
  }

  /**
   * This function draws the detected keypoint that
   * you choose to the screen in absolute coordinates.
   */
  function drawEmoji(location, scale) {
      console.log(location);
      console.log(scale);

      if ($('.emoji-wrapper').length == 0) {
        var span = $('<span>')
          .addClass('detection')
          .addClass('emoji-wrapper');

        var emojiElement = $('<span>')
          .addClass('emoji')
          .text(face);

        span.append(emojiElement);

        $(document.body).append(span)
      }

      $('.emoji-wrapper')
        .css('top', location.top)
        .css('left', location.left)

      $('.emoji')
        .css('font-size', scale);
  }

  connectWebcamToVideo()
  runPoseNet()

});
