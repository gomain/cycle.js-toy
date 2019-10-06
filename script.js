
//Logic
function main () {
  return {
    DOM: xs.periodic(1000)
      .fold(acc => acc+1,0)
      .map(i => `Seconds elapsed: ${i}`),
    log: xs.periodic(2000)
      .fold(acc => acc+1,0)
  };
}

//Effect
function domDriver(text$) {
  text$.subscribe({
    next: str => {
      document.querySelector('#app').textContent = str;
    }
  });
}

function logDriver(msg$) {
  msg$.subscribe({
    next: msg => {
      console.log(msg);
    }
  });
}

const {DOM,log} = main();
domDriver(DOM);
logDriver(log);
