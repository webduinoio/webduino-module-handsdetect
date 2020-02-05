class HandDetect {
  constructor() {
    this.strokeStyle = '#ff0000';
    this.lineWidth = 5;
    this.callbackList = [];
    this.modelParams = {
      flipHorizontal: true, // flip e.g for video 
      imageScaleFactor: 0.8, // reduce input image size .
      maxNumBoxes: 20, // maximum number of boxes to detect
      iouThreshold: 0.5, // ioU threshold for non-max suppression
      scoreThreshold: 0.9, // confidence threshold for predictions.
    }
  }

  setCamera(cam) {
    this.cam = cam;
  }

  setRectStyle(color, lineWidth) {
    this.strokeStyle = color;
    this.lineWidth = lineWidth;
  }

  on(callback) {
    this.callbackList.push(callback);
  }

  start(scoreThreshold) {
    //this.strokeStyle = color;
    //this.lineWidth = lineWidth;
    /*
       [{
       bbox: [x, y, width, height],
       class: "hand",
       score: 0.8380282521247864
       }, {
         bbox: [x, y, width, height],
         class: "hand",
         score: 0.74644153267145157
       }]
     */
    if (scoreThreshold) this.modelParams.scoreThreshold = scoreThreshold;
    handTrack.load(this.modelParams).then(model => {
      var hands = [];
      var self = this;
      self.cam.onCanvas(function (canvas) {
        var ctx = canvas.getContext("2d");
        ctx.beginPath();
        ctx.strokeStyle = self.strokeStyle;
        ctx.lineWidth = self.lineWidth;
        while (hands.length > 0) {
          var hand = hands.pop();
          hand[0] = Math.round(hand[0]);
          hand[1] = Math.round(hand[1]);
          hand[2] = Math.round(hand[2]);
          hand[3] = Math.round(hand[3]);
          // process callback
          for (var i = 0; i < self.callbackList.length; i++) {
            self.handInfo = hand;
            self.callbackList[i](hand);
          }
          //flip
          hand[0] = canvas.width - (hand[0] + hand[2]);
          ctx.rect(hand[0], hand[1], hand[2], hand[3]);
        }
        ctx.stroke();
        model.detect(canvas).then(predictions => {
          var amt = predictions.length;
          for (var i = 0; i < amt; i++) {
            var data = predictions[i]['bbox'];
            data.push(predictions[i]['score']);
            hands.push(data);
          }
        });
      });
    });
  }
}