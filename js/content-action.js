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


	//words spacing actions getting the value from the API
	chrome.storage.onChanged.addListener(() => {
		chrome.storage.sync.get(['spacing_value'], function(spacing) {
			//console.log(spacing.spacing_value);
			document.getElementsByTagName("body")[0].style.wordSpacing = String(spacing.spacing_value)+"px";
		})
	});
	 
	//letter spacing actions getting the value from the API
	chrome.storage.onChanged.addListener(() => {
		chrome.storage.sync.get(['letter_value'], function(spacing) {
			//console.log(spacing.spacing_value);
			document.getElementsByTagName("body")[0].style.letterSpacing = String(spacing.letter_value)+"px";
		})
	});

	//size font actions getting the value from the API
	chrome.storage.onChanged.addListener(() => {
		chrome.storage.sync.get(['size_value'], function(spacing) {
			console.log("ici", spacing.size_value);
			document.getElementsByTagName("body")[0].style.fontSize = String(spacing.size_value + 17)+"px";
		})
	});
	
	//font selection actions getting the value from the API
	chrome.storage.onChanged.addListener(() => {
		chrome.storage.sync.get(['font_selected'], function(font_selected) {
			console.log(font_selected.font_selected);
			document.getElementsByTagName("body")[0].style.fontFamily = String(font_selected.font_selected);
		})
	});

	
	highlightWordAcrossNode(' Ζώνη ', 'fcedb3');
	highlightWordAcrossNode(' ζώνη ', 'fcedb3');

	highlightWordAcrossNode(' Ζωή ', 'fcb0c1');
	highlightWordAcrossNode(' ζωή ', 'fcb0c1');

	highlightWordAcrossNode(' Άγνωστοι ', 'bc5714');

	highlightWordAcrossNode(' πληρώνω ', 'bbe580');

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
	//highlightWordAcrossNode('La', 'FFE4C4'); // testing purpose

	
	highlightWordAcrossNode(' Σόλα ', 'e8c481');
	highlightWordAcrossNode(' σόλα ', 'e8c481');

	highlightWordAcrossNode(' Λάσο ', 'e0bb70');
	highlightWordAcrossNode(' Λάσο ', 'e0bb70');

	highlightWordAcrossNode(' Γόπα ', 'eab956');
	highlightWordAcrossNode(' γόπα ', 'eab956');

	highlightWordAcrossNode(' Πάγο ', 'ccfffe');
	highlightWordAcrossNode(' Πάγο ', 'ccfffe');

	highlightWordAcrossNode(' Πρόκα ', 'e2c271');
	highlightWordAcrossNode(' πρόκα ', 'e2c271');

	highlightWordAcrossNode(' Πάρκο ', '85f957');
	highlightWordAcrossNode(' πάρκο ', '85f957');

	highlightWordAcrossNode(' Όπλο ', 'f4f4f4');
	highlightWordAcrossNode(' όπλο ', 'f4f4f4');

	highlightWordAcrossNode(' Απλό ', 'a7e5e5');
	highlightWordAcrossNode(' απλό ', 'a7e5e5');

	highlightWordAcrossNode(' Άρπα ', 'f3f489');
	highlightWordAcrossNode(' άρπα ', 'f3f489');

	highlightWordAcrossNode(' Κορμί ', 'f9cbbd');
	highlightWordAcrossNode(' κορμί ', 'f9cbbd');

	highlightWordAcrossNode(' Μικρό ', 'fcdef5');
	highlightWordAcrossNode(' μικρό ', 'fcdef5');

	highlightWordAcrossNode(' Στόμα ', 'f9cab3');
	highlightWordAcrossNode(' στόμα ', 'f9cab3');

	highlightWordAcrossNode(' Μάτσο ', 'F4F6F6');
	highlightWordAcrossNode(' μάτσο ', 'F4F6F6');

	highlightWordAcrossNode(' Νόμος ', '9fc7f2');
	highlightWordAcrossNode(' νόμος ', '9fc7f2');

	highlightWordAcrossNode(' Μονός ', 'e0e0e0');
	highlightWordAcrossNode(' μονός ', 'e0e0e0');

	highlightWordAcrossNode(' Σκότος ', 'a0a0a0');
	highlightWordAcrossNode(' σκότος ', 'a0a0a0');

	highlightWordAcrossNode(' Κόστος ', 'fdff93');
	highlightWordAcrossNode(' κόστος ', 'fdff93');

	highlightWordAcrossNode(' Νήμα ', 'c45e38');
	highlightWordAcrossNode(' νήμα ', 'c45e38');

	highlightWordAcrossNode(' Μήνα ', '19b6ff');
	highlightWordAcrossNode(' μήνα ', '19b6ff');

	highlightWordAcrossNode(' Αμήν ', 'edf26f');
	highlightWordAcrossNode(' αμήν ', 'edf26f');

	highlightWordAcrossNode(' Πίστα ', '919191');
	highlightWordAcrossNode(' πίστα ', '919191');

	highlightWordAcrossNode(' Κατσαρός ', 'edc79a');
	highlightWordAcrossNode(' κατσαρός ', 'edc79a');

	highlightWordAcrossNode(' Καστανός ', 'b77235');
	highlightWordAcrossNode(' καστανός ', 'b77235');

	highlightWordAcrossNode(' Αργός ', 'ad2105');
	highlightWordAcrossNode(' αργός ', 'ad2105');

	highlightWordAcrossNode(' Άπραχτος ', '79eac6');
	highlightWordAcrossNode(' άπραχτος ', '79eac6');

	highlightWordAcrossNode(' Παπί ', 'fffbba');
	highlightWordAcrossNode(' παπί ', 'fffbba');

	highlightWordAcrossNode(' Πίπα ', 'b77235');
	highlightWordAcrossNode(' πίπα ', 'b77235');

	highlightWordAcrossNode(' Ταπί ', 'cffc9c');
	highlightWordAcrossNode(' ταπί ', 'cffc9c');

	highlightWordAcrossNode(' Πίτα ', 'ea152a');
	highlightWordAcrossNode(' πίτα ', 'ea152a');

	highlightWordAcrossNode(' Ζάρι ', 'ededed');
	highlightWordAcrossNode(' ζάρι ', 'ededed');

	highlightWordAcrossNode(' Ρίζα ', 'a2f9a2');
	highlightWordAcrossNode(' ρίζα ', 'a2f9a2');

	highlightWordAcrossNode(' Ψηλή ', '6879dd');
	highlightWordAcrossNode(' ψηλή ', '6879dd');

	highlightWordAcrossNode(' Λήψη ', 'a4d9f4');
	highlightWordAcrossNode(' λήψη ', 'a4d9f4');

	highlightWordAcrossNode(' Ξηρή ', 'bc8a0b');
	highlightWordAcrossNode(' ξηρή ', 'bc8a0b');

	highlightWordAcrossNode(' Ρήξη ', 'ebf7e6');
	highlightWordAcrossNode(' ρήξη ', 'ebf7e6');

	highlightWordAcrossNode(' Καμπή ', '9ec0f7');
	highlightWordAcrossNode(' καμπή ', '9ec0f7');

	highlightWordAcrossNode(' Μπήκα ', 'fcbd79');
	highlightWordAcrossNode(' μπήκα ', 'fcbd79');

	highlightWordAcrossNode(' Δομές ', 'dbc9b8');
	highlightWordAcrossNode(' δομές ', 'dbc9b8');

	highlightWordAcrossNode(' Δεσμό ', 'd1a18a');
	highlightWordAcrossNode(' δεσμό ', 'd1a18a');

	highlightWordAcrossNode(' Στέκα ', '7f5c4f');
	highlightWordAcrossNode(' στέκα ', '7f5c4f');

	highlightWordAcrossNode(' Σκέτα ', 'e0e0e0');
	highlightWordAcrossNode(' σκέτα ', 'e0e0e0');

	highlightWordAcrossNode(' Φέτα ', 'cce8ff');
	highlightWordAcrossNode(' φέτα ', 'cce8ff');

	highlightWordAcrossNode(' Εφτά ', 'adadad');
	highlightWordAcrossNode(' εφτά ', 'adadad');

	highlightWordAcrossNode(' Τόπος ', '7de08a');
	highlightWordAcrossNode(' τόπος ', '7de08a');

	highlightWordAcrossNode(' Πόστο ', '738cc6');
	highlightWordAcrossNode(' πόστο ', '738cc6');

	highlightWordAcrossNode(' Στόλος ', '709ed3');
	highlightWordAcrossNode(' στόλος ', '709ed3');

	highlightWordAcrossNode(' Λοστός ', '3d3d3d');
	highlightWordAcrossNode(' λοστός ', '3d3d3d');

	highlightWordAcrossNode(' Κάσα ', 'cc6b3b');
	highlightWordAcrossNode(' κάσα ', 'cc6b3b');

	highlightWordAcrossNode(' Σάκα ', 'b54c0a');
	highlightWordAcrossNode(' σάκα ', 'b54c0a');

	highlightWordAcrossNode(' Καράβια ', 'd6713b');
	highlightWordAcrossNode(' καράβια ', 'd6713b');

	highlightWordAcrossNode(' Αραβικά ', '8e2102');
	highlightWordAcrossNode(' αραβικά ', '8e2102');

	highlightWordAcrossNode(' Σκάγια ', 'ed8497');
	highlightWordAcrossNode(' σκάγια ', 'ed8497');

	highlightWordAcrossNode(' Γιακάς ', 'edb784');
	highlightWordAcrossNode(' γιακάς ', 'edb784');

	highlightWordAcrossNode(' Ντομάτα ', 'f97284');
	highlightWordAcrossNode(' ντομάτα ', 'f97284');

	highlightWordAcrossNode(' Μαντάτο ', 'f9b3e3');
	highlightWordAcrossNode(' μαντάτο ', 'f9b3e3');

	highlightWordAcrossNode(' Κάρο ', 'f99981');
	highlightWordAcrossNode(' κάρο ', 'f99981');

	highlightWordAcrossNode(' Ρόκα ', 'aefcab');
	highlightWordAcrossNode(' ρόκα ', 'aefcab');

	highlightWordAcrossNode(' Νίκησα ', 'fcf4b5');
	highlightWordAcrossNode(' νίκησα ', 'fcf4b5');

	highlightWordAcrossNode(' Κίνησα ', '9be9ff');
	highlightWordAcrossNode(' κίνησα ', '9be9ff');

	highlightWordAcrossNode(' Αρχείο ', 'edb784');
	highlightWordAcrossNode(' αρχείο ', 'edb784');

	highlightWordAcrossNode(' Αχρείο ', 'dddddd');
	highlightWordAcrossNode(' αχρείο ', 'dddddd');

	highlightWordAcrossNode(' Αργία ', 'b7b7b7');
	highlightWordAcrossNode(' αργία ', 'b7b7b7');

	highlightWordAcrossNode(' Άγρια ', 'c60522');
	highlightWordAcrossNode(' άγρια ', 'c60522');

	highlightWordAcrossNode(' Αρπαγή ', 'f24f3a');
	highlightWordAcrossNode(' αρπαγή ', 'f24f3a');

	highlightWordAcrossNode(' Άπραγη ', 'f4d0b5');
	highlightWordAcrossNode(' άπραγη ', 'f4d0b5');

	highlightWordAcrossNode(' Πατρίδα ', 'a7e8f9');
	highlightWordAcrossNode(' πατρίδα ', 'a7e8f9');

	highlightWordAcrossNode(' Παρτίδα ', 'd8ffa3');
	highlightWordAcrossNode(' παρτίδα ', 'd8ffa3');

	highlightWordAcrossNode(' Κόπος ', 'e5096f');
	highlightWordAcrossNode(' κόπος ', 'e5096f');

	highlightWordAcrossNode(' Σκοπό ', 'c4d6ff');
	highlightWordAcrossNode(' σκοπό ', 'c4d6ff');



	highlightWordAcrossNode(' Μύθος ', '69eab2');
	highlightWordAcrossNode(' μύθος ', '69eab2');

	highlightWordAcrossNode(' Θυμός ', 'f78988');
	highlightWordAcrossNode(' θυμός ', 'f78988');


	highlightWordAcrossNode(' Μπάλα ', 'b0d9fc');
	highlightWordAcrossNode(' μπάλα ', 'b0d9fc');

	highlightWordAcrossNode(' Πάστα ', 'bee5f7');
	highlightWordAcrossNode(' πάστα ', 'bee5f7');

	highlightWordAcrossNode(' Τσάπα ', 'ef9d92');
	highlightWordAcrossNode(' τσάπα ', 'ef9d92');

	highlightWordAcrossNode(' Σκάλα ', 'f2c6a2');
	highlightWordAcrossNode(' σκάλα ', 'f2c6a2');

	highlightWordAcrossNode(' Λάσκα ', 'e6c0f9');
	highlightWordAcrossNode(' λάσκα ', 'e6c0f9');

	highlightWordAcrossNode(' Σόμπα ', 'f4e375');
	highlightWordAcrossNode(' σόμπα ', 'f4e375');

	highlightWordAcrossNode(' Μπάσο ', 'b49aed');
	highlightWordAcrossNode(' μπάσο ', 'b49aed');

	highlightWordAcrossNode(' Όλος ', 'f9c8a9');
	highlightWordAcrossNode(' όλος ', 'f9c8a9');

	highlightWordAcrossNode(' Σόλο ', '74f289');
	highlightWordAcrossNode(' σόλο ', '74f289');

	highlightWordAcrossNode(' Σώμα ', 'fccc85');
	highlightWordAcrossNode(' σώμα ', 'fccc85');

	highlightWordAcrossNode(' Μασώ ', 'fca4a7');
	highlightWordAcrossNode(' μασώ ', 'fca4a7');

	highlightWordAcrossNode(' Μάτια ', 'ffd1b7');
	highlightWordAcrossNode(' μάτια ', 'ffd1b7');

	highlightWordAcrossNode(' Άτιμα ', 'beed7d');
	highlightWordAcrossNode(' άτιμα ', 'beed7d');

	highlightWordAcrossNode(' Μάνα ', '61abd8');
	highlightWordAcrossNode(' μάνα ', '61abd8');

	highlightWordAcrossNode(' Αμάν ', 'ffcce9');
	highlightWordAcrossNode(' αμάν ', 'ffcce9');
	
	highlightWordAcrossNode(' Μπουκιά ', 'ffccd7');
	highlightWordAcrossNode(' μπουκιά ', 'ffccd7');

	highlightWordAcrossNode(' Κουμπιά ', 'ffc99e');
	highlightWordAcrossNode(' κουμπιά ', 'ffc99e');

	highlightWordAcrossNode(' Φαράσι ', 'ed8492');
	highlightWordAcrossNode(' φαράσι ', 'ed8492');

	highlightWordAcrossNode(' Σαφάρι ', 'a4f990');
	highlightWordAcrossNode(' σαφάρι ', 'a4f990');

	highlightWordAcrossNode(' Βοή ', '83c8ea');
	highlightWordAcrossNode(' βοή ', '83c8ea');

	highlightWordAcrossNode(' Ροή ', 'c6e3ff');
	highlightWordAcrossNode(' ροή ', 'c6e3ff');

	highlightWordAcrossNode(' Πράγμα ', 'bbf3f7');
	highlightWordAcrossNode(' πράγμα ', 'bbf3f7');

	highlightWordAcrossNode(' Φράγμα ', 'f0f49a');
	highlightWordAcrossNode(' φράγμα ', 'f0f49a');

	highlightWordAcrossNode(' Βάρος ', '8f87ff');
	highlightWordAcrossNode(' βάρος ', '8f87ff');

	highlightWordAcrossNode(' Φάρος ', 'f9f1a7');
	highlightWordAcrossNode(' φάρος ', 'f9f1a7');

	highlightWordAcrossNode(' Θάρρος ', '84ffee');
	highlightWordAcrossNode(' θάρρος ', '84ffee');

	highlightWordAcrossNode(' Πόρτα ', 'f9e6a2');
	highlightWordAcrossNode(' πόρτα ', 'f9e6a2');

	highlightWordAcrossNode(' Χόρτα ', '7aef95');
	highlightWordAcrossNode(' χόρτα ', '7aef95');

	highlightWordAcrossNode(' Ψέμα ', 'f9fca1');
	highlightWordAcrossNode(' ψέμα ', 'f9fca1');

	highlightWordAcrossNode(' Δέμα ', 'd6bb42');
	highlightWordAcrossNode(' δέμα ', 'd6bb42');

	highlightWordAcrossNode(' Βλέμμα ', 'ef8389');
	highlightWordAcrossNode(' βλέμμα ', 'ef8389');

	highlightWordAcrossNode(' Κάστρο ', 'fca874');
	highlightWordAcrossNode(' κάστρο ', 'fca874');

	highlightWordAcrossNode(' Άστρο ', 'c9ffff');
	highlightWordAcrossNode(' άστρο ', 'c9ffff');

	highlightWordAcrossNode(' Σαύρα ', 'b3f274');
	highlightWordAcrossNode(' σαύρα ', 'b3f274');

	highlightWordAcrossNode(' Αύρα ', '89eaf9');
	highlightWordAcrossNode(' αύρα ', '89eaf9');

	highlightWordAcrossNode(' Χιόνι ', 'c4e6fc');
	highlightWordAcrossNode(' χιόνι ', 'c4e6fc');

	highlightWordAcrossNode(' Πιόνι ', 'cccccc');
	highlightWordAcrossNode(' πιόνι ', 'cccccc');

	highlightWordAcrossNode(' Πόδι ', 'fc8e8a');
	highlightWordAcrossNode(' πόδι ', 'fc8e8a');

	highlightWordAcrossNode(' Ρόδι ', 'ef8389');
	highlightWordAcrossNode(' ρόδι ', 'ef8389');

	highlightWordAcrossNode(' Ποδιά ', 'ed8c80');
	highlightWordAcrossNode(' ποδιά ', 'ed8c80');

	highlightWordAcrossNode(' Ροδιά ', 'f76845');
	highlightWordAcrossNode(' ροδιά ', 'f76845');

	highlightWordAcrossNode(' Γερός ', 'f2b285');
	highlightWordAcrossNode(' γερός ', 'f2b285');

	highlightWordAcrossNode(' Ξερός ', 'fff4bf');
	highlightWordAcrossNode(' ξερός ', 'fff4bf');

	highlightWordAcrossNode(' Ξίδι ', 'edab76');
	highlightWordAcrossNode(' ξίδι ', 'edab76');

	highlightWordAcrossNode(' Μύδι ', 'b2ffd1');
	highlightWordAcrossNode(' μύδι ', 'b2ffd1');

	highlightWordAcrossNode(' Φρύδι ', 'ffbcd5');
	highlightWordAcrossNode(' φρύδι ', 'ffbcd5');

	highlightWordAcrossNode(' Στρείδι ', 'adaaef');
	highlightWordAcrossNode(' στρείδι ', 'adaaef');

	highlightWordAcrossNode(' Κόμπος ', 'f2b676');
	highlightWordAcrossNode(' κόμπος ', 'f2b676');

	highlightWordAcrossNode(' Γλόμπος ', 'bcd2ff');
	highlightWordAcrossNode(' γλόμπος ', 'bcd2ff');

	highlightWordAcrossNode(' Λάθος ', 'f97292');
	highlightWordAcrossNode(' λάθος ', 'f97292');

	highlightWordAcrossNode(' Πάθoς ', 'f79edf');
	highlightWordAcrossNode(' πάθoς ', 'f79edf');

	highlightWordAcrossNode(' Βάθος ', '9b7cff');
	highlightWordAcrossNode(' βάθος ', '9b7cff');

	highlightWordAcrossNode(' Κώμα ', 'ebef6e');
	highlightWordAcrossNode(' κώμα ', 'ebef6e');

	highlightWordAcrossNode(' Δώμα ', 'ccf9a4');
	highlightWordAcrossNode(' δώμα ', 'ccf9a4');

	highlightWordAcrossNode(' Χώμα ', 'ffccf3');
	highlightWordAcrossNode(' χώμα ', 'ffccf3');

	highlightWordAcrossNode(' Βρώμα ', 'f2a77b');
	highlightWordAcrossNode(' βρώμα ', 'f2a77b');

	highlightWordAcrossNode(' Πώμα ', 'efc777');
	highlightWordAcrossNode(' πώμα ', 'efc777');

	highlightWordAcrossNode(' Πτώμα ', 'f9f895');
	highlightWordAcrossNode(' πτώμα ', 'f9f895');

	highlightWordAcrossNode(' Χυλός ', 'f4ef86');
	highlightWordAcrossNode(' χυλός ', 'f4ef86');

	highlightWordAcrossNode(' Ψηλός ', 'aed0ef');
	highlightWordAcrossNode(' ψηλός ', 'aed0ef');

	highlightWordAcrossNode(' Τρένο ', 'f4f4f4');
	highlightWordAcrossNode(' τρένο ', 'f4f4f4');

	highlightWordAcrossNode(' Φρένο ', 'f4f4f4');
	highlightWordAcrossNode(' φρένο ', 'f4f4f4');

	highlightWordAcrossNode(' Σούστα ', 'c9c9c9');
	highlightWordAcrossNode(' σούστα ', 'c9c9c9');

	highlightWordAcrossNode(' Φούστα ', 'ffce7f');
	highlightWordAcrossNode(' φούστα ', 'ffce7f');

	highlightWordAcrossNode(' Πλύση ', 'bcd2ff');
	highlightWordAcrossNode(' πλύση ', 'bcd2ff');

	highlightWordAcrossNode(' Βρύση ', '8ef0ff');
	highlightWordAcrossNode(' βρύση ', '8ef0ff');

	highlightWordAcrossNode(' Κρίση ', 'f97292');
	highlightWordAcrossNode(' κρίση ', 'f97292');

	highlightWordAcrossNode(' Μέρα ', '77f1f9');
	highlightWordAcrossNode(' μέρα ', '77f1f9');

	highlightWordAcrossNode(' Βέρα ', 'fff684');
	highlightWordAcrossNode(' βέρα ', 'fff684');

	highlightWordAcrossNode(' Ξέρα ', 'f2b676');
	highlightWordAcrossNode(' ξέρα ', 'f2b676');

	highlightWordAcrossNode(' Πέρα ', 'f69cfc');
	highlightWordAcrossNode(' πέρα ', 'f69cfc');

	highlightWordAcrossNode(' Λέρα ', '9ae86d');
	highlightWordAcrossNode(' λέρα ', '9ae86d');

	highlightWordAcrossNode(' Ρητός ', 'edab76');
	highlightWordAcrossNode(' ρητός ', 'edab76');

	highlightWordAcrossNode(' Λιτός ', 'edab76');
	highlightWordAcrossNode(' λιτός ', 'edab76');

	highlightWordAcrossNode(' Ψητός ', 'f7b391');
	highlightWordAcrossNode(' ψητός ', 'f7b391');

	highlightWordAcrossNode(' Αυλή ', 'f9f9a4');
	highlightWordAcrossNode(' αυλή ', 'f9f9a4');

	highlightWordAcrossNode(' Αυγή ', 'e9f271');
	highlightWordAcrossNode(' αυγή ', 'e9f271');

	highlightWordAcrossNode(' Κραυγή ', 'ea729a');
	highlightWordAcrossNode(' κραυγή ', 'ea729a');

	highlightWordAcrossNode(' Στάμπα ', 'f7b391');
	highlightWordAcrossNode(' στάμπα ', 'f7b391');

	highlightWordAcrossNode(' Λάμπα ', 'f9e277');
	highlightWordAcrossNode(' λάμπα ', 'f9e277');
	
	highlightWordAcrossNode(' Σάμπα ', 'fcf18f');
	highlightWordAcrossNode(' σάμπα ', 'fcf18f');

	highlightWordAcrossNode(' Κράμπα ', '95a5ed');
	highlightWordAcrossNode(' κράμπα ', '95a5ed');

	highlightWordAcrossNode(' Ράμπα ', '9bd3ef');
	highlightWordAcrossNode(' ράμπα ', '9bd3ef');

	highlightWordAcrossNode(' Χάδι ', 'f9bfff');
	highlightWordAcrossNode(' χάδι ', 'f9bfff');

	highlightWordAcrossNode(' Λάδι ', 'e9f271');
	highlightWordAcrossNode(' λάδι ', 'e9f271');

	highlightWordAcrossNode(' Βράδυ ', '61d2d8');
	highlightWordAcrossNode(' βράδυ ', '61d2d8');

	highlightWordAcrossNode(' Κάλτσα ', 'f9e277');
	highlightWordAcrossNode(' κάλτσα ', 'f9e277');

	highlightWordAcrossNode(' Σάλτσα ', 'ea3f4a');
	highlightWordAcrossNode(' σάλτσα ', 'ea3f4a');

	highlightWordAcrossNode(' Θυμός ', 'ef706e');
	highlightWordAcrossNode(' θυμός ', 'ef706e');

	highlightWordAcrossNode(' Μπρίζα ', 'd3d3d3');
	highlightWordAcrossNode(' μπρίζα ', 'd3d3d3');

	highlightWordAcrossNode(' Ρώμη ', 'ef706e');
	highlightWordAcrossNode(' ρώμη ', 'ef706e');

	highlightWordAcrossNode(' Γνώμη ', 'adc0ff');
	highlightWordAcrossNode(' γνώμη ', 'adc0ff');

	highlightWordAcrossNode(' Κρίμα ', 'ade5ed');
	highlightWordAcrossNode(' κρίμα ', 'ade5ed');

	highlightWordAcrossNode(' Χρήμα ', 'f4ee7a');
	highlightWordAcrossNode(' χρήμα ', 'f4ee7a');

	highlightWordAcrossNode(' Τρίμμα ', 'f4cbad');
	highlightWordAcrossNode(' τρίμμα ', 'f4cbad');

	highlightWordAcrossNode(' φώτα ', 'f9f94a');
	highlightWordAcrossNode(' Φώτα ', 'f9f94a');

	highlightWordAcrossNode(' Χνώτα ', '85e5f2');
	highlightWordAcrossNode(' χνώτα ', '85e5f2');

	highlightWordAcrossNode(' Κότα ', 'f7bed6');
	highlightWordAcrossNode(' κότα ', 'f7bed6');

	highlightWordAcrossNode(' Ρώτα ', '8defe5');
	highlightWordAcrossNode(' ρώτα ', '8defe5');

	highlightWordAcrossNode(' Νότα ', 'd5f77e');
	highlightWordAcrossNode(' νότα ', 'd5f77e');

	highlightWordAcrossNode(' Βατός ', 'ccedff');
	highlightWordAcrossNode(' βατός ', 'ccedff');

	highlightWordAcrossNode(' Πάτος ', 'e0e0e0');
	highlightWordAcrossNode(' πάτος ', 'e0e0e0');

	highlightWordAcrossNode(' Γάτος ', 'fce8c4');
	highlightWordAcrossNode(' γάτος ', 'fce8c4');

	highlightWordAcrossNode(' Νεύμα ', 'b5fafc');
	highlightWordAcrossNode(' νεύμα ', 'b5fafc');

	highlightWordAcrossNode(' Γεύμα ', 'fcb279');
	highlightWordAcrossNode(' γεύμα ', 'fcb279');

	highlightWordAcrossNode(' Πνεύμα ', 'a2f9f2');
	highlightWordAcrossNode(' πνεύμα ', 'a2f9f2');

	highlightWordAcrossNode(' Ρεύμα ', 'f4ed84');
	highlightWordAcrossNode(' ρεύμα ', 'f4ed84');

	highlightWordAcrossNode(' Στάλα ', 'abdef2');
	highlightWordAcrossNode(' στάλα ', 'abdef2');

	highlightWordAcrossNode(' Σπάλα ', 'd1d80a');
	highlightWordAcrossNode(' σπάλα ', 'd1d80a');

	highlightWordAcrossNode(' Θήρα ', '9b8cff');
	highlightWordAcrossNode(' θήρα ', '9b8cff');

	highlightWordAcrossNode(' Χήρα ', '6b7fc4');
	highlightWordAcrossNode(' χήρα ', '6b7fc4');

	highlightWordAcrossNode(' Μοίρα ', 'b5fafc');
	highlightWordAcrossNode(' μοίρα ', 'b5fafc');

	highlightWordAcrossNode(' Πήρα ', '6df289');
	highlightWordAcrossNode(' πήρα ', '6df289');

	highlightWordAcrossNode(' Ψείρα ', 'f4ed84');
	highlightWordAcrossNode(' ψείρα ', 'f4ed84');

	highlightWordAcrossNode(' Γράμμα ', 'fcb279');
	highlightWordAcrossNode(' γράμμα ', 'fcb279');

	highlightWordAcrossNode(' Δράμα ', 'f97289');
	highlightWordAcrossNode(' δράμα ', 'f97289');

	highlightWordAcrossNode(' Κράμα ', 'fff9aa');
	highlightWordAcrossNode(' κράμα ', 'fff9aa');

	highlightWordAcrossNode(' Πράμα ', 'dbbdfc');
	highlightWordAcrossNode(' πράμα ', 'dbbdfc');

	highlightWordAcrossNode(' Βράκα ', 'f9eb8b');
	highlightWordAcrossNode(' βράκα ', 'f9eb8b');

	highlightWordAcrossNode(' Θράκα ', 'a0ffff');
	highlightWordAcrossNode(' θράκα ', 'a0ffff');


	highlightWordAcrossNode(' Βήμα ', 'b5fafc');
	highlightWordAcrossNode(' βήμα ', 'b5fafc');

	highlightWordAcrossNode(' Σήμα ', '968de8');
	highlightWordAcrossNode(' σήμα ', '968de8');

	highlightWordAcrossNode(' Κύμα ', 'fbb5ff');
	highlightWordAcrossNode(' κύμα ', 'fbb5ff');

	highlightWordAcrossNode(' Ρήμα ', 'f4c2a4');
	highlightWordAcrossNode(' ρήμα ', 'f4c2a4');

	highlightWordAcrossNode(' Θύμα ', 'c394e8');
	highlightWordAcrossNode(' θύμα ', 'c394e8');

	highlightWordAcrossNode(' Χύμα ', 'fcb279');
	highlightWordAcrossNode(' χύμα ', 'fcb279');

	highlightWordAcrossNode(' Κλάσμα ', 'e7fca4');
	highlightWordAcrossNode(' κλάσμα ', 'e7fca4');

	highlightWordAcrossNode(' Πλάσμα ', 'e0c2fc');
	highlightWordAcrossNode(' πλάσμα ', 'e0c2fc');

	highlightWordAcrossNode(' Θλάση ', 'aaa7ef');
	highlightWordAcrossNode(' θλάση ', 'aaa7ef');

	highlightWordAcrossNode(' Κλάση ', 'a2f9f2');
	highlightWordAcrossNode(' κλάση ', 'a2f9f2');

	highlightWordAcrossNode(' Πλάση ', 'c6fcae');
	highlightWordAcrossNode(' πλάση ', 'c6fcae');

	highlightWordAcrossNode(' Χρίσμα ', '7af4de');
	highlightWordAcrossNode(' χρίσμα ', '7af4de');

	highlightWordAcrossNode(' Πρίσμα ', 'c0cff9');
	highlightWordAcrossNode(' πρίσμα ', 'c0cff9');

	highlightWordAcrossNode(' Μπίρα ', 'eafc9c');
	highlightWordAcrossNode(' μπίρα ', 'eafc9c');

	highlightWordAcrossNode(' Πείρα ', 'f4c2a4');
	highlightWordAcrossNode(' πείρα ', 'f4c2a4');

	highlightWordAcrossNode(' Μύλος ', 'fcb279');
	highlightWordAcrossNode(' μύλος ', 'fcb279');

	highlightWordAcrossNode(' Ψύλλος ', 'c6fcae');
	highlightWordAcrossNode(' ψύλλος ', 'c6fcae');

	highlightWordAcrossNode(' Φίλος ', 'fbb5ff');
	highlightWordAcrossNode(' φίλος ', 'fbb5ff');

	highlightWordAcrossNode(' Νείλος ', 'b5fafc');
	highlightWordAcrossNode(' νείλος ', 'b5fafc');

	highlightWordAcrossNode(' Χύτρα ', 'dcc6ff');
	highlightWordAcrossNode(' χύτρα ', 'dcc6ff');

	highlightWordAcrossNode(' Φύτρα ', '6beaca');
	highlightWordAcrossNode(' φύτρα ', '6beaca');

	highlightWordAcrossNode(' Μήτρα ', 'aaa7ef');
	highlightWordAcrossNode(' μήτρα ', 'aaa7ef');

	highlightWordAcrossNode(' Λύτρα ', '82ffa5');
	highlightWordAcrossNode(' λύτρα ', '82ffa5');

	highlightWordAcrossNode(' Ρήτρα ', 'e5a6f4');
	highlightWordAcrossNode(' ρήτρα ', 'e5a6f4');

	highlightWordAcrossNode(' Ρήξη ', '9ffcd0');
	highlightWordAcrossNode(' ρήξη ', '9ffcd0');

	highlightWordAcrossNode(' Σκύλος ', 'f7a788');
	highlightWordAcrossNode(' σκύλος ', 'f7a788');

	highlightWordAcrossNode(' Στύλος ', '6e7fdd');
	highlightWordAcrossNode(' στύλος ', '6e7fdd');

	highlightWordAcrossNode(' Μορφή ', 'f995c7');
	highlightWordAcrossNode(' μορφή ', 'f995c7');

	highlightWordAcrossNode(' Κορφή ', 'f4e2a6');
	highlightWordAcrossNode(' κορφή ', 'f4e2a6');

	highlightWordAcrossNode(' Πουγκί ', 'edc682');
	highlightWordAcrossNode(' πουγκί ', 'edc682');

	highlightWordAcrossNode(' Μουγκή ', 'a2f9e1');
	highlightWordAcrossNode(' μουγκή ', 'a2f9e1');

	highlightWordAcrossNode(' Τοίχος ', 'e5ffb2');
	highlightWordAcrossNode(' τοίχος ', 'e5ffb2');

	highlightWordAcrossNode(' Ψύχος ', 'f9959a');
	highlightWordAcrossNode(' ψύχος ', 'f9959a');

	highlightWordAcrossNode(' Δίχως ', 'e7f48d');
	highlightWordAcrossNode(' δίχως ', 'e7f48d');

	highlightWordAcrossNode(' Χολή ', 'b39eed');
	highlightWordAcrossNode(' χολή ', 'b39eed');

	highlightWordAcrossNode(' Θολή ', 'ddc6ff');
	highlightWordAcrossNode(' θολή ', 'ddc6ff');

	highlightWordAcrossNode(' Βολή ', 'f4e18b');
	highlightWordAcrossNode(' βολή ', 'f4e18b');

	highlightWordAcrossNode(' Πολύ ', 'a2f9e1');
	highlightWordAcrossNode(' πολύ ', 'a2f9e1');

	highlightWordAcrossNode(' Ήθος ', 'f77181');
	highlightWordAcrossNode(' ήθος ', 'f77181');

	highlightWordAcrossNode(' Λίθος ', 'f29a8e');
	highlightWordAcrossNode(' λίθος ', 'f29a8e');

	highlightWordAcrossNode(' Στήθος ', 'ddc6ff');
	highlightWordAcrossNode(' στήθος ', 'ddc6ff');

	highlightWordAcrossNode(' Παλάτι ', '839def');
	highlightWordAcrossNode(' παλάτι ', '839def');

	highlightWordAcrossNode(' Αλάτι ', 'f9f9f9');
	highlightWordAcrossNode(' αλάτι ', 'f9f9f9');

	highlightWordAcrossNode(' Ζάχαρη ', 'f9f9f9');
	highlightWordAcrossNode(' ζάχαρη ', 'f9f9f9');

	highlightWordAcrossNode(' Άχαρη ', '9bd1e8');
	highlightWordAcrossNode(' άχαρη ', '9bd1e8');

	highlightWordAcrossNode(' Φουλάρι ', 'f4e18b');
	highlightWordAcrossNode(' φουλάρι ', 'f4e18b');

	highlightWordAcrossNode(' Μουλάρι ', 'e5ffb2');
	highlightWordAcrossNode(' μουλάρι ', 'e5ffb2');

	highlightWordAcrossNode(' Πουλάρι ', 'ddc6ff');
	highlightWordAcrossNode(' πουλάρι ', 'ddc6ff');

	highlightWordAcrossNode(' Φέρετρο ', '67a8e5');
	highlightWordAcrossNode(' φέρετρο ', '67a8e5');

	highlightWordAcrossNode(' Θέρετρο ', 'b4ffa3');
	highlightWordAcrossNode(' θέρετρο ', 'b4ffa3');

	highlightWordAcrossNode(' Λουκέτα ', 'b8d9fc');
	highlightWordAcrossNode(' λουκέτα ', 'b8d9fc');

	highlightWordAcrossNode(' Ρουκέτα ', 'ea7989');
	highlightWordAcrossNode(' ρουκέτα ', 'ea7989');

	highlightWordAcrossNode(' Ρακέτα ', '8cf2b3');
	highlightWordAcrossNode(' ρακέτα ', '8cf2b3');

	highlightWordAcrossNode(' Πακέτα ', 'ffbe75');
	highlightWordAcrossNode(' πακέτα ', 'ffbe75');

	highlightWordAcrossNode(' Μακέτα ', '9af4d0');
	highlightWordAcrossNode(' μακέτα ', '9af4d0');

	highlightWordAcrossNode(' Ζακέτα ', '67c2e0');
	highlightWordAcrossNode(' ζακέτα ', '67c2e0');

	highlightWordAcrossNode(' καρούλι ', 'ffafb3');
	highlightWordAcrossNode(' Καρούλι ', 'ffafb3');

	highlightWordAcrossNode(' Μαρούλι ', '96ffa9');
	highlightWordAcrossNode(' μαρούλι ', '96ffa9');

	highlightWordAcrossNode(' Λιβάδι ', '8cf2b3');
	highlightWordAcrossNode(' λιβάδι ', '8cf2b3');

	highlightWordAcrossNode(' Λιβάνι ', 'a9eff2');
	highlightWordAcrossNode(' λιβάνι ', 'a9eff2');

	highlightWordAcrossNode(' Στήνω ', 'fcccc7');
	highlightWordAcrossNode(' στήνω ', 'fcccc7');

	highlightWordAcrossNode(' Δίνω ', 'b9def7');
	highlightWordAcrossNode(' δίνω ', 'b9def7');

	highlightWordAcrossNode(' Λύνω ', 'ea7989');
	highlightWordAcrossNode(' λύνω ', 'ea7989');

	highlightWordAcrossNode(' Πίνω ', 'b9def7');
	highlightWordAcrossNode(' πίνω ', 'b9def7');

	highlightWordAcrossNode(' Χύνω ', '7fefe2');
	highlightWordAcrossNode(' χύνω ', '7fefe2');

	highlightWordAcrossNode(' Φτύνω ', 'fcaea9');
	highlightWordAcrossNode(' φτύνω ', 'fcaea9');

	highlightWordAcrossNode(' Βρέχω ', 'a9eff2');
	highlightWordAcrossNode(' βρέχω ', 'a9eff2');

	highlightWordAcrossNode(' Τρέχω ', 'ffaac1');
	highlightWordAcrossNode(' τρέχω ', 'ffaac1');

	highlightWordAcrossNode(' Ράβω ', 'ffcf7c');
	highlightWordAcrossNode(' ράβω ', 'ffcf7c');

	highlightWordAcrossNode(' Θάβω ', 'fcf4ba');
	highlightWordAcrossNode(' θάβω ', 'fcf4ba');

	highlightWordAcrossNode(' Θωρώ ', 'bfd6fc');
	highlightWordAcrossNode(' θωρώ ', 'bfd6fc');

	highlightWordAcrossNode(' Φορώ ', '8bf99e');
	highlightWordAcrossNode(' φορώ ', '8bf99e');

	highlightWordAcrossNode(' Παίρνω ', 'f2ef98');
	highlightWordAcrossNode(' παίρνω ', 'f2ef98');

	highlightWordAcrossNode(' Γέρνω ', 'fff1cc');
	highlightWordAcrossNode(' γέρνω ', 'fff1cc');

	highlightWordAcrossNode(' Σέρνω ', 'f9cbc0');
	highlightWordAcrossNode(' σέρνω ', 'f9cbc0');

	highlightWordAcrossNode(' Φέρνω ', '97fcb5');
	highlightWordAcrossNode(' φέρνω ', '97fcb5');

	highlightWordAcrossNode(' Φέρομαι ', '95f4e4');
	highlightWordAcrossNode(' φέρομαι ', '95f4e4');

	highlightWordAcrossNode(' Χαίρομαι ', 'b2ffe2');
	highlightWordAcrossNode(' χαίρομαι ', 'b2ffe2');

	highlightWordAcrossNode(' Δέχομαι ', 'edffb2');
	highlightWordAcrossNode(' δέχομαι ', 'edffb2');

	highlightWordAcrossNode(' Θυμάμαι ', 'a8ffd7');
	highlightWordAcrossNode(' θυμάμαι ', 'a8ffd7');

	highlightWordAcrossNode(' Κοιμάμαι ', 'ffc9d9');
	highlightWordAcrossNode(' κοιμάμαι ', 'ffc9d9');

	highlightWordAcrossNode(' Όλη ', '9fd5f9');
	highlightWordAcrossNode(' όλη ', '9fd5f9');

	highlightWordAcrossNode(' Πόλη ', 'f4a87f');
	highlightWordAcrossNode(' πόλη ', 'f4a87f');

	highlightWordAcrossNode(' Μπαλώνω ', 'f7f972');
	highlightWordAcrossNode(' μπαλώνω ', 'f7f972');

	highlightWordAcrossNode(' Φιλώ ', 'f4b2d7');
	highlightWordAcrossNode(' φιλώ ', 'f4b2d7');

	highlightWordAcrossNode(' Μιλώ ', '79c9f2');
	highlightWordAcrossNode(' μιλώ ', '79c9f2');

	highlightWordAcrossNode(' Κουζίνα ', 'f3ffa5');
	highlightWordAcrossNode(' κουζίνα ', 'f3ffa5');

	highlightWordAcrossNode(' Ντουζίνα ', '9fd5f9');
	highlightWordAcrossNode(' ντουζίνα ', '9fd5f9');

	highlightWordAcrossNode(' Νονός ', '79c9f2');
	highlightWordAcrossNode(' νονός ', '79c9f2');

	highlightWordAcrossNode(' Γαύρος ', 'fca4a1');
	highlightWordAcrossNode(' γαύρος ', 'fca4a1');

	highlightWordAcrossNode(' Μαύρος ', 'f2f2f2');
	highlightWordAcrossNode(' μαύρος ', 'f2f2f2');

	highlightWordAcrossNode(' Βρέχω ', 'abe4ea');
	highlightWordAcrossNode(' βρέχω ', 'abe4ea');

	highlightWordAcrossNode(' Τρέχω ', 'e8ffb2');
	highlightWordAcrossNode(' τρέχω ', 'e8ffb2');

	highlightWordAcrossNode(' Ρέμα ', 'f7e079');
	highlightWordAcrossNode(' ρέμα ', 'f7e079');

	highlightWordAcrossNode(' Ρεύμα ', 'f7f981');
	highlightWordAcrossNode(' ρεύμα ', 'f7f981');

	highlightWordAcrossNode(' Βαγόνι ', 'efd775');
	highlightWordAcrossNode(' βαγόνι ', 'efd775');

	highlightWordAcrossNode(' Παγόνι ', '83fcd0');
	highlightWordAcrossNode(' παγόνι ', '83fcd0');

	highlightWordAcrossNode(' Θυμάρι ', 'cdffa8');
	highlightWordAcrossNode(' θυμάρι ', 'cdffa8');

	highlightWordAcrossNode(' Ζυμάρι ', 'ffe4aa');
	highlightWordAcrossNode(' ζυμάρι ', 'ffe4aa');

	highlightWordAcrossNode(' Νηστεία ', 'fcbeba');
	highlightWordAcrossNode(' νηστεία ', 'fcbeba');

	highlightWordAcrossNode(' Μαντίλι ', 'ffc4fd');
	highlightWordAcrossNode(' μαντίλι ', 'ffc4fd');

	highlightWordAcrossNode(' Καντήλι ', 'fafcb3');
	highlightWordAcrossNode(' καντήλι ', 'fafcb3');

	highlightWordAcrossNode(' Καρύδι ', 'f7e079');
	highlightWordAcrossNode(' καρύδι ', 'f7e079');

	highlightWordAcrossNode(' Βαρίδι ', 'f9f9f9');
	highlightWordAcrossNode(' βαρίδι ', 'f9f9f9');

	highlightWordAcrossNode(' Γίδα ', 'fffdbc');
	highlightWordAcrossNode(' γίδα ', 'fffdbc');

	highlightWordAcrossNode(' Βίδα ', 'f7f7f7');
	highlightWordAcrossNode(' βίδα ', 'f7f7f7');

	highlightWordAcrossNode(' Τέρμα ', 'b2ffe2');
	highlightWordAcrossNode(' τέρμα ', 'b2ffe2');

	highlightWordAcrossNode(' Στρέμμα ', '6df2b4');
	highlightWordAcrossNode(' στρέμμα ', '6df2b4');

	highlightWordAcrossNode(' Βουλευτής ', '88adf7');
	highlightWordAcrossNode(' βουλευτής ', '88adf7');

	highlightWordAcrossNode(' Δουλευτής ', 'fafcb3');
	highlightWordAcrossNode(' δουλευτής ', 'fafcb3');

	highlightWordAcrossNode(' Παίρνω ', 'f9aeb7');
	highlightWordAcrossNode(' παίρνω ', 'f9aeb7');

	highlightWordAcrossNode(' Περνώ ', 'edffb2');
	highlightWordAcrossNode(' περνώ ', 'edffb2');

	highlightWordAcrossNode(' Γλάστρα ', 'cdffa8');
	highlightWordAcrossNode(' γλάστρα ', 'cdffa8');

	highlightWordAcrossNode(' Κάστρα ', 'fafcb3');
	highlightWordAcrossNode(' κάστρα ', 'fafcb3');

	highlightWordAcrossNode(' Γεράκι ', 'ffe4aa');
	highlightWordAcrossNode(' γεράκι ', 'ffe4aa');

	highlightWordAcrossNode(' Μεράκι ', 'f7e079');
	highlightWordAcrossNode(' μεράκι ', 'f7e079');

	highlightWordAcrossNode(' Βάρος ', '687cd8');
	highlightWordAcrossNode(' βάρος ', '687cd8');

	highlightWordAcrossNode(' Φάρος ', 'f7f588');
	highlightWordAcrossNode(' φάρος ', 'f7f588');

	highlightWordAcrossNode(' Τέρας ', 'a1daea');
	highlightWordAcrossNode(' τέρας ', 'a1daea');

	highlightWordAcrossNode(' Κρέας ', 'f4c57f');
	highlightWordAcrossNode(' κρέας ', 'f4c57f');

	highlightWordAcrossNode(' Ίσως ', 'b9fcab');
	highlightWordAcrossNode(' ίσως ', 'b9fcab');

	highlightWordAcrossNode(' Μίσος ', 'a4fcea');
	highlightWordAcrossNode(' μίσος ', 'a4fcea');

	highlightWordAcrossNode(' Κάμπος ', 'baf473');
	highlightWordAcrossNode(' κάμπος ', 'baf473');

	highlightWordAcrossNode(' κόμπος ', 'efa47f');
	highlightWordAcrossNode(' κόμπος ', 'efa47f');

	highlightWordAcrossNode(' Τρένα ', 'f4c57f');
	highlightWordAcrossNode(' τρένα ', 'f4c57f');

	highlightWordAcrossNode(' Φρένα ', 'a4fcea');
	highlightWordAcrossNode(' φρένα ', 'a4fcea');

	highlightWordAcrossNode(' Βρέθηκα ', 'ffa0b0');
	highlightWordAcrossNode(' βρέθηκα ', 'ffa0b0');

	highlightWordAcrossNode(' Μαθαίνω ', 'f7aae5');
	highlightWordAcrossNode(' μαθαίνω ', 'f7aae5');

	highlightWordAcrossNode(' Παθαίνω ', 'f9beb8');
	highlightWordAcrossNode(' παθαίνω ', 'f9beb8');

	highlightWordAcrossNode(' Λουρί ', 'efa47f');
	highlightWordAcrossNode(' λουρί ', 'efa47f');

	highlightWordAcrossNode(' Φλουρί ', 'f7f588');
	highlightWordAcrossNode(' φλουρί ', 'f7f588');

	highlightWordAcrossNode(' Μέρος ', 'acf6f9');
	highlightWordAcrossNode(' μέρος ', 'acf6f9');

	highlightWordAcrossNode(' Γέρος ', 'f9beb8');
	highlightWordAcrossNode(' γέρος ', 'f9beb8');

	highlightWordAcrossNode(' Κύπρος ', 'a4fcea');
	highlightWordAcrossNode(' κύπρος ', 'a4fcea');

	highlightWordAcrossNode(' Κύρος ', 'a4fcea');
	highlightWordAcrossNode(' κύρος ', 'a4fcea');

	highlightWordAcrossNode(' Επιμονή ', 'ffa0b0');
	highlightWordAcrossNode(' επιμονή ', 'ffa0b0');

	highlightWordAcrossNode(' Υπομονή ', 'c1c6ff');
	highlightWordAcrossNode(' υπομονή ', 'c1c6ff');

	highlightWordAcrossNode(' Κλάμα ', 'b9fcab');
	highlightWordAcrossNode(' κλάμα ', 'b9fcab');

	highlightWordAcrossNode(' Κλίμα ', 'acf6f9');
	highlightWordAcrossNode(' κλίμα ', 'acf6f9');

	highlightWordAcrossNode(' Κέντρα ', 'f4aca6');
	highlightWordAcrossNode(' κέντρα ', 'f4aca6');

	highlightWordAcrossNode(' Δεντρά ', 'c7ff84');
	highlightWordAcrossNode(' δεντρά ', 'c7ff84');

	highlightWordAcrossNode(' Ζυγίζω ', '7be1ed');
	highlightWordAcrossNode(' ζυγίζω ', '7be1ed');

	highlightWordAcrossNode(' Λυγίζω ', '969df2');
	highlightWordAcrossNode(' λυγίζω ', '969df2');


	


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
