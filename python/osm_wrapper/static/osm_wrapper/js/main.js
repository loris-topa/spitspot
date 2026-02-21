function noop () {}

async function ajax(url, method, body, succ, err) {
    const xhr = new XMLHttpRequest();
    xhr.open(method, url, true);
    xhr.setRequestHeader('X-CSRFToken', getCookie('csrftoken'));

    xhr.onload = function() {
        if (xhr.status >= 200 && xhr.status < 300) {
            succ(JSON.parse(xhr.response));
        } else {
            err();
        }
    };
    xhr.onerror = err;
    return xhr.send(JSON.stringify(body));
};

async function ajax_get(url, succ, err) {
    return ajax(url, 'GET', null, succ, err);
}

async function domReady() {
    return new Promise((resolve, reject) => {
        if (document.readyState === 'interactive' || document.readyState === 'complete') {
            resolve();
        } else {
            document.addEventListener('DOMContentLoaded', resolve);
        }
  });
}

function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

/**
 * Notice the IIFE pattern - that's a self contained "module"
 * Avoids polluting global scope whilst acting as a higher-order function:
 * Returns the anonymous function after declaring the local state
 */
let challenge = (function () {
    let run = false;
    return function () {
        if (run === true) {
            return;
        }
        run = true;
        document.getElementById("challenge-button").innerText = "Verifica in corso";
        document.getElementById("challenge-button").disabled = "disabled";
        return ajax_get('/challenge', solve_challenge_and_feedback, console.err);
    }
})();

function solve_challenge_and_feedback(data) {
    document.getElementById('challenge-id').value = data.challenge_id;
    let found_key = solve(data);
    let res = "";
    let integerValue = 0;
    for (let i = 0; i < found_key.length; i++) {
        integerValue = (integerValue << 1) | found_key[i];
        // Pad any leading zero we found.
        if (i % 4 === 3) {
            res = res + integerValue.toString(16);
            integerValue = 0;
        }
    }
    document.getElementById("challenge-button").innerText = "Captcha superato";
    document.getElementById('challenge-result').value = res;
    document.getElementById("form-submit-button").disabled = "";
};