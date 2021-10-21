window.onload = selectFont;

function selectFont(){
  selection = document.getElementById("mySelect").value;
  document.body.style.fontFamily=selection;
  document.getElementById("mySelect").style.fontFamily = selection;
  document.getElementById("customText").style.fontFamily = selection;
}
