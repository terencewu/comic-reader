'use strict';

var img = document.getElementById("main-image");
var imgcontainer = document.getElementById("main-image-container");
var filecontent = null;
var filelist = null;
var index = 0;
var mode = 0;
var imageWidth = 0;
var imageHeight = 0;
var screenwidth = document.documentElement.clientWidth;
var screenheight = document.documentElement.clientHeight;

var nextpage = false;
var scrollcurrent = 0;
var scrollnext = 0;
var autoscrolling = false;

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

    console.log(scrollcurrent);
    console.log(scrollnext);
    console.log(imgcontainer.scrollHeight - imgcontainer.clientHeight);
    console.log(((imgcontainer.scrollHeight - imgcontainer.clientHeight) <= 0));
    console.log("----------------------------");
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
    imgcontainer.scrollLeft = step_index * (screenwidth/2);
    break;
  default:
    break;
  }
  
}

function prev() {
  if(index < 0 || index >= filelist.length) {
    return ;
  }
  index -= 1;
  gotopage(index);
}

function next() {
  if(index < 0 || index >= filelist.length) {
    return ;
  }
  index += 1;
  gotopage(index);
}

function gotopage(index) {
  var filename = null;
  filename = filelist[index];

  //gets file extension
  var ext = filename.substr((~-filename.lastIndexOf(".") >>> 0) + 2);

  if(ext !== "jpg" && ext !== "jpeg" && ext !== "png") {
    console.log("extension : " + ext + " is not supported.");
    return next();
  }
  console.log(index + "/" + filelist.length);
  //get this file and return it as base64 encoded data
  filecontent.file(filename).async("base64").then(function(imgdata) {

    img.onload = function() {
      imageWidth = img.clientWidth;
      imageHeight = img.clientHeight;
    }

    img.src= 'data:image/*;base64, ' + imgdata;
    imgcontainer.scrollTop = 0;
  });

}

function unzip(content) {
  index = 0;
  var zip = new JSZip();
  zip.loadAsync(content)
    .then(function(rzip) {
      // you now have every files contained in the loaded zip
      filecontent = rzip;
      filelist = Object.keys(rzip.files).sort();
      console.log(filecontent);
      next();
    });
}

function handleFileSelect(evt) {
  var files = evt.target.files; // FileList object

  resetOriginal();
  clearClasses();

  //zip files
  unzip(files[0]);

  //tar files
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

// if (document.readyState === "complete" || (document.readyState !== "loading" && !document.documentElement.doScroll)) {
//     main();
// }
