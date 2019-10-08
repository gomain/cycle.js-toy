import xs from 'xstream';
import fromEvent from 'xstream/extra/fromEvent';

//Logic
function main (sources) {
  const click$ = sources.DOM.select('#app').events('mouseover');
  return {
    DOM: click$.startWith(null).map(() => xs
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
        }
      ])),
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
  return {
    select: function(selector) {
      const elem = document.querySelector(selector);
      return {
	events: function (...eventTypes) {
	  const event$s = eventTypes.map(eventType => fromEvent(elem,eventType));
	  return xs.merge(...event$s);
	}
      };
    }
  };

}

function logDriver(msg$) {
  msg$.subscribe({
    next: msg => {
      console.log(msg);
    }
  });
}

function run(mainFn, drivers) {
  const { fakeSinks, sources } =
	Object.entries(drivers).reduce(({ fakeSinks, sources }, [ driverKey, driver ]) => {
	  const fakeSink = xs.create();
	  const source = driver(fakeSink);
	  return {
	    fakeSinks: Object.assign(fakeSinks, {[driverKey]: fakeSink}),
	    sources: Object.assign(sources,{[driverKey]: source})
	  };
	},{ fakeSinks: {}, sources: {} });
  const sinks = mainFn(sources);
  Object.entries(sinks).forEach(([sinkKey,sink]) => {
    Object.entries(fakeSinks).forEach(([fakeSinkKey,fakeSink]) => {
      if (sinkKey === fakeSinkKey) {
        try {
	  fakeSink.imitate(sink);
        } catch (e) {
	  console.log(`sinkKey: ${sinkKey}`);
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
