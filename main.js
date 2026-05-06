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
  consent: 0,
};

var DEFAULT_CONVERSION_HIT = {
  id: 100060883,
  value: 199,
  orderId: "123456",
  consent: 0,
};

var DEFAULT_LEGACY_TEXT = "{\n  \"seznam_retargeting_id\": 12345,\n  \"seznam_category\": \"test_category\",\n  \"seznam_itemId\": 54321,\n  \"seznam_pagetype\": \"category\",\n  \"rc\": { \"consent\": 0 },\n  \"scmp_sspServerData\": true\n}";

var DEFAULT_RETARGETING_TEXT = "{\n  \"rtgId\": 12345,\n  \"itemId\": \"54321\",\n  \"category\": \"test_category\",\n  \"pageType\": \"category\",\n  \"consent\": 0\n}";

var DEFAULT_CONVERSION_TEXT = "{\n  \"id\": 100060883,\n  \"value\": 199,\n  \"orderId\": \"123456\",\n  \"consent\": 0\n}";

var elements = {
  legacyTextArea: document.getElementById("window-json"),
  retargetingTextArea: document.getElementById("retargeting-json"),
  conversionTextArea: document.getElementById("conversion-json"),
  message: document.getElementById("message"),
  buttons: {
    appendToWindow: document.getElementById("window-append"),
    retargetingDev: document.getElementById("retargeting-dev"),
    rcDev: document.getElementById("rc-dev"),
    rcLocal: document.getElementById("rc-local"),
    rcProd: document.getElementById("rc-prod"),
    retargetingHit: document.getElementById("retargeting-hit"),
    conversionHit: document.getElementById("conversion-hit"),
  },
};

function setMessage(str) {
  elements.message.textContent = str;
  elements.message.style.display = "";
  if (str !== "") {
    setTimeout(function() {setMessage("")}, MESSAGE_LIFESPAN);
  } else {
    elements.message.style.display = "none";
  }
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
    for (property in obj) {
      window[property] = obj[property];
    }
    setMessage("Properties set on window");
  } else {
    setMessage("Invalid JSON input!");
  }
}

function appendScript(url) {
  var tag = document.createElement("script");
  tag.src = url;
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

function setListeners() {
  elements.buttons.appendToWindow.addEventListener("click", appendToWindow);
  elements.buttons.retargetingDev.addEventListener("click", appendRetargetingDev);
  elements.buttons.rcDev.addEventListener("click", appendRcDev);
  elements.buttons.rcLocal.addEventListener("click", appendRcLocal);
  elements.buttons.rcProd.addEventListener("click", appendRcProd);
  elements.buttons.retargetingHit.addEventListener("click", callRcRetargetingHit);
  elements.buttons.conversionHit.addEventListener("click", callRcConversionHit);
}

function init() {
  setListeners();
  elements.legacyTextArea.value = DEFAULT_LEGACY_TEXT;
  elements.retargetingTextArea.value = DEFAULT_RETARGETING_TEXT;
  elements.conversionTextArea.value = DEFAULT_CONVERSION_TEXT;
  elements.message.style.display = "none";
}

init();
