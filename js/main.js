$(function() {
      var DAMPING = 0.97;
      var anyMoving;
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
        anyMoving = false;
        var that = this;
        players.forEach(function(player) {
          if(player.mouseDown){
            anyMoving = true;
            var dx = player.x - that.x;
            var dy = player.y - that.y;
            var distance = Math.sqrt(dx * dx + dy * dy);
            that.x += (dx / distance) * 2 * m.random();
            that.y += (dy / distance) *3.5 * m.random();
          }
        })
        if(!anyMoving) { 
          this.x += .5* m.random() * (m.random() >= .5 ? -1 : 1);
          this.y += .5*  m.random() * (m.random() <= .5 ? -1 : 1);
        }
      };
      
      //This segment just toggled the idle animation on and off
      var onIdle = true;
      var idleTime = 500;
      setInterval(function(){
        onIdle = !onIdle;
        idleTime = (idleTime == 20000 ? 500 : 20000);
      }, idleTime);

      Particle.prototype.attractIdle = function(attractX, attractY, disperseDistance) {
        if(!anyMoving && onIdle) {
          var dx = attractX - this.x;
          var dy = attractY - this.y;
          var distance = Math.sqrt(dx * dx + dy * dy);
          this.x += (dx * distance * .00002) * 2.5 * m.random();
          this.y += (dy * distance * .00002) * 3.25 * m.random();
          //counting
          if(Math.abs(distance) < disperseDistance) return 1;
          else return 0;
        }
      };

      Particle.prototype.disperse = function(){
        this.x += this.x * .05 * m.random() * (m.random() >= .5 ? -1 : 1);
        this.y += this.y * .05 * m.random() * (m.random() >= .5 ? -1 : 1);
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
      var idleActive = true;

      for (var i = 0; i < 500; i++) {
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

      setInterval(function(){primus.write(recentCoords);} , 200);

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
        var disperseQuota = particles.length * .82;
        var disperseDistance = width * .05;
        var withinDisperse = 0;
        for (var i = 0; i < particles.length; i++) {
          particles[i].attract(players);
          withinDisperse += particles[i].attractIdle(width/2, height/2, disperseDistance);
          particles[i].integrate();
          particles[i].draw();
        }
        if(withinDisperse >= disperseQuota) {
          for (var j = 0; j < particles.length; j++) {
             particles[j].disperse();
          }
        }
        //console.log("DisperseQuota: " + disperseQuota + "| curThreshold: " +  withinDisperse);
      }
});
