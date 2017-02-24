'use strict';

var img = document.getElementById("main-image");
var imgcontainer = document.getElementById("main-image-container");
var step_elem = document.getElementById("step");
var archive_name = document.getElementById("archive_name");
var file_name = document.getElementById("file_name");
var page_count = document.getElementById("page_count");
var page_number = document.getElementById("page_number");
page_number.onkeypress = choosePage;

var imageWidth = 0;
var imageHeight = 0;
var screenwidth = document.documentElement.clientWidth;
var screenheight = document.documentElement.clientHeight;

var nextpage = false;
var scrollcurrent = 0;
var scrollnext = 0;
var autoscrolling = false;
var archive = null;
var mode = 0;
var left2right = true;

var classlist = ["fit-height","fit-width","fit-width-step","fit-height-step"];
var imgext = ["jpg", "jpeg", "png", "webp", "bmp", "gif"];

function choosePage(evt) {
  console.log("input change detected");
  console.log(evt);
  console.log(evt.target.value);

  if (!evt) evt = window.event;
  var keyCode = evt.keyCode || evt.which;
  if (keyCode == '13'){ // Enter pressed
    //check if page_number.value is an integer
    if(parseInt(page_number.value) === NaN) {
      return false;
    }
    var pageindex = parseInt(page_number.value) - 1;
    console.log("goto!");
    //update global page index
    archive.gotopage(pageindex);
  }  

}

function toggleDirection() {
  //default direction is left to right
  left2right = !left2right;
}

function scrollTo(element, destination, scrolldirection = "down", duration = 500, callback) {
  if(scrolldirection === "down") {
    console.log("top2bottom");
    scrolldirection = "scrollTop";
  }
  else if(scrolldirection === "left") {
    console.log("left2right");
    scrolldirection = "scrollLeft";
  }
  else if(scrolldirection === "right") {
    console.log("right2left");
    scrolldirection = "scrollRight";
  }

  function easeInOut(t) {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  };

  var start = element[scrolldirection];
  var startTime = Date.now();

  if(destination < start) {
    console.log("destination going reverse");
    console.log(start);
    console.log(destination);
  }

  function scroll() {
    var now = Date.now();
    var time = Math.min(1, ((now - startTime) / duration));
    var timeFunction = easeInOut(time);
    // element.scrollTop = (timeFunction * (destination - start)) + start;
    element[scrolldirection] = (timeFunction * (destination - start)) + start;
    if((now - startTime) >= duration) {
      callback();
      return ;
    }
    requestAnimationFrame(scroll);
  }
  scroll();
}


function addClass(el, cl) {
  if(!new RegExp('(\\s|^)' + cl + '(\\s|$)').test(el.className)) {
    el.className += ' ' + cl;
  }
}

function removeClass(el, cl) {
  el.className = el.className.replace(new RegExp('(\\s|^)' + cl + '(\\s|$)', 'g'), ' ').replace(/(^\s+|\s+$)/g,'');
}


function clearClasses() {
  for(var i = 0; i < classlist.length; i++) {
    removeClass(imgcontainer, classlist[i])
  }
  // removeClass(imgcontainer, 'fit-height');
  // removeClass(imgcontainer, 'fit-width');
  // removeClass(imgcontainer, 'fit-width-step');
  // removeClass(imgcontainer, 'fit-height-step');
}

function resetOriginal() {
  mode = 0; //clears mode
  scrollcurrent = 0;
  scrollnext = 0;
  nextpage = false;
}

function fitwidth() {
  clearClasses();
  resetOriginal();
  addClass(imgcontainer, 'fit-width');
}
function fitheight() {
  clearClasses();
  resetOriginal();
  addClass(imgcontainer, 'fit-height');
}

function fitwidthstep() {
  clearClasses();
  resetOriginal();
  addClass(imgcontainer, 'fit-width-step');
}

function fitheightstep() {
  clearClasses();
  resetOriginal();
  addClass(imgcontainer, 'fit-height-step');
}

function updatesteptext(newtext) {
  step_elem.innerHTML = newtext;
}

function step() {
  if(autoscrolling) {
    //prevents user from pressing too quickly for step() to resolve
    return ;
  }

  clearClasses();
  
  var stepclass = '';
  var steptext = 'Scroll';
  var scrollposition = 0;
  var scrolllength = 0;
  var clientlength = 0;

  var direction = '';
  var screenhalf = 0;

  if(mode == 0) {
    stepclass = 'fit-width-step';
    //class must be set properly in order to values to be correct
    addClass(imgcontainer, stepclass);
    
    steptext = 'Scroll<br>Down';
    scrollposition = imgcontainer.scrollTop;
    scrolllength = imgcontainer.scrollHeight;
    clientlength = imgcontainer.clientHeight;
    screenhalf = screenheight/2;
    direction = "down";
  }
  else if(mode == 1) {
    stepclass = 'fit-height-step';
    addClass(imgcontainer, stepclass);

    scrolllength = imgcontainer.scrollWidth;
    clientlength = imgcontainer.clientWidth;
    screenhalf = screenwidth/2; 
    /*
      reading direction
      "left" = left 2 right
      "right" = right 2 left
    */     
    // direction = left2right ? "left" : "right";

    if(left2right) {
      direction = "left";
      steptext = 'Scroll<br>Left';
      scrollposition = imgcontainer.scrollLeft;      
    }
    else {
      direction = "right";
      steptext = 'Scroll<br>Right';
      scrollposition = imgcontainer.scrollRight;        
    }
  }

  updatesteptext(steptext);

  scrollnext = scrollposition + screenhalf;
  /*
    1. No scrolling needed
    2. nextpage triggered.
  */

  console.log(screenhalf);
  console.log(scrollposition);
  console.log(scrolllength);
  console.log(scrollnext);

  if(nextpage && ((scrolllength - clientlength) <= scrollnext)) {
    console.log("going to next page");
    scrollnext = 0;
    nextpage = false;
    updatesteptext(steptext);
    next();
  }
  else {
    if((scrolllength - clientlength) <= scrollnext) {
      updatesteptext("Next<br>Page");
      console.log("next page");
      nextpage = true;
    }
    autoscrolling = true;
    console.log(direction);
    scrollTo(imgcontainer, scrollnext, direction, 500, function() {
      autoscrolling = false;
    });
  }

}

