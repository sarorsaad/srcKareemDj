// Get the Sidebar
const mySidebar = document.getElementById("mySidebar");
// Get the DIV with overlay effect
const overlayBg = document.getElementById("myOverlay");

// Toggle between showing and hiding the sidebar, and add overlay effect
function w3_open() {
  mySidebar.style.display = mySidebar.style.display === 'block' ? 'none' : 'block';
  overlayBg.style.display = mySidebar.style.display === 'block' ? 'block' : 'none';
}

// Close the sidebar with the close button
function w3_close() {
  mySidebar.style.display = "none";
  overlayBg.style.display = "none";
}

function returnCommentSymbol(language = "javascript") {
  const languageObject = {
    // comment symbols for various languages
  };

  if (!languageObject[language]) {
    return languageObject["python"].split("DELIMITER");
  }

  return languageObject[language].split("DELIMITER");
}

let savedChPos = 0;
let returnedSuggestion = '';
let editor, doc, cursor, line, pos;
pos = { line: 0, ch: 0 };
let suggestionsStatus = false;
let docLang = "python";
let suggestionDisplayed = false;
let isReturningSuggestion = false;

document.addEventListener("keydown", (event) => {
  setTimeout(() => {
    editor = event.target.closest('.CodeMirror');

    if (editor) {
      const codeEditor = editor.CodeMirror;

      if (!editor.classList.contains("added-tab-function")) {
        editor.classList.add("added-tab-function");
        codeEditor.removeKeyMap("Tab");
        codeEditor.setOption("extraKeys", {
          Tab: (cm) => {
            if (returnedSuggestion) {
              acceptTab(returnedSuggestion);
            } else {
              cm.execCommand("defaultTab");
            }
          }
        });
      }

      doc = editor.CodeMirror.getDoc();
      cursor = doc.getCursor();
      line = doc.getLine(cursor.line);
      pos = { line: cursor.line, ch: line.length };

      if (cursor.ch > 0) {
        savedChPos = cursor.ch;
      }

      const fileLang = doc.getMode().name;
      docLang = fileLang;
      const commentSymbol = returnCommentSymbol(fileLang);

      if (event.key == "?") {
        let lastLine = line;
        lastLine = lastLine.slice(0, savedChPos - 1);

        if (lastLine.trim().startsWith(commentSymbol[0])) {
          if (fileLang !== "null") {
            lastLine += " " + fileLang;
          }

          lastLine = lastLine.split(commentSymbol[0])[1];
          window.postMessage({ source: 'getQuery', payload: { data: lastLine } });
          isReturningSuggestion = true;
          displayGrey("\nBlackbox loading...");
        }
      } else if (event.key === "Enter" && suggestionsStatus && !isReturningSuggestion) {
        const query = doc.getRange({ line: Math.max(0, cursor.line - 50), ch: 0 }, { line: cursor.line, ch: line.length });
        window.postMessage({ source: 'getSuggestion', payload: { data: query, language: docLang, cursorPos: pos } });
        displayGrey("Blackbox loading...");
      } else if (event.key === "ArrowRight" && returnedSuggestion) {
        acceptTab(returnedSuggestion);
      } else if (event.key === "Enter" && isReturningSuggestion) {
        displayGrey("\nBlackbox loading...");
      } else if (event.key === "Escape") {
        displayGrey("");
      }
    }
  }, 0);
});

function acceptTab(text) {
  if (suggestionDisplayed) {
    displayGrey("");
    doc.replaceRange(text, pos);
    returnedSuggestion = "";
    updateSuggestionStatus(false);
  }
}

function acceptSuggestion(text) {
  displayGrey("");
  doc.replaceRange(text, pos);
  returnedSuggestion = "";
  updateSuggestionStatus(false);
}

function displayGrey(text) {
  const el = document.querySelector(".blackbox-suggestion");

  if (!text) {
    el?.remove();
    return;
  }

  if (!el) {
    const newEl = document.createElement('span');
    newEl.classList.add("blackbox-suggestion");
    newEl.style = 'color:grey';
    newEl.innerText = text;
    const lineIndex = pos.line;
    editor.getElementsByClassName('CodeMirror-line')[lineIndex].appendChild(newEl);
  } else {
    el.innerText = text;
  }
}

function updateSuggestionStatus(s) {
  suggestionDisplayed = s;
  window.postMessage({ source: 'updateSuggestionStatus', status: suggestionDisplayed, suggestion: returnedSuggestion });
}

window.addEventListener('message', (event) => {
  if (event.source !== window) return;

  if (event.data.source == 'return') {
    isReturningSuggestion = false;
    const formattedCode = formatCode(event.data.payload.data);
    returnedSuggestion = formattedCode;
    displayGrey(formattedCode);
    updateSuggestionStatus(true);
  }

  if (event.data.source == 'suggestReturn') {
    const prePos = event.data.payload.cursorPos;

    if (pos.line == prePos.line && pos.ch == prePos.ch) {
      returnedSuggestion = event.data.payload.data;
      displayGrey(event.data.payload.data);
      updateSuggestionStatus(true);
    } else {
      displayGrey();
    }
  }

  if (event.data.source == 'codeSearchReturn') {
    isReturningSuggestion = false;
    displayGrey();
  }

  if (event.data.source == 'suggestionsStatus') {
    suggestionsStatus = event.data.payload.enabled;
  }

  if (event.data.source == 'acceptSuggestion') {
    acceptSuggestion(event.data.suggestion);
  }
});

document.addEventListener("keyup", function () {
  returnedSuggestion = "";
  updateSuggestionStatus(false);
});

function formatCode(data) {
  if (Array.isArray(data)) {
    let finalCode = "";
    const pairs = [];
    const commentSymbol = returnCommentSymbol(docLang);

    data.forEach((codeArr) => {
      const code = codeArr[0];
      let desc = codeArr[1];
      const descArr = desc.split("\n");
      let finalDesc = "";

      descArr.forEach((descLine, idx) => {
        const whiteSpace = descLine.search(/\S/);

        if (commentSymbol.length < 2 || idx === 0) {
          finalDesc += insert(descLine, whiteSpace, commentSymbol[0]);
        }

        if (commentSymbol.length > 1 && idx === descArr.length - 1) {
          finalDesc = finalDesc + commentSymbol[1] + "\n";
        }
      });

      finalCode += finalDesc + "\n\n" + code;
      pairs.push(finalCode);
    });

    return "\n" + pairs.join("\n");
  }

  return "\n" + data;
}

function insert(str, index, value) {
  return str.substr(0, index) + value + str.substr(index);
}
