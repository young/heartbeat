
function sketch(p5Ref) {
  let x, y, img;
  const hearts = [];

  p5Ref.preload = function() {
    img = p5Ref.loadImage('./static/heart.png');
  };

  p5Ref.setup = function() {
    const canvas = p5Ref.createCanvas(p5Ref.windowWidth, p5Ref.windowHeight);

    // Set background color
    p5Ref.background('transparent');
    p5Ref.stroke(0, 18);
    canvas.id('heart-canvas');
    for (let i = 0; i < 100; i++) {
      hearts.push(new Heart());
    }
  };

  p5Ref.draw = function() {
    p5Ref.background('transparent');

    for (let h in hearts) {
      let heart = hearts[h];
      heart.display();
      heart.move();
    }
  };

  function Heart() {
    this.y = -50;
    this.x = p5Ref.random(5, p5Ref.width - 45);
    this.rate = p5Ref.random(0.5, 3);
  }

  Heart.prototype.move = function() {
    // Float up
    this.y = this.y + this.rate;

    if (this.y > p5Ref.height) {
      this.y = -5;
      this.x = p5Ref.random(5, p5Ref.width - 45);
    }
  };

  Heart.prototype.display = function() {
    p5Ref.image(img, this.x, this.y);
  };

};
