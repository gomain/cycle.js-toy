
//Logic
function main () {
  return xs.periodic(1000)
    .fold(acc => acc+1,0)
    .map(i => `Seconds elapsed: ${i}`);
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

const sink = main();
domDriver(sink);
logDriver(sink);
