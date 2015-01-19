$(function() {
      var DAMPING = 0.97;
      var m = new MersenneTwister();

      function Particle(x, y) {
        this.x = this.oldX = x;
        this.y = this.oldY = y;
      }

      Particle.prototype.integrate = function() {
        var velocityX = (this.x - this.oldX) * DAMPING;
        var velocityY = (this.y - this.oldY) * DAMPING;
        this.oldX = this.x;
        this.oldY = this.y;
        this.x += velocityX;
        this.y += velocityY;
      };

      Particle.prototype.attract = function(players) {
        var anyMoving = false;
        var that = this;
        players.forEach(function(player) {
          if(player.mouseDown){
            anyMoving = true;
            var dx = player.x - that.x;
            var dy = player.y - that.y;
            var distance = Math.sqrt(dx * dx + dy * dy);
            that.x += (dx / distance) * m.random();
            that.y += (dy / distance) *1.5* m.random();
          }
        })
        if(!anyMoving) { 
          this.x += .5 * m.random() * (m.random() >= .5 ? -1 : 1);
          this.y += .5 * m.random() * (m.random() <= .5 ? -1 : 1);
        }
      };

      Particle.prototype.draw = function() {
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(this.oldX, this.oldY);
        ctx.lineTo(this.x, this.y);
        ctx.stroke();
      };

      var display = document.getElementById('display');
      var ctx = display.getContext('2d');
      var particles = [];
      var width = display.width = window.innerWidth;
      var height = display.height = window.innerHeight;
      var mouse = { x: width * 0.5, y: height * 0.5 };

      for (var i = 0; i < 200; i++) {
        particles[i] = new Particle(Math.random() * width, Math.random() * height);
      }

      display.addEventListener('mousemove', onMousemove);
      display.addEventListener('mousedown', onMousedown);
      display.addEventListener('mouseup', onMouseup);

      //On mousemove just send data to server, they send to everyone
      //so we treat ourselves like any other player.
      var recentCoords;
      function onMousemove(e) {
        recentCoords = {
          newMove: true,
          x: e.clientX,
          y: e.clientY,
          id: clientID
        };
      }

      setInterval(function(){primus.write(recentCoords)}, 200);

      function onMouseup(e) { 
        primus.write({endClick: true, id: clientID});
      }
      function onMousedown(e) { 
        primus.write({startClick: true, id: clientID});
      }

      requestAnimationFrame(frame);

      function frame() {
        requestAnimationFrame(frame);
        ctx.clearRect(0, 0, width, height);
        for (var i = 0; i < particles.length; i++) {
          particles[i].attract(players);
          particles[i].integrate();
          particles[i].draw();
        }
      }
});
