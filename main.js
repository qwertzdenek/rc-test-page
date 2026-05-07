var MESSAGE_LIFESPAN = 3000;

var RETARGETING_DEV = "https://proxy.iva.seznam.cz/sklik-ap-static/js/retargeting.js";
var RC_DEV = "https://proxy.iva.seznam.cz/sklik-ap-static/js/rc.js";
var RC_LOCAL = "http://localhost:4000/js/rc.js";
var RC_PROD = "https://c.seznam.cz/js/rc.js";

var DEFAULT_RETARGETING_HIT = {
  rtgId: 12345,
  itemId: "54321",
  category: "test_category",
  pageType: "category",
  consent: 0
};

var DEFAULT_CONVERSION_HIT = {
  id: 100060883,
  value: 199,
  orderId: "123456",
  consent: 0
};

var DEFAULT_LEGACY_TEXT = "{\n  \"seznam_retargeting_id\": 12345,\n  \"seznam_category\": \"test_category\",\n  \"seznam_itemId\": 54321,\n  \"seznam_pagetype\": \"category\",\n  \"rc\": { \"consent\": 0 },\n  \"scmp_sspServerData\": true\n}";

var DEFAULT_RETARGETING_TEXT = "{\n  \"rtgId\": 12345,\n  \"itemId\": \"54321\",\n  \"category\": \"test_category\",\n  \"pageType\": \"category\",\n  \"consent\": 0\n}";

var DEFAULT_CONVERSION_TEXT = "{\n  \"id\": 100060883,\n  \"value\": 199,\n  \"orderId\": \"123456\",\n  \"consent\": 0\n}";

var DEFAULT_IDENTITY_SETTINGS_TEXT = "{\n  \"tid\": \"+420123456789\",\n  \"aid\": {\n    \"country\": \"Ceska republika\",\n    \"ct\": \"Praha\",\n    \"sr\": \"Radlicka 10\",\n    \"zp\": \"15000\"\n  }\n}";

var elements = {
  legacyTextArea: document.getElementById("window-json"),
  error: document.getElementById("error-banner"),
  retargetingTextArea: document.getElementById("retargeting-json"),
  conversionTextArea: document.getElementById("conversion-json"),
  identitySettingsTextArea: document.getElementById("identity-settings-json"),
  message: document.getElementById("message"),
  buttons: {
    appendToWindow: document.getElementById("window-append"),
    retargetingDev: document.getElementById("retargeting-dev"),
    rcDev: document.getElementById("rc-dev"),
    rcLocal: document.getElementById("rc-local"),
    rcProd: document.getElementById("rc-prod"),
    retargetingHit: document.getElementById("retargeting-hit"),
    conversionHit: document.getElementById("conversion-hit"),
    identityUpdate: document.getElementById("identity-update")
  }
};

function addEventListenerCompat(target, eventName, handler) {
  if (!target) {
    return;
  }

  if (target.addEventListener) {
    target.addEventListener(eventName, handler, false);
  } else if (target.attachEvent) {
    target.attachEvent("on" + eventName, handler);
  } else {
    target["on" + eventName] = handler;
  }
}

function setMessage(str) {
  setNodeText(elements.message, str);
  elements.message.style.display = "";
  if (str !== "") {
    setTimeout(function() {setMessage("")}, MESSAGE_LIFESPAN);
  } else {
    elements.message.style.display = "none";
  }
}

function setNodeText(element, text) {
  if (typeof element.textContent === "string") {
    element.textContent = text;
  } else {
    element.innerText = text;
  }
}

function getNodeText(element) {
  if (typeof element.textContent === "string") {
    return element.textContent;
  }
  return element.innerText;
}

function appendError(str) {
  if (!str) {
    return;
  }

  var timestamp = new Date().toLocaleTimeString();
  var nextLine = "[" + timestamp + "] " + str;

  var currentText = getNodeText(elements.error);
  if (currentText) {
    setNodeText(elements.error, currentText + "\n" + nextLine);
  } else {
    setNodeText(elements.error, nextLine);
  }

  elements.error.style.display = "";
}

function buildErrorLog(message, stack) {
  if (stack) {
    return message + "\n" + stack;
  }
  return message;
}

function isValidJson(str) {
  try {
      JSON.parse(str);
  } catch (e) {
      return false;
  }
  return true;
}

function appendToWindow() {
  var str = elements.legacyTextArea.value;
  if (isValidJson(str)) {
    var obj = JSON.parse(str);
    for (var property in obj) {
      if (obj.hasOwnProperty(property)) {
        window[property] = obj[property];
      }
    }
    setMessage("Properties set on window");
  } else {
    setMessage("Invalid JSON input!");
  }
}

