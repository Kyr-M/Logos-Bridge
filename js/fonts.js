var fonts = ["Arial","Courier","Helvetica","Verdana","Times","Tahoma", "Century Gothic", "Trebuchet MS","Calibri","Open Sans"];
var string = "";
var select = document.getElementById("select")
for(var a = 0; a < fonts.length ; a++){
	var opt = document.createElement('option');
	opt.value = opt.innerHTML = fonts[a];
	opt.style.fontFamily = fonts[a];
	select.add(opt);
}
function fontChange(){
	var x = document.getElementById("select").selectedIndex;
  var y = document.getElementById("select").options;
	document.body.insertAdjacentHTML("beforeend", "<style> #text{ font-family:'"+y[x].text+"';}"+
																	 "#select{font-family:'"+y[x].text+"';</style>");
	var tl = new TimelineLite, 
	mySplitText = new SplitText("#h1", {type:"words,chars"}), 
	chars = mySplitText.chars; //an array of all the divs that wrap each character
	TweenLite.set("#h1", {perspective:400});
	tl.staggerFrom(chars, 0.2, {opacity:0, scale:0, y:80, rotationX:180, transformOrigin:"0% 50% -50",  ease:Back.easeOut}, 0.01, "+=0");
	var t2 = new TimelineLite, 
	mySplitText2 = new SplitText("#h2", {type:"words,chars"}), 
	chars = mySplitText2.chars; //an array of all the divs that wrap each character
	TweenLite.set("#h2", {perspective:400});
	t2.staggerFrom(chars, 0.2, {opacity:0, scale:0, y:80, rotationX:180, transformOrigin:"0% 100% -50",  ease:Back.easeOut}, 0.01, "+=0");
	var t3 = new TimelineLite, 
	mySplitText3 = new SplitText("#h3", {type:"words,chars"}), 
	chars = mySplitText3.chars; //an array of all the divs that wrap each character
	TweenLite.set("#h3", {perspective:400});
	t3.staggerFrom(chars, 0.2, {opacity:0, scale:0, y:80, rotationX:180, transformOrigin:"0% 150% -50",  ease:Back.easeOut}, 0.01, "+=0");
	var t4 = new TimelineLite, 
	mySplitText4 = new SplitText("#h4", {type:"words,chars"}), 
	chars = mySplitText4.chars; //an array of all the divs that wrap each character
	TweenLite.set("#h4", {perspective:400});
	t4.staggerFrom(chars, 0.2, {opacity:0, scale:0, y:80, rotationX:180, transformOrigin:"0% 200% -50",  ease:Back.easeOut}, 0.01, "+=0");
	var t5 = new TimelineLite, 
	mySplitText5 = new SplitText("#standard", {type:"words,chars"}), 
	chars = mySplitText5.chars; //an array of all the divs that wrap each character
	TweenLite.set("#standard", {perspective:400});
	t5.staggerFrom(chars, 0.2, {opacity:0, scale:0, y:80, rotationX:180, transformOrigin:"0% 250% -50",  ease:Back.easeOut}, 0.01, "+=0");
}
TweenLite.to(page, 0, {top:"-100vh", ease:Bounce.easeOut, delay:0});
TweenLite.to(page, 1, {top:"0vh", ease:Elastic.easeOut, delay:1});
fontChange();