function prev() {
  archive.prev();
}

function next() {
  archive.next();
}

function loadinfo(archivename, fname, pgnum, pgcount) {
  archive_name.innerHTML = archivename;
  file_name.innerHTML = fname;
  page_number.value = pgnum + 1; //displays + 1 because 0 is first index.
  page_count.innerHTML = pgcount;
}

function handleFileSelect(evt) {
  var files = evt.target.files; // FileList object

  //manually loads the type of archive formats for reading (required for uncompress.js)
  loadArchiveFormats(['rar', 'zip', 'tar']);
  archive = new _archive(files[0]);
}

imgcontainer.onscroll = function(evt) {
  // console.log("scrollTop : " + imgcontainer.scrollTop);
  // console.log("scrollLeft : " + imgcontainer.scrollLeft);
  // console.log("scrollRight : " + imgcontainer.scrollRight);
  //Only detects user scrolling and not scrolling performed during function call
  if(!autoscrolling) {
    scrollcurrent = imgcontainer.scrollTop;
    nextpage = false;
  }
}

document.getElementById('upload').addEventListener('change', handleFileSelect, false);

var stateCheck = setInterval(function() {
  if (document.readyState === "complete" || (document.readyState !== "loading" && !document.documentElement.doScroll)) {
    clearInterval(stateCheck);
    console.log("ready");
  }
}, 100);


//read left to right
//read right to left

//show two images at once


function Unarchiver(archive) {
  var self = this;
  self.archive = archive;
  self.archivename = archive.name;
  self.index = 0;
  self.archivecontent = [];
  self.gotopage = function(index) { 
    if(0 <= index && index < self.archivecontent.length) {
      self.index = index;
      self._gotopage(index);
    }
  }
  self._gotopage = function(index) { return null; }
  self.archivename = function() { return null; }
  self.pagename = function() { return null; }
  self.filecount = function() { return null; }
  self.isImage = function(filename="") {
    if(!filename) {
      return false;
    }
    //gets file extension
    var ext = filename.substr((~-filename.lastIndexOf(".") >>> 0) + 2);
    
    // if(ext !== "jpg" && ext !== "jpeg" && ext !== "png" && ext !== "webp" && ext !== "bmp" && ext !== "gif") {
    //   console.log("extension : " + ext + " is not supported.");
    //   return false;
    // }

    //checking this way is inefficient. (but is currently neglible) Will be better off saving this data in an array of objects after a single pass.
    for(var i = 0; i < imgext.length; i++) {
      if(ext === imgext[i]) {
        console.log("extension : " + ext + " is not supported.");
        return true;
      }
    }

    return false;
  }
  self.next = function() {
    if(0 <= self.index && self.index < self.archivecontent.length - 1) {
      self.index += 1;
      self.gotopage(self.index);    
    }
  }

  self.prev = function() {
    if(0 < self.index && self.index < self.archivecontent.length) {
      self.index -= 1;
      self.gotopage(self.index);    
    }
  }
}

function _archive(archive) {
  Unarchiver.call(this, archive);
  var self = this;

  self._gotopage = function(index) {
    var entry = self.archivecontent[index];
    var pages = self.archivecontent.length;

    if(!self.isImage(entry.name)) {
      return self.next();
    }
    var mimetype = "image/*";

    entry.readData(function(data, err) {
		  var blob = new Blob([data], {type: mimetype});
		  var imgurl = URL.createObjectURL(blob);
      img.onload = function() {
        imageWidth = img.clientWidth;
        imageHeight = img.clientHeight;
        

        if(img.naturalWidth > img.naturalHeight) {
          if(left2right) {
            // step_elem.innerHTML ="Scroll<br>Right";
            updatesteptext("Scroll<br>Left");
          }
          else {
            // step_elem.innerHTML ="Scroll<br>Left";
            updatesteptext("Scroll<br>Right");
          }
          fitheightstep();
          mode = 1;
        }
        else {  //squares or height > width
          // step_elem.innerHTML ="Scroll<br>Down";
          updatesteptext("Scroll<br>Down");
          fitwidthstep();
          mode = 0;
        }

        URL.revokeObjectURL(imgurl); //free object
      }

      loadinfo(archive.name, entry.name, index, pages)
      img.src = imgurl;

      imgcontainer.scrollTop = 0;
      if(left2right) {
        imgcontainer.scrollLeft = 0;
      }
      else {
        imgcontainer.scrollRight = 0;
      }
    });    
  }

  //load this! or we either put this as a constructor/prototype?

  archiveOpenFile(archive, function(archivecontent, err) {
    if(err) {
      console.log(err);
    }
    if(archivecontent) {
      self.archive = null;
      self.archivecontent = archivecontent.entries;
      self.gotopage(self.index);
    }
  });
  
}