function appendScript(url) {
  var tag = document.createElement("script");
  tag.src = url;
  tag.crossOrigin = "anonymous";

  addEventListenerCompat(tag, "error", function() {
    appendError("Failed to load script: " + url);
  });
  tag.onerror = function() {
    appendError("Failed to load script: " + url);
  };

  document.body.appendChild(tag);
}

function appendRetargetingDev() {
  appendScript(RETARGETING_DEV);
}

function appendRcDev() {
  appendScript(RC_DEV);
}

function appendRcLocal() {
  appendScript(RC_LOCAL);
}

function appendRcProd() {
  appendScript(RC_PROD);
}

function getJsonFromTextArea(textAreaElement) {
  var str = textAreaElement.value;
  if (!isValidJson(str)) {
    return null;
  }
  return JSON.parse(str);
}

function callRcRetargetingHit() {
  if (!window.rc || typeof window.rc.retargetingHit !== "function") {
    setMessage("window.rc.retargetingHit is not available");
    return;
  }

  var payload = getJsonFromTextArea(elements.retargetingTextArea);
  if (!payload) {
    setMessage("Invalid JSON in retargeting call parameters");
    return;
  }
  window.rc.retargetingHit(payload);
  setMessage("Called rc.retargetingHit");
}

function callRcConversionHit() {
  if (!window.rc || typeof window.rc.conversionHit !== "function") {
    setMessage("window.rc.conversionHit is not available");
    return;
  }

  var payload = getJsonFromTextArea(elements.conversionTextArea);
  if (!payload) {
    setMessage("Invalid JSON in conversion call parameters");
    return;
  }
  window.rc.conversionHit(payload);
  setMessage("Called rc.conversionHit");
}

function getIsApi() {
  if (window.sznIVA && window.sznIVA.IS && typeof window.sznIVA.IS.updateIdentities === "function") {
    return window.sznIVA.IS;
  }

  if (window.IS && typeof window.IS.updateIdentities === "function") {
    return window.IS;
  }

  return null;
}

function callIsUpdateIdentities() {
  var isApi = getIsApi();
  if (!isApi) {
    setMessage("IS.updateIdentities is not available");
    return;
  }

  var payload = getJsonFromTextArea(elements.identitySettingsTextArea);
  if (!payload) {
    setMessage("Invalid JSON in identity settings");
    return;
  }

  try {
    isApi.updateIdentities(payload);
    setMessage("Called IS.updateIdentities");
  } catch (error) {
    setMessage("IS.updateIdentities failed: " + (error && error.message ? error.message : String(error)));
  }
}

function setListeners() {
  addEventListenerCompat(elements.buttons.appendToWindow, "click", appendToWindow);
  addEventListenerCompat(elements.buttons.retargetingDev, "click", appendRetargetingDev);
  addEventListenerCompat(elements.buttons.rcDev, "click", appendRcDev);
  addEventListenerCompat(elements.buttons.rcLocal, "click", appendRcLocal);
  addEventListenerCompat(elements.buttons.rcProd, "click", appendRcProd);
  addEventListenerCompat(elements.buttons.retargetingHit, "click", callRcRetargetingHit);
  addEventListenerCompat(elements.buttons.conversionHit, "click", callRcConversionHit);
  addEventListenerCompat(elements.buttons.identityUpdate, "click", callIsUpdateIdentities);
}

function setGlobalErrorListeners() {
  window.onerror = function(message, source, lineno, colno, error) {
    var stack = error && error.stack ? error.stack : "";

    if ((message === "Script error." || message === "Script error") && !source && !lineno && !colno) {
      appendError(
        "Error details are hidden by browser cross-origin policy (Script error). " +
        "To see full details, the script response must send CORS headers (for example Access-Control-Allow-Origin) " +
        "and be loaded with crossorigin=anonymous."
      );
      return false;
    }

    appendError(buildErrorLog("Error in " + (source || "unknown") + " (" + (lineno || 0) + ":" + (colno || 0) + "): " + message, stack));
    return false;
  };
}

function init() {
  setListeners();
  elements.legacyTextArea.value = DEFAULT_LEGACY_TEXT;
  elements.retargetingTextArea.value = DEFAULT_RETARGETING_TEXT;
  elements.conversionTextArea.value = DEFAULT_CONVERSION_TEXT;
  elements.identitySettingsTextArea.value = DEFAULT_IDENTITY_SETTINGS_TEXT;
  elements.message.style.display = "none";
  elements.error.style.display = "none";
  setGlobalErrorListeners();
}

init();
