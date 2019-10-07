import xs from 'xstream';
import fromEvent from 'xstream/extra/fromEvent';

//Logic
function main (sources) {
  const click$ = sources.DOM;
  return {
    DOM: click$.map(() => xs
		    .periodic(1000)
		    .fold(acc => acc+1,0))
      .flatten()
      .map(i => ([
        'simple text',
        {
          tagName: 'h1',
          children: [ {
            tagName: 'span',
            children: [ `Seconds elapsed: ${i}` ]
          }]
        }])),
    log: xs.periodic(2000)
      .fold(acc => acc+2,0)
      .map(i => xs.create().startWith(i))
      .flatten()
  };
}

//Effect(s)
function domDriver(dom$) {
  //Write
  dom$.subscribe({
    next: children => {
      const root =document.querySelector('#app');
      root.innerHTML = '';
      createChildren(root,children);
    }
  });

  function createChildren(parent,childrenSpecs) {
    if (typeof childrenSpecs === 'string') {
      parent.append(childrenSpecs);
    } else if (childrenSpecs instanceof Array) {
      childrenSpecs.forEach(childSpecs => {
        createChildren(parent,childSpecs);
      });
    } else if (childrenSpecs instanceof Object) {
      const childElement = document.createElement(childrenSpecs.tagName);
      createChildren(childElement,childrenSpecs.children);
      parent.append(childElement);
    }
  }
  //Read
  const domSource = fromEvent(document, 'click');
  return domSource;
}

function logDriver(msg$) {
  msg$.subscribe({
    next: msg => {
      console.log(msg);
    }
  });
}

function run(mainFn, drivers) {
  const sources = {};
  const fakeSinks = {};

  Object.entries(drivers).forEach(([driverKey,driver]) => {
    const fakeSink = xs.create();
    fakeSinks[driverKey] = fakeSink;
    const source = driver(fakeSink);
    sources[driverKey] = source;
  });
  const sinks = mainFn(sources);
  Object.entries(sinks).forEach(([sinkKey,sink]) => {
    Object.entries(fakeSinks).forEach(([fakeSinkKey,fakeSink]) => {
      if (sinkKey === fakeSinkKey) {
        try {
	  fakeSink.imitate(sink);
        } catch (e) {
          console.log(fakeSink);
          console.log(sink);
          console.log(e);
        }
      }
    });
  });
}

run(main, {
  DOM: domDriver,
  log: logDriver
});
