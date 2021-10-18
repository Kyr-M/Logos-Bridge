!function () {
	"use strict";

	// init highlight CSS
	var ruleExistenceDict = {};
	var sheet = (function() {
		var style = document.createElement("style");
		style.appendChild(document.createTextNode(""));	// WebKit hack @@
		document.head.appendChild(style);
		return style.sheet;
	})();

	// highlight word in DOM (textnode only)
	var highlightWordInTextNodeOnly = function (word, bgColorCode) {

		// skip empty word
		if (word == null || word.length === 0) return;

		// DOM tree walker
		var wordRegex = new RegExp(word, "gi");
		var treeWalker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
			acceptNode: function (node) {
				var result = NodeFilter.FILTER_SKIP;
				if (wordRegex.test(node.nodeValue)) result = NodeFilter.FILTER_ACCEPT;
				return result;
			}
		}, false);

		// get textnode
		var skipTagName = {
			"NOSCRIPT": true,
			"SCRIPT": true,
			"STYLE": true
		};
		var nodeList = [];
		while(treeWalker.nextNode()) {
			if (!skipTagName[treeWalker.currentNode.parentNode.tagName]) {
				nodeList.push(treeWalker.currentNode);
			}
		}

		// highlight all filtered textnode
		nodeList.forEach(function (n) {
			var rangeList = [];

			// find sub-string ranges
			var startingIndex = 0;
			do {
				// console.log(word, startingIndex, n.parentNode, n.textContent);
				startingIndex = n.textContent.indexOf(word, startingIndex + 1);
				if (startingIndex !== -1) {
					var wordRange = document.createRange();
					wordRange.setStart(n, startingIndex);
					wordRange.setEnd(n, startingIndex + word.length);
					rangeList.push(wordRange);
				}
			} while (startingIndex !== -1);

			// highlight all ranges
			rangeList.forEach(function (r) {
				highlightRange(r, bgColorCode);
			});
		});
	};
	// highlight word in DOM (keyword can be across multi tag)
	var highlightWordAcrossNode = function (word, bgColorCode) {

		// reset cursor
		window.getSelection().removeAllRanges();

		// find keyword ranges
		var rangeList = [];
		if (window.find(word, false, false, false, false, false, false)) {
			do {
				rangeList.push(window.getSelection().getRangeAt(0));
				// don't modify the range here, cursor in find() will be corrupted
			} while (window.find(word, false, false, false, false, false, false));
			// reset scroll position, window.find() will select the last word...
			window.scrollTo(0, 0);
		} else {
			//console.log("[highlightWordAcrossNode] nothing found", word, bgColorCode, document.title);
		}

		// highlight all ranges
		rangeList.forEach(function (r) {
			highlightRange(r, bgColorCode);
		});
	};
	// highlight the keyword by surround it by `i`
	var highlightRange = function (range, bgColorCode) {

		// create wrapping i
		var iNode = document.createElement("i");
		var selectorName = iNode.className = "chrome-extension-highlight-".concat(bgColorCode);
		iNode.classList.add("chrome-extension-highlight");

		// add highlight class style in CSS
		if (!ruleExistenceDict[bgColorCode]) {
			sheet.insertRule([".", selectorName, " { background: #", bgColorCode, " !important; }"].join(""), 0);
			ruleExistenceDict[bgColorCode] = true;
			console.log(sheet);
		}

		// range.surroundContents(iNode) will throw exception if word across multi tag
		iNode.appendChild(range.extractContents());
		range.insertNode(iNode);
	};
	// highlight all keywords by its colour
	var highlightAllWords = function (wordGroupsDict) {

		var highlightWordFunction;
		if (window.find) {
			highlightWordFunction = highlightWordAcrossNode;
			// alternative: https://github.com/timdown/rangy/wiki/Highlighter-Module
		} else {
			console.log("window.find() function not exists, only textnode will be searched");
			highlightWordFunction = highlightWordInTextNodeOnly;
		}

		// for each group, highlight all its words
		Object.keys(wordGroupsDict).forEach(function (groupName) {
			if (wordGroupsDict[groupName].isOn) {
				wordGroupsDict[groupName].words.forEach(function (word) {
					highlightWordFunction(word, groupName);
				});
			}
		});
	};

	// adding a list of predefine highlited words
	var click_state = false;

	//function to get the button pressed state
	function getClickState(click_status){
		chrome.storage.sync.get(['click_state'], function(click_state) {
		click_status = click_state.click_state;
		console.log('Value currently is ' + click_status);
	});}

	//listener to update the clickstate
	chrome.storage.onChanged.addListener(() => {
		//chrome.tabs.reload(tab.id, { bypassCache }, null);
		console.log("click changed");
		getClickState(click_state);
		if (click_state == false){
			//should refresh the page
			// adding a list of predefine highlited words
			highlightWordAcrossNode(' Ζώνη ', 'FFE4C4');
			highlightWordAcrossNode(' Ζωή ', '0000FF');
			highlightWordAcrossNode(' Άγνωστοι ', 'FFE4C4');
			highlightWordAcrossNode(' Τρεις ', '0000FF');
			highlightWordAcrossNode(' όλα ', 'FFE4C4');
			highlightWordAcrossNode(' πληρώνω ', '0000FF');
			highlightWordAcrossNode(' καρέκλα ', 'FFE4C4');
			highlightWordAcrossNode(' θάλασσα ', '0000FF');
			highlightWordAcrossNode(' γάλα ', 'FFE4C4');
			highlightWordAcrossNode(' χρήματα ', '0000FF');
			highlightWordAcrossNode(' κλαίω ', 'FFE4C4');
			highlightWordAcrossNode(' γεωργοί ', '0000FF');
			highlightWordAcrossNode(' αγκάθι ', 'FFE4C4');
			highlightWordAcrossNode(' αμπέλι ', '0000FF');
			highlightWordAcrossNode(' πηγαίνω ', 'FFE4C4');
			highlightWordAcrossNode(' καιρός ', '0000FF');
			highlightWordAcrossNode(' χαϊδεύω ', 'FFE4C4');
			highlightWordAcrossNode(' συζήτηση ', '0000FF');
			highlightWordAcrossNode(' γνωρίζω ', 'FFE4C4');
			highlightWordAcrossNode(' συνήθως ', '0000FF');
			highlightWordAcrossNode(' ήξερε ', 'FFE4C4');
			highlightWordAcrossNode(' όμορφη ', '0000FF');
			highlightWordAcrossNode(' αυτή ', 'FFE4C4');
			highlightWordAcrossNode(' γεμίζω ', '0000FF');
			highlightWordAcrossNode(' δανείζω ', 'FFE4C4');
			highlightWordAcrossNode(' κόβομαι ', '0000FF');
			highlightWordAcrossNode(' καλή ', 'FFE4C4');
			highlightWordAcrossNode(' ψηλοί ', '0000FF');
			highlightWordAcrossNode(' μικροί ', 'FFE4C4');
			highlightWordAcrossNode(' γρήγορη ', '0000FF');
			highlightWordAcrossNode(' μιλώντας', 'FFE4C4');
			highlightWordAcrossNode(' ξύνομαι ', '0000FF');
			highlightWordAcrossNode(' χτυπώντας ', 'FFE4C4');
			highlightWordAcrossNode(' τρέχοντας ', '0000FF');
			highlightWordAcrossNode(' γράφοντας ', 'FFE4C4');
			highlightWordAcrossNode(' εργοστάσιο ', '0000FF');
			highlightWordAcrossNode(' σγουρά ', 'FFE4C4');
			highlightWordAcrossNode(' στρατιωτάκι ', '0000FF');
			highlightWordAcrossNode(' παλτό ', 'FFE4C4');
			highlightWordAcrossNode(' σκαμνί ', '0000FF');
			highlightWordAcrossNode(' κύκνος ', 'FFE4C4');
			highlightWordAcrossNode(' κάμπος ', '0000FF');
			highlightWordAcrossNode(' χρήματα ', 'FFE4C4');
			highlightWordAcrossNode(' στρώνω ', '0000FF');
			highlightWordAcrossNode(' αντί ', 'FFE4C4');
			highlightWordAcrossNode(' κλαίω ', '0000FF');
			highlightWordAcrossNode(' γεωργοί ', 'FFE4C4');
			highlightWordAcrossNode(' μπροστά ', '0000FF');
			highlightWordAcrossNode(' μπαίνει ', 'FFE4C4');
			highlightWordAcrossNode(' κοντεύει ', '0000FF');
			highlightWordAcrossNode(' κάγκελα ', 'FFE4C4');
			highlightWordAcrossNode(' ασχολούνται ', '0000FF');
			highlightWordAcrossNode(' ευκαιρία ', 'FFE4C4');
			highlightWordAcrossNode(' ανθίζουν ', '0000FF');
			highlightWordAcrossNode(' κείμενο ', 'FFE4C4');
			highlightWordAcrossNode(' προϊόντα ', '0000FF');
			highlightWordAcrossNode(' φαΐ ', 'FFE4C4');
			highlightWordAcrossNode(' λουλουδένιο ', '0000FF');
			highlightWordAcrossNode(' κουδουνίζω ', 'FFE4C4');
			highlightWordAcrossNode(' γνωρίζω ', '0000FF');
			highlightWordAcrossNode(' δέντρων ', 'FFE4C4');
			highlightWordAcrossNode(' πουλώντας ', '0000FF');
			highlightWordAcrossNode(' συνήθως ', 'FFE4C4');
			highlightWordAcrossNode(' έδωσα ', '0000FF');
			highlightWordAcrossNode(' έδινα ', 'FFE4C4');
			highlightWordAcrossNode(' όμορφη ', '0000FF');
			highlightWordAcrossNode(' κρεβάτι ', 'FFE4C4');
			highlightWordAcrossNode(' κατάλληλες ', '0000FF');
			highlightWordAcrossNode(' γεμίζω ', 'FFE4C4');
			highlightWordAcrossNode(' γυμναστική ', '0000FF');
			highlightWordAcrossNode(' πλένομαι ', 'FFE4C4');
			highlightWordAcrossNode(' δανείζουν ', '0000FF');
			highlightWordAcrossNode(' παχιές ', 'FFE4C4');
			highlightWordAcrossNode(' πιάνο ', '0000FF');
			highlightWordAcrossNode(' όταν ', 'FFE4C4');
			highlightWordAcrossNode(' κοντινός ', '0000FF');
			highlightWordAcrossNode(' συνεπής ', 'FFE4C4');
			highlightWordAcrossNode(' ευγνωμοσύνη ', '0000FF');
			highlightWordAcrossNode(' επαγγελματίας ', 'FFE4C4');
			highlightWordAcrossNode(' μεσάνυχτα ', '0000FF');
			highlightWordAcrossNode(' Μάιος ', 'FFE4C4');
			highlightWordAcrossNode('La', 'FFE4C4'); // testing purpose
		}
		else{
			//should refresh the page
			console.log(click_state);
		}
	});

	// get words from storage
	chrome.storage.sync.get('wordGroupsDict', function (wordGroupsDict) {

		if (!wordGroupsDict.wordGroupsDict) return;
		else wordGroupsDict = wordGroupsDict.wordGroupsDict;

		// highlightAllWords(wordGroupsDict);
		// body may not loaded... hard-code some delay
		setTimeout(highlightAllWords, 500, wordGroupsDict);

		// may use observer to due with it
		// var observer = new MutationObserver(function(mutations) {
		// 	mutations.forEach(function(mutation) {
		// 		console.log(mutation);
		// 	});
		// })
		// var minConfig = { attributes: true, childList: true, characterData: true };
		// minConfig.subtree = true;
		// observer.observe(document.body, minConfig);
	});

	// on word list change
	chrome.runtime.onMessage.addListener(function (messageBody, sender, sendResponse) {

		// console.log(sender.tab ? "from a content script:" + sender.tab.url : "from the extension");

		// remove all highlight first
		[].slice.call(document.getElementsByClassName("chrome-extension-highlight")).forEach(function (e) {
			var parentNode = e.parentNode;
			while(e.firstChild) parentNode.insertBefore(e.firstChild, e);
			parentNode.removeChild(e);
		});

		highlightAllWords(messageBody);
		if (sendResponse) sendResponse({content: "highlight done!"});
	});
}();
