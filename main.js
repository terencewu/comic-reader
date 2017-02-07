'use strict';

var img = document.getElementById("main-image");
var imgcontainer = document.getElementById("main-image-container");
var file_name = document.getElementById("file_name");
var page_count = document.getElementById("page_count");
var page_number = document.getElementById("page_number");
// page_number.oninput = choosePage; 
// page_number.onpropertychange = page_number.oninput;
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



function choosePage(evt) {
  console.log("input change detected");
  console.log(evt);
  console.log(evt.target.value);

  if (!evt) evt = window.event;
  var keyCode = evt.keyCode || evt.which;
  if (keyCode == '13'){ // Enter pressed
    console.log("pressed enter");
    console.log(page_number);
    console.log(page_number.value);
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

function scrollTo(element, destination, duration = 500, callback) {

  function easeInOut(t) {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  };

  var start = element.scrollTop;
  var startTime = Date.now();

  function scroll() {
    var now = Date.now();
    var time = Math.min(1, ((now - startTime) / duration));
    var timeFunction = easeInOut(time);
    element.scrollTop = (timeFunction * (destination - start)) + start;
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
  removeClass(imgcontainer, 'fit-height');
  removeClass(imgcontainer, 'fit-width');
  removeClass(imgcontainer, 'fit-width-step');
  removeClass(imgcontainer, 'fit-height-step');
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

function step() {
  clearClasses();
  //set width based on natural image width
  switch (mode) {
  case 0: //scrolling down
    addClass(imgcontainer, 'fit-width-step');

    scrollnext = scrollcurrent + (screenheight/2);

    /*
      1. No scrolling needed
      2. nextpage triggered.
     */
    if( ((imgcontainer.scrollHeight - imgcontainer.clientHeight) <= 0) ||
        (nextpage && (imgcontainer.scrollHeight - imgcontainer.clientHeight) <= scrollnext )
      ) {
      console.log("going to next page");
      scrollcurrent = 0;
      scrollnext = 0;
      nextpage = false;
      next();
    }
    else {
      if((imgcontainer.scrollHeight - imgcontainer.clientHeight) <= scrollnext) {
        console.log("next page");
        nextpage = true;
      }

      console.log("scroll down");
      autoscrolling = true;
      scrollTo(imgcontainer,  scrollnext, 500, function() {
        scrollcurrent = scrollnext;
        autoscrolling = false;
     });
    }

    break;
  case 1: //scrolling left/right
    addClass(imgcontainer, 'fit-height-step');
    // imgcontainer.scrollLeft = step_index * (screenwidth/2);
    break;
  default:
    break;
  }
  
}

function prev() {
  archive.prev();
}

function next() {
  archive.next();
}

function loadinfo(fname, pgnum, pgcount) {
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
  console.log("st : " + imgcontainer.scrollTop);
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
    console.log(imgcontainer);

  }
}, 100);


//read left to right
//read right to left

//show two images at once


function Unarchiver(archive) {
  var self = this;
  self.archive = archive;
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
    
    if(ext !== "jpg" && ext !== "jpeg" && ext !== "png" && ext !== "webp" && ext !== "bmp" && ext !== "gif") {
      console.log("extension : " + ext + " is not supported.");
      return false;
    }
    return true;
  }
  self.next = function() {
    if(0 <= self.index && self.index < self.archivecontent.length) {
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
        URL.revokeObjectURL(imgurl); //free object
      }

      loadinfo(entry.name, index, pages)
      img.src = imgurl;

      imgcontainer.scrollTop = 0;
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
