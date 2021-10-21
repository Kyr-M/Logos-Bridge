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
			highlightWordAcrossNode(' ζώνη ', 'FFE4C4');

			highlightWordAcrossNode(' Ζωή ', '0000FF');
			highlightWordAcrossNode(' ζωή ', '0000FF');

			highlightWordAcrossNode(' Άγνωστοι ', 'FFE4C4');

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

			/*
			highlightWordAcrossNode(' Σόλα ', 'F4F6F6');
			highlightWordAcrossNode(' σόλα ', 'F4F6F6');

			highlightWordAcrossNode(' Λάσο ', 'F4F6F6');
			highlightWordAcrossNode(' Λάσο ', 'F4F6F6');

			highlightWordAcrossNode(' Γόπα ', 'F4F6F6');
			highlightWordAcrossNode(' γόπα ', 'F4F6F6');

			highlightWordAcrossNode(' Πάγο ', 'F4F6F6');
			highlightWordAcrossNode(' Πάγο ', 'F4F6F6');

			highlightWordAcrossNode(' Πρόκα ', 'F4F6F6');
			highlightWordAcrossNode(' πρόκα ', 'F4F6F6');

			highlightWordAcrossNode(' Πάρκο ', 'F4F6F6');
			highlightWordAcrossNode(' πάρκο ', 'F4F6F6');

			highlightWordAcrossNode(' Όπλο ', 'F4F6F6');
			highlightWordAcrossNode(' όπλο ', 'F4F6F6');

			highlightWordAcrossNode(' Απλό ', 'F4F6F6');
			highlightWordAcrossNode(' απλό ', 'F4F6F6');

			highlightWordAcrossNode(' Άρπα ', 'F4F6F6');
			highlightWordAcrossNode(' άρπα ', 'F4F6F6');

			highlightWordAcrossNode(' Κορμί ', 'F4F6F6');
			highlightWordAcrossNode(' κορμί ', 'F4F6F6');

			highlightWordAcrossNode(' Μικρό ', 'F4F6F6');
			highlightWordAcrossNode(' μικρό ', 'F4F6F6');

			highlightWordAcrossNode(' Στόμα ', 'F4F6F6');
			highlightWordAcrossNode(' στόμα ', 'F4F6F6');

			highlightWordAcrossNode(' Μάτσο ', 'F4F6F6');
			highlightWordAcrossNode(' μάτσο ', 'F4F6F6');

			highlightWordAcrossNode(' Νόμος ', 'F4F6F6');
			highlightWordAcrossNode(' νόμος ', 'F4F6F6');

			highlightWordAcrossNode(' Μονός ', 'F4F6F6');
			highlightWordAcrossNode(' μονός ', 'F4F6F6');

			highlightWordAcrossNode(' Σκότος ', 'F4F6F6');
			highlightWordAcrossNode(' σκότος ', 'F4F6F6');

			highlightWordAcrossNode(' Κόστος ', 'F4F6F6');
			highlightWordAcrossNode(' κόστος ', 'F4F6F6');
			
			highlightWordAcrossNode(' Στόκος ', 'F4F6F6');
			highlightWordAcrossNode(' στόκος ', 'F4F6F6');

			highlightWordAcrossNode(' Κότσος ', 'F4F6F6');
			highlightWordAcrossNode(' κότσος ', 'F4F6F6');

			highlightWordAcrossNode(' Κότσος ', 'F4F6F6');
			highlightWordAcrossNode(' κότσος ', 'F4F6F6');

			highlightWordAcrossNode(' Νήμα ', 'F4F6F6');
			highlightWordAcrossNode(' νήμα ', 'F4F6F6');

			highlightWordAcrossNode(' Μήνα ', 'F4F6F6');
			highlightWordAcrossNode(' μήνα ', 'F4F6F6');

			highlightWordAcrossNode(' Αμήν ', 'F4F6F6');
			highlightWordAcrossNode(' αμήν ', 'F4F6F6');

			highlightWordAcrossNode(' Πίστα ', 'F4F6F6');
			highlightWordAcrossNode(' πίστα ', 'F4F6F6');

			highlightWordAcrossNode(' Πίτσα ', 'F4F6F6');
			highlightWordAcrossNode(' πίτσα ', 'F4F6F6');

			highlightWordAcrossNode(' Κατσαρός ', 'F4F6F6');
			highlightWordAcrossNode(' κατσαρός ', 'F4F6F6');

			highlightWordAcrossNode(' Καστανός ', 'F4F6F6');
			highlightWordAcrossNode(' καστανός ', 'F4F6F6');

			highlightWordAcrossNode(' Αργός ', 'F4F6F6');
			highlightWordAcrossNode(' αργός ', 'F4F6F6');

			highlightWordAcrossNode(' Άπραχτος ', 'F4F6F6');
			highlightWordAcrossNode(' άπραχτος ', 'F4F6F6');

			highlightWordAcrossNode(' Αρπαχτός ', 'F4F6F6');
			highlightWordAcrossNode(' αρπαχτός ', 'F4F6F6');

			highlightWordAcrossNode(' Παπί ', 'F4F6F6');
			highlightWordAcrossNode(' παπί ', 'F4F6F6');

			highlightWordAcrossNode(' Πίπα ', 'F4F6F6');
			highlightWordAcrossNode(' πίπα ', 'F4F6F6');

			highlightWordAcrossNode(' Ταπί ', 'F4F6F6');
			highlightWordAcrossNode(' ταπί ', 'F4F6F6');

			highlightWordAcrossNode(' Πίτα ', 'F4F6F6');
			highlightWordAcrossNode(' πίτα ', 'F4F6F6');

			highlightWordAcrossNode(' Ζάρι ', 'F4F6F6');
			highlightWordAcrossNode(' ζάρι ', 'F4F6F6');

			highlightWordAcrossNode(' Ρίζα ', 'F4F6F6');
			highlightWordAcrossNode(' ρίζα ', 'F4F6F6');

			highlightWordAcrossNode(' Ψηλή ', 'F4F6F6');
			highlightWordAcrossNode(' ψηλή ', 'F4F6F6');

			highlightWordAcrossNode(' Λήψη ', 'F4F6F6');
			highlightWordAcrossNode(' λήψη ', 'F4F6F6');

			highlightWordAcrossNode(' Ξηρή ', 'F4F6F6');
			highlightWordAcrossNode(' ξηρή ', 'F4F6F6');

			highlightWordAcrossNode(' Ρήξη ', 'F4F6F6');
			highlightWordAcrossNode(' ρήξη ', 'F4F6F6');

			highlightWordAcrossNode(' Καμπή ', 'F4F6F6');
			highlightWordAcrossNode(' καμπή ', 'F4F6F6');

			highlightWordAcrossNode(' Μπήκα ', 'F4F6F6');
			highlightWordAcrossNode(' μπήκα ', 'F4F6F6');

			highlightWordAcrossNode(' Δομές ', 'F4F6F6');
			highlightWordAcrossNode(' δομές ', 'F4F6F6');

			highlightWordAcrossNode(' Δεσμό ', 'F4F6F6');
			highlightWordAcrossNode(' δεσμό ', 'F4F6F6');

			highlightWordAcrossNode(' Στέκα ', 'F4F6F6');
			highlightWordAcrossNode(' στέκα ', 'F4F6F6');

			highlightWordAcrossNode(' Σκέτα ', 'F4F6F6');
			highlightWordAcrossNode(' σκέτα ', 'F4F6F6');

			highlightWordAcrossNode(' Φέτα ', 'F4F6F6');
			highlightWordAcrossNode(' φέτα ', 'F4F6F6');

			highlightWordAcrossNode(' Εφτά ', 'F4F6F6');
			highlightWordAcrossNode(' εφτά ', 'F4F6F6');

			highlightWordAcrossNode(' Τόπος ', 'F4F6F6');
			highlightWordAcrossNode(' τόπος ', 'F4F6F6');

			highlightWordAcrossNode(' Πόστο ', 'F4F6F6');
			highlightWordAcrossNode(' πόστο ', 'F4F6F6');

			highlightWordAcrossNode(' Στόλος ', 'F4F6F6');
			highlightWordAcrossNode(' στόλος ', 'F4F6F6');

			highlightWordAcrossNode(' Λοστός ', 'F4F6F6');
			highlightWordAcrossNode(' λοστός ', 'F4F6F6');

			highlightWordAcrossNode(' Κάσα ', 'F4F6F6');
			highlightWordAcrossNode(' κάσα ', 'F4F6F6');

			highlightWordAcrossNode(' Σάκα ', 'F4F6F6');
			highlightWordAcrossNode(' σάκα ', 'F4F6F6');

			highlightWordAcrossNode(' Καράβια ', 'F4F6F6');
			highlightWordAcrossNode(' καράβια ', 'F4F6F6');

			highlightWordAcrossNode(' Αραβικά ', 'F4F6F6');
			highlightWordAcrossNode(' αραβικά ', 'F4F6F6');

			highlightWordAcrossNode(' Σκάγια ', 'F4F6F6');
			highlightWordAcrossNode(' σκάγια ', 'F4F6F6');

			highlightWordAcrossNode(' Γιακάς ', 'F4F6F6');
			highlightWordAcrossNode(' γιακάς ', 'F4F6F6');

			highlightWordAcrossNode(' Ντομάτα ', 'F4F6F6');
			highlightWordAcrossNode(' ντομάτα ', 'F4F6F6');

			highlightWordAcrossNode(' Μαντάτο ', 'F4F6F6');
			highlightWordAcrossNode(' μαντάτο ', 'F4F6F6');

			highlightWordAcrossNode(' Κάρο ', 'F4F6F6');
			highlightWordAcrossNode(' κάρο ', 'F4F6F6');

			highlightWordAcrossNode(' Ρόκα ', 'F4F6F6');
			highlightWordAcrossNode(' ρόκα ', 'F4F6F6');

			highlightWordAcrossNode(' Νίκησα ', 'F4F6F6');
			highlightWordAcrossNode(' νίκησα ', 'F4F6F6');

			highlightWordAcrossNode(' Κίνησα ', 'F4F6F6');
			highlightWordAcrossNode(' κίνησα ', 'F4F6F6');

			highlightWordAcrossNode(' Αρχείο ', 'F4F6F6');
			highlightWordAcrossNode(' αρχείο ', 'F4F6F6');

			highlightWordAcrossNode(' Αχρείο ', 'F4F6F6');
			highlightWordAcrossNode(' αχρείο ', 'F4F6F6');

			highlightWordAcrossNode(' Αργία ', 'F4F6F6');
			highlightWordAcrossNode(' αργία ', 'F4F6F6');

			highlightWordAcrossNode(' Άγρια ', 'F4F6F6');
			highlightWordAcrossNode(' άγρια ', 'F4F6F6');

			highlightWordAcrossNode(' Αρπαγή ', 'F4F6F6');
			highlightWordAcrossNode(' αρπαγή ', 'F4F6F6');

			highlightWordAcrossNode(' Άπραγη ', 'F4F6F6');
			highlightWordAcrossNode(' άπραγη ', 'F4F6F6');

			highlightWordAcrossNode(' Πατρίδα ', 'F4F6F6');
			highlightWordAcrossNode(' πατρίδα ', 'F4F6F6');

			highlightWordAcrossNode(' Παρτίδα ', 'F4F6F6');
			highlightWordAcrossNode(' παρτίδα ', 'F4F6F6');

			highlightWordAcrossNode(' Κόπος ', 'F4F6F6');
			highlightWordAcrossNode(' κόπος ', 'F4F6F6');

			highlightWordAcrossNode(' Σκοπό ', 'F4F6F6');
			highlightWordAcrossNode(' σκοπό ', 'F4F6F6');

			highlightWordAcrossNode(' Παστό ', 'F4F6F6');
			highlightWordAcrossNode(' παστό ', 'F4F6F6');

			highlightWordAcrossNode(' Πόστα ', 'F4F6F6');
			highlightWordAcrossNode(' πόστα ', 'F4F6F6');

			highlightWordAcrossNode(' Μύθος ', 'F4F6F6');
			highlightWordAcrossNode(' μύθος ', 'F4F6F6');

			highlightWordAcrossNode(' Θυμός ', 'F4F6F6');
			highlightWordAcrossNode(' θυμός ', 'F4F6F6');

			highlightWordAcrossNode(' Λάμπα ', 'F4F6F6');
			highlightWordAcrossNode(' λάμπα ', 'F4F6F6');

			highlightWordAcrossNode(' Μπάλα ', 'F4F6F6');
			highlightWordAcrossNode(' μπάλα ', 'F4F6F6');

			highlightWordAcrossNode(' Πάστα ', 'F4F6F6');
			highlightWordAcrossNode(' πάστα ', 'F4F6F6');

			highlightWordAcrossNode(' Τσάπα ', 'F4F6F6');
			highlightWordAcrossNode(' τσάπα ', 'F4F6F6');

			highlightWordAcrossNode(' Σκάλα ', 'F4F6F6');
			highlightWordAcrossNode(' σκάλα ', 'F4F6F6');

			highlightWordAcrossNode(' Λάσκα ', 'F4F6F6');
			highlightWordAcrossNode(' λάσκα ', 'F4F6F6');

			highlightWordAcrossNode(' Σόμπα ', 'F4F6F6');
			highlightWordAcrossNode(' σόμπα ', 'F4F6F6');

			highlightWordAcrossNode(' Μπάσο ', 'F4F6F6');
			highlightWordAcrossNode(' μπάσο ', 'F4F6F6');

			highlightWordAcrossNode(' Όλος ', 'F4F6F6');
			highlightWordAcrossNode(' όλος ', 'F4F6F6');

			highlightWordAcrossNode(' Σόλο ', 'F4F6F6');
			highlightWordAcrossNode(' σόλο ', 'F4F6F6');

			highlightWordAcrossNode(' Σώμα ', 'F4F6F6');
			highlightWordAcrossNode(' σώμα ', 'F4F6F6');

			highlightWordAcrossNode(' Μασώ ', 'F4F6F6');
			highlightWordAcrossNode(' μασώ ', 'F4F6F6');

			highlightWordAcrossNode(' Μάτια ', 'F4F6F6');
			highlightWordAcrossNode(' μάτια ', 'F4F6F6');

			highlightWordAcrossNode(' Άτιμα ', 'F4F6F6');
			highlightWordAcrossNode(' άτιμα ', 'F4F6F6');

			highlightWordAcrossNode(' Μάνα ', 'F4F6F6');
			highlightWordAcrossNode(' μάνα ', 'F4F6F6');

			highlightWordAcrossNode(' Αμάν ', 'F4F6F6');
			highlightWordAcrossNode(' αμάν ', 'F4F6F6');
			
			highlightWordAcrossNode(' Μπουκιά ', 'F4F6F6');
			highlightWordAcrossNode(' μπουκιά ', 'F4F6F6');

			highlightWordAcrossNode(' Κουμπιά ', 'F4F6F6');
			highlightWordAcrossNode(' κουμπιά ', 'F4F6F6');

			highlightWordAcrossNode(' Φαράσι ', 'F4F6F6');
			highlightWordAcrossNode(' φαράσι ', 'F4F6F6');

			highlightWordAcrossNode(' Σαφάρι ', 'F4F6F6');
			highlightWordAcrossNode(' σαφάρι ', 'F4F6F6');

			highlightWordAcrossNode(' Βοή ', 'F4F6F6');
			highlightWordAcrossNode(' βοή ', 'F4F6F6');

			highlightWordAcrossNode(' Ροή ', 'F4F6F6');
			highlightWordAcrossNode(' ροή ', 'F4F6F6');

			highlightWordAcrossNode(' Πράγμα ', 'F4F6F6');
			highlightWordAcrossNode(' πράγμα ', 'F4F6F6');

			highlightWordAcrossNode(' Φράγμα ', 'F4F6F6');
			highlightWordAcrossNode(' φράγμα ', 'F4F6F6');

			highlightWordAcrossNode(' Βάρος ', 'F4F6F6');
			highlightWordAcrossNode(' βάρος ', 'F4F6F6');

			highlightWordAcrossNode(' Φάρος ', 'F4F6F6');
			highlightWordAcrossNode(' φάρος ', 'F4F6F6');

			highlightWordAcrossNode(' Θάρρος ', 'F4F6F6');
			highlightWordAcrossNode(' θάρρος ', 'F4F6F6');

			highlightWordAcrossNode(' Πόρτα ', 'F4F6F6');
			highlightWordAcrossNode(' πόρτα ', 'F4F6F6');

			highlightWordAcrossNode(' Χόρτα ', 'F4F6F6');
			highlightWordAcrossNode(' χόρτα ', 'F4F6F6');

			highlightWordAcrossNode(' Ψέμα ', 'F4F6F6');
			highlightWordAcrossNode(' ψέμα ', 'F4F6F6');

			highlightWordAcrossNode(' Δέμα ', 'F4F6F6');
			highlightWordAcrossNode(' δέμα ', 'F4F6F6');

			highlightWordAcrossNode(' Βλέμμα ', 'F4F6F6');
			highlightWordAcrossNode(' βλέμμα ', 'F4F6F6');

			highlightWordAcrossNode(' Κάστρο ', 'F4F6F6');
			highlightWordAcrossNode(' κάστρο ', 'F4F6F6');

			highlightWordAcrossNode(' Άστρο ', 'F4F6F6');
			highlightWordAcrossNode(' άστρο ', 'F4F6F6');

			highlightWordAcrossNode(' Σαύρα ', 'F4F6F6');
			highlightWordAcrossNode(' σαύρα ', 'F4F6F6');

			highlightWordAcrossNode(' Αύρα ', 'F4F6F6');
			highlightWordAcrossNode(' αύρα ', 'F4F6F6');

			highlightWordAcrossNode(' Χιόνι ', 'F4F6F6');
			highlightWordAcrossNode(' χιόνι ', 'F4F6F6');

			highlightWordAcrossNode(' Πιόνι ', 'F4F6F6');
			highlightWordAcrossNode(' πιόνι ', 'F4F6F6');

			highlightWordAcrossNode(' Πόδι ', 'F4F6F6');
			highlightWordAcrossNode(' πόδι ', 'F4F6F6');

			highlightWordAcrossNode(' Ρόδι ', 'F4F6F6');
			highlightWordAcrossNode(' ρόδι ', 'F4F6F6');

			highlightWordAcrossNode(' Ποδιά ', 'F4F6F6');
			highlightWordAcrossNode(' ποδιά ', 'F4F6F6');

			highlightWordAcrossNode(' Ροδιά ', 'F4F6F6');
			highlightWordAcrossNode(' ροδιά ', 'F4F6F6');

			highlightWordAcrossNode(' Γερός ', 'F4F6F6');
			highlightWordAcrossNode(' γερός ', 'F4F6F6');

			highlightWordAcrossNode(' Ξερός ', 'F4F6F6');
			highlightWordAcrossNode(' ξερός ', 'F4F6F6');

			highlightWordAcrossNode(' Ξίδι ', 'F4F6F6');
			highlightWordAcrossNode(' ξίδι ', 'F4F6F6');

			highlightWordAcrossNode(' Μύδι ', 'F4F6F6');
			highlightWordAcrossNode(' μύδι ', 'F4F6F6');

			highlightWordAcrossNode(' Φρύδι ', 'F4F6F6');
			highlightWordAcrossNode(' φρύδι ', 'F4F6F6');

			highlightWordAcrossNode(' Στρείδι ', 'F4F6F6');
			highlightWordAcrossNode(' στρείδι ', 'F4F6F6');

			highlightWordAcrossNode(' Κόμπος ', 'F4F6F6');
			highlightWordAcrossNode(' κόμπος ', 'F4F6F6');

			highlightWordAcrossNode(' Γλόμπος ', 'F4F6F6');
			highlightWordAcrossNode(' γλόμπος ', 'F4F6F6');

			highlightWordAcrossNode(' Λάθος ', 'F4F6F6');
			highlightWordAcrossNode(' λάθος ', 'F4F6F6');

			highlightWordAcrossNode(' Πάθoς ', 'F4F6F6');
			highlightWordAcrossNode(' πάθoς ', 'F4F6F6');

			highlightWordAcrossNode(' Βάθος ', 'F4F6F6');
			highlightWordAcrossNode(' βάθος ', 'F4F6F6');

			highlightWordAcrossNode(' Κώμα ', 'F4F6F6');
			highlightWordAcrossNode(' κώμα ', 'F4F6F6');

			highlightWordAcrossNode(' Δώμα ', 'F4F6F6');
			highlightWordAcrossNode(' δώμα ', 'F4F6F6');

			highlightWordAcrossNode(' Χώμα ', 'F4F6F6');
			highlightWordAcrossNode(' χώμα ', 'F4F6F6');

			highlightWordAcrossNode(' Βρώμα ', 'F4F6F6');
			highlightWordAcrossNode(' βρώμα ', 'F4F6F6');

			highlightWordAcrossNode(' Σώμα ', 'F4F6F6');
			highlightWordAcrossNode(' σώμα ', 'F4F6F6');

			highlightWordAcrossNode(' Πώμα ', 'F4F6F6');
			highlightWordAcrossNode(' πώμα ', 'F4F6F6');

			highlightWordAcrossNode(' Πτώμα ', 'F4F6F6');
			highlightWordAcrossNode(' πτώμα ', 'F4F6F6');

			highlightWordAcrossNode(' Χυλός ', 'F4F6F6');
			highlightWordAcrossNode(' χυλός ', 'F4F6F6');

			highlightWordAcrossNode(' Ψηλός ', 'F4F6F6');
			highlightWordAcrossNode(' ψηλός ', 'F4F6F6');

			highlightWordAcrossNode(' Τρένο ', 'F4F6F6');
			highlightWordAcrossNode(' τρένο ', 'F4F6F6');

			highlightWordAcrossNode(' Φρένο ', 'F4F6F6');
			highlightWordAcrossNode(' φρένο ', 'F4F6F6');

			highlightWordAcrossNode(' Σούστα ', 'F4F6F6');
			highlightWordAcrossNode(' σούστα ', 'F4F6F6');

			highlightWordAcrossNode(' Φούστα ', 'F4F6F6');
			highlightWordAcrossNode(' φούστα ', 'F4F6F6');

			highlightWordAcrossNode(' Πλύση ', 'F4F6F6');
			highlightWordAcrossNode(' πλύση ', 'F4F6F6');

			highlightWordAcrossNode(' Βρύση ', 'F4F6F6');
			highlightWordAcrossNode(' βρύση ', 'F4F6F6');

			highlightWordAcrossNode(' Κρίση ', 'F4F6F6');
			highlightWordAcrossNode(' κρίση ', 'F4F6F6');

			highlightWordAcrossNode(' Μέρα ', 'F4F6F6');
			highlightWordAcrossNode(' μέρα ', 'F4F6F6');

			highlightWordAcrossNode(' Βέρα ', 'F4F6F6');
			highlightWordAcrossNode(' βέρα ', 'F4F6F6');

			highlightWordAcrossNode(' Ξέρα ', 'F4F6F6');
			highlightWordAcrossNode(' ξέρα ', 'F4F6F6');

			highlightWordAcrossNode(' Πέρα ', 'F4F6F6');
			highlightWordAcrossNode(' πέρα ', 'F4F6F6');

			highlightWordAcrossNode(' Λέρα ', 'F4F6F6');
			highlightWordAcrossNode(' λέρα ', 'F4F6F6');

			highlightWordAcrossNode(' Ρητός ', 'F4F6F6');
			highlightWordAcrossNode(' ρητός ', 'F4F6F6');

			highlightWordAcrossNode(' Λιτός ', 'F4F6F6');
			highlightWordAcrossNode(' λιτός ', 'F4F6F6');

			highlightWordAcrossNode(' Ψητός ', 'F4F6F6');
			highlightWordAcrossNode(' ψητός ', 'F4F6F6');

			highlightWordAcrossNode(' Αυλή ', 'F4F6F6');
			highlightWordAcrossNode(' αυλή ', 'F4F6F6');

			highlightWordAcrossNode(' Αυγή ', 'F4F6F6');
			highlightWordAcrossNode(' αυγή ', 'F4F6F6');

			highlightWordAcrossNode(' Κραυγή ', 'F4F6F6');
			highlightWordAcrossNode(' κραυγή ', 'F4F6F6');

			highlightWordAcrossNode(' Στάμπα ', 'F4F6F6');
			highlightWordAcrossNode(' στάμπα ', 'F4F6F6');

			highlightWordAcrossNode(' Λάμπα ', 'F4F6F6');
			highlightWordAcrossNode(' λάμπα ', 'F4F6F6');
			
			highlightWordAcrossNode(' Σάμπα ', 'F4F6F6');
			highlightWordAcrossNode(' σάμπα ', 'F4F6F6');

			highlightWordAcrossNode(' Κράμπα ', 'F4F6F6');
			highlightWordAcrossNode(' κράμπα ', 'F4F6F6');

			highlightWordAcrossNode(' Ράμπα ', 'F4F6F6');
			highlightWordAcrossNode(' ράμπα ', 'F4F6F6');

			highlightWordAcrossNode(' Χάδι ', 'F4F6F6');
			highlightWordAcrossNode(' χάδι ', 'F4F6F6');

			highlightWordAcrossNode(' Λάδι ', 'F4F6F6');
			highlightWordAcrossNode(' λάδι ', 'F4F6F6');

			highlightWordAcrossNode(' Βράδυ ', 'F4F6F6');
			highlightWordAcrossNode(' βράδυ ', 'F4F6F6');

			highlightWordAcrossNode(' Κάλτσα ', 'F4F6F6');
			highlightWordAcrossNode(' κάλτσα ', 'F4F6F6');

			highlightWordAcrossNode(' Σάλτσα ', 'F4F6F6');
			highlightWordAcrossNode(' σάλτσα ', 'F4F6F6');

			highlightWordAcrossNode(' Θυμός ', 'F4F6F6');
			highlightWordAcrossNode(' θυμός ', 'F4F6F6');

			highlightWordAcrossNode(' Ρίζα ', 'F4F6F6');
			highlightWordAcrossNode(' ρίζα ', 'F4F6F6');

			highlightWordAcrossNode(' Μπρίζα ', 'F4F6F6');
			highlightWordAcrossNode(' μπρίζα ', 'F4F6F6');

			highlightWordAcrossNode(' Ρώμη ', 'F4F6F6');
			highlightWordAcrossNode(' ρώμη ', 'F4F6F6');

			highlightWordAcrossNode(' Γνώμη ', 'F4F6F6');
			highlightWordAcrossNode(' γνώμη ', 'F4F6F6');

			highlightWordAcrossNode(' Κρίμα ', 'F4F6F6');
			highlightWordAcrossNode(' κρίμα ', 'F4F6F6');

			highlightWordAcrossNode(' Χρήμα ', 'F4F6F6');
			highlightWordAcrossNode(' χρήμα ', 'F4F6F6');

			highlightWordAcrossNode(' Τρίμμα ', 'F4F6F6');
			highlightWordAcrossNode(' τρίμμα ', 'F4F6F6');

			highlightWordAcrossNode(' φώτα ', 'F4F6F6');
			highlightWordAcrossNode(' Φώτα ', 'F4F6F6');

			highlightWordAcrossNode(' Χνώτα ', 'F4F6F6');
			highlightWordAcrossNode(' χνώτα ', 'F4F6F6');

			highlightWordAcrossNode(' Κότα ', 'F4F6F6');
			highlightWordAcrossNode(' κότα ', 'F4F6F6');

			highlightWordAcrossNode(' Ρώτα ', 'F4F6F6');
			highlightWordAcrossNode(' ρώτα ', 'F4F6F6');

			highlightWordAcrossNode(' Νότα ', 'F4F6F6');
			highlightWordAcrossNode(' νότα ', 'F4F6F6');

			highlightWordAcrossNode(' Βατός ', 'F4F6F6');
			highlightWordAcrossNode(' βατός ', 'F4F6F6');

			highlightWordAcrossNode(' Πάτος ', 'F4F6F6');
			highlightWordAcrossNode(' πάτος ', 'F4F6F6');

			highlightWordAcrossNode(' Γάτος ', 'F4F6F6');
			highlightWordAcrossNode(' γάτος ', 'F4F6F6');

			highlightWordAcrossNode(' Νεύμα ', 'F4F6F6');
			highlightWordAcrossNode(' νεύμα ', 'F4F6F6');

			highlightWordAcrossNode(' Γεύμα ', 'F4F6F6');
			highlightWordAcrossNode(' γεύμα ', 'F4F6F6');

			highlightWordAcrossNode(' Πνεύμα ', 'F4F6F6');
			highlightWordAcrossNode(' πνεύμα ', 'F4F6F6');

			highlightWordAcrossNode(' Ρεύμα ', 'F4F6F6');
			highlightWordAcrossNode(' ρεύμα ', 'F4F6F6');

			highlightWordAcrossNode(' Στάλα ', 'F4F6F6');
			highlightWordAcrossNode(' στάλα ', 'F4F6F6');

			highlightWordAcrossNode(' Σκάλα ', 'F4F6F6');
			highlightWordAcrossNode(' σκάλα ', 'F4F6F6');

			highlightWordAcrossNode(' Σπάλα ', 'F4F6F6');
			highlightWordAcrossNode(' σπάλα ', 'F4F6F6');

			highlightWordAcrossNode(' Θήρα ', 'F4F6F6');
			highlightWordAcrossNode(' θήρα ', 'F4F6F6');

			highlightWordAcrossNode(' Χήρα ', 'F4F6F6');
			highlightWordAcrossNode(' χήρα ', 'F4F6F6');

			highlightWordAcrossNode(' Μοίρα ', 'F4F6F6');
			highlightWordAcrossNode(' μοίρα ', 'F4F6F6');

			highlightWordAcrossNode(' Πήρα ', 'F4F6F6');
			highlightWordAcrossNode(' πήρα ', 'F4F6F6');

			highlightWordAcrossNode(' Ψείρα ', 'F4F6F6');
			highlightWordAcrossNode(' ψείρα ', 'F4F6F6');

			highlightWordAcrossNode(' Γράμμα ', 'F4F6F6');
			highlightWordAcrossNode(' γράμμα ', 'F4F6F6');

			highlightWordAcrossNode(' Δράμα ', 'F4F6F6');
			highlightWordAcrossNode(' δράμα ', 'F4F6F6');

			highlightWordAcrossNode(' Κράμα ', 'F4F6F6');
			highlightWordAcrossNode(' κράμα ', 'F4F6F6');

			highlightWordAcrossNode(' Πράμα ', 'F4F6F6');
			highlightWordAcrossNode(' πράμα ', 'F4F6F6');

			highlightWordAcrossNode(' Βράκα ', 'F4F6F6');
			highlightWordAcrossNode(' βράκα ', 'F4F6F6');

			highlightWordAcrossNode(' Θράκα ', 'F4F6F6');
			highlightWordAcrossNode(' θράκα ', 'F4F6F6');

			highlightWordAcrossNode(' Νήμα ', 'F4F6F6');
			highlightWordAcrossNode(' νήμα ', 'F4F6F6');

			highlightWordAcrossNode(' Βήμα ', 'F4F6F6');
			highlightWordAcrossNode(' βήμα ', 'F4F6F6');

			highlightWordAcrossNode(' Σήμα ', 'F4F6F6');
			highlightWordAcrossNode(' σήμα ', 'F4F6F6');

			highlightWordAcrossNode(' Κύμα ', 'F4F6F6');
			highlightWordAcrossNode(' κύμα ', 'F4F6F6');

			highlightWordAcrossNode(' Ρήμα ', 'F4F6F6');
			highlightWordAcrossNode(' ρήμα ', 'F4F6F6');

			highlightWordAcrossNode(' Θύμα ', 'F4F6F6');
			highlightWordAcrossNode(' θύμα ', 'F4F6F6');

			highlightWordAcrossNode(' Χύμα ', 'F4F6F6');
			highlightWordAcrossNode(' χύμα ', 'F4F6F6');

			highlightWordAcrossNode(' Κλάσμα ', 'F4F6F6');
			highlightWordAcrossNode(' κλάσμα ', 'F4F6F6');

			highlightWordAcrossNode(' Πλάσμα ', 'F4F6F6');
			highlightWordAcrossNode(' πλάσμα ', 'F4F6F6');

			highlightWordAcrossNode(' Θλάση ', 'F4F6F6');
			highlightWordAcrossNode(' θλάση ', 'F4F6F6');

			highlightWordAcrossNode(' Κλάση ', 'F4F6F6');
			highlightWordAcrossNode(' κλάση ', 'F4F6F6');

			highlightWordAcrossNode(' Πλάση ', 'F4F6F6');
			highlightWordAcrossNode(' πλάση ', 'F4F6F6');

			highlightWordAcrossNode(' Χρίσμα ', 'F4F6F6');
			highlightWordAcrossNode(' χρίσμα ', 'F4F6F6');

			highlightWordAcrossNode(' Πρίσμα ', 'F4F6F6');
			highlightWordAcrossNode(' πρίσμα ', 'F4F6F6');

			highlightWordAcrossNode(' Μπίρα ', 'F4F6F6');
			highlightWordAcrossNode(' μπίρα ', 'F4F6F6');

			highlightWordAcrossNode(' Πείρα ', 'F4F6F6');
			highlightWordAcrossNode(' πείρα ', 'F4F6F6');

			highlightWordAcrossNode(' Μύλος ', 'F4F6F6');
			highlightWordAcrossNode(' μύλος ', 'F4F6F6');

			highlightWordAcrossNode(' Ψύλλος ', 'F4F6F6');
			highlightWordAcrossNode(' ψύλλος ', 'F4F6F6');

			highlightWordAcrossNode(' Φίλος ', 'F4F6F6');
			highlightWordAcrossNode(' φίλος ', 'F4F6F6');

			highlightWordAcrossNode(' Νείλος ', 'F4F6F6');
			highlightWordAcrossNode(' νείλος ', 'F4F6F6');

			highlightWordAcrossNode(' Χύτρα ', 'F4F6F6');
			highlightWordAcrossNode(' χύτρα ', 'F4F6F6');

			highlightWordAcrossNode(' Φύτρα ', 'F4F6F6');
			highlightWordAcrossNode(' φύτρα ', 'F4F6F6');

			highlightWordAcrossNode(' Μήτρα ', 'F4F6F6');
			highlightWordAcrossNode(' μήτρα ', 'F4F6F6');

			highlightWordAcrossNode(' Λύτρα ', 'F4F6F6');
			highlightWordAcrossNode(' λύτρα ', 'F4F6F6');

			highlightWordAcrossNode(' Ρήτρα ', 'F4F6F6');
			highlightWordAcrossNode(' ρήτρα ', 'F4F6F6');

			highlightWordAcrossNode(' Ρήξη ', 'F4F6F6');
			highlightWordAcrossNode(' ρήξη ', 'F4F6F6');

			highlightWordAcrossNode(' Σκύλος ', 'F4F6F6');
			highlightWordAcrossNode(' σκύλος ', 'F4F6F6');

			highlightWordAcrossNode(' Στύλος ', 'F4F6F6');
			highlightWordAcrossNode(' στύλος ', 'F4F6F6');

			highlightWordAcrossNode(' Μορφή ', 'F4F6F6');
			highlightWordAcrossNode(' μορφή ', 'F4F6F6');

			highlightWordAcrossNode(' Κορφή ', 'F4F6F6');
			highlightWordAcrossNode(' κορφή ', 'F4F6F6');

			highlightWordAcrossNode(' Πουγκί ', 'F4F6F6');
			highlightWordAcrossNode(' πουγκί ', 'F4F6F6');

			highlightWordAcrossNode(' Μουγκή ', 'F4F6F6');
			highlightWordAcrossNode(' μουγκή ', 'F4F6F6');

			highlightWordAcrossNode(' Τοίχος ', 'F4F6F6');
			highlightWordAcrossNode(' τοίχος ', 'F4F6F6');

			highlightWordAcrossNode(' Ψύχος ', 'F4F6F6');
			highlightWordAcrossNode(' ψύχος ', 'F4F6F6');

			highlightWordAcrossNode(' Δίχως ', 'F4F6F6');
			highlightWordAcrossNode(' δίχως ', 'F4F6F6');

			highlightWordAcrossNode(' Χολή ', 'F4F6F6');
			highlightWordAcrossNode(' χολή ', 'F4F6F6');

			highlightWordAcrossNode(' Θολή ', 'F4F6F6');
			highlightWordAcrossNode(' θολή ', 'F4F6F6');

			highlightWordAcrossNode(' Βολή ', 'F4F6F6');
			highlightWordAcrossNode(' βολή ', 'F4F6F6');

			highlightWordAcrossNode(' Πολύ ', 'F4F6F6');
			highlightWordAcrossNode(' πολύ ', 'F4F6F6');

			highlightWordAcrossNode(' Ήθος ', 'F4F6F6');
			highlightWordAcrossNode(' ήθος ', 'F4F6F6');

			highlightWordAcrossNode(' Μύθος ', 'F4F6F6');
			highlightWordAcrossNode(' μύθος ', 'F4F6F6');

			highlightWordAcrossNode(' Λίθος ', 'F4F6F6');
			highlightWordAcrossNode(' λίθος ', 'F4F6F6');

			highlightWordAcrossNode(' Στήθος ', 'F4F6F6');
			highlightWordAcrossNode(' στήθος ', 'F4F6F6');

			highlightWordAcrossNode(' Παλάτι ', 'F4F6F6');
			highlightWordAcrossNode(' παλάτι ', 'F4F6F6');

			highlightWordAcrossNode(' Αλάτι ', 'F4F6F6');
			highlightWordAcrossNode(' αλάτι ', 'F4F6F6');

			highlightWordAcrossNode(' Ζάχαρη ', 'F4F6F6');
			highlightWordAcrossNode(' ζάχαρη ', 'F4F6F6');

			highlightWordAcrossNode(' Άχαρη ', 'F4F6F6');
			highlightWordAcrossNode(' άχαρη ', 'F4F6F6');

			highlightWordAcrossNode(' Φουλάρι ', 'F4F6F6');
			highlightWordAcrossNode(' φουλάρι ', 'F4F6F6');

			highlightWordAcrossNode(' Μουλάρι ', 'F4F6F6');
			highlightWordAcrossNode(' μουλάρι ', 'F4F6F6');

			highlightWordAcrossNode(' Πουλάρι ', 'F4F6F6');
			highlightWordAcrossNode(' πουλάρι ', 'F4F6F6');

			highlightWordAcrossNode(' Φέρετρο ', 'F4F6F6');
			highlightWordAcrossNode(' φέρετρο ', 'F4F6F6');

			highlightWordAcrossNode(' Θέρετρο ', 'F4F6F6');
			highlightWordAcrossNode(' θέρετρο ', 'F4F6F6');

			highlightWordAcrossNode(' Λουκέτα ', 'F4F6F6');
			highlightWordAcrossNode(' λουκέτα ', 'F4F6F6');

			highlightWordAcrossNode(' Ρουκέτα ', 'F4F6F6');
			highlightWordAcrossNode(' ρουκέτα ', 'F4F6F6');

			highlightWordAcrossNode(' Ρακέτα ', 'F4F6F6');
			highlightWordAcrossNode(' ρακέτα ', 'F4F6F6');

			highlightWordAcrossNode(' Πακέτα ', 'F4F6F6');
			highlightWordAcrossNode(' πακέτα ', 'F4F6F6');

			highlightWordAcrossNode(' Μακέτα ', 'F4F6F6');
			highlightWordAcrossNode(' μακέτα ', 'F4F6F6');

			highlightWordAcrossNode(' Ζακέτα ', 'F4F6F6');
			highlightWordAcrossNode(' ζακέτα ', 'F4F6F6');

			highlightWordAcrossNode(' καρούλι ', 'F4F6F6');
			highlightWordAcrossNode(' Καρούλι ', 'F4F6F6');

			highlightWordAcrossNode(' Μαρούλι ', 'F4F6F6');
			highlightWordAcrossNode(' μαρούλι ', 'F4F6F6');

			highlightWordAcrossNode(' Λιβάδι ', 'F4F6F6');
			highlightWordAcrossNode(' λιβάδι ', 'F4F6F6');

			highlightWordAcrossNode(' Λιβάνι ', 'F4F6F6');
			highlightWordAcrossNode(' λιβάνι ', 'F4F6F6');

			highlightWordAcrossNode(' Στήνω ', 'F4F6F6');
			highlightWordAcrossNode(' στήνω ', 'F4F6F6');

			highlightWordAcrossNode(' Δίνω ', 'F4F6F6');
			highlightWordAcrossNode(' δίνω ', 'F4F6F6');

			highlightWordAcrossNode(' Λύνω ', 'F4F6F6');
			highlightWordAcrossNode(' λύνω ', 'F4F6F6');

			highlightWordAcrossNode(' Πίνω ', 'F4F6F6');
			highlightWordAcrossNode(' πίνω ', 'F4F6F6');

			highlightWordAcrossNode(' Χύνω ', 'F4F6F6');
			highlightWordAcrossNode(' χύνω ', 'F4F6F6');

			highlightWordAcrossNode(' Φτύνω ', 'F4F6F6');
			highlightWordAcrossNode(' φτύνω ', 'F4F6F6');

			highlightWordAcrossNode(' Βρέχω ', 'F4F6F6');
			highlightWordAcrossNode(' βρέχω ', 'F4F6F6');

			highlightWordAcrossNode(' Τρέχω ', 'F4F6F6');
			highlightWordAcrossNode(' τρέχω ', 'F4F6F6');

			highlightWordAcrossNode(' Ράβω ', 'F4F6F6');
			highlightWordAcrossNode(' ράβω ', 'F4F6F6');

			highlightWordAcrossNode(' Θάβω ', 'F4F6F6');
			highlightWordAcrossNode(' θάβω ', 'F4F6F6');

			highlightWordAcrossNode(' Θωρώ ', 'F4F6F6');
			highlightWordAcrossNode(' θωρώ ', 'F4F6F6');

			highlightWordAcrossNode(' Φορώ ', 'F4F6F6');
			highlightWordAcrossNode(' φορώ ', 'F4F6F6');

			highlightWordAcrossNode(' Παίρνω ', 'F4F6F6');
			highlightWordAcrossNode(' παίρνω ', 'F4F6F6');

			highlightWordAcrossNode(' Γέρνω ', 'F4F6F6');
			highlightWordAcrossNode(' γέρνω ', 'F4F6F6');

			highlightWordAcrossNode(' Σέρνω ', 'F4F6F6');
			highlightWordAcrossNode(' σέρνω ', 'F4F6F6');

			highlightWordAcrossNode(' Φέρνω ', 'F4F6F6');
			highlightWordAcrossNode(' φέρνω ', 'F4F6F6');

			highlightWordAcrossNode(' Φέρομαι ', 'F4F6F6');
			highlightWordAcrossNode(' φέρομαι ', 'F4F6F6');

			highlightWordAcrossNode(' Χαίρομαι ', 'F4F6F6');
			highlightWordAcrossNode(' χαίρομαι ', 'F4F6F6');

			highlightWordAcrossNode(' Δέχομαι ', 'F4F6F6');
			highlightWordAcrossNode(' δέχομαι ', 'F4F6F6');

			highlightWordAcrossNode(' Θυμάμαι ', 'F4F6F6');
			highlightWordAcrossNode(' θυμάμαι ', 'F4F6F6');

			highlightWordAcrossNode(' Κοιμάμαι ', 'F4F6F6');
			highlightWordAcrossNode(' κοιμάμαι ', 'F4F6F6');

			highlightWordAcrossNode(' Όλη ', 'F4F6F6');
			highlightWordAcrossNode(' όλη ', 'F4F6F6');

			highlightWordAcrossNode(' Πόλη ', 'F4F6F6');
			highlightWordAcrossNode(' πόλη ', 'F4F6F6');

			highlightWordAcrossNode(' Μπαλώνω ', 'F4F6F6');
			highlightWordAcrossNode(' μπαλώνω ', 'F4F6F6');

			highlightWordAcrossNode(' Φιλώ ', 'F4F6F6');
			highlightWordAcrossNode(' φιλώ ', 'F4F6F6');

			highlightWordAcrossNode(' Μιλώ ', 'F4F6F6');
			highlightWordAcrossNode(' μιλώ ', 'F4F6F6');

			highlightWordAcrossNode(' Κουζίνα ', 'F4F6F6');
			highlightWordAcrossNode(' κουζίνα ', 'F4F6F6');

			highlightWordAcrossNode(' Ντουζίνα ', 'F4F6F6');
			highlightWordAcrossNode(' ντουζίνα ', 'F4F6F6');

			highlightWordAcrossNode(' Νονός ', 'F4F6F6');
			highlightWordAcrossNode(' νονός ', 'F4F6F6');
		
			highlightWordAcrossNode(' Μονός ', 'F4F6F6');
			highlightWordAcrossNode(' μονός ', 'F4F6F6');

			highlightWordAcrossNode(' Γαύρος ', 'F4F6F6');
			highlightWordAcrossNode(' γαύρος ', 'F4F6F6');

			highlightWordAcrossNode(' Μαύρος ', 'F4F6F6');
			highlightWordAcrossNode(' μαύρος ', 'F4F6F6');

			highlightWordAcrossNode(' Βρέχω ', 'F4F6F6');
			highlightWordAcrossNode(' βρέχω ', 'F4F6F6');

			highlightWordAcrossNode(' Τρέχω ', 'F4F6F6');
			highlightWordAcrossNode(' τρέχω ', 'F4F6F6');

			highlightWordAcrossNode(' Ρέμα ', 'F4F6F6');
			highlightWordAcrossNode(' ρέμα ', 'F4F6F6');

			highlightWordAcrossNode(' Ρεύμα ', 'F4F6F6');
			highlightWordAcrossNode(' ρεύμα ', 'F4F6F6');

			highlightWordAcrossNode(' Βαγόνι ', 'F4F6F6');
			highlightWordAcrossNode(' βαγόνι ', 'F4F6F6');

			highlightWordAcrossNode(' Παγόνι ', 'F4F6F6');
			highlightWordAcrossNode(' παγόνι ', 'F4F6F6');

			highlightWordAcrossNode(' Θυμάρι ', 'F4F6F6');
			highlightWordAcrossNode(' θυμάρι ', 'F4F6F6');

			highlightWordAcrossNode(' Ζυμάρι ', 'F4F6F6');
			highlightWordAcrossNode(' ζυμάρι ', 'F4F6F6');

			highlightWordAcrossNode(' Νηστεία ', 'F4F6F6');
			highlightWordAcrossNode(' νηστεία ', 'F4F6F6');

			highlightWordAcrossNode(' Μαντίλι ', 'F4F6F6');
			highlightWordAcrossNode(' μαντίλι ', 'F4F6F6');

			highlightWordAcrossNode(' Καντήλι ', 'F4F6F6');
			highlightWordAcrossNode(' καντήλι ', 'F4F6F6');

			highlightWordAcrossNode(' Καρύδι ', 'F4F6F6');
			highlightWordAcrossNode(' καρύδι ', 'F4F6F6');

			highlightWordAcrossNode(' Βαρίδι ', 'F4F6F6');
			highlightWordAcrossNode(' βαρίδι ', 'F4F6F6');

			highlightWordAcrossNode(' Γίδα ', 'F4F6F6');
			highlightWordAcrossNode(' γίδα ', 'F4F6F6');

			highlightWordAcrossNode(' Βίδα ', 'F4F6F6');
			highlightWordAcrossNode(' βίδα ', 'F4F6F6');

			highlightWordAcrossNode(' Τέρμα ', 'F4F6F6');
			highlightWordAcrossNode(' τέρμα ', 'F4F6F6');

			highlightWordAcrossNode(' Στρέμμα ', 'F4F6F6');
			highlightWordAcrossNode(' στρέμμα ', 'F4F6F6');

			highlightWordAcrossNode(' Βουλευτής ', 'F4F6F6');
			highlightWordAcrossNode(' βουλευτής ', 'F4F6F6');

			highlightWordAcrossNode(' Δουλευτής ', 'F4F6F6');
			highlightWordAcrossNode(' δουλευτής ', 'F4F6F6');

			highlightWordAcrossNode(' Παίρνω ', 'F4F6F6');
			highlightWordAcrossNode(' παίρνω ', 'F4F6F6');

			highlightWordAcrossNode(' Περνώ ', 'F4F6F6');
			highlightWordAcrossNode(' περνώ ', 'F4F6F6');
		
			highlightWordAcrossNode(' Γλάστρα ', 'F4F6F6');
			highlightWordAcrossNode(' γλάστρα ', 'F4F6F6');

			highlightWordAcrossNode(' Κάστρα ', 'F4F6F6');
			highlightWordAcrossNode(' κάστρα ', 'F4F6F6');

			highlightWordAcrossNode(' Γεράκι ', 'F4F6F6');
			highlightWordAcrossNode(' γεράκι ', 'F4F6F6');

			highlightWordAcrossNode(' Μεράκι ', 'F4F6F6');
			highlightWordAcrossNode(' μεράκι ', 'F4F6F6');

			highlightWordAcrossNode(' Βάρος ', 'F4F6F6');
			highlightWordAcrossNode(' βάρος ', 'F4F6F6');

			highlightWordAcrossNode(' Φάρος ', 'F4F6F6');
			highlightWordAcrossNode(' φάρος ', 'F4F6F6');

			highlightWordAcrossNode(' Τέρας ', 'F4F6F6');
			highlightWordAcrossNode(' τέρας ', 'F4F6F6');

			highlightWordAcrossNode(' Κρέας ', 'F4F6F6');
			highlightWordAcrossNode(' κρέας ', 'F4F6F6');

			highlightWordAcrossNode(' Ίσως ', 'F4F6F6');
			highlightWordAcrossNode(' ίσως ', 'F4F6F6');

			highlightWordAcrossNode(' Μίσος ', 'F4F6F6');
			highlightWordAcrossNode(' μίσος ', 'F4F6F6');

			highlightWordAcrossNode(' Κάμπος ', 'F4F6F6');
			highlightWordAcrossNode(' κάμπος ', 'F4F6F6');

			highlightWordAcrossNode(' κόμπος ', 'F4F6F6');
			highlightWordAcrossNode(' κόμπος ', 'F4F6F6');

			highlightWordAcrossNode(' Τρένα ', 'F4F6F6');
			highlightWordAcrossNode(' τρένα ', 'F4F6F6');

			highlightWordAcrossNode(' Φρένα ', 'F4F6F6');
			highlightWordAcrossNode(' φρένα ', 'F4F6F6');

			highlightWordAcrossNode(' Βρέθηκα ', 'F4F6F6');
			highlightWordAcrossNode(' βρέθηκα ', 'F4F6F6');

			highlightWordAcrossNode(' Μαθαίνω ', 'F4F6F6');
			highlightWordAcrossNode(' μαθαίνω ', 'F4F6F6');

			highlightWordAcrossNode(' Παθαίνω ', 'F4F6F6');
			highlightWordAcrossNode(' παθαίνω ', 'F4F6F6');

			highlightWordAcrossNode(' Λουρί ', 'F4F6F6');
			highlightWordAcrossNode(' λουρί ', 'F4F6F6');

			highlightWordAcrossNode(' Φλουρί ', 'F4F6F6');
			highlightWordAcrossNode(' φλουρί ', 'F4F6F6');

			highlightWordAcrossNode(' Μέρος ', 'F4F6F6');
			highlightWordAcrossNode(' μέρος ', 'F4F6F6');

			highlightWordAcrossNode(' Γέρος ', 'F4F6F6');
			highlightWordAcrossNode(' γέρος ', 'F4F6F6');

			highlightWordAcrossNode(' Γέρος ', 'F4F6F6');
			highlightWordAcrossNode(' γέρος ', 'F4F6F6');

			highlightWordAcrossNode(' Κύπρος ', 'F4F6F6');
			highlightWordAcrossNode(' κύπρος ', 'F4F6F6');

			highlightWordAcrossNode(' Κύρος ', 'F4F6F6');
			highlightWordAcrossNode(' κύρος ', 'F4F6F6');

			highlightWordAcrossNode(' Επιμονή ', 'F4F6F6');
			highlightWordAcrossNode(' επιμονή ', 'F4F6F6');

			highlightWordAcrossNode(' Υπομονή ', 'F4F6F6');
			highlightWordAcrossNode(' υπομονή ', 'F4F6F6');

			highlightWordAcrossNode(' Κλάμα ', 'F4F6F6');
			highlightWordAcrossNode(' κλάμα ', 'F4F6F6');

			highlightWordAcrossNode(' Κλίμα ', 'F4F6F6');
			highlightWordAcrossNode(' κλίμα ', 'F4F6F6');

			highlightWordAcrossNode(' Κέντρα ', 'F4F6F6');
			highlightWordAcrossNode(' κέντρα ', 'F4F6F6');

			highlightWordAcrossNode(' Δεντρά ', 'F4F6F6');
			highlightWordAcrossNode(' δεντρά ', 'F4F6F6');

			highlightWordAcrossNode(' Ζυγίζω ', 'F4F6F6');
			highlightWordAcrossNode(' ζυγίζω ', 'F4F6F6');

			highlightWordAcrossNode(' Λυγίζω ', 'F4F6F6');
			highlightWordAcrossNode(' λυγίζω ', 'F4F6F6');

			*/
			
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
